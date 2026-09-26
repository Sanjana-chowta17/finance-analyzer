import { useEffect, useMemo, useState } from 'react'
import { transactionApi } from '../api/client.js'

export default function TransactionList({ transactions, onChanged }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  // Delete modal state
  const [transactionToDelete, setTransactionToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const categories = useMemo(
    () => ['All', ...new Set(transactions.map((t) => t.category || 'Other'))],
    [transactions]
  )

  const filtered = transactions.filter((t) => {
    const matchesText = `${t.description || ''} ${t.category || ''}`
      .toLowerCase()
      .includes(query.toLowerCase())

    const matchesCategory =
      category === 'All' || (t.category || 'Other') === category

    return matchesText && matchesCategory
  })

  // Open delete confirmation modal
  const handleDeleteClick = (transaction) => {
    setDeleteError('')
    setTransactionToDelete(transaction)
  }

  // Actually delete the transaction
  const handleConfirmDelete = async () => {
    if (!transactionToDelete || deleting) return

    setDeleting(true)
    setDeleteError('')

    try {
      await transactionApi.delete(transactionToDelete.id)

      setTransactionToDelete(null)
      onChanged()
    } catch {
      setDeleteError('Could not delete the transaction. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  // Close modal
  const handleCloseDeleteModal = () => {
    if (deleting) return

    setTransactionToDelete(null)
    setDeleteError('')
  }

  // Close with Escape key
  useEffect(() => {
    if (!transactionToDelete) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !deleting) {
        handleCloseDeleteModal()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [transactionToDelete, deleting])

  const formatDate = (date) => {
    if (!date) return '—'

    const d = new Date(`${date}T00:00:00`)

    return Number.isNaN(d.getTime())
      ? date
      : d.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
  }

  const formatAmount = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  return (
    <>
      <div className="panel transactions-panel">
        <div className="panel-heading transaction-heading">
          <div>
            <span className="panel-kicker">ACTIVITY</span>
            <h2>Recent transactions</h2>
          </div>

          <span className="count-badge">
            {transactions.length} total
          </span>
        </div>

        <div className="table-toolbar">
          <div className="search-box">
            <span>⌕</span>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search transactions…"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-table">
            <div className="empty-icon">↔</div>

            <strong>
              {transactions.length
                ? 'No matching transactions'
                : 'No transactions yet'}
            </strong>

            <span>
              {transactions.length
                ? 'Try another search or category.'
                : 'Add a transaction or import a bank statement to get started.'}
            </span>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th className="amount-cell">Amount</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className="transaction-name">
                        <span className="transaction-avatar">
                          {(t.description || '?')
                            .charAt(0)
                            .toUpperCase()}
                        </span>

                        <strong>{t.description}</strong>
                      </div>
                    </td>

                    <td>
                      <span className="category-pill">
                        {t.category || 'Other'}
                      </span>
                    </td>

                    <td className="muted-cell">
                      {formatDate(t.date)}
                    </td>

                    <td className="amount-cell">
                      <strong>
                        {formatAmount(t.amount)}
                      </strong>
                    </td>

                    <td>
                      <button
                        className="icon-btn danger"
                        title="Delete transaction"
                        aria-label={`Delete ${t.description || 'transaction'}`}
                        onClick={() => handleDeleteClick(t)}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            d="M4 7h16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />

                          <path
                            d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />

                          <path
                            d="M6.5 7l.7 12.1A1.5 1.5 0 0 0 8.7 20.5h6.6a1.5 1.5 0 0 0 1.5-1.4L17.5 7"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />

                          <path
                            d="M10 11v5.5M14 11v5.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =====================================================
          DELETE CONFIRMATION MODAL
          ===================================================== */}

      {transactionToDelete && (
        <div
          className="delete-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !deleting) {
              handleCloseDeleteModal()
            }
          }}
        >
          <div
            className="delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <div className="delete-modal-icon">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M4 7h16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                <path
                  d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                <path
                  d="M6.5 7l.7 12.1A1.5 1.5 0 0 0 8.7 20.5h6.6a1.5 1.5 0 0 0 1.5-1.4L17.5 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                <path
                  d="M10 11v5.5M14 11v5.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <button
              className="delete-modal-close"
              type="button"
              onClick={handleCloseDeleteModal}
              disabled={deleting}
              aria-label="Close"
            >
              ×
            </button>

            <div className="delete-modal-content">
              <span className="delete-modal-kicker">
                DELETE TRANSACTION
              </span>

              <h3 id="delete-modal-title">
                Delete this transaction?
              </h3>

              <p className="delete-modal-description">
                Are you sure you want to permanently delete this
                transaction?
              </p>

              <div className="delete-transaction-preview">
                <div className="delete-preview-avatar">
                  {(transactionToDelete.description || '?')
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="delete-preview-info">
                  <strong>
                    {transactionToDelete.description || 'Transaction'}
                  </strong>

                  <span>
                    {transactionToDelete.category || 'Other'}
                    {' · '}
                    {formatDate(transactionToDelete.date)}
                  </span>
                </div>

                <strong className="delete-preview-amount">
                  {formatAmount(transactionToDelete.amount)}
                </strong>
              </div>

              <p className="delete-modal-warning">
                This action cannot be undone.
              </p>

              {deleteError && (
                <div className="delete-modal-error">
                  {deleteError}
                </div>
              )}

              <div className="delete-modal-actions">
                <button
                  type="button"
                  className="delete-cancel-btn"
                  onClick={handleCloseDeleteModal}
                  disabled={deleting}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="delete-confirm-btn"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span className="delete-spinner"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          d="M4 7h16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />

                        <path
                          d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />

                        <path
                          d="M6.5 7l.7 12.1A1.5 1.5 0 0 0 8.7 20.5h6.6a1.5 1.5 0 0 0 1.5-1.4L17.5 7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>

                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}