import { useState } from 'react'
import { transactionApi } from '../api/client.js'

export default function AddTransaction({ onAdded }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await transactionApi.create({ description, amount: Number(amount), date })
      setDescription('')
      setAmount('')
      onAdded()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel form-panel">
      <div className="panel-heading">
        <div>
          <span className="panel-kicker">QUICK ACTION</span>
          <h2>Add a transaction</h2>
        </div>
        <div className="section-icon">＋</div>
      </div>
      <p className="panel-description">Add a recent expense and let the app categorize it automatically.</p>

      <form onSubmit={handleSubmit} className="transaction-form">
        <div className="field">
          <label>Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Grocery shopping" required />
        </div>
        <div className="field">
          <label>Amount</label>
          <div className="input-with-prefix"><span>₹</span><input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required /></div>
        </div>
        <div className="field">
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <button className="primary-btn submit-btn" type="submit" disabled={loading}>
          {loading ? 'Categorizing…' : 'Add transaction'}
        </button>
      </form>
      {error && <div className="form-error"><span>!</span>{error}</div>}
    </div>
  )
}
