export interface EducationalTopic {
  id: string;
  category: string;
  title: Record<string, string>;
  summary: Record<string, string>;
  details: Record<string, string[]>;
}

export interface Helpline {
  name: Record<string, string>;
  number: string;
  desc: Record<string, string>;
}

export interface NewsItem {
  id: string;
  date: string;
  title: Record<string, string>;
  excerpt: Record<string, string>;
}

export interface EventItem {
  id: string;
  date: string;
  time: string;
  location: Record<string, string>;
  title: Record<string, string>;
  desc: Record<string, string>;
}

export interface SuccessStory {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  impact: Record<string, string>;
}

export interface DownloadFile {
  title: Record<string, string>;
  size: string;
  type: string;
}

export interface FAQItem {
  question: Record<string, string>;
  answer: Record<string, string>;
}

export interface Testimonial {
  author: string;
  location: Record<string, string>;
  text: Record<string, string>;
}

export const educationalTopics: EducationalTopic[] = [
  {
    id: "what-are-hr",
    category: "Basics",
    title: {
      en: "What are Human Rights?",
      te: "మానవ హక్కులు అంటే ఏమిటి?",
      hi: "मानवाधिकार क्या हैं?"
    },
    summary: {
      en: "Basic rights and freedoms that belong to every person in the world, from birth until death.",
      te: "పుట్టుక నుండి మరణం వరకు ప్రపంచంలోని ప్రతి వ్యక్తికి వర్తించే ప్రాథమిక హక్కులు మరియు స్వేచ్ఛలు.",
      hi: "बुनियादी अधिकार और स्वतंत्रताएं जो दुनिया के हर व्यक्ति के जन्म से लेकर मृत्यु तक लागू होती हैं।"
    },
    details: {
      en: [
        "Inherent Dignity: They apply regardless of nationality, sex, national or ethnic origin, color, religion, language, or any other status.",
        "Universal and Inalienable: They cannot be taken away, except in specific situations and according to due process of law.",
        "Interdependent and Indivisible: The improvement of one right facilitates advancement of the others. Likewise, the deprivation of one right adversely affects others.",
        "Governed by International Treaties: Grounded in the United Nations Charter and international declarations."
      ],
      te: [
        "సహజమైన గౌరవం: జాతీయత, లింగం, జాతి, రంగు, మతం, భాష లేదా ఇతర హోదాతో సంబంధం లేకుండా ఇవి వర్తిస్తాయి.",
        "సార్వత్రిక మరియు బదిలీ చేయలేనివి: నిర్దిష్ట పరిస్థితులలో చట్టపరమైన ప్రక్రియల ప్రకారం తప్ప వీటిని తీసివేయలేము.",
        "పరస్పర ఆధారితమైనవి: ఒక హక్కు మెరుగుపడటం ఇతర హక్కుల అభివృద్ధికి సహాయపడుతుంది. అదేవిధంగా, ఒక హక్కును కోల్పోవడం ఇతర హక్కులపై చెడు ప్రభావం చూపుతుంది.",
        "అంతర్జాతీయ ఒప్పందాల ద్వారా పాలించబడుతుంది: ఐక్యరాజ్యసమితి చార్టర్ మరియు అంతర్జాతీయ ప్రకటనలపై ఆధారపడి ఉంటాయి."
      ],
      hi: [
        "निहित गरिमा: ये राष्ट्रीयता, लिंग, जाति, रंग, धर्म, भाषा या किसी अन्य स्थिति की परवाह किए बिना लागू होते हैं।",
        "सार्वभौमिक और अपरिहार्य: इन्हें छीना नहीं जा सकता, केवल विशिष्ट कानूनी प्रक्रियाओं के अनुसार ही सीमित किया जा सकता है।",
        "परस्पर निर्भर और अविभाज्य: एक अधिकार में सुधार दूसरे अधिकारों के विकास में मदद करता है। उसी तरह, एक अधिकार से वंचित होना दूसरों को प्रतिकूल रूप से प्रभावित करता है।",
        "अंतरराष्ट्रीय संधियों द्वारा शासित: संयुक्त राष्ट्र चार्टर और अंतरराष्ट्रीय घोषणाओं पर आधारित हैं।"
      ]
    }
  },
  {
    id: "udhr",
    category: "International",
    title: {
      en: "Universal Declaration of Human Rights (UDHR)",
      te: "మానవ హక్కుల సార్వత్రిక ప్రకటన (UDHR)",
      hi: "मानवाधिकारों की सार्वभौमिक घोषणा (UDHR)"
    },
    summary: {
      en: "A milestone document in the history of human rights, drafted by representatives with different legal and cultural backgrounds.",
      te: "విభిన్న చట్టపరమైన మరియు సాంస్కృతిక నేపథ్యాలు కలిగిన ప్రతినిధులచే రూపొందించబడిన మానవ హక్కుల చరిత్రలో ఒక మైలురాయి పత్రం.",
      hi: "मानवाधिकारों के इतिहास में एक मील का पत्थर दस्तावेज, जिसे विभिन्न कानूनी और सांस्कृतिक पृष्ठभूमि के प्रतिनिधियों द्वारा तैयार किया गया था।"
    },
    details: {
      en: [
        "Adopted by UN: Proclaimed by the United Nations General Assembly in Paris on 10 December 1948.",
        "30 Fundamental Articles: Sets out, for the first time, fundamental human rights to be universally protected.",
        "Core Theme: Article 1 states: 'All human beings are born free and equal in dignity and rights.'",
        "Global Impact: Inspired over 70 human rights treaties and national constitutions worldwide."
      ],
      te: [
        "ఐరాస ఆమోదం: 10 డిసెంబర్ 1948న పారిస్‌లో ఐక్యరాజ్యసమితి సాధారణ సభచే ప్రకటించబడింది.",
        "30 ప్రాథమిక ఆర్టికల్స్: సార్వత్రికంగా రక్షించబడవలసిన ప్రాథమిక మానవ హక్కులను మొదటిసారిగా ఇవి నిర్దేశించాయి.",
        "ప్రధాన ఇతివృత్తం: ఆర్టికल 1 ఇలా చెబుతుంది: 'మానవులందరూ స్వేచ్ఛగా జన్మించారు మరియు గౌరవం మరియు హక్కులలో సమానంగా ఉంటారు.'",
        "ప్రపంచవ్యాప్త ప్రభావం: ప్రపంచవ्याప్తంగా 70 కి పైగా మానవ హక్కుల ఒప్పందాలు మరియు జాతీయ రాజ్యాంగాలకు స్ఫూర్తినిచ్చింది."
      ],
      hi: [
        "संयुक्त राष्ट्र द्वारा स्वीकृत: 10 दिसंबर 1948 को पेरिस में संयुक्त राष्ट्र महासभा द्वारा घोषित किया गया।",
        "30 मौलिक अनुच्छेद: पहली बार सार्वभौमिक रूप से संरक्षित किए जाने वाले मौलिक मानवाधिकारों को निर्धारित करता है।",
        "मुख्य विषय: अनुच्छेद 1 कहता है: 'सभी मनुष्य गरिमा और अधिकारों में स्वतंत्र और समान पैदा हुए हैं।'",
        "वैश्विक प्रभाव: दुनिया भर में 70 से अधिक मानवाधिकार संधियों और राष्ट्रीय संविधानों को प्रेरित किया।"
      ]
    }
  },
  {
    id: "fundamental-rights-india",
    category: "Indian Constitution",
    title: {
      en: "Fundamental Rights of India (Part III)",
      te: "భారతదేశ ప్రాథమిక హక్కులు (భాగం III)",
      hi: "भारत के मौलिक अधिकार (भाग III)"
    },
    summary: {
      en: "Guaranteed by the Constitution of India to all citizens, enforceable by the Supreme Court and High Courts.",
      te: "భారత రాజ్యాంగం ద్వారా పౌరులందరికీ హామీ ఇవ్వబడినవి, సుప्रीम కోర్టు మరియు హైకోర్టుల ద్వారా అమలు చేయబడతాయి.",
      hi: "भारतीय संविधान द्वारा सभी नागरिकों को गारंटीकृत, सर्वोच्च न्यायालय और उच्च न्यायालयों द्वारा प्रवर्तनीय।"
    },
    details: {
      en: [
        "Right to Equality (Articles 14-18): Prohibition of discrimination on grounds of religion, race, caste, sex or place of birth.",
        "Right to Freedom (Articles 19-22): Freedom of speech, assembly, association, movement, residence, and profession.",
        "Right against Exploitation (Articles 23-24): Abolition of human trafficking and forced labor (Begar), and prohibition of child labor.",
        "Right to Freedom of Religion (Articles 25-28): Freedom of conscience and free profession, practice, and propagation of religion.",
        "Cultural and Educational Rights (Articles 29-30): Protection of interests of minorities, and their right to establish educational institutions.",
        "Right to Constitutional Remedies (Article 32): The right to move the Supreme Court for enforcement of fundamental rights via writs."
      ],
      te: [
        "సమానత్వ హక్కు (ఆర్టికల్స్ 14-18): మతం, జాతి, కులం, లింగం లేదా పుట్టిన స్థలం ఆధారంగా వివక్షను నిషేధించడం.",
        "స్వేచ్ఛ హక్కు (ఆర్టికల్స్ 19-22): వాక్ స్వాతంత్ర్యం, సమావేశాలు, సంఘాలు ఏర్పాటు చేసుకోవడం, సంచరించడం మరియు వృత్తి స్వేచ్ఛ.",
        "పీడనాన్ని నిరోధించే హక్కు (ఆర్టికల్స్ 23-24): మానవ అక్రమ రవాణా, వెట్టిచాకిరీ రద్దు మరియు బాలకార్మిక వ్యవస్థ నిషేధం.",
        "మత స్వాతంత్ర్య హక్కు (ఆర్టికల్స్ 25-28): మనస్సాక్షి స్వేచ్ఛ మరియు మత విశ్వాసాల ప్రచారం చేసుకునే హక్కు.",
        "సాంస్కృతిక మరియు విద्या విషయక హక్కులు (ఆర్టికల్స్ 29-30): మైనారిటీల ప్రయోజనాల రక్షణ మరియు విద్యాసంస్థల స్థాపన హక్కు.",
        "రాజ్యాంగ పరిహారాల హక్కు (ఆర్టికల్ 32): రిట్ల ద్వారా ప్రాథమిక హక్కుల అమలు కోసం సుప్రీంకోర్టును ఆశ్రయించే హక్కు."
      ],
      hi: [
        "समानता का अधिकार (अनुच्छेद 14-18): धर्म, मूलवंश, जाति, लिंग या जन्म स्थान के आधार पर भेदभाव का निषेध।",
        "स्वतंत्रता का अधिकार (अनुच्छेद 19-22): भाषण, सभा, संघ बनाने, आंदोलन करने, निवास और पेशे की स्वतंत्रता।",
        "शोषण के विरुद्ध अधिकार (अनुच्छेद 23-24): मानव तस्करी और जबरन श्रम (बेगार) का उन्मूलन, और बाल श्रम का निषेध।",
        "धार्मिक स्वतंत्रता का अधिकार (अनुच्छेद 25-28): अंतःकरण की स्वतंत्रता और धर्म को स्वतंत्र रूप से मानने, आचरण करने और प्रचार करने की स्वतंत्रता।",
        "सांस्कृतिक और शैक्षिक अधिकार (अनुच्छेद 29-30): अल्पसंख्यकों के हितों का संरक्षण, और उन्हें शैक्षणिक संस्थान स्थापित करने का अधिकार।",
        "संवैधानिक उपचारों का अधिकार (अनुच्छेद 32): रिट के माध्यम से मौलिक अधिकारों के प्रवर्तन के लिए सर्वोच्च न्यायालय जाने का अधिकार।"
      ]
    }
  },
  {
    id: "womens-rights",
    category: "Protection",
    title: {
      en: "Women's Rights & Protection",
      te: "మహిళల హక్కులు & రక్షణ",
      hi: "महिला अधिकार और सुरक्षा"
    },
    summary: {
      en: "Special legal and constitutional safeguards in India to prevent violence, ensure equality, and empower women.",
      te: "హింసను నిరోధించడానికి, సమానత్వాన్ని నిర్ధారించడానికి మరియు మహిళల సాధికారత కోసం భారతదేశంలో ప్రత్యేక చట్టపరమైన రక్షణలు.",
      hi: "हिंसा को रोकने, समानता सुनिश्चित करने और महिलाओं को सशक्त बनाने के लिए भारत में विशेष कानूनी और संवैधानिक सुरक्षा उपाय।"
    },
    details: {
      en: [
        "Equal Pay: Equal Remuneration Act ensures equal wages for equal work.",
        "Protection from Violence: Protection of Women from Domestic Violence Act (2005) provides civil remedies.",
        "Workplace Safety: POSH Act (2013) mandates internal complaints committees for sexual harassment.",
        "Maternity Benefits: Paid leave and nutritional support during pregnancy and child-birth."
      ],
      te: [
        "సమాన వేతనం: సమాన పనికి సమాన వేతనం పొందే హక్కు.",
        "గృహ హింస నుండి రక్షణ: గృహ హింస నిరోధక చట్టం (2005) ద్వారా సివిల్ పరిహారాలు పొందడం.",
        "పని ప్రదేశంలో భద్రత: POSH చట్టం (2013) లైంగిక వేధింపుల నిరోధానికి అంతర్గత కమిటీల ఏర్పాటును తప్పనిసరి చేస్తుంది.",
        "ప్రసూతి ప్రయోజనాలు: గర్భధారణ సమయంలో వేతనంతో కూడిన సెలవులు మరియు పోషకాహార సహాయం."
      ],
      hi: [
        "समान वेतन: समान कार्य के लिए समान वेतन सुनिश्चित करने का अधिकार।",
        "हिंसा से सुरक्षा: घरेलू हिंसा से महिला संरक्षण अधिनियम (2005) नागरिक उपचार प्रदान करता है।",
        "कार्यस्थल सुरक्षा: POSH अधिनियम (2013) यौन उत्पीड़न के खिलाफ आंतरिक शिकायत समितियों को अनिवार्य बनाता है।",
        "मातृत्व लाभ: गर्भावस्था के दौरान सवैतनिक अवकाश और पोषण संबंधी सहायता।"
      ]
    }
  },
  {
    id: "children-rights",
    category: "Protection",
    title: {
      en: "Children's Rights & Pocso Act",
      te: "బాలల హక్కులు & పోక్సో చట్టం",
      hi: "बाल अधिकार और पोक्सो अधिनियम"
    },
    summary: {
      en: "Ensures safety, nutrition, free compulsory education, and protection from abuse and exploitation.",
      te: "భద్రత, పోషకాहారం, ఉచిత నిర్బంధ విద్య మరియు వేధింపులు మరియు దోపిడీ నుండి రక్షణను నిర్ధారిస్తుంది.",
      hi: "सुरक्षा, पोषण, मुफ्त अनिवार्य शिक्षा और शोषण व दुर्व्यवहार से सुरक्षा सुनिश्चित करता है।"
    },
    details: {
      en: [
        "Right to Education (Article 21A): Free and compulsory education for children between 6 to 14 years.",
        "Protection from Exploitation: POCSO Act (2012) protects children from sexual offenses and harassment.",
        "Ban on Child Labour: Child Labour Prohibition Act bans employing children under 14 in any commercial occupation."
      ],
      te: [
        "విద్యా హక్కు (ఆర్టికల్ 21A): 6 నుండి 14 సంవత్సరాల లోపు పిల్లలందరికీ ఉచిత మరియు నిర్బంధ విద్య.",
        "దోపిడీ నుండి రక్షణ: పోక్సో (POCSO) చట్టం (2012) లైంగిక నేరాలు మరియు వేధింపుల నుండి పిల్లలను రక్షిస్తుంది.",
        "బాలకార్మిక నిషేధం: 14 ఏళ్లలోపు పిల్లలను ఎలాంటి వాణిజ్య పనుల్లో నియమించడాన్ని చట్టం నిషేధిస్తుంది."
      ],
      hi: [
        "शिक्षा का अधिकार (अनुच्छेद 21A): 6 से 14 वर्ष के बच्चों के लिए मुफ्त और अनिवार्य शिक्षा।",
        "शोषण से सुरक्षा: पॉक्सो (POCSO) अधिनियम (2012) बच्चों को यौन अपराधों और उत्पीड़न से बचाता है।",
        "बाल श्रम पर रोक: बाल श्रम निषेध अधिनियम 14 वर्ष से कम उम्र के बच्चों को किसी भी व्यावसायिक काम पर रखने से रोकता है।"
      ]
    }
  },
  {
    id: "sc-st-rights",
    category: "Protection",
    title: {
      en: "SC/ST Rights & Atrocities Act",
      te: "SC/ST హక్కులు & అట్రాసిటీ చట్టం",
      hi: "एससी/एसटी अधिकार और अत्याचार निवारण अधिनियम"
    },
    summary: {
      en: "Strong legal shields in India protecting scheduled castes and scheduled tribes from discrimination, humiliation, and violence.",
      te: "షెడ్యూల్డ్ కులాలు మరియు షెడ్యూల్డ్ తెగలను వివక్ష, అవమానం మరియు హింస నుండి రక్షించే బలమైన చట్టపరమైన కవచాలు.",
      hi: "अनुसूचित जाति और अनुसूचित जनजाति के लोगों को भेदभाव, अपमान और हिंसा से बचाने वाले मजबूत कानूनी उपाय।"
    },
    details: {
      en: [
        "SC/ST PoA Act 1989: Special fast-track courts for atrocities and immediate registration of cases without preliminary inquiries.",
        "Abolition of Untouchability (Article 17): Strict criminal penalties for practicing any form of social untouchability.",
        "Welfare & Representation: Affirmative action in public education, employment, and political representations."
      ],
      te: [
        "SC/ST PoA చట్టం 1989: దాడులపై విచారణకు ప్రత్యేక ఫాస్ట్ ట్రాక్ కోర్టులు మరియు తక్షణ కేసు నమోదు.",
        "అస్పృశ్యత నివారణ (ఆర్టికల్ 17): ఏ రూపంలోనైనా అస్పృశ్యతను పాటించడంపై కఠినమైన క్రిమినల్ జరిమానాలు.",
        "సంక్షేమం & ప్రాతినిధ్యం: విద్య, ఉపాధి మరియు రాజకీయ రంగాలలో రిజర్వేషన్ల ద్వారా ప్రత్యేక సహాయం."
      ],
      hi: [
        "एससी/एसटी अत्याचार निवारण अधिनियम 1989: अत्याचारों के लिए विशेष त्वरित अदालतें और बिना किसी प्रारंभिक जांच के तत्काल मामला दर्ज करना।",
        "अस्पृश्यता का उन्मूलन (अनुच्छेद 17): सामाजिक अस्पृश्यता का अभ्यास करने पर सख्त आपराधिक दंड।",
        "कल्याण और प्रतिनिधित्व: सार्वजनिक शिक्षा, रोजगार और राजनीतिक प्रतिनिधित्व में आरक्षण के माध्यम से सहायता।"
      ]
    }
  },
  {
    id: "rti-act",
    category: "Transparency",
    title: {
      en: "Right to Information (RTI Act 2005)",
      te: "సమాచార హక్కు చట్టం (RTI చట్టం 2005)",
      hi: "सूचना का अधिकार (RTI अधिनियम 2005)"
    },
    summary: {
      en: "Empowers citizens to request information from public authorities, fostering transparency and accountability.",
      te: "పౌరులు ప్రభుత్వ కార్యాలయాల నుండి సమాచారాన్ని అడగడానికి అధికారం ఇస్తుంది, పారదర్శకతను పెంచుతుంది.",
      hi: "नागरिकों को सार्वजनिक प्राधिकरणों से जानकारी मांगने का अधिकार देता है, जिससे पारदर्शिता बढ़ती है।"
    },
    details: {
      en: [
        "Applies to All Public Authorities: Gram Panchayats, Municipal Offices, District Collectors, and State Departments.",
        "30-Day Response: Public Information Officer (PIO) must provide response within 30 days of application.",
        "Life and Liberty Priority: If info concerns life or liberty, it must be provided within 48 hours.",
        "Affordable Fee: Standard processing fee is just ₹10, and free for Below Poverty Line (BPL) card holders."
      ],
      te: [
        "అన్ని ప్రభుత్వ సంస్థలకు వర్తిస్తుంది: గ్రామ పంచాయతీలు, మున్సిపల్ కార్యాలయాలు, జిల్లా కలెక్టరేట్లు మరియు ప్రభుత్వ శాఖలు.",
        "30 రోజుల ప్రతిస్పందన: దరఖాస్తు చేసిన 30 రోజుల్లోగా పబ్లిక్ ఇన్ఫర్మేషన్ ఆఫీసర్ (PIO) సమాచారాన్ని అందించాలి.",
        "జీవితం మరియు స్వేచ్ఛకు ప్రాధాన్యత: సమాచారం ఒక వ్యక్తి ప్రాణం లేదా స్వేచ్ఛకు సంబంధించినదైతే, అది 48 గంటల్లోగా అందించాలి.",
        "తక్కువ రుసుము: సాధారణ దరఖాస్తు రుసుము కేవలం ₹10 మాత్రమే, మరియు దారిద్య్రరేఖకు దిగువన ఉన్నవారికి (BPL) ఉచితం."
      ],
      hi: [
        "सभी सरकारी कार्यालयों पर लागू: ग्राम पंचायतें, नगर पालिकाएं, जिला कलेक्ट्रेट और सरकारी विभाग।",
        "30 दिनों में जवाब: जन सूचना अधिकारी (PIO) को आवेदन के 30 दिनों के भीतर जानकारी देनी होगी।",
        "जीवन और स्वतंत्रता प्राथमिकता: यदि जानकारी किसी व्यक्ति के जीवन या स्वतंत्रता से संबंधित है, तो इसे 48 घंटों के भीतर प्रदान किया जाना चाहिए।",
        "सस्ती फीस: सामान्य आवेदन शुल्क केवल ₹10 है, और गरीबी रेखा से नीचे (BPL) के लोगों के लिए मुफ्त है।"
      ]
    }
  }
];

