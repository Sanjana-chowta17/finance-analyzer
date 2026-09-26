import { useState } from 'react'
import { transactionApi } from '../api/client.js'

export default function UploadStatement({ onUploaded }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)

  const upload = async (file) => {
    if (!file) return

    setLoading(true)
    setError('')

    try {
      await transactionApi.uploadCsv(file)
      onUploaded()
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleFile = (e) => {
    upload(e.target.files[0])
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    upload(e.dataTransfer.files[0])
  }

  return (
    <div className="panel upload-panel">
      <div className="panel-heading">
        <div>
          <span className="panel-kicker">BULK IMPORT</span>
          <h2>Import bank statement</h2>
        </div>

        <div className="section-icon" aria-hidden="true">
          ⇧
        </div>
      </div>

      <p className="panel-description">
        Upload a CSV and import multiple transactions at once.
      </p>

      <label
        className={`drop-zone ${dragging ? 'dragging' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <div className="upload-icon" aria-hidden="true">
          ↑
        </div>

        <strong>
          {loading
            ? 'Uploading and categorizing…'
            : 'Drop your CSV file here'}
        </strong>

        <span>
          or <u>browse from your computer</u>
        </span>

        <small className="upload-format">
          <span>Expected columns: date, description, amount</span>
          <span>Date format: YYYY-MM-DD</span>
        </small>

        <input
          type="file"
          accept=".csv"
          onChange={handleFile}
          disabled={loading}
        />
      </label>

      {error && (
        <div className="form-error">
          <span>!</span>
          {error}
        </div>
      )}
    </div>
  )
}
