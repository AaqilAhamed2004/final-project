import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PropTypes from 'prop-types';

export default function ProtectedRoute({ allowedRoles }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Logged in but wrong role, redirect to their proper dashboard
    const roleDashboardMap = {
      GN_OFFICER: '/dashboard/gn',
      DONOR: '/dashboard/donor',
      SUPER_ADMIN: '/dashboard/admin',
    };
    const redirectPath = roleDashboardMap[currentUser.role] || '/login';
    return <Navigate to={redirectPath} replace />;
  }

  // Authorized
  return <Outlet />;
}

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};
