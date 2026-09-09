import { CoverflowCarousel } from '../components/CoverflowCarousel'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Target, TrendingUp, Users, Briefcase, Sparkles, Menu, X } from 'lucide-react'
import { RetroGrid } from '../components/RetroGrid'
import Logo from '../components/Logo'
import { GraduationCap } from 'lucide-react'

function LandingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <div className="sticky top-4 z-50 flex justify-center px-4">
      <div className="w-full flex flex-col items-center">
        {/* Desktop nav — original single-row, auto-width style */}
        <nav className="hidden md:flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3 py-2 shadow-lg">
          <span className="text-white font-semibold px-3 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-400" fill="currentColor" />
            Career Platform
          </span>
          <div className="flex items-center bg-white/5 rounded-full px-1 py-1 gap-1">
            <button onClick={() => scrollTo('home')} className="text-sm px-4 py-1.5 rounded-full text-slate-400 hover:text-white transition whitespace-nowrap">
              Home
            </button>
            <button onClick={() => scrollTo('about')} className="text-sm px-4 py-1.5 rounded-full text-slate-400 hover:text-white transition whitespace-nowrap">
              About Us
            </button>
            <button onClick={() => scrollTo('contact')} className="text-sm px-4 py-1.5 rounded-full text-slate-400 hover:text-white transition whitespace-nowrap">
              Contact
            </button>
          </div>
          <Link
            to="/register"
            className="ml-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-sm font-medium px-5 py-2 rounded-full transition whitespace-nowrap"
          >
            Sign up
          </Link>
        </nav>

        {/* Mobile nav — logo + hamburger only */}
        <nav className="md:hidden w-full max-w-sm flex items-center justify-between bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 shadow-lg">
          <span className="text-white font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Career Platform
          </span>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white p-1"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden mt-2 w-full max-w-sm bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex flex-col gap-1 shadow-lg">
            <button onClick={() => scrollTo('home')} className="text-sm px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition text-left">
              Home
            </button>
            <button onClick={() => scrollTo('about')} className="text-sm px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition text-left">
              About Us
            </button>
            <button onClick={() => scrollTo('contact')} className="text-sm px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition text-left">
              Contact
            </button>
            <Link
              to="/register"
              onClick={() => setMenuOpen(false)}
              className="mt-1 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition text-center"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

const features = [
  {
    icon: FileText,
    title: 'AI Resume Parsing',
    description: 'Upload your resume and let AI extract your skills, contact info, and experience automatically.',
  },
  {
    icon: Target,
    title: 'Smart Job Matching',
    description: 'Get a real-time match score between your resume and every open drive, powered by semantic AI.',
  },
  {
    icon: TrendingUp,
    title: 'Placement Prediction',
    description: 'An ML model estimates your placement readiness based on your CGPA, skills, and academic record.',
  },
  {
    icon: Briefcase,
    title: 'Browse & Apply',
    description: 'Discover open drives from companies and apply in a single click, right from your dashboard.',
  },
  {
    icon: Users,
    title: 'Application Tracking',
    description: 'Track your application status in real time — applied, shortlisted, interviewed, or selected.',
  },
  {
    icon: Sparkles,
    title: 'For Admins Too',
    description: 'TPO/Admin accounts can post companies and drives, and manage applicant status with ease.',
  },
]

function Landing() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <RetroGrid angle={65} cellSize={50} opacity={0.25} lineColor="#4a4a4a" />

      <div className="relative z-10">
        <LandingNavbar />

        {/* Hero */}
        <section id="home" className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
          <span className="inline-flex items-center gap-1 text-sm text-slate-400 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            AI-Powered Career & Placement Platform
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.7)_100%)]">
            Land your dream job,
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              smarter and faster
            </span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto mb-8">
            Upload your resume, get matched to the right drives with AI, and track every
            application — all in one place built for students and placement cells.
          </p>
          <Link
            to="/register"
            className="inline-block bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold px-8 py-3 rounded-full transition"
          >
            Get Started
          </Link>
        </section>

        {/* Features */}
        <section id="about" className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">How it works</h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              Everything you need to go from resume to offer letter, powered by real AI.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 hover:border-purple-500/30 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Screenshots showcase */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">See it in action</h2>
            <p className="text-slate-400">A quick look at the platform, from either side.</p>
          </div>
          <CoverflowCarousel
            showCaption
            cardWidth="clamp(200px, 70vw, 420px)"
            slides={[
              { src: '/src/assets/screenshots/dashboard.png', alt: 'Dashboard', title: 'Dashboard', subtitle: 'Your placement readiness at a glance' },
              { src: '/src/assets/screenshots/profile.png', alt: 'Profile with AI parsing', title: 'AI Resume Parsing', subtitle: 'Skills extracted automatically' },
              { src: '/src/assets/screenshots/drives.png', alt: 'Drives with match scores', title: 'Smart Matching', subtitle: 'Real-time AI match scores' },
              { src: '/src/assets/screenshots/applications.png', alt: 'Applications tracking', title: 'Track Applications', subtitle: 'Status updates in real time' },
            ]}
          />
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-6 py-16 text-center">
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-10">
            <h2 className="text-2xl font-bold text-white mb-3">Ready to get started?</h2>
            <p className="text-slate-400 mb-6">
              Create your free account and see your placement readiness in minutes.
            </p>
            <Link
              to="/register"
              className="inline-block bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold px-8 py-3 rounded-full transition"
            >
              Get Started
            </Link>
          </div>
        </section>

        {/* Contact / Footer */}
        <footer id="contact" className="border-t border-white/10 mt-10">
          <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between gap-6">
            <div>
              <span className="text-white font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Career Platform
              </span>
              <p className="text-slate-500 text-sm mt-2 max-w-xs">
                An AI-powered career and placement management platform built as a final year project.
              </p>
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold mb-2">Contact</h4>
              <p className="text-slate-500 text-sm">piyalidebnath370@gmail.com</p>
              <p className="text-slate-500 text-sm">+916909569063</p>
            </div>
          </div>
          <div className="text-center text-slate-600 text-xs pb-6">
            © {new Date().getFullYear()} Career Platform. Built for academic purposes.
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Landing