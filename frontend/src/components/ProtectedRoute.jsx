import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute component to restrict access to authenticated users.
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if authenticated.
 * @param {boolean} [props.adminOnly=false] - Whether the route is restricted to admins.
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  if (!token) {
    // Redirect to login if not authenticated, saving the current location
    return <Navigate to={adminOnly ? "/admin/login" : "/login"} state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    // Redirect to dashboard if trying to access admin route as a regular user
    return <Navigate to="/dashboard" replace />;
  }

  if (!adminOnly && isAdmin) {
    // Keep admin users inside admin surface instead of user dashboard routes
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
