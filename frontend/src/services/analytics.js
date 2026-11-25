import api from './api'

/**
 * Privacy-conscious experiment event tracking for CivicLens AI.
 * Does NOT track passwords, JWT tokens, PII, or photos.
 */

// Generate or retrieve an anonymous session identifier stored in sessionStorage
function getAnonymousSessionId() {
  let sid = sessionStorage.getItem('civiclens_exp_session_id')
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36)
    sessionStorage.setItem('civiclens_exp_session_id', sid)
  }
  return sid
}

/**
 * Record a road safety interaction event
 * @param {string} variant - "control" (Version A) or "experiment" (Version B)
 * @param {string} eventType - e.g. "dashboard_view", "pothole_alert_view", "issue_report_submit", "map_interaction", "traffic_recommendation_click"
 * @param {object} metadata - Optional non-PII metadata
 */
export async function trackExperimentEvent(variant, eventType, metadata = {}) {
  try {
    const payload = {
      experimentName: 'smart_road_dashboard',
      variant: variant === 'experiment' ? 'experiment' : 'control',
      eventType,
      sessionId: getAnonymousSessionId(),
      metadata: metadata ? JSON.stringify(metadata) : null,
    }

    // Fire and forget, does not block the UI
    await api.post('/experiments/track', payload)
  } catch (err) {
    // Graceful silent error to never disrupt the user experience
    console.debug('[Experiment Analytics] Track failed silently:', err?.message || err)
  }
}

export const ExperimentEvents = {
  DASHBOARD_VIEW: 'dashboard_view',
  POTHOLE_ALERT_VIEW: 'pothole_alert_view',
  ISSUE_REPORT_SUBMIT: 'issue_report_submit',
  MAP_INTERACTION: 'map_interaction',
  TRAFFIC_RECOMMENDATION_CLICK: 'traffic_recommendation_click',
}
