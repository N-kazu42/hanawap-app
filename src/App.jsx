import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { CalendarDays, Vote, CheckCircle, PencilLine } from 'lucide-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Header from './components/layout/Header'
import BottomNav from './components/layout/BottomNav'
import CalendarView from './components/Calendar/CalendarView'
import AvailabilityInput from './components/Availability/AvailabilityInput'
import CandidateList from './components/Candidates/CandidateList'
import EventList from './components/Events/EventList'
import LoginScreen from './components/auth/LoginScreen'
import PendingScreen from './components/auth/PendingScreen'
import AdminPanel from './components/auth/AdminPanel'
import AppIcon from './components/brand/AppIcon'
import { BRAND, BRAND_PAGE_GRADIENT } from './utils/brand'

const NAV_TABS = [
  { to: '/', icon: CalendarDays, label: 'カレンダー' },
  { to: '/candidates', icon: Vote, label: '候補日' },
  { to: '/events', icon: CheckCircle, label: '山予定' },
  { to: '/availability', icon: PencilLine, label: '入力' },
]

function DesktopSideNav() {
  return (
    <aside className="hidden md:flex flex-col w-20 bg-white border-r border-gray-200 sticky top-0 h-screen shrink-0">
      <div className="flex flex-col items-center pt-5 pb-4 gap-1">
        <AppIcon className="w-11 h-11 rounded-2xl shadow-lg mb-3" />
        {NAV_TABS.map(tab => {
          const Icon = tab.icon
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center w-full py-3 gap-1 text-xs font-medium transition-colors rounded-none
                 ${isActive ? 'bg-[#FFF6EC]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`
              }
              style={({ isActive }) => isActive ? { color: BRAND.orange } : undefined}
            >
              <Icon size={22} strokeWidth={2.1} />
              <span>{tab.label}</span>
            </NavLink>
          )
        })}
      </div>
    </aside>
  )
}

function PageWrapper({ title, children }) {
  return (
    <div className="flex min-h-screen">
      <DesktopSideNav />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto">
          <div className="md:max-w-3xl md:mx-auto">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  )
}

function AuthGate({ children }) {
  const { user, loading, isApproved, isPending } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BRAND_PAGE_GRADIENT }}>
        <div className="text-center" style={{ color: BRAND.navyDeep }}>
          <AppIcon className="w-20 h-20 rounded-[1.75rem] shadow-2xl mx-auto mb-4 animate-pulse" />
          <p className="text-sm" style={{ color: BRAND.navy }}>読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) return <LoginScreen />
  if (isPending || !isApproved) return <PendingScreen />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/" element={
        <AuthGate>
          <PageWrapper title="Hanawap"><CalendarView /></PageWrapper>
        </AuthGate>
      } />
      <Route path="/candidates" element={
        <AuthGate>
          <PageWrapper title="候補日・投票"><CandidateList /></PageWrapper>
        </AuthGate>
      } />
      <Route path="/events" element={
        <AuthGate>
          <PageWrapper title="山行予定"><EventList /></PageWrapper>
        </AuthGate>
      } />
      <Route path="/availability" element={
        <AuthGate>
          <PageWrapper title="参加可否入力"><AvailabilityInput /></PageWrapper>
        </AuthGate>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
