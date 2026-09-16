# Stocks — Deploy Guide

Step-by-step instructions to connect Firebase and publish the app live.

---

## Step 1 — Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → enter a name (e.g. `stocks-panels`) → continue
3. Disable Google Analytics (not needed) → **Create project**

---

## Step 2 — Enable Firestore

1. In your Firebase project, open **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** (the `firestore.rules` file in this repo will handle access)
4. Pick a region close to you (e.g. `asia-south1` for India) → **Enable**

---

## Step 3 — Enable Authentication

1. Open **Build → Authentication** → **Get started**
2. Go to the **Sign-in method** tab
3. Enable **Email/Password** → **Save**
4. Go to the **Users** tab → **Add user**
5. Enter the email and password for every admin who should have access
   - ⚠️ Only add people who should be able to edit stock data

---

## Step 4 — Get Your Firebase Config

1. In the Firebase console, click the **gear icon ⚙️** → **Project settings**
2. Scroll to **Your apps** → click **Add app** → choose **Web** `</>`
3. Give it a nickname (e.g. `stocks-web`) → **Register app**
4. Copy the `firebaseConfig` object — it looks like:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "stocks-panels.firebaseapp.com",
  projectId: "stocks-panels",
  storageBucket: "stocks-panels.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};
```

---

## Step 5 — Add Config to the App

Open `src/firebase.js` and replace:

```js
const FIREBASE_CONFIG = null;
```

With your actual config:

```js
const FIREBASE_CONFIG = {
  apiKey: "AIza...",
  authDomain: "stocks-panels.firebaseapp.com",
  projectId: "stocks-panels",
  storageBucket: "stocks-panels.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};
```

---

## Step 6 — Deploy Firestore Rules

```bash
# Install Firebase CLI if you haven't already
npm install -g firebase-tools

# Log in
firebase login

# Initialise (choose Firestore only; select your project)
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules
```

---

## Step 7 — Build & Deploy the App

### Option A — Netlify (recommended)

```bash
npm run build
```

Then drag the `dist/` folder onto [netlify.com/drop](https://app.netlify.com/drop).

Or connect the GitHub repo for automatic redeploys on every push:
1. Push this folder to a GitHub repo
2. On Netlify: **Add new site → Import an existing project → GitHub**
3. Build command: `npm run build`  
   Publish directory: `dist`

### Option B — Vercel

```bash
npm install -g vercel
npm run build
vercel --prod
```

---

## Step 8 — Future Updates

Whenever you make a code change:

```bash
npm run build
```

Then redeploy the new `dist/` folder to Netlify or Vercel (or just push to GitHub if you have automatic deploys set up).

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| "Permission denied" errors in the browser console | Firestore rules haven't been deployed, or the user isn't signed in |
| App shows blank page | Check the browser console for errors; likely a missing or wrong Firebase config |
| "auth/invalid-credential" on login | Wrong email or password; reset from Firebase console → Authentication → Users |
| Data not syncing across devices | Check internet connection; Firestore offline cache will sync when connectivity returns |
