import { useState } from 'react'
import { signInWithEmail, signInWithGoogle } from '../../firebase/auth'
import AppIcon from '../brand/AppIcon'
import { BRAND, BRAND_GRADIENT, BRAND_PAGE_GRADIENT } from '../../utils/brand'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleEmailSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signInWithEmail(email, password)
    } catch (e) {
      setError(getErrorMessage(e.code))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    setError('')
    try {
      await signInWithGoogle()
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user') {
        setError(getErrorMessage(e.code))
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BRAND_PAGE_GRADIENT }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center mb-10">
          <AppIcon className="w-24 h-24 rounded-[2rem] shadow-2xl mx-auto mb-4" />
          <h1 className="text-3xl font-bold tracking-wide mb-1" style={{ color: BRAND.navyDeep }}>Hanawap</h1>
          <p className="text-sm" style={{ color: BRAND.navy }}>山仲間の日程調整を、明るくひとつに。</p>
        </div>

        <div className="w-full max-w-sm bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6 border" style={{ borderColor: BRAND.orangeSoft }}>
          <p className="text-sm font-bold text-gray-700 mb-4 text-center">ログイン</p>

          <form onSubmit={handleEmailSubmit} className="space-y-3 mb-4">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': BRAND.orangeSoft }}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="パスワード"
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': BRAND.orangeSoft }}
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs bg-red-50 rounded-xl px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl text-white font-bold text-sm active:scale-95 transition-all disabled:opacity-60"
              style={{ background: BRAND_GRADIENT }}
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">または</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-60"
            style={{ borderColor: BRAND.orangeSoft }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            {googleLoading ? 'ログイン中...' : 'Googleでログイン'}
          </button>
        </div>
      </div>
    </div>
  )
}

function getErrorMessage(code) {
  const map = {
    'auth/user-not-found': 'メールアドレスが見つかりません',
    'auth/wrong-password': 'パスワードが違います',
    'auth/invalid-credential': 'メールアドレスまたはパスワードが違います',
    'auth/invalid-email': 'メールアドレスの形式が正しくありません',
    'auth/too-many-requests': 'しばらく待ってから再度お試しください',
  }
  return map[code] || 'エラーが発生しました。もう一度お試しください。'
}
