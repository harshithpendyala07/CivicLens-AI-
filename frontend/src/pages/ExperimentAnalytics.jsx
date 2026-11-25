import { useState, useEffect } from 'react'
import api from '../services/api'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts'
import {
  Sparkles,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  Layers,
  RefreshCw,
  Sliders,
  Shield,
  Activity,
} from 'lucide-react'
import clsx from 'clsx'

export default function ExperimentAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadMetrics = () => {
    setRefreshing(true)
    api
      .get('/admin/experiments/metrics?experimentName=smart_road_dashboard')
      .then((res) => {
        setData(res.data)
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false)
        setRefreshing(false)
      })
  }

  useEffect(() => {
    loadMetrics()
  }, [])

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-24 rounded-2xl shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl shimmer" />
          ))}
        </div>
      </div>
    )
  }

  const conversionComparisonData = data
    ? [
        {
          name: 'Version A (Control)',
          rate: data.control?.conversionRate || 0,
          sessions: data.control?.eligibleSessions || 0,
          success: data.control?.successfulActions || 0,
          fill: '#3b82f6',
        },
        {
          name: 'Version B (Smart Road)',
          rate: data.experiment?.conversionRate || 0,
          sessions: data.experiment?.eligibleSessions || 0,
          success: data.experiment?.successfulActions || 0,
          fill: '#14b8a6',
        },
      ]
    : []

  const eventTypes = [
    { key: 'dashboard_view', label: 'Dashboard Views' },
    { key: 'pothole_alert_view', label: 'Pothole Alert Views' },
    { key: 'issue_report_submit', label: 'Issue Reports Submitted' },
    { key: 'map_interaction', label: 'Map Interactions' },
    { key: 'traffic_recommendation_click', label: 'Traffic Detour Clicks' },
  ]

  const eventBreakdownData = eventTypes.map(({ key, label }) => ({
    name: label,
    Control: data?.control?.eventCounts?.[key] || 0,
    Experiment: data?.experiment?.eventCounts?.[key] || 0,
  }))

  const isInsufficient = data?.status === 'INSUFFICIENT_DATA' || (data?.totalParticipants || 0) < 5

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-3.5 py-1 text-xs text-purple-300 font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Flagsmith Hackathon · Live Experiment Telemetry</span>
          </div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            Flagsmith A/B Experiment Analytics
          </h1>
          <p className="text-gray-400 mt-1">
            Real collected user interaction metrics for the{' '}
            <code className="bg-gray-800 text-purple-300 px-1.5 py-0.5 rounded font-mono text-xs">
              smart_road_dashboard
            </code>{' '}
            multivariate feature flag.
          </p>
        </div>

        <button
          onClick={loadMetrics}
          disabled={refreshing}
          className="btn-secondary flex items-center gap-2 text-xs py-2 px-3.5 self-start md:self-auto"
        >
          <RefreshCw className={clsx('w-3.5 h-3.5', refreshing && 'animate-spin')} />
          Refresh Experiment Data
        </button>
      </div>

      {/* Status Alert Banner */}
      <div className="card border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-gray-900 to-teal-950/20 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white text-base">Experiment: smart_road_dashboard</span>
                <span className="text-[11px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
                  50% Control / 50% Experiment
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Evaluates whether predictive road risk priority & smart hazard alerts increase citizen safety actions.
              </p>
            </div>
          </div>

          <div>
            {isInsufficient ? (
              <span className="inline-flex items-center gap-1.5 text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl font-medium">
                <AlertCircle className="w-4 h-4" /> Insufficient Sample Size (&lt; 5 sessions)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs bg-green-500/10 text-green-300 border border-green-500/30 px-3 py-1.5 rounded-xl font-medium">
                <CheckCircle className="w-4 h-4 text-green-400" /> Experiment Active & Statistically Monitored
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Control Conversion */}
        <div className="card-glass border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Version A (Control)</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-400">
              {data?.control?.conversionRate ?? 0}%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {data?.control?.successfulActions ?? 0} actions / {data?.control?.eligibleSessions ?? 0} sessions
          </p>
        </div>

        {/* Experiment Conversion */}
        <div className="card-glass border-l-4 border-l-teal-500">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Version B (Smart Road)</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-teal-400">
              {data?.experiment?.conversionRate ?? 0}%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {data?.experiment?.successfulActions ?? 0} actions / {data?.experiment?.eligibleSessions ?? 0} sessions
          </p>
        </div>

        {/* Relative Lift */}
        <div className="card-glass border-l-4 border-l-purple-500">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Relative Conversion Lift</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-300 flex items-center">
              {data?.relativeLift > 0 ? `+${data?.relativeLift}%` : `${data?.relativeLift || 0}%`}
            </span>
            <ArrowUpRight className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-xs text-gray-400 mt-1">Impact over baseline control</p>
        </div>

        {/* Total Sessions */}
        <div className="card-glass border-l-4 border-l-gray-600">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Sample Size</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              {data?.totalParticipants ?? 0}
            </span>
            <span className="text-xs text-gray-400">sessions</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Anonymous, privacy-safe events</p>
        </div>
      </div>

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Rate Side-by-Side Chart */}
        <div className="card">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-400" /> Road Safety Conversion Rate (%)
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={conversionComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis unit="%" tick={{ fill: '#9ca3af', fontSize: 12 }} domain={[0, 100]} />
              <Tooltip
                formatter={(val) => [`${val}%`, 'Conversion Rate']}
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
              />
              <Bar dataKey="rate" radius={[8, 8, 0, 0]}>
                {conversionComparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Event Breakdown Chart */}
        <div className="card">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" /> Interaction Volume by Event Type
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={eventBreakdownData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="Control" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Experiment" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comprehensive Variant Matrix Table */}
      <div className="card overflow-hidden p-0">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-sm font-bold text-white">A/B Testing Statistical Summary</h3>
          <p className="text-xs text-gray-400 mt-0.5">Telemetry metrics collected from real user actions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-900 border-b border-gray-800 text-gray-400">
              <tr>
                <th className="px-4 py-3">Metric Dimension</th>
                <th className="px-4 py-3">Version A (Control)</th>
                <th className="px-4 py-3">Version B (Smart Road Experiment)</th>
                <th className="px-4 py-3">Observed Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              <tr>
                <td className="px-4 py-3 font-semibold text-white">Experience Architecture</td>
                <td className="px-4 py-3 text-gray-400">Standard Defect Counts & Chronological List</td>
                <td className="px-4 py-3 text-teal-300 font-medium">Risk Index + Pothole Alerts + Detours + Quick Reporting</td>
                <td className="px-4 py-3 text-teal-400">Telemetry-Driven UX</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-white">Eligible Sessions</td>
                <td className="px-4 py-3">{data?.control?.eligibleSessions ?? 0}</td>
                <td className="px-4 py-3">{data?.experiment?.eligibleSessions ?? 0}</td>
                <td className="px-4 py-3 text-gray-400">Equal 50/50 Allocation</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-white">Successful Safety Actions</td>
                <td className="px-4 py-3">{data?.control?.successfulActions ?? 0}</td>
                <td className="px-4 py-3 font-bold text-teal-300">{data?.experiment?.successfulActions ?? 0}</td>
                <td className="px-4 py-3 text-teal-400 font-semibold">
                  +{((data?.experiment?.successfulActions || 0) - (data?.control?.successfulActions || 0))} actions
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-white">Conversion Rate</td>
                <td className="px-4 py-3 text-blue-400 font-bold">{data?.control?.conversionRate ?? 0}%</td>
                <td className="px-4 py-3 text-teal-400 font-bold">{data?.experiment?.conversionRate ?? 0}%</td>
                <td className="px-4 py-3 text-purple-400 font-bold">
                  {data?.relativeLift > 0 ? `+${data?.relativeLift}% lift` : 'Baseline'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
