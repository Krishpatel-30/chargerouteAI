import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  Auth,
  User as FirebaseUser,
} from "firebase/auth";

// Firebase client configuration for ChargeRoute AI
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB3l6422OAEtn_7nATYOeyzWRjenApeVys",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "chargeroute-ai-2a7d7.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "chargeroute-ai-2a7d7",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "chargeroute-ai-2a7d7.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "570737859603",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:570737859603:web:2046ce315b968846b833e6",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-38FEW7JFXQ",
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  );
};

// Safe singleton Firebase App initialization
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (typeof window !== "undefined") {
  if (isFirebaseConfigured()) {
    try {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      auth = getAuth(app);
      googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: "select_account" });
    } catch (err) {
      console.warn("Failed to initialize Firebase Auth:", err);
    }
  }
}

export { app, auth, googleProvider };

/**
 * 1-Click Google Sign-In with official Google OAuth Popup via Firebase
 */
export async function signInWithGoogleFirebase(): Promise<{
  idToken: string;
  user: FirebaseUser;
}> {
  if (!auth || !googleProvider) {
    throw new Error(
      "Firebase is not yet configured. Please add your Firebase credentials in frontend/.env.local"
    );
  }
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  return { idToken, user: result.user };
}

/**
 * Sign In with Email & Password via Firebase
 */
export async function signInWithEmailFirebase(
  email: string,
  pass: string
): Promise<{ idToken: string; user: FirebaseUser }> {
  if (!auth) {
    throw new Error(
      "Firebase is not yet configured. Please add your Firebase credentials in frontend/.env.local"
    );
  }
  const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
  const idToken = await result.user.getIdToken();
  return { idToken, user: result.user };
}

/**
 * Create New Account with Email & Password via Firebase
 */
export async function signUpWithEmailFirebase(
  email: string,
  pass: string,
  displayName?: string
): Promise<{ idToken: string; user: FirebaseUser }> {
  if (!auth) {
    throw new Error(
      "Firebase is not yet configured. Please add your Firebase credentials in frontend/.env.local"
    );
  }
  const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (displayName && result.user) {
    await updateProfile(result.user, { displayName: displayName.trim() });
  }
  const idToken = await result.user.getIdToken();
  return { idToken, user: result.user };
}

/**
 * Sends official Google Firebase Password Reset email directly to user's inbox
 */
export async function sendPasswordResetFirebase(email: string): Promise<void> {
  if (!auth) {
    throw new Error(
      "Firebase is not yet configured. Please add your Firebase credentials in frontend/.env.local"
    );
  }
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Sign out of Firebase
 */
export async function logoutFirebase(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

