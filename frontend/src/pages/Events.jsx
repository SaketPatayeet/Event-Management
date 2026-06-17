import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './Events.css';

// SVG Icons for Events Page
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="card-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="card-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const UserIcon = () => (
  <svg className="card-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="spinner" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" stroke="rgba(255, 255, 255, 0.2)" />
    <path d="M12 2a10 10 0 0 1 10 10" />
  </svg>
);

function Events() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'attendee';
  const token = localStorage.getItem('access');

  // Events & query list states
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchVal, setSearchVal] = useState('');
  
  // Pagination links
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [currentUrl, setCurrentUrl] = useState('http://127.0.0.1:8000/api/events/');

  // Attendee registration lookup
  const [registeredIds, setRegisteredIds] = useState(new Set());
  
  // Submit loading feedback
  const [actionLoading, setActionLoading] = useState(false);

  // Modals controllers
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Modal inputs
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [category, setCategory] = useState('');
  const [capacity, setCapacity] = useState('');

  // Fetch all registrations for current attendee
  const fetchRegistrations = useCallback(async () => {
    if (role !== 'attendee' || !token) return;
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/registrations/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Map to set of registered event IDs
      const ids = new Set(res.data.results.map(reg => reg.event));
      setRegisteredIds(ids);
    } catch (err) {
      console.error('Failed to load user registrations', err);
    }
  }, [role, token]);

  // Fetch events list
  const fetchEvents = useCallback(async (url) => {
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // DRF returns paginated results
      setEvents(res.data.results || []);
      setNextUrl(res.data.next);
      setPrevUrl(res.data.previous);
      setCurrentUrl(url);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else {
        setError('Failed to retrieve events list. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchEvents('http://127.0.0.1:8000/api/events/');
      fetchRegistrations();
    }
  }, [token, navigate, fetchEvents, fetchRegistrations]);

  // Search logic
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const searchUrl = `http://127.0.0.1:8000/api/events/?search=${encodeURIComponent(searchVal)}`;
    fetchEvents(searchUrl);
  };

  // Pagination navigation
  const handleNextPage = () => {
    if (nextUrl) fetchEvents(nextUrl);
  };

  const handlePrevPage = () => {
    if (prevUrl) fetchEvents(prevUrl);
  };

  // Attendee registration post trigger
  const handleRegister = async (eventId) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await axios.post(
        'http://127.0.0.1:8000/api/registrations/',
        { event: eventId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Immediately append to local states for instant visual response
      setRegisteredIds(prev => {
        const next = new Set(prev);
        next.add(eventId);
        return next;
      });
      // Refresh events to get updated remaining seats
      fetchEvents(currentUrl);
    } catch (err) {
      alert(err.response?.data?.non_field_errors?.[0] || 'Registration failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Open modal helper
  const openModal = (eventObj = null) => {
    setEditingEvent(eventObj);
    if (eventObj) {
      setTitle(eventObj.title);
      // Format ISO string YYYY-MM-DDTHH:MM:SSZ -> YYYY-MM-DDTHH:MM
      setDate(eventObj.date ? eventObj.date.substring(0, 16) : '');
      setVenue(eventObj.venue);
      setCategory(eventObj.category);
      setCapacity(eventObj.capacity.toString());
    } else {
      setTitle('');
      setDate('');
      setVenue('');
      setCategory('');
      setCapacity('');
    }
    setShowModal(true);
  };

  // Close modal helper
  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
  };

  // Admin submit form (Create or Update)
  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (actionLoading) return;
    setActionLoading(true);

    const payload = {
      title,
      date: new Date(date).toISOString(), // Convert local datetime to ISO string
      venue,
      category,
      capacity: parseInt(capacity, 10),
    };

    try {
      if (editingEvent) {
        // Edit Mode
        await axios.put(
          `http://127.0.0.1:8000/api/events/${editingEvent.id}/`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create Mode
        await axios.post(
          'http://127.0.0.1:8000/api/events/',
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      closeModal();
      fetchEvents(currentUrl); // Refresh current list
    } catch (err) {
      alert('Failed to save event. Verify all input values are correct.');
    } finally {
      setActionLoading(false);
    }
  };

  // Admin Delete action
  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action is irreversible.')) {
      return;
    }
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await axios.delete(`http://127.0.0.1:8000/api/events/${eventId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvents(currentUrl);
    } catch (err) {
      alert('Failed to delete event.');
    } finally {
      setActionLoading(false);
    }
  };

  // Admin Download Report action
  const handleDownloadReport = async (eventId, eventTitle) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/events/${eventId}/report/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access')}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `event_${eventId}_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download report.');
    } finally {
      setActionLoading(false);
    }
  };

  // Format visual date helper
  const formatDisplayDate = (isoString) => {
    if (!isoString) return '';
    const dateObj = new Date(isoString);
    return dateObj.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="events-page">
      <Navbar />

      <main className="events-container animate-fadeIn">
        <header className="events-header">
          <div className="header-info">
            <h1>Platform Events</h1>
            <p className="welcome-text">Explore and manage scheduled group meetups and gatherings.</p>
          </div>
          {role === 'admin' && (
            <button 
              type="button" 
              className="create-event-btn" 
              onClick={() => openModal(null)}
              disabled={loading}
            >
              <span>+ Create Event</span>
            </button>
          )}
        </header>

        {/* Search Bar */}
        <section className="search-section">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-input-wrapper">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search events by name, category, or location..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                disabled={loading}
              />
            </div>
            <button type="submit" className="search-btn" disabled={loading}>
              Search
            </button>
          </form>
        </section>

        {/* Loading Spinner */}
        {loading ? (
          <div className="events-loading">
            <div className="loading-shimmer-grid">
              <div className="event-card skeleton-card"></div>
              <div className="event-card skeleton-card"></div>
              <div className="event-card skeleton-card"></div>
            </div>
          </div>
        ) : error ? (
          <div className="events-error-state">
            <p>{error}</p>
            <button onClick={() => fetchEvents(currentUrl)} className="retry-btn">
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            {/* Events Grid */}
            {events.length > 0 ? (
              <section className="events-grid">
                {events.map((event) => {
                  const isRegistered = registeredIds.has(event.id);
                  const isFull = event.seats_remaining <= 0;
                  const regPercentage = Math.round(((event.capacity - event.seats_remaining) / event.capacity) * 100);

                  return (
                    <article key={event.id} className="event-card animate-fadeIn">
                      <div className="card-header">
                        <span className="card-category-badge">{event.category}</span>
                        <div className="card-capacity-pill">
                          {event.seats_remaining} / {event.capacity} left
                        </div>
                      </div>

                      <h3 className="card-title">{event.title}</h3>

                      <div className="card-details">
                        <div className="detail-item">
                          <CalendarIcon />
                          <span>{formatDisplayDate(event.date)}</span>
                        </div>
                        <div className="detail-item">
                          <MapPinIcon />
                          <span>{event.venue}</span>
                        </div>
                        <div className="detail-item">
                          <UserIcon />
                          <span>Host ID: {event.created_by}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="card-progress-bar-container">
                        <div className="progress-bar-info">
                          <span>Registrations</span>
                          <span>{regPercentage}%</span>
                        </div>
                        <div className="progress-track">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${Math.min(regPercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      {role === 'admin' ? (
                        <div className="admin-actions-container">
                          <div className="card-actions">
                            <button
                              type="button"
                              className="card-action-btn edit"
                              onClick={() => openModal(event)}
                              disabled={actionLoading}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="card-action-btn delete"
                              onClick={() => handleDelete(event.id)}
                              disabled={actionLoading}
                            >
                              Delete
                            </button>
                          </div>
                          <button
                            type="button"
                            className="card-action-btn report"
                            onClick={() => handleDownloadReport(event.id, event.title)}
                            disabled={actionLoading}
                          >
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Download Report
                          </button>
                        </div>
                      ) : (
                        <div className="card-actions">
                          <button
                            type="button"
                            className={`card-action-btn register ${isRegistered ? 'registered' : ''}`}
                            onClick={() => handleRegister(event.id)}
                            disabled={isRegistered || isFull || actionLoading}
                          >
                            {isRegistered ? (
                              <span>✓ Registered</span>
                            ) : isFull ? (
                              <span>Sold Out</span>
                            ) : (
                              <span>Register Now</span>
                            )}
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </section>
            ) : (
              <div className="empty-events-state">
                <h4>No events discovered</h4>
                <p>Verify your query details or create a new event instance above.</p>
              </div>
            )}

            {/* Pagination Controls */}
            {(prevUrl || nextUrl) && (
              <div className="pagination-row">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={!prevUrl || loading}
                  className="page-btn"
                >
                  &larr; Previous
                </button>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={!nextUrl || loading}
                  className="page-btn"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Admin Create/Edit Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h3>{editingEvent ? 'Modify Event Settings' : 'Schedule New Event'}</h3>
              <button type="button" className="close-modal-btn" onClick={closeModal} aria-label="Close modal">
                &times;
              </button>
            </header>

            <form onSubmit={handleCreateOrUpdate} className="modal-form">
              <div className="form-group">
                <label htmlFor="modal-title">Event Title</label>
                <input
                  id="modal-title"
                  type="text"
                  placeholder="e.g. Save Trees Protest"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={actionLoading}
                  required
                />
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="modal-category">Category</label>
                  <input
                    id="modal-category"
                    type="text"
                    placeholder="e.g. Protest, Conference"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={actionLoading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="modal-capacity">Capacity Limit</label>
                  <input
                    id="modal-capacity"
                    type="number"
                    min="1"
                    placeholder="e.g. 100"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    disabled={actionLoading}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="modal-date">Event Date & Time</label>
                <input
                  id="modal-date"
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={actionLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="modal-venue">Location / Venue</label>
                <input
                  id="modal-venue"
                  type="text"
                  placeholder="e.g. Ganeshkhind Road Campus"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  disabled={actionLoading}
                  required
                />
              </div>

              <footer className="modal-footer">
                <button
                  type="button"
                  className="modal-btn cancel"
                  onClick={closeModal}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-btn submit"
                  disabled={actionLoading}
                >
                  {actionLoading ? <SpinnerIcon /> : editingEvent ? 'Save Changes' : 'Publish Event'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;
