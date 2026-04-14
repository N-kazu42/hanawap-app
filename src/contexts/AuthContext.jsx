import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth } from '../firebase/auth'
import { db } from '../firebase/config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)       // undefined = 初期化中
  const [userDoc, setUserDoc] = useState(undefined)  // Firestoreのusersドキュメント

  useEffect(() => {
    return onAuthStateChanged(auth, firebaseUser => {
      setUser(firebaseUser)
      if (!firebaseUser) {
        setUserDoc(null)
      }
    })
  }, [])

  // ログイン中はFirestoreのユーザー情報をリアルタイム監視
  useEffect(() => {
    if (!user) return
    const ref = doc(db, 'users', user.uid)
    return onSnapshot(ref, snap => {
      setUserDoc(snap.exists() ? snap.data() : null)
    })
  }, [user])

  const loading = user === undefined || (user !== null && userDoc === undefined)
  const isApproved = userDoc?.status === 'approved'
  const isOwner = userDoc?.role === 'owner'
  const isPending = userDoc?.status === 'pending'

  return (
    <AuthContext.Provider value={{ user, userDoc, loading, isApproved, isOwner, isPending }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
