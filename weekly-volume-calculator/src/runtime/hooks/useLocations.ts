import { React } from 'jimu-core'
import { fetchLocations, GPError } from '../services/GPService'

const { useState, useEffect } = React

interface UseLocationsResult {
  locations: string[]
  loading: boolean
  error: string | null
}

/**
 * Fetches location names from the configured GP service whenever the mine site changes.
 * Cancels in-flight requests if the mine site changes before the response arrives.
 *
 * @param gpUrl    Resolved GP task URL (null → skips fetch)
 * @param mineSite Currently selected mine site name (empty string → clears list)
 */
export function useLocations(gpUrl: string | null, mineSite: string): UseLocationsResult {
  const [locations, setLocations] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!gpUrl || !mineSite) {
      setLocations([])
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    setLocations([])

    fetchLocations(gpUrl, mineSite)
      .then(result => {
        if (!cancelled) {
          setLocations(result)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err instanceof GPError ? err.message : 'Failed to load locations.')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [gpUrl, mineSite])

  return { locations, loading, error }
}
