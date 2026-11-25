import { useState, useEffect } from 'react'
import api from '../services/api'
import { FileText, Users, CheckCircle, Clock, TrendingUp, AlertTriangle, Shield, Sparkles, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'

function StatCard({ icon: Icon, label, value, color, change }) {
  return (
    <div className="card flex items-start gap-4">
      <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-3xl font-black text-white">{value ?? '—'}</p>
        <p className="text-sm text-gray-400 mt-0.5">{label}</p>
        {change !== undefined && (
          <p className={clsx('text-xs mt-1', change >= 0 ? 'text-green-400' : 'text-red-400')}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from yesterday
          </p>
        )}
      </div>
    </div>
  )
}

const PRIORITY_BADGE = { CRITICAL: 'badge-critical', HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' }
const STATUS_BADGE = { OPEN: 'badge-open', IN_PROGRESS: 'badge-in_progress', RESOLVED: 'badge-resolved', CLOSED: 'badge-closed' }

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/reports?status=OPEN&sort=priority,desc&size=8'),
    ]).then(([s, p]) => {
      setStats(s.data)
      setPending(p.data.content || [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="p-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl shimmer" />)}
      </div>
    </div>
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-purple-400" />
          <h1 className="text-3xl font-black text-white">Admin Overview</h1>
        </div>
        <p className="text-gray-400">Monitor all reports and manage civic infrastructure issues.</p>
      </div>

      {/* Flagsmith Hackathon Live Experiment Quick Banner */}
      <div className="card bg-gradient-to-r from-purple-950/40 via-gray-900 to-teal-950/30 border border-purple-500/30 p-5 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white">Flagsmith Experiment Active: smart_road_dashboard</span>
              <span className="text-[10px] bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-0.5 rounded-full font-medium">
                50/50 Multivariate Split
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Testing Version A (Control) vs Version B (Smart Road Monitoring Dashboard).
            </p>
          </div>
        </div>
        <Link
          to="/admin/analytics"
          className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 flex-shrink-0 bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-700 hover:to-teal-600"
        >
          View Experiment Analytics <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FileText} label="Total Reports" value={stats?.totalReports} color="bg-blue-600" change={12} />
        <StatCard icon={Clock} label="Open Issues" value={stats?.openReports} color="bg-orange-500" change={-5} />
        <StatCard icon={TrendingUp} label="In Progress" value={stats?.inProgressReports} color="bg-purple-600" change={8} />
        <StatCard icon={CheckCircle} label="Resolved" value={stats?.resolvedReports} color="bg-green-600" change={23} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority queue */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" /> Priority Queue
            </h2>
            <Link to="/admin/reports" className="text-sm text-blue-400 hover:underline">View all →</Link>
          </div>

          {pending.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-600" />
              All caught up! No open issues.
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {pending.map(r => (
                <Link key={r.id} to={`/report/${r.id}`}
                  className="flex items-center gap-3 py-3 hover:bg-gray-800/30 -mx-2 px-2 rounded-xl transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors truncate">{r.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{r.category} · {r.reporter?.name} · {r.location?.address || 'No location'}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={PRIORITY_BADGE[r.priority] || 'badge'}>{r.priority}</span>
                    <span className={STATUS_BADGE[r.status] || 'badge'}>{r.status?.replace('_', ' ')}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div className="card">
          <h2 className="font-bold text-white mb-5">Category Breakdown</h2>
          {stats?.categoryBreakdown ? (
            <div className="space-y-3">
              {Object.entries(stats.categoryBreakdown).map(([cat, count]) => {
                const pct = Math.round((count / (stats.totalReports || 1)) * 100)
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">{cat}</span>
                      <span className="text-gray-500">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-teal-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No data yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
