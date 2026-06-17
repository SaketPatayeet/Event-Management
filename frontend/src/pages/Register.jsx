import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

// SVG Icons
const UserIcon = () => (
  <svg className="input-icon" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = () => (
  <svg className="input-icon" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LockIcon = () => (
  <svg className="input-icon" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const RoleIcon = () => (
  <svg className="input-icon" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="spinner" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" stroke="rgba(255, 255, 255, 0.2)" />
    <path d="M12 2a10 10 0 0 1 10 10" />
  </svg>
);

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('attendee');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);

    try {
      await axios.post('http://127.0.0.1:8000/api/users/', {
        username,
        email,
        password,
        role,
      });

      // Redirect to login on successful signup
      navigate('/login');
    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'object') {
          const messages = Object.entries(data).map(([field, msgs]) => {
            const fieldLabel = field.charAt(0).toUpperCase() + field.slice(1);
            return `${fieldLabel}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`;
          });
          setError(messages.join(' | '));
        } else {
          setError('Registration failed. Please check your input fields.');
        }
      } else {
        setError('Registration failed. Server connection error.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      {/* Background Glowing Blobs */}
      <div className="register-glow-1"></div>
      <div className="register-glow-2"></div>

      <div className="register-container animate-fadeIn">
        <div className="register-card">
          <div className="register-brand">
            <svg className="register-logo-icon" viewBox="0 0 24 24" width="40" height="40" stroke="url(#regLogoGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="regLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#aa3bff" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <h2>Create Account</h2>
            <p className="subtitle">Sign up to manage and discover premium events.</p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="register-form">
            {error && (
              <div className="error-container animate-shake">
                <svg className="error-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="error">{error}</p>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="reg-username">Username</label>
              <div className="input-wrapper">
                <UserIcon />
                <input
                  id="reg-username"
                  type="text"
                  placeholder="Choose username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email Address</label>
              <div className="input-wrapper">
                <MailIcon />
                <input
                  id="reg-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="reg-password">Password</label>
                <div className="input-wrapper">
                  <LockIcon />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-role">Account Role</label>
                <div className="input-wrapper">
                  <RoleIcon />
                  <select
                    id="reg-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={isSubmitting}
                    required
                    className="role-select"
                  >
                    <option value="attendee">Attendee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="register-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <SpinnerIcon />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          <footer className="register-footer">
            <span className="footer-text">Already have an account?</span>
            <Link to="/login" className="login-link">
              Sign In
            </Link>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default Register;
