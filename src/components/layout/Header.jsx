import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { LogOut, Shield, ChevronDown } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { signOutUser } from '../../firebase/auth'

export default function Header({ title }) {
  const { user, isOwner } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef(null)

  function handleOpen() {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 8, right: window.innerWidth - r.right })
    }
    setMenuOpen(o => !o)
  }

  return (
    <header className="sticky top-0" style={{ zIndex: 50 }}>
      {/* 装飾背景（clipPathはここだけ） */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #40916C 100%)',
          clipPath: 'polygon(0 0, 100% 0, 100% 75%, 85% 88%, 70% 78%, 55% 90%, 40% 80%, 20% 95%, 0 82%)',
        }}
      />

      {/* コンテンツ（clipPath なし） */}
      <div className="relative flex items-center justify-between px-4 pt-3 pb-5">
        {/* タイトル */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">⛰️</span>
          <span className="text-white font-bold text-xl tracking-wide">{title}</span>
        </div>

        {/* アバターボタン */}
        {user && (
          <button
            ref={btnRef}
            onClick={handleOpen}
            className="flex items-center gap-1.5 active:opacity-70"
          >
            {user.photoURL ? (
              <img src={user.photoURL} alt=""
                className="w-8 h-8 rounded-full border-2 border-green-300" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white text-sm font-bold">
                {user.displayName?.[0]}
              </div>
            )}
            <ChevronDown size={14} className="text-green-200" />
          </button>
        )}
      </div>

      {/* ドロップダウン：Portal で <body> 直下に描画し z-index 制約を完全回避 */}
      {user && menuOpen && createPortal(
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              zIndex: 9998,
            }}
          />
          <div style={{
            position: 'fixed',
            top: pos.top,
            right: pos.right,
            zIndex: 9999,
            background: 'white',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            padding: '8px 0',
            width: 192,
            minWidth: 192,
          }}>
            <div style={{ padding: '8px 16px', borderBottom: '1px solid #f3f4f6' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.displayName}
              </p>
              <p style={{ fontSize: 12, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </p>
            </div>

            {isOwner && (
              <a
                href="/admin"
                onClick={() => setMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', fontSize: 14, color: '#ea580c', fontWeight: 700, textDecoration: 'none' }}
              >
                <Shield size={15} />
                管理パネル
              </a>
            )}

            <button
              onClick={() => { signOutUser(); setMenuOpen(false) }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', fontSize: 14, color: '#4b5563', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <LogOut size={15} />
              ログアウト
            </button>
          </div>
        </>,
        document.body
      )}
    </header>
  )
}
