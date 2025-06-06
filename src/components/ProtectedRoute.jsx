// ProtectedRoute.jsx
import { jwtDecode } from 'jwt-decode';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    console.log('No token found, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    console.log('Decoded token:', decoded);

    // เส้นทางสำหรับลูกค้า
    if (location.pathname.startsWith('/customer')) {
      const customerId = localStorage.getItem('customerId');
      if (decoded.role === 'customer' && customerId) {
        return children;
      }
      console.log('Invalid customer access, redirecting to /customer/login');
      return <Navigate to="/customer/login" replace />;
    }

    // เส้นทางสำหรับ admin
    if (decoded.role === 'admin') {
      return children; // Admin เข้าถึงทุกเส้นทาง
    }

    // เส้นทางสำหรับ owner หรือผู้ใช้ทั่วไป
    const userId = localStorage.getItem('user_id') || localStorage.getItem('owner');
    if (userId) {
      return children;
    }

    console.log('No user_id or owner found, redirecting to /login');
    return <Navigate to="/login" replace />;
  } catch (error) {
    console.error('Invalid token:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('customerId');
    localStorage.removeItem('user_id');
    localStorage.removeItem('owner');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;