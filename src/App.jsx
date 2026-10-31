import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { LanguageProvider } from './lib/i18n'
import { AuthProvider } from './lib/auth'
import Layout from './components/Layout'
import { RequireAuth, RequireAdmin } from './components/Guards'
import Home from './pages/Home'
import TaskList from './pages/TaskList'
import TaskPage from './pages/TaskPage'
import Companies from './pages/Companies'
import CompanyPage from './pages/CompanyPage'
import InterviewRun from './pages/InterviewRun'
import Profile from './pages/Profile'
import Leaderboard from './pages/Leaderboard'
import PublicProfile from './pages/PublicProfile'
import Stats from './pages/Stats'
import Forum from './pages/Forum'
import Login from './pages/Login'
import Register from './pages/Register'
import Admin from './pages/Admin'
import SetupGuide from './pages/SetupGuide'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tasks" element={<TaskList />} />
              <Route path="/tasks/:id" element={<TaskPage />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:slug" element={<CompanyPage />} />
              <Route path="/interview" element={<RequireAuth><InterviewRun /></RequireAuth>} />
              <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
              <Route path="/stats" element={<RequireAuth><Stats /></RequireAuth>} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/players/:username" element={<PublicProfile />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
              <Route path="/setup" element={<SetupGuide />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  )
}
