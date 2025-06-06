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

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const customerId = localStorage.getItem("customerId");

    if (!token || !customerId) {
      console.log("Missing token or customerId, redirecting to /customer/login");
      navigate("/customer/login");
      return;
    }

    // ดึงข้อมูลลูกค้า
    const fetchCustomerData = async () => {
      try {
        const response = await axios.get(`${API_URL}/customer/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data?.code === 1000) {
          setCustomerData(response.data.data);
          setLoading(false);
        } else {
          throw new Error(response.data?.message || "Failed to fetch customer data");
        }
      } catch (error) {
        console.error("Error fetching customer data:", error.response?.data || error.message);
        setError("ไม่สามารถดึงข้อมูลลูกค้าได้ กรุณาลองใหม่");
        localStorage.removeItem("token");
        localStorage.removeItem("customerId");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        navigate("/customer/login");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-50 to-purple-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-indigo-600 text-lg"
        >
          กำลังโหลด...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-50 to-purple-50">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 text-red-600 p-6 rounded-lg shadow-xl max-w-md"
        >
          <p>{error}</p>
          <Link
            to="/customer/login"
            className="mt-4 inline-block text-indigo-600 hover:text-indigo-800"
          >
            กลับไปล็อกอิน
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-indigo-50 to-purple-50">
      <div className="flex-1 p-8">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            ยินดีต้อนรับ, {customerData?.name || "ลูกค้า"}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              className="bg-white p-6 rounded-lg shadow-xl border border-indigo-100"
              whileHover={{ scale: 1.02 }}
            >
              <h2 className="text-xl font-semibold text-gray-700 mb-4">ข้อมูลโปรไฟล์</h2>
              <p className="text-gray-600">ชื่อ: {customerData?.name || "ไม่ระบุ"}</p>
              <p className="text-gray-600">เบอร์โทร: {customerData?.phone || "ไม่ระบุ"}</p>
              <p className="text-gray-600">อีเมล: {customerData?.email || "ไม่มี"}</p>
              <Link
                to="/customer/profile"
                className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                แก้ไขโปรไฟล์
              </Link>
            </motion.div>
            <motion.div
              className="bg-white p-6 rounded-lg shadow-xl border border-indigo-100"
              whileHover={{ scale: 1.02 }}
            >
              <h2 className="text-xl font-semibold text-gray-700 mb-4">คำสั่งซื้อล่าสุด</h2>
              <p className="text-gray-600">ยังไม่มีคำสั่งซื้อ</p>
              <Link
                to="/customer/orders"
                className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                ดูคำสั่งซื้อทั้งหมด
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerDashboard;