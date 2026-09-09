import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { MessageCircle, X, Send } from 'lucide-react'

// const API = 'http://127.0.0.1:8000'
   const API = import.meta.env.VITE_API_URL

function RobotIcon({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <circle cx="50" cy="14" r="6" fill="currentColor" />
      <rect x="47" y="18" width="6" height="14" fill="currentColor" />
      <rect x="20" y="30" width="60" height="46" rx="23" fill="currentColor" />
      <rect x="28" y="38" width="44" height="30" rx="15" fill="black" fillOpacity="0.35" />
      <circle cx="41" cy="53" r="7" fill="black" />
      <circle cx="59" cy="53" r="7" fill="black" />
      <path d="M32 74 L40 92 L48 74 Z" fill="currentColor" />
      <path d="M52 74 L60 92 L68 74 Z" fill="currentColor" />
    </svg>
  )
}

function AssistantChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! Ask me about drives, your eligibility, or your application status." },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  const token = localStorage.getItem('token')

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (e) => {
    e.preventDefault()
    const question = input.trim()
    if (!question || loading) return

    setMessages((prev) => [...prev, { role: 'user', text: question }])
    setInput('')
    setLoading(true)

    try {
      const res = await axios.post(
        `${API}/assistant/ask`,
        { question },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessages((prev) => [...prev, { role: 'assistant', text: res.data.answer }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: err.response?.data?.detail || "Sorry, I couldn't process that. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-80 sm:w-96 h-[28rem] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
            <span className="text-white text-sm font-semibold flex items-center gap-2">
              <RobotIcon className="w-5 h-5 text-purple-400" />
              Placement Assistant
            </span>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-end gap-2 max-w-[90%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
                {msg.role === 'assistant' && (
                  <RobotIcon className="w-5 h-5 text-purple-400 shrink-0 mb-1" />
                )}
                <div
                  className={`text-sm px-3 py-2 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white rounded-br-sm'
                      : 'bg-white/5 text-slate-200 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="bg-white/5 text-slate-400 text-sm px-3 py-2 rounded-2xl rounded-bl-sm self-start">
                Thinking...
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-white/10">
            <input
              type="text"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 outline-none focus:border-purple-500 transition text-sm"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-xl transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-full shadow-2xl flex items-center justify-center transition"
      >
        {open ? <X className="w-6 h-6" /> : <RobotIcon className="w-10 h-10" />}
      </button>
    </div>
  )
}

export default AssistantChat