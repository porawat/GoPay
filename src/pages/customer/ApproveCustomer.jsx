import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config/config";
import { Store, Check, X } from "lucide-react";

const ApproveCustomer = () => {
  const { shopId } = useParams();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shopName, setShopName] = useState("");

  useEffect(() => {
    const fetchPendingCustomers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/customer/pending/${shopId}`);
        setCustomers(response.data.data);
        setShopName(response.data.data[0]?.shop_id || "ร้านค้า");
      } catch (err) {
        console.error("Error fetching pending customers:", err);
        setError("ไม่สามารถดึงข้อมูลลูกค้าที่รอการอนุมัติได้");
      } finally {
        setLoading(false);
      }
    };
    fetchPendingCustomers();
  }, [shopId]);

  const handleApprove = async (customerId) => {
    try {
      await axios.post(`${API_URL}/customer/approve/${customerId}`);
      setCustomers(customers.filter((c) => c.id !== customerId));
    } catch (err) {
      console.error("Error approving customer:", err);
      setError("ไม่สามารถอนุมัติลูกค้าได้");
    }
  };

  const handleReject = async (customerId) => {
    try {
      await axios.post(`${API_URL}/customer/reject/${customerId}`);
      setCustomers(customers.filter((c) => c.id !== customerId));
    } catch (err) {
      console.error("Error rejecting customer:", err);
      setError("ไม่สามารถปฏิเสธลูกค้าได้");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="mx-4 sm:mx-6 lg:mx-8 my-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Store className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            อนุมัติลูกค้า{shopName ? `: ${shopName}` : ""}
          </h1>
        </div>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
            <p>{error}</p>
          </div>
        )}
        {customers.length === 0 ? (
          <p className="text-gray-600 text-center">ไม่มีลูกค้าที่รอการอนุมัติ</p>
        ) : (
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">ชื่อ</th>
                  <th className="px-4 py-2 text-left">เบอร์โทร</th>
                  <th className="px-4 py-2 text-left">อีเมล</th>
                  <th className="px-4 py-2 text-left">วันที่สมัคร</th>
                  <th className="px-4 py-2 text-center">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b">
                    <td className="px-4 py-2">{customer.name}</td>
                    <td className="px-4 py-2">{customer.phone}</td>
                    <td className="px-4 py-2">{customer.email || "-"}</td>
                    <td className="px-4 py-2">
                      {new Date(customer.created_at).toLocaleDateString("th-TH")}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleApprove(customer.id)}
                        className="mr-2 px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                      >
                        <Check className="inline h-5 w-5" /> ยอมรับ
                      </button>
                      <button
                        onClick={() => handleReject(customer.id)}
                        className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                      >
                        <X className="inline h-5 w-5" /> ปฏิเสธ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApproveCustomer;