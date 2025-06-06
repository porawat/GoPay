import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { API_URL } from "../../config/config";

// Animation Variants
const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const CustomerProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const customerId = localStorage.getItem("customerId");

    if (!token || !customerId) {
      console.log("Missing token or customerId, redirecting to /customer/login");
      navigate("/customer/login");
      return;
    }

    // ดึงข้อมูลลูกค้า
    axios
      .get(`${API_URL}/customer/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("Customer profile response:", response.data);
        if (response.data?.code === 1000) {
          setProfile(response.data.data);
          setLoading(false);
        } else {
          throw new Error(response.data?.message || "Failed to fetch profile");
        }
      })
      .catch((err) => {
        console.error("Profile fetch error:", err);
        setError(err.response?.data?.message || "ไม่สามารถโหลดโปรไฟล์ได้");
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.log("Unauthorized or Forbidden, removing token and customerId");
          localStorage.removeItem("token");
          localStorage.removeItem("customerId");
          localStorage.removeItem("role");
          localStorage.removeItem("username");
          navigate("/customer/login");
        }
        setLoading(false);
      });
  }, [navigate]);

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-50 to-purple-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"
        ></motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              โปรไฟล์
            </h1>
            <p className="mt-2 text-gray-600">จัดการข้อมูลส่วนตัวของคุณ</p>
          </div>
          <Link
            to="/customer/profile/edit"
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            แก้ไขโปรไฟล์
          </Link>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </motion.div>
        )}

        {/* Profile Card */}
        <motion.div
          className="bg-white rounded-lg shadow-lg overflow-hidden"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header Section with Avatar */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 flex items-center">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mr-4">
              <svg
                className="w-10 h-10 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                {profile.name || "ลูกค้า"}
              </h3>
              <p className="text-indigo-100">ลูกค้า</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              ข้อมูลลูกค้า
            </h4>
            <div className="space-y-4">
              <div className="flex items-center border-b border-gray-200 pb-4">
                <div className="w-1/3 text-sm font-medium text-gray-500">
                  ชื่อ
                </div>
                <div className="w-2/3 text-sm text-gray-900">
                  {profile.name || "ไม่ระบุ"}
                </div>
              </div>
              <div className="flex items-center border-b border-gray-200 pb-4">
                <div className="w-1/3 text-sm font-medium text-gray-500">
                  เบอร์โทร
                </div>
                <div className="w-2/3 text-sm text-gray-900">
                  {profile.phone || "ไม่ระบุ"}
                </div>
              </div>
              <div className="flex items-center border-b border-gray-200 pb-4">
                <div className="w-1/3 text-sm font-medium text-gray-500">
                  อีเมล
                </div>
                <div className="w-2/3 text-sm text-gray-900">
                  {profile.email || "ไม่ระบุ"}
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-1/3 text-sm font-medium text-gray-500">
                  วันที่สมัคร
                </div>
                <div className="w-2/3 text-sm text-gray-900">
                  {profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "ไม่ระบุ"}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Additional Actions */}
        <motion.div
          className="mt-6 flex space-x-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Link
            to="/customer/change-password"
            className="flex items-center px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11c0-1.104-.896-2-2-2s-2 .896-2 2v1H7v4h6v-4h-1v-1zm-2-3a3 3 0 013 3v1h1a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4a2 2 0 012-2h1v-1a3 3 0 013-3zm0-4a7 7 0 00-7 7v4a7 7 0 0014 0v-4a7 7 0 00-7-7z"
              />
            </svg>
            เปลี่ยนรหัสผ่าน
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerProfile;