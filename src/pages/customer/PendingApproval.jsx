import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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

// Loading Spinner Component
const LoadingSpinner = ({ size = "md" }) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin`}>
      <div className="w-full h-full border-3 border-gray-200 border-t-blue-600 rounded-full"></div>
    </div>
  );
};

// Clock Icon Component
const ClockIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Alert Component
const Alert = ({ type = "error", children, className = "" }) => {
  const typeStyles = {
    error: "bg-red-50 border-red-200 text-red-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800"
  };

  const icons = {
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    )
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 p-4 rounded-xl border ${typeStyles[type]} ${className}`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {icons[type]}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </motion.div>
  );
};

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6,
      ease: "easeOut"
    } 
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.5,
      delay: 0.2,
      ease: "easeOut"
    }
  },
};

const PendingApproval = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("PENDING");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    const maxPolls = 12; // จำกัด polling 12 ครั้ง (1 นาที)

    const checkStatus = async () => {
      if (pollCount >= maxPolls && status === "PENDING") {
        setError("การตรวจสอบสถานะใช้เวลานานเกินไป กรุณาติดต่อเจ้าของร้าน");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/customer/${customerId}`);
        console.log("API Response:", JSON.stringify(response.data, null, 2));
        
        if (response.data.code === 1000 && response.data.data?.status) {
          const customerStatus = response.data.data.status;
          setStatus(customerStatus);
          setLoading(false);
          setPollCount((prev) => prev + 1);

          if (customerStatus === "APPROVED") {
            Toast.fire({
              icon: "success",
              title: "บัญชีของคุณได้รับการอนุมัติ!",
            });
            setTimeout(() => {
              try {
                navigate("/customer/login", { replace: true });
              } catch (navError) {
                console.error("Navigation error:", navError);
                setError("ไม่สามารถเปลี่ยนหน้าไปยัง login ได้ กรุณาลองใหม่");
              }
            }, 2000);
          } else if (customerStatus === "REJECTED") {
            setError("การลงทะเบียนของคุณถูกปฏิเสธ กรุณาติดต่อเจ้าของร้าน");
          } else if (customerStatus !== "PENDING") {
            setError("สถานะไม่ถูกต้อง กรุณาติดต่อเจ้าของร้าน");
          }
        } else {
          throw new Error(response.data.message || "API response invalid");
        }
      } catch (err) {
        console.error("Error checking customer status:", err.response?.data || err.message);
        setError("ไม่สามารถตรวจสอบสถานะได้ กรุณาลองใหม่");
        setLoading(false);
      }
    };

    checkStatus();
    if (status === "PENDING" && pollCount < maxPolls) {
      const interval = setInterval(checkStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [customerId, navigate, status, pollCount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          className="flex flex-col items-center gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 font-medium">กำลังโหลด...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          variants={cardVariants}
        >
          {/* Header */}
          <div className="bg-slate-900 px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-800 rounded-xl">
                <ClockIcon className="w-6 h-6 text-slate-300" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">รอการอนุมัติ</h1>
                <p className="text-slate-300 text-sm mt-1">กำลังตรวจสอบข้อมูล</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <div className="text-center">
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">
                  การลงทะเบียนของคุณอยู่ในระหว่างการตรวจสอบ 
                  กรุณารอการยอมรับจากเจ้าของร้าน
                </p>
                
                <AnimatePresence>
                  {status === "APPROVED" && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-green-600 font-medium mt-2"
                    >
                      อนุมัติแล้ว! กำลังเปลี่ยนเส้นทางไปยังหน้า login...
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <Alert type="error">
                      {error}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {status === "PENDING" && !error && (
                <motion.div
                  className="flex flex-col items-center gap-4"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <LoadingSpinner />
                  <p className="text-sm text-gray-500">กำลังตรวจสอบสถานะ...</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              หากมีปัญหา กรุณาติดต่อเจ้าของร้าน
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PendingApproval;