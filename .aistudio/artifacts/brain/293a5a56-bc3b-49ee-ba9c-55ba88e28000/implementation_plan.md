# Single-Device Session Enforcement & Admin-Controlled Student Management

A focused security, access control, and user interface update for AIR Practice Institute that streamlines the login flow, conceals administrative credentials, enforces strict single-device active sessions across phones, laptops, and tablets, and transitions student registration exclusively into the Administrator Dashboard.

> [!IMPORTANT]
> **Key Architectural Alignments**:
> - **Unified Clean Login**: The header and mobile frames display a clean **LOGIN** button instead of "Student Login". The modal offers a unified login form where entering either student or admin credentials routes the user directly to their respective portal, without exposing or pre-filling any administrator or demo credentials.
> - **Zero Student Self-Registration**: Public student self-registration tabs and forms are completely removed from the login modal. The public `/api/auth/signup` endpoint is locked to prevent direct public account generation.
> - **Admin Student Creator**: A dedicated "Register New Student" interface is integrated inside the Admin Dashboard under the Students directory. Administrators can generate credentials, auto-generate or specify secure passwords, and dispatch official onboarding welcome emails with login details via Gmail SMTP.
> - **Strict Real-Time Single-Device Invalidation**: When an account logs in on any second device (mobile phone, laptop, or tablet), the database immediately updates the active session identifier. The previous device's active session is terminated, triggering an immediate `SessionTerminatedModal` alert explaining the policy and offering a direct re-login button.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. Simplifies authentication entry points by replacing "STUDENT LOGIN" with an institutional "LOGIN" button across desktop and mobile simulator headers.
  2. Protects sensitive portal credentials by removing visible admin login IDs, passwords, and demo credentials boxes from the login modal.
  3. Restricts student account creation so only verified institute administrators can enroll students and dispatch their credentials.
  4. Enforces a strict 1-active-device-per-account policy with immediate session termination and prominent alert dialogs on superseded devices.
- **Target Audience**: Students preparing for 12th Maharashtra State Board & MHT-CET (who access the portal from a single personal device) and Institute Administrators (who govern admissions, curriculum PDFs, and test analytics).

---

## 2. User Experience & Visual Design

### Unified Login Flow
- **Header Button**: Clean `LOGIN` button styled with institutional contrast (`bg-white text-[#082f73] hover:bg-cyan-50 font-bold`).
- **Login Modal**:
  - Displays empty, focused input fields for **Login ID / Email** and **Password**.
  - No credential badges, hardcoded default values, or exposed admin passwords.
  - Automatically identifies user role upon authentication and smoothly routes administrators to the Admin Console and students to their personalized preparation dashboard.
  - Informational footnote informing students: *"Student accounts are issued directly by the Institute Administrator. If you need credentials, please contact the institute office."*

### Admin Student Management Center
- **Admin Dashboard > Students Directory**:
  - Features an intuitive **+ Register New Student** modal trigger.
  - Form fields: Full Name, Student Email (for credentials delivery), Mobile Number (optional), Target Exam, and Password options (Admin-specified or 1-click Auto-Generate).
  - Instant dispatch of official onboarding emails from `airpracticeinstitute@gmail.com` with login instructions and credential cards.

### Single-Device Policy Enforcement Dialog
- **Real-Time Detection**:
  - Heartbeat checks (`/api/auth/session-check`) run every 5 seconds and whenever the browser tab or app regains focus.
  - Same-browser tab synchronization via `BroadcastChannel('air_device_session')` ensures instant detection even across duplicate tabs or windows.
- **Termination Modal (`SessionTerminatedModal`)**:
  - Mounted directly in the application root (`App.tsx` and `MobileAppFrame.tsx`).
  - Highlights amber warning badge, device category, timestamp of the superseded login, and a direct action to **Log In On This Device Instead**.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Unified Login Screen vs. Tabs**:
  - *Chosen Approach*: A single, seamless Login form with auto-detection of Student vs. Admin privileges upon verification.
  - *Why*: Eliminates confusion, removes explicit "Admin" labels on public surfaces, and prevents inadvertent leakage of administrative credentials.
- **Decision 2: Administrative Student Creation & Credential Delivery**:
  - *Chosen Approach*: Admin creates students in the dashboard; backend generates unique `AIRxxxxx` Student IDs and dispatches rich welcome onboarding emails via existing Gmail SMTP credentials.
  - *Why*: Meets the institutional requirement where self-registration is disabled, ensuring enrolled student lists remain authentic and strictly administered.
- **Decision 3: Multi-Layered Single-Device Detection**:
  - *Chosen Approach*: Server-authoritative JWT `sessionId` validation in `authMiddleware` + periodic client heartbeat + tab focus trigger + `BroadcastChannel`.
  - *Why*: Provides near-instantaneous logout on superseded devices without needing heavy persistent WebSocket servers.

---

## 4. Technical Architecture & Component Mapping

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AIR PRACTICE INSTITUTE                          │
├──────────────────────────────────┬─────────────────────────────────────┤
│  Client Components               │  Backend API & State Engine         │
│                                  │                                     │
│  [Header.tsx]                    │  [authRoutes.ts]                    │
│   └─ "LOGIN" button              │   ├─ POST /api/auth/login           │
│                                  │   │   └─ Generates new sessionId    │
│  [LoginModal.tsx]                │   ├─ GET /api/auth/session-check    │
│   ├─ Clean inputs (no creds)     │   │   └─ Verifies sole active token │
│   └─ Disables self-signup        │   └─ POST /api/auth/signup (locked) │
│                                  │                                     │
│  [SessionTerminatedModal.tsx]    │  [authMiddleware.ts]                │
│   └─ Mounted in App.tsx          │   └─ 401 SESSION_TERMINATED         │
│                                  │                                     │
│  [AdminDashboard.tsx]            │  [adminRoutes.ts & db.ts]           │
│   └─ "+ Register Student" Modal  │   ├─ POST /api/admin/students       │
│                                  │   ├─ DELETE /api/admin/students/:id │
│                                  │   └─ Dispatches Gmail onboarding    │
└──────────────────────────────────┴─────────────────────────────────────┘
```

### Verification & Testing Plan
1. **Login Interface**: Verify the header button says "LOGIN" and the login dialog has zero pre-filled admin credentials or credential hint boxes.
2. **Student Self-Signup Removal**: Ensure no public registration button exists on login; calling `/api/auth/signup` publicly returns a clear 403 error.
3. **Admin Student Creation**: As Admin, create a new student with name, email, and target exam; confirm student is created in the directory and welcome email is sent.
4. **Single-Device Enforcement**: Log in as student on Browser/Window A; log in as same student on Browser/Window B; verify Browser/Window A immediately invalidates, shows `SessionTerminatedModal`, and logs out.
