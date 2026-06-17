import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const username = localStorage.getItem('username') || 'User';
  const role = localStorage.getItem('role') || 'attendee';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        
        {/* Brand Logo */}
        <Link to="/dashboard" className="navbar-brand">
          <svg className="navbar-logo-icon" viewBox="0 0 24 24" width="28" height="28" stroke="url(#navLogoGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="navLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#aa3bff" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="navbar-brand-name">EventSphere</span>
        </Link>

        {/* Navigation Links */}
        <div className="navbar-links">
          <Link 
            to="/dashboard" 
            className={`navbar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/events" 
            className={`navbar-link ${location.pathname === '/events' ? 'active' : ''}`}
          >
            Events
          </Link>
          <Link
            to="/notifications"
            className={`navbar-link ${location.pathname === '/notifications' ? 'active' : ''}`}
          >
            Notifications
          </Link>
        </div>

        {/* User profile & Logout */}
        <div className="navbar-actions">
          <div className="navbar-user-info">
            <span className="navbar-username">{username}</span>
            <span className={`navbar-role-badge ${role}`}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
          </div>
          
          <button 
            type="button" 
            onClick={handleLogout} 
            className="navbar-logout-btn"
            aria-label="Log out"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
