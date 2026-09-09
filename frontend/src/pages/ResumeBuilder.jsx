import { useState } from 'react'
import axios from 'axios'
import { Plus, Trash2, Download } from 'lucide-react'
import Navbar from '../components/Navbar'
import { RetroGrid } from '../components/RetroGrid'

// const API = 'http://127.0.0.1:8000'
   const API = import.meta.env.VITE_API_URL

const inputClass =
  'px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 outline-none focus:border-purple-500 transition w-full'

function ResumeBuilder() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [github, setGithub] = useState('')
  const [summary, setSummary] = useState('')
  const [skills, setSkills] = useState('')

  const [education, setEducation] = useState([
    { institution: '', degree: '', duration: '', cgpa: '' },
  ])
  const [experience, setExperience] = useState([])
  const [projects, setProjects] = useState([
    { title: '', description: '' },
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')

  // --- Education handlers ---
  const updateEducation = (index, field, value) => {
    const updated = [...education]
    updated[index][field] = value
    setEducation(updated)
  }
  const addEducation = () => setEducation([...education, { institution: '', degree: '', duration: '', cgpa: '' }])
  const removeEducation = (index) => setEducation(education.filter((_, i) => i !== index))

  // --- Experience handlers ---
  const updateExperience = (index, field, value) => {
    const updated = [...experience]
    updated[index][field] = value
    setExperience(updated)
  }
  const updateExperiencePoint = (expIndex, pointIndex, value) => {
    const updated = [...experience]
    updated[expIndex].points[pointIndex] = value
    setExperience(updated)
  }
  const addExperiencePoint = (expIndex) => {
    const updated = [...experience]
    updated[expIndex].points.push('')
    setExperience(updated)
  }
  const addExperience = () => setExperience([...experience, { role: '', company: '', duration: '', points: [''] }])
  const removeExperience = (index) => setExperience(experience.filter((_, i) => i !== index))

  // --- Project handlers ---
  const updateProject = (index, field, value) => {
    const updated = [...projects]
    updated[index][field] = value
    setProjects(updated)
  }
  const addProject = () => setProjects([...projects, { title: '', description: '' }])
  const removeProject = (index) => setProjects(projects.filter((_, i) => i !== index))

  const handleGenerate = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post(
        `${API}/resume-builder/generate`,
        {
          name,
          email,
          phone,
          linkedin,
          github,
          summary,
          skills,
          education,
          experience,
          projects,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      )

      // trigger a file download in the browser
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${name.replace(/\s+/g, '_') || 'resume'}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      setError('Failed to generate resume. Please check all fields.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <RetroGrid angle={65} cellSize={50} opacity={0.15} lineColor="#3a3a3a" />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-bold text-white mb-1">ATS Resume Builder</h1>
          <p className="text-slate-400 text-sm mb-6">
            Fill in your details to generate a clean, ATS-friendly resume PDF.
          </p>

          <form onSubmit={handleGenerate} className="flex flex-col gap-5">
            {/* Basic Info */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4">Basic Info</h2>
              <div className="flex flex-col gap-3">
                <input className={inputClass} placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input className={inputClass} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <input className={inputClass} placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input className={inputClass} placeholder="LinkedIn URL" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
                  <input className={inputClass} placeholder="GitHub URL" value={github} onChange={(e) => setGithub(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4">Summary</h2>
              <textarea
                className={inputClass}
                placeholder="A 2-3 line summary about yourself"
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>

            {/* Skills */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4">Skills</h2>
              <input
                className={inputClass}
                placeholder="Python, React, SQL, Git (comma-separated)"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>

            {/* Education */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-white font-semibold">Education</h2>
                <button type="button" onClick={addEducation} className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {education.map((edu, i) => (
                  <div key={i} className="bg-black/30 rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-xs">Entry {i + 1}</span>
                      {education.length > 1 && (
                        <button type="button" onClick={() => removeEducation(i)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input className={inputClass} placeholder="Institution" value={edu.institution} onChange={(e) => updateEducation(i, 'institution', e.target.value)} />
                    <input className={inputClass} placeholder="Degree (e.g. B.Tech CSE)" value={edu.degree} onChange={(e) => updateEducation(i, 'degree', e.target.value)} />
                    <div className="grid grid-cols-2 gap-3">
                      <input className={inputClass} placeholder="Duration (e.g. 2022-2026)" value={edu.duration} onChange={(e) => updateEducation(i, 'duration', e.target.value)} />
                      <input className={inputClass} placeholder="CGPA" value={edu.cgpa} onChange={(e) => updateEducation(i, 'cgpa', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-white font-semibold">Experience (optional)</h2>
                <button type="button" onClick={addExperience} className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              {experience.length === 0 && <p className="text-slate-500 text-sm">No experience added.</p>}
              <div className="flex flex-col gap-4">
                {experience.map((exp, i) => (
                  <div key={i} className="bg-black/30 rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-xs">Entry {i + 1}</span>
                      <button type="button" onClick={() => removeExperience(i)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input className={inputClass} placeholder="Role" value={exp.role} onChange={(e) => updateExperience(i, 'role', e.target.value)} />
                    <input className={inputClass} placeholder="Company" value={exp.company} onChange={(e) => updateExperience(i, 'company', e.target.value)} />
                    <input className={inputClass} placeholder="Duration" value={exp.duration} onChange={(e) => updateExperience(i, 'duration', e.target.value)} />
                    {exp.points.map((point, pi) => (
                      <input
                        key={pi}
                        className={inputClass}
                        placeholder="Achievement / responsibility"
                        value={point}
                        onChange={(e) => updateExperiencePoint(i, pi, e.target.value)}
                      />
                    ))}
                    <button type="button" onClick={() => addExperiencePoint(i)} className="text-purple-400 hover:text-purple-300 text-xs text-left">
                      + Add bullet point
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-white font-semibold">Projects</h2>
                <button type="button" onClick={addProject} className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {projects.map((proj, i) => (
                  <div key={i} className="bg-black/30 rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-xs">Entry {i + 1}</span>
                      {projects.length > 1 && (
                        <button type="button" onClick={() => removeProject(i)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input className={inputClass} placeholder="Project Title" value={proj.title} onChange={(e) => updateProject(i, 'title', e.target.value)} />
                    <textarea className={inputClass} placeholder="Short description" rows={2} value={proj.description} onChange={(e) => updateProject(i, 'description', e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {loading ? 'Generating...' : 'Generate Resume PDF'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResumeBuilder