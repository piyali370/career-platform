import { useEffect, useState } from 'react'
import axios from 'axios'
import { Sparkles } from 'lucide-react'
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

function getMatchColor(score) {
  if (score >= 60) return 'bg-green-500/20 text-green-300 border-green-500/30'
  if (score >= 35) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
  return 'bg-slate-500/20 text-slate-300 border-slate-500/30'
}

function AdminApplicants() {
  const [drives, setDrives] = useState([])
  const [selectedDrive, setSelectedDrive] = useState('')
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [schedulingId, setSchedulingId] = useState(null)
  const [interviewDate, setInterviewDate] = useState('')
  const [interviewNotes, setInterviewNotes] = useState('')

  const [expandedRounds, setExpandedRounds] = useState(null) // application_id currently expanded
  const [rounds, setRounds] = useState({}) // { application_id: [round, ...] }
  const [newRoundName, setNewRoundName] = useState('')
  const [roundOutcomes, setRoundOutcomes] = useState({}) // { round_id: { outcome, notes } }

  const token = localStorage.getItem('token')
  const authHeader = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    axios.get(`${API}/drives`).then((res) => setDrives(res.data))
  }, [])

  const loadApplicants = (driveId) => {
    if (!driveId) return
    setLoading(true)
    axios
      .get(`${API}/drives/${driveId}/applicants-ranked`, { headers: authHeader })
      .then((res) => setApplicants(res.data))
      .finally(() => setLoading(false))
  }

  const handleDriveChange = (e) => {
    const driveId = e.target.value
    setSelectedDrive(driveId)
    loadApplicants(driveId)
  }

  const handleStatusChange = async (applicationId, newStatus) => {
    setMessage('')
    try {
      await axios.patch(
        `${API}/applications/${applicationId}/status`,
        { status: newStatus },
        { headers: authHeader }
      )
      setApplicants((prev) =>
        prev.map((a) => (a.application_id === applicationId ? { ...a, status: newStatus } : a))
      )
      setMessage('Status updated!')
    } catch (err) {
      setMessage('Failed to update status.')
    }
  }

    const handleScheduleInterview = async (applicationId) => {
    if (!interviewDate) return
    try {
      await axios.patch(
        `${API}/applications/${applicationId}/schedule-interview`,
        { interview_datetime: interviewDate, interview_notes: interviewNotes },
        { headers: authHeader }
      )
      setApplicants((prev) =>
        prev.map((a) =>
          a.application_id === applicationId
            ? { ...a, interview_datetime: interviewDate, interview_notes: interviewNotes }
            : a
        )
      )
      setSchedulingId(null)
      setInterviewDate('')
      setInterviewNotes('')
      setMessage('Interview scheduled!')
    } catch (err) {
      setMessage('Failed to schedule interview.')
    }
  }

    const loadRounds = async (applicationId) => {
    try {
      const res = await axios.get(`${API}/applications/${applicationId}/rounds`, { headers: authHeader })
      setRounds((prev) => ({ ...prev, [applicationId]: res.data }))
    } catch (err) {
      setMessage('Failed to load rounds.')
    }
  }

  const toggleRounds = (applicationId) => {
    if (expandedRounds === applicationId) {
      setExpandedRounds(null)
    } else {
      setExpandedRounds(applicationId)
      loadRounds(applicationId)
    }
  }

  const handleAddRound = async (applicationId) => {
    if (!newRoundName.trim()) return
    try {
      await axios.post(
        `${API}/applications/${applicationId}/rounds`,
        { round_name: newRoundName },
        { headers: authHeader }
      )
      setNewRoundName('')
      loadRounds(applicationId)
    } catch (err) {
      setMessage('Failed to add round.')
    }
  }

  const handleUpdateRound = async (roundId, applicationId) => {
    const update = roundOutcomes[roundId]
    if (!update?.outcome) return
    try {
      await axios.patch(
        `${API}/rounds/${roundId}`,
        { outcome: update.outcome, notes: update.notes || '' },
        { headers: authHeader }
      )
      loadRounds(applicationId)
      setMessage('Round updated!')
    } catch (err) {
      setMessage('Failed to update round.')
    }
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <RetroGrid angle={65} cellSize={50} opacity={0.15} lineColor="#3a3a3a" />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-bold text-white mb-2">Ranked Applicants</h1>
          <p className="text-slate-400 text-sm flex items-center gap-1 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Applicants ranked by AI match score against the job description
          </p>

          <select
            value={selectedDrive}
            onChange={handleDriveChange}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500 transition mb-6 w-full max-w-sm"
          >
            <option value="" className="bg-black">Select a drive</option>
            {drives.map((d) => (
              <option key={d.id} value={d.id} className="bg-black">
                {d.role} — {d.company.name}
              </option>
            ))}
          </select>

          {message && <p className="text-yellow-400 text-sm mb-4">{message}</p>}
          {loading && <p className="text-slate-400">Loading applicants...</p>}

          {!loading && selectedDrive && applicants.length === 0 && (
            <p className="text-slate-400">No applicants for this drive yet.</p>
          )}

          <div className="flex flex-col gap-4">
            {applicants.map((app) => (
              <div key={app.application_id} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h2 className="text-white font-semibold">{app.student_name}</h2>
                    <p className="text-slate-400 text-sm">{app.student_email}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${getMatchColor(app.match_score)}`}>
                    {app.match_score}% match
                  </span>
                </div>

                <div className="flex gap-4 mb-2">
                  <p className="text-slate-400 text-xs">CGPA: {app.cgpa ?? '—'}</p>
                </div>

                {app.skills && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {app.skills.split(',').map((skill) => (
                      <span key={skill} className="bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs px-2.5 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className={`${statusStyles[app.status] || 'bg-slate-500/20 text-slate-300'} text-xs font-semibold px-3 py-1.5 rounded-full capitalize`}>
                    {app.status}
                  </span>
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.application_id, e.target.value)}
                    className="ml-auto px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-purple-500 transition"
                  >
                    <option value="applied" className="bg-black">Applied</option>
                    <option value="shortlisted" className="bg-black">Shortlisted</option>
                    <option value="interviewed" className="bg-black">Interviewed</option>
                    <option value="selected" className="bg-black">Selected</option>
                    <option value="rejected" className="bg-black">Rejected</option>
                  </select>
                </div>

                  {app.interview_datetime && (
                  <p className="text-purple-300 text-xs mt-2">
                    📅 Interview: {new Date(app.interview_datetime).toLocaleString()}
                    {app.interview_notes && ` — ${app.interview_notes}`}
                  </p>
                )}

                {schedulingId === app.application_id ? (
                  <div className="mt-3 bg-black/30 rounded-xl p-3 flex flex-col gap-2">
                    <input
                      type="datetime-local"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-purple-500 transition"
                    />
                    <input
                      type="text"
                      placeholder="Notes (e.g. link, venue)"
                      value={interviewNotes}
                      onChange={(e) => setInterviewNotes(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-purple-500 transition"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleScheduleInterview(app.application_id)}
                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setSchedulingId(null)}
                        className="bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSchedulingId(app.application_id)}
                    className="mt-2 text-purple-400 hover:text-purple-300 text-xs"
                  >
                    + Schedule Interview
                  </button>
                )}

                <div className="mt-3">
                  <button
                    onClick={() => toggleRounds(app.application_id)}
                    className="text-purple-400 hover:text-purple-300 text-xs"
                  >
                    {expandedRounds === app.application_id ? '▲ Hide Pipeline' : '▼ View/Manage Pipeline'}
                  </button>

                  {expandedRounds === app.application_id && (
                    <div className="mt-3 bg-black/30 rounded-xl p-3 flex flex-col gap-3">
                      {(rounds[app.application_id] || []).map((round) => (
                        <div key={round.id} className="bg-white/5 rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white text-xs font-medium">
                              {round.round_order}. {round.round_name}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                round.outcome === 'passed'
                                  ? 'bg-green-500/20 text-green-300'
                                  : round.outcome === 'failed'
                                  ? 'bg-red-500/20 text-red-300'
                                  : 'bg-slate-500/20 text-slate-300'
                              }`}
                            >
                              {round.outcome}
                            </span>
                          </div>
                          {round.notes && <p className="text-slate-400 text-xs mb-2">{round.notes}</p>}
                          <div className="flex gap-2">
                            <select
                              value={roundOutcomes[round.id]?.outcome || round.outcome}
                              onChange={(e) =>
                                setRoundOutcomes((prev) => ({
                                  ...prev,
                                  [round.id]: { ...prev[round.id], outcome: e.target.value },
                                }))
                              }
                              className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none"
                            >
                              <option value="pending" className="bg-black">Pending</option>
                              <option value="passed" className="bg-black">Passed</option>
                              <option value="failed" className="bg-black">Failed</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Notes..."
                              onChange={(e) =>
                                setRoundOutcomes((prev) => ({
                                  ...prev,
                                  [round.id]: { ...prev[round.id], notes: e.target.value },
                                }))
                              }
                              className="flex-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none"
                            />
                            <button
                              onClick={() => handleUpdateRound(round.id, app.application_id)}
                              className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-3 py-1 rounded-lg transition"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ))}

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="New round name (e.g. HR Round)"
                          value={newRoundName}
                          onChange={(e) => setNewRoundName(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none"
                        />
                        <button
                          onClick={() => handleAddRound(app.application_id)}
                          className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg transition"
                        >
                          + Add Round
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminApplicants