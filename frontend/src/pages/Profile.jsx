import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { RetroGrid } from '../components/RetroGrid'

// const API = 'http://127.0.0.1:8000'
   const API = import.meta.env.VITE_API_URL

function Profile() {
  const [branch, setBranch] = useState('')
  const [batchYear, setBatchYear] = useState('')
  const [cgpa, setCgpa] = useState('')
  const [backlogs, setBacklogs] = useState(0)
  const [profile, setProfile] = useState(null)
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [feedbackLoading, setFeedbackLoading] = useState(false)

  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const authHeader = { Authorization: `Bearer ${token}` }

  const loadProfile = () => {
    axios
      .get(`${API}/students/me`, { headers: authHeader })
      .then((res) => {
        setProfile(res.data)
        setBranch(res.data.branch || '')
        setBatchYear(res.data.batch_year || '')
        setCgpa(res.data.cgpa || '')
        setBacklogs(res.data.backlogs || 0)
      })
      .catch(() => {})
  }

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    axios
      .get(`${API}/me`, { headers: authHeader })
      .then((res) => {
        if (res.data.role !== 'student') {
          navigate('/dashboard')
          return
        }
        loadProfile()
      })
      .catch(() => {
        navigate('/login')
      })
  }, [])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const res = await axios.post(
        `${API}/students/me`,
        {
          branch,
          batch_year: batchYear ? parseInt(batchYear) : null,
          cgpa: cgpa ? parseFloat(cgpa) : null,
          backlogs: parseInt(backlogs) || 0,
        },
        { headers: authHeader }
      )
      setProfile(res.data)
      setMessage('Profile saved!')
    } catch (err) {
      setMessage('Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleFileChange = (e) => setFile(e.target.files[0])

  const handleUploadResume = async () => {
    if (!file) {
      setMessage('Please choose a file first.')
      return
    }
    setUploading(true)
    setMessage('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await axios.post(`${API}/students/me/resume`, formData, {
        headers: { ...authHeader, 'Content-Type': 'multipart/form-data' },
      })
      setProfile(res.data)
      setMessage('Resume uploaded!')
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleParseResume = async () => {
    setParsing(true)
    setMessage('')
    try {
      const res = await axios.post(`${API}/students/me/resume/parse`, {}, { headers: authHeader })
      setProfile(res.data)
      setMessage('Resume parsed! Skills and contact info updated below.')
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Parsing failed.')
    } finally {
      setParsing(false)
    }
  }

    const handleGetFeedback = async () => {
    setFeedbackLoading(true)
    setMessage('')
    try {
      const res = await axios.post(`${API}/students/me/resume/feedback`, {}, { headers: authHeader })
      setFeedback(res.data)
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to get feedback.')
    } finally {
      setFeedbackLoading(false)
    }
  }

  const inputClass =
    'px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 outline-none focus:border-purple-500 transition'

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <RetroGrid angle={65} cellSize={50} opacity={0.15} lineColor="#3a3a3a" />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-lg mx-auto px-6 py-10 flex flex-col gap-5">
          <h1 className="text-2xl font-bold text-white">My Student Profile</h1>

          <Link to="/change-password" className="text-purple-400 hover:underline text-sm">
            Change Password
          </Link>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">Basic Info</h2>
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
              <input type="text" placeholder="Branch (e.g. CSE)" value={branch} onChange={(e) => setBranch(e.target.value)} className={inputClass} />
              <input type="number" placeholder="Batch Year" value={batchYear} onChange={(e) => setBatchYear(e.target.value)} className={inputClass} />
              <input type="number" step="0.01" placeholder="CGPA" value={cgpa} onChange={(e) => setCgpa(e.target.value)} className={inputClass} />
              <input type="number" placeholder="Backlogs" value={backlogs} onChange={(e) => setBacklogs(e.target.value)} className={inputClass} />
              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold py-2.5 rounded-full transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">Resume</h2>
            <input type="file" accept=".pdf,.docx" onChange={handleFileChange} className="text-slate-300 mb-4 block text-sm" />
            <div className="flex gap-3">
              <button
                onClick={handleUploadResume}
                disabled={uploading}
                className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium py-2 px-4 rounded-full transition disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Resume'}
              </button>
              <button
                onClick={handleParseResume}
                disabled={parsing || !profile?.resume_url}
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-sm font-medium py-2 px-4 rounded-full transition disabled:opacity-50"
              >
                {parsing ? 'Parsing...' : 'Parse Resume (AI)'}
              </button>
              <button
                onClick={handleGetFeedback}
                disabled={feedbackLoading || !profile?.resume_url}
                className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium py-2 px-4 rounded-full transition disabled:opacity-50"
              >
                {feedbackLoading ? 'Analyzing...' : 'Get AI Feedback'}
              </button>
            </div>
          </div>

          {message && <p className="text-yellow-400 text-sm">{message}</p>}

          {profile && (
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4">Extracted Data</h2>
              <p className="text-slate-300 text-sm mb-1">
                <span className="text-slate-500">Resume file:</span>{' '}
                {profile.resume_url ? profile.resume_url.split(/[\\/]/).pop() : 'Not uploaded'}
              </p>
              <div className="text-slate-300 text-sm mb-1">
            <span className="text-slate-500 block mb-2">Skills:</span>
            {profile.skills ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.split(',').map((skill) => (
                  <span
                    key={skill}
                    className="bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs px-2.5 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <span>None detected yet</span>
            )}
          </div>
              <p className="text-slate-300 text-sm mb-1">
                <span className="text-slate-500">Email found:</span> {profile.extracted_email || '—'}
              </p>
              <p className="text-slate-300 text-sm">
                <span className="text-slate-500">Phone found:</span> {profile.extracted_phone || '—'}
              </p>
            </div>
          )}
                    {feedback && (
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">AI Resume Feedback</h2>
                {feedback.overall_score !== null && (
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-2xl font-bold ${
                        feedback.overall_score >= 70
                          ? 'text-green-400'
                          : feedback.overall_score >= 40
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}
                    >
                      {feedback.overall_score}
                    </span>
                    <span className="text-slate-500 text-sm">/100</span>
                  </div>
                )}
              </div>

              {feedback.strengths?.length > 0 && (
                <div className="mb-4">
                  <p className="text-green-400 text-xs font-semibold mb-2">✓ Strengths</p>
                  <ul className="flex flex-col gap-1.5">
                    {feedback.strengths.map((s, i) => (
                      <li key={i} className="text-slate-300 text-sm flex gap-2">
                        <span className="text-green-400">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.improvements?.length > 0 && (
                <div className="mb-4">
                  <p className="text-yellow-400 text-xs font-semibold mb-2">💡 Suggested Improvements</p>
                  <ul className="flex flex-col gap-1.5">
                    {feedback.improvements.map((imp, i) => (
                      <li key={i} className="text-slate-300 text-sm flex gap-2">
                        <span className="text-yellow-400">•</span>
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.missing_sections?.length > 0 && (
                <div>
                  <p className="text-red-400 text-xs font-semibold mb-2">⚠ Missing Sections</p>
                  <div className="flex flex-wrap gap-1.5">
                    {feedback.missing_sections.map((section) => (
                      <span
                        key={section}
                        className="bg-red-500/10 text-red-300 border border-red-500/20 text-xs px-2.5 py-1 rounded-full"
                      >
                        {section}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile