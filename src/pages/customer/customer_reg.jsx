import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config/config";
import { Store, User, Phone, Lock, Mail, ArrowLeft } from "lucide-react";
import CoreAPI from "../../store";

const CustomerReg = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();

  console.log("shopId ==> ", shopId);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    email: "",
  });
  const [shopName, setShopName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchShopData = async () => {
      if (!shopId) {
        setError("ไม่พบรหัสร้านค้าใน URL");
        return;
      }
      try {
        setLoading(true);
        const response = await CoreAPI.shopHttpService.getShopById(shopId);
        console.log("response ==> ", response);
        const { datarow, code, message } = response;
        if (code === 1000) {
          setShopName(datarow.shop_name || "ร้านค้า");
        } else {
          setError("ไม่พบร้านค้า: " + (message || "รหัสร้านค้าไม่ถูกต้อง"));
        }
      } catch (error) {
        console.error(
          "Error fetching shop data:",
          error.response?.data || error.message
        );
        let errorMessage = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้";
        if (error.response?.status === 404) {
          errorMessage = "ไม่พบร้านค้าด้วยรหัสนี้";
        } else if (error.response?.status === 401) {
          errorMessage = "ไม่ได้รับอนุญาตให้เข้าถึงข้อมูลร้านค้า";
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchShopData();
  }, [shopId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // ตรวจสอบชื่อ
    if (!formData.name.trim()) {
      setError("กรุณากรอกชื่อ");
      return;
    }

    // ตรวจสอบเบอร์โทร: ต้องเป็นตัวเลข 10 หลัก
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError("เบอร์โทรต้องเป็นตัวเลข 10 หลัก");
      return;
    }

    // ตรวจสอบรหัสผ่าน: ต้องมีอย่างน้อย 6 ตัวอักษร รวมตัวอักษรและตัวเลข
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร รวมตัวอักษรและตัวเลข");
      return;
    }

    // ตรวจสอบรูปแบบอีเมล (ถ้ามี)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }

    const payload = {
      shop_id: shopId,
      name: formData.name,
      phone: formData.phone,
      password: formData.password,
      email: formData.email || null,
      address: null,
    };
    console.log("Sending payload to backend:", payload);

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/customer`, payload);
      console.log("Backend response:", response.data);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate(`/pending-approval/${response.data.data.id}`);
      }, 2000);
    } catch (error) {
      console.error("Error registering customer:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      let errorMessage = "ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = "ไม่พบร้านค้าด้วยรหัสนี้";
      } else if (error.response?.status === 500) {
        errorMessage = "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ กรุณาติดต่อผู้ดูแลระบบ";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !shopName) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return (
    <div className="mx-4 sm:mx-6 lg:mx-8 my-6 bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Store className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            ลงทะเบียนลูกค้า{shopName ? `: ${shopName}` : ""}
          </h1>
        </div>
        {!shopId && (
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              กลับสู่หน้าหลัก
            </Link>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg animate-slide-in">
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg animate-slide-in">
            <p>ลงทะเบียนสำเร็จ! กำลังเปลี่ยนเส้นทาง...</p>
          </div>
        )}
        {!error || shopId ? (
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-500" />
                  ชื่อ *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="กรอกชื่อ-นามสกุล"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-gray-500" />
                  เบอร์โทร *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="กรอกเบอร์โทร (10 หลัก)"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-gray-500" />
                  รหัสผ่าน *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="กรอกรหัสผ่าน (6 ตัวอักษรขึ้นไป รวมตัวอักษรและตัวเลข)"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-gray-500" />
                  อีเมล
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="กรอกอีเมล (ถ้ามี)"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
                      กำลังลงทะเบียน...
                    </div>
                  ) : (
                    "ลงทะเบียน"
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CustomerReg;