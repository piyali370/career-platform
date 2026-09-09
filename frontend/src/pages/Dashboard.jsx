import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { User, FileText, Briefcase, GraduationCap, TrendingUp, Users, LayoutList } from 'lucide-react'
import Navbar from '../components/Navbar'
import { RetroGrid } from '../components/RetroGrid'

// const API = 'http://127.0.0.1:8000'
   const API = import.meta.env.VITE_API_URL

function Dashboard() {
  const [user, setUser] = useState(null)
  const [applicationCount, setApplicationCount] = useState(null)
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [prediction, setPrediction] = useState(null)
  const [adminStats, setAdminStats] = useState(null)
  const [upcomingInterviews, setUpcomingInterviews] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    const headers = { Authorization: `Bearer ${token}` }

        axios
      .get(`${API}/me`, { headers })
      .then((res) => {
        try {
          setUser(res.data)

          if (res.data.role === 'admin') {
            axios
              .get(`${API}/admin/analytics`, { headers })
              .then((r) => setAdminStats(r.data))
              .catch((err) => {
                console.error('Failed to load admin analytics:', err)
                setAdminStats(null)
              })
          } else {
            axios
              .get(`${API}/applications/me`, { headers })
              .then((r) => {
                setApplicationCount(r.data.length)
                setUpcomingInterviews(r.data.filter((a) => a.interview_datetime))
              })
              .catch((err) => {
                console.error('Failed to load applications:', err)
                setApplicationCount(0)
              })

            axios
              .get(`${API}/students/me`, { headers })
              .then((r) => setProfile(r.data))
              .catch((err) => {
                console.error('Failed to load student profile:', err)
                setProfile(null)
              })

            axios
              .get(`${API}/students/me/placement-prediction`, { headers })
              .then((r) => setPrediction(r.data))
              .catch((err) => {
                console.error('Failed to load prediction:', err)
                setPrediction(null)
              })
          }
        } catch (err) {
          console.error('Unexpected error processing /me response:', err)
        }
      })
      .catch((err) => {
        console.error('/me request failed:', err)
        setError('Session expired. Please log in again.')
        localStorage.removeItem('token')
        setTimeout(() => navigate('/login'), 1500)
      })
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  const isAdmin = user.role === 'admin'

  const studentStats = [
    { label: 'Applications', value: applicationCount ?? '—', icon: Briefcase },
    { label: 'Branch', value: profile?.branch || 'Not set', icon: GraduationCap },
    { label: 'CGPA', value: profile?.cgpa ?? 'Not set', icon: User },
    { label: 'Resume', value: profile?.resume_url ? 'Uploaded' : 'Missing', icon: FileText },
  ]

  const adminStatCards = adminStats
    ? [
        { label: 'Total Students', value: adminStats.total_students, icon: Users },
        { label: 'Total Drives', value: adminStats.total_drives, icon: Briefcase },
        { label: 'Applications', value: adminStats.total_applications, icon: LayoutList },
        { label: 'Avg CGPA', value: adminStats.avg_cgpa, icon: TrendingUp },
      ]
    : []

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <RetroGrid angle={65} cellSize={50} opacity={0.2} lineColor="#3a3a3a" />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold text-white mb-1">
            Welcome back, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 mb-8 capitalize">{user.role} account</p>

          {isAdmin ? (
            <>
              {adminStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {adminStatCards.map((stat) => {
                    const Icon = stat.icon
                    return (
                      <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-slate-400 text-sm">{stat.label}</span>
                          <Icon className="w-4 h-4 text-purple-400" />
                        </div>
                        <p className="text-white text-xl font-semibold">{stat.value}</p>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="mt-8 flex gap-3 flex-wrap">
                <button
                  onClick={() => navigate('/admin/drives')}
                  className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-sm font-medium px-5 py-2.5 rounded-full transition"
                >
                  Post a Drive
                </button>
                <button
                  onClick={() => navigate('/admin/applicants')}
                  className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-5 py-2.5 rounded-full transition"
                >
                  View Applicants
                </button>
                <button
                  onClick={() => navigate('/admin/analytics')}
                  className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-5 py-2.5 rounded-full transition"
                >
                  Full Analytics
                </button>
                <button
                  onClick={() => navigate('/admin/bulk-import')}
                  className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-5 py-2.5 rounded-full transition"
                >
                  Bulk Import Students
                </button>
                <button
                  onClick={() => navigate('/change-password')}
                  className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-5 py-2.5 rounded-full transition"
                >
                  Change Password
                </button>
                <button
                  onClick={() => navigate('/admin/create-admin')}
                  className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-5 py-2.5 rounded-full transition"
                >
                  Add Admin
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {studentStats.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-400 text-sm">{stat.label}</span>
                        <Icon className="w-4 h-4 text-purple-400" />
                      </div>
                      <p className="text-white text-xl font-semibold">{stat.value}</p>
                    </div>
                  )
                })}
              </div>

              {prediction && (
                <div className="mt-6 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    <h2 className="text-white font-semibold">Placement Readiness (AI Prediction)</h2>
                  </div>

                  <div className="flex items-end gap-3 mb-3">
                    <span className="text-4xl font-bold text-white">{prediction.placement_probability}%</span>
                    <span className="text-slate-400 text-sm mb-1">estimated likelihood</span>
                  </div>

                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        prediction.placement_probability >= 60
                          ? 'bg-green-500'
                          : prediction.placement_probability >= 35
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${prediction.placement_probability}%` }}
                    />
                  </div>

                  <p className="text-slate-500 text-xs mt-3">
                    Based on your CGPA ({prediction.cgpa_used}), backlogs ({prediction.backlogs_used}), and {prediction.skill_count_used} detected skills.
                  </p>
                </div>
              )}

                {upcomingInterviews.length > 0 && (
                <div className="mt-6 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
                  <h2 className="text-white font-semibold mb-4">📅 Upcoming Interviews</h2>
                  <div className="flex flex-col gap-3">
                    {upcomingInterviews.map((app) => (
                      <div key={app.id} className="bg-black/30 rounded-xl p-4">
                        <p className="text-white text-sm font-medium">{app.drive.role} — {app.drive.company.name}</p>
                        <p className="text-purple-300 text-sm mt-1">
                          {new Date(app.interview_datetime).toLocaleString()}
                        </p>
                        {app.interview_notes && (
                          <p className="text-slate-400 text-xs mt-1">{app.interview_notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex gap-3 flex-wrap">
                <button
                  onClick={() => navigate('/profile')}
                  className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-sm font-medium px-5 py-2.5 rounded-full transition"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => navigate('/drives')}
                  className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-5 py-2.5 rounded-full transition"
                >
                  Browse Drives
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard