import { useState, useEffect } from "react";
import { API_URL } from "../../config/config";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ImageAvatar from "../../components/Avatar/ImageAvatar";
import ImageCover from "../../components/Avatar/coverImages";

const ShopPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");
  const [myshop, setMyshop] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getmyshop = async () => {
    if (!token || !userId) {
      setError("กรุณาล็อกอินเพื่อดูร้านค้าของคุณ");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL}/shop/getmyshop`,
        { user_id: userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("API Response:", response.data);
      if (response.data?.code === 1000) {
        setMyshop(response.data?.datarow || []);
      } else {
        setError(
          "ไม่สามารถดึงข้อมูลร้านค้าได้: " +
            (response.data?.message || "ข้อผิดพลาดไม่ทราบสาเหตุ")
        );
      }
    } catch (error) {
      console.error(
        "Error fetching shops:",
        error.response?.data || error.message
      );
      const errorMessage =
        error.response?.status === 401
          ? "เซสชันหมดอายุ กรุณาล็อกอินใหม่"
          : "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์: " +
            (error.response?.data?.message || error.message);
      setError(errorMessage);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createshop = () => {
    navigate("/shopcreate");
  };

  const gotomyshop = (item) => {
    console.log("Navigating to shop manage:", item);
    navigate(`/shopmanage/${item.id}`);
  };

  useEffect(() => {
    getmyshop();
  }, []);

  return (
    <div className="flex-1 p-6 bg-gray-100 min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ร้านค้าของคุณ</h1>
            <p className="mt-2 text-gray-600">ยินดีต้อนรับสู่แดชบอร์ดของคุณ</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={createshop}
              className="btn-primary flex items-center px-4 py-2"
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              {myshop.length > 0 ? "เพิ่มร้าน" : "สร้างร้านของคุณ"}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => getmyshop()}
              className="text-red-700 underline"
            >
              ลองใหม่
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md text-center">
            <p className="text-gray-600">กำลังโหลดข้อมูลร้านค้า...</p>
          </div>
        )}

        {/* Shop List */}
        {!isLoading && myshop.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {myshop.map((item, index) => (
              <div
                key={item.id || index}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => gotomyshop(item)}
              >
                <div className="flex flex-col items-center">
                  {/* Cover Image */}
                  {item.cover ? (
                    <ImageCover
                      name={`${item.shop_name} cover`}
                      url={`${API_URL}/files/uploads/${item.cover}`}
                    />
                  ) : (
                    // <img
                    //   src={`${API_URL}/files/uploads/${item.cover}`}
                    //   alt={`${item.shop_name} cover`}
                    //   className="w-full h-32 object-cover rounded-t-lg mb-4"
                    // />
                    <div className="w-full h-32 bg-gray-200 rounded-t-lg mb-4 flex items-center justify-center">
                      <span className="text-gray-500">ไม่มีภาพปก</span>
                    </div>
                  )}

                  {/* Avatar Image */}
                  <div className="relative -mt-12">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white">
                      {item.avatar ? (
                        <ImageAvatar
                          name={`${item.shop_name} avatar`}
                          url={`${API_URL}/files/uploads/${item.avatar}`}
                        />
                      ) : (
                        // <img
                        //   src={`${API_URL}/files/uploads/${item.avatar}`}
                        //   alt={`${item.shop_name} avatar`}
                        //   className="w-full h-full object-cover"
                        // />
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">
                            ไม่มีรูป
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shop Name */}
                  <div className="mt-4 text-center">
                    <p className="text-xl font-semibold text-gray-900">
                      {item.shop_name || "Unnamed Shop"}
                    </p>
                  </div>

                  {/* Shop Metrics */}
                  <div className="mt-4 w-full space-y-3 text-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <span>จำนวนลูกค้า</span>
                      </div>
                      <span className="font-medium">
                        {item.customer_count || "0"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        <span>จำนวนพนักงาน</span>
                      </div>
                      <span className="font-medium">
                        {item.employee_count || "0"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                        <span>สินค้าต้องสั่งเพิ่ม</span>
                      </div>
                      <span className="font-medium">
                        {item.products_to_reorder || "0"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md text-center">
              <p className="text-gray-600">
                คุณยังไม่มีร้านค้า เริ่มสร้างร้านค้าของคุณได้เลย!
              </p>
              <button
                onClick={createshop}
                className="mt-4 btn-primary px-4 py-2"
              >
                สร้างร้านค้า
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ShopPage;
