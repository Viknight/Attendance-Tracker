import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
}

// Guard: throw helpful error if any value is missing
for (const [k, v] of Object.entries(firebaseConfig)) {
    if (!v) {
        throw new Error(
            `Missing Firebase env: ${k}. Did you create .env.local in project root and restart dev server?`
        )
    }
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
export const db = getFirestore(app)
