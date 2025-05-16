import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/config';

const ShopManage = () => {
  const navigate = useNavigate();
  const { shopId } = useParams();
  const token = localStorage.getItem('token');
  const [shop, setShop] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchShopDetails = async () => {
    if (!token || !shopId) {
      setError('กรุณาล็อกอินเพื่อดูข้อมูลร้านค้า');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Calling API:', `${API_URL}/shop/${shopId}`);
      console.log('Token:', token);

      const response = await axios.get(`${API_URL}/shop/${shopId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data?.code === 1000) {
        setShop(response.data?.datarow || {});
      } else {
        setError('ไม่สามารถดึงข้อมูลร้านค้าได้: ' + (response.data?.message || 'ข้อผิดพลาดไม่ทราบสาเหตุ'));
      }
    } catch (error) {
      console.error('Error fetching shop details:', error.response?.data || error.message);
      let errorMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์';
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'ไม่พบร้านค้า อาจเนื่องจากรหัสร้านค้าไม่ถูกต้องหรือคุณไม่มีสิทธิ์เข้าถึง';
        } else if (error.response.status === 401) {
          errorMessage = 'เซสชันหมดอายุ กรุณาล็อกอินใหม่';
          navigate('/login');
        } else {
          errorMessage = error.response.data?.message || error.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmployee = () => {
    navigate(`/shop/${shopId}/employees`);
  };

  const handleAddProduct = () => {
    navigate(`/shopmanage/${shopId}/addproduct`);
  };

  const handleEditShop = () => {
    navigate(`/shopedit/${shopId}`);
  };
  
  const handleManageLocations = () => {
    navigate(`/shop/${shopId}/locations`);
  };
  
  const handleManageInventory = () => {
    navigate(`/shop/${shopId}/inventory`);
  };
  
  const handleManageOrders = () => {
    navigate(`/shop/${shopId}/orders`);
  };
  
  const handleReports = () => {
    navigate(`/shop/${shopId}/reports`);
  };

  useEffect(() => {
    fetchShopDetails();
  }, [shopId, token, navigate]);

  return (
    <div className='flex-1 p-6 bg-gradient-to-b from-blue-50 to-gray-100 min-h-screen'>
      <div className='mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 flex items-center'>
              <span className="text-blue-600 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </span>
              {shop ? shop.shop_name || 'ร้านค้า' : 'จัดการร้านค้า'}
            </h1>
            <p className='mt-1 text-gray-600 flex items-center'>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              จัดการร้านค้าของคุณ
            </p>
          </div>
          <button
            onClick={() => navigate('/myshop')}
            className='btn-primary flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition-colors'
          >
            <svg
              className='w-5 h-5 mr-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M10 19l-7-7m0 0l7-7m-7 7h18'
              />
            </svg>
            กลับ
          </button>
        </div>

        {error && (
          <div className='mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow-sm flex justify-between items-center border-l-4 border-red-500'>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
            <button
              onClick={fetchShopDetails}
              className='text-red-700 px-3 py-1 bg-red-200 rounded-md hover:bg-red-300 transition-colors flex items-center'
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              ลองใหม่
            </button>
          </div>
        )}

        {isLoading && (
          <div className='mb-6 p-4 bg-white rounded-lg shadow-md text-center'>
            <div className="flex justify-center items-center">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className='text-gray-600 mt-2'>กำลังโหลดข้อมูลร้านค้า...</p>
          </div>
        )}

        {!isLoading && shop && (
          <div className='bg-white rounded-lg shadow p-4 mb-6 relative overflow-hidden flex flex-col md:flex-row items-center md:items-start'>
            <div className='w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md bg-white mr-0 md:mr-4 mb-3 md:mb-0'>
              {shop.avatar ? (
                <img
                  src={`${API_URL}/files/uploads/${shop.avatar}`}
                  alt={`${shop.shop_name} avatar`}
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='w-full h-full bg-gradient-to-br from-blue-300 to-blue-400 flex items-center justify-center'>
                  <span className='text-white text-xl font-bold'>
                    {shop.shop_name ? shop.shop_name.charAt(0).toUpperCase() : 'S'}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <h2 className='text-lg font-semibold text-gray-900'>{shop.shop_name || '-'}</h2>
                <button
                  onClick={handleEditShop}
                  className='text-blue-600 hover:text-blue-800 flex items-center text-sm'
                >
                  <svg
                    className='w-4 h-4 mr-1'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                    />
                  </svg>
                  แก้ไข
                </button>
              </div>
              
              <div className="flex flex-wrap text-sm mt-1">
                <div className="flex items-center mr-4 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-600">{shop.shop_tel || '-'}</span>
                </div>
                
                <div className="flex items-center mr-4 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600">{shop.email || '-'}</span>
                </div>
                
                <div className="flex items-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-gray-600">ผู้ติดต่อ: {shop.contact_name || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isLoading && (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
            <div
              onClick={handleAddEmployee}
              className='bg-white rounded-lg shadow p-4 hover:shadow-md transition-all transform hover:-translate-y-1 cursor-pointer border-b-2 border-blue-500'
              title='ดูรายชื่อพนักงานและเพิ่มพนักงานใหม่'
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className='text-sm font-semibold text-gray-900 mb-1 text-center'>พนักงาน</h3>
            </div>
            
            <div
              onClick={handleAddProduct}
              className='bg-white rounded-lg shadow p-4 hover:shadow-md transition-all transform hover:-translate-y-1 cursor-pointer border-b-2 border-green-500'
              title='เพิ่มสินค้าใหม่ให้กับร้านค้า'
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100 mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className='text-sm font-semibold text-gray-900 mb-1 text-center'>สร้างสินค้า</h3>
            </div>
            
            <div
              onClick={handleManageLocations}
              className='bg-white rounded-lg shadow p-4 hover:shadow-md transition-all transform hover:-translate-y-1 cursor-pointer border-b-2 border-purple-500'
              title='จัดการสถานที่เก็บสินค้า'
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className='text-sm font-semibold text-gray-900 mb-1 text-center'>สถานที่</h3>
            </div>
            
            <div
              onClick={handleManageInventory}
              className='bg-white rounded-lg shadow p-4 hover:shadow-md transition-all transform hover:-translate-y-1 cursor-pointer border-b-2 border-yellow-500'
              title='จัดการคลังสินค้า'
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-yellow-100 mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className='text-sm font-semibold text-gray-900 mb-1 text-center'>จัดการคลัง</h3>
            </div>
            
            <div
              onClick={handleManageOrders}
              className='bg-white rounded-lg shadow p-4 hover:shadow-md transition-all transform hover:-translate-y-1 cursor-pointer border-b-2 border-red-500'
              title='รายการสั่งซื้อ'
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100 mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className='text-sm font-semibold text-gray-900 mb-1 text-center'>รายการสั่งซื้อ</h3>
            </div>
            
            <div
              onClick={handleReports}
              className='bg-white rounded-lg shadow p-4 hover:shadow-md transition-all transform hover:-translate-y-1 cursor-pointer border-b-2 border-indigo-500'
              title='รายงาน'
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className='text-sm font-semibold text-gray-900 mb-1 text-center'>รายงาน</h3>
            </div>
          </div>
        )}
        
        {!isLoading && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">สรุปภาพรวม</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">สินค้าทั้งหมด</p>
                    <p className="text-2xl font-bold text-gray-800">0</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">รายการสั่งซื้อใหม่</p>
                    <p className="text-2xl font-bold text-gray-800">0</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">พนักงาน</p>
                    <p className="text-2xl font-bold text-gray-800">50</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">คลังสินค้า</p>
                    <p className="text-2xl font-bold text-gray-800">200</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopManage;