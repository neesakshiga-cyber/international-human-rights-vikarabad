# Security Specification & Threat Model - International Human Rights Vikarabad

This document outlines the security invariants, threat models, and malicious "Dirty Dozen" payloads used to test and audit our Firestore Security Rules for the International Human Rights website.

## 1. Core Data Invariants

1. **Identity Isolation (Users)**: A user's profile under `users/{userId}` can only be written to by the authenticated user themselves (where `userId == request.auth.uid`).
2. **Temporal Integrity**: Fields like `createdAt` and `updatedAt` must be synchronized with `request.time` on writes.
3. **Key Safety & Schema Validation**:
   - Every entity creation must have all required fields.
   - Field sizes must be bounded (e.g., Complaint description < 10000 chars, title < 150 chars).
   - Document ID references must be validated to prevent ID injection attacks (`isValidId`).
4. **Action-Based Fields & Immutability**:
   - `createdAt` is immutable.
   - Only authenticated users can file complaints, and they can only view, edit and track their own complaints (`resource.data.userId == request.auth.uid`).
   - Admins can view, edit, update, delete, and add remarks to any complaint.
   - Users cannot self-assign remarks or change status values after submission.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following 12 payloads represent attacks on Identity, Integrity, State, and Volume. They MUST be blocked with `PERMISSION_DENIED`.

### Payload 1: Profile Hijacking (Identity)
- **Path**: `users/user_alice`
- **Actor**: `user_bob` (authenticated)
- **Payload**:
  ```json
  {
    "userId": "user_alice",
    "email": "alice@gmail.com",
    "displayName": "Alice (Hacked)",
    "lastSeen": "2026-07-12T08:00:00Z"
  }
  ```
- **Reason**: Bob is trying to write to Alice's profile.

### Payload 2: Profile Ghost Field Insertion (Integrity)
- **Path**: `users/user_alice`
- **Actor**: `user_alice` (authenticated)
- **Payload**:
  ```json
  {
    "userId": "user_alice",
    "email": "alice@gmail.com",
    "displayName": "Alice",
    "lastSeen": "2026-07-12T08:00:00Z",
    "isSystemAdmin": true
  }
  ```
- **Reason**: Alice is trying to write an un-blueprint-declared field (`isSystemAdmin`) to inject elevated roles.

### Payload 3: Complaint Hijacking (Identity)
- **Path**: `complaints/comp_alice`
- **Actor**: `user_bob` (authenticated)
- **Payload**:
  ```json
  {
    "complaintId": "comp_alice",
    "userId": "user_alice",
    "userName": "Alice",
    "userEmail": "alice@gmail.com",
    "title": "Unfair Arrest Inquiry",
    "category": "Legal Aid",
    "description": "Legitimate grievance content",
    "status": "submitted",
    "createdAt": "request.time",
    "updatedAt": "request.time"
  }
  ```
- **Reason**: Bob (the caller) is trying to submit a complaint under Alice's `userId`. The owner field must match the creator.

### Payload 4: Complaint Overly Long Title (Volume / Denial of Wallet)
- **Path**: `complaints/comp_123`
- **Actor**: `user_alice` (authenticated)
- **Payload**:
  ```json
  {
    "complaintId": "comp_123",
    "userId": "user_alice",
    "userName": "Alice",
    "userEmail": "alice@gmail.com",
    "title": "[151 character long string of A's...]",
    "category": "Legal Aid",
    "description": "Valid content",
    "status": "submitted",
    "createdAt": "request.time",
    "updatedAt": "request.time"
  }
  ```
- **Reason**: Complaint title is strictly limited to 150 characters.

### Payload 5: Complaint Overly Long Content (Volume / Denial of Wallet)
- **Path**: `complaints/comp_123`
- **Actor**: `user_alice` (authenticated)
- **Payload**:
  ```json
  {
    "complaintId": "comp_123",
    "userId": "user_alice",
    "userName": "Alice",
    "userEmail": "alice@gmail.com",
    "title": "A Fine Title",
    "category": "Legal Aid",
    "description": "[10001 character long string of B's...]",
    "status": "submitted",
    "createdAt": "request.time",
    "updatedAt": "request.time"
  }
  ```
- **Reason**: Complaint description is strictly limited to 10000 characters.

