
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import flagsmith from 'flagsmith'
import { FlagsmithProvider } from 'flagsmith/react'
import { AuthProvider, useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import ReportIssue from './pages/ReportIssue'
import IssueMap from './pages/IssueMap'
import MyReports from './pages/MyReports'
import ReportDetail from './pages/ReportDetail'
import AdminDashboard from './pages/AdminDashboard'
import AdminReports from './pages/AdminReports'
import AdminAnalytics from './pages/AdminAnalytics'
import ExperimentAnalytics from './pages/ExperimentAnalytics'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

const flagsmithEnvironmentId =
  import.meta.env.VITE_FLAGSMITH_ENVIRONMENT_ID || ''

export default function App() {
  return (
    <FlagsmithProvider
      flagsmith={flagsmith}
      options={{
        environmentID: flagsmithEnvironmentId,
        cacheFlags: true,
      }}
    >
      <AuthProvider>
        <BrowserRouter basename="/CivicLens-AI-">
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                border: '1px solid #374151',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />

          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Citizen User routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout><Dashboard /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <Layout><ReportIssue /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <Layout><IssueMap /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-reports"
              element={
                <ProtectedRoute>
                  <Layout><MyReports /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/report/:id"
              element={
                <ProtectedRoute>
                  <Layout><ReportDetail /></Layout>
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout><AdminDashboard /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout><AdminReports /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout><AdminAnalytics /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/experiments"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout><ExperimentAnalytics /></AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </FlagsmithProvider>
  )
}
