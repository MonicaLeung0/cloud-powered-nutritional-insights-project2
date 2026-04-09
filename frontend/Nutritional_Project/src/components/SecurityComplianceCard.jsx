// ============================================================
// SecurityComplianceCard.jsx
// ============================================================
// PURPOSE: This component checks REAL security conditions
// from your backend API and displays them dynamically.
//
// it fetches live status from your Azure Function endpoint
// (/api/security_status) every time the page loads.

import { useEffect, useState } from 'react'

// ── This should match the same base URL you use in App.jsx ──
const API_BASE_URL =
  'https://group8projec2nutriinsightapi.azurewebsites.net/api'

function SecurityComplianceCard() {
  // ── State variables ──────────────────────────────────────
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ── useEffect runs once when the component first appears ──
  useEffect(() => {
    async function fetchSecurityStatus() {
      try {
        setLoading(true)
        setError(null)

        // Call our new backend endpoint
        const response = await fetch(`${API_BASE_URL}/security_status`)

        // If the server returns an error (like 500), throw
        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`)
        }

        // Parse the JSON response from the backend
        const data = await response.json()

        // Store the security status in our state
        setStatus(data)
      } catch (err) {
        // If anything goes wrong, save the error message
        console.error('Failed to fetch security status:', err)
        setError(err.message)
      } finally {
        // Whether it succeeded or failed, we're done loading
        setLoading(false)
      }
    }

    fetchSecurityStatus()
  }, [])
  // The empty [] means: only run this once, when the component mounts.

  // ── Helper function to pick the right CSS class ──────────
  function getStatusClass(value) {
    const goodStatuses = [
      'enabled',
      'secure',
      'gdpr compliant',
      'compliant',
      'active',
    ]
    if (goodStatuses.includes(value?.toLowerCase())) {
      return 'security-card__ok' // green
    }
    return 'security-card__fail' // red
  }

  // ── LOADING STATE ────────────────────────────────────────
  if (loading) {
    return (
      <div className="security-card">
        <h3 className="security-card__title">Security Status</h3>
        <p className="security-card__loading">
          Checking security status…
        </p>
      </div>
    )
  }

  // ── ERROR STATE ──────────────────────────────────────────
  if (error) {
    return (
      <div className="security-card">
        <h3 className="security-card__title">Security Status</h3>
        <p className="security-card__error">
          ⚠ Could not verify security status: {error}
        </p>
        <button
          type="button"
          className="security-card__retry"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    )
  }

  // ── SUCCESS STATE ────────────────────────────────────────
  return (
    <div className="security-card">
      <h3 className="security-card__title">Security Status</h3>
      <ul className="security-card__list">
        <li>
          Encryption:{' '}
          <span className={getStatusClass(status.encryption)}>
            {status.encryption}
          </span>
        </li>
        <li>
          Access Control:{' '}
          <span className={getStatusClass(status.accessControl)}>
            {status.accessControl}
          </span>
        </li>
        <li>
          Compliance:{' '}
          <span className={getStatusClass(status.compliance)}>
            {status.compliance}
          </span>
        </li>
      </ul>

      {/* ── Timestamp shows WHEN the check was performed ── */}
      <p className="security-card__timestamp">
        Last checked: {new Date(status.checkedAt).toLocaleString()}
      </p>
    </div>
  )
}

export default SecurityComplianceCard