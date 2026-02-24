# Baby Tracker

Shared log for baby food, poop, and pee. Hebrew RTL PWA with Firebase Auth and Firestore.

## Setup

**The Firebase CLI (`firebase login`) is only for deploying.** It does not give your app the API key. The web app config (apiKey, etc.) must be copied from the Firebase Console into `.env` as below.

1. **Get your web config (fixes `auth/invalid-api-key`):**
   - Open [Firebase Console](https://console.firebase.google.com/) and select your project (or create one).
   - Click the gear icon > **Project settings** > **General**.
   - Under **Your apps**, if you have no web app yet: click **Add app** > **Web** (</>), register a nickname, then you get a config object.
   - Copy each value from that config into your `.env` (see `.env.example`). The keys are: `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`.
2. Copy `.env.example` to `.env` and paste the values from step 1.
3. Enable **Email/Password** sign-in: Firebase Console > **Authentication** > **Sign-in method** > enable **Email/Password**.
4. Create a **Firestore** database if needed: **Build** > **Firestore** > **Create database**. Deploy rules: `firebase deploy --only firestore:rules`
5. (Optional) For history filter by type, create a composite index when Firestore prompts (collection `entries`, `type` Ascending, `timestamp` Descending).

## Run

- Dev: `npm run dev`
- Build: `npm run build`
- Deploy: Install Firebase CLI, then `firebase login` and link the project (`firebase use <project-id>` or `firebase init` and choose Hosting + Firestore). Run `npm run build` then `firebase deploy`. Share the hosting URL with your partner; both sign up and see the same entries in real time.
