import { useEffect, useState } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Trophy } from 'lucide-react'
import Navbar from '../components/Navbar'
import { RetroGrid } from '../components/RetroGrid'

// const API = 'http://127.0.0.1:8000'
   const API = import.meta.env.VITE_API_URL

function PlacementHistory() {
  const [data, setData] = useState(null)
  const token = localStorage.getItem('token')

  useEffect(() => {
    axios
      .get(`${API}/admin/placement-history`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setData(res.data))
      .catch(() => {})
  }, [])

  if (!data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <RetroGrid angle={65} cellSize={50} opacity={0.15} lineColor="#3a3a3a" />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Placement History</h1>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            Historical placement trends across years, tracked as students are marked "selected."
          </p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
            <span className="text-slate-400 text-sm">Total Students Placed (All Time)</span>
            <p className="text-white text-3xl font-bold mt-1">{data.total_placed}</p>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
            <h2 className="text-white font-semibold mb-4">Placements by Year</h2>
            {data.yearly_trend.length === 0 ? (
              <p className="text-slate-400 text-sm">No placement history yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.yearly_trend}>
                  <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #ffffff20', borderRadius: '8px' }} />
                  <Bar dataKey="placements" fill="#a855f7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-purple-400" />
              <h2 className="text-white font-semibold">Top Recruiting Companies</h2>
            </div>
            {data.top_companies.length === 0 ? (
              <p className="text-slate-400 text-sm">No placement history yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {data.top_companies.map((c, i) => (
                  <div key={c.company} className="flex justify-between items-center bg-black/30 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-xs w-5">#{i + 1}</span>
                      <span className="text-white text-sm">{c.company}</span>
                    </div>
                    <span className="text-purple-300 text-sm font-semibold">{c.placements} placed</span>
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

export default PlacementHistory