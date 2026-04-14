import { useState } from 'react'
import { signInWithEmail } from '../../firebase/auth'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
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

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg, #1B4332 0%, #2D6A4F 40%, #40916C 70%, #f0f4f0 100%)' }}>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* ロゴ */}
        <div className="text-center mb-10">
          <div className="text-7xl mb-3">⛰️</div>
          <h1 className="text-white text-3xl font-bold tracking-wide mb-1">Hanawap</h1>
          <p className="text-green-200 text-sm">登山仲間のスケジュール管理</p>
        </div>

        {/* ログインカード */}
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
          <p className="text-sm font-bold text-gray-700 mb-4 text-center">ログイン</p>

          {/* メール/パスワードフォーム */}
          <form onSubmit={handleEmailSubmit} className="space-y-3 mb-4">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-green-300"
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
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs bg-red-50 rounded-xl px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl text-white font-bold text-sm
                         active:scale-95 transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}

function getErrorMessage(code) {
  const map = {
    'auth/user-not-found':     'メールアドレスが登録されていません',
    'auth/wrong-password':     'パスワードが間違っています',
    'auth/invalid-credential': 'メールアドレスまたはパスワードが間違っています',
    'auth/invalid-email':      'メールアドレスの形式が正しくありません',
    'auth/too-many-requests':  'しばらく時間をおいてから再試行してください',
  }
  return map[code] || 'エラーが発生しました。もう一度お試しください。'
}
