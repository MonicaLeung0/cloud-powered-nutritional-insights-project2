import { useState } from 'react'

function OAuthTwoFactorCard() {
  const [twoFactorCode, setTwoFactorCode] = useState('')

  return (
    <div className="oauth-card">
      <h3 className="oauth-card__title">Secure Login</h3>
      <div className="oauth-card__buttons">
        <button type="button" className="oauth-button">
          Login with Google
        </button>
        <button type="button" className="oauth-button">
          Login with GitHub
        </button>
      </div>
      <label className="oauth-card__label" htmlFor="two-factor-code">
        Enter 2FA Code
      </label>
      <input
        id="two-factor-code"
        type="text"
        className="oauth-card__input"
        placeholder="Enter your 2FA code"
        value={twoFactorCode}
        onChange={(e) => setTwoFactorCode(e.target.value)}
        autoComplete="one-time-code"
        inputMode="numeric"
      />
    </div>
  )
}

export default OAuthTwoFactorCard
