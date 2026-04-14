import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBz8zg3R_SKTKSkBKfrL7qvqzmUz0Df6Co",
  authDomain: "hanawap-app.firebaseapp.com",
  projectId: "hanawap-app",
  storageBucket: "hanawap-app.firebasestorage.app",
  messagingSenderId: "1008304257929",
  appId: "1:1008304257929:web:5d11bbdf8070a3ea1f3f58"
}

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// メンバー定義（固定）
export const MEMBERS = [
  { id: 'waki',      name: '脇',    color: '#3B82F6', bg: '#DBEAFE' },
  { id: 'nagai',     name: '長井',  color: '#F97316', bg: '#FFEDD5' },
  { id: 'hasegawa',  name: '長谷川', color: '#22C55E', bg: '#DCFCE7' },
]
