import { useState } from 'react'
import { insightApi } from '../api/client.js'

export default function InsightsPanel() {
  const [insight, setInsight] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await insightApi.generate()
      setInsight(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate insight')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel ai-panel">
      <div className="ai-glow" />
      <div className="panel-heading ai-heading">
        <div>
          <span className="panel-kicker">POWERED BY AI</span>
          <h2>Financial insights</h2>
        </div>
        <span className="ai-spark">✦</span>
      </div>

      {!insight && !error && (
        <div className="ai-empty">
          <div className="ai-orb">✦</div>
          <strong>Turn your transactions into insights</strong>
          <p>Get a quick summary of your spending patterns and practical suggestions.</p>
          <button className="primary-btn" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Analyzing…' : 'Generate monthly insight'}
          </button>
        </div>
      )}

      {loading && <div className="ai-loading"><div className="spinner" />Analyzing your spending…</div>}
      {error && <div className="alert error-alert"><span>!</span><small>{error}</small></div>}

      {insight && !loading && (
        <div className="insight-result">
          <div className="insight-label">✦ Your latest insight</div>
          <p>{insight.content}</p>
          <button className="text-btn" onClick={handleGenerate}>Refresh insight →</button>
        </div>
      )}
    </div>
  )
}
