import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { API_URL } from "../../config/config";

export default function EmployeeForm({ action = "create" }) {
  const navigate = useNavigate();
  const { id: employeeId, shopId } = useParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      phone: "",
      roles: [],
      status: "ACTIVE",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  useEffect(() => {
    if (action === "edit" && employeeId) {
      const fetchEmployee = async () => {
        const token = localStorage.getItem("token");
        try {
          const response = await axios.get(
            `${API_URL}/employees/${employeeId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const { first_name, last_name, email, phone, roles, status } =
            response.data;
          reset({ first_name, last_name, email, phone, roles, status });
        } catch (error) {
          console.error("Failed to fetch employee data:", error);
          setSubmitError("ไม่สามารถดึงข้อมูลพนักงานได้");
        }
      };
      fetchEmployee();
    }
  }, [action, employeeId, reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setSubmitError("กรุณาเข้าสู่ระบบ");
      navigate("/login");
      setIsLoading(false);
      return;
    }

    try {
      const isEditMode = action === "edit" && employeeId;
      const url = isEditMode
        ? `${API_URL}/employees/${employeeId}`
        : `${API_URL}/employees`;
      const method = isEditMode ? "put" : "post";
      const payload = { ...data, shop_id: shopId };
      console.log("Sending request:", { method, url, payload, token });
      console.log("Payload:", payload);
      const response = await axios({
        method,
        url,
        data: payload,
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Response:", response.data);
      setSubmitSuccess(
        isEditMode ? "บันทึกการแก้ไขเรียบร้อย!" : "สร้างพนักงานเรียบร้อย!"
      );
      if (!isEditMode) reset();
      setTimeout(() => navigate(`/shop/${shopId}/employees`), 2000);
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      let errorMessage = "เกิดข้อผิดพลาดในการดำเนินการ";
      if (error.response?.status === 404) {
        errorMessage = "ไม่พบ endpoint ในเซิร์ฟเวอร์";
      } else if (error.response?.status === 401) {
        errorMessage = "กรุณาเข้าสู่ระบบใหม่";
        navigate("/login");
      } else if (error.response?.status === 403) {
        errorMessage = "คุณไม่มีสิทธิ์ในการสร้างพนักงาน";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setSubmitError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-violet-100 via-blue-50 to-sky-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header with glass effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-700 opacity-90"></div>
          <div className="relative px-8 py-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center">
              {action === "edit" ? (
                <>
                  <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                  </svg>
                  แก้ไขข้อมูลพนักงาน
                </>
              ) : (
                <>
                  <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"></path>
                  </svg>
                  เพิ่มพนักงานใหม่
                </>
              )}
            </h2>
            <p className="text-indigo-100 text-lg">
              กรอกข้อมูลให้ครบถ้วนในช่องที่มีเครื่องหมาย{" "}
              <span className="text-pink-300 font-bold">*</span>
            </p>
            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white opacity-20"></div>
          </div>
        </div>

        <div className="p-8">
          {submitSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg flex items-center animate-pulse">
              <svg
                className="h-6 w-6 text-emerald-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-emerald-800 font-medium">{submitSuccess}</span>
            </div>
          )}
          
          {submitError && (
            <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg flex items-center">
              <svg
                className="h-6 w-6 text-rose-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-rose-800 font-medium">{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information Section */}
            <div className="bg-blue-50 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                </svg>
                ข้อมูลส่วนตัว
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อ <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="ชื่อ"
                      className={`w-full pl-10 p-3 rounded-xl border ${
                        errors.first_name
                          ? "border-rose-500 bg-rose-50"
                          : "border-gray-300 focus:border-indigo-500"
                      } focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-300`}
                      {...register("first_name", {
                        required: "ต้องระบุชื่อ",
                        minLength: {
                          value: 2,
                          message: "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร",
                        },
                      })}
                    />
                  </div>
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-rose-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                      </svg>
                      {errors.first_name.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    นามสกุล <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="นามสกุล"
                      className={`w-full pl-10 p-3 rounded-xl border ${
                        errors.last_name
                          ? "border-rose-500 bg-rose-50"
                          : "border-gray-300 focus:border-indigo-500"
                      } focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-300`}
                      {...register("last_name", {
                        required: "ต้องระบุนามสกุล",
                        minLength: {
                          value: 2,
                          message: "นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร",
                        },
                      })}
                    />
                  </div>
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-rose-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                      </svg>
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-purple-50 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                </svg>
                ข้อมูลการติดต่อ
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    อีเมล <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      placeholder="อีเมล"
                      className={`w-full pl-10 p-3 rounded-xl border ${
                        errors.email
                          ? "border-rose-500 bg-rose-50"
                          : "border-gray-300 focus:border-indigo-500"
                      } focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-300`}
                      {...register("email", {
                        required: "ต้องระบุอีเมล",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "กรุณากรอกอีเมลที่ถูกต้อง",
                        },
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-rose-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                      </svg>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เบอร์โทร
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      placeholder="เบอร์โทร"
                      className={`w-full pl-10 p-3 rounded-xl border ${
                        errors.phone
                          ? "border-rose-500 bg-rose-50"
                          : "border-gray-300 focus:border-indigo-500"
                      } focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-300`}
                      {...register("phone", {
                        pattern: {
                          value: /^[0-9-+\s()]*$/,
                          message: "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง",
                        },
                      })}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-rose-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                      </svg>
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Security Section */}
            {action === "create" && (
              <div className="bg-amber-50 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                  </svg>
                  ความปลอดภัย
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รหัสผ่าน <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      type="password"
                      placeholder="รหัสผ่าน"
                      className={`w-full pl-10 p-3 rounded-xl border ${
                        errors.password
                          ? "border-rose-500 bg-rose-50"
                          : "border-gray-300 focus:border-indigo-500"
                      } focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-300`}
                      {...register("password", {
                        required: "ต้องระบุรหัสผ่าน",
                        minLength: {
                          value: 6,
                          message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
                        },
                      })}
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-rose-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                      </svg>
                      {errors.password.message}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-amber-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                    รหัสผ่านควรมีอย่างน้อย 6 ตัวอักษร และควรมีตัวอักษรพิมพ์ใหญ่ ตัวอักษรพิมพ์เล็ก และตัวเลขอย่างน้อย 1 ตัว
                  </p>
                </div>
              </div>
            )}

            {/* Role and Status Section */}
            <div className="bg-indigo-50 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd"></path>
                </svg>
                สิทธิ์และสถานะ
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    สิทธิ์ <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className="flex items-center p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-400 transition-all cursor-pointer">
                      <input
                        type="checkbox"
                        value="CASHIER"
                        className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                        {...register("roles", {
                          required: "ต้องเลือกอย่างน้อยหนึ่งสิทธิ์",
                        })}
                      />
                      <div className="ml-3">
                        <span className="block font-medium text-gray-800">แคชเชียร์</span>
                        <span className="text-xs text-gray-500">จัดการการขายและออกใบเสร็จ</span>
                      </div>
                    </label>
                    <label className="flex items-center p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-400 transition-all cursor-pointer">
                      <input
                        type="checkbox"
                        value="INVENTORY"
                        className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                        {...register("roles")}
                      />
                      <div className="ml-3">
                        <span className="block font-medium text-gray-800">จัดการสต็อก</span>
                        <span className="text-xs text-gray-500">ดูแลสินค้าและสต็อก</span>
                      </div>
                    </label>
                    <label className="flex items-center p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-400 transition-all cursor-pointer">
                      <input
                        type="checkbox"
                        value="ADMIN"
                        className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                        {...register("roles")}
                      />
                      <div className="ml-3">
                        <span className="block font-medium text-gray-800">ผู้ดูแลระบบ</span>
                        <span className="text-xs text-gray-500">สิทธิ์สูงสุดในการจัดการร้าน</span>
                      </div>
                    </label>
                  </div>
                  {errors.roles && (
                    <p className="mt-2 text-sm text-rose-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                      </svg>
                      {errors.roles.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    สถานะ <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center p-4 bg-white rounded-xl border-2 cursor-pointer transition-all duration-300 hover:border-indigo-400">
                      <input
                        type="radio"
                        value="ACTIVE"
                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500"
                        {...register("status", {
                          required: "ต้องเลือกสถานะ",
                        })}
                      />
                      <div className="ml-3">
                        <span className="block font-medium text-gray-800">ใช้งาน</span>
                        <span className="text-xs text-gray-500">พนักงานสามารถเข้าสู่ระบบและทำงานได้</span>
                      </div>
                    </label>
                    <label className="flex items-center p-4 bg-white rounded-xl border-2 cursor-pointer transition-all duration-300 hover:border-indigo-400">
                      <input
                        type="radio"
                        value="INACTIVE"
                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500"
                        {...register("status")}
                      />
                      <div className="ml-3">
                        <span className="block font-medium text-gray-800">ไม่ใช้งาน</span>
                        <span className="text-xs text-gray-500">พนักงานไม่สามารถเข้าสู่ระบบได้</span>
                      </div>
                    </label>
                  </div>
                  {errors.status && (
                    <p className="mt-2 text-sm text-rose-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                      </svg>
                      {errors.status.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate(`/shop/${shopId}/employees`)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-300 flex items-center gap-2"
                disabled={isLoading}
              >
                <svg
                  className="w-5 h-5"
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
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span>{action === "edit" ? "บันทึกการแก้ไข" : "สร้างพนักงาน"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}