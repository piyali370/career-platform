import { Link } from 'react-router-dom'
import { RetroGrid } from '../components/RetroGrid'

function NotFound() {
  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <RetroGrid angle={65} cellSize={50} opacity={0.2} lineColor="#3a3a3a" />
      <div className="relative z-10 text-center">
        <h1 className="text-6xl font-bold text-white mb-2">404</h1>
        <p className="text-slate-400 mb-6">Page not found</p>
        <Link
          to="/dashboard"
          className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-sm font-semibold py-2.5 px-6 rounded-full transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFound