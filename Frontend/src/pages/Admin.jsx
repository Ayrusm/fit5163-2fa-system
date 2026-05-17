import React from 'react';
import { Link } from 'react-router-dom';

function Admin() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Admin Dashboard</h1>

      <p>Manage users and keygen accounts here.</p>

      <div>
        <button style={{ margin: '10px', padding: '10px 20px' }}>
          Manage Users
        </button>

        <button style={{ margin: '10px', padding: '10px 20px' }}>
          Manage Keygen Accounts
        </button>
      </div>

      <Link to="/login">Back to Login</Link>
    </div>
  );
}

export default Admin;