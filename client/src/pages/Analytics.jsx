import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchAnalyticsSummary, fetchCountries, fetchDevices } from '../api'

function BarChart({ data, labelKey }) {
  if (!data || data.length === 0)
    return <p className="empty-state">No data yet — share your link to start tracking!</p>

  const max = data[0].count
  return data.map((item) => (
    <div className="bar-row" key={item[labelKey]}>
      <span className="bar-label">{item[labelKey] || 'Unknown'}</span>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${(item.count / max) * 100}%` }} />
      </div>
      <span className="bar-count">{item.count}</span>
    </div>
  ))
}

export default function Analytics() {
  const [searchParams] = useSearchParams()
  const [code, setCode] = useState(searchParams.get('code') || '')
  const [loading, setLoading] = useState(false)
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')

  // Auto-load if code is in the URL
  useEffect(() => {
    if (searchParams.get('code')) loadAnalytics(searchParams.get('code'))
  }, [])

  const loadAnalytics = async (codeToLoad = code) => {
    const trimmed = codeToLoad.trim()
    if (!trimmed) return setError('Please enter a short code')

    setLoading(true)
    setError('')
    setDashboard(null)

    try {
      const { data: summary, ok } = await fetchAnalyticsSummary(trimmed)
      if (!ok) {
        setError(summary.error || 'Short URL not found')
        return
      }

      const [countries, devices] = await Promise.all([
        fetchCountries(trimmed),
        fetchDevices(trimmed),
      ])

      const daysActive = Math.max(
        0,
        Math.floor((new Date() - new Date(summary.createdAt)) / 86_400_000)
      )

      setDashboard({ summary, countries: countries.data, devices: devices.data, daysActive })
    } catch {
      setError('Network error — please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />

      <div className="container">
        {/* Back link */}
        <Link to="/" className="back-btn">← Back to shortener</Link>

        <header className="header">
          <div className="logo">📊 Analytics</div>
          <p className="tagline">Track your link performance in real time</p>
        </header>

        {/* Lookup card */}
        <div className="card">
          <p className="card-title">Enter your short code</p>
          <div className="input-wrap" style={{ marginBottom: '1rem' }}>
            <span className="input-icon">🔍</span>
            <input
              id="codeInput"
              type="text"
              placeholder="e.g. aB3xYz"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadAnalytics()}
            />
          </div>
          <button
            id="loadBtn"
            className="btn"
            onClick={() => loadAnalytics()}
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner" /> Loading…</>
            ) : 'Load Analytics →'}
          </button>

          {error && <div className="error-box">⚠️ {error}</div>}
        </div>

        {/* Dashboard */}
        {dashboard && (
          <>
            {/* Stats row */}
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">👆</span>
                <span className="stat-number" id="totalClicks">{dashboard.summary.totalClicks}</span>
                <span className="stat-label">Total Clicks</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">📅</span>
                <span className="stat-number" id="createdDays">{dashboard.daysActive}</span>
                <span className="stat-label">Days Active</span>
              </div>
            </div>

            {/* Original URL */}
            <div className="card">
              <p className="card-title">Original URL</p>
              <a
                id="originalUrl"
                href={dashboard.summary.longUrl}
                target="_blank"
                rel="noreferrer"
                className="original-url"
              >
                {dashboard.summary.longUrl}
              </a>
            </div>

            {/* Countries */}
            <div className="card">
              <p className="card-title">🌍 Top Countries</p>
              <div id="countriesList">
                <BarChart data={dashboard.countries} labelKey="country" />
              </div>
            </div>

            {/* Devices */}
            <div className="card">
              <p className="card-title">📱 Device Breakdown</p>
              <div id="devicesList">
                <BarChart data={dashboard.devices} labelKey="device" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
