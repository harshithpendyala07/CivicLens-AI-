import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import { MapPin, Calendar, User, Sparkles, Clock, ArrowLeft, MessageCircle } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import clsx from 'clsx'

const STATUS_BADGE = { OPEN: 'badge-open', IN_PROGRESS: 'badge-in_progress', RESOLVED: 'badge-resolved', CLOSED: 'badge-closed' }
const PRIORITY_BADGE = { CRITICAL: 'badge-critical', HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' }

const TIMELINE_STEPS = ['OPEN', 'IN_PROGRESS', 'RESOLVED']

export default function ReportDetail() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    api.get(`/reports/${id}`).then(r => setReport(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [id])

  const postComment = async e => {
    e.preventDefault()
    if (!comment.trim()) return
    setPosting(true)
    try {
      await api.post(`/reports/${id}/comments`, { text: comment })
      setComment('')
      const r = await api.get(`/reports/${id}`)
      setReport(r.data)
    } finally { setPosting(false) }
  }

  if (loading) return <div className="p-8"><div className="h-96 rounded-2xl shimmer" /></div>
  if (!report) return <div className="p-8 text-center text-gray-400">Report not found</div>

  const stepIdx = TIMELINE_STEPS.indexOf(report.status)

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link to="/my-reports" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to My Reports
      </Link>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-start gap-3 mb-4">
          <h1 className="text-2xl font-black text-white flex-1">{report.title}</h1>
          <span className={STATUS_BADGE[report.status] || 'badge'}>{report.status?.replace('_', ' ')}</span>
          <span className={PRIORITY_BADGE[report.priority] || 'badge'}>{report.priority}</span>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{report.reporter?.name}</span>
          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{report.location?.address || 'No address'}</span>
          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />
            {report.createdAt ? format(new Date(report.createdAt), 'PPP') : 'Unknown date'}
          </span>
          <span className="text-gray-600">#{report.id}</span>
        </div>

        {/* Progress timeline */}
        <div className="mt-6 flex items-center gap-0">
          {TIMELINE_STEPS.map((step, i) => (
            <div key={step} className="flex items-center flex-1">
              <div className={clsx(
                'w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0',
                i <= stepIdx ? 'border-blue-500 bg-blue-600 text-white' : 'border-gray-700 text-gray-600'
              )}>
                {i < stepIdx ? '✓' : i + 1}
              </div>
              <div className="flex-1 ml-2 mr-2">
                <p className={clsx('text-xs font-medium', i <= stepIdx ? 'text-blue-400' : 'text-gray-600')}>
                  {step.replace('_', ' ')}
                </p>
              </div>
              {i < TIMELINE_STEPS.length - 1 && (
                <div className={clsx('h-0.5 w-full', i < stepIdx ? 'bg-blue-500' : 'bg-gray-700')} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {report.description && (
            <div className="card">
              <h2 className="font-bold text-white mb-3">Description</h2>
              <p className="text-gray-300 leading-relaxed">{report.description}</p>
            </div>
          )}

          {/* Images */}
          {report.images?.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-white mb-3">Photos ({report.images.length})</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {report.images.map((img, i) => (
                  <img key={i} src={img.url} alt={`Evidence ${i + 1}`}
                    className="rounded-xl object-cover aspect-square border border-gray-700 hover:scale-105 transition-transform cursor-pointer" />
                ))}
              </div>
            </div>
          )}

          {/* AI Analysis */}
          {report.aiAnalysis && (
            <div className="bg-teal-500/10 border border-teal-500/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-teal-400" />
                <h2 className="font-bold text-teal-400">AI Analysis</h2>
                <span className="ml-auto text-xs text-teal-500 bg-teal-500/20 px-2 py-0.5 rounded-full">
                  {Math.round((report.aiAnalysis.confidence || 0.9) * 100)}% confidence
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Detected Category', report.aiAnalysis.category],
                  ['Recommended Priority', report.aiAnalysis.priority],
                  ['Severity Level', report.aiAnalysis.severity],
                  ['Est. Repair Time', report.aiAnalysis.estimatedFixTime],
                ].map(([l, v]) => v && (
                  <div key={l} className="bg-teal-900/20 rounded-lg p-3">
                    <p className="text-xs text-teal-400/60 uppercase tracking-wider">{l}</p>
                    <p className="text-sm font-semibold text-teal-300 mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
              {report.aiAnalysis.aiDescription && (
                <p className="text-sm text-teal-300/80 mt-3 italic">"{report.aiAnalysis.aiDescription}"</p>
              )}
            </div>
          )}

          {/* Comments */}
          <div className="card">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> Comments ({report.comments?.length || 0})
            </h2>
            <div className="space-y-3 mb-4">
              {report.comments?.map(c => (
                <div key={c.id} className="bg-gray-800/50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">{c.author?.name}</span>
                    {c.author?.role === 'ADMIN' && <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">Admin</span>}
                    <span className="text-xs text-gray-500 ml-auto">{c.createdAt ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true }) : ''}</span>
                  </div>
                  <p className="text-sm text-gray-300">{c.text}</p>
                </div>
              ))}
            </div>
            <form onSubmit={postComment} className="flex gap-2">
              <input type="text" value={comment} onChange={e => setComment(e.target.value)}
                className="input-field flex-1 py-2.5 text-sm" placeholder="Add a comment..." />
              <button type="submit" disabled={posting || !comment.trim()}
                className="btn-primary text-sm py-2.5 px-4 disabled:opacity-50">Post</button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-bold text-white mb-4">Details</h3>
            <dl className="space-y-3">
              {[
                ['Category', report.category],
                ['Status', report.status?.replace('_', ' ')],
                ['Priority', report.priority],
                ['Reporter', report.reporter?.name],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-gray-500 uppercase tracking-wider">{k}</dt>
                  <dd className="text-sm font-medium text-white mt-0.5">{v || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>

          {report.location?.latitude && (
            <div className="card">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" /> Location
              </h3>
              <p className="text-sm text-gray-400 mb-3">{report.location.address}</p>
              <a href={`https://www.openstreetmap.org/?mlat=${report.location.latitude}&mlon=${report.location.longitude}&zoom=16`}
                target="_blank" rel="noopener noreferrer"
                className="btn-secondary text-xs py-2 w-full text-center block">
                View on Map ↗
              </a>
            </div>
          )}

          {report.updates?.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Status History
              </h3>
              <div className="space-y-2">
                {report.updates.map((u, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-white">{u.newStatus?.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-500">{u.updatedAt ? formatDistanceToNow(new Date(u.updatedAt), { addSuffix: true }) : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
