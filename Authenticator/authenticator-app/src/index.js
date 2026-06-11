/*
 * Program: index.js
 *
 * Purpose: Entry point for the Secure Authenticator React application. This
 *          file mounts the root App component into the browser page.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/AuthenticatorBase.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

// StrictMode helps reveal React warnings while the authenticator is developed.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
