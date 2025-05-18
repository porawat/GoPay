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
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 px-6 py-4 rounded-t-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {action === "edit" ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มพนักงานใหม่"}
          </h2>
          <p className="text-indigo-100 mt-1 text-sm">
            กรอกข้อมูลให้ครบถ้วนในช่องที่มีเครื่องหมาย{" "}
            <span className="text-red-300">*</span>
          </p>
        </div>

        <div className="p-6">
          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg flex items-center">
              <svg
                className="h-5 w-5 text-green-500 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {submitSuccess}
            </div>
          )}
          {submitError && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg flex items-center">
              <svg
                className="h-5 w-5 text-red-500 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
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
                    className={`w-full pl-10 p-3 rounded-lg border ${
                      errors.first_name
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
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
                  <p className="mt-1 text-sm text-red-600">
                    {errors.first_name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  นามสกุล <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
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
                    className={`w-full pl-10 p-3 rounded-lg border ${
                      errors.last_name
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
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
                  <p className="mt-1 text-sm text-red-600">
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                อีเมล <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
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
                  className={`w-full pl-10 p-3 rounded-lg border ${
                    errors.email
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
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
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {action === "create" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
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
                    className={`w-full pl-10 p-3 rounded-lg border ${
                      errors.password
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
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
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เบอร์โทร
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  placeholder="เบอร์โทร"
                  className={`w-full pl-10 p-3 rounded-lg border ${
                    errors.phone
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
                  {...register("phone", {
                    pattern: {
                      value: /^[0-9-+\s()]*$/,
                      message: "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง",
                    },
                  })}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                สิทธิ์ <span className="text-red-500">*</span>
              </label>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                <label className="flex items-center p-2 rounded hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    value="CASHIER"
                    className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                    {...register("roles", {
                      required: "ต้องเลือกอย่างน้อยหนึ่งสิทธิ์",
                    })}
                  />
                  <span className="ml-2 text-gray-700">
                    <span className="font-medium">แคชเชียร์</span>
                    <span className="text-xs block text-gray-500">
                      จัดการการขายและออกใบเสร็จ
                    </span>
                  </span>
                </label>
                <label className="flex items-center p-2 rounded hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    value="INVENTORY"
                    className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                    {...register("roles")}
                  />
                  <span className="ml-2 text-gray-700">
                    <span className="font-medium">จัดการสต็อก</span>
                    <span className="text-xs block text-gray-500">
                      ดูแลสินค้าและสต็อก
                    </span>
                  </span>
                </label>
                <label className="flex items-center p-2 rounded hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    value="ADMIN"
                    className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                    {...register("roles")}
                  />
                  <span className="ml-2 text-gray-700">
                    <span className="font-medium">ผู้ดูแลระบบ</span>
                    <span className="text-xs block text-gray-500">
                      สิทธิ์สูงสุดในการจัดการร้าน
                    </span>
                  </span>
                </label>
              </div>
              {errors.roles && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.roles.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                สถานะ <span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full p-3 rounded-lg border ${
                  errors.status ? "border-red-500 bg-red-50" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
                {...register("status", { required: "ต้องเลือกสถานะ" })}
              >
                <option value="ACTIVE">ใช้งาน</option>
                <option value="INACTIVE">ไม่ใช้งาน</option>
                <option value="SUSPENDED">ระงับ</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.status.message}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(`/shop/${shopId}/employees`)}
                className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                <svg
                  className="mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                    กำลังดำเนินการ...
                  </>
                ) : (
                  <>
                    <svg
                      className="mr-2 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {action === "edit" ? "บันทึกการแก้ไข" : "เพิ่มพนักงาน"}
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