### Payload 6: User Tries to Update Complaint Status Directly (Privilege Escalation)
- **Path**: `complaints/comp_123`
- **Actor**: `user_alice` (authenticated, non-admin)
- **Payload**:
  ```json
  {
    "complaintId": "comp_123",
    "userId": "user_alice",
    "userName": "Alice",
    "userEmail": "alice@gmail.com",
    "title": "Valid Title",
    "category": "Legal Aid",
    "description": "Valid description",
    "status": "resolved",
    "createdAt": "2026-07-12T08:00:00Z",
    "updatedAt": "request.time"
  }
  ```
- **Reason**: Only designated administrators can change status values or write admin remarks.

### Payload 7: User Tries to Write Admin Remarks Directly (Privilege Escalation)
- **Path**: `complaints/comp_123`
- **Actor**: `user_alice` (authenticated, non-admin)
- **Payload**:
  ```json
  {
    "complaintId": "comp_123",
    "userId": "user_alice",
    "userName": "Alice",
    "userEmail": "alice@gmail.com",
    "title": "Valid Title",
    "category": "Legal Aid",
    "description": "Valid description",
    "status": "submitted",
    "adminRemarks": "I am approving my own complaint",
    "createdAt": "2026-07-12T08:00:00Z",
    "updatedAt": "request.time"
  }
  ```
- **Reason**: Non-admin users cannot write or edit the `adminRemarks` field.

### Payload 8: Membership Creation Under Other User UID (Identity Spoofing)
- **Path**: `memberships/member_abc`
- **Actor**: `user_alice` (authenticated)
- **Payload**:
  ```json
  {
    "membershipId": "member_abc",
    "userId": "user_bob",
    "fullName": "Bob Ross",
    "phone": "+919999999999",
    "address": "Hyderabad, India",
    "category": "Standard Member",
    "status": "pending",
    "createdAt": "request.time"
  }
  ```
- **Reason**: User Alice is trying to register a membership on behalf of User Bob. `userId` must equal the writer's auth UID.

### Payload 9: Membership Custom Invalid Status (State Bypass)
- **Path**: `memberships/member_abc`
- **Actor**: `user_alice` (authenticated)
- **Payload**:
  ```json
  {
    "membershipId": "member_abc",
    "userId": "user_alice",
    "fullName": "Alice Smith",
    "phone": "+919999999999",
    "address": "Vikarabad, India",
    "category": "Standard Member",
    "status": "approved",
    "createdAt": "request.time"
  }
  ```
- **Reason**: Newly created memberships must strictly have the state `'pending'`. Users cannot auto-approve themselves.

### Payload 10: Membership Unauthorized Status Change (Privilege Escalation)
- **Path**: `memberships/member_abc`
- **Actor**: `user_alice` (authenticated, non-admin)
- **Payload**:
  ```json
  {
    "membershipId": "member_abc",
    "userId": "user_alice",
    "fullName": "Alice Smith",
    "phone": "+919999999999",
    "address": "Vikarabad, India",
    "category": "Standard Member",
    "status": "approved",
    "createdAt": "2026-07-12T08:00:00Z"
  }
  ```
- **Reason**: Only admins can change a membership status from `'pending'` to `'approved'` or `'rejected'`.

### Payload 11: Membership Overly Long Phone (Volume / Constraint)
- **Path**: `memberships/member_abc`
- **Actor**: `user_alice` (authenticated)
- **Payload**:
  ```json
  {
    "membershipId": "member_abc",
    "userId": "user_alice",
    "fullName": "Alice Smith",
    "phone": "+123456789012345678901",
    "address": "Vikarabad, India",
    "category": "Standard Member",
    "status": "pending",
    "createdAt": "request.time"
  }
  ```
- **Reason**: Contact numbers must be strictly <= 20 characters.

### Payload 12: Invalid Path Injection / Poisoning (Path Hardening)
- **Path**: `complaints/comp_☠️_injected_hacker_string_longer_than_128_chars_xxxxxxxxx`
- **Actor**: `user_alice` (authenticated)
- **Payload**:
  ```json
  {
    "complaintId": "comp_☠️_injected_hacker_string_longer_than_128_chars_xxxxxxxxx",
    "userId": "user_alice",
    "userName": "Alice",
    "userEmail": "alice@gmail.com",
    "title": "Valid Title",
    "category": "Legal Aid",
    "description": "Valid description",
    "status": "submitted",
    "createdAt": "request.time",
    "updatedAt": "request.time"
  }
  ```
- **Reason**: Unsafe characters and size boundaries are violated by the injected ID.
