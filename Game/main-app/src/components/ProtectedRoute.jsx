/*
 * Program: ProtectedRoute.jsx
 *
 * Purpose: Provides a simple route guard for pages that require a logged-in
 *          CheckMate session.
 */

import { Navigate } from 'react-router-dom';

/*
 * Component: ProtectedRoute
 *
 * Purpose: Displays protected content only when a JWT token exists in local
 *          browser storage.
 *
 * Parameters:
 *   children -- The page content that should be shown after authentication.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
