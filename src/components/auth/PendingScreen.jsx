import { signOutUser } from '../../firebase/auth'
import { useAuth } from '../../contexts/AuthContext'
import { getUserAvatarUrl } from '../../utils/avatar'
import AppIcon from '../brand/AppIcon'
import { BRAND, BRAND_PAGE_GRADIENT } from '../../utils/brand'

export default function PendingScreen() {
  const { user } = useAuth()
  const avatarUrl = getUserAvatarUrl(user)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8" style={{ background: BRAND_PAGE_GRADIENT }}>
      <div className="w-full max-w-sm bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 text-center border" style={{ borderColor: BRAND.orangeSoft }}>
        <AppIcon className="w-20 h-20 rounded-[1.75rem] shadow-xl mx-auto mb-4" />
        <h2 className="text-lg font-bold mb-2" style={{ color: BRAND.navyDeep }}>承認待ちです</h2>
        <p className="text-sm text-gray-500 mb-4">
          管理者の承認が完了すると使えるようになります。少し待ってからもう一度開いてください。
        </p>

        <div className="rounded-2xl p-4 mb-6 text-left" style={{ background: BRAND.orangeTint }}>
          <div className="flex items-center gap-3">
            <img src={avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <p className="text-sm font-bold text-gray-700">{user?.displayName}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>

        <p className="text-xs mb-6" style={{ color: BRAND.textMuted }}>
          承認されると自動的にアプリ画面が使えるようになります。
        </p>

        <button
          onClick={signOutUser}
          className="w-full py-3 rounded-2xl text-sm font-bold text-gray-500 border hover:bg-gray-50 active:scale-95 transition-all"
          style={{ borderColor: BRAND.orangeSoft }}
        >
          別のアカウントでログイン
        </button>
      </div>
    </div>
  )
}
