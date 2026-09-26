export default function SummaryCards({ transactions }) {
  const total = transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0)
  const byCategory = {}
  transactions.forEach((t) => {
    const cat = t.category || 'Other'
    byCategory[cat] = (byCategory[cat] || 0) + Number(t.amount || 0)
  })

  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]
  const average = transactions.length ? total / transactions.length : 0

  const cards = [
    { label: 'Total spent', value: `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: '↗', tone: 'blue', note: 'Across all transactions' },
    { label: 'Transactions', value: transactions.length, icon: '↔', tone: 'violet', note: 'Recorded in your account' },
    { label: 'Average transaction', value: `₹${average.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: '⌁', tone: 'green', note: 'Per transaction' },
    { label: 'Top category', value: topCategory ? topCategory[0] : '—', icon: '◔', tone: 'orange', note: topCategory ? `₹${topCategory[1].toLocaleString('en-IN', { maximumFractionDigits: 0 })} spent` : 'Add data to see' },
  ]

  return (
    <div className="summary-grid">
      {cards.map((card) => (
        <div className="summary-card" key={card.label}>
          <div className={`summary-icon ${card.tone}`}>{card.icon}</div>
          <div className="summary-content">
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.note}</small>
          </div>
        </div>
      ))}
    </div>
  )
}
