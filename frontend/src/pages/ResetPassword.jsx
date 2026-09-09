import { useState } from 'react'
import axios from 'axios'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { RetroGrid } from '../components/RetroGrid'

// const API = 'http://127.0.0.1:8000'
   const API = import.meta.env.VITE_API_URL

function ResetPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState(location.state?.email || '')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      await axios.post(`${API}/reset-password`, { email, code, new_password: newPassword })
      setMessage('Password reset! Redirecting to login...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Reset failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <RetroGrid angle={65} cellSize={50} opacity={0.3} lineColor="#4a4a4a" />
      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="bg-white/5 border border-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl">
          <h1 className="text-2xl font-bold text-center mb-1 text-white">Reset Password</h1>
          <p className="text-slate-400 text-center text-sm mb-6">
            Enter the code sent to your email and choose a new password
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 outline-none focus:border-purple-500 transition"
            />
            <input
              type="text"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              maxLength={6}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 outline-none focus:border-purple-500 transition text-center text-xl tracking-[0.4em]"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 outline-none focus:border-purple-500 transition"
            />

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {message && <p className="text-green-400 text-sm">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold py-2.5 rounded-full transition disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <p className="text-slate-400 text-sm text-center mt-5">
            <Link to="/login" className="text-purple-400 hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword