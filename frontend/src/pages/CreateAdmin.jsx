import { useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { RetroGrid } from '../components/RetroGrid'

// const API = 'http://127.0.0.1:8000'
   const API = import.meta.env.VITE_API_URL

function CreateAdmin() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const token = localStorage.getItem('token')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      await axios.post(
        `${API}/admin/create-admin`,
        { name, email, password, role: 'admin' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessage(`Admin account created for ${email}. Share these credentials with them securely.`)
      setName('')
      setEmail('')
      setPassword('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create admin.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 outline-none focus:border-purple-500 transition'

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <RetroGrid angle={65} cellSize={50} opacity={0.15} lineColor="#3a3a3a" />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-md mx-auto px-6 py-10">
          <h1 className="text-2xl font-bold text-white mb-1">Add Admin</h1>
          <p className="text-slate-400 text-sm mb-6">
            Create another Placement Cell admin account.
          </p>

          <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col gap-3">
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
            <input type="password" placeholder="Temporary Password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} />

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {message && <p className="text-green-400 text-sm">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Admin Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateAdmin