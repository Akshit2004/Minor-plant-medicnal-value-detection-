/**
 * Firebase Configuration for Plant Medicine Detection App
 */

// Firebase configuration object with your actual project settings
const firebaseConfig = {
  apiKey: "AIzaSyB78uOs4cHHGps791lwcwVUPZuclZG2k-E",
  authDomain: "pmvd-984e4.firebaseapp.com",
  projectId: "pmvd-984e4",
  storageBucket: "pmvd-984e4.firebasestorage.app",
  messagingSenderId: "405723657287",
  appId: "1:405723657287:web:c9d44cbbf48f9a5225ad62",
  measurementId: "G-4HZV4CCF9K"
};

// Initialize Firebase with compat version (matches the script imports in HTML)
firebase.initializeApp(firebaseConfig);

// Export commonly used Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const analytics = firebase.analytics();

// For easier debugging during development
if (window.location.hostname === "localhost") {
  console.log("Firebase initialized in development mode");
}
