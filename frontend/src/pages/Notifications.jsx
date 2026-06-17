import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './Notifications.css';

const BellIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="spinner" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" stroke="rgba(255, 255, 255, 0.2)" />
    <path d="M12 2a10 10 0 0 1 10 10" />
  </svg>
);

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const formatDate = (value) => {
    if (!value) return 'Date unavailable';

    return new Date(value).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatType = (value) => {
    if (!value) return 'Notification';
    return value
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('access');

    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.get('http://127.0.0.1:8000/api/notifications/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setNotifications(data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else {
        setError('Failed to load notifications. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="notifications-page">
      <Navbar />

      <main className="notifications-container animate-fadeIn">
        <header className="notifications-header">
          <div>
            <h1>Notifications</h1>
            <p className="notifications-subtitle">
              Stay updated on registration confirmations and event activity.
            </p>
          </div>
          <div className="notifications-header-icon">
            <BellIcon />
          </div>
        </header>

        {loading ? (
          <section className="notifications-loading">
            <SpinnerIcon />
            <span>Loading notifications...</span>
          </section>
        ) : error ? (
          <section className="notifications-error">
            <p>{error}</p>
            <button type="button" onClick={fetchNotifications} className="notifications-retry-btn">
              Retry
            </button>
          </section>
        ) : notifications.length === 0 ? (
          <section className="notifications-empty">
            <div className="notifications-empty-icon">
              <BellIcon />
            </div>
            <h2>No notifications yet</h2>
          </section>
        ) : (
          <section className="notifications-list">
            {notifications.map((notification) => (
              <article key={notification.id} className="notification-card">
                <div className="notification-card-icon">
                  <BellIcon />
                </div>
                <div className="notification-content">
                  <div className="notification-card-topline">
                    <span className={`notification-type-badge ${notification.type || 'general'}`}>
                      {formatType(notification.type)}
                    </span>
                    <time dateTime={notification.sent_at} className="notification-date">
                      {formatDate(notification.sent_at)}
                    </time>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default Notifications;
