# Attendance Tracker

A modern, minimalistic web app for tracking employee attendance — built with **Next.js**, **Firebase**, and **Tailwind CSS v4**.  
The app allows employees to **Clock in / Clock out** with a single click, and gives admins real-time visibility of attendance data.

---

## ✨ Features

### Employee
- 🔑 Google Sign-In (whitelisted emails only)
- 🕒 One **Clock in** + one **Clock out** per day (enforced by Firestore rules)
- ⏱ Auto-capture of timestamp + user email
- 📜 View personal attendance history

### Admin
- 📊 Real-time live view of today’s punches
- 📅 Day & Month reports
- 📥 Export data to CSV (daily / monthly)
- 👥 Manage employees (activate/deactivate, assign roles)

### UI
- 🎇 Particle background (tsParticles)
- ✅ Minimal clicks, clean dashboard cards
- 🔔 Confirmation prompt on Clock out
- 📌 “Coming soon” placeholder (Holidays calendar, Leave requests, Notice board)

---

## 🛠️ Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/):
  - Authentication (Google Sign-In)
  - Firestore (attendance records, employees)
  - Hosting

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/Viknight/attendance-tracker.git
cd attendance-tracker
```
2. Install dependencies
```bash
npm install
```
3. Set up Firebase
Create a Firebase project

Enable Authentication → Google Sign-In

Create Firestore collections:
```bash
employees/{email} -> { active: true, role: "employee" | "admin" }

attendance/{uid}/days/{YYYY-MM-DD}
```
punches/{auto-id}
Update Firestore Rules (see firestore.rules)

4. Add environment variables
Create .env.local:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=xxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxx
```

5. Run locally
```bash
npm run dev
```
6. Build & Export
```bash
npm run build
npm run export
```
7. Deploy
```bash
firebase deploy --only hosting
```

🔐 Firestore Rules Overview

Employees can only write their own punches (1 Clock in + 1 Clock out per day).

Admins can read all punches + manage employees.

Unauthorized emails are blocked immediately.
