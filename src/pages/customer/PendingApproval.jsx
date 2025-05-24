import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config/config";
import { Clock, AlertCircle } from "lucide-react";

const PendingApproval = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("PENDING");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axios.get(`${API_URL}/customer/${customerId}`);
        const customerStatus = response.data.data.status;
        setStatus(customerStatus);
        setLoading(false);
        if (customerStatus === "APPROVED") {
          setTimeout(() => navigate("/login"), 2000);
        } else if (customerStatus === "REJECTED") {
          setError("การลงทะเบียนของคุณถูกปฏิเสธ กรุณาติดต่อเจ้าของร้าน");
        }
      } catch (err) {
        console.error("Error checking customer status:", err);
        setError("ไม่สามารถตรวจสอบสถานะได้ กรุณาลองใหม่");
        setLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Polling ทุก 5 วินาที
    return () => clearInterval(interval);
  }, [customerId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="mx-4 sm:mx-6 lg:mx-8 my-6 bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-6 border border-gray-100 text-center">
        <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          รอการอนุมัติจากเจ้าของร้าน
        </h1>
        <p className="text-gray-600 mb-6">
          การลงทะเบียนของคุณอยู่ในระหว่างการตรวจสอบ กรุณารอการยอมรับจากเจ้าของร้าน
          {status === "APPROVED" && (
            <span className="text-green-600"> อนุมัติแล้ว! กำลังเปลี่ยนเส้นทางไปยังหน้า login...</span>
          )}
        </p>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
            <p>{error}</p>
          </div>
        )}
        {status === "PENDING" && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingApproval;