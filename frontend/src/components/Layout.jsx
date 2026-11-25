import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useFlags } from 'flagsmith/react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Map, FileText, Plus, LogOut,
  Bell, User, ChevronRight, Eye, Sparkles
} from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { path: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/report',     icon: Plus,            label: 'Report Issue' },
  { path: '/map',        icon: Map,             label: 'Issue Map' },
  { path: '/my-reports', icon: FileText,        label: 'My Reports' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const flags = useFlags(['smart_road_dashboard'])
  const isEnabled = Boolean(flags.smart_road_dashboard?.enabled)
  const flagValue = flags.smart_road_dashboard?.value
  const isExperiment = isEnabled || (typeof flagValue === 'string' && flagValue.includes('experiment'))

  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-gray-900 border-r border-gray-800">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center shadow-lg">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">CivicLens AI</p>
              <p className="text-xs text-gray-500">Flagsmith Hackathon</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path
            return (
              <Link key={path} to={path}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-gradient-to-r from-blue-600/20 to-teal-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            )
          })}
          {user?.role === 'ADMIN' && (
            <Link to="/admin"
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mt-4',
                location.pathname.startsWith('/admin')
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}>
              <LayoutDashboard className="w-4 h-4" />
              Admin Panel
            </Link>
          )}
        </nav>

        {/* Flagsmith Experiment Pill */}
        <div className="px-4 py-2 border-t border-gray-800/80">
          <div className="bg-purple-950/30 border border-purple-500/20 rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-purple-300 font-semibold mb-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Flagsmith A/B Active</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-tight">
              Variant:{' '}
              <span className={clsx('font-bold', isExperiment ? 'text-teal-400' : 'text-blue-400')}>
                {isExperiment ? 'Version B (Smart Road)' : 'Version A (Control)'}
              </span>
            </p>
          </div>
        </div>

        {/* User card */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="min-h-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
