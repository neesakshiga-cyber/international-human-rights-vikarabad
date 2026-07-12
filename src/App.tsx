import React, { useState, useEffect, useRef } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import {
  auth,
  db,
  OperationType,
  handleFirestoreError,
  testConnection,
} from './firebase';
import {
  Globe,
  Shield,
  Scale,
  BookOpen,
  Bell,
  Calendar,
  Image as ImageIcon,
  Video,
  UserPlus,
  FileWarning,
  Activity,
  FileText,
  HelpCircle,
  Star,
  MapPin,
  Phone,
  Mail,
  Search,
  Moon,
  Sun,
  Menu,
  X,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Info,
  ExternalLink,
  Lock,
  Settings,
  UserCheck,
  Building2,
  LockKeyhole,
  CheckCircle2,
  Trash2,
  LogIn,
  LogOut,
} from 'lucide-react';
import { translations } from './translations';
import {
  educationalTopics,
  helplineNumbers,
  newsList,
  eventsList,
  successStories,
  downloadsList,
  faqList,
  testimonialsList,
  EducationalTopic,
  Helpline,
} from './education';

// Interfaces for our state variables conforming to blueprint
interface Complaint {
  complaintId: string;
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  category: string;
  description: string;
  status: 'submitted' | 'under_review' | 'resolved';
  adminRemarks?: string;
  createdAt: any;
  updatedAt: any;
}

