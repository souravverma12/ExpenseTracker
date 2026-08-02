# ApexFinance - Personal Finance & Expense Tracker

ApexFinance is a premium, high-performance, and feature-rich Personal Finance & Expense Tracker designed for individual use. It features a modern, clean, glassmorphic layout inspired by Stripe, Vercel, and Linear, and supports light/dark themes, multi-currency display, interactive charts, and an offline-first storage engine that syncs seamlessly to the cloud upon user login.

---

## 🚀 Key Features

*   **Executive Dashboard**: Comprehensive widgets tracking Today's/Weekly/Monthly/Yearly expenses, Monthly Income, Balance, Savings, and remaining Budget limits.
*   **Ledger & Transaction Manager**: Add, edit, and delete entries with optional notes, transaction category, payment method (Cash, Credit Card, Debit Card, UPI, PayPal, Bank Transfer), date, and time. Features search, multi-field filters, and sorting.
*   **Flexible Hybrid Storage Layer**: Works out-of-the-box locally using **IndexedDB** (offline-first). When logged in, it syncs securely with **Cloud Firestore** under the user's Firebase UID.
*   **One-Time Data Cloud Migration**: Logs local transactions and custom categories directly to the cloud on first Google Sign-In with confirmation prompts.
*   **Budgeting System**: Define weekly, monthly, and yearly budget limits with animated Framer Motion progress bars and velocity alert statuses.
*   **Financial Health & Insights**: Evaluates budget status and computes an automated 0-100 Financial Health Score with smart actionable insights.
*   **Interactive Calendar**: Month-view grid highlighting expense activity days. Click any date to inspect, edit, or enter entries.
*   **Advanced Analytics Charts**: Recharts-powered graphs analyzing Weekly Spending Breakdown and Income vs. Expenses (6-month comparison).
*   **Settings & Backups**: Dynamic Dark/Light mode theme switch, multiple currency support, CSV export, and full JSON backup exports & imports.

---

## 🛠️ Tech Stack

*   **Frontend Framework**: React 18 + Vite + TypeScript
*   **Styling**: Tailwind CSS v4 + Framer Motion (animations)
*   **Icons**: Lucide React
*   **Local Storage**: Dexie.js (IndexedDB wrapper)
*   **Cloud Backend**: Firebase Authentication (Google Sign-In) + Cloud Firestore
*   **Charts**: Recharts
*   **Date Calculations**: date-fns

---

## 💻 Running Locally

### 1. Prerequisite Installations
Make sure you have Node.js (version 18+) and npm installed on your system.

### 2. Install Dependencies
In the project root directory, install all required dependencies:
```bash
npm install
```

### 3. Setup Firebase Keys (Optional for Cloud Sync)
Create a `.env` file in the root directory and add your Firebase configurations:
```bash
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```
*(If no `.env` file exists, the application falls back to offline-only mode automatically).*

### 4. Run Development Server
Start the local server:
```bash
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

### 5. Build for Production
To bundle and compile the application for deployment:
```bash
npm run build
```
The optimized bundle will be compiled into the `dist/` directory.

---

## 🔒 Security Rules (firestore.rules)
Production rules are configured to restrict user document read/writes to their own authenticated UIDs:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && (resource == null || resource.data.uid == request.auth.uid || request.resource.data.uid == request.auth.uid);
    }
    match /categories/{categoryId} {
      allow read: if request.auth != null && (resource.data.uid == 'system' || resource.data.uid == request.auth.uid);
      allow write: if request.auth != null && (request.resource.data.uid == request.auth.uid || resource.data.uid == request.auth.uid);
    }
    match /budgets/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /settings/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
