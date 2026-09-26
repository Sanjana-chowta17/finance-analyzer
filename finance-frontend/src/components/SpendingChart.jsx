import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#4f46e5', '#7c3aed', '#0891b2', '#16a34a', '#f59e0b', '#ef4444', '#ec4899', '#64748b']

export default function SpendingChart({ transactions }) {
  const byCategory = {}
  transactions.forEach((t) => {
    const cat = t.category || 'Other'
    byCategory[cat] = (byCategory[cat] || 0) + Number(t.amount || 0)
  })
  const data = Object.entries(byCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  return (
    <div className="panel chart-panel">
      <div className="panel-heading">
        <div>
          <span className="panel-kicker">OVERVIEW</span>
          <h2>Spending by category</h2>
        </div>
        <span className="mini-badge">This data</span>
      </div>

      {data.length === 0 ? (
        <div className="empty-chart">
          <div className="empty-icon">◔</div>
          <strong>No spending data yet</strong>
          <span>Add a transaction to see your spending breakdown.</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={290}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={62} outerRadius={100} paddingAngle={3}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
            </Pie>
            <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 'Spent']} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
