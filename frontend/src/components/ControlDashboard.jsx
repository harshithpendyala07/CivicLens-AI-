import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { FileText, Clock, AlertTriangle, Plus, TrendingUp, CheckCircle, Eye, ArrowRight, ShieldCheck } from 'lucide-react'
import { trackExperimentEvent, ExperimentEvents } from '../services/analytics'
import clsx from 'clsx'

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card flex items-start gap-4">
      <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-3xl font-black text-white">{value ?? '—'}</p>
        <p className="text-sm text-gray-400 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

const PRIORITY_COLORS = {
  CRITICAL: 'badge-critical',
  HIGH: 'badge-high',
  MEDIUM: 'badge-medium',
  LOW: 'badge-low',
}

const STATUS_COLORS = {
  OPEN: 'badge-open',
  IN_PROGRESS: 'badge-in_progress',
  RESOLVED: 'badge-resolved',
  CLOSED: 'badge-closed',
}

export default function ControlDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/reports/stats'),
      api.get('/reports?page=0&size=5&sort=createdAt,desc'),
    ])
      .then(([s, r]) => {
        setStats(s.data)
        setRecent(r.data.content || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleMapClick = () => {
    trackExperimentEvent('control', ExperimentEvents.MAP_INTERACTION, { source: 'control_quick_map' })
  }

  const handleReportClick = () => {
    trackExperimentEvent('control', ExperimentEvents.ISSUE_REPORT_SUBMIT, { source: 'control_header_button' })
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl shimmer" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400 mt-1">Here's what's happening in your city today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/map"
            onClick={handleMapClick}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Eye className="w-4 h-4" />
            View Map
          </Link>
          <Link
            to="/report"
            onClick={handleReportClick}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Report Issue
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FileText} label="Total Reports" value={stats?.total} color="bg-blue-600" />
        <StatCard icon={Clock} label="Open Issues" value={stats?.open} color="bg-orange-500" />
        <StatCard icon={TrendingUp} label="In Progress" value={stats?.inProgress} color="bg-purple-600" />
        <StatCard icon={CheckCircle} label="Resolved" value={stats?.resolved} color="bg-green-600" />
      </div>

      {/* Recent reports */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Recent Reports</h2>
          <Link to="/my-reports" className="text-sm text-blue-400 hover:underline">
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-16">
            <AlertTriangle className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No reports yet. Be the first to report an issue!</p>
            <Link
              to="/report"
              onClick={handleReportClick}
              className="btn-primary inline-flex items-center gap-2 mt-4 text-sm"
            >
              <Plus className="w-4 h-4" /> Report Now
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {recent.map((r) => (
              <Link
                key={r.id}
                to={`/report/${r.id}`}
                className="flex items-center gap-4 py-4 hover:bg-gray-800/30 -mx-2 px-2 rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                    {r.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {r.category} · {r.location?.address || 'Location pending'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className={STATUS_COLORS[r.status] || 'badge'}>
                    {r.status?.replace('_', ' ')}
                  </span>
                  <span className={PRIORITY_COLORS[r.priority] || 'badge'}>
                    {r.priority}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
