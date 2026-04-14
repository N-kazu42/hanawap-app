import { useState } from 'react'
import { LogOut, Shield, ChevronDown } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { signOutUser } from '../../firebase/auth'

export default function Header({ title }) {
  const { user, isOwner } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40">
      <div
        className="relative flex items-center justify-between px-4 pt-3 pb-5"
        style={{
          background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #40916C 100%)',
          clipPath: 'polygon(0 0, 100% 0, 100% 75%, 85% 88%, 70% 78%, 55% 90%, 40% 80%, 20% 95%, 0 82%)',
        }}
      >
        {/* タイトル */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">⛰️</span>
          <span className="text-white font-bold text-xl tracking-wide">{title}</span>
        </div>

        {/* ユーザーメニュー */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="flex items-center gap-1.5 active:opacity-70"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border-2 border-green-300" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white text-sm font-bold">
                  {user.displayName?.[0]}
                </div>
              )}
              <ChevronDown size={14} className="text-green-200" />
            </button>

            {menuOpen && (
              <>
                {/* オーバーレイ */}
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                {/* ドロップダウン */}
                <div className="absolute right-0 top-10 z-50 bg-white rounded-2xl shadow-xl py-2 w-48">
                  <div className="px-4 py-2 border-b border-gray-50">
                    <p className="text-xs font-bold text-gray-700 truncate">{user.displayName}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>

                  {isOwner && (
                    <a
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-orange-600 font-bold hover:bg-orange-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Shield size={15} />
                      管理パネル
                    </a>
                  )}

                  <button
                    onClick={() => { signOutUser(); setMenuOpen(false) }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    <LogOut size={15} />
                    ログアウト
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
