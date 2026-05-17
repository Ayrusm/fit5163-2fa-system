import React from 'react';
import { Link } from 'react-router-dom';

const Admin = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Admin Dashboard</h1>

      {/* 
        Admin system requirement:
        This page should eventually allow admins to manage:
        1. Users
        2. Keygen accounts
      */}
      <p>Manage users and keygen accounts here.</p>

      <div>
        {/* 
          TODO:
          Replace this button with a real user management table/form.
          Example features:
          - View users
          - Add users
          - Delete users
          - Change user role
        */}
        <button
          style={{
            margin: '10px',
            padding: '10px 20px'
          }}
        >
          Manage Users
        </button>

        {/* 
          TODO:
          Replace this button with real keygen account management.
          Example features:
          - Create keygen account
          - Activate/deactivate keygen account
          - Link keygen account to user
        */}
        <button
          style={{
            margin: '10px',
            padding: '10px 20px'
          }}
        >
          Manage Keygen Accounts
        </button>
      </div>

      {/* Link back to login page */}
      <Link to="/login">Back to Login</Link>
    </div>
  );
}

export default Admin;