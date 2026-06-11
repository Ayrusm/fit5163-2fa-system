/*
 * Program: Admin.jsx
 *
 * Purpose: Displays the CheckMate administration dashboard. Administrators can
 *          view users, keygen accounts, authentication logs, and enable or
 *          disable user accounts.
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Admin.css';

/*
 * Component: Admin
 *
 * Purpose: Loads dashboard data from the backend, renders system tables and
 *          summary counts, and manages admin logout/status actions.
 */
function Admin() {
  const [users, setUsers] = useState([]);
  const [keygenAccounts, setKeygenAccounts] = useState([]);
  const [authLogs, setAuthLogs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const fetchAdminData = async () => {
    /*
     * Purpose: Retrieves users, keygen accounts, and authentication logs in
     *          parallel so the dashboard shows a consistent system snapshot.
     */
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // These independent admin endpoints can be loaded at the same time.
      const [usersResponse, keygenResponse, logsResponse] = await Promise.all([
        fetch(`${BACKEND_URL}/admin/users`, {
          method: 'GET',
          headers
        }),
        fetch(`${BACKEND_URL}/admin/keygen-accounts`, {
          method: 'GET',
          headers
        }),
        fetch(`${BACKEND_URL}/admin/auth-logs`, {
          method: 'GET',
          headers
        })
      ]);

      if (!usersResponse.ok) {
        throw new Error('Failed to load users');
      }

      if (!keygenResponse.ok) {
        throw new Error('Failed to load keygen accounts');
      }

      if (!logsResponse.ok) {
        throw new Error('Failed to load authentication logs');
      }

      const usersData = await usersResponse.json();
      const keygenData = await keygenResponse.json();
      const logsData = await logsResponse.json();

      setUsers(usersData);
      setKeygenAccounts(keygenData);
      setAuthLogs(logsData);
    } catch (err) {
      console.error('Admin data fetch failed:', err);
      setError('Could not load admin data. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    /*
     * Purpose: Loads dashboard data once when the admin page first opens.
     */
    fetchAdminData();
  }, []);

  const handleToggleUserStatus = async (userId, currentStatus) => {
    /*
     * Purpose: Switches a user between active and disabled states, then
     *          refreshes the dashboard tables and log entries.
     */
    const newStatus = currentStatus === 1 ? 0 : 1;

    try {
      const token = localStorage.getItem('token');

      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${BACKEND_URL}/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          is_active: newStatus
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Could not update user status');
        return;
      }

      setError('');

      // Reload admin data so users, keygen accounts, and logs all update
      fetchAdminData();
    } catch (err) {
      console.error('Status update failed:', err);
      setError('Could not update user status. Please try again.');
    }
  };

  const handleLogout = async () => {
    /*
     * Purpose: Ends the admin browser session locally after attempting to call
     *          the backend logout endpoint.
     */
    const token = localStorage.getItem('token');

    try {
      await fetch(`${BACKEND_URL}/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      console.log('Logout API failed, clearing local session anyway.');
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigate('/login');
  };

  const activeUsersCount = users.filter((user) => user.is_active === 1).length;
  const activeKeygenCount = keygenAccounts.filter((account) => account.is_active === 1).length;
  const failedAuthCount = authLogs.filter((log) => log.success === 0).length;

  // Show a simple loading state until the first admin data request finishes.
  if (loading) {
    return (
      <div className="admin-page">
        <main className="admin-loading">
          <h1>Loading admin dashboard...</h1>
          <p>Please wait while system data is retrieved.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-mark">SC</div>

          <div>
            <h2>CheckMate</h2>
            <p>Admin Console</p>
          </div>
        </div>

        <nav>
          <a href="#dashboard" className="active">Dashboard</a>
          <a href="#users">Users</a>
          <a href="#keygen">Keygen Accounts</a>
          <a href="#logs">Auth Logs</a>
        </nav>

        <button className="admin-logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-header" id="dashboard">
          <div>
            <span className="admin-eyebrow">Management</span>

            <h1>Admin Dashboard</h1>

            <p>
              Manage users, keygen accounts, and authentication activity
              across the CheckMate system.
            </p>
          </div>

          <Link to="/game" className="back-to-game">
            Back to game
          </Link>
        </header>

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        <section className="stats-grid">
          <div className="stat-card">
            <span>Total Users</span>
            <strong>{users.length}</strong>
          </div>

          <div className="stat-card">
            <span>Active Users</span>
            <strong>{activeUsersCount}</strong>
          </div>

          <div className="stat-card">
            <span>Active Keygen Accounts</span>
            <strong>{activeKeygenCount}</strong>
          </div>

          <div className="stat-card">
            <span>Failed Auth Events</span>
            <strong>{failedAuthCount}</strong>
          </div>
        </section>

        <section className="admin-section" id="users">
          <div className="section-header">
            <div>
              <h2>User Management</h2>
              <p>View and manage users registered in the main chess application.</p>
            </div>

            <button onClick={fetchAdminData}>
              Refresh
            </button>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Updated</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`status ${user.is_active === 1 ? 'active' : 'disabled'}`}>
                      {user.is_active === 1 ? 'active' : 'disabled'}
                    </span>
                  </td>
                  <td>{user.created_at || '-'}</td>
                  <td>{user.updated_at || '-'}</td>
                  <td>
                    <button
                      className="table-action"
                      onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                    >
                      {user.is_active === 1 ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="admin-section" id="keygen">
          <div className="section-header">
            <div>
              <h2>Keygen Account Management</h2>
              <p>
                View keygen accounts linked to registered users.
              </p>
            </div>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>User Email</th>
                <th>User ID</th>
                <th>Status</th>
                <th>Last Generated</th>
                <th>Created</th>
              </tr>
            </thead>

            <tbody>
              {keygenAccounts.map((account) => (
                <tr key={account.id}>
                  <td>{account.email}</td>
                  <td>{account.user_id}</td>
                  <td>
                    <span className={`status ${account.is_active === 1 ? 'active' : 'disabled'}`}>
                      {account.is_active === 1 ? 'active' : 'disabled'}
                    </span>
                  </td>
                  <td>{account.last_generated_at || '-'}</td>
                  <td>{account.created_at || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="admin-section" id="logs">
          <div className="section-header">
            <div>
              <h2>Authentication Logs</h2>
              <p>Recent login, 2FA, and admin activity.</p>
            </div>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Event</th>
                <th>Result</th>
                <th>IP Address</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {authLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.email || 'Unknown user'}</td>
                  <td>{log.event_type}</td>
                  <td>
                    <span className={`status ${log.success === 1 ? 'success' : 'failure'}`}>
                      {log.success === 1 ? 'success' : 'failure'}
                    </span>
                  </td>
                  <td>{log.ip_address || '-'}</td>
                  <td>{log.created_at || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default Admin;
