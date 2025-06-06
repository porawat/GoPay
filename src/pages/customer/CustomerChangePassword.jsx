// pages/customer/CustomerChangePassword.jsx
import React, { useState } from "react";
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

const CustomerChangePassword = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const customerId = localStorage.getItem("customerId");

    if (!token || !customerId) {
      message.error("กรุณาเข้าสู่ระบบ");
      navigate("/customer/login");
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/customer/${customerId}/change-password`,
        {
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.code === 1000) {
        message.success("เปลี่ยนรหัสผ่านสำเร็จ");
        navigate("/customer/profile");
      } else {
        throw new Error(response.data?.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้");
      }
    } catch (err) {
      message.error(err.response?.data?.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้");
    } finally {
      setLoading(false);
    }
  };

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
            เปลี่ยนรหัสผ่าน
          </h1>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label="รหัสผ่านเก่า"
              name="oldPassword"
              rules={[{ required: true, message: "กรุณากรอกรหัสผ่านเก่า" }]}
            >
              <Input.Password placeholder="รหัสผ่านเก่า" />
            </Form.Item>
            <Form.Item
              label="รหัสผ่านใหม่"
              name="newPassword"
              rules={[
                { required: true, message: "กรุณากรอกรหัสผ่านใหม่" },
                { min: 6, message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" },
              ]}
            >
              <Input.Password placeholder="รหัสผ่านใหม่" />
            </Form.Item>
            <Form.Item
              label="ยืนยันรหัสผ่านใหม่"
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "กรุณายืนยันรหัสผ่านใหม่" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("รหัสผ่านใหม่ไม่ตรงกัน"));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="ยืนยันรหัสผ่านใหม่" />
            </Form.Item>
            <Form.Item>
              <div className="flex space-x-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
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

export default CustomerChangePassword;