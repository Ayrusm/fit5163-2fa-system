/*
 * Program: index.js
 *
 * Purpose: Entry point for the main CheckMate React application. This file
 *          mounts the root App component into the browser page.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx'

const root = ReactDOM.createRoot(document.getElementById('root'));

// StrictMode helps surface React warnings during development.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
