// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBemi9tNOga6LsmXiBg8TtUq3a7xblAEXs",
  authDomain: "greenmonster-c6889.firebaseapp.com",
  projectId: "greenmonster-c6889",
  storageBucket: "greenmonster-c6889.firebasestorage.app",
  messagingSenderId: "379256905438",
  appId: "1:379256905438:web:d420e02359e407d3546c4f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const db = getFirestore(app);