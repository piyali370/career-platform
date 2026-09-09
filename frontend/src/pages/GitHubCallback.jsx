import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { RetroGrid } from '../components/RetroGrid'

// const API = 'http://127.0.0.1:8000'
   const API = import.meta.env.VITE_API_URL

function GitHubCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (!code) {
      setError('No code received from GitHub.')
      return
    }

    axios
      .post(`${API}/auth/github`, { code })
      .then((res) => {
        localStorage.setItem('token', res.data.access_token)
        navigate('/dashboard')
      })
      .catch(() => {
        setError('GitHub login failed.')
        setTimeout(() => navigate('/login'), 2000)
      })
  }, [navigate])

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <RetroGrid angle={65} cellSize={50} opacity={0.3} lineColor="#4a4a4a" />
      <div className="relative z-10 text-center">
        {error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <p className="text-white">Signing you in with GitHub...</p>
        )}
      </div>
    </div>
  )
}

export default GitHubCallback