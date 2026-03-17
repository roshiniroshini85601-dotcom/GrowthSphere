import React from 'react'

/**
 * Generic hook to fetch data from an API endpoint.
 * Returns { data, loading, error, refetch }.
 */
export function useApi<T>(url: string) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const json = await res.json()
      setData(json)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchData()
  }, [url])

  return { data, loading, error, refetch: fetchData }
}
