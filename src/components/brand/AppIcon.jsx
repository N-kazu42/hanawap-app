import { APP_ICON } from '../../utils/brand'

export default function AppIcon({ className = '', alt = 'Hanawap icon' }) {
  return <img src={APP_ICON} alt={alt} className={className} />
}