export const helplineNumbers: Helpline[] = [
  {
    name: { en: "Women Helpline (Telangana)", te: "మహిళల హెల్ప్‌లైన్ (తెలంగాణ)", hi: "महिला हेल्पलाइन (तेलंगाना)" },
    number: "181",
    desc: { en: "24/7 immediate support for women experiencing domestic violence, distress or abuse.", te: "గృహ హింస లేదా వేధింపుల బారిన పడిన మహిళలకు 24/7 తక్షణ సహాయం.", hi: "घरेलू हिंसा या उत्पीड़न की शिकार महिलाओं के लिए 24/7 तत्काल सहायता।" }
  },
  {
    name: { en: "Childline Support", te: "చైల్డ్‌లైన్ సపోర్ట్", hi: "चाइल्डलाइन सहायता" },
    number: "1098",
    desc: { en: "Emergency assistance for lost children, child labour, POCSO complaints, or abandoned infants.", te: "తప్పిపోయిన పిల్లలు, బాలకార్మికులు లేదా పోక్సో ఫిర్యాదుల కోసం అత్యవసర సహాయం.", hi: "खोए हुए बच्चों, बाल श्रम या पॉक्सो से संबंधित मामलों के लिए आपातकालीन सहायता।" }
  },
  {
    name: { en: "Elderly & Senior Citizens Helpline", te: "వృద్ధులు & సీనియర్ సిటిజన్ల హెల్ప్‌లైన్", hi: "बुजुर्ग एवं वरिष्ठ नागरिक हेल्पलाइन" },
    number: "14567",
    desc: { en: "National helpline providing legal advice, emotional support, and rescue for senior citizens.", te: "సీనియర్ సిటిజన్ల కోసం న్యाय సలహాలు, మానసిక మద్దతు మరియు రక్షణ అందించే జాతీయ హెల్ప్‌లైన్.", hi: "वरिष्ठ नागरिकों के लिए कानूनी सलाह, मानसिक सहायता और बचाव सेवाएं प्रदान करने वाली राष्ट्रीय हेल्पलाइन।" }
  },
  {
    name: { en: "Cyber Crime Cell National Portal", te: "సైబర్ క్రైమ్ సెల్ జాతీయ పోర్టల్", hi: "साइबर क्राइम सेल राष्ट्रीय पोर्टल" },
    number: "1930",
    desc: { en: "Report online fraud, identity theft, cyber bullying, harassment, and digital crimes instantly.", te: "ఆన్‌లైన్ మోసాలు, గుర్తింపు దొంగతనం మరియు సైబర్ వేధింపులపై తక్షణమే ఫిర్యాదు చేయండి.", hi: "ऑनलाइन धोखाधड़ी, पहचान चोरी और साइबर उत्पीड़न के खिलाफ तुरंत शिकायत दर्ज करें।" }
  },
  {
    name: { en: "National Human Rights Commission (NHRC)", te: "జాతీయ మానవ హక్కుల కమిషన్ (NHRC)", hi: "राष्ट्रीय मानवाधिकार आयोग (NHRC)" },
    number: "14433",
    desc: { en: "Direct contact line with NHRC for reporting grave human rights violations and illegal detentions.", te: "తీవ్రమైన మానవ హక్కుల ఉల్లంఘనలు మరియు చట్టవిరుద్ధ నిర్బంధాలపై ఫిర్యాదు చేయడానికి NHRCతో ప్రత్యక్ష సంప్రదింపు లైన్.", hi: "गंभीर मानवाधिकार उल्लंघनों और अवैध हिरासत की रिपोर्ट करने के लिए एनएचआरसी के साथ सीधा संपर्क।" }
  }
];

