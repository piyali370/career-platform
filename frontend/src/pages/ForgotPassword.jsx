import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { RetroGrid } from '../components/RetroGrid'

// const API = 'http://127.0.0.1:8000'
   const API = import.meta.env.VITE_API_URL

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const res = await axios.post(`${API}/forgot-password`, { email })
      setMessage(res.data.message)
      setTimeout(() => navigate('/reset-password', { state: { email } }), 1500)
    } catch (err) {
      setMessage('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <RetroGrid angle={65} cellSize={50} opacity={0.3} lineColor="#4a4a4a" />
      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="bg-white/5 border border-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl">
          <h1 className="text-2xl font-bold text-center mb-1 text-white">Forgot Password</h1>
          <p className="text-slate-400 text-center text-sm mb-6">
            Enter your email and we'll send you a reset code
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

            {message && <p className="text-green-400 text-sm">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold py-2.5 rounded-full transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>

          <p className="text-slate-400 text-sm text-center mt-5">
            Remembered your password?{' '}
            <Link to="/login" className="text-purple-400 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword