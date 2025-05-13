// src/components/auth/RoleRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';

const RoleRoute = ({ allowedRoles }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  // Check if user is logged in and has allowed role
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

RoleRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default RoleRoute;