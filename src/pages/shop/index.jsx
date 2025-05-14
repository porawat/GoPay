import react, { useState, useEffect } from "react";
import { API_URL } from "../../config/config"; // Removed unused TOKEN
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CoreAPI from "../../store";

const ShopPage = () => {
  const navigate = useNavigate();
  console.log(API_URL);
  const token = localStorage.getItem("token");
  console.log(token);
  const [myshop, setMyshop] = useState([]);
  const getmyshop = async () => {
    try {
      const response = await CoreAPI.shopHttpService.getmyshop({});
      console.log(response);

      if (response?.code === 1000) {
        setMyshop(response?.datarow);
      }
    } catch (error) {}
  };
  const gotomyshop = (item) => {
    console.log(item);
    navigate(`/shopedit/${item.id}`);
  };
  const createshop = () => {
    navigate("/shopcreate");
  };
  useEffect(() => {
    getmyshop();
  }, []);

  return (
    <>
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">ร้านค้าของคุณ</h1>
            <p className="mt-2 text-gray-600">
              {"ยินดีต้อนรับสู่แดชบอร์ดของคุณ"}
            </p>
          </div>
          {myshop.length > 0 ? (
            myshop.map((item, index) => {
              return (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8 cursor-pointer"
                  onClick={() => gotomyshop(item)}
                >
                  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-green-100">
                        <svg
                          className="w-6 h-6 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600"></p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {item.shop_name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <>create</>
          )}

          <div
            key="create"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8 cursor-pointer"
            onClick={() => createshop()}
          >
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-pink-100">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600"></p>
                  <p className="text-2xl font-semibold text-gray-900">
                    สร้างร้านของคุณ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default ShopPage;
