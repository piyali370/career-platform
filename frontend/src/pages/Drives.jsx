import { useEffect, useState } from 'react'
import axios from 'axios'
import { Briefcase, Sparkles, TrendingUp, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import { RetroGrid } from '../components/RetroGrid'

// const API = 'http://127.0.0.1:8000'
   const API = import.meta.env.VITE_API_URL

function getMatchColor(score) {
  if (score >= 60) return 'bg-green-500/20 text-green-300 border-green-500/30'
  if (score >= 35) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
  return 'bg-slate-500/20 text-slate-300 border-slate-500/30'
}

function Drives() {
  const [drives, setDrives] = useState([])
  const [matchScores, setMatchScores] = useState({})
  const [message, setMessage] = useState('')
  const [matchError, setMatchError] = useState('')
  const [gapData, setGapData] = useState(null)
  const [gapLoading, setGapLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [minCgpaFilter, setMinCgpaFilter] = useState('')
  const [minMatchFilter, setMinMatchFilter] = useState('')
  const token = localStorage.getItem('token')
  const authHeader = { Authorization: `Bearer ${token}` }

  const loadDrives = () => {
    axios.get(`${API}/drives`).then((res) => setDrives(res.data))
  }

  const loadMatches = () => {
    axios
      .get(`${API}/drives/matches`, { headers: authHeader })
      .then((res) => {
        const scoreMap = {}
        res.data.forEach((m) => {
          scoreMap[m.drive_id] = m.match_score
        })
        setMatchScores(scoreMap)
      })
      .catch((err) => {
        setMatchError(err.response?.data?.detail || '')
      })
  }

  useEffect(() => {
    loadDrives()
    loadMatches()
  }, [])

  const handleApply = async (driveId) => {
    setMessage('')
    try {
      await axios.post(`${API}/applications`, { drive_id: driveId }, { headers: authHeader })
      setMessage('Applied successfully!')
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to apply.')
    }
  }

  const handleViewGap = async (driveId) => {
    setGapLoading(true)
    setGapData(null)
    try {
      const res = await axios.get(`${API}/drives/${driveId}/skill-gap`, { headers: authHeader })
      setGapData(res.data)
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to load skill gap.')
    } finally {
      setGapLoading(false)
    }
  }

    const filteredDrives = drives.filter((drive) => {
    const search = searchTerm.trim().toLowerCase()
    const matchesSearch =
      !search ||
      drive.role.toLowerCase().includes(search) ||
      drive.company.name.toLowerCase().includes(search)

    const matchesCgpa =
      !minCgpaFilter || !drive.eligibility_cgpa || drive.eligibility_cgpa <= parseFloat(minCgpaFilter)

    const score = matchScores[drive.id]
    const matchesScore = !minMatchFilter || (score !== undefined && score >= parseFloat(minMatchFilter))

    return matchesSearch && matchesCgpa && matchesScore
  })

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <RetroGrid angle={65} cellSize={50} opacity={0.15} lineColor="#3a3a3a" />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-bold text-white mb-2">Open Drives</h1>

          {matchError && (
            <p className="text-slate-400 text-sm mb-4">
              💡 {matchError}
            </p>
          )}
          {!matchError && (
            <p className="text-slate-400 text-sm mb-6 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Match scores are based on your uploaded resume
            </p>
          )}

          {message && <p className="text-yellow-400 mb-4 text-sm">{message}</p>}

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search by role or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 outline-none focus:border-purple-500 transition text-sm"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Your CGPA"
              value={minCgpaFilter}
              onChange={(e) => setMinCgpaFilter(e.target.value)}
              className="w-full sm:w-32 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 outline-none focus:border-purple-500 transition text-sm"
            />
            <input
              type="number"
              min="0"
              max="100"
              placeholder="Min match %"
              value={minMatchFilter}
              onChange={(e) => setMinMatchFilter(e.target.value)}
              className="w-full sm:w-32 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 outline-none focus:border-purple-500 transition text-sm"
            />
          </div>

          <div className="flex flex-col gap-4">
            {filteredDrives.length === 0 && (
              <p className="text-slate-400">
                {drives.length === 0 ? 'No drives posted yet.' : 'No drives match your filters.'}
              </p>
            )}
            {filteredDrives.map((drive) => {
              const score = matchScores[drive.id]
              return (
                <div key={drive.id} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-white font-semibold text-lg">{drive.role}</h2>
                      <p className="text-slate-400 text-sm">{drive.company.name}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {score !== undefined && (
                        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${getMatchColor(score)}`}>
                          {score}% match
                        </span>
                      )}
                      <Briefcase className="w-5 h-5 text-purple-400" />
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2">
                    {drive.package && <p className="text-slate-400 text-xs">Package: {drive.package}</p>}
                    {drive.eligibility_cgpa && <p className="text-slate-400 text-xs">Min CGPA: {drive.eligibility_cgpa}</p>}
                  </div>
                  {drive.jd_text && <p className="text-slate-300 text-sm mt-3">{drive.jd_text}</p>}

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleApply(drive.id)}
                      className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-sm font-semibold py-2 px-5 rounded-full transition"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => handleViewGap(drive.id)}
                      className="flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium py-2 px-4 rounded-full transition"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Skill Gap
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {gapLoading && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <p className="text-white">Analyzing skill gap...</p>
        </div>
      )}

      {gapData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4" onClick={() => setGapData(null)}>
          <div
            className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-white font-semibold text-lg">Skill Gap Analysis</h2>
                <p className="text-slate-400 text-sm">{gapData.drive_role} — {gapData.company_name}</p>
              </div>
              <button onClick={() => setGapData(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!gapData.no_skills_detected && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Skill Match</span>
                  <span className="text-white font-semibold">{gapData.match_percentage}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
                    style={{ width: `${gapData.match_percentage}%` }}
                  />
                </div>
              </div>
            )}

            {gapData.matched_skills.length > 0 && (
              <div className="mb-4">
                <p className="text-slate-400 text-xs mb-2">You already have</p>
                <div className="flex flex-wrap gap-1.5">
                  {gapData.matched_skills.map((skill) => (
                    <span key={skill} className="bg-green-500/10 text-green-300 border border-green-500/20 text-xs px-2.5 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {gapData.no_skills_detected ? (
              <p className="text-slate-400 text-sm">
                We couldn't detect specific technical skills in this job description to compare against.
              </p>
            ) : gapData.missing_skills.length > 0 ? (
              <div>
                <p className="text-slate-400 text-xs mb-2">Consider learning</p>
                <div className="flex flex-col gap-2">
                  {gapData.recommendations.map((rec) => (
                    <div key={rec.skill} className="bg-white/5 rounded-xl px-3 py-2 flex items-center justify-between">
                      <span className="text-white text-sm">{rec.skill}</span>
                      {rec.resource_url ? (
                        <a
                          href={rec.resource_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:underline text-xs"
                        >
                          Learn →
                        </a>
                      ) : (
                        <span className="text-slate-500 text-xs">Search online</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-green-400 text-sm">You match all detected skills for this role! 🎉</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Drives