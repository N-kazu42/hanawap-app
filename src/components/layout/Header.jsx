import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { LogOut, Shield, ChevronDown } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { signOutUser } from '../../firebase/auth'
import { getUserAvatarUrl } from '../../utils/avatar'
import AppIcon from '../brand/AppIcon'
import { BRAND, BRAND_GRADIENT } from '../../utils/brand'

export default function Header({ title }) {
  const { user, isOwner } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef(null)
  const avatarUrl = getUserAvatarUrl(user)

  function handleOpen() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
    }
    setMenuOpen(open => !open)
  }

  return (
    <header className="sticky top-0" style={{ zIndex: 50 }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: BRAND_GRADIENT,
          clipPath: 'polygon(0 0, 100% 0, 100% 75%, 85% 88%, 70% 78%, 55% 90%, 40% 80%, 20% 95%, 0 82%)',
        }}
      />

      <div className="relative flex items-center justify-between px-4 pt-3 pb-5">
        <div className="flex items-center gap-3 min-w-0">
          <AppIcon className="w-10 h-10 rounded-2xl shadow-lg shrink-0" />
          <span className="text-white font-bold text-xl tracking-wide truncate">{title}</span>
        </div>

        {user && (
          <button
            ref={btnRef}
            onClick={handleOpen}
            className="flex items-center gap-1.5 active:opacity-70 shrink-0"
          >
            <img
              src={avatarUrl}
              alt=""
              className="w-8 h-8 rounded-full border-2 object-cover"
              style={{ borderColor: BRAND.orangeSoft }}
            />
            <ChevronDown size={14} style={{ color: BRAND.orangeSoft }} />
          </button>
        )}
      </div>

      {user && menuOpen && createPortal(
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
          />
          <div
            style={{
              position: 'fixed',
              top: pos.top,
              right: pos.right,
              zIndex: 9999,
              background: 'white',
              borderRadius: 16,
              boxShadow: '0 12px 30px rgba(31, 116, 201, 0.16)',
              padding: '8px 0',
              width: 208,
            }}
          >
            <div style={{ padding: '8px 16px', borderBottom: '1px solid #eef3f8' }}>
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
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 16px',
                  fontSize: 14,
                  color: BRAND.orange,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <Shield size={15} />
                管理パネル
              </a>
            )}

            <button
              onClick={() => { signOutUser(); setMenuOpen(false) }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 16px',
                fontSize: 14,
                color: '#4b5563',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
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
