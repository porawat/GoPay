import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { QRCodeCanvas as QRCode } from "qrcode.react";
import { API_URL, DOMAIN_URL } from "../../config/config";
import {
  Clock,
  MapPin,
  Mail,
  MessageSquare,
  Globe,
  DollarSign,
  Sun,
  Moon,
  Download,
  Store,
  Phone,
  User,
  Calendar,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  X,
  Bell,
  Settings,
  AlertCircle,
} from "lucide-react";

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
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    const canvas = qrRef.current.querySelector("canvas");
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `qr_code_${shopId}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const qrCodeUrl = `${DOMAIN_URL}/join/${shopId}`;

  if (loading && !shopConfig.address && !shopDetails.shop_name) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center justify-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">
            กำลังโหลดข้อมูลร้านค้า...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-indigo-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-xl shadow-md">
                <Store className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {shopDetails.shop_name || "ร้านค้า"}
                </h1>
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    {shopConfig.open_time && shopConfig.close_time
                      ? `เปิดทำการเวลา ${shopConfig.open_time} - ${shopConfig.close_time} น.`
                      : "ยังไม่ได้ตั้งค่าเวลาทำการ"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm flex items-center gap-2 ${
                  shopConfig.is_active === "ACTIVE"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                {shopConfig.is_active === "ACTIVE" ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    เปิดให้บริการ
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5" />
                    ปิดให้บริการ
                  </>
                )}
              </span>
              <div className="hidden sm:flex items-center gap-1 text-gray-500 bg-gray-100 px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                <Store className="h-4 w-4" />
                <span className="font-medium">ID: {shopId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-8 animate-slide-in">
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-5 rounded-xl shadow-md flex justify-between items-center">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <p className="font-medium">{error}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setError(null)}
                  className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <X className="h-5 w-5" />
                </button>
                <button
                  onClick={fetchData}
                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  ลองใหม่
                </button>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-8 animate-slide-in">
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-5 rounded-xl shadow-md flex justify-between items-center">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <p className="font-medium">บันทึกการตั้งค่าร้านค้าสำเร็จ</p>
              </div>
              <button
                onClick={() => setSuccess(false)}
                className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Shop Details and QR Code */}
          <div className="lg:col-span-1 space-y-8">
            {/* Shop Details Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-indigo-100 transition hover:shadow-xl">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  ข้อมูลร้านค้า
                </h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col items-center mb-6">
                  {shopDetails.avatar ? (
                    <div className="mb-4 relative">
                      <img
                        src={`${API_URL}/files/uploads/${shopDetails.avatar}`}
                        alt={`${shopDetails.shop_name} avatar`}
                        className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                      <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1.5 border-2 border-white">
                        <Store className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-6 shadow-lg">
                      <Store className="h-16 w-16 text-white" />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900">
                    {shopDetails.shop_name || "ไม่มีชื่อ"}
                  </h3>
                </div>

                <div className="space-y-5">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">อีเมล</p>
                      <p className="text-gray-800 font-medium">
                        {shopDetails.email || "ไม่มีอีเมล"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <Phone className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        เบอร์โทร
                      </p>
                      <p className="text-gray-800 font-medium">
                        {shopDetails.shop_tel || "ไม่มีเบอร์โทร"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <User className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        ผู้ติดต่อ
                      </p>
                      <p className="text-gray-800 font-medium">
                        {shopDetails.contact_name || "ไม่มีผู้ติดต่อ"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <MapPin className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        ที่อยู่
                      </p>
                      <p className="text-gray-800 font-medium">
                        {shopConfig.address || "ไม่มีที่อยู่"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-indigo-100 transition hover:shadow-xl">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <QRCode className="h-5 w-5" />
                  QR Code สำหรับลูกค้า
                </h2>
              </div>
              <div className="p-6">
                <div className="bg-gradient-to-b from-indigo-50 to-purple-50 rounded-xl p-6 flex flex-col items-center justify-center mb-5">
                  <div
                    ref={qrRef}
                    className="mb-4 p-3 bg-white rounded-lg shadow-md border-2 border-indigo-100"
                  >
                    <QRCode
                      value={qrCodeUrl}
                      size={180}
                      fgColor="#4f46e5"
                      bgColor="#ffffff"
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center mb-5 px-4 leading-relaxed">
                    ลูกค้าสามารถสแกน QR Code
                    นี้เพื่อเข้าร่วมร้านค้าของคุณได้อย่างรวดเร็ว
                  </p>
                  <button
                    onClick={downloadQRCode}
                    className="inline-flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-md transition"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    ดาวน์โหลด QR Code
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-semibold text-gray-700">
                      URL:
                    </span>
                    <span className="text-sm text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md border border-indigo-100 font-mono">
                      {qrCodeUrl}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-semibold text-gray-700">
                      Shop ID:
                    </span>
                    <span className="text-sm text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md border border-indigo-100 font-mono">
                      {shopId}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Configuration Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden transition hover:shadow-xl">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-5 text-white">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Settings className="h-6 w-6" />
                  การตั้งค่าร้านค้า
                </h2>
                <p className="mt-1 text-blue-100">
                  ปรับแต่งการทำงานและลักษณะการแสดงผลของร้านค้า
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-8">
                {/* Address and Coordinates */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-5 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    ข้อมูลตำแหน่งร้านค้า
                  </h3>

                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-indigo-500" />
                          ที่อยู่
                        </label>
                        <input
                          id="address"
                          type="text"
                          name="address"
                          value={shopConfig.address}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition"
                          placeholder="กรอกที่อยู่ร้านค้า"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <span className="h-5 w-5 bg-blue-100 text-blue-700 rounded flex items-center justify-center font-semibold text-xs">
                            LAT
                          </span>
                          ละติจูด
                        </label>
                        <input
                          type="number"
                          name="latitude"
                          value={shopConfig.latitude}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition"
                          placeholder="ละติจูด"
                          step="any"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <span className="h-5 w-5 bg-indigo-100 text-indigo-700 rounded flex items-center justify-center font-semibold text-xs">
                            LNG
                          </span>
                          ลองจิจูด
                        </label>
                        <input
                          type="number"
                          name="longitude"
                          value={shopConfig.longitude}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition"
                          placeholder="ลองจิจูด"
                          step="any"
                          required
                        />
                      </div>
                      <div className="lg:col-span-3 border-t border-gray-200 pt-4 mt-2">
                        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-start gap-2">
                          <div className="text-blue-600 mt-0.5">
                            <AlertTriangle className="h-5 w-5" />
                          </div>
                          <div>
                            คุณสามารถดึงพิกัดจาก Google Maps
                            เพื่อความแม่นยำในการแสดงตำแหน่งร้านค้าบนแผนที่
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-5 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    เวลาทำการ
                  </h3>

                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Sun className="h-5 w-5 text-amber-500" />
                          เวลาเปิด
                        </label>
                        <input
                          type="time"
                          name="open_time"
                          value={shopConfig.open_time}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Moon className="h-5 w-5 text-indigo-500" />
                          เวลาปิด
                        </label>
                        <input
                          type="time"
                          name="close_time"
                          value={shopConfig.close_time}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shop Status */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-5 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    สถานะร้านค้า
                  </h3>

                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          เลือกสถานะการให้บริการ
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div
                            className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-center gap-3 ${
                              shopConfig.is_active === "ACTIVE"
                                ? "bg-green-50 border-green-500 shadow-md"
                                : "bg-white border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() =>
                              setShopConfig((prev) => ({
                                ...prev,
                                is_active: "ACTIVE",
                              }))
                            }
                          >
                            <div
                              className={`h-6 w-6 rounded-full flex items-center justify-center ${
                                shopConfig.is_active === "ACTIVE"
                                  ? "bg-green-500"
                                  : "bg-gray-200"
                              }`}
                            >
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                เปิดให้บริการ
                              </p>
                              <p className="text-sm text-gray-600">
                                ลูกค้าสามารถดูร้านค้าและสั่งซื้อสินค้าได้
                              </p>
                            </div>
                          </div>

                          <div
                            className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-center gap-3 ${
                              shopConfig.is_active === "INACTIVE"
                                ? "bg-red-50 border-red-500 shadow-md"
                                : "bg-white border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() =>
                              setShopConfig((prev) => ({
                                ...prev,
                                is_active: "INACTIVE",
                              }))
                            }
                          >
                            <div
                              className={`h-6 w-6 rounded-full flex items-center justify-center ${
                                shopConfig.is_active === "INACTIVE"
                                  ? "bg-red-500"
                                  : "bg-gray-200"
                              }`}
                            >
                              <X className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                ปิดให้บริการ
                              </p>
                              <p className="text-sm text-gray-600">
                                ลูกค้าไม่สามารถสั่งซื้อสินค้าได้
                              </p>
                            </div>
                          </div>
                        </div>
                        <input
                          type="hidden"
                          name="is_active"
                          value={shopConfig.is_active}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-5 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    การแจ้งเตือน
                  </h3>

                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="space-y-5">
                      <p className="text-sm text-gray-600 mb-4">
                        เลือกช่องทางที่คุณต้องการรับการแจ้งเตือนเมื่อมีการสั่งซื้อสินค้าใหม่
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div
                          className={`p-4 rounded-xl border-2 flex-1 cursor-pointer flex items-center gap-3 transition ${
                            shopConfig.notification_email === 1
                              ? "bg-blue-50 border-blue-500 shadow-md"
                              : "bg-white border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() =>
                            setShopConfig((prev) => ({
                              ...prev,
                              notification_email:
                                prev.notification_email === 1 ? 0 : 1,
                            }))
                          }
                        >
                          <div
                            className={`h-6 w-6 rounded-full flex items-center justify-center ${
                              shopConfig.notification_email === 1
                                ? "bg-blue-500"
                                : "bg-gray-200"
                            }`}
                          >
                            {shopConfig.notification_email === 1 ? (
                              <CheckCircle className="h-4 w-4 text-white" />
                            ) : (
                              <div className="h-3 w-3 rounded-full bg-white" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-gray-900">
                                แจ้งเตือนทางอีเมล
                              </p>
                              <p className="text-sm text-gray-500 hidden sm:block">
                                ส่งข้อมูลคำสั่งซื้อไปยังอีเมลของคุณ
                              </p>
                            </div>
                          </div>
                          <input
                            type="hidden"
                            name="notification_email"
                            value={shopConfig.notification_email}
                          />
                        </div>

                        <div
                          className={`p-4 rounded-xl border-2 flex-1 cursor-pointer flex items-center gap-3 transition ${
                            shopConfig.notification_sms === 1
                              ? "bg-indigo-50 border-indigo-500 shadow-md"
                              : "bg-white border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() =>
                            setShopConfig((prev) => ({
                              ...prev,
                              notification_sms:
                                prev.notification_sms === 1 ? 0 : 1,
                            }))
                          }
                        >
                          <div
                            className={`h-6 w-6 rounded-full flex items-center justify-center ${
                              shopConfig.notification_sms === 1
                                ? "bg-indigo-500"
                                : "bg-gray-200"
                            }`}
                          >
                            {shopConfig.notification_sms === 1 ? (
                              <CheckCircle className="h-4 w-4 text-white" />
                            ) : (
                              <div className="h-3 w-3 rounded-full bg-white" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-indigo-600" />
                            <div>
                              <p className="font-medium text-gray-900">
                                แจ้งเตือนทาง SMS
                              </p>
                              <p className="text-sm text-gray-500 hidden sm:block">
                                ส่ง SMS แจ้งเตือนไปยังเบอร์มือถือของคุณ
                              </p>
                            </div>
                          </div>
                          <input
                            type="hidden"
                            name="notification_sms"
                            value={shopConfig.notification_sms}
                          />
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-100 mt-4 flex items-start gap-2">
                        <div className="text-yellow-600 mt-0.5">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                          หากคุณปิดการแจ้งเตือนทั้งหมด
                          คุณจะต้องตรวจสอบคำสั่งซื้อใหม่ด้วยตนเองในระบบ
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Other Settings */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-5 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    การตั้งค่าอื่นๆ
                  </h3>

                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Globe className="h-5 w-5 text-blue-600" />
                          ภาษา
                        </label>
                        <div className="relative">
                          <select
                            name="language"
                            value={shopConfig.language}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition appearance-none"
                          >
                            <option value="TH">ไทย (Thai)</option>
                            <option value="EN">อังกฤษ (English)</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                            <ChevronRight className="h-5 w-5 rotate-90" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          สกุลเงิน
                        </label>
                        <div className="relative">
                          <select
                            name="currency"
                            value={shopConfig.currency}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition appearance-none"
                          >
                            <option value="THB">บาท (THB)</option>
                            <option value="USD">ดอลลาร์สหรัฐ (USD)</option>
                            <option value="EUR">ยูโร (EUR)</option>
                            <option value="JPY">เยน (JPY)</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                            <ChevronRight className="h-5 w-5 rotate-90" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          {shopConfig.theme === "light" ? (
                            <Sun className="h-5 w-5 text-amber-500" />
                          ) : (
                            <Moon className="h-5 w-5 text-indigo-600" />
                          )}
                          ธีม
                        </label>
                        <div className="flex gap-4">
                          <div
                            className={`p-3 rounded-xl border-2 flex-1 cursor-pointer flex items-center gap-2 transition ${
                              shopConfig.theme === "light"
                                ? "bg-amber-50 border-amber-500 shadow-md"
                                : "bg-white border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() =>
                              setShopConfig((prev) => ({
                                ...prev,
                                theme: "light",
                              }))
                            }
                          >
                            <Sun className="h-5 w-5 text-amber-500" />
                            <span className="font-medium">สว่าง</span>
                          </div>

                          <div
                            className={`p-3 rounded-xl border-2 flex-1 cursor-pointer flex items-center gap-2 transition ${
                              shopConfig.theme === "dark"
                                ? "bg-indigo-50 border-indigo-500 shadow-md"
                                : "bg-white border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() =>
                              setShopConfig((prev) => ({
                                ...prev,
                                theme: "dark",
                              }))
                            }
                          >
                            <Moon className="h-5 w-5 text-indigo-600" />
                            <span className="font-medium">มืด</span>
                          </div>
                          <input
                            type="hidden"
                            name="theme"
                            value={shopConfig.theme}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-10 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
                        <span>กำลังบันทึก...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        <span>บันทึกการตั้งค่า</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopConfig;
