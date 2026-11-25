import flagsmith from 'flagsmith'

/**
 * Centralized Flagsmith configuration for CivicLens AI
 * Hackathon Feature Flag: "smart_road_dashboard"
 */

const ENVIRONMENT_ID = import.meta.env.VITE_FLAGSMITH_ENVIRONMENT_ID || ''

let isInitialized = false
let initPromise = null

export const FLAG_NAMES = {
  SMART_ROAD_DASHBOARD: 'smart_road_dashboard',
}

/**
 * Initialize Flagsmith SDK with graceful offline fallback
 * @param {string} identity - Optional anonymous user identity UUID
 */
export async function initFlagsmith(identity = null) {
  if (isInitialized && !identity) {
    return { success: true, client: flagsmith, source: 'cache' }
  }

  // Safe fallback if environment ID is missing
  if (!ENVIRONMENT_ID || ENVIRONMENT_ID.trim() === '' || ENVIRONMENT_ID.includes('YOUR_')) {
    console.warn(
      '[Flagsmith] VITE_FLAGSMITH_ENVIRONMENT_ID not set. Running in resilient local fallback mode (Control: Version A).'
    )
    return {
      success: false,
      error: 'Environment ID not configured',
      client: flagsmith,
      fallback: true,
    }
  }

  if (initPromise) return initPromise

  initPromise = new Promise((resolve) => {
    try {
      const config = {
        environmentID: ENVIRONMENT_ID.trim(),
        cacheFlags: true,
        enableAnalytics: false,
        onError: (err) => {
          console.warn('[Flagsmith] Connection warning, using local fallback:', err?.message || err)
          resolve({ success: false, error: err?.message || 'Connection error', fallback: true })
        },
      }

      if (identity) {
        config.identity = identity
      }

      flagsmith
        .init(config)
        .then(() => {
          isInitialized = true
          resolve({ success: true, client: flagsmith, fallback: false })
        })
        .catch((err) => {
          console.warn('[Flagsmith] Initialization failed, using local fallback:', err?.message || err)
          resolve({ success: false, error: err?.message || 'Init failed', fallback: true })
        })
    } catch (e) {
      console.warn('[Flagsmith] Unexpected error during init:', e)
      resolve({ success: false, error: e?.message || 'Unexpected error', fallback: true })
    }
  })

  return initPromise
}

/**
 * Check if the smart_road_dashboard feature flag is enabled
 */
export function isSmartRoadDashboardEnabled() {
  try {
    if (!flagsmith.hasFeature) return false
    return flagsmith.hasFeature(FLAG_NAMES.SMART_ROAD_DASHBOARD)
  } catch (err) {
    return false
  }
}

/**
 * Get multivariate experiment value: "control" (Version A) or "experiment" (Version B)
 */
export function getSmartRoadDashboardVariant() {
  try {
    const isEnabled = isSmartRoadDashboardEnabled()
    if (!isEnabled) return 'control'

    const val = flagsmith.getValue(FLAG_NAMES.SMART_ROAD_DASHBOARD)
    if (typeof val === 'string') {
      const lower = val.toLowerCase().trim()
      if (lower.includes('exp') || lower.includes('version_b') || lower.includes('smart')) {
        return 'experiment'
      }
      if (lower.includes('ctrl') || lower.includes('control') || lower.includes('version_a')) {
        return 'control'
      }
    }

    // If boolean flag is enabled without explicit string value, defaults to experiment
    return isEnabled ? 'experiment' : 'control'
  } catch (err) {
    return 'control'
  }
}

export default flagsmith
