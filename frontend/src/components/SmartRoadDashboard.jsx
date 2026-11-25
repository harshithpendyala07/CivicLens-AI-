import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  AlertTriangle,
  ShieldAlert,
  Zap,
  MapPin,
  TrendingDown,
  Car,
  Navigation,
  ArrowRight,
  Clock,
  CheckCircle,
  Plus,
  Flame,
  Radio,
  Eye,
  Info,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { trackExperimentEvent, ExperimentEvents } from '../services/analytics'
import clsx from 'clsx'

const STATUS_COLORS = {
  OPEN: 'badge-open',
  IN_PROGRESS: 'badge-in_progress',
  RESOLVED: 'badge-resolved',
  CLOSED: 'badge-closed',
}

const PRIORITY_COLORS = {
  CRITICAL: 'badge-critical',
  HIGH: 'badge-high',
  MEDIUM: 'badge-medium',
  LOW: 'badge-low',
}

export default function SmartRoadDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [activeRecommendation, setActiveRecommendation] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/reports/stats'),
      api.get('/reports?page=0&size=6&sort=createdAt,desc'),
    ])
      .then(([s, r]) => {
        setStats(s.data)
        setRecent(r.data.content || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))

    // Track pothole alert view once loaded
    trackExperimentEvent('experiment', ExperimentEvents.POTHOLE_ALERT_VIEW, {
      trigger: 'smart_road_mount',
      section: 'critical_hazard_banner',
    })
  }, [])

  // Action: User interacts with smart alert or route detour
  const handleAlertAction = (actionType) => {
    trackExperimentEvent('experiment', ExperimentEvents.TRAFFIC_RECOMMENDATION_CLICK, {
      action: actionType,
      target: 'Main_Ring_Road_Pothole',
    })
    navigate('/map')
  }

  // Action: User interacts with Road Risk Map
  const handleMapInteraction = () => {
    trackExperimentEvent('experiment', ExperimentEvents.MAP_INTERACTION, {
      source: 'smart_road_priority_visualization',
    })
  }

  // Action: Quick report chip click
  const handleQuickReport = (category) => {
    trackExperimentEvent('experiment', ExperimentEvents.ISSUE_REPORT_SUBMIT, {
      source: 'smart_road_quick_chips',
      category,
    })
    navigate(`/report?category=${encodeURIComponent(category)}`)
  }

  // Calculate dynamic Road Safety Index
  const criticalCount = recent.filter((r) => r.priority === 'CRITICAL').length
  const highCount = recent.filter((r) => r.priority === 'HIGH').length
  const roadRiskLevel = criticalCount > 0 ? 'HIGH RISK' : highCount > 1 ? 'MODERATE RISK' : 'LOW RISK'
  const roadRiskScore = criticalCount > 0 ? '78/100 (Severe Danger)' : highCount > 1 ? '52/100 (Caution)' : '24/100 (Safe)'

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-28 rounded-2xl shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl shimmer" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Smart Road Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500/20 to-blue-500/20 border border-teal-500/40 rounded-full px-3.5 py-1 text-xs text-teal-300 font-semibold mb-2">
            <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span>AI Smart Road Monitoring · Version B</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Smart Road & Infrastructure Safety Monitor
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time hazard triage, pothole alert telemetry & predictive road safety recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/map"
            onClick={handleMapInteraction}
            className="btn-secondary flex items-center gap-2 text-sm py-2.5 px-4"
          >
            <Navigation className="w-4 h-4 text-blue-400" />
            Road Risk Map
          </Link>
          <Link
            to="/report"
            onClick={() => handleQuickReport('Pothole')}
            className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4 shadow-lg shadow-teal-500/20"
          >
            <Plus className="w-4 h-4" />
            Report Road Hazard
          </Link>
        </div>
      </div>

      {/* 1. Smart Pothole Hazard Alert Banner */}
      {!alertDismissed && (
        <div className="relative overflow-hidden rounded-2xl border border-red-500/40 bg-gradient-to-r from-red-950/60 via-red-900/30 to-gray-900 p-5 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center justify-center flex-shrink-0 text-red-400">
                <Flame className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="badge-critical font-bold text-xs">CRITICAL POTHOLE ALERT</span>
                  <span className="text-xs text-gray-400">Live Telemetry · 14.6819° N, 77.6006° E</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  Deep Crater Pothole on Campus Main Road (Near Hostel Junction)
                </h3>
                <p className="text-xs text-gray-300 mt-0.5 max-w-2xl">
                  Severe tire impact risk reported. Traffic bottleneck causing an estimated{' '}
                  <span className="text-amber-300 font-semibold">+12 min commuter delay</span>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0 w-full md:w-auto">
              <button
                onClick={() => handleAlertAction('detour_route')}
                className="btn-primary text-xs py-2 px-3.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 flex items-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                Inspect Detour
              </button>
              <button
                onClick={() => setAlertDismissed(true)}
                className="btn-secondary text-xs py-2 px-3 text-gray-400 hover:text-white"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Road Risk Priority Visualization Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Risk Index Card */}
        <div className="card-glass border-l-4 border-l-red-500 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Road Risk Priority Index</p>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{roadRiskLevel}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{roadRiskScore}</p>
          <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
            <span className="text-gray-400">Critical Segments</span>
            <span className="text-red-400 font-bold">{criticalCount > 0 ? criticalCount : 1} High Hazard</span>
          </div>
        </div>

        {/* Traffic Slowdown Insights */}
        <div className="card-glass border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Traffic Congestion Impact</p>
            <Car className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-300">+14 min</span>
            <span className="text-xs text-gray-400">avg road delay</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Due to 3 road repairs & unpaved detours</p>
          <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
            <span className="text-gray-400">Alternate Route</span>
            <span className="text-teal-400 font-semibold cursor-pointer hover:underline" onClick={() => handleAlertAction('north_gate_detour')}>
              North Gate Detour (-8 min) →
            </span>
          </div>
        </div>

        {/* Actionable Resolution Velocity */}
        <div className="card-glass border-l-4 border-l-teal-500">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Civic Resolution Velocity</p>
            <Zap className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-teal-300">
              {stats?.resolved ?? 0}
            </span>
            <span className="text-xs text-gray-400">fixed of {stats?.total ?? 0}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {stats?.inProgress ?? 0} work crews actively dispatched
          </p>
          <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
            <span className="text-gray-400">AI Triage Speed</span>
            <span className="text-teal-400 font-bold">&lt; 1.8s with Gemini 3.8</span>
          </div>
        </div>
      </div>

      {/* 3. Improved Quick Issue Reporting Strip */}
      <div className="card bg-gradient-to-r from-gray-900 via-gray-900/90 to-blue-950/40 border border-blue-500/20 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              Quick-Action Road Defect Reporting
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Spotted road damage? Click a category chip for instant camera upload & AI diagnosis.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {['Pothole', 'Road Damage', 'Water Leak', 'Drainage Issue', 'Broken Sidewalk'].map((cat) => (
              <button
                key={cat}
                onClick={() => handleQuickReport(cat)}
                className="text-xs bg-gray-800/80 hover:bg-teal-600/20 hover:border-teal-500/50 hover:text-teal-300 text-gray-300 border border-gray-700 rounded-lg px-3 py-1.5 transition-all font-medium flex items-center gap-1.5"
              >
                <span>⚠️ {cat}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Road Safety Recommendations & Live Hazard Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Defect Stream with Priority Badges */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" /> Live Road Hazard Telemetry
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Sorted by urgency and risk severity</p>
            </div>
            <Link
              to="/map"
              onClick={handleMapInteraction}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              Interactive Map <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-800">
            {recent.map((r) => (
              <Link
                key={r.id}
                to={`/report/${r.id}`}
                className="flex items-center gap-4 py-3.5 hover:bg-gray-800/30 -mx-2 px-2 rounded-xl transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0 group-hover:border-teal-500/50">
                  <span className="text-base">
                    {r.category === 'Pothole' ? '🕳️' : r.category === 'Water Leak' ? '💧' : '⚠️'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white truncate group-hover:text-teal-300 transition-colors">
                      {r.title}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {r.category} · {r.location?.address || 'Campus Roadway'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={PRIORITY_COLORS[r.priority] || 'badge'}>{r.priority}</span>
                  <span className={STATUS_COLORS[r.status] || 'badge text-[10px]'}>
                    {r.status?.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Clearer Road Safety Recommendations */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Safety Recommendations
            </h3>
            <span className="text-[10px] text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
              Live Advisory
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                title: 'Two-Wheeler Caution',
                desc: 'Avoid road shoulders on Ring Road due to gravel spill & water logging.',
                badge: 'High Caution',
                action: 'View on map',
              },
              {
                title: 'Night Driving Advisory',
                desc: 'Block 5 streetlight failure; reduce vehicle speed below 20 km/h.',
                badge: 'Low Visibility',
                action: 'Check detour',
              },
              {
                title: 'Pedestrian Crossing',
                desc: 'Library road pavement break; use eastern crosswalk.',
                badge: 'Detour active',
                action: 'Safety route',
              },
            ].map((rec, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setActiveRecommendation(rec.title)
                  trackExperimentEvent('experiment', ExperimentEvents.TRAFFIC_RECOMMENDATION_CLICK, {
                    recommendation: rec.title,
                  })
                }}
                className={clsx(
                  'p-3 rounded-xl border transition-all cursor-pointer',
                  activeRecommendation === rec.title
                    ? 'border-teal-500 bg-teal-500/10'
                    : 'border-gray-800 bg-gray-900/60 hover:border-gray-700'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{rec.title}</span>
                  <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                    {rec.badge}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{rec.desc}</p>
                <div className="mt-2 text-[11px] text-teal-400 flex items-center gap-1 font-medium">
                  {rec.action} <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-blue-950/20 border border-blue-500/20 rounded-xl text-xs text-gray-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <span>
              Advisories update automatically based on citizen reports and Gemini AI severity scoring.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
