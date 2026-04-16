import { NavLink } from 'react-router-dom'
import { CalendarDays, Vote, CheckCircle, PencilLine } from 'lucide-react'
import { BRAND } from '../../utils/brand'

const tabs = [
  { to: '/', icon: CalendarDays, label: 'カレンダー' },
  { to: '/candidates', icon: Vote, label: '候補日' },
  { to: '/events', icon: CheckCircle, label: '山予定' },
  { to: '/availability', icon: PencilLine, label: '入力' },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-120 z-40 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors
                 ${isActive ? '' : 'text-gray-400 hover:text-gray-600'}`
              }
              style={({ isActive }) => isActive ? { color: BRAND.orange, background: BRAND.orangeTint } : undefined}
            >
              <Icon size={22} strokeWidth={2.1} />
              <span>{tab.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
