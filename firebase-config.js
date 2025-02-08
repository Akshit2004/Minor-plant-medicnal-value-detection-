import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    GithubAuthProvider 
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCL1Yj-D4RxAiiHWL9V4-nn0COiSnlkhhc",
    authDomain: "pmvd-cb8e8.firebaseapp.com",
    projectId: "pmvd-cb8e8",
    storageBucket: "pmvd-cb8e8.firebasestorage.app",
    messagingSenderId: "215614631261",
    appId: "1:215614631261:web:89e0edeb19e5a5c141ccb4",
    measurementId: "G-FTP0H4H131"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();