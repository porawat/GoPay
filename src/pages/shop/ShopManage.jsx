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

  useEffect(() => {
    fetchShopDetails();
  }, [shopId, token, navigate]);

  return (
    <div className='flex-1 p-6 bg-gray-100 min-h-screen'>
      <div className='mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              {shop ? shop.shop_name || 'ร้านค้า' : 'จัดการร้านค้า'}
            </h1>
            <p className='mt-2 text-gray-600'>จัดการร้านค้าของคุณ</p>
          </div>
          <button
            onClick={() => navigate('/myshop')}
            className='btn-primary flex items-center px-4 py-2'
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
          <div className='mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex justify-between items-center'>
            <span>{error}</span>
            <button
              onClick={fetchShopDetails}
              className='text-red-700 underline'
            >
              ลองใหม่
            </button>
          </div>
        )}

        {isLoading && (
          <div className='mb-8 p-6 bg-white rounded-lg shadow-md text-center'>
            <p className='text-gray-600'>กำลังโหลดข้อมูลร้านค้า...</p>
          </div>
        )}

        {!isLoading && shop && (
          <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold text-gray-900'>ข้อมูลร้านค้า</h2>
              <button
                onClick={handleEditShop}
                className='btn-primary flex items-center px-4 py-2'
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
                    d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                  />
                </svg>
                แก้ไขร้านค้า
              </button>
            </div>
            {shop.cover ? (
              <img
                src={`${API_URL}/files/uploads/${shop.cover}`}
                alt={`${shop.shop_name} cover`}
                className='w-full h-32 object-cover rounded-lg mb-4'
              />
            ) : (
              <div className='w-full h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center'>
                <span className='text-gray-500'>ไม่มีภาพปก</span>
              </div>
            )}
            <div className='flex justify-center mb-4'>
              <div className='w-16 h-16 rounded-full overflow-hidden border-4 border-white -mt-12'>
                {shop.avatar ? (
                  <img
                    src={`${API_URL}/files/uploads/${shop.avatar}`}
                    alt={`${shop.shop_name} avatar`}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full bg-gray-300 flex items-center justify-center'>
                    <span className='text-gray-500 text-sm'>ไม่มีรูป</span>
                  </div>
                )}
              </div>
            </div>
            <p className='text-gray-600'>ชื่อร้านค้า: {shop.shop_name || '-'}</p>
            <p className='text-gray-600'>Slug: {shop.slug_id || '-'}</p>
            <p className='text-gray-600'>โทร: {shop.shop_tel || '-'}</p>
            <p className='text-gray-600'>อีเมล: {shop.email || '-'}</p>
            <p className='text-gray-600'>ผู้ติดต่อ: {shop.contact_name || '-'}</p>
          </div>
        )}

        {!isLoading && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div
              onClick={handleAddEmployee}
              className='bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer'
              title='ดูรายชื่อพนักงานและเพิ่มพนักงานใหม่'
            >
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>จัดการพนักงาน</h3>
              <p className='text-gray-600'>ดูรายชื่อและเพิ่มพนักงานใหม่สำหรับร้านค้า</p>
            </div>
            <div
              onClick={handleAddProduct}
              className='bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer'
              title='เพิ่มสินค้าใหม่ให้กับร้านค้า'
            >
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>สร้างสินค้า</h3>
              <p className='text-gray-600'>เพิ่มสินค้าใหม่ให้กับร้านค้า</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopManage;