import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './Registrations.css';

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

function Registrations() {
  const navigate = useNavigate();
  const token = localStorage.getItem('access');

const [registrations, setRegistrations] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [searchVal, setSearchVal] = useState('');

const [nextUrl, setNextUrl] = useState(null);
const [prevUrl, setPrevUrl] = useState(null);
const [currentUrl, setCurrentUrl] = useState(
  'http://127.0.0.1:8000/api/registrations/'
);

const [actionLoading, setActionLoading] = useState(false);

const fetchRegistrations = useCallback(async (url) => {
  if (!token) {
    navigate('/login');
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setRegistrations(res.data.results || []);
    setNextUrl(res.data.next);
    setPrevUrl(res.data.previous);
    setCurrentUrl(url);
  }
  catch (err) {
    if (err.response?.status === 401) {
      localStorage.clear();
      navigate('/login');
    } else {
      setError('Failed to retrieve registrations.');
    }
  }
  finally {
    setLoading(false);
  }
}, [token, navigate]);

useEffect(() => {
  if (!token) {
    navigate('/login');
  } else {
    fetchRegistrations(
      'http://127.0.0.1:8000/api/registrations/'
    );
  }
}, [token, navigate, fetchRegistrations]);

// Pagination navigation
  const handleNextPage = () => {
  if (nextUrl) {
    fetchRegistrations(nextUrl);
  }
};

const handlePrevPage = () => {
  if (prevUrl) {
    fetchRegistrations(prevUrl);
  }
};

const handleSearchSubmit = (e) => {
  e.preventDefault();

  const searchUrl =
    `http://127.0.0.1:8000/api/registrations/?search=${encodeURIComponent(
      searchVal
    )}`;

  fetchRegistrations(searchUrl);
};

const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this registration?')) return;
    setActionLoading(true);
    try {
        await axios.delete(`http://127.0.0.1:8000/api/registrations/${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchRegistrations(currentUrl);
    } catch {
        alert('Failed to cancel registration.');
    } finally {
        setActionLoading(false);
    }
};
 return (
  <div className="registrations-page">
    <Navbar />

    <main className="registrations-container animate-fadeIn">
      <header className="registrations-header">
        <div>
          <h1>Registrations</h1>
          <p>
            View and manage event registrations across the platform.
          </p>
        </div>
      </header>

      {/* Search Bar */}
      <section className="search-section">
        <form
          onSubmit={handleSearchSubmit}
          className="search-form"
        >
          <div className="search-input-wrapper">
            <SearchIcon />

            <input
              type="text"
              placeholder="Search by username..."
              value={searchVal}
              onChange={(e) =>
                setSearchVal(e.target.value)
              }
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="search-btn"
            disabled={loading}
          >
            Search
          </button>
        </form>
      </section>

      {/* Loading */}
      {loading ? (
        <div className="skeleton-table"></div>
      ) : error ? (
        <div className="events-error-state">
          <p>{error}</p>

          <button
            onClick={() =>
              fetchRegistrations(currentUrl)
            }
            className="search-btn"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <>
          {/* Table */}
          {registrations.length > 0 ? (
            <div className="table-container">
              <div className="table-responsive">
                <table className="registrations-table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Event ID</th>
                      <th>Event</th>
                      <th>Registered At</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {registrations.map((reg) => (
                      <tr key={reg.id}>
                        <td>
                          <span className="id-badge">
                            {reg.user}
                          </span>
                        </td>

                        <td className="username-cell">
                          {reg.username}
                        </td>

                        <td className="email-cell">
                          {reg.email}
                        </td>

                        <td>
                          <span className="id-badge">
                            {reg.event}
                          </span>
                        </td>

                        <td>
                          {reg.event_title}
                        </td>

                        <td>
                          {new Date(
                            reg.registered_at
                          ).toLocaleString()}
                        </td>

                        <td>
                          <span
                            className={`status-badge ${reg.status}`}
                          >
                            {reg.status}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() =>
                              handleDelete(reg.id)
                            }
                            disabled={
                              actionLoading
                            }
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="empty-events-state">
              <h4>
                No registrations found
              </h4>

              <p>
                Try another search term or
                wait for new registrations.
              </p>
            </div>
          )}

          {/* Pagination */}
          {(prevUrl || nextUrl) && (
            <div className="pagination-row">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={!prevUrl}
                className="page-btn"
              >
                &larr; Previous
              </button>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={!nextUrl}
                className="page-btn"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </>
      )}
    </main>
  </div>
);
};

export default Registrations;