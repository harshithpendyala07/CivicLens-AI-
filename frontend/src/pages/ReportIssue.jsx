import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Upload, Sparkles, MapPin, AlertTriangle, CheckCircle, Loader2, X, Camera } from 'lucide-react'
import { useFlags } from 'flagsmith/react'
import { trackExperimentEvent, ExperimentEvents } from '../services/analytics'
import clsx from 'clsx'

const CATEGORIES = [
  'Pothole', 'Water Leak', 'Garbage', 'Street Light', 'Broken Sidewalk',
  'Graffiti', 'Fallen Tree', 'Road Damage', 'Drainage Issue', 'Other'
]
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const PRIORITY_COLORS = {
  LOW: 'border-green-500 bg-green-500/10 text-green-400',
  MEDIUM: 'border-yellow-500 bg-yellow-500/10 text-yellow-400',
  HIGH: 'border-orange-500 bg-orange-500/10 text-orange-400',
  CRITICAL: 'border-red-500 bg-red-500/10 text-red-400',
}

export default function ReportIssue() {
  const navigate = useNavigate()
  const routerLocation = useLocation()
  const flags = useFlags(['smart_road_dashboard'])
  const isEnabled = Boolean(flags.smart_road_dashboard?.enabled)
  const effectiveVariant = isEnabled ? 'experiment' : 'control'

  const [form, setForm] = useState({
    title: '', description: '', category: '', priority: 'MEDIUM',
    latitude: '', longitude: '', address: ''
  })
  const [images, setImages] = useState([])
  const [aiResult, setAiResult] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const up = k => v => setForm(p => ({ ...p, [k]: v }))

  // Check URL query parameters (e.g. ?category=Pothole from smart road dashboard)
  useEffect(() => {
    const params = new URLSearchParams(routerLocation.search)
    const categoryParam = params.get('category')
    if (categoryParam && CATEGORIES.includes(categoryParam)) {
      setForm(prev => ({
        ...prev,
        category: categoryParam,
        title: prev.title || `${categoryParam} Hazard Reported`,
        priority: categoryParam === 'Pothole' || categoryParam === 'Road Damage' ? 'HIGH' : prev.priority,
      }))
    }
  }, [routerLocation.search])

  const onDrop = useCallback(accepted => {
    const news = accepted.map(f => Object.assign(f, { preview: URL.createObjectURL(f) }))
    setImages(prev => [...prev, ...news].slice(0, 5))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxSize: 10 * 1024 * 1024
  })

  const removeImage = i => setImages(prev => { URL.revokeObjectURL(prev[i].preview); return prev.filter((_, j) => j !== i) })

  const analyzeWithAI = async () => {
    if (images.length === 0) { toast.error('Please upload at least one image first'); return }
    setAnalyzing(true)
    setAiResult(null)
    try {
      const fd = new FormData()
      fd.append('image', images[0])
      const { data } = await api.post('/ai/analyze', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setAiResult(data)
      if (data.category && !form.category) up('category')(data.category)
      if (data.priority) up('priority')(data.priority)
      if (data.title && !form.title) up('title')(data.title)
      if (data.description && !form.description) up('description')(data.description)
      toast.success('AI analysis complete! Fields pre-filled for you.')
    } catch (err) {
      toast.error('AI analysis failed. Please fill the form manually.')
      console.error(err)
    } finally {
      setAnalyzing(false)
    }
  }

  const getLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return }
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords
        setForm(p => ({ ...p, latitude: latitude.toString(), longitude: longitude.toString() }))
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
          const d = await r.json()
          setForm(p => ({ ...p, address: d.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }))
          toast.success('Location detected!')
        } catch {
          setForm(p => ({ ...p, address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }))
        }
        setGeoLoading(false)
      },
      () => { toast.error('Could not detect location'); setGeoLoading(false) }
    )
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.category) { toast.error('Please select a category'); return }
    if (!form.latitude || !form.longitude) { toast.error('Please add a location'); return }
    setSubmitting(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      images.forEach(img => fd.append('images', img))
      if (aiResult) fd.append('aiAnalysis', JSON.stringify(aiResult))
      const { data } = await api.post('/reports', fd, { headers: { 'Content-Type': 'multipart/form-data' } })

      // Track successful action for Flagsmith experiment conversion metric
      trackExperimentEvent(effectiveVariant, ExperimentEvents.ISSUE_REPORT_SUBMIT, {
        category: form.category,
        priority: form.priority,
        reportId: data.id,
      })

      toast.success('Issue reported successfully! 🎉')
      navigate(`/report/${data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Report an Issue</h1>
        <p className="text-gray-400 mt-1">Upload a photo and let AI do the heavy lifting, or fill in the details manually.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image upload */}
        <div className="card">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-400" /> Photo Evidence
          </h2>
          <div {...getRootProps()} className={clsx(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
            isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/30'
          )}>
            <input {...getInputProps()} />
            <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-300 font-medium">{isDragActive ? 'Drop images here' : 'Drag & drop photos here'}</p>
            <p className="text-sm text-gray-500 mt-1">or click to select · Up to 5 images · Max 10MB each</p>
          </div>

          {images.length > 0 && (
            <div className="flex gap-3 mt-4 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img.preview} alt="" className="w-24 h-24 rounded-lg object-cover border border-gray-700" />
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {images.length > 0 && (
            <button type="button" onClick={analyzeWithAI} disabled={analyzing}
              className="mt-4 btn-primary flex items-center gap-2 text-sm">
              {analyzing
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing with Gemini AI...</>
                : <><Sparkles className="w-4 h-4" /> Analyze with AI</>}
            </button>
          )}
        </div>

        {/* AI Result */}
        {aiResult && (
          <div className="bg-teal-500/10 border border-teal-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-teal-400" />
              <span className="font-semibold text-teal-400">AI Analysis Complete</span>
              <span className="ml-auto text-xs text-teal-500 bg-teal-500/20 px-2 py-0.5 rounded-full">
                {Math.round((aiResult.confidence || 0.9) * 100)}% confidence
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Category', value: aiResult.category },
                { label: 'Priority', value: aiResult.priority },
                { label: 'Severity', value: aiResult.severity },
                { label: 'Est. Fix Time', value: aiResult.estimatedFixTime },
              ].map(({ label, value }) => value && (
                <div key={label} className="bg-teal-900/20 rounded-lg p-3">
                  <p className="text-xs text-teal-400/60 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-semibold text-teal-300 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            {aiResult.aiDescription && (
              <p className="text-sm text-teal-300/80 mt-3 italic">"{aiResult.aiDescription}"</p>
            )}
            <p className="text-xs text-teal-500/60 mt-3 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Fields pre-filled. Review and confirm before submitting.
            </p>
          </div>
        )}

        {/* Form details */}
        <div className="card space-y-5">
          <h2 className="font-bold text-white">Issue Details</h2>

          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Title *</label>
            <input type="text" required value={form.title} onChange={e => up('title')(e.target.value)}
              className="input-field" placeholder="Brief description of the issue" />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Description</label>
            <textarea value={form.description} onChange={e => up('description')(e.target.value)}
              rows={3} className="input-field resize-none"
              placeholder="Provide more details about the issue, when you noticed it, any safety concerns..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Category *</label>
              <select value={form.category} onChange={e => up('category')(e.target.value)} required className="input-field">
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Priority *</label>
              <div className="grid grid-cols-2 gap-2">
                {PRIORITIES.map(p => (
                  <button key={p} type="button" onClick={() => up('priority')(p)}
                    className={clsx(
                      'px-3 py-2 rounded-lg border text-xs font-semibold transition-all',
                      form.priority === p ? PRIORITY_COLORS[p] : 'border-gray-700 text-gray-500 hover:border-gray-600'
                    )}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white">Location *</h2>
            <button type="button" onClick={getLocation} disabled={geoLoading}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5">
              {geoLoading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <MapPin className="w-3.5 h-3.5 text-blue-400" />}
              Detect my location
            </button>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Address / Landmark</label>
            <input type="text" value={form.address} onChange={e => up('address')(e.target.value)}
              className="input-field" placeholder="e.g. Main Gate, JNTUA Campus, Anantapur" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Latitude</label>
              <input type="number" step="any" value={form.latitude} onChange={e => up('latitude')(e.target.value)}
                className="input-field" placeholder="14.6819" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Longitude</label>
              <input type="number" step="any" value={form.longitude} onChange={e => up('longitude')(e.target.value)}
                className="input-field" placeholder="77.6006" />
            </div>
          </div>

          {form.latitude && form.longitude && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">Location set: {parseFloat(form.latitude).toFixed(4)}, {parseFloat(form.longitude).toFixed(4)}</span>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={submitting}
            className="btn-primary flex-1 flex items-center justify-center gap-2 py-4 text-base disabled:opacity-50">
            {submitting
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
              : <><CheckCircle className="w-5 h-5" /> Submit Report</>}
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary px-6">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
