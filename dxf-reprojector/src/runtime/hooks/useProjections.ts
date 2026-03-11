import { React } from 'jimu-core'
import { fetchProjections, GPServiceError } from '../services/GPService'

const { useState, useEffect } = React

interface UseProjectionsResult {
  projections: string[]
  loading: boolean
  error: string
}

/**
 * Fetches the projection choiceList from the configured GP task.
 *
 * @param gpTaskUrl     Fully-resolved GP task URL from resolveGPTaskUrl().
 *                      If empty, returns empty projections without error.
 * @param gpOutputField Parameter name in the GP task whose choiceList holds projections.
 */
export function useProjections(
  gpTaskUrl: string,
  gpOutputField: string
): UseProjectionsResult {
  const [projections, setProjections] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!gpTaskUrl?.trim()) {
      setProjections([])
      setError('')
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')

    fetchProjections(gpTaskUrl, gpOutputField)
      .then(prjs => {
        if (!cancelled) {
          setProjections(prjs)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(
            err instanceof GPServiceError
              ? err.message
              : 'Failed to load projections from GP service.'
          )
          setProjections([])
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [gpTaskUrl, gpOutputField])

  return { projections, loading, error }
}
