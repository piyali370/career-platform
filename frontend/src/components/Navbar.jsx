import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, Bell, GraduationCap } from 'lucide-react'
import axios from 'axios'
import Logo from './Logo'

// const API = 'http://127.0.0.1:8000'
   const API = import.meta.env.VITE_API_URL

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem('token')
  const [menuOpen, setMenuOpen] = useState(false)

  const [notifications, setNotifications] = useState([])
  const [notifOpen, setNotifOpen] = useState(false)

  const fetchNotifications = () => {
    if (!token) return
    axios
      .get(`${API}/notifications/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setNotifications(res.data))
      .catch(() => {})
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [token])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const handleMarkAllRead = async () => {
    try {
      await axios.patch(`${API}/notifications/mark-all-read`, {}, { headers: { Authorization: `Bearer ${token}` } })
      fetchNotifications()
    } catch {}
  }

  const handleNotificationClick = async (notif) => {
    try {
      await axios.patch(`${API}/notifications/${notif.id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } })
      fetchNotifications()
    } catch {}
    setNotifOpen(false)
    if (notif.link) navigate(notif.link)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  if (!token) return null

  const getRoleFromToken = () => {
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.role
    } catch {
      return null
    }
  }

  const role = getRoleFromToken()

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    ...(role !== 'admin' ? [
      { to: '/profile', label: 'Profile' },
      { to: '/resume-builder', label: 'Resume Builder' },
      { to: '/mock-interview', label: 'Mock Interview' },
      { to: '/drives', label: 'Drives' },
      { to: '/applications', label: 'Applications' },
      { to: '/leaderboard', label: 'Leaderboard' },
    ] : []),
    ...(role === 'admin' ? [
      { to: '/admin/drives', label: 'Post Drive' },
      { to: '/admin/applicants', label: 'Applicants' },
      { to: '/admin/analytics', label: 'Analytics' },
      { to: '/admin/bulk-import', label: 'Bulk Import' },
      { to: '/admin/placement-history', label: 'History' },
    ] : []),
  ]

  const handleLinkClick = () => setMenuOpen(false)

  return (
    <div className="sticky top-4 z-50 flex justify-center px-4">
      <div className={role === 'admin' ? 'w-fit' : 'w-full max-w-6xl'}>
        {/* Top bar — always visible */}
        <nav className="flex items-center justify-between gap-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 shadow-lg">
            <Link to="/dashboard" className="text-white font-semibold px-3 flex items-center gap-2 hover:opacity-80 transition whitespace-nowrap">
            <GraduationCap className="w-5 h-5 text-purple-400" fill="currentColor" />
            Career Platform
          </Link>

          {/* Desktop links — hidden on small screens */}
          <div className="hidden md:flex items-center bg-white/5 rounded-full px-1 py-1 gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm px-4 py-1.5 rounded-full transition whitespace-nowrap ${
                  location.pathname === link.to
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

                    <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative text-slate-300 hover:text-white p-2 transition"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50">
                <div className="flex justify-between items-center px-4 py-3 border-b border-white/10">
                  <span className="text-white text-sm font-semibold">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-purple-400 hover:text-purple-300 text-xs">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-slate-500 text-sm px-4 py-6 text-center">No notifications yet.</p>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition ${
                          !notif.is_read ? 'bg-purple-500/5' : ''
                        }`}
                      >
                        <p className="text-slate-200 text-sm">{notif.message}</p>
                        <p className="text-slate-500 text-xs mt-1">
                          {new Date(notif.created_at).toLocaleString()}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="hidden md:block bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-sm font-medium px-5 py-2 rounded-full transition"
          >
            Logout
          </button>

          {/* Hamburger — only on small screens */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white p-1"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Dropdown — only on small screens, only when open */}
        {menuOpen && (
          <div className="md:hidden mt-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex flex-col gap-1 shadow-lg">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={handleLinkClick}
                className={`text-sm px-4 py-2.5 rounded-xl transition ${
                  location.pathname === link.to
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="mt-1 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition text-left"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar