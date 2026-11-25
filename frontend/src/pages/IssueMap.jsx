import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import api from '../services/api'
import { Link } from 'react-router-dom'
import { Map, Filter, AlertTriangle, Layers } from 'lucide-react'
import { useFlags } from 'flagsmith/react'
import { trackExperimentEvent, ExperimentEvents } from '../services/analytics'
import clsx from 'clsx'

// Fix leaflet default icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const PRIORITY_COLOR = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#22c55e' }
const CATEGORY_ICON = { 'Pothole': '🕳️', 'Water Leak': '💧', 'Garbage': '🗑️', 'Street Light': '💡',
  'Broken Sidewalk': '🚧', 'Graffiti': '🎨', 'Fallen Tree': '🌳', 'Road Damage': '⚠️',
  'Drainage Issue': '🌊', 'Other': '📌' }

function createCustomIcon(priority, category) {
  const color = PRIORITY_COLOR[priority] || '#6b7280'
  const emoji = CATEGORY_ICON[category] || '📌'
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;">
      <span style="transform:rotate(45deg);font-size:14px;">${emoji}</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  })
}

const STATUS_FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED']
const PRIORITY_FILTERS = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

export default function IssueMap() {
  const flags = useFlags(['smart_road_dashboard'])
  const effectiveVariant = Boolean(flags.smart_road_dashboard?.enabled) ? 'experiment' : 'control'
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [showHeatmap, setShowHeatmap] = useState(false)
  const center = [14.6819, 77.6006] // Anantapur default

  useEffect(() => {
    trackExperimentEvent(effectiveVariant, ExperimentEvents.MAP_INTERACTION, { view: 'full_map' })
    api.get('/reports/all?size=500').then(r => {
      setReports(r.data.content || [])
    }).finally(() => setLoading(false))
  }, [effectiveVariant])

  const filtered = reports.filter(r => {
    const loc = r.location
    if (!loc?.latitude || !loc?.longitude) return false
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false
    if (priorityFilter !== 'ALL' && r.priority !== priorityFilter) return false
    return true
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-800 flex flex-wrap items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Map className="w-6 h-6 text-blue-400" /> Issue Map
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{filtered.length} issues displayed</p>
        </div>
        <div className="ml-auto flex flex-wrap gap-3">
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-xl p-1">
            {STATUS_FILTERS.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  statusFilter === s ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white')}>
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
          {/* Priority filter */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-xl p-1">
            {PRIORITY_FILTERS.map(p => (
              <button key={p} onClick={() => setPriorityFilter(p)}
                className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  priorityFilter === p ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white')}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
            <div className="text-center">
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400">Loading issue map...</p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={center} zoom={13}
            className="w-full h-full"
            style={{ background: '#111827' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
            />
            {filtered.map(r => r.location?.latitude && (
              <Marker
                key={r.id}
                position={[r.location.latitude, r.location.longitude]}
                icon={createCustomIcon(r.priority, r.category)}
              >
                <Popup className="civic-popup">
                  <div className="bg-gray-900 rounded-xl p-3 min-w-56 border border-gray-700">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-sm font-bold text-white leading-tight">{r.title}</span>
                      <span style={{ background: PRIORITY_COLOR[r.priority] + '20', color: PRIORITY_COLOR[r.priority] }}
                        className="text-xs px-2 py-0.5 rounded-full border flex-shrink-0 font-medium">
                        {r.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{r.category} · {r.status?.replace('_', ' ')}</p>
                    {r.location?.address && <p className="text-xs text-gray-500 mb-3 truncate">📍 {r.location.address}</p>}
                    <Link to={`/report/${r.id}`}
                      className="block w-full text-center text-xs bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg transition-colors">
                      View Details →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur rounded-xl border border-gray-800 p-3 z-[1000]">
          <p className="text-xs text-gray-400 font-medium mb-2">Priority</p>
          {Object.entries(PRIORITY_COLOR).map(([p, c]) => (
            <div key={p} className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c }} />
              <span className="text-xs text-gray-300">{p}</span>
            </div>
          ))}
        </div>

        {/* Count overlay */}
        <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur rounded-xl border border-gray-800 p-3 z-[1000]">
          <p className="text-xs text-gray-400">Showing</p>
          <p className="text-2xl font-black text-white">{filtered.length}</p>
          <p className="text-xs text-gray-400">issues</p>
        </div>
      </div>
    </div>
  )
}
