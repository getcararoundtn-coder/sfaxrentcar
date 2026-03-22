import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';

// 🔥 Firebase configuration - من Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCuQ3akuKXwEOoOEGrCmZmcrPIE4L_uhnY",
  authDomain: "drivetunisiaa.firebaseapp.com",
  projectId: "drivetunisiaa",
  storageBucket: "drivetunisiaa.firebasestorage.app",
  messagingSenderId: "791279410732",
  appId: "1:791279410732:web:d59138b85193308931bb89",
  measurementId: "G-NG3Z7JC712"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// تسجيل الدخول بالبريد الإلكتروني وكلمة المرور
export const loginWithEmail = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// تسجيل حساب جديد بالبريد الإلكتروني وكلمة المرور
export const registerWithEmail = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

// تسجيل الدخول بحساب Google
export const loginWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};

// إعادة تعيين كلمة المرور عبر Firebase
export const resetPasswordFirebase = async (email) => {
  return await sendPasswordResetEmail(auth, email);
};

// تسجيل الخروج من Firebase
export const logoutFirebase = async () => {
  return await signOut(auth);
};

export default app;