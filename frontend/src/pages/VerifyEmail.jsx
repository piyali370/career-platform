import { useState } from 'react'
import axios from 'axios'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { RetroGrid } from '../components/RetroGrid'

// const API = 'http://127.0.0.1:8000'
   const API = import.meta.env.VITE_API_URL

function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const emailFromRegister = location.state?.email || ''

  const [email, setEmail] = useState(emailFromRegister)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      await axios.post(`${API}/verify-email`, { email, code })
      setMessage('Email verified! Redirecting to login...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setMessage('')
    setResending(true)
    try {
      await axios.post(`${API}/resend-verification`, { email, password: '' })
      setMessage('A new code has been sent to your email.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to resend code.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <RetroGrid angle={65} cellSize={50} opacity={0.3} lineColor="#4a4a4a" />

      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="bg-white/5 border border-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl">
          <h1 className="text-3xl font-bold text-center mb-1 bg-clip-text text-transparent bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.7)_100%)]">
            Verify Your Email
          </h1>
          <p className="text-slate-400 text-center text-sm mb-6">
            Enter the 6-digit code sent to your email
          </p>

          <form onSubmit={handleVerify} className="flex flex-col gap-3">
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
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 outline-none focus:border-purple-500 transition text-center text-2xl tracking-[0.5em]"
            />

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {message && <p className="text-green-400 text-sm">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold py-2.5 rounded-full transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <button
            onClick={handleResend}
            disabled={resending || !email}
            className="w-full text-purple-400 hover:underline text-sm text-center mt-4 disabled:opacity-50"
          >
            {resending ? 'Resending...' : "Didn't get a code? Resend"}
          </button>

          <p className="text-slate-400 text-sm text-center mt-4">
            Already verified?{' '}
            <Link to="/login" className="text-purple-400 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail