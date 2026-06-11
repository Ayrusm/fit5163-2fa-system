/*
 * Program: AdminRoute.jsx
 *
 * Purpose: Provides a route guard for pages that should only be available to
 *          logged-in administrator users.
 */

import { Navigate } from 'react-router-dom';

/*
 * Component: AdminRoute
 *
 * Purpose: Checks the saved user session and redirects non-admin users away
 *          from admin-only pages.
 *
 * Parameters:
 *   children -- The protected page content to display for administrators.
 */
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  // A missing token means the user has not completed login and 2FA.
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/game" replace />;
  }

  return children;
}

export default AdminRoute;
