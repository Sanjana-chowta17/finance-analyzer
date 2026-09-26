import { useEffect, useState } from 'react'
import { userApi } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'


/* =========================================================
   PASSWORD VISIBILITY ICON
   ========================================================= */

function PasswordIcon({ visible }) {
  if (visible) {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M2.5 12C2.5 12 6 6.5 12 6.5C18 6.5 21.5 12 21.5 12C21.5 12 18 17.5 12 17.5C6 17.5 2.5 12 2.5 12Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle
          cx="12"
          cy="12"
          r="2.7"
          stroke="currentColor"
          strokeWidth="1.7"
        />
      </svg>
    )
  }

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 3L21 21"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M10.6 10.6C10.25 10.95 10.05 11.45 10.05 12C10.05 13.08 10.92 13.95 12 13.95C12.55 13.95 13.05 13.75 13.4 13.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M9.2 5.1C10.05 4.7 10.98 4.5 12 4.5C18 4.5 21.5 12 21.5 12C21.5 12 20.1 14.2 17.8 15.9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M6.3 6.4C3.8 8.2 2.5 12 2.5 12C2.5 12 6 19.5 12 19.5C13.25 19.5 14.4 19.2 15.4 18.75"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}


/* =========================================================
   ACCOUNT PAGE
   ========================================================= */

export default function Account() {
  const { user } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')


  /* =========================================================
     LOAD PROFILE
     ========================================================= */

  useEffect(() => {
    loadProfile()
  }, [])


  const loadProfile = async () => {
    try {
      setLoading(true)

      const res = await userApi.getProfile()

      setFullName(res.data.fullName || '')
      setEmail(res.data.email || '')
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Unable to load your account information.'
      )
    } finally {
      setLoading(false)
    }
  }


  /* =========================================================
     SAVE PROFILE
     ========================================================= */

  const handleSaveProfile = async (e) => {
    e.preventDefault()

    setMessage('')
    setError('')

    if (!fullName.trim() || !email.trim()) {
      setError('Name and email cannot be empty.')
      return
    }

    try {
      setSaving(true)

      const res = await userApi.updateProfile({
        fullName: fullName.trim(),
        email: email.trim(),
      })

      setFullName(res.data.fullName || fullName)
      setEmail(res.data.email || email)

      setMessage('Your profile has been updated successfully.')
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Unable to update your profile.'
      )
    } finally {
      setSaving(false)
    }
  }


  /* =========================================================
     CHANGE PASSWORD
     ========================================================= */

  const handleChangePassword = async (e) => {
    e.preventDefault()

    setMessage('')
    setError('')

    if (!currentPassword || !newPassword) {
      setError('Please enter both passwords.')
      return
    }

    if (newPassword.length < 6) {
      setError('New password must contain at least 6 characters.')
      return
    }

    try {
      setChangingPassword(true)

      await userApi.changePassword({
        currentPassword,
        newPassword,
      })

      setCurrentPassword('')
      setNewPassword('')

      // Hide passwords again after successful change
      setShowCurrentPassword(false)
      setShowNewPassword(false)

      setMessage('Your password has been changed successfully.')
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Unable to change your password.'
      )
    } finally {
      setChangingPassword(false)
    }
  }


  /* =========================================================
     INITIALS
     ========================================================= */

  const initials = (fullName || user?.fullName || 'U')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()


  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <div className="account-page">
        <div className="account-loading">
          <div className="spinner" />
          <span>Loading your account...</span>
        </div>
      </div>
    )
  }


  /* =========================================================
     UI
     ========================================================= */

  return (
    <div className="account-page">

      {/* HEADER */}
      <section className="account-header">
        <div>
          <p className="eyebrow">
            ACCOUNT
          </p>

          <h1>
            My Account
          </h1>

          <p className="account-subtitle">
            Manage your personal information and security.
          </p>
        </div>
      </section>


      {/* GLOBAL MESSAGE */}

      {message && (
        <div className="account-message success">
          <span>✓</span>
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="account-message error">
          <span>!</span>
          <span>{error}</span>
        </div>
      )}


      <div className="account-grid">


        {/* =================================================
           PERSONAL INFORMATION
           ================================================= */}

        <section className="account-card">

          <div className="account-card-header">

            <div className="account-section-icon profile-icon">
              {initials}
            </div>

            <div>
              <h2>
                Personal Information
              </h2>

              <p>
                Update the information associated with your account.
              </p>
            </div>

          </div>


          <form onSubmit={handleSaveProfile}>

            <div className="account-form-grid">

              {/* FULL NAME */}

              <div className="account-field">

                <label htmlFor="fullName">
                  Full Name
                </label>

                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  placeholder="Enter your full name"
                />

              </div>


              {/* EMAIL */}

              <div className="account-field">

                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                />

              </div>

            </div>


            <div className="account-form-footer">

              <span className="form-hint">
                This information is used for your FinanceAI account.
              </span>

              <button
                type="submit"
                className="account-primary-btn"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : 'Save Changes'}
              </button>

            </div>

          </form>

        </section>


        {/* =================================================
           SECURITY
           ================================================= */}

        <section className="account-card">

          <div className="account-card-header">

            <div className="account-section-icon security-icon">
              🔒
            </div>

            <div>
              <h2>
                Security
              </h2>

              <p>
                Keep your account secure by updating your password.
              </p>
            </div>

          </div>


          <form onSubmit={handleChangePassword}>

            <div className="account-form-grid">


              {/* CURRENT PASSWORD */}

              <div className="account-field">

                <label htmlFor="currentPassword">
                  Current Password
                </label>

                <div className="password-input-wrapper">

                  <input
                    id="currentPassword"
                    type={
                      showCurrentPassword
                        ? 'text'
                        : 'password'
                    }
                    value={currentPassword}
                    onChange={(e) =>
                      setCurrentPassword(e.target.value)
                    }
                    placeholder="Enter current password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowCurrentPassword(
                        (prev) => !prev
                      )
                    }
                    aria-label={
                      showCurrentPassword
                        ? 'Hide current password'
                        : 'Show current password'
                    }
                  >
                    <PasswordIcon
                      visible={showCurrentPassword}
                    />
                  </button>

                </div>

              </div>


              {/* NEW PASSWORD */}

              <div className="account-field">

                <label htmlFor="newPassword">
                  New Password
                </label>

                <div className="password-input-wrapper">

                  <input
                    id="newPassword"
                    type={
                      showNewPassword
                        ? 'text'
                        : 'password'
                    }
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(e.target.value)
                    }
                    placeholder="Enter new password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowNewPassword(
                        (prev) => !prev
                      )
                    }
                    aria-label={
                      showNewPassword
                        ? 'Hide new password'
                        : 'Show new password'
                    }
                  >
                    <PasswordIcon
                      visible={showNewPassword}
                    />
                  </button>

                </div>

              </div>

            </div>


            {/* SECURITY FOOTER */}

            <div className="account-form-footer">

              <span className="form-hint">
                Use at least 6 characters for your new password.
              </span>

              <button
                type="submit"
                className="account-primary-btn"
                disabled={changingPassword}
              >
                {changingPassword
                  ? 'Updating...'
                  : 'Change Password'}
              </button>

            </div>

          </form>

        </section>

      </div>

    </div>
  )
}