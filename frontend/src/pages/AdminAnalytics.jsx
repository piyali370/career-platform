import { useEffect, useState } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, Briefcase, FileText, TrendingDown } from 'lucide-react'
import Navbar from '../components/Navbar'
import { RetroGrid } from '../components/RetroGrid'

// const API = 'http://127.0.0.1:8000'
   const API = import.meta.env.VITE_API_URL
const COLORS = ['#a855f7', '#eab308', '#3b82f6', '#22c55e', '#ef4444']

function AdminAnalytics() {
  const [data, setData] = useState(null)
  const token = localStorage.getItem('token')

  useEffect(() => {
    axios
      .get(`${API}/admin/analytics`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setData(res.data))
  }, [])

  if (!data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading analytics...</p>
      </div>
    )
  }

  const stats = [
    { label: 'Total Students', value: data.total_students, icon: Users },
    { label: 'Total Drives', value: data.total_drives, icon: Briefcase },
    { label: 'Applications', value: data.total_applications, icon: FileText },
    { label: 'Avg CGPA', value: data.avg_cgpa, icon: TrendingDown },
  ]

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <RetroGrid angle={65} cellSize={50} opacity={0.15} lineColor="#3a3a3a" />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-bold text-white mb-6">Placement Analytics</h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => {
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Branch-wise chart */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4">Students by Branch</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.branch_breakdown}>
                  <XAxis dataKey="branch" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #ffffff20', borderRadius: '8px' }} />
                  <Bar dataKey="student_count" fill="#a855f7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Application status pie */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4">Application Status</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={data.status_breakdown} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                    {data.status_breakdown.map((entry, index) => (
                      <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #ffffff20', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* At-risk students */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-1">At-Risk Students</h2>
            <p className="text-slate-400 text-sm mb-4">
              Students with AI-predicted placement probability below 40% — may need extra support.
            </p>
            {data.at_risk_students.length === 0 ? (
              <p className="text-slate-400 text-sm">No at-risk students detected.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {data.at_risk_students.map((s, i) => (
                  <div key={i} className="flex justify-between items-center bg-white/5 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-white text-sm font-medium">{s.student_name}</p>
                      <p className="text-slate-400 text-xs">{s.branch || 'Unspecified'} · CGPA: {s.cgpa ?? '—'}</p>
                    </div>
                    <span className="text-red-300 bg-red-500/20 text-xs font-semibold px-3 py-1 rounded-full">
                      {s.probability}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAnalytics