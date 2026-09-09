import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { RetroGrid } from '../components/RetroGrid'

// const API = 'http://127.0.0.1:8000'
   const API = import.meta.env.VITE_API_URL

const statusStyles = {
  applied: 'bg-slate-500/20 text-slate-300',
  shortlisted: 'bg-yellow-500/20 text-yellow-300',
  interviewed: 'bg-blue-500/20 text-blue-300',
  selected: 'bg-green-500/20 text-green-300',
  rejected: 'bg-red-500/20 text-red-300',
}

function PipelineTracker({ rounds }) {
  if (!rounds || rounds.length === 0) return null

  return (
    <div className="flex items-center gap-1 mt-3 overflow-x-auto">
      {rounds.map((round, i) => (
        <div key={round.id} className="flex items-center gap-1 shrink-0">
          <div
            className={`flex flex-col items-center px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${
              round.outcome === 'passed'
                ? 'bg-green-500/10 text-green-300 border border-green-500/30'
                : round.outcome === 'failed'
                ? 'bg-red-500/10 text-red-300 border border-red-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10'
            }`}
          >
            <span className="font-medium">{round.round_name}</span>
            <span className="text-[10px] opacity-80 capitalize">{round.outcome}</span>
          </div>
          {i < rounds.length - 1 && <span className="text-slate-600">→</span>}
        </div>
      ))}
    </div>
  )
}

function Applications() {
  const [applications, setApplications] = useState([])
  const [roundsMap, setRoundsMap] = useState({})
  const token = localStorage.getItem('token')
  const authHeader = { Authorization: `Bearer ${token}` }

  const loadAllRounds = async (apps) => {
    const map = {}
    for (const app of apps) {
      try {
        const res = await axios.get(`${API}/applications/${app.id}/rounds`, { headers: authHeader })
        map[app.id] = res.data
      } catch {
        map[app.id] = []
      }
    }
    setRoundsMap(map)
  }

  useEffect(() => {
    axios
      .get(`${API}/applications/me`, { headers: authHeader })
      .then((res) => {
        setApplications(res.data)
        loadAllRounds(res.data)
      })
  }, [])

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <RetroGrid angle={65} cellSize={50} opacity={0.15} lineColor="#3a3a3a" />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-bold text-white mb-6">My Applications</h1>

          <div className="flex flex-col gap-4">
            {applications.length === 0 && <p className="text-slate-400">You haven't applied to any drives yet.</p>}
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-5"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-white font-semibold">{app.drive.role}</h2>
                    <p className="text-slate-400 text-sm">{app.drive.company.name}</p>
                  </div>
                  <span
                    className={`${statusStyles[app.status] || 'bg-slate-500/20 text-slate-300'} text-xs font-semibold px-3 py-1.5 rounded-full capitalize`}
                  >
                    {app.status}
                  </span>
                </div>
                <PipelineTracker rounds={roundsMap[app.id]} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Applications