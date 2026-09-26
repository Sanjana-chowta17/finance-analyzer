import { useState } from 'react'
import { Routes, Route, Navigate, NavLink, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Account from './pages/Account.jsx'

function AppShell() {
  const { user, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  const navItems = [
    { label: 'Dashboard', icon: '⌂', path: '/' },
    { label: 'Transactions', icon: '↔', path: '/transactions' },
    { label: 'Analytics', icon: '◔', path: '/analytics' },
    { label: 'AI Assistant', icon: '✦', path: '/insights' },
    { label: 'Import Statement', icon: '⇧', path: '/import' },
  ]

  const initials = (user.fullName || 'U')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="app-shell">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <Link to="/" className="brand">
          <span className="brand-mark">₹</span>

          <span>
            <strong>Finance Analyzer</strong>
            <small>Personal Finance</small>
          </span>
        </Link>

        <nav className="sidebar-nav">
          <p className="nav-label">MAIN MENU</p>

          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `side-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="side-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">

          <div className="secure-note">
            <span>✓</span>

            <div>
              <strong>Your data is private</strong>
              <small>Protected by secure authentication</small>
            </div>
          </div>

          <button
            className="side-link logout-link"
            onClick={logout}
          >
            <span className="side-icon">↪</span>
            <span>Log out</span>
          </button>

        </div>
      </aside>


      {/* MAIN AREA */}
      <main className="main-area">

        {/* TOP BAR */}
        <header className="topbar">

          <div className="mobile-brand">
            <span className="brand-mark">₹</span>
            FinanceAI
          </div>

          <div className="topbar-spacer" />

          {/* PROFILE */}
          <div className="profile-wrapper">

            <button
              className="profile"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <div className="avatar">
                {initials}
              </div>

              <div className="profile-text">
                <strong>{user.fullName}</strong>
                <span>{user.email}</span>
              </div>

              <span className="profile-arrow">
                {profileOpen ? '⌃' : '⌄'}
              </span>
            </button>


            {/* PROFILE DROPDOWN */}
            {profileOpen && (
              <div className="profile-dropdown">

                <div className="dropdown-user">
                  <div className="dropdown-avatar">
                    {initials}
                  </div>

                  <div>
                    <strong>{user.fullName}</strong>
                    <span>{user.email}</span>
                  </div>
                </div>

                <div className="dropdown-divider" />

                {/* MY ACCOUNT */}
                <Link
                  to="/account"
                  className="dropdown-account"
                  onClick={() => setProfileOpen(false)}
                >
                  <span className="dropdown-icon">👤</span>

                  <div>
                    <strong>My Account</strong>
                    <small>Personal finance account</small>
                  </div>
                </Link>

                {/* LOGOUT */}
                <button
                  className="dropdown-logout"
                  onClick={() => {
                    setProfileOpen(false)
                    logout()
                  }}
                >
                  <span>↪</span>
                  <span>Log out</span>
                </button>

              </div>
            )}

          </div>

        </header>


        {/* ROUTES */}
        <Routes>

          <Route
            path="/"
            element={<Dashboard view="dashboard" />}
          />

          <Route
            path="/transactions"
            element={<Dashboard view="transactions" />}
          />

          <Route
            path="/analytics"
            element={<Dashboard view="analytics" />}
          />

          <Route
            path="/insights"
            element={<Dashboard view="insights" />}
          />

          <Route
            path="/import"
            element={<Dashboard view="import" />}
          />

          {/* ACCOUNT PAGE */}
          <Route
            path="/account"
            element={<Account />}
          />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>

      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}