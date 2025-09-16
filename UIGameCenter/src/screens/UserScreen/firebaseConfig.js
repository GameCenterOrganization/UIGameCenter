// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAYVvgg6dOPdZYFXCyyVN9XpQhzvzXNO3s",
  authDomain: "gamecenter-auth-f4299.firebaseapp.com",
  projectId: "gamecenter-auth-f4299",
  storageBucket: "gamecenter-auth-f4299.firebasestorage.app",
  messagingSenderId: "240212197959",
  appId: "1:240212197959:web:80e93b2ddac711eb7ba762",
  measurementId: "G-WY8GY6GMBF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
const analytics = getAnalytics(app);