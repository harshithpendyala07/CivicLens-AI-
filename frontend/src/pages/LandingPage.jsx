import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Eye, Zap, Map, Shield, ArrowRight, CheckCircle,
  Camera, AlertTriangle, TrendingUp, Globe
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  {
    icon: Camera,
    color: 'from-blue-600 to-blue-400',
    title: 'AI Vision Engine',
    desc: 'Upload a photo and our Gemini-powered AI instantly identifies potholes, water leaks, garbage, and more with 90%+ accuracy.'
  },
  {
    icon: Map,
    color: 'from-teal-600 to-teal-400',
    title: 'Smart Issue Map',
    desc: 'Real-time geographic visualization of all reported issues. Identify hotspots and prioritize high-impact areas.'
  },
  {
    icon: Zap,
    color: 'from-purple-600 to-purple-400',
    title: 'AI Classification',
    desc: 'Automatic categorization and urgency scoring powered by multimodal AI. No more manual triage delays.'
  },
  {
    icon: Shield,
    color: 'from-orange-600 to-orange-400',
    title: 'Verified Workflow',
    desc: 'Human-in-the-loop verification ensures accuracy. AI suggests, humans confirm — building community trust.'
  },
  {
    icon: AlertTriangle,
    color: 'from-red-600 to-red-400',
    title: 'Duplicate Detection',
    desc: 'Intelligent deduplication prevents redundant reports, keeping the database clean and actionable.'
  },
  {
    icon: TrendingUp,
    color: 'from-green-600 to-green-400',
    title: 'Admin Analytics',
    desc: 'Real-time dashboards track resolution rates, response times, and infrastructure health trends.'
  },
]

const STATS = [
  { value: '90%+', label: 'AI Detection Accuracy' },
  { value: '< 2min', label: 'Average Analysis Time' },
  { value: '5x', label: 'Faster Issue Resolution' },
  { value: '10K+', label: 'Issues Tracked' },
]

export default function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center">
              <Eye className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-white">CivicLens AI</span>
            <span className="hidden sm:block text-xs text-gray-500 ml-1">harshith.embarko.app</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="btn-primary text-sm py-2">
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-24 px-6 overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="text-white">See the problem.</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-teal-400 to-blue-400 bg-clip-text text-transparent">
                Understand it. Fix it.
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              CivicLens AI uses Gemini-powered vision to detect, analyze, and track infrastructure issues —
              from campus potholes to city-wide water leaks. Report in seconds, resolve in days.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-4 flex items-center gap-2 group">
                Start Reporting Issues
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/map" className="btn-secondary text-lg px-8 py-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                View Live Map
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          >
            {STATS.map(({ value, label }) => (
              <div key={label} className="card-glass text-center">
                <p className="text-3xl font-black text-white mb-1">{value}</p>
                <p className="text-sm text-gray-400">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Demo Cards */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-gray-800 shadow-2xl gradient-border">
            <div className="bg-gray-900 px-4 py-3 flex items-center gap-2 border-b border-gray-800">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-3 text-xs text-gray-500">harshith.embarko.app/dashboard</span>
            </div>
            <div className="bg-gray-950 p-8 min-h-72 flex items-center justify-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
                {[
                  { label: 'Open Issues', value: '127', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: '🔵' },
                  { label: 'Resolved Today', value: '23', color: 'text-green-400', bg: 'bg-green-500/10', icon: '✅' },
                  { label: 'AI Analyzed', value: '98%', color: 'text-teal-400', bg: 'bg-teal-500/10', icon: '🤖' },
                ].map(({ label, value, color, bg, icon }) => (
                  <div key={label} className={`${bg} border border-white/5 rounded-xl p-5`}>
                    <div className="text-2xl mb-2">{icon}</div>
                    <div className={`text-3xl font-black ${color}`}>{value}</div>
                    <div className="text-sm text-gray-400 mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Everything you need to fix your city</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Built with React, Spring Boot, and Gemini AI — a production-grade platform, not just a college project.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, color, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                viewport={{ once: true }}
                className="card hover:border-gray-700 transition-colors group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-blue-600/20 to-teal-500/20 border border-blue-500/30 rounded-3xl p-12">
            <div className="relative">
              <h2 className="text-4xl font-black text-white mb-4">Ready to transform your campus?</h2>
              <p className="text-gray-300 mb-8">Join CivicLens AI and start making infrastructure problems visible, trackable, and solvable.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary text-lg px-8 py-4 flex items-center gap-2 justify-center">
                  Create Free Account <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">CivicLens AI — <span className="text-blue-400">harshith.embarko.app</span></span>
          </div>
          <p className="text-xs text-gray-600">CivicLens AI · React + Spring Boot + Gemini AI</p>
        </div>
      </footer>
    </div>
  )
}
