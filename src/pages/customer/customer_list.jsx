import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LeftOutlined,
  RightOutlined,
  UserOutlined,
  WarningOutlined,
  LoadingOutlined,
  ReloadOutlined,
  EyeOutlined,
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { Modal, Table, Input, Select, Button, Card, Statistic, Spin, Alert, Badge, Avatar, Tag } from "antd";
import axios from "axios";
import Swal from "sweetalert2";
import { API_URL } from "../../config/config";

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
          confirmButtonColor: "#1890ff",
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="max-w-md w-full shadow-lg">
            <div className="text-center">
              <WarningOutlined className="text-red-500 text-4xl mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                เกิดข้อผิดพลาด
              </h2>
              <p className="text-gray-600 mb-6">
                {this.state.error?.message || "ไม่สามารถแสดงเนื้อหาได้"}
              </p>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => window.location.reload()}
                className="rounded-lg"
              >
                ลองใหม่
              </Button>
            </div>
          </Card>
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
          confirmButtonColor: "#1890ff",
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
          confirmButtonColor: "#1890ff",
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
          <p class="text-lg">คุณต้องการอนุมัติ</p>
          <p class="font-bold text-xl text-blue-600">"${customer.name}"</p>
          <p class="text-lg">เป็นสมาชิกหรือไม่?</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "✅ อนุมัติ",
      cancelButtonText: "❌ ยกเลิก",
      confirmButtonColor: "#1890ff",
      cancelButtonColor: "#d9d9d9",
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
            text: `อนุมัติ "${customer.name}" เรียบร้อยแล้ว`,
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
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
          confirmButtonColor: "#ff4d4f",
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
          <p class="text-lg">คุณต้องการปฏิเสธ</p>
          <p class="font-bold text-xl text-red-600">"${customer.name}"</p>
          <p class="text-lg">หรือไม่?</p>
          <p class="text-sm text-gray-500 mt-2">การกระทำนี้ไม่สามารถยกเลิกได้</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "🚫 ปฏิเสธ",
      cancelButtonText: "❌ ยกเลิก",
      confirmButtonColor: "#ff4d4f",
      cancelButtonColor: "#d9d9d9",
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
            text: `ปฏิเสธ "${customer.name}" เรียบร้อยแล้ว`,
            icon: "info",
            timer: 2000,
            showConfirmButton: false,
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
          confirmButtonColor: "#ff4d4f",
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
      PENDING: { color: "gold", label: "⏳ รอดำเนินการ" },
      APPROVED: { color: "green", label: "✅ อนุมัติแล้ว" },
      REJECTED: { color: "red", label: "🚫 ปฏิเสธ" },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return <Tag color={config.color}>{config.label}</Tag>;
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
    const colors = ["#1890ff", "#722ed1", "#eb2f96", "#2f54eb", "#13c2c2", "#fa8c16"];
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

  // Table Columns
  const columns = [
    {
      title: "ลูกค้า",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="flex items-center">
          <Avatar
            style={{ backgroundColor: getAvatarColor(record.name) }}
            className="mr-2"
          >
            {record.name?.charAt(0).toUpperCase()}
          </Avatar>
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "อีเมล",
      dataIndex: "email",
      key: "email",
      render: (text) => text || "-",
    },
    {
      title: "เบอร์โทร",
      dataIndex: "phone",
      key: "phone",
      render: (text) => text || "-",
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusBadge(status),
    },
    {
      title: "วันที่สมัคร",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => formatDate(date),
    },
    {
      title: "การจัดการ",
      key: "action",
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewCustomer(record)}
            className="rounded-lg"
            title="ดูรายละเอียด"
          />
          {record.status === "PENDING" && (
            <>
              <Button
                icon={<CheckCircleOutlined />}
                onClick={() => handleApproveCustomer(record)}
                loading={actionLoading[record.id] === "approving"}
                type="primary"
                className="rounded-lg"
                title="อนุมัติ"
              />
              <Button
                icon={<CloseCircleOutlined />}
                onClick={() => handleRejectCustomer(record)}
                loading={actionLoading[record.id] === "rejecting"}
                danger
                className="rounded-lg"
                title="ปฏิเสธ"
              />
            </>
          )}
        </div>
      ),
    },
  ];

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        <p className="ml-4 text-gray-600">กำลังโหลดข้อมูลลูกค้า...</p>
      </div>
    );
  }

  const stats = getStatusStats();

  // Main Render
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <UserOutlined className="text-4xl text-blue-500 mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  รายชื่อลูกค้า
                </h1>
                <p className="text-gray-600">
                  จัดการและอนุมัติการสมัครสมาชิกของลูกค้า
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card hoverable className="rounded-lg">
                <Statistic
                  title="ลูกค้าทั้งหมด"
                  value={totalCustomers}
                  prefix={<UserOutlined />}
                />
              </Card>
              <Card hoverable className="rounded-lg">
                <Statistic
                  title="รอดำเนินการ"
                  value={stats.pending}
                  prefix={<LoadingOutlined />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
              <Card hoverable className="rounded-lg">
                <Statistic
                  title="อนุมัติแล้ว"
                  value={stats.approved}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
              <Card hoverable className="rounded-lg">
                <Statistic
                  title="ปฏิเสธ"
                  value={stats.rejected}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: "#ff4d4f" }}
                />
              </Card>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              message="เกิดข้อผิดพลาด"
              description={error}
              type="error"
              showIcon
              className="mb-6 rounded-lg"
              action={
                <Button
                  type="primary"
                  danger
                  onClick={() => window.location.reload()}
                  className="rounded-lg"
                >
                  ลองใหม่
                </Button>
              }
            />
          )}

          {/* Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <Input
              prefix={<SearchOutlined />}
              placeholder="ค้นหาชื่อ, อีเมล, หรือเบอร์โทร..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-lg"
              size="large"
            />
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              className="w-full sm:w-48"
              size="large"
            >
              <Select.Option value="ALL">ทั้งหมด</Select.Option>
              <Select.Option value="PENDING">รอดำเนินการ</Select.Option>
              <Select.Option value="APPROVED">อนุมัติแล้ว</Select.Option>
              <Select.Option value="REJECTED">ปฏิเสธ</Select.Option>
            </Select>
          </div>

          {/* Customer Table */}
          <Table
            columns={columns}
            dataSource={filteredCustomers}
            rowKey="id"
            pagination={false}
            locale={{
              emptyText: (
                <div className="py-8 text-center">
                  <UserOutlined className="text-4xl text-gray-400 mb-2" />
                  <h3 className="text-lg font-semibold text-gray-700">
                    ไม่พบลูกค้า
                  </h3>
                  <p className="text-gray-500">
                    ไม่มีลูกค้าตรงกับเงื่อนไขที่เลือก
                  </p>
                  {searchTerm && (
                    <Button
                      type="primary"
                      onClick={() => setSearchTerm("")}
                      className="mt-4 rounded-lg"
                    >
                      ล้างการค้นหา
                    </Button>
                  )}
                </div>
              ),
            }}
            className="rounded-lg shadow-lg"
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <span className="text-gray-600">
                แสดง {filteredCustomers.length} จาก {totalCustomers} รายการ
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  icon={<LeftOutlined />}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="rounded-lg"
                />
                <span className="text-gray-600">
                  หน้า {page} / {totalPages}
                </span>
                <Button
                  icon={<RightOutlined />}
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Customer Detail Modal */}
          <Modal
            title="รายละเอียดลูกค้า"
            open={showModal}
            onCancel={() => setShowModal(false)}
            footer={null}
            centered
            className="rounded-lg"
            width={600}
          >
            {selectedCustomer && (
              <div className="space-y-6">
                <div className="flex items-center">
                  <Avatar
                    size={64}
                    style={{ backgroundColor: getAvatarColor(selectedCustomer.name) }}
                    className="mr-4"
                  >
                    {selectedCustomer.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedCustomer.name}</h3>
                    {getStatusBadge(selectedCustomer.status)}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <MailOutlined className="text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">อีเมล</p>
                      <p>{selectedCustomer.email || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <PhoneOutlined className="text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">เบอร์โทร</p>
                      <p>{selectedCustomer.phone || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CalendarOutlined className="text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">วันที่สมัคร</p>
                      <p>{formatDate(selectedCustomer.created_at)}</p>
                    </div>
                  </div>
                  {selectedCustomer.address && (
                    <div className="flex items-start">
                      <HomeOutlined className="text-gray-500 mr-3 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">ที่อยู่</p>
                        <p>{selectedCustomer.address}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-3">
                  {selectedCustomer.status === "PENDING" && (
                    <>
                      <Button
                        type="primary"
                        onClick={() => {
                          setShowModal(false);
                          handleApproveCustomer(selectedCustomer);
                        }}
                        loading={actionLoading[selectedCustomer.id] === "approving"}
                        className="rounded-lg"
                      >
                        อนุมัติ
                      </Button>
                      <Button
                        danger
                        onClick={() => {
                          setShowModal(false);
                          handleRejectCustomer(selectedCustomer);
                        }}
                        loading={actionLoading[selectedCustomer.id] === "rejecting"}
                        className="rounded-lg"
                      >
                        ปฏิเสธ
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => setShowModal(false)}
                    className="rounded-lg"
                  >
                    ปิด
                  </Button>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </ErrorBoundary>
  );
}