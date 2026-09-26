import { useEffect, useState, useCallback } from 'react'
import { transactionApi } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import SummaryCards from '../components/SummaryCards.jsx'
import SpendingChart from '../components/SpendingChart.jsx'
import TransactionList from '../components/TransactionList.jsx'
import AddTransaction from '../components/AddTransaction.jsx'
import UploadStatement from '../components/UploadStatement.jsx'
import InsightsPanel from '../components/InsightsPanel.jsx'
import ChatAssistant from '../components/ChatAssistant.jsx'

const titles = {
  dashboard: ['Dashboard', 'A clear overview of your spending and recent activity.'],
  transactions: ['Transactions', 'Review, search and manage all your recorded expenses.'],
  analytics: ['Analytics', 'Understand where your money is going and spot spending patterns.'],
  insights: ['AI Financial Assistant', 'Ask questions about your finances and get practical answers from your transaction data.'],
  import: ['Import Statement', 'Upload a CSV bank statement and import multiple transactions at once.'],
}

export default function Dashboard({ view = 'dashboard' }) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setPageError('')
    try {
      const res = await transactionApi.getAll()
      setTransactions(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setPageError(err.response?.data?.error || 'Unable to load your transactions.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])

  const [title, subtitle] = titles[view] || titles.dashboard

  return (
    <div className="dashboard-page">
  <section className="page-header">
  <div>
    <p className="eyebrow">PERSONAL FINANCE</p>

    {view === 'dashboard' ? (
      <>
        <h1 className="greeting-title">
          Good to see you,{' '}
          <span className="greeting-name">
            {user?.fullName?.split(' ')[0] || 'there'}
          </span>
        </h1>

        <p className="page-subtitle">
          Here’s your financial overview for today.
        </p>
      </>
    ) : (
      <>
        <h1>{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </>
    )}
  </div>

  {view !== 'import' && view !== 'insights' && (
  <a className="primary-btn" href="#add-transaction">
    <span>＋</span> Add transaction
  </a>
)}
</section>

      {pageError && (
        <div className="alert error-alert">
          <span>!</span>
          <div><strong>Could not load transactions</strong><small>{pageError}</small></div>
        </div>
      )}

      {loading ? (
        <div className="loading-card"><div className="spinner" /><span>Loading your financial overview…</span></div>
      ) : (
        <>
          {view === 'dashboard' && (
            <>
              <SummaryCards transactions={transactions} />
              <div className="dashboard-grid">
                <SpendingChart transactions={transactions} />
                <InsightsPanel />
              </div>
              <div id="add-transaction" className="section-block"><AddTransaction onAdded={fetchTransactions} /></div>
              <section className="dashboard-lower-grid">
                <TransactionList transactions={transactions.slice(0, 5)} onChanged={fetchTransactions} compact />
                <UploadStatement onUploaded={fetchTransactions} />
              </section>
            </>
          )}

          {view === 'transactions' && (
            <>
              <div id="add-transaction" className="section-block"><AddTransaction onAdded={fetchTransactions} /></div>
              <section className="section-block"><TransactionList transactions={transactions} onChanged={fetchTransactions} /></section>
            </>
          )}

          {view === 'analytics' && (
            <div className="analytics-page-grid">
              <SummaryCards transactions={transactions} />
              <SpendingChart transactions={transactions} />
              <InsightsPanel />
            </div>
          )}

          {view === 'insights' && (
            <div className="ai-page-grid">
              <InsightsPanel />
              <ChatAssistant />
            </div>
          )}

          {view === 'import' && (
            <div className="import-page-grid">
              <UploadStatement onUploaded={fetchTransactions} />
              <div className="panel import-help">
                <span className="panel-kicker">CSV FORMAT</span>
                <h2>Make your statement ready</h2>
                <p>Your file should contain a date, description and amount column. After upload, transactions are added to your account and can be reviewed in Transactions.</p>
                <div className="format-row"><span>✓</span><strong>Date</strong><small>YYYY-MM-DD</small></div>
                <div className="format-row"><span>✓</span><strong>Description</strong><small>e.g. Grocery shopping</small></div>
                <div className="format-row"><span>✓</span><strong>Amount</strong><small>Numeric value in INR</small></div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
