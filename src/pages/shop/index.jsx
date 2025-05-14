import { useState, useEffect } from 'react';
import { API_URL } from '../../config/config';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ShopPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id');
  const [myshop, setMyshop] = useState([]);
  const [error, setError] = useState(null);

  const getmyshop = async () => {
    if (!token || !userId) {
      setError('กรุณาล็อกอินเพื่อดูร้านค้าของคุณ');
      return;
    }
    try {
      const response = await axios.post(
        `${API_URL}/shop/getmyshop`,
        { user_id: userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('API Response:', response.data);
      if (response.data?.code === 1000) {
        setMyshop(response.data?.datarow || []);
      } else {
        setError('ไม่สามารถดึงข้อมูลร้านค้าได้: ' + (response.data?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching shops:', error.response?.data || error.message);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์: ' + (error.response?.data?.message || error.message));
    }
  };

  const gotomyshop = (item) => {
    console.log('Navigating to shop:', item);
    navigate(`/shopedit/${item.id}`);
  };

  const createshop = () => {
    navigate('/shopcreate');
  };

  useEffect(() => {
    getmyshop();
  }, []);

  return (
    <div className='flex-1 p-6 bg-gray-100 min-h-screen'>
      <div className='mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>ร้านค้าของคุณ</h1>
          <p className='mt-2 text-gray-600'>ยินดีต้อนรับสู่แดชบอร์ดของคุณ</p>
        </div>

        {error && (
          <div className='mb-4 p-4 bg-red-100 text-red-700 rounded-lg'>
            {error}
          </div>
        )}

        {myshop.length > 0 ? (
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8'>
            {myshop.map((item, index) => (
              <div
                key={item.id || index}
                className='bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer'
                onClick={() => gotomyshop(item)}
              >
                <div className='flex flex-col items-center'>
                  {/* Cover Image */}
                  {item.cover ? (
                    <img
                      src={`${API_URL}/files/uploads/${item.cover}`}
                      alt={`${item.shop_name} cover`}
                      className='w-full h-32 object-cover rounded-t-lg mb-4'
                    />
                  ) : (
                    <div className='w-full h-32 bg-gray-200 rounded-t-lg mb-4 flex items-center justify-center'>
                      <span className='text-gray-500'>ไม่มีภาพปก</span>
                    </div>
                  )}

                  {/* Avatar Image */}
                  <div className='relative -mt-12'>
                    <div className='w-16 h-16 rounded-full overflow-hidden border-4 border-white'>
                      {item.avatar ? (
                        <img
                          src={`${API_URL}/files/uploads/${item.avatar}`}
                          alt={`${item.shop_name} avatar`}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='w-full h-full bg-gray-300 flex items-center justify-center'>
                          <span className='text-gray-500 text-sm'>ไม่มีรูป</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shop Details */}
                  <div className='mt-4 text-center'>
                    <p className='text-xl font-semibold text-gray-900'>
                      {item.shop_name || 'Unnamed Shop'}
                    </p>
                    <p className='text-sm text-gray-600'>Slug: {item.slug_id || '-'}</p>
                    <p className='text-sm text-gray-600'>โทร: {item.shop_tel || '-'}</p>
                    <p className='text-sm text-gray-600'>อีเมล: {item.email || '-'}</p>
                    <p className='text-sm text-gray-600'>ผู้ติดต่อ: {item.contact_name || '-'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='mb-8 p-6 bg-white rounded-lg shadow-md'>
            <p className='text-gray-600'>คุณยังไม่มีร้านค้า เริ่มสร้างร้านค้าของคุณได้เลย!</p>
          </div>
        )}

        <div
          className='bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer'
          onClick={createshop}
        >
          <div className='flex items-center'>
            <div className='p-3 rounded-full bg-pink-100'>
              <svg
                className='w-6 h-6 text-red-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-2xl font-semibold text-gray-900'>สร้างร้านของคุณ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;