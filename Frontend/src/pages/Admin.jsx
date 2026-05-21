import { Link, useNavigate } from 'react-router-dom';
import '../styles/Admin.css';

function Admin() {
  const navigate = useNavigate();

  // ============================================================
  // TEMPORARY MOCK DATA
  // Later, replace this with data from backend endpoints:
  //
  // GET /admin/users
  // GET /admin/keygen-accounts
  // GET /admin/auth-logs
  // ============================================================
  const users = [
    {
      id: 1,
      email: 'student@example.com',
      role: 'user',
      status: 'active',
      createdAt: '2026-05-21'
    },
    {
      id: 2,
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
      createdAt: '2026-05-21'
    }
  ];

  const keygenAccounts = [
    {
      id: 1,
      email: 'student@example.com',
      status: 'active',
      setupStatus: 'completed',
      lastGenerated: '10:42:15'
    },
    {
      id: 2,
      email: 'admin@example.com',
      status: 'pending',
      setupStatus: 'pending setup',
      lastGenerated: '-'
    }
  ];

  const authLogs = [
    {
      id: 1,
      email: 'student@example.com',
      event: 'Successful 2FA verification',
      result: 'success',
      time: '10:44:03'
    },
    {
      id: 2,
      email: 'student@example.com',
      event: 'Failed 2FA verification',
      result: 'failure',
      time: '10:43:42'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigate('/login');
  };

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-mark">SC</div>

          <div>
            <h2>Secure Chess</h2>
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
              Manage main application users, authenticator accounts, and
              authentication activity.
            </p>
          </div>

          <Link to="/game" className="back-to-game">
            Back to game
          </Link>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <span>Total Users</span>
            <strong>{users.length}</strong>
          </div>

          <div className="stat-card">
            <span>Active Users</span>
            <strong>{users.filter((user) => user.status === 'active').length}</strong>
          </div>

          <div className="stat-card">
            <span>Keygen Accounts</span>
            <strong>{keygenAccounts.length}</strong>
          </div>

          <div className="stat-card">
            <span>Code Interval</span>
            <strong>15s</strong>
          </div>
        </section>

        <section className="admin-section" id="users">
          <div className="section-header">
            <div>
              <h2>User Management</h2>
              <p>View and manage users registered in the main chess application.</p>
            </div>

            <button>Add User</button>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`status ${user.status}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.createdAt}</td>
                  <td>
                    <button className="table-action">Manage</button>
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
                Manage authenticator/keygen accounts linked to main app users.
              </p>
            </div>

            <button>Create Keygen Account</button>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>User Email</th>
                <th>Status</th>
                <th>Setup</th>
                <th>Last Generated</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {keygenAccounts.map((account) => (
                <tr key={account.id}>
                  <td>{account.email}</td>
                  <td>
                    <span className={`status ${account.status}`}>
                      {account.status}
                    </span>
                  </td>
                  <td>{account.setupStatus}</td>
                  <td>{account.lastGenerated}</td>
                  <td>
                    <button className="table-action">Reset</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="admin-section" id="logs">
          <div className="section-header">
            <div>
              <h2>Authentication Logs</h2>
              <p>Recent login and 2FA verification activity.</p>
            </div>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Event</th>
                <th>Result</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {authLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.email}</td>
                  <td>{log.event}</td>
                  <td>
                    <span className={`status ${log.result}`}>
                      {log.result}
                    </span>
                  </td>
                  <td>{log.time}</td>
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