export const newsList: NewsItem[] = [
  {
    id: "news-1",
    date: "July 10, 2026",
    title: {
      en: "Human Rights Awareness Camp Held at Vikarabad Mandal Headquarters",
      te: "వికారాబాద్ మండల కేంద్రంలో మానవ హక్కుల అవగాహన సదస్సు నిర్వహణ",
      hi: "विकाराबाद मंडल मुख्यालय में मानवाधिकार जागरूकता शिविर आयोजित"
    },
    excerpt: {
      en: "President Srikanth Kavali presided over a massive awareness drive detailing free legal aid options and filing processes for local villagers.",
      te: "ఉచిత న్యాయ సహాయం మరియు ఫిర్యాదుల నమోదు ప్రక్రియపై గ్రామస్తులకు అవగాహన కల్పించే సదస్సుకు అధ్యక్షుడు శ్రీకాంత్ కావలి నాయకత్వం వహించారు.",
      hi: "अध्यक्ष श्रीकांत कवली ने स्थानीय ग्रामीणों के लिए मुफ्त कानूनी सहायता और शिकायत दर्ज करने की प्रक्रिया की जानकारी देने वाले शिविर की अध्यक्षता की।"
    }
  },
  {
    id: "news-2",
    date: "June 25, 2026",
    title: {
      en: "International Human Rights Vikarabad Intervenes to Resolve Women's Land Dispute",
      te: "మహిళల భూ వివాదం పరిష్కారంలో ఇంటర్నేషనల్ హ్యూమన్ రైట్స్ వికారాబాద్ జోక్యం",
      hi: "महिला भूमि विवाद को सुलझाने के लिए इंटरनेशनल ह्यूमन राइट्स विकाराबाद ने हस्तक्षेप किया"
    },
    excerpt: {
      en: "Through local mediation and coordinate effort with revenue officials, a senior widow secured legal title of her property.",
      te: "స్థానిక మధ్యవర్తిత్వం మరియు రెవెన్యూ అధికారులతో సమన్వయం ద్వారా ఒక వృద్ధ విధవరాలు తన ఆస్తిపై చట్టపరమైన హక్కులను సాధించుకున్నారు.",
      hi: "स्थानीय मध्यस्थता और राजस्व अधिकारियों के साथ समन्वय के माध्यम से, एक बुजुर्ग विधवा ने अपनी संपत्ति पर कानूनी अधिकार हासिल किया।"
    }
  }
];

