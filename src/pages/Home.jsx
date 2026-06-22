import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="home-container">
      <header className="home-header">
        <div className="home-logo">FieldComm</div>
        <span className="home-badge">PRO</span>
      </header>

      <div className="home-content">
        <div className="home-hero">
          <h1 className="home-title">Field Communication</h1>
          <p className="home-subtitle">Professional construction management tools</p>
        </div>

        <div className="home-grid">
          <Link to="/daily-report" className="home-card">
            <div className="card-icon">📋</div>
            <h2 className="card-title">Daily Report</h2>
            <p className="card-desc">Track daily progress, crew, and site conditions</p>
          </Link>

          <Link to="/field-walk" className="home-card">
            <div className="card-icon">🚶</div>
            <h2 className="card-title">Field Walk</h2>
            <p className="card-desc">Document observations and issues in the field</p>
          </Link>

          <Link to="/punch-list" className="home-card">
            <div className="card-icon">✅</div>
            <h2 className="card-title">Punch List</h2>
            <p className="card-desc">Manage and track punch list items</p>
          </Link>

          <Link to="/reply" className="home-card">
            <div className="card-icon">💬</div>
            <h2 className="card-title">Reply</h2>
            <p className="card-desc">Respond to foreman assignments</p>
          </Link>
        </div>

        <div className="home-footer">
          <p>© 2026 FieldComm Pro · Demo Version</p>
        </div>
      </div>
    </div>
  )
}

export default Home
