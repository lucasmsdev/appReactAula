// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyAPowotgezWeed9jXk6EH4AVNm18fV-1L4",
	authDomain: "auth-firebase-projeto-au-a59c3.firebaseapp.com",
	projectId: "auth-firebase-projeto-au-a59c3",
	storageBucket: "auth-firebase-projeto-au-a59c3.appspot.com",
	messagingSenderId: "750010134137",
	appId: "1:750010134137:web:5e14b2276667b3a38deea8",
	measurementId: "G-558XNVMMJK",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage, ref, getDownloadURL };