export const eventsList: EventItem[] = [
  {
    id: "event-1",
    date: "July 26, 2026",
    time: "10:00 AM onwards",
    location: {
      en: "Yennepally Gram Panchayat, Vikarabad",
      te: "యెన్నేపల్లి గ్రామ పంచాయతీ, వికారాబాద్",
      hi: "येन्नेपल्ली ग्राम पंचायत, विकाराबाद"
    },
    title: {
      en: "Free Legal Assistance and Grievance Registration Camp",
      te: "ఉచిత న్యాయ సహాయం మరియు ఫిర్యాదుల నమోదు శిబిరం",
      hi: "निःशुल्क कानूनी सहायता और शिकायत पंजीकरण शिविर"
    },
    desc: {
      en: "Meet President Srikanth Kavali and our legal expert panel to register and process any active human rights violation cases for free.",
      te: "ఏదైనా చట్టవిరుద్ధ వేధింపులపై ఉచితంగా ఫిర్యాదు చేయడానికి మరియు సలహాలు పొందడానికి అధ్యక్షుడు శ్రీకాంత్ కావలి మరియు మా న్యాయ నిపుణుల బృందాన్ని కలవండి.",
      hi: "किसी भी मानवाधिकार उल्लंघन के मामले को मुफ्त में दर्ज करने और सलाह लेने के लिए अध्यक्ष श्रीकांत कवली और हमारे कानूनी विशेषज्ञों से मिलें।"
    }
  },
  {
    id: "event-2",
    date: "August 15, 2026",
    time: "09:00 AM",
    location: {
      en: "District Headquarters Office, Vikarabad",
      te: "జిల్లా ప్రధాన కార్యాలయం, వికారాబాద్",
      hi: "जिला मुख्यालय कार्यालय, विकाराबाद"
    },
    title: {
      en: "Independence Day Seminar: Constitutional Rights & Citizen Duties",
      te: "స్వాతంత్ర్య దినోత్సవ సదస్సు: రాజ్యాంగ హక్కులు & పౌరుల విధులు",
      hi: "स्वतंत्रता दिवस संगोष्ठी: संवैधानिक अधिकार और नागरिक कर्तव्य"
    },
    desc: {
      en: "An educational forum for students, advocates, and local leaders on expanding human dignity and local volunteering networks.",
      te: "విద్యార్థులు, న్యాయవాదులు మరియు స్థానిక పౌరుల కోసం రాజ్యాంగ బాధ్యతలపై ఒక ప్రత్యేక సదస్సు.",
      hi: "छात्रों, अधिवक्ताओं और स्थानीय नागरिकों के लिए संवैधानिक कर्तव्यों और मानवाधिकारों पर एक विशेष संगोष्ठी।"
    }
  }
];

