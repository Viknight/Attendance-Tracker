import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyBtHg1-a20Tgn8DLtVQ_3wQDuzqWByVPVg",
    authDomain: "employee-portal-cosmo-trace.firebaseapp.com",
    projectId: "employee-portal-cosmo-trace",
    storageBucket: "employee-portal-cosmo-trace.firebasestorage.app",
    messagingSenderId: "283066633057",
    appId: "1:283066633057:web:6eac992d6ad56c383ed320",
    measurementId: "G-1C45C89CQH"
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
