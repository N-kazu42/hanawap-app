export const DEFAULT_USER_AVATAR = '/default-user-icon.png'

export function getUserAvatarUrl(userLike) {
  return userLike?.photoURL || DEFAULT_USER_AVATAR
}