export const successStories: SuccessStory[] = [
  {
    id: "success-1",
    title: {
      en: "Rescue of Forced Child Labourer from Commercial brick kiln",
      te: "ఇటుక బట్టీల నుండి బాలకార్మికుడికి విముక్తి",
      hi: "ईंट भट्ठे से जबरन बाल मजदूर का सफल बचाव"
    },
    description: {
      en: "Our organization received an anonymous complaint via the portal. President Srikanth Kavali coordinated with the Vikarabad police force and District Labour Commissioner to conduct a joint raid, rescuing a 12-year old child.",
      te: "మా పోర్టల్ ద్వారా అందిన అనామక ఫిర్యాదు ఆధారంగా, అధ్యక్షుడు శ్రీకాంత్ కావలి వికారాబాద్ పోలీసు బలగాలు మరియు జిల్లా లేబర్ కమిషనర్‌తో సమన్वయం చేసుకుని జరిపిన దాడిలో ఒక 12 ఏళ్ల బాలుడికి విముక్తి లభించింది.",
      hi: "हमारे पोर्टल पर मिली एक गुप्त शिकायत के आधार पर, अध्यक्ष श्रीकांत कवली ने विकाराबाद पुलिस बल और जिला श्रम आयुक्त के साथ समन्वय कर एक 12 वर्षीय बच्चे को मुक्त कराया।"
    },
    impact: {
      en: "The child has been enrolled in a government residential bridge school, and the owner fined under the Child Labour Act.",
      te: "పిల్లవాడిని ప్రభుత్వ వసతి పాఠశాలలో చేర్పించడం జరిగింది, మరియు యజమానికి బాలకార్మిక చట్టం కింద జరిమానా విధించబడింది.",
      hi: "बच्चे को सरकारी आवासीय विद्यालय में नामांकित कराया गया है और ईंट भट्ठा मालिक पर बाल श्रम अधिनियम के तहत जुर्माना लगाया गया।"
    }
  },
  {
    id: "success-2",
    title: {
      en: "Reinstatement of Elderly Pension Scheme for Neglected Widow",
      te: "వృద్ధురాలికి నిలిపివేసిన పెన్షన్ పథకం పునరుద్ధరణ",
      hi: "उपेक्षित वृद्ध विधवा के लिए वृद्धावस्था पेंशन योजना की बहाली"
    },
    description: {
      en: "An impoverished senior citizen in Vikarabad district had her government pension stopped due to clerical mapping errors. She filed a grievance through her grandson on our website. Our legal representatives petitioned the District Collector's office.",
      te: "వికారాబాద్ జిల్లాకు చెందిన ఒక వృద్ధురాలి ప్రభుత్వ పెన్షన్ సాంకేతిక లోపం వల్ల నిలిపివేయబడింది. మా వెబ్‌సైట్ ద్వారా ఆమె మనవడు ఫిర్యాదు సమర్పించగా, మా బృందం జిల్లా కలెక్టర్ కార్యాలయాన్ని సంప్రదించి విజ్ఞప్తి చేసింది.",
      hi: "विकाराबाद जिले की एक वृद्ध महिला की सरकारी पेंशन तकनीकी त्रुटि के कारण रोक दी गई थी। हमारे पोर्टल पर शिकायत मिलने के बाद, हमारी टीम ने जिला कलेक्टर कार्यालय से संपर्क कर आवश्यक कार्रवाई की।"
    },
    impact: {
      en: "Pension was restored retrospectively with arrear disbursements of ₹18,000 processed within two weeks.",
      te: "కేవలం రెండు వారాల్లోనే పెన్షన్ పునరుద్ధరించబడి ₹18,000 బకాయిలు ఆమెకు అందాయి.",
      hi: "केवल दो सप्ताह के भीतर पेंशन बहाल कर दी गई और ₹18,000 का बकाया भुगतान किया गया।"
    }
  }
];

