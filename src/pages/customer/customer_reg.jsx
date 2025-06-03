import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { UserOutlined, PhoneOutlined, LockOutlined, MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Form, Input, Button, Card, Spin, Alert, Typography, Space } from "antd";
import { motion } from "framer-motion";
import axios from "axios";
import Swal from "sweetalert2";
import { API_URL } from "../../config/config";
import CoreAPI from "../../store";

const { Title, Text } = Typography;

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

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const alertVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const CustomerReg = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
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

  const handleSubmit = async (values) => {
    setError(null);
    const payload = {
      shop_id: shopId,
      name: values.name,
      phone: values.phone,
      password: values.password,
      email: values.email || null,
      address: null,
    };
    console.log("Sending payload to backend:", payload);

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/customer`, payload);
      console.log("Backend response:", response.data);
      setSuccess(true);
      Toast.fire({
        icon: "success",
        title: "ลงทะเบียนสำเร็จ!",
      });
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
      Toast.fire({
        icon: "error",
        title: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !shopName) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Spin size="large" />
        <Text className="ml-4 text-lg text-gray-600 font-sarabun">กำลังโหลด...</Text>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8 font-sarabun"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-md mx-auto">
        <Card
          className="shadow-xl rounded-2xl border-0"
          title={
            <div className="flex items-center gap-3">
              <UserOutlined className="text-2xl text-blue-500" />
              <Title level={4} className="m-0 font-sarabun font-semibold">
                ลงทะเบียนลูกค้า{shopName ? `: ${shopName}` : ""}
              </Title>
            </div>
          }
        >
          {!shopId && (
            <div className="mb-6">
              <Link
                to="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition font-sarabun"
              >
                <ArrowLeftOutlined className="mr-2" />
                กลับสู่หน้าหลัก
              </Link>
            </div>
          )}
          {error && (
            <motion.div variants={alertVariants} initial="hidden" animate="visible">
              <Alert
                message={error}
                type="error"
                showIcon
                className="mb-6 rounded-lg font-sarabun"
              />
            </motion.div>
          )}
          {success && (
            <motion.div variants={alertVariants} initial="hidden" animate="visible">
              <Alert
                message="ลงทะเบียนสำเร็จ! กำลังเปลี่ยนเส้นทาง..."
                type="success"
                showIcon
                className="mb-6 rounded-lg font-sarabun"
              />
            </motion.div>
          )}
          {(!error || shopId) && (
            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              className="space-y-4 font-sarabun"
            >
              <Form.Item
                label={
                  <Space>
                    <UserOutlined />
                    <Text className="font-sarabun font-medium">ชื่อ *</Text>
                  </Space>
                }
                name="name"
                rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="กรอกชื่อ-นามสกุล"
                  size="large"
                  className="rounded-lg font-sarabun"
                />
              </Form.Item>
              <Form.Item
                label={
                  <Space>
                    <PhoneOutlined />
                    <Text className="font-sarabun font-medium">เบอร์โทร *</Text>
                  </Space>
                }
                name="phone"
                rules={[
                  { required: true, message: "กรุณากรอกเบอร์โทร" },
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "เบอร์โทรต้องเป็นตัวเลข 10 หลัก",
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  placeholder="กรอกเบอร์โทร (10 หลัก)"
                  size="large"
                  className="rounded-lg font-sarabun"
                />
              </Form.Item>
              <Form.Item
                label={
                  <Space>
                    <LockOutlined />
                    <Text className="font-sarabun font-medium">รหัสผ่าน *</Text>
                  </Space>
                }
                name="password"
                rules={[
                  { required: true, message: "กรุณากรอกรหัสผ่าน" },
                  {
                    pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
                    message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร รวมตัวอักษรและตัวเลข",
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="กรอกรหัสผ่าน (6 ตัวอักษรขึ้นไป)"
                  size="large"
                  className="rounded-lg font-sarabun"
                />
              </Form.Item>
              <Form.Item
                label={
                  <Space>
                    <MailOutlined />
                    <Text className="font-sarabun font-medium">อีเมล</Text>
                  </Space>
                }
                name="email"
                rules={[
                  {
                    type: "email",
                    message: "รูปแบบอีเมลไม่ถูกต้อง",
                    when: (value) => !!value,
                  },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="กรอกอีเมล (ถ้ามี)"
                  size="large"
                  className="rounded-lg font-sarabun"
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  className="w-full rounded-lg hover:scale-105 transition-transform font-sarabun"
                >
                  {loading ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
                </Button>
              </Form.Item>
            </Form>
          )}
        </Card>
      </div>
    </motion.div>
  );
};

export default CustomerReg;