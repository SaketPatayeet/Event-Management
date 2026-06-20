import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './Users.css';

const SearchIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

function Users() {
  const navigate = useNavigate();
  const token = localStorage.getItem('access');

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchVal, setSearchVal] = useState('');

  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [currentUrl, setCurrentUrl] = useState(
    'http://127.0.0.1:8000/api/users/'
  );

  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(
    async (url) => {
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

        setUsers(res.data.results || []);
        setNextUrl(res.data.next);
        setPrevUrl(res.data.previous);
        setCurrentUrl(url);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        } else {
          setError('Failed to retrieve users.');
        }
      } finally {
        setLoading(false);
      }
    },
    [token, navigate]
  );

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchUsers(
        'http://127.0.0.1:8000/api/users/'
      );
    }
  }, [token, navigate, fetchUsers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    fetchUsers(
      `http://127.0.0.1:8000/api/users/?search=${encodeURIComponent(
        searchVal
      )}`
    );
  };

  const handleNextPage = () => {
    if (nextUrl) {
      fetchUsers(nextUrl);
    }
  };

  const handlePrevPage = () => {
    if (prevUrl) {
      fetchUsers(prevUrl);
    }
  };

  const handleRoleChange = async (
    id,
    role
  ) => {
    setActionLoading(true);

    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/users/${id}/`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchUsers(currentUrl);
    } catch {
      alert('Failed to update role.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this user?'
      )
    ) {
      return;
    }

    setActionLoading(true);

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/users/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchUsers(currentUrl);
    } catch {
      alert('Failed to delete user.');
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
            <h1>Users</h1>
            <p>
              View and manage platform users and
              their roles.
            </p>
          </div>
        </header>

        {/* Search */}
        <section className="search-section">
          <form
            onSubmit={handleSearchSubmit}
            className="search-form"
          >
            <div className="search-input-wrapper">
              <SearchIcon />

              <input
                type="text"
                placeholder="Search by username or email..."
                value={searchVal}
                onChange={(e) =>
                  setSearchVal(
                    e.target.value
                  )
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

        {/* Content */}
        {loading ? (
          <div className="skeleton-table"></div>
        ) : error ? (
          <div className="events-error-state">
            <p>{error}</p>

            <button
              onClick={() =>
                fetchUsers(currentUrl)
              }
              className="search-btn"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            {users.length > 0 ? (
              <div className="table-container">
                <div className="table-responsive">
                  <table className="registrations-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>
                            {user.id}
                          </td>

                          <td>
                            {user.username}
                          </td>

                          <td>
                            {user.email}
                          </td>

                          <td>
                            <select
                              value={
                                user.role
                              }
                              disabled={
                                actionLoading
                              }
                              onChange={(
                                e
                              ) =>
                                handleRoleChange(
                                  user.id,
                                  e.target
                                    .value
                                )
                              }
                            >
                              <option value="attendee">
                                Attendee
                              </option>

                              <option value="admin">
                                Admin
                              </option>

                              <option value="superadmin">
                                Superadmin
                              </option>
                            </select>
                          </td>

                          <td>
                            {new Date(
                              user.date_joined
                            ).toLocaleString()}
                          </td>

                          <td>
                            <button
                              type="button"
                              className="delete-btn"
                              onClick={() =>
                                handleDelete(
                                  user.id
                                )
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
                  No users found
                </h4>

                <p>
                  Try another search
                  term.
                </p>
              </div>
            )}

            {(prevUrl || nextUrl) && (
              <div className="pagination-row">
                <button
                  type="button"
                  onClick={
                    handlePrevPage
                  }
                  disabled={!prevUrl}
                  className="page-btn"
                >
                  &larr; Previous
                </button>

                <button
                  type="button"
                  onClick={
                    handleNextPage
                  }
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
}

export default Users;