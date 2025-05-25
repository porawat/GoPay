// Customer List Component - Manages customer approvals and displays customer data
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Search,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  AlertCircle,
  Loader2,
  RefreshCw,
  UserCheck,
  UserX,
  Eye,
  Calendar,
  Mail,
  Phone,
  Star,
  Clock,
  XCircle,
} from "lucide-react";
import axios from "axios";
import { API_URL } from "../../config/config";
import Swal from "sweetalert2";

// SweetAlert2 Toast Configuration
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

// Safe localStorage Access
const safeGetItem = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn("Error accessing localStorage:", error);
    return null;
  }
};

// Axios Interceptor for Token Refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken: safeGetItem("refreshToken"),
        });
        localStorage.setItem("token", refreshResponse.data.token);
        error.config.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
        return axios(error.config);
      } catch (refreshError) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        await Swal.fire({
          title: "🔒 เซสชันหมดอายุ",
          text: "กรุณาเข้าสู่ระบบใหม่",
          icon: "warning",
          confirmButtonText: "ไปหน้าเข้าสู่ระบบ",
          confirmButtonColor: "#3b82f6",
        });
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border border-red-100">
            <div className="text-center">
              <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                เกิดข้อผิดพลาด
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {this.state.error?.message || "ไม่สามารถแสดงเนื้อหาได้"}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                ลองใหม่
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Main Customer List Component
export default function CustomerList() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [actionLoading, setActionLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Fetch Customers on Mount and Dependencies Change
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      setError(null);
      const token = safeGetItem("token");

      if (!token) {
        await Swal.fire({
          title: "🔐 ไม่พบการเข้าสู่ระบบ",
          text: "กรุณาเข้าสู่ระบบเพื่อดูข้อมูลลูกค้า",
          icon: "warning",
          confirmButtonText: "ไปหน้าเข้าสู่ระบบ",
          confirmButtonColor: "#3b82f6",
        });
        navigate("/login");
        return;
      }

      if (!shopId) {
        await Swal.fire({
          title: "⚠️ ไม่พบรหัสร้าน",
          text: "กรุณาเลือกร้านที่ต้องการจัดการ",
          icon: "error",
          confirmButtonText: "กลับไปหน้าร้าน",
          confirmButtonColor: "#3b82f6",
        });
        navigate("/myshop");
        return;
      }

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
        });
        if (statusFilter !== "ALL") {
          params.append("status", statusFilter);
        }

        const response = await axios.get(
          `${API_URL}/customer/all/${shopId}?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 15000,
          }
        );

        if (response.data?.code === 1000) {
          const customerData = response.data.data || [];
          console.log(customerData);
          setCustomers(customerData);
          setTotalPages(response.data.pagination?.totalPages || 1);
          setTotalCustomers(
            response.data.pagination?.totalItems || customerData.length
          );
        } else {
          throw new Error(
            response.data?.message || "ไม่สามารถดึงข้อมูลลูกค้าได้"
          );
        }
      } catch (err) {
        let errorMessage = "ไม่สามารถดึงข้อมูลลูกค้าได้";
        if (err.response) {
          switch (err.response.status) {
            case 403:
              errorMessage =
                err.response.data?.message ||
                "คุณไม่มีสิทธิ์ในการดูข้อมูลลูกค้า";
              break;
            case 401:
              errorMessage = "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่";
              setTimeout(() => navigate("/login"), 2000);
              break;
            case 404:
              errorMessage = "ไม่พบข้อมูลร้านค้า";
              break;
            case 500:
              errorMessage =
                "เกิดข้อผิดพลาดของเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง";
              break;
            default:
              errorMessage = err.response.data?.message || errorMessage;
          }
        } else if (err.code === "ECONNABORTED") {
          errorMessage = "การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง";
        } else if (!navigator.onLine) {
          errorMessage =
            "ไม่มีการเชื่อมต่ออินเทอร์เน็ต กรุณาตรวจสอบการเชื่อมต่อ";
        }
        setError(errorMessage);
        Toast.fire({
          icon: "error",
          title: `❌ ${errorMessage}`,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [shopId, navigate, page, statusFilter]);

  // Approve Customer Handler
  const handleApproveCustomer = async (customer) => {
    const result = await Swal.fire({
      title: "🎉 อนุมัติลูกค้า",
      html: `
        <div class="text-center">
          <div class="mb-4">
            <div class="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p class="text-lg">คุณต้องการอนุมัติ</p>
            <p class="font-bold text-xl text-blue-600">"${customer.name}"</p>
            <p class="text-lg">เป็นสมาชิกหรือไม่?</p>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "✅ อนุมัติเลย",
      cancelButtonText: "❌ ยกเลิก",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      customClass: {
        popup: "rounded-3xl",
        confirmButton: "rounded-xl px-6 py-3 font-semibold",
        cancelButton: "rounded-xl px-6 py-3 font-semibold",
      },
    });

    if (result.isConfirmed) {
      setActionLoading((prev) => ({ ...prev, [customer.id]: "approving" }));
      try {
        const token = safeGetItem("token");
        if (!token) {
          throw new Error("ไม่พบ token การเข้าสู่ระบบ");
        }

        const response = await axios.post(
          `${API_URL}/customer/approve/${customer.id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            timeout: 15000,
          }
        );

        if (response.data?.code === 1000) {
          setCustomers((prev) =>
            prev.map((c) =>
              c.id === customer.id ? { ...c, status: "APPROVED" } : c
            )
          );
          await Swal.fire({
            title: "🎉 สำเร็จ!",
            html: `
              <div class="text-center">
                <div class="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p class="text-lg">อนุมัติ <span class="font-bold text-green-600">"${customer.name}"</span> เรียบร้อยแล้ว</p>
              </div>
            `,
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "rounded-3xl",
            },
          });
        } else {
          throw new Error(
            response.data?.message || "ไม่สามารถอนุมัติลูกค้าได้"
          );
        }
      } catch (err) {
        let errorMessage = "เกิดข้อผิดพลาดในการอนุมัติลูกค้า";
        if (err.response?.status === 403) {
          errorMessage =
            err.response.data?.message || "คุณไม่มีสิทธิ์ในการอนุมัติลูกค้า";
        } else if (err.response?.status === 401) {
          errorMessage = "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่";
          setTimeout(() => navigate("/login"), 2000);
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        await Swal.fire({
          title: "❌ เกิดข้อผิดพลาด",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#ef4444",
          customClass: {
            popup: "rounded-3xl",
          },
        });
      } finally {
        setActionLoading((prev) => ({ ...prev, [customer.id]: false }));
      }
    }
  };

  // Reject Customer Handler
  const handleRejectCustomer = async (customer) => {
    const result = await Swal.fire({
      title: "⚠️ ปฏิเสธลูกค้า",
      html: `
        <div class="text-center">
          <div class="mb-4">
            <div class="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-3">
              <svg class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <p class="text-lg">คุณต้องการปฏิเสธ</p>
            <p class="font-bold text-xl text-red-600">"${customer.name}"</p>
            <p class="text-lg">หรือไม่?</p>
            <p class="text-sm text-gray-500 mt-2">การกระทำนี้ไม่สามารถยกเลิกได้</p>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "🚫 ปฏิเสธ",
      cancelButtonText: "❌ ยกเลิก",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      customClass: {
        popup: "rounded-3xl",
        confirmButton: "rounded-xl px-6 py-3 font-semibold",
        cancelButton: "rounded-xl px-6 py-3 font-semibold",
      },
    });

    if (result.isConfirmed) {
      setActionLoading((prev) => ({ ...prev, [customer.id]: "rejecting" }));
      try {
        const token = safeGetItem("token");
        if (!token) {
          throw new Error("ไม่พบ token การเข้าสู่ระบบ");
        }

        const response = await axios.post(
          `${API_URL}/customer/reject/${customer.id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            timeout: 15000,
          }
        );

        if (response.data?.code === 1000) {
          setCustomers((prev) =>
            prev.map((c) =>
              c.id === customer.id
                ? { ...c, status: "REJECTED", is_active: "INACTIVE" }
                : c
            )
          );
          await Swal.fire({
            title: "✅ สำเร็จ",
            html: `
              <div class="text-center">
                <div class="mx-auto h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                  <svg class="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <p class="text-lg">ปฏิเสธ <span class="font-bold text-red-600">"${customer.name}"</span> เรียบร้อยแล้ว</p>
              </div>
            `,
            icon: "info",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "rounded-3xl",
            },
          });
        } else {
          throw new Error(response.data?.message || "ไม่สามารถปฏิเสธลูกค้าได้");
        }
      } catch (err) {
        let errorMessage = "เกิดข้อผิดพลาดในการปฏิเสธลูกค้า";
        if (err.response?.status === 403) {
          errorMessage =
            err.response.data?.message || "คุณไม่มีสิทธิ์ในการปฏิเสธลูกค้า";
        } else if (err.response?.status === 401) {
          errorMessage = "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่";
          setTimeout(() => navigate("/login"), 2000);
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        await Swal.fire({
          title: "❌ เกิดข้อผิดพลาด",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#ef4444",
          customClass: {
            popup: "rounded-3xl",
          },
        });
      } finally {
        setActionLoading((prev) => ({ ...prev, [customer.id]: false }));
      }
    }
  };

  // View Customer Details Handler
  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  // Filter Customers by Search Term
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
  );

  // Status Badge Renderer
  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: {
        bg: "bg-gradient-to-r from-amber-100 to-yellow-100",
        text: "text-amber-800",
        label: "⏳ รอดำเนินการ",
        border: "border-amber-200",
      },
      APPROVED: {
        bg: "bg-gradient-to-r from-emerald-100 to-green-100",
        text: "text-emerald-800",
        label: "✅ อนุมัติแล้ว",
        border: "border-emerald-200",
      },
      REJECTED: {
        bg: "bg-gradient-to-r from-red-100 to-rose-100",
        text: "text-red-800",
        label: "🚫 ปฏิเสธ",
        border: "border-red-200",
      },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span
        className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} shadow-sm`}
      >
        {config.label}
      </span>
    );
  };

  // Date Formatter
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  // Avatar Color Generator
  const getAvatarColor = (name) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-pink-500 to-pink-600",
      "from-indigo-500 to-indigo-600",
      "from-teal-500 to-teal-600",
      "from-orange-500 to-orange-600",
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  // Customer Status Statistics
  const getStatusStats = () => {
    const pending = customers.filter((c) => c.status === "PENDING").length;
    const approved = customers.filter((c) => c.status === "APPROVED").length;
    const rejected = customers.filter((c) => c.status === "REJECTED").length;
    return { pending, approved, rejected };
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="mx-auto h-20 w-20 bg-white rounded-full shadow-lg flex items-center justify-center mb-6">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            กำลังโหลดข้อมูลลูกค้า
          </h3>
          <p className="text-gray-500">กรุณารอสักครู่...</p>
        </div>
      </div>
    );
  }

  const stats = getStatusStats();
  console.log(filteredCustomers);
  // Main Render
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header and Stats */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="h-14 w-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    รายชื่อลูกค้า
                  </h1>
                  <p className="text-gray-600 mt-1">
                    จัดการและอนุมัติการสมัครสมาชิกของลูกค้า
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ลูกค้าทั้งหมด</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalCustomers}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center mr-4">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">รอดำเนินการ</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {stats.pending}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                    <UserCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">อนุมัติแล้ว</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.approved}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl flex items-center justify-center mr-4">
                    <UserX className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ปฏิเสธ</p>
                    <p className="text-2xl font-bold text-red-600">
                      {stats.rejected}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-red-800 font-semibold">เกิดข้อผิดพลาด</h3>
                  <p className="text-red-700">{error}</p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="ml-auto bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
                >
                  ลองใหม่
                </button>
              </div>
            </div>
          )}

          {/* Search and Filter */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, อีเมล, หรือเบอร์โทร..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white"
            >
              <option value="ALL">ทั้งหมด</option>
              <option value="PENDING">รอดำเนินการ</option>
              <option value="APPROVED">อนุมัติแล้ว</option>
              <option value="REJECTED">ปฏิเสธ</option>
            </select>
          </div>

          {/* Customer Table */}
          {filteredCustomers.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100">
              <div className="mx-auto h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Users className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                ไม่พบลูกค้า
              </h3>
              <p className="text-gray-500">ไม่มีลูกค้าตรงกับเงื่อนไขที่เลือก</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <XCircle className="mr-2 h-5 w-5" />
                  ล้างการค้นหา
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      ลูกค้า
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      อีเมล
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      เบอร์โทร
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      สถานะ
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      วันที่สมัคร
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      การจัดการ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div
                            className={`h-10 w-10 rounded-full bg-gradient-to-r ${getAvatarColor(
                              customer.name
                            )} flex items-center justify-center text-white font-semibold mr-3`}
                          >
                            {customer.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-gray-800 font-medium">
                            {customer.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {customer.email || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {customer.phone || "-"}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(customer.status)}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(customer.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        {/* Action Buttons - View, Approve, Reject */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewCustomer(customer)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                            title="ดูรายละเอียด"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          {customer.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleApproveCustomer(customer)}
                                disabled={
                                  actionLoading[customer.id] === "approving"
                                }
                                className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="อนุมัติ"
                              >
                                {actionLoading[customer.id] === "approving" ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <Check className="h-5 w-5" />
                                )}
                              </button>
                              <button
                                onClick={() => handleRejectCustomer(customer)}
                                disabled={
                                  actionLoading[customer.id] === "rejecting"
                                }
                                className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="ปฏิเสธ"
                              >
                                {actionLoading[customer.id] === "rejecting" ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <X className="h-5 w-5" />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                แสดง {filteredCustomers.length} จาก {totalCustomers} รายการ
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm text-gray-600">
                  หน้า {page} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={page === totalPages}
                  className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Customer Detail Modal */}
          {showModal && selectedCustomer && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-3xl p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    รายละเอียดลูกค้า
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center mb-6">
                  <div
                    className={`h-16 w-16 rounded-full bg-gradient-to-r ${getAvatarColor(
                      selectedCustomer.name
                    )} flex items-center justify-center text-white text-2xl font-semibold mr-4`}
                  >
                    {selectedCustomer.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedCustomer.name}
                    </h3>
                    <p className="text-gray-600">
                      {getStatusBadge(selectedCustomer.status)}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">อีเมล</p>
                      <p className="text-gray-900">
                        {selectedCustomer.email || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">เบอร์โทร</p>
                      <p className="text-gray-900">
                        {selectedCustomer.phone || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">วันที่สมัคร</p>
                      <p className="text-gray-900">
                        {formatDate(selectedCustomer.created_at)}
                      </p>
                    </div>
                  </div>
                  {selectedCustomer.address && (
                    <div className="flex items-start">
                      <Star className="h-5 w-5 text-gray-500 mr-3 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">ที่อยู่</p>
                        <p className="text-gray-900">
                          {selectedCustomer.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  {selectedCustomer.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => {
                          setShowModal(false);
                          handleApproveCustomer(selectedCustomer);
                        }}
                        disabled={
                          actionLoading[selectedCustomer.id] === "approving"
                        }
                        className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        อนุมัติ
                      </button>
                      <button
                        onClick={() => {
                          setShowModal(false);
                          handleRejectCustomer(selectedCustomer);
                        }}
                        disabled={
                          actionLoading[selectedCustomer.id] === "rejecting"
                        }
                        className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        ปฏิเสธ
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    ปิด
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