export const downloadsList: DownloadFile[] = [
  {
    title: {
      en: "Standard Human Rights Complaint Offline Form (English)",
      te: "మానవ హక్కుల ఫిర్యాదు ఆఫ్‌లైన్ దరఖాస్తు ఫారం (ఇంగ్లీష్)",
      hi: "मानवाधिकार शिकायत ऑफलाइन आवेदन पत्र (अंग्रेजी)"
    },
    size: "245 KB",
    type: "PDF Document"
  },
  {
    title: {
      en: "Protection of Human Rights Act, 1993 Handbook",
      te: "మానవ హక్కుల పరిరక్షణ చట్టం, 1993 హ్యాండ్‌బుక్",
      hi: "मानवाधिकार संरक्षण अधिनियम, 1993 नियमावली"
    },
    size: "1.2 MB",
    type: "Official PDF"
  },
  {
    title: {
      en: "Universal Declaration of Human Rights (Bilingual Pamphlet)",
      te: "మానవ హక్కుల సార్వత్రిక ప్రకటన కరపత్రం (తెలుగు / ఇంగ్లీష్)",
      hi: "मानवाधिकारों की सार्वभौमिक घोषणा विवरणिका (हिंदी / अंग्रेजी)"
    },
    size: "680 KB",
    type: "Aesthetic Pamphlet"
  }
];

