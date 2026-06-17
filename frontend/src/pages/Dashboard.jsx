import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './Dashboard.css';

// SVG Icons for Stats Card
const EventsIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const RegsIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const UpcomingIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'attendee';

  const fetchDashboardData = useCallback(async () => {
    const token = localStorage.getItem('access');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get('http://127.0.0.1:8000/api/dashboard/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setData(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else {
        setError('Failed to fetch dashboard statistics. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      navigate('/login');
    } else {
      fetchDashboardData();
    }
  }, [navigate, fetchDashboardData]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <div className="dashboard-container">
          <div className="dashboard-header-skeleton"></div>
          <div className="stats-grid">
            <div className="stat-card skeleton"></div>
            <div className="stat-card skeleton"></div>
            <div className="stat-card skeleton"></div>
          </div>
          {role === 'admin' && (
            <div className="table-container skeleton-table">
              <div className="table-header-skeleton"></div>
              <div className="table-row-skeleton"></div>
              <div className="table-row-skeleton"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <div className="dashboard-container error-state">
          <div className="error-card animate-fadeIn">
            <svg viewBox="0 0 24 24" width="48" height="48" stroke="#ef4444" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h3>Unable to load Dashboard</h3>
            <p>{error}</p>
            <button onClick={fetchDashboardData} className="retry-btn">
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-container animate-fadeIn">
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p className="welcome-text">
              Welcome back to your event management workspace. Here is your overview.
            </p>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper events">
              <EventsIcon />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Events</span>
              <h2 className="stat-value">{data?.total_events ?? 0}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper regs">
              <RegsIcon />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Registrations</span>
              <h2 className="stat-value">{data?.total_registrations ?? 0}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper upcoming">
              <UpcomingIcon />
            </div>
            <div className="stat-info">
              <span className="stat-label">Upcoming Events</span>
              <h2 className="stat-value">{data?.upcoming_events ?? 0}</h2>
            </div>
          </div>
        </section>

        {/* Admin Event Stats Table */}
        {role === 'admin' && (
          <section className="dashboard-section animate-fadeIn">
            <div className="section-header">
              <h2>Event Overview & Metrics</h2>
              <p className="section-description">
                Real-time capacity, current registrations, and seat availability for your created events.
              </p>
            </div>

            <div className="table-container">
              {data?.event_stats && data.event_stats.length > 0 ? (
                <div className="table-responsive">
                  <table className="stats-table">
                    <thead>
                      <tr>
                        <th scope="col">Event Name</th>
                        <th scope="col">Capacity</th>
                        <th scope="col">Registrations</th>
                        <th scope="col">Seats Remaining</th>
                        <th scope="col">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.event_stats.map((stat, idx) => {
                        const regPercentage = Math.min(
                          Math.round((stat.registrations / stat.capacity) * 100),
                          100
                        );
                        let badgeClass = 'available';
                        let badgeText = 'Available';

                        if (stat.seats_remaining <= 0) {
                          badgeClass = 'full';
                          badgeText = 'Sold Out';
                        } else if (stat.seats_remaining <= 10) {
                          badgeClass = 'filling';
                          badgeText = 'Filling Fast';
                        }

                        return (
                          <tr key={idx}>
                            <td className="event-name-cell">{stat.event}</td>
                            <td>{stat.capacity}</td>
                            <td>
                              <div className="reg-cell">
                                <span>{stat.registrations}</span>
                                <span className="reg-percent">({regPercentage}%)</span>
                              </div>
                            </td>
                            <td>
                              <span className="remaining-count">
                                {stat.seats_remaining}
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge ${badgeClass}`}>
                                {badgeText}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-table-state">
                  <svg viewBox="0 0 24 24" width="40" height="40" stroke="#475569" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                  <h4>No event stats available</h4>
                  <p>Create an event in the system to view performance metrics here.</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
