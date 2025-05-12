import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Settings() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // ตรวจสอบ role ก่อนเรียก API
    if (role !== 'admin') {
      setError('Access denied: Admins only');
      navigate('/dashboard'); // Redirect ไป Dashboard ถ้าไม่ใช่ admin
      return;
    }

    axios
      .get('http://localhost:3001/settings', {
        headers: { Authorization: token },
      })
      .then((response) => setMessage(response.data.message))
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load settings');
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('username');
          navigate('/');
        }
      });
  }, [navigate, role]);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        {error ? (
          <p className="mt-2 text-red-500">{error}</p>
        ) : (
          <p className="mt-2 text-gray-600">{message}</p>
        )}
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Admin Settings</h3>
          <p className="mt-2 text-sm text-gray-600">
            This section is only accessible to administrators. Here you can configure system settings.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Settings;