export const faqList: FAQItem[] = [
  {
    question: {
      en: "Who can register a complaint with International Human Rights – Vikarabad?",
      te: "ఇంటర్నేషనల్ హ్యూమన్ రైట్స్ – వికారాబాద్‌లో ఎవరు ఫిర్యాదు చేయవచ్చు?",
      hi: "इंटरनेशनल ह्यूमन राइट्स – विकाराबाद में कौन शिकायत दर्ज कर सकता है?"
    },
    answer: {
      en: "Any citizen who has suffered or witnessed a human rights violation (such as police brutality, discrimination, domestic exploitation, or denial of basic rights) in the Vikarabad district can file a complaint directly on our portal for free.",
      te: "వికారాబాద్ జిల్లాలో మానవ హక్కుల ఉల్లంఘనకు (పోలీస్ అక్రమాలు, వివక్ష, గృహ హింస లేదా ప్రాథమిక హక్కుల నిరాకరణ వంటివి) గురైన లేదా దానిని చూసిన ఏ పౌరుడైనా మా పోర్టల్‌లో ఉచితంగా ఫిర్యాదు చేయవచ్చు.",
      hi: "विकाराबाद जिले में मानवाधिकार उल्लंघन (जैसे पुलिस बर्बरता, भेदभाव, घरेलू शोषण, या बुनियादी अधिकारों से वंचित होना) के शिकार या गवाह बनने वाले कोई भी नागरिक हमारे पोर्टल पर मुफ्त में शिकायत दर्ज कर सकते हैं।"
    }
  },
  {
    question: {
      en: "Does International Human Rights – Vikarabad charge any legal fee?",
      te: "ఇంటర్నేషనల్ హ్యూమన్ రైట్స్ – వికారాబాద్ ఏదైనా న్యాయ రుసుము వసూలు చేస్తుందా?",
      hi: "क्या इंटरनेशनल ह्यूमन राइट्स – विकाराबाद कोई कानूनी शुल्क लेता है?"
    },
    answer: {
      en: "No. Our organization operates completely under volunteer support led by Srikanth Kavali. All consultations, legal awareness workshops, counseling, and complaint representations are provided absolutely free of charge to humanity.",
      te: "లేదు. మా సంస్థ శ్రీకాంత్ కావలి నేతృత్వంలో స్వచ్ఛంద మద్దతుతో నడుస్తోంది. అన్ని సంప్రదింపులు, అవగాహన సదస్సులు మరియు ఫిర్యాదుల పరిష్కారం మానవతా దృక్పథంతో ఉచితంగా అందించబడతాయి.",
      hi: "नहीं। हमारा संगठन श्रीकांत कवली के नेतृत्व में पूर्णतः स्वयंसेवकों के सहयोग से संचालित होता है। सभी परामर्श, जागरूकता शिविर और शिकायत निवारण सेवाएं पूरी तरह से निःशुल्क हैं।"
    }
  }
];

