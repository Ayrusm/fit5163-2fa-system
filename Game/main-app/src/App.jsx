/*
 * Program: App.jsx
 *
 * Purpose: Defines the route structure for the main CheckMate React
 *          application. Public routes handle registration, login, and 2FA
 *          verification, while protected routes require a stored session token.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Register from './pages/Register';
import Login from './pages/LoginPage';
import Authenticate from './pages/Authenticate';
import Game from './pages/Game';
import Admin from './pages/Admin';

import ProtectedRoute from './components/ProtectedRoute';

/*
 * Component: App
 *
 * Purpose: Connects URL paths to the correct page components and wraps
 *          authenticated pages in the route guard.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Public pages */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/authenticate" element={<Authenticate />} />

        {/* Protected pages */}
        <Route
          path="/game"
          element={
            <ProtectedRoute>
              <Game />
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
