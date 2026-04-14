import { BrowserRouter, Routes, Route } from 'react-router-dom'
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

function PageWrapper({ title, children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title={title} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

// 認証・承認状態に応じて表示を切り替えるゲート
function AuthGate({ children }) {
  const { user, loading, isApproved, isPending } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #1B4332 0%, #40916C 60%, #f0f4f0 100%)' }}>
        <div className="text-white text-center">
          <div className="text-5xl mb-4 animate-pulse">⛰️</div>
          <p className="text-green-200 text-sm">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) return <LoginScreen />
  if (isPending || (!isApproved)) return <PendingScreen />
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
          <PageWrapper title="確定山行"><EventList /></PageWrapper>
        </AuthGate>
      } />
      <Route path="/availability" element={
        <AuthGate>
          <PageWrapper title="予定を入力"><AvailabilityInput /></PageWrapper>
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