export const testimonialsList: Testimonial[] = [
  {
    author: "Ramesh Rathod",
    location: { en: "Yennepally village, Vikarabad", te: "యెన్నేపల్లి గ్రామం, వికారాబాద్", hi: "येन्नेपल्ली गाँव, विकाराबाद" },
    text: {
      en: "When we faced illegal discrimination from local elements, the President of International Human Rights Vikarabad visited us personally. Within days, our safety and social dignity were restored.",
      te: "మేము వివక్షను ఎదుర్కొన్నప్పుడు, ఇంటర్నేషనల్ హ్యూమన్ రైట్స్ వికారాబాద్ అధ్యక్షుడు స్వయంగా మమ్మల్ని సందర్శించారు. కొన్ని రోజుల్లోనే మా రక్షణ మరియు సామాజిక గౌరవం పునరుద్ధరించబడ్డాయి.",
      hi: "जब हमें स्थानीय तत्वों से भेदभाव का सामना करना पड़ा, तो इंटरनेशनल ह्यूमन राइट्स विकाराबाद के अध्यक्ष ने व्यक्तिगत रूप से हमसे मुलाकात की। कुछ ही दिनों में हमारी सुरक्षा बहाल हो गई।"
    }
  },
  {
    author: "K. Swaroopa",
    location: { en: "Vikarabad Town", te: "వికారాబాద్ టౌన్", hi: "विकाराबाद शहर" },
    text: {
      en: "As a distressed single mother, I had no guidance on domestic safety. The legal aid guidance of this organization provided me free counsel and protected me from harassment.",
      te: "ఒంటరి తల్లిగా, గృహ భద్రతపై నాకు ఎలాంటి మార్గదర్శకత్వం లేదు. ఈ సంస్థ యొక్క ఉచిత న్యాయ సహాయం నాకు ధైర్యాన్ని మరియు వేధింపుల నుండి రక్షణను ఇచ్చింది.",
      hi: "एक अकेली माँ के रूप में, मेरे पास सुरक्षा के लिए कोई मार्गदर्शन नहीं था। इस संगठन के कानूनी सहायता शिविर ने मुझे मुफ्त परामर्श दिया और मुझे उत्पीड़न से बचाया।"
    }
  }
];
