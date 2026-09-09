import { useState, useEffect } from 'react'
import axios from 'axios'
import { Sparkles, Send, RotateCcw } from 'lucide-react'
import Navbar from '../components/Navbar'
import { RetroGrid } from '../components/RetroGrid'

// const API = 'http://127.0.0.1:8000'
   const API = import.meta.env.VITE_API_URL
const MAX_QUESTIONS = 10

function MockInterview() {
  const [role, setRole] = useState('')
  const [skills, setSkills] = useState('')
  const [started, setStarted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [completed, setCompleted] = useState(false)

  const [currentQuestion, setCurrentQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [history, setHistory] = useState([]) // { question, answer, feedback }
  const [feedbackLoading, setFeedbackLoading] = useState(false)

  const token = localStorage.getItem('token')
  const authHeader = { Authorization: `Bearer ${token}` }

  const fetchQuestion = async (previousQa) => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(
        `${API}/mock-interview/question`,
        { role, skills, previous_qa: previousQa },
        { headers: authHeader }
      )
      setCurrentQuestion(res.data.question)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load question.')
    } finally {
      setLoading(false)
    }
  }

  const handleStart = async (e) => {
    e.preventDefault()
    setStarted(true)
    setHistory([])
    await fetchQuestion([])
  }

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return
    setFeedbackLoading(true)
    setError('')

    try {
      const res = await axios.post(
        `${API}/mock-interview/feedback`,
        { role, question: currentQuestion, answer },
        { headers: authHeader }
      )

      const newEntry = { question: currentQuestion, answer, feedback: res.data.feedback }
      const updatedHistory = [...history, newEntry]
      setHistory(updatedHistory)
      setAnswer('')
      setCurrentQuestion('')

      if (updatedHistory.length >= MAX_QUESTIONS) {
        setCompleted(true)
        return
      }

      // fetch the next question, giving the AI the conversation so far
      await fetchQuestion(updatedHistory.map((h) => ({ question: h.question, answer: h.answer })))
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get feedback.')
    } finally {
      setFeedbackLoading(false)
    }
  }

  const handleRestart = () => {
    setStarted(false)
    setCompleted(false)
    setHistory([])
    setCurrentQuestion('')
    setAnswer('')
    setError('')
  }

  const inputClass =
    'px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 outline-none focus:border-purple-500 transition w-full'

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <RetroGrid angle={65} cellSize={50} opacity={0.15} lineColor="#3a3a3a" />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold text-white">AI Mock Interview</h1>
            {started && (
              <button onClick={handleRestart} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition">
                <RotateCcw className="w-4 h-4" />
                Restart
              </button>
            )}
          </div>
          <p className="text-slate-400 text-sm flex items-center gap-1 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Practice with AI-generated interview questions tailored to a role
          </p>

          {!started ? (
            <form onSubmit={handleStart} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col gap-3">
              <input
                className={inputClass}
                placeholder="Target role (e.g. Software Engineer)"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
              <input
                className={inputClass}
                placeholder="Your skills (comma-separated)"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold py-3 rounded-xl transition"
              >
                Start Interview
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Past Q&A with feedback */}
              {history.map((entry, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-slate-500 text-xs mb-1">Question {i + 1}</p>
                  <p className="text-white font-medium mb-3">{entry.question}</p>
                  <div className="bg-black/30 rounded-xl p-3 mb-3">
                    <p className="text-slate-500 text-xs mb-1">Your answer</p>
                    <p className="text-slate-300 text-sm">{entry.answer}</p>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                    <p className="text-purple-300 text-xs mb-1">Feedback</p>
                    <p className="text-slate-200 text-sm">{entry.feedback}</p>
                  </div>
                </div>
              ))}

              {/* Completed state */}
              {completed && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                  <p className="text-2xl mb-2">🎉</p>
                  <h2 className="text-white font-semibold text-lg mb-1">Interview Complete!</h2>
                  <p className="text-slate-400 text-sm mb-4">
                    You answered all {MAX_QUESTIONS} questions. Review your feedback above, or start a fresh session.
                  </p>
                  <button
                    onClick={handleRestart}
                    className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold py-2.5 px-6 rounded-xl transition"
                  >
                    Start New Interview
                  </button>
                </div>
              )}

              {/* Current question */}
              {!completed && loading && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-slate-400">Loading next question...</p>
                </div>
              )}
              {!completed && !loading && currentQuestion && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-slate-500 text-xs mb-1">Question {history.length + 1} of {MAX_QUESTIONS}</p>
                  <p className="text-white font-medium mb-4">{currentQuestion}</p>
                  <textarea
                    className={inputClass}
                    placeholder="Type your answer..."
                    rows={4}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                  />
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={feedbackLoading || !answer.trim()}
                    className="mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold py-2.5 px-5 rounded-xl transition disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {feedbackLoading ? 'Getting feedback...' : 'Submit Answer'}
                  </button>
                </div>
              )}

              {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MockInterview