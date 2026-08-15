import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { RESULTS } from './generateResults'
import { fetchLotteryResults } from './lotteryApi'

const LotteryDataContext = createContext(null)

export function LotteryDataProvider({ children }) {
  const [results, setResults] = useState(RESULTS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastSynced, setLastSynced] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const liveResults = await fetchLotteryResults({ refresh: true })
      if (Array.isArray(liveResults) && liveResults.length) {
        setResults(liveResults)
        setLastSynced(new Date())
        setError(null)
      } else {
        setError(new Error('The source returned no parsed results'))
      }
    } catch (requestError) {
      setError(requestError)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    fetchLotteryResults()
      .then((liveResults) => {
        if (!active) return
        if (Array.isArray(liveResults) && liveResults.length) {
          setResults(liveResults)
          setLastSynced(new Date())
          setError(null)
        } else {
          setError(new Error('The source returned no parsed results'))
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const value = useMemo(() => ({ results, loading, error, lastSynced, refresh }), [results, loading, error, lastSynced, refresh])
  return <LotteryDataContext.Provider value={value}>{children}</LotteryDataContext.Provider>
}

export function useLotteryData() {
  const value = useContext(LotteryDataContext)
  if (!value) throw new Error('useLotteryData must be used inside LotteryDataProvider')
  return value
}
