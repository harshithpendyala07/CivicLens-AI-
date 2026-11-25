import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Search, Filter, ChevronDown, Eye, CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'

const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
const PRIORITY_BADGE = { CRITICAL: 'badge-critical', HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' }
const STATUS_BADGE = { OPEN: 'badge-open', IN_PROGRESS: 'badge-in_progress', RESOLVED: 'badge-resolved', CLOSED: 'badge-closed' }

export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState({})
  const [selected, setSelected] = useState(null)

  const load = () => {
    setLoading(true)
    const p = new URLSearchParams({ page, size: 15, sort: 'createdAt,desc' })
    if (statusFilter !== 'ALL') p.set('status', statusFilter)
    if (priorityFilter !== 'ALL') p.set('priority', priorityFilter)
    if (search) p.set('search', search)
    api.get(`/admin/reports?${p}`).then(r => {
      setReports(r.data.content || [])
      setTotalPages(r.data.totalPages || 1)
    }).finally(() => setLoading(false))
  }

  useEffect(load, [page, statusFilter, priorityFilter, search])

  const updateStatus = async (id, newStatus) => {
    setUpdating(u => ({ ...u, [id]: true }))
    try {
      await api.patch(`/admin/reports/${id}/status`, { status: newStatus })
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`)
      load()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(u => ({ ...u, [id]: false }))
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white">All Reports</h1>
        <p className="text-gray-400 mt-1">Review, verify, and manage all submitted issues.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
            className="input-field pl-9 py-2.5 text-sm" placeholder="Search reports..." />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0) }}
          className="input-field py-2.5 text-sm w-auto pr-8">
          <option value="ALL">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(0) }}
          className="input-field py-2.5 text-sm w-auto pr-8">
          <option value="ALL">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                {['Title & Reporter', 'Category', 'Priority', 'Status', 'Location', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs text-gray-500 uppercase tracking-wider px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-3"><div className="h-8 rounded shimmer" /></td>
                  </tr>
                ))
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-500">No reports found</td>
                </tr>
              ) : (
                reports.map(r => (
                  <tr key={r.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/report/${r.id}`} className="text-sm font-medium text-white hover:text-blue-400 transition-colors line-clamp-1">
                        {r.title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">{r.reporter?.name}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{r.category}</td>
                    <td className="px-4 py-3"><span className={PRIORITY_BADGE[r.priority] || 'badge'}>{r.priority}</span></td>
                    <td className="px-4 py-3"><span className={STATUS_BADGE[r.status] || 'badge'}>{r.status?.replace('_', ' ')}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-400 max-w-xs truncate">{r.location?.address || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {r.createdAt ? formatDistanceToNow(new Date(r.createdAt), { addSuffix: true }) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={r.status}
                          onChange={e => updateStatus(r.id, e.target.value)}
                          disabled={updating[r.id]}
                          className="text-xs bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-gray-300 focus:outline-none">
                          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </select>
                        {updating[r.id] && <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="border-t border-gray-800 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg bg-gray-800 text-xs text-gray-300 hover:bg-gray-700 disabled:opacity-40">Previous</button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-gray-800 text-xs text-gray-300 hover:bg-gray-700 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
