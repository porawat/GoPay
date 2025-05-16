import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { API_URL } from '../../config/config';

export default function EmployeeForm({ action = 'create' }) {
  const navigate = useNavigate();
  const { id: employeeId, shopId } = useParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      phone: '',
      roles: [],
      status: 'ACTIVE',
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  useEffect(() => {
    if (action === 'edit' && employeeId) {
      const fetchEmployee = async () => {
        const token = localStorage.getItem('token');
        try {
          const response = await axios.get(`${API_URL}/employees/${employeeId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const { first_name, last_name, email, phone, roles, status } = response.data;
          reset({ first_name, last_name, email, phone, roles, status });
        } catch (error) {
          console.error('Failed to fetch employee data:', error);
          setSubmitError('ไม่สามารถดึงข้อมูลพนักงานได้');
        }
      };
      fetchEmployee();
    }
  }, [action, employeeId, reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setSubmitError('กรุณาเข้าสู่ระบบ');
      navigate('/login');
      setIsLoading(false);
      return;
    }

    try {
      const isEditMode = action === 'edit' && employeeId;
      const url = isEditMode
        ? `${API_URL}/employees/${employeeId}`
        : `${API_URL}/employees`;
      const method = isEditMode ? 'put' : 'post';

      let formattedShopId = shopId;
      if (shopId && !isNaN(parseInt(shopId))) {
        formattedShopId = parseInt(shopId);
      }
      
      const payload = { ...data, shop_id: formattedShopId };
      console.log('Sending request:', { method, url, payload, token });

      const response = await axios({
        method,
        url,
        data: payload,
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Response:', response.data);

      setSubmitSuccess(
        isEditMode ? 'บันทึกการแก้ไขเรียบร้อย!' : 'สร้างพนักงานเรียบร้อย!'
      );
      if (!isEditMode) reset();
      setTimeout(() => navigate(`/shop/${shopId}/employees`), 2000);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      let errorMessage = 'เกิดข้อผิดพลาดในการดำเนินการ';
      if (error.response?.status === 404) {
        errorMessage = 'ไม่พบ endpoint ในเซิร์ฟเวอร์';
      } else if (error.response?.status === 401) {
        errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
        navigate('/login');
      } else if (error.response?.status === 403) {
        errorMessage = 'คุณไม่มีสิทธิ์ในการสร้างพนักงาน';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setSubmitError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-r from-indigo-50 to-purple-50 text-gray-900">
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6">
            {action === 'edit' ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'}
          </h2>

          {submitSuccess && (
            <p className="text-green-700 bg-green-100 p-3 rounded mb-4">
              {submitSuccess}
            </p>
          )}
          {submitError && (
            <p className="text-red-700 bg-red-100 p-3 rounded mb-4">{submitError}</p>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                ชื่อ<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="ชื่อ"
                className={`w-full p-3 bg-white rounded border ${
                  errors.first_name ? 'border-red-500' : 'border-gray-300'
                } text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                {...register('first_name', {
                  required: 'ต้องระบุชื่อ',
                  minLength: { value: 2, message: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร' },
                })}
              />
              {errors.first_name && (
                <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                นามสกุล<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="นามสกุล"
                className={`w-full p-3 bg-white rounded border ${
                  errors.last_name ? 'border-red-500' : 'border-gray-300'
                } text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                {...register('last_name', {
                  required: 'ต้องระบุนามสกุล',
                  minLength: { value: 2, message: 'นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร' },
                })}
              />
              {errors.last_name && (
                <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                อีเมล<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="อีเมล"
                className={`w-full p-3 bg-white rounded border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                {...register('email', {
                  required: 'ต้องระบุอีเมล',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'กรุณากรอกอีเมลที่ถูกต้อง',
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {action === 'create' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  รหัสผ่าน<span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="รหัสผ่าน"
                  className={`w-full p-3 bg-white rounded border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  {...register('password', {
                    required: 'ต้องระบุรหัสผ่าน',
                    minLength: { value: 6, message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' },
                  })}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">เบอร์โทร</label>
              <input
                type="tel"
                placeholder="เบอร์โทร"
                className={`w-full p-3 bg-white rounded border ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                } text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                {...register('phone', {
                  pattern: {
                    value: /^[0-9-+\s()]*$/,
                    message: 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง',
                  },
                })}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                สิทธิ์<span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    value="CASHIER"
                    className="mr-2"
                    {...register('roles', { required: 'ต้องเลือกอย่างน้อยหนึ่งสิทธิ์' })}
                  />
                  แคชเชียร์
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    value="INVENTORY"
                    className="mr-2"
                    {...register('roles')}
                  />
                  จัดการสต็อก
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    value="ADMIN"
                    className="mr-2"
                    {...register('roles')}
                  />
                  ผู้ดูแลระบบ
                </label>
              </div>
              {errors.roles && (
                <p className="text-red-500 text-xs mt-1">{errors.roles.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                สถานะ<span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full p-3 bg-white rounded border ${
                  errors.status ? 'border-red-500' : 'border-gray-300'
                } text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                {...register('status', { required: 'ต้องเลือกสถานะ' })}
              >
                <option value="ACTIVE">ใช้งาน</option>
                <option value="INACTIVE">ไม่ใช้งาน</option>
                <option value="SUSPENDED">ระงับ</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>
              )}
            </div>

            <div className="flex justify-end mt-6 space-x-4">
              <button
                type="button"
                onClick={() => navigate(`/shop/${shopId}/employees`)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading
                  ? 'กำลังดำเนินการ...'
                  : action === 'edit'
                  ? 'บันทึกการแก้ไข'
                  : 'เพิ่มพนักงาน'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}