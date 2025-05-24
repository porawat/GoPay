import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config/config";

const CustomerList = () => {
  const navigate = useNavigate();
  const { shopId } = useParams();
  const token = localStorage.getItem("token");
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCustomers = async () => {
    if (!token || !shopId) {
      setError("กรุณาล็อกอินเพื่อดูข้อมูลลูกค้า");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    setError(null);

    console.log("Fetching customers from:", `${API_URL}/all/${shopId}`);
    console.log("Token:", token);

    try {
      const response = await axios.get(`${API_URL}/all/${shopId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response:", response.data);

      if (response.data?.code === 1000) {
        setCustomers(response.data?.data || []);
      } else {
        setError(
          "ไม่สามารถดึงข้อมูลลูกค้าได้: " +
            (response.data?.message || "ข้อผิดพลาดไม่ทราบสาเหตุ")
        );
      }
    } catch (error) {
      console.error(
        "Error fetching customers:",
        error.response?.data || error.message
      );
      let errorMessage = "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์";
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "ไม่พบข้อมูลลูกค้า หรือรหัสร้านค้าไม่ถูกต้อง";
        } else if (error.response.status === 401) {
          errorMessage = "เซสชันหมดอายุ กรุณาล็อกอินใหม่";
          navigate("/login");
        } else if (error.response.status === 403) {
          errorMessage = "คุณไม่มีสิทธิ์เข้าถึงร้านค้านี้";
          navigate("/myshop");
        } else {
          errorMessage = error.response.data?.message || error.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveCustomer = async (customerId) => {
    try {
      const response = await axios.post(
        `${API_URL}/approve/${customerId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.code === 1000) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === customerId ? { ...c, status: "APPROVED" } : c
          )
        );
      } else {
        setError(
          "ไม่สามารถอนุมัติลูกค้าได้: " +
            (response.data?.message || "ข้อผิดพลาดไม่ทราบสาเหตุ")
        );
      }
    } catch (error) {
      console.error(
        "Error approving customer:",
        error.response?.data || error.message
      );
      let errorMessage = "เกิดข้อผิดพลาดในการอนุมัติลูกค้า";
      if (error.response?.status === 403) {
        errorMessage = "คุณไม่มีสิทธิ์อนุมัติลูกค้านี้";
        navigate("/myshop");
      }
      setError(errorMessage);
    }
  };

  const handleRejectCustomer = async (customerId) => {
    try {
      const response = await axios.post(
        `${API_URL}/reject/${customerId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.code === 1000) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === customerId
              ? { ...c, status: "REJECTED", is_active: "INACTIVE" }
              : c
          )
        );
      } else {
        setError(
          "ไม่สามารถปฏิเสธลูกค้าได้: " +
            (response.data?.message || "ข้อผิดพลาดไม่ทราบสาเหตุ")
        );
      }
    } catch (error) {
      console.error(
        "Error rejecting customer:",
        error.response?.data || error.message
      );
      let errorMessage = "เกิดข้อผิดพลาดในการปฏิเสธลูกค้า";
      if (error.response?.status === 403) {
        errorMessage = "คุณไม่มีสิทธิ์ปฏิเสธลูกค้านี้";
        navigate("/myshop");
      }
      setError(errorMessage);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [shopId, token, navigate]);

  return (
    <div className="flex-1 p-6 bg-gradient-to-b from-blue-50 to-gray-100 min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <span className="text-blue-600 mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </span>
              รายการลูกค้า
            </h1>
            <p className="mt-1 text-gray-600 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              จัดการสถานะลูกค้าที่ลงทะเบียน
            </p>
          </div>
          <button
            onClick={() => navigate(`/shopmanage/${shopId}`)}
            className="btn-primary flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition-colors"
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
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow-sm flex justify-between items-center border-l-4 border-red-500">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
            <button
              onClick={fetchCustomers}
              className="text-red-700 px-3 py-1 bg-red-200 rounded-md hover:bg-red-300 transition-colors flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
          </div>
        )}

        {isLoading && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-md text-center">
            <div className="flex justify-center items-center">
              <svg
                className="animate-spin h-8 w-8 text-blue-600"
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
            </div>
            <p className="text-gray-600 mt-2">กำลังโหลดข้อมูลลูกค้า...</p>
          </div>
        )}

        {!isLoading && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              รายการลูกค้า
            </h2>
            {customers.length === 0 ? (
              <p className="text-gray-600">ไม่มีข้อมูลลูกค้า</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ชื่อ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        อีเมล
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        เบอร์โทร
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        สถานะ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        การกระทำ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customers.map((customer) => (
                      <tr key={customer.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.name || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {customer.email || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {customer.phone || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              customer.status === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : customer.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {customer.status === "APPROVED"
                              ? "อนุมัติ"
                              : customer.status === "PENDING"
                              ? "รอการอนุมัติ"
                              : "ปฏิเสธ"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {customer.status === "PENDING" && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApproveCustomer(customer.id)}
                                className="text-green-600 hover:text-green-800 flex items-center"
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
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                อนุมัติ
                              </button>
                              <button
                                onClick={() => handleRejectCustomer(customer.id)}
                                className="text-red-600 hover:text-red-800 flex items-center"
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
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                                ปฏิเสธ
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;