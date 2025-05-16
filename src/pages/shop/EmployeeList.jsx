import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/config';

export default function EmployeeList() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

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
        // ตรวจสอบว่า shopId มีอยู่จริง
        console.log('Validating shopId:', shopId);
        let shopResponse;
        const shopEndpoints = [
          `${API_URL}/shop/${shopId}`,
          `${API_URL}/api/shop/${shopId}`,
          `${API_URL}/shops/${shopId}`,
        ];

        for (const endpoint of shopEndpoints) {
          try {
            console.log(`Trying shop endpoint: ${endpoint}`);
            shopResponse = await axios.get(endpoint, {
              headers: { Authorization: `Bearer ${token}` },
            });
            console.log('Shop validation response:', shopResponse.data);
            break;
          } catch (shopErr) {
            console.log(`Shop endpoint ${endpoint} failed:`, shopErr.response?.status);
            if (shopErr.response?.status !== 404) {
              throw shopErr;
            }
          }
        }

        if (!shopResponse) {
          throw new Error(`ไม่พบร้านค้า (รหัส: ${shopId})`);
        }

        // ดึงพนักงาน
        console.log('Fetching employees for shopId:', shopId);
        const employeeEndpoint = `${API_URL}/employees/shop/${shopId}`;
        console.log(`Trying employee endpoint: ${employeeEndpoint}`);
        const response = await axios.get(employeeEndpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Employees API Response:', response.data);

        // จัดการ response ที่อาจเป็น object หรือ array
        const data = response.data?.data || response.data?.employees || response.data;
        if (!Array.isArray(data)) {
          console.warn('Employee response data is not an array:', data);
          setEmployees([]);
        } else {
          setEmployees(data);
        }
      } catch (err) {
        console.error('Failed to fetch employees:', err);
        console.log('Error response:', err.response?.data);
        let errorMessage = 'ไม่สามารถดึงรายชื่อพนักงานได้';
        if (err.message.includes('ไม่พบร้านค้า')) {
          errorMessage = err.message;
        } else if (err.response) {
          if (err.response.status === 404) {
            errorMessage = `ไม่มีพนักงานสำหรับร้านค้า (รหัส: ${shopId})`;
          } else if (err.response.status === 401) {
            errorMessage = 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่';
            navigate('/login');
          } else if (err.response.status === 403) {
            errorMessage = 'คุณไม่มีสิทธิ์ในการดูรายชื่อพนักงาน';
          } else if (err.response.data?.message) {
            errorMessage = err.response.data.message;
          } else if (typeof err.response.data === 'string' && err.response.data.includes('Cannot GET')) {
            errorMessage = `ไม่พบ endpoint สำหรับร้านค้า (รหัส: ${shopId})`;
          }
        } else {
          errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, [shopId, navigate]);

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'ใช้งาน';
      case 'INACTIVE':
        return 'ไม่ใช้งาน';
      case 'SUSPENDED':
        return 'ระงับ';
      default:
        return status || 'ไม่ระบุ';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-700';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatRoles = (roles) => {
    if (!roles || !Array.isArray(roles) || roles.length === 0) return '-';
    const roleMap = {
      CASHIER: 'แคชเชียร์',
      INVENTORY: 'จัดการสต็อก',
      ADMIN: 'ผู้ดูแลระบบ',
    };
    return roles.map((role) => roleMap[role] || role).join(', ');
  };

  const getRoleBadges = (roles) => {
    if (!roles || !Array.isArray(roles) || roles.length === 0) return <span className="text-gray-400">-</span>;
    
    const roleBadgeColors = {
      CASHIER: 'bg-blue-100 text-blue-700',
      INVENTORY: 'bg-amber-100 text-amber-700',
      ADMIN: 'bg-purple-100 text-purple-700'
    };
    
    const roleMap = {
      CASHIER: 'แคชเชียร์',
      INVENTORY: 'จัดการสต็อก',
      ADMIN: 'ผู้ดูแลระบบ',
    };
    
    return (
      <div className="flex flex-wrap gap-1">
        {roles.map((role, index) => (
          <span 
            key={index} 
            className={`px-2 py-1 rounded text-xs font-medium ${roleBadgeColors[role] || 'bg-gray-100 text-gray-700'}`}
          >
            {roleMap[role] || role}
          </span>
        ))}
      </div>
    );
  };

  // ฟังก์ชันสำหรับการเรียงลำดับข้อมูล
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // กรองและเรียงลำดับรายชื่อพนักงาน
  const filteredEmployees = employees
    .filter((employee) => {
      const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.toLowerCase();
      const email = (employee.email || '').toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      return fullName.includes(searchLower) || email.includes(searchLower);
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      
      let aValue, bValue;
      
      if (sortConfig.key === 'name') {
        aValue = `${a.first_name || ''} ${a.last_name || ''}`;
        bValue = `${b.first_name || ''} ${b.last_name || ''}`;
      } else if (sortConfig.key === 'roles') {
        aValue = formatRoles(a.roles);
        bValue = formatRoles(b.roles);
      } else {
        aValue = a[sortConfig.key] || '';
        bValue = b[sortConfig.key] || '';
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

  // สร้าง header สำหรับการเรียงลำดับข้อมูล
  const getSortableHeader = (label, key) => {
    const isActive = sortConfig.key === key;
    return (
      <th 
        className="p-4 font-semibold text-gray-700 cursor-pointer select-none"
        onClick={() => requestSort(key)}
      >
        <div className="flex items-center space-x-1">
          <span>{label}</span>
          <span className="text-gray-400">
            {isActive ? (
              sortConfig.direction === 'ascending' ? '▲' : '▼'
            ) : '⇅'}
          </span>
        </div>
      </th>
    );
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 text-gray-900">
      {/* <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> */}
        <div className='mx-auto px-4 sm:px-6 lg:px-8 py-8'>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-indigo-800">รายชื่อพนักงาน</h2>
          <div className="flex space-x-4">
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              กลับ
            </button>
            <button
              onClick={() => navigate(`/shop/${shopId}/employees/new`)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-sm"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              เพิ่มพนักงานใหม่
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow-sm flex justify-between items-center border-l-4 border-red-500">
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </span>
            <div className="flex space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="text-red-700 hover:text-red-800 font-medium hover:underline flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                ลองใหม่
              </button>
              <button
                onClick={() => navigate('/myshop')}
                className="text-red-700 hover:text-red-800 font-medium hover:underline flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-7-7v14" />
                </svg>
                กลับไปที่ร้านค้าของฉัน
              </button>
            </div>
          </div>
        )}

        {/* ช่องค้นหา */}
        {!isLoading && employees.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="ค้นหาพนักงาน..."
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
        ) : employees.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-lg border border-gray-100">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-xl font-semibold text-gray-800">ยังไม่มีรายชื่อพนักงาน</p>
            <p className="mt-2 text-gray-600">
              คลิกปุ่ม "เพิ่มพนักงานใหม่" เพื่อเริ่มต้นเพิ่มพนักงานในระบบ
            </p>
            <button
              onClick={() => navigate(`/shop/${shopId}/employees/new`)}
              className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center mx-auto"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              เพิ่มพนักงานใหม่
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50 text-left border-b border-gray-200">
                    {getSortableHeader('ชื่อ', 'name')}
                    {getSortableHeader('อีเมล', 'email')}
                    {getSortableHeader('สถานะ', 'status')}
                    {getSortableHeader('สิทธิ์', 'roles')}
                    <th className="p-4 font-semibold text-gray-700">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => (
                      <tr
                        key={employee.id}
                        className="border-t border-gray-200 hover:bg-indigo-50 transition-colors"
                      >
                        <td className="p-4 font-medium">
                          {`${employee.first_name || ''} ${employee.last_name || ''}`.trim() ? 
                            `${employee.first_name || ''} ${employee.last_name || ''}`.trim() : 
                            <span className="text-gray-400 italic">ไม่ระบุชื่อ</span>}
                        </td>
                        <td className="p-4">
                          {employee.email ? employee.email : 
                          <span className="text-gray-400 italic">ไม่ระบุอีเมล</span>}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}
                          >
                            {employee.status === 'ACTIVE' && (
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                            )}
                            {employee.status === 'SUSPENDED' && (
                              <span className="w-2 h-2 bg-red-500 rounded-full mr-1.5"></span>
                            )}
                            {employee.status === 'INACTIVE' && (
                              <span className="w-2 h-2 bg-gray-500 rounded-full mr-1.5"></span>
                            )}
                            {getStatusDisplay(employee.status)}
                          </span>
                        </td>
                        <td className="p-4">
                          {getRoleBadges(employee.roles)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => navigate(`/shop/${shopId}/employees/${employee.id}/edit`)}
                              className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center"
                              title="แก้ไขข้อมูล"
                            >
                              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              แก้ไข
                            </button>
                            {employee.status !== 'SUSPENDED' && (
                              <button 
                                className="text-red-600 hover:text-red-800 transition-colors flex items-center"
                                title="ระงับพนักงาน"
                              >
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                ระงับ
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        ไม่พบพนักงานที่ตรงกับคำค้นหา
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* ส่วนแสดงสรุปจำนวนพนักงาน */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                {searchTerm ? 
                  `พบ ${filteredEmployees.length} รายการจาก ${employees.length} รายการ` : 
                  `ทั้งหมด ${employees.length} รายการ`}
              </div>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="text-gray-600 text-sm hover:text-gray-900 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  ล้างการค้นหา
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}