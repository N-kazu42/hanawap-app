import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../contexts/AuthContext'
import { signOutUser } from '../../firebase/auth'
import { Check, X, LogOut, Shield } from 'lucide-react'

export default function AdminPanel() {
  const { user, userDoc } = useAuth()
  const [pendingUsers, setPendingUsers] = useState([])
  const [approvedUsers, setApprovedUsers] = useState([])
  const [tab, setTab] = useState('pending')

  useEffect(() => {
    const pendingQ = query(collection(db, 'users'), where('status', '==', 'pending'))
    const unsubPending = onSnapshot(pendingQ, snap => {
      setPendingUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })

    const approvedQ = query(collection(db, 'users'), where('status', '==', 'approved'))
    const unsubApproved = onSnapshot(approvedQ, snap => {
      setApprovedUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })

    return () => { unsubPending(); unsubApproved() }
  }, [])

  async function approveUser(uid) {
    await updateDoc(doc(db, 'users', uid), {
      status: 'approved',
      approvedAt: serverTimestamp(),
    })
  }

  async function denyUser(uid) {
    await updateDoc(doc(db, 'users', uid), {
      status: 'denied',
    })
  }

  async function revokeUser(uid) {
    if (!window.confirm('このユーザーのアクセスを取り消しますか？')) return
    await updateDoc(doc(db, 'users', uid), { status: 'denied' })
  }

  return (
    <div className="min-h-screen" style={{ background: '#f0f4f0' }}>
      {/* ヘッダー */}
      <div className="sticky top-0 z-40 px-4 pt-3 pb-4"
        style={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #40916C 100%)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-orange-300" />
            <span className="text-white font-bold">管理パネル</span>
          </div>
          <button onClick={signOutUser}
            className="flex items-center gap-1 text-green-200 text-sm">
            <LogOut size={16} />
            ログアウト
          </button>
        </div>
        {/* オーナー情報 */}
        <div className="flex items-center gap-2 mt-3">
          {user?.photoURL && (
            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border-2 border-orange-300" />
          )}
          <div>
            <p className="text-white text-sm font-bold">{user?.displayName}</p>
            <p className="text-green-300 text-xs">オーナー</p>
          </div>
        </div>
      </div>

      <div className="px-3 pt-4 pb-24">
        {/* タブ */}
        <div className="flex bg-white rounded-2xl p-1 shadow-sm mb-4">
          {[
            { id: 'pending', label: '承認待ち', count: pendingUsers.length },
            { id: 'approved', label: '承認済み', count: approvedUsers.length },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5
                          ${tab === t.id ? 'bg-orange-500 text-white shadow' : 'text-gray-400'}`}>
              {t.label}
              {t.count > 0 && (
                <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold
                                  ${tab === t.id ? 'bg-white text-orange-500' : 'bg-gray-100'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 承認待ちタブ */}
        {tab === 'pending' && (
          <div>
            {pendingUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-sm">承認待ちのユーザーはいません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map(u => (
                  <div key={u.id} className="bg-white rounded-2xl shadow-sm p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {u.photoURL ? (
                        <img src={u.photoURL} alt="" className="w-11 h-11 rounded-full" />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                          {u.displayName?.[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{u.displayName}</p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => approveUser(u.id)}
                        className="flex-1 flex items-center justify-center gap-1.5
                                   bg-green-500 text-white text-sm font-bold py-2.5 rounded-xl
                                   active:scale-95 transition-transform">
                        <Check size={16} />
                        承認する
                      </button>
                      <button onClick={() => denyUser(u.id)}
                        className="flex-1 flex items-center justify-center gap-1.5
                                   bg-red-100 text-red-500 text-sm font-bold py-2.5 rounded-xl
                                   active:scale-95 transition-transform">
                        <X size={16} />
                        拒否する
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 承認済みタブ */}
        {tab === 'approved' && (
          <div className="space-y-3">
            {approvedUsers.map(u => (
              <div key={u.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
                {u.photoURL ? (
                  <img src={u.photoURL} alt="" className="w-11 h-11 rounded-full" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                    {u.displayName?.[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-800 truncate">{u.displayName}</p>
                    {u.role === 'owner' && (
                      <span className="text-xs bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full shrink-0">
                        オーナー
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                {u.role !== 'owner' && (
                  <button onClick={() => revokeUser(u.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors p-1">
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* アプリに戻るボタン */}
        <div className="mt-6">
          <a href="/"
            className="block w-full text-center py-3 rounded-2xl text-sm font-bold
                       text-white shadow-md active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
            ⛰️ アプリに戻る
          </a>
        </div>
      </div>
    </div>
  )
}
