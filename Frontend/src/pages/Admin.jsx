import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Admin.css';

function Admin() {
  const users = [
    {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'Player',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'Admin',
      status: 'Active'
    }
  ];

  const keygenAccounts = [
    {
      id: 1,
      email: 'test@example.com',
      secret: 'KG-8392',
      status: 'Enabled'
    },
    {
      id: 2,
      email: 'admin@example.com',
      secret: 'KG-1204',
      status: 'Enabled'
    }
  ];

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span>♟</span>
          <h2>Secure Chess</h2>
        </div>

        <nav>
          <a href="#dashboard" className="active">Dashboard</a>
          <a href="#users">Users</a>
          <a href="#keygen">Keygen Accounts</a>
          <a href="#settings">Settings</a>
        </nav>

        <Link to="/login" className="logout-link">
          Logout
        </Link>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage users, authentication settings, and keygen accounts.</p>
          </div>

          <button className="admin-primary-button">
            + Add User
          </button>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <p>Total Users</p>
            <h2>2</h2>
          </div>

          <div className="stat-card">
            <p>Active Keygen Accounts</p>
            <h2>2</h2>
          </div>

          <div className="stat-card">
            <p>Code Refresh Time</p>
            <h2>15s</h2>
          </div>

          <div className="stat-card">
            <p>System Status</p>
            <h2>Online</h2>
          </div>
        </section>

        <section className="admin-section" id="users">
          <div className="section-header">
            <h2>User Management</h2>
            <button>Manage Users</button>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className="status active">
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="admin-section" id="keygen">
          <div className="section-header">
            <h2>Keygen Accounts</h2>
            <button>Manage Keygens</button>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>User Email</th>
                <th>Keygen Secret</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {keygenAccounts.map((account) => (
                <tr key={account.id}>
                  <td>{account.email}</td>
                  <td>{account.secret}</td>
                  <td>
                    <span className="status enabled">
                      {account.status}
                    </span>
                  </td>
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