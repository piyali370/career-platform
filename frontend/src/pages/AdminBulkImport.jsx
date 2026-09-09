import { useState } from 'react'
import axios from 'axios'
import { Upload, Download, CheckCircle, XCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import { RetroGrid } from '../components/RetroGrid'

// const API = 'http://127.0.0.1:8000'
   const API = import.meta.env.VITE_API_URL

function AdminBulkImport() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setResult(null)
    setError('')
  }

      const handleUpload = async () => {
    if (!file || loading) return
    setLoading(true)             
    setError('')
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await axios.post(`${API}/admin/students/bulk-import`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Import failed. Please check your file.')
    } finally {
      setLoading(false)
    }
  }

  const downloadSampleCsv = () => {
    const sample =
      'name,email,branch,batch_year,cgpa,backlogs\nJohn Doe,john@example.com,CSE,2025,8.2,0\nJane Smith,jane@example.com,ECE,2025,7.5,1'
    const blob = new Blob([sample], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'sample_students.csv')
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <RetroGrid angle={65} cellSize={50} opacity={0.15} lineColor="#3a3a3a" />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-bold text-white mb-1">Bulk Student Import</h1>
          <p className="text-slate-400 text-sm mb-6">
            Upload a CSV or Excel file to create multiple student accounts at once.
          </p>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 mb-4">
            <p className="text-slate-400 text-sm mb-3">
              Required columns: <code className="text-purple-300">name, email, branch, batch_year, cgpa, backlogs</code>
            </p>
            <button
              onClick={downloadSampleCsv}
              className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm mb-5"
            >
              <Download className="w-4 h-4" />
              Download sample CSV
            </button>

            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-white/20 rounded-xl py-8 cursor-pointer hover:border-purple-500/50 transition">
              <input type="file" accept=".csv,.xlsx" onChange={handleFileChange} className="hidden" />
              <Upload className="w-5 h-5 text-slate-400" />
              <span className="text-slate-400 text-sm">
                {file ? file.name : 'Click to select a .csv or .xlsx file'}
              </span>
            </label>

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="mt-4 w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50"
            >
              {loading ? 'Importing...' : 'Import Students'}
            </button>

            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          </div>

          {result && (
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  {result.created_count} created
                </div>
                {result.skipped_count > 0 && (
                  <div className="flex items-center gap-2 text-yellow-400 text-sm">
                    <XCircle className="w-4 h-4" />
                    {result.skipped_count} skipped
                  </div>
                )}
              </div>

              {result.created.length > 0 && (
                <div className="mb-4">
                <p className="text-slate-400 text-xs mb-2">Created accounts — credentials emailed automatically</p> 
                  <div className="flex flex-col gap-2">
                    {result.created.map((s) => (
                      <div key={s.email} className="bg-black/30 rounded-xl px-4 py-2.5 flex justify-between items-center text-sm">
                        <div>
                          <p className="text-white">{s.name}</p>
                          <p className="text-slate-500 text-xs">{s.email}</p>
                        </div>
                        <div className="text-right">
                          <code className="text-purple-300 text-xs block">{s.temp_password}</code>
                          <span className={`text-xs ${s.email_sent ? 'text-green-400' : 'text-yellow-400'}`}>
                            {s.email_sent ? '✓ Email sent' : '⚠ Email failed'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.skipped.length > 0 && (
                <div>
                  <p className="text-slate-400 text-xs mb-2">Skipped</p>
                  <div className="flex flex-col gap-2">
                    {result.skipped.map((s) => (
                      <div key={s.email} className="bg-black/30 rounded-xl px-4 py-2.5 flex justify-between items-center text-sm">
                        <span className="text-slate-300">{s.email}</span>
                        <span className="text-slate-500 text-xs">{s.reason}</span>
                      </div>
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

export default AdminBulkImport