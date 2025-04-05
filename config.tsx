import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, Firestore } from 'firebase/firestore/lite';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";



const firebaseConfig = {
    apiKey: "AIzaSyBQjxzW0dCKPcwUzEIEeUgdE6JtsfWnOBY",
    authDomain: "firstapp-3f01e.firebaseapp.com",
    projectId: "firstapp-3f01e",
    storageBucket: "firstapp-3f01e.firebasestorage.app",
    messagingSenderId: "410604243416",
    appId: "1:410604243416:web:1ed83a8f88d7669086caad"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getCities(db: Firestore) {
    const citiesCol = collection(db, 'cities');
    const citySnapshot = await getDocs(citiesCol);
    const cityList = citySnapshot.docs.map(doc => doc.data());
    return cityList;
}
const auth = getAuth(app);

async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
}
async function signOut() {
    await auth.signOut();
}
async function register(email: string, password: string) {
    await createUserWithEmailAndPassword(auth, email, password);
}

export { getCities, signIn, signOut, register,auth };