import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Drives from './pages/Drives'
import Applications from './pages/Applications'
import AdminDrives from './pages/AdminDrives'
import NotFound from './pages/NotFound'
import AdminApplicants from './pages/AdminApplicants'
import AdminAnalytics from './pages/AdminAnalytics'
import VerifyEmail from './pages/VerifyEmail'
import GitHubCallback from './pages/GitHubCallback'
import ResumeBuilder from './pages/ResumeBuilder'
import MockInterview from './pages/MockInterview'
import AdminBulkImport from './pages/AdminBulkImport'
import AssistantChat from './components/AssistantChat'
import Leaderboard from './pages/Leaderboard'
import PlacementHistory from './pages/PlacementHistory'
import ChangePassword from './pages/ChangePassword'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import CreateAdmin from './pages/CreateAdmin'

function getRoleFromToken() {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    return JSON.parse(atob(token.split('.')[1])).role
  } catch {
    return null
  }
}

function AppContent() {
  useLocation() // re-renders this component on every route change, keeping `role` fresh
  const role = getRoleFromToken()

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/drives" element={<Drives />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/admin/drives" element={<AdminDrives />} />
        <Route path="/admin/applicants" element={<AdminApplicants />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/auth/github/callback" element={<GitHubCallback />} />
        <Route path="/resume-builder" element={<ResumeBuilder />} />
        <Route path="/mock-interview" element={<MockInterview />} />
        <Route path="/admin/bulk-import" element={<AdminBulkImport />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/admin/placement-history" element={<PlacementHistory />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/create-admin" element={<CreateAdmin />} />
      </Routes>
      {role === 'student' && <AssistantChat />}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App