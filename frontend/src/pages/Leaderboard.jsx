import { useEffect, useState } from 'react'
import axios from 'axios'
import { Trophy, Medal } from 'lucide-react'
import Navbar from '../components/Navbar'
import { RetroGrid } from '../components/RetroGrid'

// const API = 'http://127.0.0.1:8000'
   const API = import.meta.env.VITE_API_URL

function getRankColor(rank) {
  if (rank === 1) return 'text-yellow-400'
  if (rank === 2) return 'text-slate-300'
  if (rank === 3) return 'text-orange-400'
  return 'text-slate-500'
}

function Leaderboard() {
  const [data, setData] = useState(null)
  const token = localStorage.getItem('token')

  useEffect(() => {
    axios
      .get(`${API}/leaderboard`, { headers: { Authorization: `Bearer ${token}` } })
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
        <div className="max-w-2xl mx-auto px-6 py-10">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Placement Readiness Leaderboard</h1>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            Ranked by AI-predicted placement readiness. Improve your profile to climb the ranks!
          </p>

          {data.my_rank && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-5 mb-6 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs mb-1">Your Rank</p>
                <p className="text-white text-2xl font-bold">#{data.my_rank.rank}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-xs mb-1">Your Readiness</p>
                <p className="text-purple-300 text-xl font-semibold">{data.my_rank.readiness_score}%</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {data.leaderboard.map((entry) => (
              <div
                key={entry.student_id}
                className={`bg-white/5 border rounded-xl p-4 flex items-center gap-4 ${
                  data.my_rank?.student_id === entry.student_id
                    ? 'border-purple-500/50'
                    : 'border-white/10'
                }`}
              >
                <div className={`w-8 text-center font-bold ${getRankColor(entry.rank)}`}>
                  {entry.rank <= 3 ? <Medal className="w-5 h-5 mx-auto" /> : `#${entry.rank}`}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{entry.name}</p>
                  <p className="text-slate-500 text-xs">
                    {entry.branch || 'Branch not set'} · {entry.skill_count} skills · {entry.profile_completeness}% complete
                  </p>
                </div>
                <div className="text-purple-300 font-semibold text-sm">
                  {entry.readiness_score}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard