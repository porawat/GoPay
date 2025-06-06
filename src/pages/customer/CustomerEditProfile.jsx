// pages/customer/CustomerEditProfile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { API_URL } from "../../config/config";
import { Button, Form, Input, message } from "antd";

// Animation Variants
const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const CustomerEditProfile = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const customerId = localStorage.getItem("customerId");

    if (!token || !customerId) {
      message.error("กรุณาเข้าสู่ระบบ");
      navigate("/customer/login");
      return;
    }

    // ดึงข้อมูลโปรไฟล์
    axios
      .get(`${API_URL}/customer/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response.data?.code === 1000) {
          form.setFieldsValue({
            name: response.data.data.name,
            email: response.data.data.email || "",
            phone: response.data.data.phone || "",
            address: response.data.data.address || "",
          });
          setLoading(false);
        } else {
          throw new Error(response.data?.message || "ไม่สามารถโหลดโปรไฟล์ได้");
        }
      })
      .catch((err) => {
        message.error(err.response?.data?.message || "ไม่สามารถโหลดโปรไฟล์ได้");
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("customerId");
          localStorage.removeItem("role");
          localStorage.removeItem("username");
          navigate("/customer/login");
        }
        setLoading(false);
      });
  }, [navigate, form]);

  const onFinish = async (values) => {
    setSubmitLoading(true);
    const token = localStorage.getItem("token");
    const customerId = localStorage.getItem("customerId");

    try {
      const response = await axios.put(
        `${API_URL}/customer/${customerId}`,
        {
          name: values.name,
          email: values.email || null,
          phone: values.phone || null,
          address: values.address || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.code === 1000) {
        message.success("อัปเดตโปรไฟล์สำเร็จ");
        navigate("/customer/profile");
      } else {
        throw new Error(response.data?.message || "ไม่สามารถอัปเดตโปรไฟล์ได้");
      }
    } catch (err) {
      message.error(err.response?.data?.message || "ไม่สามารถอัปเดตโปรไฟล์ได้");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
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
      <div className="max-w-lg mx-auto">
        <motion.div
          className="bg-white rounded-lg shadow-lg p-6"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            แก้ไขโปรไฟล์
          </h1>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label="ชื่อ"
              name="name"
              rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
            >
              <Input placeholder="ชื่อ" />
            </Form.Item>
            <Form.Item
              label="อีเมล"
              name="email"
              rules={[
                { type: "email", message: "กรุณากรอกอีเมลที่ถูกต้อง" },
              ]}
            >
              <Input placeholder="อีเมล" />
            </Form.Item>
            <Form.Item
              label="เบอร์โทร"
              name="phone"
              rules={[
                { required: true, message: "กรุณากรอกเบอร์โทร" },
                {
                  pattern: /^[0-9]{10}$/,
                  message: "กรุณากรอกเบอร์โทร 10 หลัก",
                },
              ]}
            >
              <Input placeholder="เบอร์โทร" />
            </Form.Item>
            <Form.Item label="ที่อยู่" name="address">
              <Input.TextArea placeholder="ที่อยู่" rows={4} />
            </Form.Item>
            <Form.Item>
              <div className="flex space-x-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitLoading}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  บันทึก
                </Button>
                <Button
                  onClick={() => navigate("/customer/profile")}
                  className="border-indigo-600 text-indigo-600"
                >
                  ยกเลิก
                </Button>
              </div>
            </Form.Item>
          </Form>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerEditProfile;