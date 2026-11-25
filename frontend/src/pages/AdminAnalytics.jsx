import { useState, useEffect } from 'react'
import api from '../services/api'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  Shield,
  Layers,
  RefreshCw,
} from 'lucide-react'
import clsx from 'clsx'

const COLORS = ['#3b82f6', '#14b8a6', '#8b5cf6', '#f97316', '#ef4444', '#22c55e', '#eab308', '#ec4899']

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [expData, setExpData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = () => {
    setRefreshing(true)
    Promise.all([
      api.get('/admin/analytics'),
      api.get('/admin/experiments/metrics?experimentName=smart_road_dashboard'),
    ])
      .then(([analyticsRes, expRes]) => {
        setData(analyticsRes.data)
        setExpData(expRes.data)
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false)
        setRefreshing(false)
      })
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-24 rounded-2xl shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-72 rounded-2xl shimmer" />
          ))}
        </div>
      </div>
    )
  }

  const categoryData = data?.categoryBreakdown
    ? Object.entries(data.categoryBreakdown).map(([name, value]) => ({ name, value }))
    : []

  const priorityData = data?.priorityBreakdown
    ? Object.entries(data.priorityBreakdown).map(([name, value]) => ({ name, value }))
    : []

  // Flagsmith A/B Experiment Comparison Data for Recharts
  const conversionComparisonData = expData
    ? [
        {
          name: 'Version A (Control)',
          rate: expData.control?.conversionRate || 0,
          sessions: expData.control?.eligibleSessions || 0,
          success: expData.control?.successfulActions || 0,
          fill: '#3b82f6',
        },
        {
          name: 'Version B (Smart Road)',
          rate: expData.experiment?.conversionRate || 0,
          sessions: expData.experiment?.eligibleSessions || 0,
          success: expData.experiment?.successfulActions || 0,
          fill: '#14b8a6',
        },
      ]
    : []

  // Combine event breakdown counts
  const eventTypes = [
    { key: 'dashboard_view', label: 'Dashboard Views' },
    { key: 'pothole_alert_view', label: 'Pothole Alert Views' },
    { key: 'issue_report_submit', label: 'Issue Reports Submitted' },
    { key: 'map_interaction', label: 'Map Interactions' },
    { key: 'traffic_recommendation_click', label: 'Traffic Detour Clicks' },
  ]

  const eventBreakdownData = eventTypes.map(({ key, label }) => ({
    name: label,
    Control: expData?.control?.eventCounts?.[key] || 0,
    Experiment: expData?.experiment?.eventCounts?.[key] || 0,
  }))

  const isInsufficient = expData?.status === 'INSUFFICIENT_DATA' || (expData?.totalParticipants || 0) < 5

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <BarChart2 className="w-7 h-7 text-blue-400" /> Infrastructure & Experiment Analytics
          </h1>
          <p className="text-gray-400 mt-1">
            Real-time infrastructure health and Flagsmith A/B testing conversion metrics.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={refreshing}
          className="btn-secondary flex items-center gap-2 text-xs py-2 px-3.5 self-start md:self-auto"
        >
          <RefreshCw className={clsx('w-3.5 h-3.5', refreshing && 'animate-spin')} />
          Refresh Metrics
        </button>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: FLAGSMITH A/B EXPERIMENT ANALYTICS            */}
      {/* ======================================================== */}
      <div className="card border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-gray-900 to-gray-900 p-6 space-y-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Flagsmith A/B Experiment: Smart Road Dashboard</h2>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
                  flag: {expData?.featureFlag || 'smart_road_dashboard'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Primary Goal: Conversion rate of eligible sessions resulting in meaningful road-safety action.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isInsufficient ? (
              <span className="inline-flex items-center gap-1.5 text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> Insufficient Sample Size (&lt; 5 sessions)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs bg-green-500/10 text-green-300 border border-green-500/30 px-3 py-1 rounded-full font-medium">
                <CheckCircle className="w-3.5 h-3.5" /> Experiment Running (50/50 Multivariate Split)
              </span>
            )}
          </div>
        </div>

        {/* Key Experiment Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Version A Control Conversion */}
          <div className="card-glass border-l-4 border-l-blue-500">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Version A (Control)</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-400">
                {expData?.control?.conversionRate ?? 0}%
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {expData?.control?.successfulActions ?? 0} actions / {expData?.control?.eligibleSessions ?? 0} sessions
            </p>
          </div>

          {/* Version B Experiment Conversion */}
          <div className="card-glass border-l-4 border-l-teal-500">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Version B (Smart Road)</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-teal-400">
                {expData?.experiment?.conversionRate ?? 0}%
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {expData?.experiment?.successfulActions ?? 0} actions / {expData?.experiment?.eligibleSessions ?? 0} sessions
            </p>
          </div>

          {/* Relative Conversion Lift */}
          <div className="card-glass border-l-4 border-l-purple-500">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Relative Conversion Lift</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-purple-300 flex items-center">
                {expData?.relativeLift > 0 ? `+${expData?.relativeLift}%` : `${expData?.relativeLift || 0}%`}
              </span>
              <ArrowUpRight className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Performance improvement over control</p>
          </div>

          {/* Total Participants */}
          <div className="card-glass border-l-4 border-l-gray-600">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Sample Size</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">
                {expData?.totalParticipants ?? 0}
              </span>
              <span className="text-xs text-gray-400">sessions</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Privacy-safe anonymous session tokens</p>
          </div>
        </div>

        {/* Experiment Charts: Conversion Rates & Event Type Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Conversion Rate Side-by-Side Chart */}
          <div className="bg-gray-950/60 rounded-xl p-4 border border-gray-800">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" /> Road Safety Conversion Rate (%)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
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
          <div className="bg-gray-950/60 rounded-xl p-4 border border-gray-800">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" /> Interaction Volume by Event Type
            </h3>
            <ResponsiveContainer width="100%" height={220}>
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

        {/* Experiment Version Comparison Table */}
        <div className="bg-gray-950/60 rounded-xl overflow-hidden border border-gray-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-900 border-b border-gray-800 text-gray-400">
              <tr>
                <th className="px-4 py-3">Dimension</th>
                <th className="px-4 py-3">Version A (Control)</th>
                <th className="px-4 py-3">Version B (Smart Road Experiment)</th>
                <th className="px-4 py-3">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              <tr>
                <td className="px-4 py-3 font-semibold text-white">Experience Scope</td>
                <td className="px-4 py-3 text-gray-400">Standard Defect Counts & List</td>
                <td className="px-4 py-3 text-teal-300 font-medium">Risk Index + Pothole Alerts + Detours</td>
                <td className="px-4 py-3 text-teal-400">Rich Telemetry</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-white">Eligible Sessions</td>
                <td className="px-4 py-3">{expData?.control?.eligibleSessions ?? 0}</td>
                <td className="px-4 py-3">{expData?.experiment?.eligibleSessions ?? 0}</td>
                <td className="px-4 py-3 text-gray-400">Balanced 50/50</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-white">Successful Safety Actions</td>
                <td className="px-4 py-3">{expData?.control?.successfulActions ?? 0}</td>
                <td className="px-4 py-3 font-bold text-teal-300">{expData?.experiment?.successfulActions ?? 0}</td>
                <td className="px-4 py-3 text-teal-400 font-semibold">
                  +{((expData?.experiment?.successfulActions || 0) - (expData?.control?.successfulActions || 0))} actions
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-white">Conversion Rate</td>
                <td className="px-4 py-3 text-blue-400 font-bold">{expData?.control?.conversionRate ?? 0}%</td>
                <td className="px-4 py-3 text-teal-400 font-bold">{expData?.experiment?.conversionRate ?? 0}%</td>
                <td className="px-4 py-3 text-purple-400 font-bold">
                  {expData?.relativeLift > 0 ? `+${expData?.relativeLift}% lift` : 'Baseline'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 2: INFRASTRUCTURE DEFECT ANALYTICS (PRESERVED)   */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Reports over time */}
        {data?.reportsOverTime && (
          <div className="card xl:col-span-2">
            <h2 className="font-bold text-white mb-5 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" /> Reports Over Time (Last 30 Days)
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.reportsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="count" name="Reports" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category breakdown */}
        <div className="card">
          <h2 className="font-bold text-white mb-5 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-teal-400" /> Issues by Category
          </h2>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-3">
                {categoryData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    {d.name}: {d.value}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-sm">No data available</p>
          )}
        </div>

        {/* Priority breakdown */}
        <div className="card">
          <h2 className="font-bold text-white mb-5 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-orange-400" /> Issues by Priority
          </h2>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                <Bar dataKey="value" name="Issues" radius={[6, 6, 0, 0]}>
                  {priorityData.map((_, i) => (
                    <Cell key={i} fill={['#ef4444', '#f97316', '#eab308', '#22c55e'][i] || '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm">No data available</p>
          )}
        </div>

        {/* Key metrics */}
        <div className="card xl:col-span-2">
          <h2 className="font-bold text-white mb-5">Key Performance Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Avg Resolution Time', value: data?.avgResolutionTime ? `${data.avgResolutionTime}h` : 'N/A', color: 'text-blue-400' },
              { label: 'Resolution Rate', value: data?.resolutionRate ? `${data.resolutionRate}%` : 'N/A', color: 'text-green-400' },
              { label: 'AI Analysis Rate', value: data?.aiAnalysisRate ? `${data.aiAnalysisRate}%` : 'N/A', color: 'text-teal-400' },
              { label: 'Critical Open', value: data?.criticalOpen ?? 'N/A', color: 'text-red-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-800/50 rounded-xl p-4 text-center">
                <p className={`text-3xl font-black ${color}`}>{value}</p>
                <p className="text-xs text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
