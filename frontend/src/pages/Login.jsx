import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { RetroGrid } from '../components/RetroGrid'

const API = import.meta.env.VITE_API_URL

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.61 20.08H42V20H24v8h11.3c-1.65 4.66-6.08 8-11.3 8-6.63 0-12-5.37-12-12s5.37-12 12-12c3.06 0 5.85 1.15 7.97 3.03l5.66-5.66C34.05 6.05 29.28 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20c0-1.34-.14-2.65-.39-3.92z"/>
      <path fill="#FF3D00" d="M6.31 14.69l6.57 4.82C14.65 15.99 18.96 13 24 13c3.06 0 5.85 1.15 7.97 3.03l5.66-5.66C34.05 6.05 29.28 4 24 4 16.32 4 9.68 8.34 6.31 14.69z"/>
      <path fill="#4CAF50" d="M24 44c5.17 0 9.86-1.98 13.41-5.21l-6.19-5.24C29.14 35.32 26.68 36 24 36c-5.2 0-9.61-3.32-11.28-7.95l-6.5 5.01C9.6 39.55 16.26 44 24 44z"/>
      <path fill="#1976D2" d="M43.61 20.08H42V20H24v8h11.3c-.79 2.24-2.24 4.16-4.09 5.55l6.19 5.24C40.9 35.83 44 30.3 44 24c0-1.34-.14-2.65-.39-3.92z"/>
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.04-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.85 1.24 1.85 1.24 1.08 1.84 2.83 1.31 3.52 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.41 1.02.01 2.04.14 3 .41 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.02 2.89-.02 3.29 0 .32.22.7.83.58C20.56 21.79 24 17.29 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post(`${API}/login`, { email, password })
      const token = response.data.access_token
      localStorage.setItem('token', token)
      navigate('/dashboard')
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Please verify your email first.')
      } else {
        setError('Invalid email or password')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')
    try {
      const response = await axios.post(`${API}/auth/google`, {
        credential: credentialResponse.credential,
      })
      localStorage.setItem('token', response.data.access_token)
      navigate('/dashboard')
    } catch (err) {
      setError('Google login failed.')
    }
  }

  const GITHUB_CLIENT_ID = 'Ov23liuleu9RcfuSWuUG'

      const handleGitHubClick = () => {
    const redirectUri = 'http://localhost:5173/auth/github/callback'
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email`
    window.location.href = githubAuthUrl
  }
  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <RetroGrid angle={65} cellSize={50} opacity={0.3} lineColor="#4a4a4a" />

      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="bg-white/5 border border-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl">
          <h1 className="text-3xl font-bold text-center mb-1 bg-clip-text text-transparent bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.7)_100%)]">
            Career Platform
          </h1>
          <p className="text-slate-400 text-center text-sm mb-6">Login to continue</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder:text-slate-500 outline-none focus:border-purple-500 transition"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder:text-slate-500 outline-none focus:border-purple-500 transition"
            />

            <Link to="/forgot-password" className="text-purple-400 hover:underline text-xs text-right -mt-1">
              Forgot password?
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Continue with Email'}
            </button>
          </form>

          {error && <p className="text-red-400 text-sm text-center mt-3">{error}</p>}

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-slate-500 text-xs">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

                    <div className="flex flex-col gap-3">
            <button
              onClick={handleGitHubClick}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl transition"
            >
              <GitHubIcon />
              Continue with GitHub
            </button>
          </div>

          <div className="relative mt-3">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl transition pointer-events-none"
            >
              <GoogleIcon />
              Continue with Google
            </button>
            <div className="absolute inset-0 opacity-0 overflow-hidden [&>div]:!w-full [&>div]:!h-full [&_iframe]:!w-full [&_iframe]:!h-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google login failed.')}
                width="100%"
              />
            </div>
          </div>

          <p className="text-slate-400 text-sm text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-400 font-medium hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login