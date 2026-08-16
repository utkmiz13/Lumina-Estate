# 🏢 Lumina Estate — Enterprise Society Management Web App

[![PRD v2.0](https://img.shields.io/badge/PRD-v2.0-blue?style=for-the-badge&logo=document)](file:///Users/utkarshmishra13/Desktop/Lumina%20Estate/README.md)
[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Ready-22c55e?style=for-the-badge&logo=github)](file:///Users/utkarshmishra13/Desktop/Lumina%20Estate/deploy-to-github.sh)
[![Architecture](https://img.shields.io/badge/Architecture-100%25_Static-f59e0b?style=for-the-badge&logo=html5)](file:///Users/utkarshmishra13/Desktop/Lumina%20Estate/index.html)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-8b5cf6?style=for-the-badge&logo=pwa)](file:///Users/utkarshmishra13/Desktop/Lumina%20Estate/manifest.json)
[![Bilingual](https://img.shields.io/badge/Language-English_%7C_%E0%A4%B9%E0%A4%BF%E0%A4%82%E0%A4%A6%E0%A5%80-06b6d4)](file:///Users/utkarshmishra13/Desktop/Lumina%20Estate/i18n.js)

**Lumina Estate** is a production-grade, highly responsive frontend demonstration of a modern Gated Society & Community Management Platform, built according to **PRD v2.0**. Pre-loaded with demo data for **Green Valley Residency (Lucknow)**.

> ⚡ **Zero Backend & Zero Dependencies:** 100% Pure Static HTML5 / Modern Vanilla JS / CSS3. Works instantly in any browser — offline compatible, lightweight, mobile-first responsive layout, and fully GitHub Pages ready!

---

## 🌟 Key Highlights & Design Architecture

- 🎨 **Modern Glassmorphism UI System:** Dynamic Navy (`#1F3A5F`), Gold (`#C98A2D`), and Emerald accent design palette, smooth CSS custom properties, reactive state updates, and thumb-friendly mobile bottom-nav.
- 🌐 **Full English + Hindi Bilingual Engine:** Seamless language switcher (`js/i18n.js`) with 443+ translation keys covering all dialogs, modules, toasts, and receipts.
- ⚡ **1-Tap Role Account Switcher:** Fast-switch between **Admin**, **Owner**, **Tenant**, **Family Member**, **Security Guard**, and **Staff** accounts inside the running app.
- 📱 **PWA & Mobile Ready:** Web App Manifest included for "Add to Home Screen" installability. Includes camera-first mobile UI for security guards.
- 💾 **Client-Side Reactive Store (`localStorage`):** Persistent local state database (`lumina:v1`) with full reset, seed restoration, soft-delete, and immutable audit logs (DPDP Act aligned).

---

## 🚀 Quick Deployment & Running Guide

### Method 1: 1-Click Automated Scripts (Recommended)

Run the included automated deployer script in your terminal/command prompt:

- **Mac / Linux:**
  ```bash
  chmod +x deploy-to-github.sh
  ./deploy-to-github.sh
  ```
- **Windows:** Double click [`deploy-to-github.bat`](file:///Users/utkarshmishra13/Desktop/Lumina%20Estate/deploy-to-github.bat) or run in CMD:
  ```cmd
  deploy-to-github.bat
  ```

### Method 2: GitHub Web Upload (No Git Required)

1. Create a **New Public Repository** on [GitHub.com](https://github.com/new) named `lumina-estate` *(Do not add README)*.
2. Click **"uploading an existing file"**.
3. Upload all project files including `index.html`, `manifest.json`, `.nojekyll`, `css/`, `js/`, and `icons/`.
4. Click **Commit changes**.
5. Go to Repo **Settings** ➔ **Pages** ➔ Branch: `main` ➔ Folder: `/(root)` ➔ Click **Save**.
6. App will be live in ~60 seconds at `https://<your-username>.github.io/lumina-estate/`.

### Method 3: Direct Local Run

- **Option A:** Simply double click [`index.html`](file:///Users/utkarshmishra13/Desktop/Lumina%20Estate/index.html) or open it directly in Google Chrome, Safari, Firefox, or MS Edge.
- **Option B:** Open standalone all-in-one file [`lumina-estate-single-file.html`](file:///Users/utkarshmishra13/Desktop/Lumina%20Estate/lumina-estate-single-file.html) for zero-folder offline preview.

---

## 🔑 Demo Accounts (1-Tap Fast Login)

All demo personas are pre-configured on the login screen with 1-tap auto-fill capabilities:

| Persona Name | Role | Phone Number | Core Module Workflow to Test |
|---|---|---|---|
| **Col. A.K. Singh** | **Society Admin (Secretary)** | `9999000001` | Bill run wizard, defaulters list, notice targeting, complaint assignment, expenses, audit log |
| **Rajesh Verma** | **Flat Owner (A-304)** | `9999000002` | Pending bill & late fee payment, mock UPI checkout, visitor approvals, hall booking |
| **Priya Sharma** | **Tenant (B-201)** | `9999000003` | Badminton court booking, community complaints upvoting, community polls |
| **Ramesh Kumar** | **Security Guard** | `9999000004` | Camera-first visitor entry, passcode/QR verification, pending visitor exits |
| **Sunita Devi** | **Staff (Housekeeping)** | `9999000005` | Assigned maintenance complaints, "Work Started / Work Done" with photo proof |
| **Ritu Verma** | **Family Member (A-304)** | `9999000006` | Visitor approval notifications, notices & directory (read-only billing) |

> 💡 **Demo OTP:** Click **Send OTP** — the OTP screen displays the **Demo OTP** for 1-tap auto-fill. Any unknown 10-digit number triggers the **"Pending Approval"** workflow (approve via Col. Singh login ➔ Members tab).

---

## ✨ PRD v2.0 Feature Matrix & Implementation

| Module (PRD Spec) | Priority Status | Key Features Implemented in Demo |
|---|---|---|
| **9.1 Auth & Profiles** | ✅ **P0 (Complete)** | OTP authentication, onboarding approvals, multi-flat profiles, bilingual Hindi/English UI |
| **9.2 Role Dashboards** | ✅ **P0 (Complete)** | Tailored interfaces for Owner, Tenant, Family, Admin, Security Guard, and Maintenance Staff |
| **9.3 Billing & Payments** | ✅ **P0 (Complete)** | Automated monthly bill runs, penalty/late fees, mock UPI/Card payment checkout, downloadable PDF receipts |
| **9.4 Helpdesk & Complaints** | ✅ **P0 (Complete)** | Category tagging, photo attachment, SLA breach timers, staff assignment, photo proof, community upvotes |
| **9.5 Notices & Announcements** | ✅ **P0 (Complete)** | Audience targeting (All/Owners/Tenants), pinned notices, read receipts counter, event RSVP tracking |
| **9.6 Visitor Management (VMS)** | ✅ **P1 (Complete)** | Guard camera entry interface, real-time resident approval dialog, pre-approval passcodes, delivery mode, exits |
| **9.7 Facility Booking** | ✅ **P1 (Complete)** | Calendar slot selector (Clubhouse, Badminton Court), paid bookings, admin approval queue, conflict checker |
| **9.8 Directory & Emergency** | ✅ **P1 (Complete)** | Member & Managing Committee directory, privacy toggle (Hide Phone), 1-tap emergency hotline calling |
| **9.9 Document Vault** | ✅ **P1 (Complete)** | Folder organization (Bylaws, Financial Reports, AGM Minutes), access levels (All vs Committee-only) |
| **9.10 Financial Transparency** | ✅ **P1 (Complete)** | Expense voucher entry, monthly income vs expense analytics chart, downloadable financial summary |
| **9.11 Polls & Voting** | ✅ **P2 (Complete)** | One-flat-one-vote rule enforcement, secret ballot mode, real-time result percentage bars |
| **9.14 Emergency / SOS** | ✅ **P2 (Complete)** | Slide-to-SOS trigger ➔ Instant alert broadcast to Security Guard desk and Society Admin dashboard |
| **Audit & Governance** | ✅ **Cross-cutting** | Immutable audit log trail, DPDP data export (JSON), soft delete, reset demo state |

---

## 🛠️ Repository & Architecture Structure

```
Lumina Estate/
├── index.html                   # HTML5 App Shell (Modular script/stylesheet loader)
├── lumina-estate-single-file.html # Single-file standalone build (Inline CSS & JS)
├── manifest.json                # PWA manifest configuration for mobile installation
├── .nojekyll                    # Disables Jekyll processing on GitHub Pages
├── deploy-to-github.sh          # One-click deployment script for Mac & Linux
├── deploy-to-github.bat          # One-click deployment script for Windows
├── README.md                    # Project documentation & PRD overview
├── css/
│   └── styles.css               # Glassmorphism design system, CSS variables & print styles
├── js/
│   ├── i18n.js                  # Bilingual translation store (English & Hindi)
│   ├── seed.js                  # Pre-populated demo dataset (Green Valley Residency)
│   ├── store.js                 # State store engine, localStorage logic & calculations
│   ├── ui.js                    # UI component builders, camera simulator, toasts & modals
│   ├── views-resident.js        # Resident view controllers (Bills, Facilities, Complaints)
│   ├── views-admin.js           # Admin view controllers (Billing engine, Defaulters, Expenses)
│   ├── views-guard.js           # Security guard & Staff task controllers
│   └── app.js                   # Application router, auth listener & RBAC controller
└── icons/                       # App icons & favicon assets
```

---

## 💾 Local Storage & Data Privacy (DPDP Compliance)

- **State Management:** All application state is stored locally in your browser's `localStorage` under the key `lumina:v1`.
- **Data Reset:** Reset the application back to pristine demo state at any time via **Profile Menu ➔ Reset Demo Data**.
- **Privacy Design:** Aligned with DPDP Act principles — includes soft-deletion indicators, user data export capabilities, and an immutable action audit log.
- **Simulation Disclaimer:** Payment gateways, OTP generation, and SMS/WhatsApp notifications are **simulated** directly inside the browser for demo purposes.

---

## 💡 Pro Tips for Reviewers & Testers

1. 📱 **Mobile PWA Testing:** Open on iOS Safari or Android Chrome and select *"Add to Home Screen"* to view as a native-feeling mobile app.
2. 🔄 **End-to-End Visitor Workflow Test:** 
   - Open as **Rajesh Verma** (Owner) ➔ Create a Pre-Approved Visitor code.
   - Switch account to **Ramesh Kumar** (Guard) ➔ Enter the code on the Guard entry screen to instantly verify entry!
3. 📄 **Receipt Printing:** Click *"Print / Download Receipt"* on any paid bill to trigger the browser print dialog with formatted invoice layout.

---
*Built with ❤️ for Society Management Excellence · Document Version 2.0 · Date: August 2026*
