import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { QRCodeCanvas as QRCode } from "qrcode.react";
import { API_URL } from "../../config/config";
import { Clock, MapPin, Mail, MessageSquare, Globe, DollarSign, Sun, Moon, Download, Store, Phone, User } from "lucide-react";

const ShopConfig = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const qrRef = useRef(null);
  const [shopConfig, setShopConfig] = useState({
    address: "",
    latitude: "",
    longitude: "",
    open_time: "",
    close_time: "",
    is_active: "ACTIVE",
    notification_email: 1,
    notification_sms: 0,
    language: "TH",
    currency: "THB",
    theme: "light",
    qr_code: "",
  });
  const [shopDetails, setShopDetails] = useState({
    shop_name: "",
    email: "",
    contact_name: "",
    shop_tel: "",
    avatar: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const fetchData = async () => {
    if (!localStorage.getItem("token") || !shopId) {
      setError("กรุณาล็อกอินเพื่อดูข้อมูลร้านค้า");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      console.log("Calling API:", `${API_URL}/shop/${shopId}`);
      console.log("Token:", localStorage.getItem("token"));

      const response = await axios.get(`${API_URL}/shop/${shopId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.data?.code === 1000) {
        setShopConfig(response.data.datarow?.config || {});
        setShopDetails(response.data.datarow || {});
      } else {
        setError(
          "ไม่สามารถดึงข้อมูลร้านค้าได้: " +
            (response.data?.message || "ข้อผิดพลาดไม่ทราบสาเหตุ")
        );
      }
    } catch (error) {
      console.error("Error fetching shop data:", error.response?.data || error.message);
      let errorMessage = "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์";
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "ไม่พบร้านค้า อาจเนื่องจากรหัสร้านค้าไม่ถูกต้อง";
        } else if (error.response.status === 401) {
          errorMessage = "เซสชันหมดอายุ กรุณาล็อกอินใหม่";
          navigate("/login");
        } else {
          errorMessage = error.response.data?.message || error.message;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [shopId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShopConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await axios.put(`${API_URL}/shop/${shopId}/config`, shopConfig, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      let errorMessage = "ไม่สามารถบันทึกการตั้งค่าได้";
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = "ข้อมูลที่ส่งไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
        } else if (error.response.status === 401) {
          errorMessage = "เซสชันหมดอายุ กรุณาล็อกอินใหม่";
          navigate("/login");
        } else {
          errorMessage = error.response.data?.message || error.message;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    const canvas = qrRef.current.querySelector("canvas");
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `qr_code_${shopId}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const qrCodeUrl = `http://localhost:5173/join?shop_id=${shopId}`;

  if (loading && !shopConfig.address && !shopDetails.shop_name) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-4 sm:mx-6 lg:mx-8 my-6 bg-gray-0">
      {/* Header */}
      <div className="lg:col-span-2 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Store className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">ตั้งค่าร้านค้า: {shopDetails.shop_name || "ร้านค้า"}</h1>
        </div>
        <span
          className={`px-4 py-1.5 text-sm font-semibold rounded-full ${
            shopConfig.is_active === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {shopConfig.is_active === "ACTIVE" ? "เปิดให้บริการ" : "ปิดให้บริการ"}
        </span>
      </div>

      {/* Notifications */}
      {error && (
        <div className="lg:col-span-2 mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg animate-slide-in flex justify-between items-center">
          <p>{error}</p>
          <button
            onClick={fetchData}
            className="px-3 py-1 bg-red-200 text-red-700 rounded-md hover:bg-red-300 transition"
          >
            ลองใหม่
          </button>
        </div>
      )}
      {success && (
        <div className="lg:col-span-2 mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg animate-slide-in">
          <p>บันทึกการตั้งค่าร้านค้าสำเร็จ</p>
        </div>
      )}

      {/* Shop Details and QR Code */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        {/* Shop Details Card */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Store className="h-5 w-5 text-blue-600" />
            ข้อมูลร้านค้า
          </h2>
          <div className="space-y-4">
            {shopDetails.avatar && (
              <div className="flex justify-center">
                <img
                  src={`${API_URL}/files/uploads/${shopDetails.avatar}`}
                  alt={`${shopDetails.shop_name} avatar`}
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-600 flex items-center gap-2">
                <Store className="h-4 w-4 text-gray-500" />
                ชื่อร้านค้า
              </label>
              <p className="text-lg font-semibold text-gray-900">{shopDetails.shop_name || "ไม่มีชื่อ"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                อีเมล
              </label>
              <p className="text-gray-700">{shopDetails.email || "ไม่มีอีเมล"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                เบอร์โทร
              </label>
              <p className="text-gray-700">{shopDetails.shop_tel || "ไม่มีเบอร์โทร"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                ผู้ติดต่อ
              </label>
              <p className="text-gray-700">{shopDetails.contact_name || "ไม่มีผู้ติดต่อ"}</p>
            </div>
          </div>
        </div>

        {/* QR Code Card */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Store className="h-5 w-5 text-blue-600" />
            QR Code สำหรับลูกค้า
          </h2>
          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg mb-4">
            <div ref={qrRef} className="mb-4 p-2 bg-white rounded-lg shadow-sm">
              <QRCode value={qrCodeUrl} size={150} />
            </div>
            <p className="text-sm text-gray-600 text-center mb-4">
              ลูกค้าสามารถสแกน QR Code นี้เพื่อเข้าร่วมร้านค้าของคุณ
            </p>
            <button
              onClick={downloadQRCode}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <Download className="h-5 w-5 mr-2 text-gray-500" />
              ดาวน์โหลด QR Code
            </button>
          </div>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <span className="font-medium">URL:</span> {qrCodeUrl}
            </p>
            <p>
              <span className="font-medium">Shop ID:</span> {shopId}
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="lg:col-span-1">
        <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">การตั้งค่าทั่วไป</h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Address and Coordinates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  ที่อยู่
                </label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  value={shopConfig.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="กรอกที่อยู่ร้านค้า"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ละติจูด</label>
                  <input
                    type="number"
                    name="latitude"
                    value={shopConfig.latitude}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="ละติจูด"
                    step="any"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ลองจิจูด</label>
                  <input
                    type="number"
                    name="longitude"
                    value={shopConfig.longitude}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="ลองจิจูด"
                    step="any"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Open/Close Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  เวลาเปิด
                </label>
                <input
                  type="time"
                  name="open_time"
                  value={shopConfig.open_time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  เวลาปิด
                </label>
                <input
                  type="time"
                  name="close_time"
                  value={shopConfig.close_time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            {/* Shop Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">สถานะร้านค้า</label>
              <select
                name="is_active"
                value={shopConfig.is_active}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="ACTIVE">เปิดให้บริการ</option>
                <option value="INACTIVE">ปิดให้บริการ</option>
              </select>
            </div>

            {/* Notifications */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">การแจ้งเตือน</h3>
              <div className="flex gap-6">
                <div className="flex items-center">
                  <input
                    id="notification_email"
                    type="checkbox"
                    name="notification_email"
                    checked={shopConfig.notification_email === 1}
                    onChange={(e) =>
                      setShopConfig((prev) => ({
                        ...prev,
                        notification_email: e.target.checked ? 1 : 0,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="notification_email" className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                    <Mail className="h-5 w-5 text-gray-500" />
                    แจ้งเตือนทางอีเมล
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="notification_sms"
                    type="checkbox"
                    name="notification_sms"
                    checked={shopConfig.notification_sms === 1}
                    onChange={(e) =>
                      setShopConfig((prev) => ({
                        ...prev,
                        notification_sms: e.target.checked ? 1 : 0,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="notification_sms" className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                    <MessageSquare className="h-5 w-5 text-gray-500" />
                    แจ้งเตือนทาง SMS
                  </label>
                </div>
              </div>
            </div>

            {/* Other Settings */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">การตั้งค่าอื่นๆ</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-gray-500" />
                    ภาษา
                  </label>
                  <select
                    name="language"
                    value={shopConfig.language}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="TH">ไทย</option>
                    <option value="EN">อังกฤษ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                    สกุลเงิน
                  </label>
                  <select
                    name="currency"
                    value={shopConfig.currency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="THB">บาท (THB)</option>
                    <option value="USD">ดอลลาร์ (USD)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    {shopConfig.theme === "light" ? (
                      <Sun className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Moon className="h-5 w-5 text-gray-500" />
                    )}
                    ธีม
                  </label>
                  <select
                    name="theme"
                    value={shopConfig.theme}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="light">สว่าง</option>
                    <option value="dark">มืด</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
                    กำลังบันทึก...
                  </div>
                ) : (
                  "บันทึกการตั้งค่า"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShopConfig;