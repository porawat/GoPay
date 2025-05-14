// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id') || localStorage.getItem('owner');
  if (!token || !userId) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;