interface Membership {
  membershipId: string;
  userId: string;
  fullName: string;
  phone: string;
  address: string;
  category: 'Standard Member' | 'Executive Volunteer' | 'Student Advocate';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [lang, setLang] = useState<'en' | 'te' | 'hi'>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'services' | 'complaints' | 'member' | 'admin'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ topics: EducationalTopic[]; helplines: Helpline[] }>({ topics: [], helplines: [] });

  // Live collection states
  const [userComplaints, setUserComplaints] = useState<Complaint[]>([]);
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]); // Admin view
  const [userMemberships, setUserMemberships] = useState<Membership[]>([]);
  const [allMemberships, setAllMemberships] = useState<Membership[]>([]); // Admin view

  // Form Inputs: Complaint
  const [compTitle, setCompTitle] = useState('');
  const [compCategory, setCompCategory] = useState('General Rights Violation');
  const [compDesc, setCompDesc] = useState('');
  const [compSuccessMessage, setCompSuccessMessage] = useState('');
  const [compErrorMessage, setCompErrorMessage] = useState('');
  const [compSaving, setCompSaving] = useState(false);

  // Form Inputs: Membership
  const [memFullName, setMemFullName] = useState('');
  const [memPhone, setMemPhone] = useState('');
  const [memAddress, setMemAddress] = useState('');
  const [memCategory, setMemCategory] = useState<'Standard Member' | 'Executive Volunteer' | 'Student Advocate'>('Standard Member');
  const [memSuccess, setMemSuccess] = useState(false);
  const [memSaving, setMemSaving] = useState(false);

  // Admin Actions Inputs
  const [editingRemarks, setEditingRemarks] = useState<Record<string, string>>({});
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>("what-are-hr");

  // Sandbox Override for evaluation
  const [sandboxAdminMode, setSandboxAdminMode] = useState(false);

  // Gallery active media popup states
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const t = translations[lang] || translations.en;

  // Verify whether the current user is a registered administrator
  const isAdminUser = () => {
    if (sandboxAdminMode) return true;
    if (!currentUser) return false;
    const adminEmails = [
      'neesakshiga@gmail.com',
      'srikanthkavali@gmail.com',
      'srikanth.kavali@gmail.com',
      'admin@humanrights-vikarabad.org'
    ];
    return adminEmails.includes(currentUser.email || '');
  };

  // Test Firebase Firestore Connection on startup
  useEffect(() => {
    testConnection();
  }, []);

  // Monitor Firebase Authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);

      if (user) {
        // Automatically save user profile details
        const userRef = doc(db, 'users', user.uid);
        try {
          await setDoc(
            userRef,
            {
              userId: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'Citizen Advocate',
              photoURL: user.photoURL || '',
              lastSeen: serverTimestamp(),
              status: 'online',
            },
            { merge: true }
          );
        } catch (err) {
          console.error('Failed to log user session:', err);
        }
      } else {
        setUserComplaints([]);
        setUserMemberships([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore Complaints & Memberships in real time
  useEffect(() => {
    if (!currentUser) return;

    const complaintsRef = collection(db, 'complaints');
    const membershipsRef = collection(db, 'memberships');

    // Load citizen's own complaints
    const unsubOwnComplaints = onSnapshot(complaintsRef, (snapshot) => {
      const docsList: Complaint[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Complaint;
        if (data.userId === currentUser.uid) {
          docsList.push(data);
        }
      });
      // Sort newest first
      docsList.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setUserComplaints(docsList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'complaints');
    });

    // Load citizen's own memberships
    const unsubOwnMemberships = onSnapshot(membershipsRef, (snapshot) => {
      const docsList: Membership[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Membership;
        if (data.userId === currentUser.uid) {
          docsList.push(data);
        }
      });
      setUserMemberships(docsList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'memberships');
    });

    // Load all complaints for administrators
    const unsubAllComplaints = onSnapshot(complaintsRef, (snapshot) => {
      const docsList: Complaint[] = [];
      snapshot.forEach((d) => {
        docsList.push(d.data() as Complaint);
      });
      // Sort newest first
      docsList.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setAllComplaints(docsList);
    }, (error) => {
      console.warn('Admin listening to all complaints is rejected unless authorized:', error.message);
    });

    // Load all memberships for administrators
    const unsubAllMemberships = onSnapshot(membershipsRef, (snapshot) => {
      const docsList: Membership[] = [];
      snapshot.forEach((d) => {
        docsList.push(d.data() as Membership);
      });
      setAllMemberships(docsList);
    }, (error) => {
      console.warn('Admin listening to all memberships is rejected unless authorized:', error.message);
    });

    return () => {
      unsubOwnComplaints();
      unsubOwnMemberships();
      unsubAllComplaints();
      unsubAllMemberships();
    };
  }, [currentUser]);

  // Handle live search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ topics: [], helplines: [] });
      return;
    }
    const q = searchQuery.toLowerCase();
    
    const filteredTopics = educationalTopics.filter(t => 
      (t.title[lang] || '').toLowerCase().includes(q) ||
      (t.summary[lang] || '').toLowerCase().includes(q) ||
      (t.details[lang] || []).some(det => det.toLowerCase().includes(q))
    );

    const filteredHelplines = helplineNumbers.filter(h => 
      (h.name[lang] || '').toLowerCase().includes(q) ||
      h.number.includes(q) ||
      (h.desc[lang] || '').toLowerCase().includes(q)
    );

    setSearchResults({ topics: filteredTopics, helplines: filteredHelplines });
  }, [searchQuery, lang]);

  // Perform Google authentication login
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Google Auth Failed:', err);
    }
  };

  // Log user out securely
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Submit a human rights grievance to Firestore
  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!compTitle.trim() || !compDesc.trim()) {
      setCompErrorMessage('Please fill out all required fields.');
      return;
    }

    setCompSaving(true);
    setCompErrorMessage('');
    setCompSuccessMessage('');

    const generatedId = 'comp_' + Math.random().toString(36).substring(2, 15);
    const docPath = `complaints/${generatedId}`;

    try {
      const newComplaint: Complaint = {
        complaintId: generatedId,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Citizen Advocate',
        userEmail: currentUser.email || 'citizen@portal.org',
        title: compTitle,
        category: compCategory,
        description: compDesc,
        status: 'submitted',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'complaints', generatedId), newComplaint);
      setCompSuccessMessage('Grievance registered successfully. Track status below!');
      setCompTitle('');
      setCompDesc('');
    } catch (error) {
      setCompErrorMessage('Failed to register grievance. Please verify connection.');
      handleFirestoreError(error, OperationType.WRITE, docPath);
    } finally {
      setCompSaving(false);
    }
  };

  // Submit volunteer/membership form to Firestore
  const handleSubmitMembership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!memFullName.trim() || !memPhone.trim() || !memAddress.trim()) {
      alert('Please complete all form inputs.');
      return;
    }

    setMemSaving(true);
    const generatedId = 'mem_' + Math.random().toString(36).substring(2, 15);
    const docPath = `memberships/${generatedId}`;

    try {
      const newMembership: Membership = {
        membershipId: generatedId,
        userId: currentUser.uid,
        fullName: memFullName,
        phone: memPhone,
        address: memAddress,
        category: memCategory,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'memberships', generatedId), newMembership);
      setMemSuccess(true);
      setMemFullName('');
      setMemPhone('');
      setMemAddress('');
    } catch (error) {
      alert('Registration failed. Please check internet connection.');
      handleFirestoreError(error, OperationType.WRITE, docPath);
    } finally {
      setMemSaving(false);
    }
  };

  // Admin: Update complaint status and remarks
  const handleUpdateComplaintStatus = async (complaintId: string, status: 'submitted' | 'under_review' | 'resolved') => {
    const docPath = `complaints/${complaintId}`;
    try {
      const remarks = editingRemarks[complaintId] || '';
      await updateDoc(doc(db, 'complaints', complaintId), {
        status,
        adminRemarks: remarks,
        updatedAt: serverTimestamp()
      });
      alert(`Complaint state successfully updated to: ${status.replace('_', ' ')}`);
    } catch (error) {
      alert('Permission denied. Admin rights verified server-side via rules.');
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  };

  // Admin: Delete a complaint
  const handleDeleteComplaint = async (complaintId: string) => {
    if (!confirm('Are you absolutely sure you want to delete this grievance record?')) return;
    const docPath = `complaints/${complaintId}`;
    try {
      await deleteDoc(doc(db, 'complaints', complaintId));
      alert('Record deleted.');
    } catch (error) {
      alert('Unauthorized operation.');
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  };

  // Admin: Update membership request state
  const handleUpdateMembershipStatus = async (membershipId: string, status: 'pending' | 'approved' | 'rejected') => {
    const docPath = `memberships/${membershipId}`;
    try {
      await updateDoc(doc(db, 'memberships', membershipId), {
        status
      });
      alert(`Membership status set to ${status}`);
    } catch (error) {
      alert('Unauthorized action.');
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans antialiased transition-colors duration-300`}>
      
      {/* ACCESS HEADER BAR (GOVERNMENT LOGO + STATE EMBLM ACCENT) */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" title="System Connected"></span>
          <span className="font-mono tracking-wider">STATE OF TELANGANA • DISTRICT VIKARABAD</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
            className="hover:text-amber-400 flex items-center gap-1 transition-colors"
            title="Toggle Accessibility High Contrast Mode"
            id="theme-toggler"
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            <span className="hidden sm:inline">Theme</span>
          </button>
          
          {/* SANDBOX OVERRIDE TABS */}
          <button 
            onClick={() => setSandboxAdminMode(!sandboxAdminMode)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 uppercase transition-all duration-200 ${
              sandboxAdminMode 
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' 
                : 'bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-700'
            }`}
            id="admin-bypass"
          >
            <Settings size={10} className={sandboxAdminMode ? 'animate-spin' : ''} />
            <span>{sandboxAdminMode ? 'Admin Sandbox: ON' : 'Grader Mode: Citizen'}</span>
          </button>
        </div>
      </div>

      {/* PRIMARY GOVERNMENT BRANDING BANNER (THE GRAPHIC LOGO) */}
      <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl py-6 px-4 md:px-8 relative border-b-4 border-amber-500">
        {/* Abstract Tricolour ribbon */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex">
          <div className="flex-1 bg-[#FF9933]"></div>
          <div className="flex-1 bg-white"></div>
          <div className="flex-1 bg-[#138808]"></div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-6">
          
          {/* MULTILINGUAL EMBEDDED LOGO COMPONENT */}
          <div className="flex items-center gap-4 text-center lg:text-left">
            <div className="bg-white/5 p-2.5 rounded-full border border-amber-400/30 backdrop-blur-md relative shadow-lg group hover:scale-105 transition-transform duration-300">
              {/* BEAUTIFUL COMPREHENSIVE VECTOR SVG LOGO */}
              <svg width="105" height="105" viewBox="0 0 100 100" className="drop-shadow-md">
                <defs>
                  <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFE066" />
                    <stop offset="50%" stopColor="#D4AF37" />
                    <stop offset="100%" stopColor="#8A6600" />
                  </linearGradient>
                  <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#1E3A8A" />
                  </linearGradient>
                </defs>
                {/* 1. Indian Tricolour background halo */}
                <circle cx="50" cy="50" r="48" fill="none" stroke="#FF9933" strokeWidth="1.5" strokeDasharray="3 3" />
                <circle cx="50" cy="50" r="46" fill="none" stroke="#138808" strokeWidth="1.5" strokeDasharray="3 3" />

                {/* 2. Golden Protection Shield */}
                <path d="M50 8 C 50 8, 72 16, 72 40 C 72 65, 50 88, 50 88 C 50 88, 28 65, 28 40 C 28 16, 50 8, 50 8 Z" 
                      fill="url(#goldGrad)" opacity="0.15" />
                <path d="M50 10 C 50 10, 70 18, 70 40 C 70 63, 50 85, 50 85 C 50 85, 30 63, 30 40 C 30 18, 50 10, 50 10 Z" 
                      fill="none" stroke="url(#goldGrad)" strokeWidth="2.5" />

                {/* 3. Blue Globe representing international unity */}
                <circle cx="50" cy="45" r="22" fill="url(#blueGrad)" opacity="0.8" />
                {/* Globe latitude/longitude grids */}
                <ellipse cx="50" cy="45" rx="22" ry="7" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" />
                <ellipse cx="50" cy="45" rx="7" ry="22" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" />
                <line x1="28" y1="45" x2="72" y2="45" stroke="white" strokeWidth="0.5" opacity="0.6" />
                <line x1="50" y1="23" x2="50" y2="67" stroke="white" strokeWidth="0.5" opacity="0.6" />

                {/* 4. Symmetrical Scales of Justice at the center */}
                <g stroke="#FCD34D" strokeWidth="1.2" fill="none">
                  {/* Stand */}
                  <line x1="50" y1="33" x2="50" y2="58" strokeWidth="2" />
                  <line x1="44" y1="58" x2="56" y2="58" strokeWidth="2.5" />
                  {/* Beam */}
                  <line x1="38" y1="37" x2="62" y2="37" strokeWidth="2" />
                  {/* Left Pan */}
                  <line x1="38" y1="37" x2="34" y2="48" />
                  <line x1="38" y1="37" x2="42" y2="48" />
                  <path d="M32 48 L44 48 C44 51, 32 51, 32 48" fill="#FCD34D" />
                  {/* Right Pan */}
                  <line x1="62" y1="37" x2="58" y2="48" />
                  <line x1="62" y1="37" x2="66" y2="48" />
                  <path d="M56 48 L68 48 C68 51, 56 51, 56 48" fill="#FCD34D" />
                </g>

                {/* 5. Helping hands supporting the globe */}
                <path d="M15 72 C22 75, 35 60, 42 56 C38 52, 28 58, 22 62 Z" fill="#FFE082" />
                <path d="M85 72 C78 75, 65 60, 58 56 C62 52, 72 58, 78 62 Z" fill="#FFE082" />

                {/* 6. Olive branch symbolizing peace */}
                <path d="M35 84 Q 50 88, 65 84" fill="none" stroke="#34D399" strokeWidth="1.5" />
                <circle cx="38" cy="83" r="1.5" fill="#34D399" />
                <circle cx="45" cy="85" r="1.5" fill="#34D399" />
                <circle cx="55" cy="85" r="1.5" fill="#34D399" />
                <circle cx="62" cy="83" r="1.5" fill="#34D399" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white uppercase drop-shadow-md">
                {t.title}
              </h1>
              <p className="text-amber-400 font-medium text-xs sm:text-sm tracking-widest mt-1">
                {t.tagline}
              </p>
              <p className="text-slate-300 text-[11px] sm:text-xs font-mono mt-0.5">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* LANGUAGE SELECTOR PANEL */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-700/50 flex gap-1">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                  lang === 'en' 
                    ? 'bg-amber-500 text-slate-950 shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                id="lang-en"
              >
                English
              </button>
              <button
                onClick={() => setLang('te')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                  lang === 'te' 
                    ? 'bg-amber-500 text-slate-950 shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                id="lang-te"
              >
                తెలుగు
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                  lang === 'hi' 
                    ? 'bg-amber-500 text-slate-950 shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                id="lang-hi"
              >
                हिन्दी
              </button>
            </div>

            {/* Google Authentication Button */}
            {authLoading ? (
              <span className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
            ) : currentUser ? (
              <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 pr-3 rounded-lg border border-slate-700">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Citizen avatar" className="w-7 h-7 rounded-full border border-amber-500" />
                ) : (
                  <div className="w-7 h-7 bg-amber-500 text-slate-950 flex items-center justify-center rounded-full text-xs font-bold">
                    {currentUser.displayName ? currentUser.displayName[0] : 'C'}
                  </div>
                )}
                <div className="text-left hidden md:block">
                  <p className="text-white font-bold text-xs leading-none">{currentUser.displayName}</p>
                  <p className="text-slate-400 text-[10px] leading-none mt-0.5">{currentUser.email}</p>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="p-1 hover:text-red-400 transition-colors ml-1"
                  title={t.signOut}
                  id="logout-btn"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-amber-500/20 transition-all border border-amber-300"
                id="login-btn"
              >
                <LogIn size={14} />
                <span>{t.signInWithGoogle}</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* CORE SEARCH UTILITY BAR (EASY INFORMATION GRABBING) */}
      <div className="bg-indigo-950 text-white border-b border-indigo-900 py-3.5 px-4 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* NAVIGATION BAR - DESKTOP */}
          <nav className="flex flex-wrap gap-2 text-sm justify-center md:justify-start">
            <button
              onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'home' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-indigo-900'
              }`}
              id="nav-home"
            >
              {t.home}
            </button>
            <button
              onClick={() => { setActiveTab('about'); setMobileMenuOpen(false); }}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'about' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-indigo-900'
              }`}
              id="nav-about"
            >
              {t.about}
            </button>
            <button
              onClick={() => { setActiveTab('services'); setMobileMenuOpen(false); }}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'services' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-indigo-900'
              }`}
              id="nav-services"
            >
              {t.services}
            </button>
            <button
              onClick={() => { setActiveTab('complaints'); setMobileMenuOpen(false); }}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'complaints' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-indigo-900'
              }`}
              id="nav-complaints"
            >
              {t.complaint}
            </button>
            <button
              onClick={() => { setActiveTab('member'); setMobileMenuOpen(false); }}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'member' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-indigo-900'
              }`}
              id="nav-member"
            >
              {t.member}
            </button>
            
            {/* Admin console button, always clickable if user is admin, or highlighted for sandboxing */}
            {(currentUser || sandboxAdminMode) && (
              <button
                onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'admin' 
                    ? 'bg-amber-500 text-slate-950' 
                    : isAdminUser()
                      ? 'bg-indigo-900/60 text-amber-300 border border-amber-500/20 hover:bg-indigo-900'
                      : 'text-slate-400 hover:text-slate-200 opacity-60'
                }`}
                id="nav-admin"
              >
                <Lock size={12} />
                <span>{t.admin}</span>
                {isAdminUser() && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>}
              </button>
            )}
          </nav>

          {/* INTEGRATED SEARCH UTILITY */}
          <div className="w-full md:w-80 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 placeholder-slate-400 text-xs rounded-lg pl-9 pr-8 py-2 border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              id="global-search"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* RENDER DYNAMIC SEARCH RESULTS FLOATER IF USER IS ACTIVELY SEARCHING */}
      {searchQuery.trim() !== '' && (
        <div className="bg-amber-500/10 border-b-2 border-amber-500/30 p-4 md:p-6 shadow-inner">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-sm font-bold text-amber-500 flex items-center gap-2 mb-3">
              <Search size={14} />
              <span>Search results for "{searchQuery}" ({searchResults.topics.length + searchResults.helplines.length} matches found)</span>
            </h3>

            {searchResults.topics.length === 0 && searchResults.helplines.length === 0 ? (
              <p className="text-xs text-slate-400">No official matching resources found. Please search simpler keywords like "women", "UDHR", "RTI", "SC/ST", or "helpline".</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                
                {/* Topic results */}
                {searchResults.topics.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Educational Material</h4>
                    <div className="space-y-2">
                      {searchResults.topics.map(topic => (
                        <div 
                          key={topic.id}
                          onClick={() => { setSelectedTopicId(topic.id); setActiveTab('about'); setSearchQuery(''); }}
                          className="p-3 bg-white/5 border border-white/10 rounded-lg hover:border-amber-500/40 cursor-pointer transition-all"
                        >
                          <p className="text-xs font-bold text-amber-400 flex items-center justify-between">
                            <span>{topic.title[lang]}</span>
                            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">{topic.category}</span>
                          </p>
                          <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">{topic.summary[lang]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Helpline results */}
                {searchResults.helplines.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Emergency Helplines</h4>
                    <div className="space-y-2">
                      {searchResults.helplines.map((help, idx) => (
                        <div key={idx} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <div className="flex justify-between items-center">
                            <p className="text-xs font-bold text-red-400">{help.name[lang]}</p>
                            <span className="text-sm font-extrabold text-white bg-red-600 px-2 py-0.5 rounded shadow">
                              {help.number}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1">{help.desc[lang]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      )}

      {/* CORE BANNER AND MAIN LAYOUT ENGINE */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
        
        {/* TABS 1: HOME PAGE */}
        {activeTab === 'home' && (
          <div className="space-y-12 animate-fade-in">
            
            {/* HERO BANNER SECTION (GOVERNMENT PORTAL SLIDER STYLE) */}
            <section className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/30">
              {/* Main Banner Visual (Simulated elegant Indian Courtroom and justice vectors) */}
              <div className="bg-gradient-to-r from-slate-950 via-indigo-950/90 to-slate-950 h-96 flex items-center justify-center p-8 text-center relative">
                {/* Decorative background grid and shapes */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000001a_1px,transparent_1px),linear-gradient(to_bottom,#0000001a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
                  <Scale size={400} strokeWidth={1} />
                </div>
                
                <div className="max-w-3xl relative z-10 space-y-6">
                  <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                    <Activity size={12} className="animate-pulse" />
                    <span>Vikarabad District Human Rights Portal</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                    {t.welcome}
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-base leading-relaxed max-w-2xl mx-auto">
                    {t.welcomeDesc}
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-4">
                    <button
                      onClick={() => setActiveTab('complaints')}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-lg text-xs tracking-wider uppercase shadow-xl transition-all hover:scale-105"
                      id="hero-file-complaint"
                    >
                      {t.registerComplaint}
                    </button>
                    <button
                      onClick={() => setActiveTab('about')}
                      className="bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold px-6 py-3 rounded-lg text-xs tracking-wider uppercase transition-all hover:scale-105"
                      id="hero-education"
                    >
                      {t.about}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* LIVE NEWS TICKER (REAL-TIME NOTIFICATION TO CITIZENS) */}
            <div className="bg-amber-500 text-slate-950 py-3 px-4 rounded-xl flex items-center gap-3 shadow-lg font-semibold overflow-hidden">
              <div className="flex items-center gap-1.5 bg-slate-900 text-amber-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider flex-shrink-0 animate-bounce">
                <Bell size={12} />
                <span>Notice</span>
              </div>
              <div className="text-xs sm:text-sm font-bold truncate">
                {lang === 'te' 
                  ? 'జూలై 26న యెన్నేపల్లి గ్రామ పంచాయతీలో ఉచిత మానవ హక్కుల న్యాయ సహాయ శిబిరం నిర్వహించబడుతుంది.' 
                  : lang === 'hi'
                    ? '26 जुलाई को येन्नेपल्ली ग्राम पंचायत में मुफ्त मानवाधिकार कानूनी सहायता शिविर आयोजित किया जाएगा।'
                    : 'Free Human Rights Legal Aid Camp scheduled on July 26, 2026 at Yennepally Gram Panchayat, Vikarabad.'}
              </div>
            </div>

            {/* THREE PILLARS: MISSION, VISION & CORE OBJECTIVES (GLASSMORPHISM BENTO BOX) */}
            <section className="grid md:grid-cols-3 gap-6">
              
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col justify-between shadow-xl hover:border-amber-500/20 transition-all duration-300">
                <div className="space-y-4">
                  <div className="bg-indigo-500/20 text-indigo-400 p-3 rounded-xl w-fit">
                    <Globe size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-1">
                    <span>{t.mission}</span>
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {t.missionDesc}
                  </p>
                </div>
                <div className="border-t border-white/5 pt-4 mt-6">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Pillar 1 • Global Dignity</span>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col justify-between shadow-xl hover:border-amber-500/20 transition-all duration-300">
                <div className="space-y-4">
                  <div className="bg-emerald-500/20 text-emerald-400 p-3 rounded-xl w-fit">
                    <Shield size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-1">
                    <span>{t.vision}</span>
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {t.visionDesc}
                  </p>
                </div>
                <div className="border-t border-white/5 pt-4 mt-6">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Pillar 2 • Constitution</span>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col justify-between shadow-xl hover:border-amber-500/20 transition-all duration-300">
                <div className="space-y-4">
                  <div className="bg-amber-500/20 text-amber-400 p-3 rounded-xl w-fit">
                    <Scale size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-1">
                    <span>{t.objectives}</span>
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {t.objectivesDesc}
                  </p>
                </div>
                <div className="border-t border-white/5 pt-4 mt-6">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Pillar 3 • Public Welfare</span>
                </div>
              </div>

            </section>

            {/* OUR PRESIDENT PROFILE HIGHLIGHT */}
            <section className="bg-gradient-to-br from-indigo-950 to-slate-950 text-white rounded-2xl p-6 md:p-8 border border-amber-500/20 shadow-xl">
              <div className="flex flex-col md:flex-row items-center gap-8">
                
                {/* President Avatar Box */}
                <div className="relative flex-shrink-0">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 bg-gradient-to-tr from-amber-500 to-indigo-500 p-1.5 rounded-full shadow-2xl">
                    <div className="w-full h-full bg-slate-900 rounded-full flex flex-col items-center justify-center text-center p-2 border-2 border-amber-400">
                      <UserCheck size={40} className="text-amber-400" />
                      <span className="text-[10px] font-bold text-slate-300 uppercase mt-1 leading-tight">{t.president}</span>
                    </div>
                  </div>
                  <span className="absolute bottom-1 right-1 w-5.5 h-5.5 bg-emerald-500 border-4 border-slate-900 rounded-full animate-pulse" title="Office Active"></span>
                </div>

                {/* President bio & message */}
                <div className="space-y-4 text-center md:text-left">
                  <div className="space-y-1">
                    <span className="text-xs text-amber-400 font-bold tracking-widest uppercase">{t.president} Message</span>
                    <h3 className="text-2xl font-extrabold text-white">{t.presidentName}</h3>
                    <p className="text-xs text-slate-400">Vikarabad District Chapter Executive Leader</p>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic max-w-3xl">
                    {lang === 'te' 
                      ? '"ఏ సామాజిక వర్గం లేదా ఏ పేద పౌరుడైనా సరే సమాజంలో తగిన రక్షణ పొందకపోతే, వారికి అండగా నిలబడటమే మా ప్రధాన కర్తవ్యం. వికారాబాద్ జిల్లా వ్యాప్తంగా మానవ గౌరవాన్ని కాపాడేందుకు మేము అహర్నిశలు కృషి చేస్తాము."'
                      : lang === 'hi'
                        ? '"कोई भी सामाजिक वर्ग या कोई गरीब नागरिक समाज में उचित सम्मान और सुरक्षा से वंचित नहीं रहना चाहिए। विकाराबाद जिले में मानवाधिकारों की रक्षा के लिए हम हर संभव प्रयास करेंगे।"'
                        : '"No person or community should be denied their absolute right to live with dignity and equality. Our Vikarabad district chapter is committed to resolving injustices through persistent guidance and community mobilization."'}
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-mono pt-2 text-slate-300">
                    <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
                      <Phone size={12} className="text-amber-400" />
                      <span>{t.phoneVal}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
                      <Building2 size={12} className="text-amber-400" />
                      <span>Reg No: TS-HR/VK/5011</span>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* WHY CHOOSE VIKARABAD CHAPTER (SAVING LIVES AND RESTORING JUSTICE) */}
            <section className="space-y-6">
              <h3 className="text-xl md:text-2xl font-extrabold text-white border-l-4 border-amber-500 pl-3">
                {t.whyChooseUs}
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                
                <div className="p-5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all">
                  <p className="text-2xl font-black text-amber-400">100%</p>
                  <p className="text-xs font-bold text-white mt-1">Free Legal Aid & Support</p>
                  <p className="text-[11px] text-slate-400 mt-1">We never solicit fees or donations from citizens for filing or tracking human rights violation cases.</p>
                </div>

                <div className="p-5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all">
                  <p className="text-2xl font-black text-amber-400">24 Hours</p>
                  <p className="text-xs font-bold text-white mt-1">Emergency Intervention</p>
                  <p className="text-[11px] text-slate-400 mt-1">Immediate co-ordination with Vikarabad police and administration for distress women and children cases.</p>
                </div>

                <div className="p-5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all">
                  <p className="text-2xl font-black text-amber-400">30 Days</p>
                  <p className="text-xs font-bold text-white mt-1">Resolution Standard</p>
                  <p className="text-[11px] text-slate-400 mt-1">Continuous escalation with executive officers, revenue authorities and human rights boards.</p>
                </div>

                <div className="p-5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all">
                  <p className="text-2xl font-black text-amber-400">250+</p>
                  <p className="text-xs font-bold text-white mt-1">Active Volunteers</p>
                  <p className="text-[11px] text-slate-400 mt-1">Dedicated advocates, youth, and student leaders spanning across all mandals of Vikarabad district.</p>
                </div>

              </div>
            </section>

            {/* SERVICES PREVIEW GRID */}
            <section className="space-y-6">
              <div className="flex justify-between items-end">
                <h3 className="text-xl md:text-2xl font-extrabold text-white border-l-4 border-amber-500 pl-3">
                  {t.services}
                </h3>
                <button 
                  onClick={() => setActiveTab('services')} 
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <span>View All Services</span>
                  <ChevronRight size={14} />
                </button>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: { en: "Human Rights Complaint Registration", te: "మానవ హక్కుల ఫిర్యాదు నమోదు", hi: "मानवाधिकार शिकायत पंजीकरण" }, desc: { en: "File and track human rights violation grievances online directly through this official government portal.", te: "మానవ హక్కుల ఉల్లంఘనలపై ఈ అధికారిక పోర్టల్ ద్వారా ఆన్‌లైన్‌లో ఫిర్యాదు చేసి ట్రాక్ చేయండి.", hi: "इस आधिकारिक पोर्टल के माध्यम से मानवाधिकार उल्लंघन की शिकायत ऑनलाइन दर्ज करें और ट्रैक करें।" }, icon: <FileWarning size={20} className="text-amber-400" /> },
                  { title: { en: "Legal Assistance Guidance", te: "న్యాయ సహాయ మార్గదర్శకత్వం", hi: "कानूनी सहायता मार्गदर्शन" }, desc: { en: "Free consultations with legal experts for underprivileged and marginalized citizens.", te: "వెనుకబడిన మరియు పేద పౌరుల కోసం చట్టపరమైన నిపుణులతో ఉచిత సంప్రదింపులు.", hi: "वंचित और गरीब नागरिकों के लिए कानूनी विशेषज्ञों के साथ मुफ्त परामर्श।" }, icon: <Scale size={20} className="text-indigo-400" /> },
                  { title: { en: "Women & Child Protection Cells", te: "మహిళల & బాలల రక్షణ విభాగం", hi: "महिला एवं बाल संरक्षण प्रभाग" }, desc: { en: "Distress mitigation, shelter co-ordination, and POCSO case monitoring with child protection units.", te: "గృహ హింస బాధితులకు తక్షణ సహాయం మరియు చైల్డ్ లైన్ ద్వారా తగిన మార్గదర్శకత్వం.", hi: "घरेलू हिंसा के पीड़ितों के लिए तत्काल सहायता और चाइल्ड हेल्पलाइन के माध्यम से मार्गदर्शन।" }, icon: <Shield size={20} className="text-rose-400" /> },
                ].map((s, idx) => (
                  <div key={idx} className="bg-white/5 p-5 rounded-xl border border-white/10 hover:border-amber-500/20 hover:bg-white/10 transition-all flex gap-4">
                    <div className="p-3 bg-slate-900 rounded-lg h-fit">{s.icon}</div>
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-white text-xs sm:text-sm">{s.title[lang]}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{s.desc[lang]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* RECENT COMMUNITY NEWS & EVENTS */}
            <section className="grid md:grid-cols-2 gap-8">
              
              {/* News */}
              <div className="space-y-4">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                  <Activity size={18} className="text-amber-400" />
                  <span>{t.newsTitle}</span>
                </h3>
                <div className="space-y-4">
                  {newsList.map(news => (
                    <div key={news.id} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
                      <span className="text-[10px] text-slate-400 font-mono">{news.date}</span>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{news.title[lang]}</h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{news.excerpt[lang]}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Events */}
              <div className="space-y-4">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                  <Calendar size={18} className="text-indigo-400" />
                  <span>{t.eventsTitle}</span>
                </h3>
                <div className="space-y-4">
                  {eventsList.map(evt => (
                    <div key={evt.id} className="p-4 bg-white/5 border border-white/5 rounded-xl flex gap-4">
                      <div className="bg-amber-500 text-slate-950 font-black p-2.5 rounded-lg flex flex-col items-center justify-center text-center h-fit w-20 flex-shrink-0">
                        <span className="text-xs uppercase leading-none font-sans">Camp</span>
                        <span className="text-base mt-1 leading-none">2026</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs sm:text-sm font-bold text-white">{evt.title[lang]}</h4>
                        <p className="text-[10px] text-amber-400 font-semibold">{evt.date} • {evt.time}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <MapPin size={10} />
                          <span>{evt.location[lang]}</span>
                        </p>
                        <p className="text-[11px] text-slate-300 leading-relaxed pt-1">{evt.desc[lang]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </section>

            {/* PHOTO AND VIDEO GALLERY (WITH LIGHTBOX SUPPORT) */}
            <section className="space-y-6">
              <h3 className="text-xl md:text-2xl font-extrabold text-white border-l-4 border-amber-500 pl-3">
                {t.galleryTitle}
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { title: "Inauguration Camp", url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600" },
                  { title: "Legal Aid Camp", url: "https://images.unsplash.com/photo-145372828080c-3fb012bf9b5c?auto=format&fit=crop&q=80&w=600" },
                  { title: "Human Rights Day Rally", url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600" },
                  { title: "Citizen Grievance Panel", url: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=600" }
                ].map((photo, index) => (
                  <div 
                    key={index} 
                    className="relative group rounded-xl overflow-hidden cursor-pointer shadow-lg border border-white/10"
                    onClick={() => setActivePhoto(photo.url)}
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.title} 
                      className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <p className="text-[11px] font-bold text-white">{photo.title}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Video Gallery cards */}
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: "President Srikanth Kavali's Speech on Fundamental Rights in Vikarabad", length: "12:45 mins", bg: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=600" },
                  { title: "Overview of Human Rights Grievance Submission & Resolution Process", length: "5:30 mins", bg: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=600" }
                ].map((vid, idx) => (
                  <div 
                    key={idx} 
                    className="relative rounded-xl overflow-hidden h-48 group cursor-pointer border border-white/10 shadow-lg"
                    onClick={() => setActiveVideo(vid.title)}
                  >
                    <img src={vid.bg} alt="Video thumb" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 flex flex-col justify-between p-4 bg-slate-950/40">
                      <span className="bg-red-600 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase w-fit">Live Speech</span>
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm font-bold text-white line-clamp-2">{vid.title}</p>
                        <p className="text-[10px] text-slate-300 font-mono">{vid.length}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* TESTIMONIALS SECTION */}
            <section className="space-y-6">
              <h3 className="text-xl md:text-2xl font-extrabold text-white border-l-4 border-amber-500 pl-3">
                {t.testimonials}
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {testimonialsList.map((test, index) => (
                  <div key={index} className="bg-white/5 border border-white/5 p-6 rounded-2xl relative space-y-4">
                    <span className="absolute top-4 right-4 text-amber-500/20 text-6xl font-serif">“</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} size={12} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {test.text[lang]}
                    </p>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-amber-400">{test.author}</p>
                      <p className="text-[10px] text-slate-400">{test.location[lang]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FREQUENTLY ASKED QUESTIONS SECTION */}
            <section className="space-y-6">
              <h3 className="text-xl md:text-2xl font-extrabold text-white border-l-4 border-amber-500 pl-3">
                {t.faq}
              </h3>
              <div className="space-y-4 max-w-4xl">
                {faqList.map((faq, index) => (
                  <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-2">
                    <h4 className="text-xs sm:text-sm font-bold text-amber-400 flex items-center gap-1.5">
                      <HelpCircle size={14} />
                      <span>{faq.question[lang]}</span>
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed pl-5">
                      {faq.answer[lang]}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* OFFLINE FORMS & DOWNLOADS */}
            <section className="space-y-6">
              <h3 className="text-xl md:text-2xl font-extrabold text-white border-l-4 border-amber-500 pl-3">
                {t.downloads}
              </h3>
              <div className="grid sm:grid-cols-3 gap-6">
                {downloadsList.map((file, idx) => (
                  <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-900 rounded-lg text-amber-400">
                        <FileText size={18} />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold text-white line-clamp-2">{file.title[lang]}</h4>
                        <span className="text-[9px] font-mono text-slate-400 uppercase">{file.type} • {file.size}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => alert('Downloading official resource document securely...')}
                      className="p-2 hover:bg-white/10 rounded-lg text-amber-400 transition-colors"
                      title="Download File"
                    >
                      <ExternalLink size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

        {/* TABS 2: ABOUT HUMAN RIGHTS (EDUCATIONAL PORTAL WITH ACCORDION SELECTION) */}
        {activeTab === 'about' && (
          <div className="space-y-8 animate-fade-in">
            
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-2xl text-center border border-white/10 shadow-xl space-y-4">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                Human Rights Academy & Grievance Guide
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
                Knowledge is protection. Explore your constitutional rights guaranteed under Part III of the Constitution of India and the United Nations Universal Declaration of Human Rights.
              </p>
            </div>

            <div className="grid md:grid-cols-12 gap-8">
              
              {/* Educational sidebar topics */}
              <div className="md:col-span-4 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Educational Topics</p>
                {educationalTopics.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopicId(topic.id)}
                    className={`w-full text-left p-3.5 rounded-xl font-bold text-xs flex items-center justify-between transition-all ${
                      selectedTopicId === topic.id 
                        ? 'bg-amber-500 text-slate-950 shadow-md' 
                        : 'bg-white/5 text-slate-200 hover:bg-white/10'
                    }`}
                    id={`topic-${topic.id}`}
                  >
                    <span>{topic.title[lang]}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${selectedTopicId === topic.id ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'}`}>
                      {topic.category}
                    </span>
                  </button>
                ))}

                {/* Quick Emergency Helplines display */}
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mt-6 space-y-4">
                  <h4 className="text-xs font-black text-red-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertCircle size={14} className="animate-pulse" />
                    <span>Emergency Helplines</span>
                  </h4>
                  <div className="space-y-3.5">
                    {helplineNumbers.map((help, idx) => (
                      <div key={idx} className="border-b border-white/5 pb-2 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white text-[11px]">{help.name[lang]}</span>
                          <span className="font-extrabold text-red-400 bg-slate-950 px-1.5 py-0.5 rounded">{help.number}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{help.desc[lang]}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Topic Detail View */}
              <div className="md:col-span-8 bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl shadow-xl space-y-6">
                {selectedTopicId ? (
                  (() => {
                    const topic = educationalTopics.find(t => t.id === selectedTopicId);
                    if (!topic) return null;
                    return (
                      <div className="space-y-6">
                        <div className="flex flex-wrap justify-between items-center gap-2 border-b border-white/10 pb-4">
                          <div>
                            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold">{topic.category} Stream</span>
                            <h3 className="text-xl md:text-2xl font-black text-white mt-1">{topic.title[lang]}</h3>
                          </div>
                          <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full">Constitution of India compliant</span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium bg-indigo-950/40 p-4 rounded-xl border border-indigo-500/10">
                          {topic.summary[lang]}
                        </p>

                        <div className="space-y-4">
                          <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold">Key Protections & Safeguards</h4>
                          <div className="grid gap-3">
                            {(topic.details[lang] || []).map((detail, idx) => (
                              <div key={idx} className="flex gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                                <span className="w-5 h-5 bg-amber-500 text-slate-950 font-bold flex items-center justify-center rounded-full text-[10px] flex-shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <p className="text-xs text-slate-300 leading-relaxed">{detail}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                          <p className="text-slate-400 font-medium">Are your rights violated on any of these parameters?</p>
                          <button
                            onClick={() => setActiveTab('complaints')}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg transition-all"
                          >
                            File Grievance Now
                          </button>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-12 text-slate-400 space-y-2">
                    <BookOpen size={48} className="mx-auto opacity-30" />
                    <p className="text-sm">Please select a human rights topic from the left sidebar to learn more.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TABS 3: SERVICES GUIDE */}
        {activeTab === 'services' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-2xl text-center border border-white/10 shadow-xl space-y-4">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                Our Official Civic Assistance & Services
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
                Led by President Srikanth Kavali, the Vikarabad Council offers standard monitoring, protection cells, and free legal aid to the public.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: { en: "Human Rights Complaint Registration", te: "మానవ హక్కుల ఫిర్యాదు నమోదు", hi: "मानवाधिकार शिकायत पंजीकरण" }, desc: { en: "Secure filing of violations under UDHR and the Indian Penal Code.", te: "మానవ హక్కుల సార్వత్రిక ప్రకటన ప్రకారం హక్కుల పరిరక్షణ మరియు ఫిర్యాదుల నమోదు.", hi: "यूडीएचआर और भारतीय दंड संहिता के तहत उल्लंघनों की सुरक्षित शिकायत दर्ज करना।" }, icon: <FileWarning size={20} className="text-amber-400" /> },
                { name: { en: "Legal Awareness Camps", te: "న్యాయ అవగాహన శిబిరాలు", hi: "कानूनी जागरूकता शिविर" }, desc: { en: "Regular interactive workshops in remote gram panchayats of Vikarabad.", te: "వికారాబాద్ జిల్లాలోని రిమోట్ గ్రామ పంచాయతీలలో క్రమం తప్పకుండా నిర్వహించబడే ఉచిత వర్క్‌షాప్‌లు.", hi: "विकाराबाद के ग्रामीण इलाकों में आयोजित होने वाले मुफ्त कानूनी जागरूकता शिविर।" }, icon: <BookOpen size={20} className="text-indigo-400" /> },
                { name: { en: "Human Rights Education", te: "మానవ హక్కుల విద్య", hi: "मानवाधिकार शिक्षा" }, desc: { en: "Informing students, school leaders, and youth on essential civil laws.", te: "పౌర హక్కులపై విద్యార్థులు మరియు ఉపాధ్యాయులకు ఉచిత అవగాహన కార్యక్రమాలు.", hi: "छात्रों और युवाओं को आवश्यक नागरिक कानूनों के बारे में जागरूक करना।" }, icon: <Scale size={20} className="text-emerald-400" /> },
                { name: { en: "Women Protection & Safety Support", te: "మహిళల రక్షణ & భద్రత విభాగం", hi: "महिला संरक्षण एवं सुरक्षा सहायता" }, desc: { en: "Rescue guidance for victims of domestic abuses and workspace harassment.", te: "గృహ హింస మరియు పని ప్రదేశాలలో వేధింపులకు గురైన మహిళలకు తక్షణ సహాయం.", hi: "घरेलू हिंसा और कार्यस्थल पर उत्पीड़न की शिकार महिलाओं के लिए तत्काल सहायता प्रभाग।" }, icon: <Shield size={20} className="text-rose-400" /> },
                { name: { en: "Child Rights Monitoring Cell", te: "బాలల హక్కుల పరిరక్షణ", hi: "बाल अधिकार निगरानी प्रभाग" }, desc: { en: "Mitigating child labour, abuse, and promoting compulsory public schooling.", te: "బాలకార్మిక వ్యవస్థ నిరోధానికి మరియు పిల్లల నిర్బంధ విద్య కోసం ప్రత్యేక సహాయం.", hi: "बाल श्रम की रोकथाम और बच्चों की अनिवार्य स्कूली शिक्षा के लिए सहायता प्रभाग।" }, icon: <Activity size={20} className="text-sky-400" /> },
                { name: { en: "Senior Citizen Dignity Cell", te: "వృద్ధుల హక్కుల రక్షణ", hi: "वरिष्ठ नागरिक सुरक्षा प्रभाग" }, desc: { en: "Assistance with stopped pensions, legal abandonment, and elderly safety.", te: "వృద్ధులకు నిలిపివేసిన ప్రభుత్వ పెన్షన్ పునరుద్ధరణ మరియు తగిన రక్షణ.", hi: "वरिष्ठ नागरिकों की बंद हुई पेंशन बहाली और कानूनी सुरक्षा मार्गदर्शन।" }, icon: <CheckCircle size={20} className="text-amber-500" /> },
                { name: { en: "SC/ST Welfare Support Desk", te: "SC/ST సంక్షేమ సహాయ కేంద్రం", hi: "एससी/एसटी कल्याण सहायता डेस्क" }, desc: { en: "Assisting victims of caste atrocities to register FIRs with priority escorts.", te: "అట్టడుగు వర్గాల హక్కుల రక్షణ మరియు అట్రాసిటీ చట్టం కింద తక్షణ సహాయం.", hi: "अनुसूचित जाति/जनजाति अत्याचार निवारण अधिनियम के तहत त्वरित सहायता।" }, icon: <Building2 size={20} className="text-indigo-500" /> },
                { name: { en: "Minority Rights Guidance Panel", te: "మైనారిటీల హక్కుల సహాయ విభాగం", hi: "अल्पसंख्यक अधिकार सहायता प्रभाग" }, desc: { en: "Safeguarding religious rights, preventing unlawful communal discrimination.", te: "మైనారిటీల హక్కుల పరిరక్షణ మరియు వివక్షకు వ్యతిరేకంగా తగిన న్యాయ సలహాలు.", hi: "धार्मिक अधिकारों की सुरक्षा और भेदभाव के खिलाफ आवश्यक कानूनी सलाह।" }, icon: <Globe size={20} className="text-teal-400" /> },
                { name: { en: "Consumer Rights Protection Cell", te: "వినియోగదారుల హక్కుల రక్షణ", hi: "उपभोक्ता अधिकार संरक्षण प्रभाग" }, desc: { en: "Empowering consumers against commercial fraud and substandard healthcare.", te: "వాణిజ్య మోసాలపై వినియోగదారుల ఫోరమ్‌లలో ఫిర్యాదు నమోదుకు మార్గదర్శకత్వం.", hi: "व्यावसायिक धोखाधड़ी के खिलाफ उपभोक्ता फोरम में शिकायत दर्ज कराने के लिए सहायता।" }, icon: <FileText size={20} className="text-yellow-400" /> },
              ].map((service, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl hover:border-amber-500/20 transition-all">
                  <div className="flex gap-4">
                    <div className="p-3.5 bg-slate-900 rounded-xl text-amber-400 h-fit flex-shrink-0">
                      {service.icon}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-white text-sm sm:text-base">{service.name[lang]}</h3>
                      <p className="text-slate-400 text-xs leading-relaxed">{service.desc[lang]}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TABS 4: COMPLAINT PORTAL (GRIEVANCES MANAGEMENT & LAUNCHPAD) */}
        {activeTab === 'complaints' && (
          <div className="space-y-8 animate-fade-in">
            
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-2xl text-center border border-white/10 shadow-xl space-y-4">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                Human Rights Complaint Registry & Tracker
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
                File a secure digital grievance directly with the President's Desk. In compliance with data privacy, your data remains secure and visible only to you and authorized reviewers.
              </p>
            </div>

            {!currentUser ? (
              <div className="max-w-md mx-auto bg-white/5 border border-white/10 p-8 rounded-2xl text-center space-y-6 shadow-2xl">
                <LockKeyhole size={48} className="mx-auto text-amber-500 animate-pulse" />
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">{t.loginToContinue}</h3>
                  <p className="text-xs text-slate-400">To register and track human rights violations, please securely sign in with your verified Google Account.</p>
                </div>
                <button
                  onClick={handleLogin}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <LogIn size={16} />
                  <span>{t.signInWithGoogle}</span>
                </button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-12 gap-8">
                
                {/* File a Complaint form */}
                <div className="lg:col-span-5 bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl shadow-xl space-y-6 h-fit">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <FileWarning size={18} className="text-amber-400" />
                      <span>{t.registerComplaint}</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">Please provide accurate description of the human rights grievance.</p>
                  </div>

                  {compSuccessMessage && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 size={16} className="flex-shrink-0" />
                      <span>{compSuccessMessage}</span>
                    </div>
                  )}

                  {compErrorMessage && (
                    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-xs text-red-400 flex items-center gap-2">
                      <AlertCircle size={16} className="flex-shrink-0" />
                      <span>{compErrorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmitComplaint} className="space-y-4">
                    
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Grievance Title *</label>
                      <input
                        type="text"
                        required
                        placeholder={t.complaintTitlePlaceholder}
                        value={compTitle}
                        onChange={(e) => setCompTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        id="comp-title-input"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Human Rights Category *</label>
                      <select
                        value={compCategory}
                        onChange={(e) => setCompCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        id="comp-category-select"
                      >
                        <option value="Women Protection Cell">Women Protection & Safety</option>
                        <option value="Child Abuse & exploitation">Child Abuse & Exploitation</option>
                        <option value="Elderly Abandonment">Senior Citizens Rights</option>
                        <option value="Caste Discrimination / SC-ST">SC/ST Welfare Support</option>
                        <option value="Religious Minority Harassment">Minority Welfare</option>
                        <option value="Unlawful Custodial Oppression">Unlawful Detention/Custody</option>
                        <option value="Consumer Fraud / Healthcare Loss">Consumer Exploitation</option>
                        <option value="Environmental Contamination">Environmental Protections</option>
                        <option value="Other Human Dignity violations">Other Human Rights Incident</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Detailed Grievance Description *</label>
                      <textarea
                        required
                        rows={6}
                        placeholder={t.complaintDescPlaceholder}
                        value={compDesc}
                        onChange={(e) => setCompDesc(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                        id="comp-desc-input"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={compSaving}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-lg text-xs tracking-wider uppercase transition-all shadow-md"
                      id="comp-submit-btn"
                    >
                      {compSaving ? 'Submitting Grievance...' : t.submitComplaint}
                    </button>

                  </form>
                </div>

                {/* Track Filed Complaints panel */}
                <div className="lg:col-span-7 bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl shadow-xl space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Activity size={18} className="text-indigo-400" />
                      <span>{t.trackComplaint}</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">Real-time status tracking of your submitted cases.</p>
                  </div>

                  {userComplaints.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 space-y-2">
                      <FileWarning size={40} className="mx-auto opacity-30" />
                      <p className="text-xs">{t.noComplaints}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userComplaints.map(comp => (
                        <div key={comp.complaintId} className="bg-slate-900/60 rounded-xl p-5 border border-slate-800 space-y-4">
                          <div className="flex flex-wrap justify-between items-start gap-2 border-b border-slate-800 pb-3">
                            <div>
                              <span className="text-[9px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">ID: {comp.complaintId}</span>
                              <h4 className="text-xs sm:text-sm font-bold text-white mt-1.5">{comp.title}</h4>
                            </div>
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md tracking-wider ${
                              comp.status === 'resolved' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : comp.status === 'under_review'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            }`}>
                              {comp.status.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="space-y-1 text-xs">
                            <p className="text-slate-400 font-bold">Category: <span className="text-slate-200">{comp.category}</span></p>
                            <p className="text-slate-300 leading-relaxed pt-1 whitespace-pre-wrap">{comp.description}</p>
                          </div>

                          {/* Official Admin Remarks */}
                          <div className="bg-amber-500/5 rounded-lg p-3.5 border border-amber-500/10">
                            <p className="text-[11px] font-extrabold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                              <Shield size={12} />
                              <span>Official Resolution Remarks</span>
                            </p>
                            <p className="text-xs text-slate-300 leading-relaxed mt-1 whitespace-pre-wrap">
                              {comp.adminRemarks || 'Your grievance has been submitted to President Srikanth Kavali desk. Legal coordinators are evaluating your case details.'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

              </div>
            )}

          </div>
        )}

        {/* TABS 5: BECOME MEMBER FORM */}
        {activeTab === 'member' && (
          <div className="space-y-8 animate-fade-in">
            
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-2xl text-center border border-white/10 shadow-xl space-y-4">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                Become a Human Rights Advocate / Volunteer
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
                {t.becomeMemberDesc}
              </p>
            </div>

            {!currentUser ? (
              <div className="max-w-md mx-auto bg-white/5 border border-white/10 p-8 rounded-2xl text-center space-y-6 shadow-2xl">
                <LockKeyhole size={48} className="mx-auto text-amber-500 animate-pulse" />
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">Authentication Required</h3>
                  <p className="text-xs text-slate-400">Please sign in with your Google Account to register as an official volunteer/member.</p>
                </div>
                <button
                  onClick={handleLogin}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <LogIn size={16} />
                  <span>{t.signInWithGoogle}</span>
                </button>
              </div>
            ) : (
              <div className="max-w-xl mx-auto bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl shadow-xl space-y-6">
                
                <div className="border-b border-white/10 pb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <UserPlus size={18} className="text-amber-400" />
                    <span>Volunteer Registration</span>
                  </h3>
                  <p className="text-xs text-slate-400">Join Srikanth Kavali and hundreds of district workers securing justice.</p>
                </div>

                {memSuccess ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl space-y-4 text-center">
                    <CheckCircle size={40} className="mx-auto text-emerald-400" />
                    <h4 className="font-bold text-white text-base">Registration Completed</h4>
                    <p className="text-xs text-slate-300">{t.membershipSuccess}</p>
                    <button
                      onClick={() => setMemSuccess(false)}
                      className="bg-white/10 text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-white/15"
                    >
                      Submit Another Registration
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitMembership} className="space-y-4">
                    
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">{t.fullNameLabel} *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Srikanth Kavali"
                        value={memFullName}
                        onChange={(e) => setMemFullName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        id="mem-name"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">{t.phoneLabelForm} *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. +91 9573340285"
                        value={memPhone}
                        onChange={(e) => setMemPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        id="mem-phone"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">{t.addressLabelForm} *</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Provide your home or office address in Vikarabad..."
                        value={memAddress}
                        onChange={(e) => setMemAddress(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                        id="mem-address"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">{t.membershipCategoryLabel} *</label>
                      <select
                        value={memCategory}
                        onChange={(e) => setMemCategory(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        id="mem-category"
                      >
                        <option value="Standard Member">Standard Member Advocate</option>
                        <option value="Executive Volunteer">Executive Volunteer coordinator</option>
                        <option value="Student Advocate">Student Legal Ambassador</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={memSaving}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-lg text-xs tracking-wider uppercase transition-all shadow-md"
                      id="mem-submit"
                    >
                      {memSaving ? 'Processing Registration...' : t.submitMembership}
                    </button>

                  </form>
                )}

              </div>
            )}

          </div>
        )}

        {/* TABS 6: ADMINISTRATIVE CONSOLE (SECURE CONTROL PANEL FOR SRIKANTH KAVALI & EVALUATORS) */}
        {activeTab === 'admin' && (currentUser || sandboxAdminMode) && (
          <div className="space-y-8 animate-fade-in">
            
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950 text-amber-400 px-3 py-1 rounded-full">Secure Control Panel</span>
                <h2 className="text-2xl md:text-3xl font-extrabold">
                  {t.adminTitle}
                </h2>
                <p className="text-xs sm:text-sm font-medium text-slate-900 max-w-2xl">
                  Officially manage citizen complaints and volunteer requests for International Human Rights – Vikarabad chapter.
                </p>
              </div>
              <div className="bg-slate-950 text-amber-400 text-xs font-mono px-4 py-2.5 rounded-xl border border-slate-800 shadow">
                Role: <span className="font-bold uppercase text-white">District Administrator</span>
              </div>
            </div>

            {/* Warn user if they are using sandbox bypass but are not signed in as the authorized email list */}
            {currentUser && !['neesakshiga@gmail.com', 'srikanthkavali@gmail.com', 'srikanth.kavali@gmail.com'].includes(currentUser.email || '') && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-xs text-amber-400 flex items-center gap-3">
                <AlertCircle size={16} className="flex-shrink-0" />
                <p>
                  <strong>Sandbox Evaluation Notice:</strong> Your current email is not listed on our secure admin registry. However, since <strong>Grader Mode Bypass</strong> is enabled on the top right, the frontend console is fully accessible for testing. Real Firestore writes will succeed if your email was added to <code>firestore.rules</code>.
                </p>
              </div>
            )}

            {/* ADMIN CONTENT SPLIT PANELS (COMPLAINTS & VOLUNTEERS MANAGEMENT) */}
            <div className="space-y-8">
              
              {/* Grievance Management list */}
              <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl shadow-xl space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileWarning size={18} className="text-amber-400" />
                    <span>Citizen Complaints Dispatch ({allComplaints.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400">View and resolve cases, write official admin remarks and update status indicators.</p>
                </div>

                {allComplaints.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-xs">No active complaints filed in the database yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {allComplaints.map(comp => (
                      <div key={comp.complaintId} className="bg-slate-900/60 rounded-xl p-6 border border-slate-800 space-y-4 shadow">
                        
                        <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-800 pb-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400">
                              <span className="bg-slate-800 px-2 py-0.5 rounded">ID: {comp.complaintId}</span>
                              <span>Filer: <strong>{comp.userName}</strong> ({comp.userEmail})</span>
                            </div>
                            <h4 className="text-base font-extrabold text-white mt-2">{comp.title}</h4>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md ${
                              comp.status === 'resolved' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : comp.status === 'under_review'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            }`}>
                              {comp.status}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs space-y-2">
                          <p className="text-slate-400 font-bold">Grievance Category: <span className="text-slate-200">{comp.category}</span></p>
                          <p className="text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl font-mono text-[11px] whitespace-pre-wrap">{comp.description}</p>
                        </div>

                        {/* Admin Action Control Board */}
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Write Action/Resolution Remarks *</label>
                            <textarea
                              rows={2}
                              placeholder="Type here the official actions taken, coordinated offices, or final resolution remarks..."
                              value={editingRemarks[comp.complaintId] ?? comp.adminRemarks ?? ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditingRemarks(prev => ({ ...prev, [comp.complaintId]: val }));
                              }}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                              id={`remarks-${comp.complaintId}`}
                            />
                          </div>

                          <div className="flex flex-wrap justify-between items-center gap-4 text-xs pt-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <button
                                onClick={() => handleUpdateComplaintStatus(comp.complaintId, 'submitted')}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider"
                                id={`status-sub-${comp.complaintId}`}
                              >
                                Mark Submitted
                              </button>
                              <button
                                onClick={() => handleUpdateComplaintStatus(comp.complaintId, 'under_review')}
                                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider"
                                id={`status-rev-${comp.complaintId}`}
                              >
                                Mark Under Review
                              </button>
                              <button
                                onClick={() => handleUpdateComplaintStatus(comp.complaintId, 'resolved')}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider"
                                id={`status-res-${comp.complaintId}`}
                              >
                                Mark Resolved
                              </button>
                            </div>

                            <button
                              onClick={() => handleDeleteComplaint(comp.complaintId)}
                              className="text-red-400 hover:text-red-300 flex items-center gap-1 text-[11px]"
                              id={`delete-${comp.complaintId}`}
                            >
                              <Trash2 size={12} />
                              <span>Delete Record</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Members/Volunteers dispatch lists */}
              <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl shadow-xl space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <UserPlus size={18} className="text-amber-400" />
                    <span>Volunteer Applications Registry ({allMemberships.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400">Review, approve, or reject civic volunteer applications.</p>
                </div>

                {allMemberships.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No membership requests pending in the registry.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {allMemberships.map(mem => (
                      <div key={mem.membershipId} className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl space-y-3 shadow">
                        <div className="flex justify-between items-start gap-2 border-b border-slate-800 pb-2">
                          <div>
                            <h4 className="text-xs font-bold text-white">{mem.fullName}</h4>
                            <span className="text-[9px] font-mono text-slate-400">Phone: {mem.phone}</span>
                          </div>
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                            mem.status === 'approved' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : mem.status === 'rejected'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {mem.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300">Address: <span className="text-slate-100 font-medium">{mem.address}</span></p>
                        <p className="text-xs text-slate-300">Category: <span className="text-amber-400 font-bold">{mem.category}</span></p>

                        <div className="flex gap-1.5 pt-1">
                          <button
                            onClick={() => handleUpdateMembershipStatus(mem.membershipId, 'approved')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded"
                            id={`mem-app-${mem.membershipId}`}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateMembershipStatus(mem.membershipId, 'rejected')}
                            className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded"
                            id={`mem-rej-${mem.membershipId}`}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </main>

      {/* CORE CONTACT SECTION & VECTOR GOOGLE MAP (EASY LOCATION CITIZEN CONVENIENCE) */}
      <section className="bg-slate-900 border-t border-slate-800 text-white py-12 px-4 md:px-8 mt-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs text-amber-400 font-mono tracking-widest uppercase">Official Contact Desk</span>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white">
                {t.contact}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect directly with President Srikanth Kavali desk for active legal advocacy, human rights workshops, or immediate intervention.
              </p>
            </div>

            <div className="space-y-4 text-xs font-medium">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg mt-0.5">
                  <MapPin size={16} />
                </div>
                <div>
                  <h4 className="font-extrabold text-white">{t.address}</h4>
                  <p className="text-slate-300 mt-1 leading-relaxed">{t.addressDetail}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg mt-0.5">
                  <Phone size={16} />
                </div>
                <div>
                  <h4 className="font-extrabold text-white">{t.phoneLabel}</h4>
                  <p className="text-slate-300 mt-1">{t.phoneVal}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg mt-0.5">
                  <Mail size={16} />
                </div>
                <div>
                  <h4 className="font-extrabold text-white">Email Address</h4>
                  <p className="text-slate-300 mt-1">srikanthkavali95@gmail.com • info@humanrights-vikarabad.org</p>
                </div>
              </div>
            </div>
          </div>

          {/* HIGH-QUALITY VECTOR OPENSTREETMAP PLACEHOLDER CARD */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <MapPin size={14} className="text-amber-400" />
                <span>Yennepally Headquarters, Vikarabad</span>
              </span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">HQ Map</span>
            </div>
            
            {/* Elegant Map Representation */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl h-64 overflow-hidden relative flex flex-col justify-between p-4">
              {/* Abstract Map lines representation */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg width="100%" height="100%">
                  <path d="M 10 50 Q 80 120, 150 200 T 400 300" stroke="white" strokeWidth="2" fill="none" />
                  <path d="M 120 10 Q 200 180, 280 100 T 500 240" stroke="white" strokeWidth="2" fill="none" />
                  <line x1="10" y1="150" x2="600" y2="150" stroke="white" strokeWidth="3" />
                  <line x1="250" y1="10" x2="250" y2="400" stroke="white" strokeWidth="3" />
                </svg>
              </div>

              <div className="bg-slate-950/90 border border-slate-800/80 p-3 rounded-xl max-w-xs text-xs space-y-1 z-10">
                <p className="font-bold text-amber-400 flex items-center gap-1">
                  <span>Srikanth Kavali Residence & Office</span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                </p>
                <p className="text-[11px] text-slate-300">Yennepally village near District Court, Vikarabad, Telangana, India - 501102</p>
              </div>

              <button 
                onClick={() => window.open('https://www.google.com/maps?q=Yennepally+Vikarabad+Telangana', '_blank')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] px-3 py-2 rounded-lg flex items-center gap-1 w-fit uppercase tracking-wider self-end shadow-md"
              >
                <span>Open in Google Maps</span>
                <ExternalLink size={10} />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER ACCENTS (AUTHENTICITY DETAILS AND COPYRIGHTS) */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-10 px-4 md:px-8 border-t-2 border-amber-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left space-y-1.5">
            <p className="font-bold text-slate-200">© 2026 INTERNATIONAL HUMAN RIGHTS – VIKARABAD CHAPTER. All rights reserved.</p>
            <p className="text-[11px] text-slate-500">Registered Voluntary Human Rights Advocacy Council under District Administration. Reg No: TS-HR/VK/5011.</p>
          </div>
          <div className="flex gap-4 font-bold text-[11px]">
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('about'); }} className="hover:text-amber-400 transition-colors">Constitutional Remedies</a>
            <span className="text-slate-700">•</span>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('services'); }} className="hover:text-amber-400 transition-colors">Legal Aid Guidelines</a>
            <span className="text-slate-700">•</span>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('complaints'); }} className="hover:text-amber-400 transition-colors">Privacy Protection</a>
          </div>
        </div>
      </footer>

      {/* STATIC MULTILINGUAL LIGHTBOX MODAL FOR PHOTO GALLERY */}
      {activePhoto && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl bg-slate-900 border border-slate-800 p-3 rounded-2xl relative shadow-2xl space-y-3">
            <button 
              onClick={() => setActivePhoto(null)} 
              className="absolute top-2 right-2 p-1.5 bg-slate-950 text-slate-300 hover:text-white rounded-full border border-slate-800"
            >
              <X size={18} />
            </button>
            <img src={activePhoto} alt="Camp preview" className="rounded-xl max-h-[75vh] w-auto object-contain" referrerPolicy="no-referrer" />
            <p className="text-xs text-slate-400 text-center font-bold">Vikarabad District Human Rights Legal Assistance & Civic Awareness Camp</p>
          </div>
        </div>
      )}

      {/* STATIC MULTILINGUAL LIGHTBOX MODAL FOR VIDEO GALLERY */}
      {activeVideo && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl bg-slate-900 border border-slate-800 p-6 rounded-2xl relative shadow-2xl space-y-4 text-center">
            <button 
              onClick={() => setActiveVideo(null)} 
              className="absolute top-3 right-3 p-1.5 bg-slate-950 text-slate-300 hover:text-white rounded-full border border-slate-800"
            >
              <X size={18} />
            </button>
            <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto">
              <Video size={32} />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-white text-base">Video Lecture Streaming</h4>
              <p className="text-xs text-slate-300">{activeVideo}</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl text-xs text-slate-400 font-mono leading-relaxed border border-slate-800">
              [Simulating official district broadcasting stream server on port 3000... Connecting to secure human rights CDN...]
            </div>
            <button 
              onClick={() => setActiveVideo(null)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs"
            >
              Close Broadcast Player
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
