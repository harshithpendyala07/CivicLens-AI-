import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, FileText, BarChart2, LogOut,
  Eye, ChevronRight, Shield, Sparkles
} from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { path: '/admin',             icon: LayoutDashboard, label: 'Overview' },
  { path: '/admin/reports',     icon: FileText,        label: 'All Reports' },
  { path: '/admin/experiments', icon: Sparkles,        label: 'Experiment Analytics' },
  { path: '/admin/analytics',   icon: BarChart2,       label: 'Defect Analytics' },
]

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <aside className="w-64 flex flex-col bg-purple-950/40 border-r border-purple-900/50">
        <div className="p-6 border-b border-purple-900/50">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Admin Panel</p>
              <p className="text-xs text-purple-400">CivicLens AI</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path
            return (
              <Link key={path} to={path}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}>
                <Icon className="w-4 h-4" />
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            )
          })}
          <hr className="border-gray-800 my-2" />
          <Link to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <Eye className="w-4 h-4" />
            Citizen View
          </Link>
        </nav>
        <div className="p-4 border-t border-purple-900/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-900/20">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-purple-400">Administrator</p>
            </div>
            <button onClick={() => { logout(); navigate('/') }} className="text-gray-500 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="min-h-full">
          {children}
        </motion.div>
      </main>
    </div>
  )
}
