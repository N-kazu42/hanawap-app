import {
  initializeAuth, browserLocalPersistence, browserPopupRedirectResolver,
  GoogleAuthProvider, signInWithPopup, signOut,
  signInWithEmailAndPassword
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { app, db } from './config'

export const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver,
})
export const googleProvider = new GoogleAuthProvider()

// オーナーのメールアドレス（固定）
export const OWNER_EMAIL = 'shioatsupapakazuaki@gmail.com'

export function isOwner(user) {
  return user?.email === OWNER_EMAIL
}

// Firestoreにユーザードキュメントを作成（初回のみ）
export async function ensureUserDoc(user) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      photoURL: user.photoURL || null,
      status: user.email === OWNER_EMAIL ? 'approved' : 'pending',
      role: user.email === OWNER_EMAIL ? 'owner' : 'member',
      createdAt: serverTimestamp(),
      approvedAt: user.email === OWNER_EMAIL ? serverTimestamp() : null,
    })
  }
}

// Googleでサインイン（ポップアップ方式）
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  await ensureUserDoc(result.user)
  return result.user
}

// メール＋パスワードでログイン
export async function signInWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password)
  await ensureUserDoc(result.user)
  return result.user
}


export async function signOutUser() {
  await signOut(auth)
}

// ユーザーの承認状態を取得
export async function getUserStatus(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}
