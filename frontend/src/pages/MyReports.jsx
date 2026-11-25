import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { FileText, Search, Filter, ChevronRight, Eye } from 'lucide-react'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'

const STATUS_BADGE = { OPEN: 'badge-open', IN_PROGRESS: 'badge-in_progress', RESOLVED: 'badge-resolved', CLOSED: 'badge-closed' }
const PRIORITY_BADGE = { CRITICAL: 'badge-critical', HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' }

export default function MyReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page, size: 10, sort: 'createdAt,desc' })
    if (statusFilter !== 'ALL') params.set('status', statusFilter)
    if (search) params.set('search', search)
    api.get(`/reports/my?${params}`).then(r => {
      setReports(r.data.content || [])
      setTotalPages(r.data.totalPages || 1)
    }).finally(() => setLoading(false))
  }, [page, statusFilter, search])

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white">My Reports</h1>
        <p className="text-gray-400 mt-1">Track the status of all your submitted issues.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
            className="input-field pl-9 py-2.5 text-sm" placeholder="Search reports..." />
        </div>
        <div className="flex items-center gap-1 bg-gray-800 rounded-xl p-1">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(0) }}
              className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                statusFilter === s ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white')}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-2xl shimmer" />)}
        </div>
      ) : reports.length === 0 ? (
        <div className="card text-center py-20">
          <FileText className="w-14 h-14 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-medium">No reports found</p>
          <p className="text-gray-600 text-sm mt-1 mb-6">Try adjusting filters or report a new issue.</p>
          <Link to="/report" className="btn-primary inline-flex items-center gap-2 text-sm">Report Issue</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(r => (
            <Link key={r.id} to={`/report/${r.id}`}
              className="card hover:border-gray-700 transition-all flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <p className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">{r.title}</p>
                  <span className={STATUS_BADGE[r.status] || 'badge'}>{r.status?.replace('_', ' ')}</span>
                  <span className={PRIORITY_BADGE[r.priority] || 'badge'}>{r.priority}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1 truncate">
                  {r.category} · {r.location?.address || 'No location'} ·{' '}
                  {r.createdAt ? formatDistanceToNow(new Date(r.createdAt), { addSuffix: true }) : ''}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
            </Link>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 rounded-lg bg-gray-800 text-sm text-gray-300 hover:bg-gray-700 disabled:opacity-40">
                Previous
              </button>
              <span className="text-sm text-gray-400">Page {page + 1} of {totalPages}</span>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 rounded-lg bg-gray-800 text-sm text-gray-300 hover:bg-gray-700 disabled:opacity-40">
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
