import { useState } from 'react'
import { Link } from 'react-router-dom'
import { shortenUrl } from '../api'

export default function Home() {
  const [longUrl, setLongUrl] = useState('')
  const [expiry, setExpiry] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)   // { shortUrl, shortCode, alreadyExists }
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleShorten = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)

    const url = longUrl.trim()
    if (!url) return setError('Please enter a URL')
    if (!url.startsWith('http://') && !url.startsWith('https://'))
      return setError('URL must start with http:// or https://')

    setLoading(true)
    try {
      const { data, status, ok } = await shortenUrl(url, expiry)

      if (status === 429) {
        setError(data.error || 'Too many requests. Please wait a minute and try again.')
        return
      }
      if (!ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      setResult({
        shortUrl: data.shortUrl,
        shortCode: data.shortCode,
        alreadyExists: status === 200,
      })
    } catch {
      setError('Network error — please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="page">
      {/* Background blobs */}
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />

      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            Snap<span className="accent">Link</span>
          </div>
          <p className="tagline">Shorten URLs · Track clicks · Understand your audience</p>
        </header>

        {/* Main Card */}
        <div className="card">
          <p className="card-title">Shorten a URL</p>
          <form onSubmit={handleShorten}>
            <div className="input-wrap">
              <span className="input-icon">🔗</span>
              <input
                id="longUrlInput"
                type="url"
                placeholder="Paste your long URL here (https://...)"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                required
              />
            </div>

            <div className="options-row">
              <span className="options-label">Expires in (days):</span>
              <input
                id="expiryInput"
                type="number"
                placeholder="e.g. 7"
                min="1"
                max="365"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
            </div>

            <button id="shortenBtn" className="btn" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" />
                  Shortening…
                </>
              ) : (
                <>Shorten URL →</>
              )}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div className="result-box">
              <p className="result-label">
                {result.alreadyExists ? 'Already shortened — existing link:' : 'Your short URL is ready:'}
              </p>
              <div className="result-url-row">
                <a href={result.shortUrl} target="_blank" rel="noreferrer" id="shortUrlDisplay">
                  {result.shortUrl}
                </a>
                <button
                  className="btn btn-sm"
                  id="copyBtn"
                  onClick={handleCopy}
                  type="button"
                >
                  {copied ? '✅ Copied!' : 'Copy'}
                </button>
              </div>
              <div className="analytics-link-row">
                <Link id="analyticsLink" to={`/analytics?code=${result.shortCode}`}>
                  📊 View Analytics
                </Link>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="error-box" id="errorSection">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Features strip */}
        <div className="features">
          {['⚡ Instant shortening', '📊 Click analytics', '🌍 Geo tracking', '🔒 Rate limited'].map(f => (
            <div key={f} className="feature-pill">{f}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
