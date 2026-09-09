import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { RetroGrid } from '../components/RetroGrid'

// const API = 'http://127.0.0.1:8000'
   const API = import.meta.env.VITE_API_URL

function AdminDrives() {
  const [companies, setCompanies] = useState([])
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [role, setRole] = useState('')
  const [packageAmt, setPackageAmt] = useState('')
  const [eligibilityCgpa, setEligibilityCgpa] = useState('')
  const [jdText, setJdText] = useState('')
  const [message, setMessage] = useState('')

  const token = localStorage.getItem('token')
  const authHeader = { Authorization: `Bearer ${token}` }

  const loadCompanies = () => {
    axios.get(`${API}/companies`).then((res) => setCompanies(res.data))
  }

  useEffect(() => {
    loadCompanies()
  }, [])

  const handleCreateCompany = async (e) => {
    e.preventDefault()
    setMessage('')
    try {
      await axios.post(`${API}/companies`, { name: companyName, industry }, { headers: authHeader })
      setCompanyName('')
      setIndustry('')
      setMessage('Company added!')
      loadCompanies()
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to add company.')
    }
  }

  const handleCreateDrive = async (e) => {
    e.preventDefault()
    setMessage('')
    try {
      await axios.post(
        `${API}/drives`,
        {
          company_id: parseInt(selectedCompany),
          role,
          package: packageAmt,
          eligibility_cgpa: eligibilityCgpa ? parseFloat(eligibilityCgpa) : null,
          jd_text: jdText,
        },
        { headers: authHeader }
      )
      setRole('')
      setPackageAmt('')
      setEligibilityCgpa('')
      setJdText('')
      setMessage('Drive posted!')
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to post drive.')
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
          <h1 className="text-2xl font-bold text-white">Admin: Post Drive</h1>

          {message && <p className="text-yellow-400 text-sm">{message}</p>}

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">Add Company</h2>
            <form onSubmit={handleCreateCompany} className="flex flex-col gap-3">
              <input type="text" placeholder="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className={inputClass} />
              <input type="text" placeholder="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputClass} />
              <button type="submit" className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 rounded-full transition">
                Add Company
              </button>
            </form>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">Post Drive</h2>
            <form onSubmit={handleCreateDrive} className="flex flex-col gap-3">
              <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} required className={inputClass}>
                <option value="" className="bg-black">Select Company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id} className="bg-black">{c.name}</option>
                ))}
              </select>
              <input type="text" placeholder="Role (e.g. SDE Intern)" value={role} onChange={(e) => setRole(e.target.value)} required className={inputClass} />
              <input type="text" placeholder="Package (e.g. 6 LPA)" value={packageAmt} onChange={(e) => setPackageAmt(e.target.value)} className={inputClass} />
              <input type="number" step="0.01" placeholder="Minimum CGPA" value={eligibilityCgpa} onChange={(e) => setEligibilityCgpa(e.target.value)} className={inputClass} />
              <textarea placeholder="Job Description" value={jdText} onChange={(e) => setJdText(e.target.value)} rows={4} className={inputClass} />
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold py-2.5 rounded-full transition"
              >
                Post Drive
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDrives