import { NavLink } from 'react-router-dom'
import { CalendarDays, Vote, CheckCircle, PencilLine } from 'lucide-react'

const tabs = [
  { to: '/',            icon: CalendarDays, label: 'カレンダー' },
  { to: '/candidates',  icon: Vote,         label: '投票'       },
  { to: '/events',      icon: CheckCircle,  label: '確定'       },
  { to: '/availability',icon: PencilLine,   label: '入力'       },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40
                    bg-white border-t border-gray-200 shadow-lg">
      <div className="flex">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors
               ${isActive ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
