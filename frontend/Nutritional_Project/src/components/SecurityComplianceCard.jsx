function SecurityComplianceCard() {
  return (
    <div className="security-card">
      <h3 className="security-card__title">Security Status</h3>
      <ul className="security-card__list">
        <li>
          Encryption: <span className="security-card__ok">Enabled</span>
        </li>
        <li>
          Access Control: <span className="security-card__ok">Secure</span>
        </li>
        <li>
          Compliance: <span className="security-card__ok">GDPR Compliant</span>
        </li>
      </ul>
    </div>
  )
}

export default SecurityComplianceCard
