import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import {
  initFlagsmith,
  isSmartRoadDashboardEnabled,
  getSmartRoadDashboardVariant,
  FLAG_NAMES,
} from '../services/flagsmith'

const FlagsmithContext = createContext(null)

export function FlagsmithProvider({ children }) {
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState(null)
  const [isFallback, setIsFallback] = useState(false)

  // Manual override for Hackathon demonstration & live judging testing:
  // "auto" (default: real Flagsmith evaluation), "control", or "experiment"
  const [overrideMode, setOverrideMode] = useState(() => {
    return localStorage.getItem('civiclens_variant_override') || 'auto'
  })

  // Live evaluated state from Flagsmith SDK
  const [flagsmithState, setFlagsmithState] = useState({
    smartRoadDashboardEnabled: false,
    evaluatedVariant: 'control',
  })

  useEffect(() => {
    let isMounted = true

    async function setupFlagsmith() {
      setLoading(true)
      const res = await initFlagsmith()

      if (!isMounted) return

      if (res.success) {
        setInitialized(true)
        setIsFallback(false)
        setError(null)

        const enabled = isSmartRoadDashboardEnabled()
        const variant = getSmartRoadDashboardVariant()

        setFlagsmithState({
          smartRoadDashboardEnabled: enabled,
          evaluatedVariant: variant,
        })
      } else {
        setInitialized(true)
        setIsFallback(true)
        setError(res.error || 'Flagsmith offline fallback active')

        // Safe fallback is Version A (Control)
        setFlagsmithState({
          smartRoadDashboardEnabled: false,
          evaluatedVariant: 'control',
        })
      }

      setLoading(false)
    }

    setupFlagsmith()

    return () => {
      isMounted = false
    }
  }, [])

  const setManualOverride = (mode) => {
    if (mode === 'auto') {
      localStorage.removeItem('civiclens_variant_override')
      setOverrideMode('auto')
    } else {
      localStorage.setItem('civiclens_variant_override', mode)
      setOverrideMode(mode)
    }
  }

  // Determine final effective variant:
  // If overrideMode !== 'auto', use override; otherwise use live Flagsmith SDK evaluation
  const effectiveVariant = useMemo(() => {
    if (overrideMode === 'control') return 'control'
    if (overrideMode === 'experiment') return 'experiment'
    return flagsmithState.evaluatedVariant
  }, [overrideMode, flagsmithState.evaluatedVariant])

  const isExperiment = effectiveVariant === 'experiment'

  const value = {
    loading,
    initialized,
    error,
    isFallback,
    flagName: FLAG_NAMES.SMART_ROAD_DASHBOARD,
    flagsmithEnabled: flagsmithState.smartRoadDashboardEnabled,
    evaluatedVariant: flagsmithState.evaluatedVariant,
    effectiveVariant, // "control" or "experiment"
    isExperiment, // true if Version B (Smart Road Dashboard)
    overrideMode, // "auto", "control", "experiment"
    setManualOverride,
  }

  return (
    <FlagsmithContext.Provider value={value}>
      {children}
    </FlagsmithContext.Provider>
  )
}

export const useFlagsmith = () => {
  const context = useContext(FlagsmithContext)
  if (!context) {
    throw new Error('useFlagsmith must be used within a FlagsmithProvider')
  }
  return context
}
