import { signOutUser } from '../../firebase/auth'
import { useAuth } from '../../contexts/AuthContext'

export default function PendingScreen() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8"
      style={{ background: 'linear-gradient(180deg, #1B4332 0%, #2D6A4F 40%, #40916C 70%, #f0f4f0 100%)' }}>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">承認待ちです</h2>
        <p className="text-sm text-gray-500 mb-4">
          オーナーがあなたのアクセスを確認しています。
          しばらくお待ちください。
        </p>

        {/* アカウント情報 */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
          <div className="flex items-center gap-3">
            {user?.photoURL && (
              <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" />
            )}
            <div>
              <p className="text-sm font-bold text-gray-700">{user?.displayName}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-6">
          承認されると自動的にアプリが開きます
        </p>

        <button
          onClick={signOutUser}
          className="w-full py-3 rounded-2xl text-sm font-bold text-gray-500
                     border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all"
        >
          別のアカウントでログイン
        </button>
      </div>
    </div>
  )
}
