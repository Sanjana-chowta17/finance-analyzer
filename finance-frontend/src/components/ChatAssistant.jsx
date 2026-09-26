import { useState } from 'react'
import { insightApi } from '../api/client.js'

const suggestions = [
  'Where did I spend the most this month?',
  'How can I reduce my spending?',
  'What are my biggest unnecessary expenses?',
  'Compare my spending by category',
  'Create a simple monthly budget for me',
  'How much could I save next month?',
]

export default function ChatAssistant() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const askQuestion = async (value) => {
    const q = value.trim()
    if (!q || loading) return
    setMessages((m) => [...m, { role: 'user', text: q }])
    setQuestion('')
    setLoading(true)
    try {
      const res = await insightApi.chat(q)
      setMessages((m) => [...m, { role: 'assistant', text: res.data.answer }])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', text: 'Sorry, I could not answer that right now.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleAsk = (e) => {
    e.preventDefault()
    askQuestion(question)
  }

  return (
    <div className="panel chat-panel">
      <div className="panel-heading">
        <div>
          <span className="panel-kicker">POWERED BY GEMINI</span>
          <h2>Ask about your finances</h2>
        </div>
        <div className="ai-spark">✦</div>
      </div>
      <p className="panel-description">Choose a question below or ask anything about your recorded transactions.</p>

      {messages.length === 0 ? (
        <div className="suggestions-area">
          <div className="suggestions-title">Try asking</div>
          <div className="suggestion-grid">
            {suggestions.map((item) => (
              <button key={item} className="suggestion-chip" onClick={() => askQuestion(item)}>{item}<span>→</span></button>
            ))}
          </div>
        </div>
      ) : (
        <div className="chat-window">
          {messages.map((m, i) => (
            <div key={i} className={`chat-message ${m.role}`}>
              <span className="message-label">{m.role === 'user' ? 'You' : 'FinanceAI'}</span>
              <p>{m.text}</p>
            </div>
          ))}
          {loading && <div className="chat-message assistant"><span className="message-label">FinanceAI</span><p>Thinking…</p></div>}
        </div>
      )}

      <form onSubmit={handleAsk} className="chat-form">
        <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question about your finances…" />
        <button className="primary-btn" type="submit" disabled={loading || !question.trim()}>Ask AI</button>
      </form>

      {messages.length > 0 && !loading && (
        <div className="follow-up-row">
          <span>Suggested next:</span>
          {suggestions.slice(0, 3).map((item) => <button key={item} onClick={() => askQuestion(item)}>{item}</button>)}
        </div>
      )}
    </div>
  )
}
