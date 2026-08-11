import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDig8y6fJRjFJ_1TRjnx7DmeodBd60MZFU",
    authDomain: "genzdail.firebaseapp.com",
    projectId: "genzdail",
    storageBucket: "genzdail.firebasestorage.app",
    messagingSenderId: "601833946848",
    appId: "1:601833946848:web:62b6f779e13bbbcbd11a85",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;