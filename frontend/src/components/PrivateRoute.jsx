import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, role }) => {
  const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  if (role && userInfo.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
