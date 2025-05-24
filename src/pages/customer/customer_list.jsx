import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/config';

export default function CustomerList() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      console.log('Token:', token);
      console.log('Shop ID:', shopId);
      console.log('Fetching customers from:', `${API_URL}/customer/all/${shopId}?page=${page}&limit=10`);

      if (!token) {
        setError('กรุณาเข้าสู่ระบบ');
        navigate('/login');
        return;
      }

      if (!shopId) {
        setError('ไม่พบรหัสร้านค้า');
        navigate('/myshop');
        return;
      }

      try {
        // ดึงข้อมูลลูกค้าโดยตรง (ลบ shop validation ถ้า backend จัดการแล้ว)
        const response = await axios.get(`${API_URL}/customer/all/${shopId}?page=${page}&limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        });
        console.log('Customers API Response:', response.data);

        if (!response.data || typeof response.data !== 'object') {
          throw new Error('Response ไม่ใช่ JSON หรือโครงสร้างไม่ถูกต้อง');
        }

        if (response.data?.code === 1000) {
          const data = response.data?.data || [];
          if (!Array.isArray(data)) {
            console.warn('Customer response data is not an array:', data);
            setCustomers([]);
          } else {
            setCustomers(data);
            setTotalPages(response.data?.pagination?.totalPages || 1);
          }
        } else {
          throw new Error(response.data?.message || 'ข้อผิดพลาดไม่ทราบสาเหตุ');
        }
      } catch (err) {
        console.error('Failed to fetch customers:', err);
        console.log('Error response:', err.response?.data);
        let errorMessage = 'ไม่สามารถดึงรายชื่อลูกค้าได้';
        if (err.response) {
          if (err.response.status === 404) {
            errorMessage = `ไม่มีลูกค้าสำหรับร้านค้า (รหัส: ${shopId})`;
          } else if (err.response.status === 401) {
            errorMessage = 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่';
            navigate('/login');
          } else if (err.response.status === 403) {
            errorMessage = err.response.data?.message || 'คุณไม่มีสิทธิ์ในการดูรายชื่อลูกค้า';
          } else if (err.response.data?.message) {
            errorMessage = err.response.data.message;
          } else if (typeof err.response.data === 'string' && err.response.data.includes('Cannot GET')) {
            errorMessage = `ไม่พบ endpoint สำหรับร้านค้า (รหัส: ${shopId})`;
          }
        } else if (err.code === 'ECONNABORTED') {
          errorMessage = 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่';
        } else {
          errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, [shopId, navigate, page]);

  const handleApproveCustomer = async (customerId) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการอนุมัติลูกค้านี้?')) return;

    setActionLoading((prev) => ({ ...prev, [customerId]: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/customer/approve/${customerId}`,
        { approved: true },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
      );

      if (response.data?.code === 1000) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === customerId ? { ...c, status: 'APPROVED' } : c))
        );
      } else {
        setError(response.data?.message || 'ไม่สามารถอนุมัติลูกค้าได้');
      }
    } catch (err) {
      console.error('Error approving customer:', err.response?.data || err.message);
      let errorMessage = 'เกิดข้อผิดพลาดในการอนุมัติลูกค้า';
      if (err.response?.status === 403) {
        errorMessage = err.response.data?.message || 'คุณไม่มีสิทธิ์อนุมัติลูกค้านี้';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
    } finally {
      setActionLoading((prev) => ({ ...prev, [customerId]: false }));
    }
  };

  const handleRejectCustomer = async (customerId) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการปฏิเสธลูกค้านี้?')) return;

    setActionLoading((prev) => ({ ...prev, [customerId]: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/customer/reject/${customerId}`,
        { rejected: true },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
      );

      if (response.data?.code === 1000) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === customerId ? { ...c, status: 'REJECTED', is_active: 'INACTIVE' } : c
          )
        );
      } else {
        setError(response.data?.message || 'ไม่สามารถปฏิเสธลูกค้าได้');
      }
    } catch (err) {
      console.error('Error rejecting customer:', err.response?.data || err.message);
      let errorMessage = 'เกิดข้อผิดพลาดในการปฏิเสธลูกค้า';
      if (err.response?.status === 403) {
        errorMessage = err.response.data?.message || 'คุณไม่มีสิทธิ์ปฏิเสธลูกค้านี้';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
    } finally {
      setActionLoading((prev) => ({ ...prev, [customerId]: false }));
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const fullName = `${customer.name || ''}`.toLowerCase();
    const email = (customer.email || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  return (
    <div className="flex-1 p-6 bg-gradient-to-b from-indigo-50 via-purple-50 to-blue-50 text-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-indigo-800 flex items-center">
            <svg
              className="w-8 h-8 mr-2 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            รายชื่อลูกค้า
          </h2>
          <button
            onClick={() => navigate(`/shopmanage/${shopId}`)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center shadow-sm"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            กลับ
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow-sm flex justify-between items-center border-l-4 border-red-500">
            <span className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </span>
            <div className="flex space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="text-red-700 hover:text-red-800 font-medium hover:underline flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                ลองใหม่
              </button>
              {error.includes('คุณไม่มีสิทธิ์') && (
                <button
                  onClick={() => navigate('/myshop')}
                  className="text-red-700 hover:text-red-800 font-medium hover:underline flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7m-7-7v14"
                    />
                  </svg>
                  กลับไปที่ร้านค้าของฉัน
                </button>
              )}
            </div>
          </div>
        )}

        {!isLoading && customers.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="ค้นหาลูกค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-lg shadow-sm"
              />
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-lg border border-gray-100">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-xl font-semibold text-gray-800">ยังไม่มีรายชื่อลูกค้า</p>
            <p className="mt-2 text-gray-600">ไม่มีลูกค้าลงทะเบียนสำหรับร้านค้านี้</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50 text-left border-b border-gray-200">
                    <th className="p-4 font-semibold text-gray-700">ชื่อ</th>
                    <th className="p-4 font-semibold text-gray-700">อีเมล</th>
                    <th className="p-4 font-semibold text-gray-700">เบอร์โทร</th>
                    <th className="p-4 font-semibold text-gray-700">สถานะ</th>
                    <th className="p-4 font-semibold text-gray-700">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="border-t border-gray-200 hover:bg-indigo-50 transition-colors"
                      >
                        <td className="p-4 font-medium">
                          {customer.name ? customer.name : <span className="text-gray-400 italic">ไม่ระบุชื่อ</span>}
                        </td>
                        <td className="p-4">
                          {customer.email ? (
                            customer.email
                          ) : (
                            <span className="text-gray-400 italic">ไม่ระบุอีเมล</span>
                          )}
                        </td>
                        <td className="p-4">
                          {customer.phone ? (
                            customer.phone
                          ) : (
                            <span className="text-gray-400 italic">ไม่ระบุเบอร์โทร</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              customer.status === 'APPROVED'
                                ? 'bg-green-100 text-green-700'
                                : customer.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {customer.status === 'APPROVED' && (
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                            )}
                            {customer.status === 'PENDING' && (
                              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1.5"></span>
                            )}
                            {customer.status === 'REJECTED' && (
                              <span className="w-2 h-2 bg-red-500 rounded-full mr-1.5"></span>
                            )}
                            {customer.status === 'APPROVED'
                              ? 'อนุมัติ'
                              : customer.status === 'PENDING'
                              ? 'รอการอนุมัติ'
                              : 'ปฏิเสธ'}
                          </span>
                        </td>
                        <td className="p-4">
                          {customer.status === 'PENDING' && (
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleApproveCustomer(customer.id)}
                                disabled={actionLoading[customer.id]}
                                className={`text-green-600 hover:text-green-800 transition-colors flex items-center ${
                                  actionLoading[customer.id] ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                title="อนุมัติ"
                              >
                                <svg
                                  className="w-5 h-5 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                {actionLoading[customer.id] ? 'กำลังอนุมัติ...' : 'อนุมัติ'}
                              </button>
                              <button
                                onClick={() => handleRejectCustomer(customer.id)}
                                disabled={actionLoading[customer.id]}
                                className={`text-red-600 hover:text-red-800 transition-colors flex items-center ${
                                  actionLoading[customer.id] ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                title="ปฏิเสธ"
                              >
                                <svg
                                  className="w-5 h-5 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                                {actionLoading[customer.id] ? 'กำลังปฏิเสธ...' : 'ปฏิเสธ'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        ไม่พบลูกค้าที่ตรงกับคำค้นหา
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {customers.length > 0 && (
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow disabled:opacity-50 hover:bg-indigo-700 transition-colors"
                  >
                    ก่อนหน้า
                  </button>
                  <span className="text-sm text-gray-700">
                    หน้า {page} จาก {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow disabled:opacity-50 hover:bg-indigo-700 transition-colors"
                  >
                    ถัดไป
                  </button>
                </div>
                <div className="text-sm text-gray-700">
                  {searchTerm
                    ? `พบ ${filteredCustomers.length} รายการจาก ${customers.length} รายการ`
                    : `ทั้งหมด ${customers.length} รายการ`}
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-gray-600 text-sm hover:text-gray-900 flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    ล้างการค้นหา
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}