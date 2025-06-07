import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  ShoppingBag, 
  Heart, 
  Bell, 
  Settings, 
  CreditCard, 
  MapPin, 
  Star,
  TrendingUp,
  Gift,
  LogOut,
  Menu,
  X
} from "lucide-react";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const CustomerDashboard = () => {
  // Mock navigation function for demo
  const navigate = (path) => {
    console.log(`Navigating to: ${path}`);
    alert(`การนำทาง: ${path}`);
  };
  const [customerData, setCustomerData] = useState({
    name: "สมชาย ใจดี",
    email: "somchai@email.com",
    phone: "081-234-5678",
    memberLevel: "Gold",
    points: 2450,
    totalOrders: 12,
    totalSpent: 45600
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Quick stats data
  const stats = [
    {
      title: "คำสั่งซื้อทั้งหมด",
      value: customerData.totalOrders,
      icon: ShoppingBag,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "ยอดซื้อสะสม",
      value: `฿${customerData.totalSpent?.toLocaleString()}`,
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "คะแนนสะสม",
      value: customerData.points?.toLocaleString(),
      icon: Star,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600"
    },
    {
      title: "สถานะสมาชิก",
      value: customerData.memberLevel,
      icon: Gift,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    }
  ];

  // Quick actions
  const quickActions = [
    {
      title: "ดูสินค้า",
      description: "เลือกซื้อสินค้าใหม่",
      icon: ShoppingBag,
      color: "from-indigo-500 to-purple-500",
      href: "/products"
    },
    {
      title: "คำสั่งซื้อ",
      description: "ตรวจสอบสถานะคำสั่งซื้อ",
      icon: ShoppingBag,
      color: "from-blue-500 to-cyan-500",
      href: "/customer/orders"
    },
    {
      title: "รายการโปรด",
      description: "สินค้าที่คุณสนใจ",
      icon: Heart,
      color: "from-pink-500 to-rose-500",
      href: "/customer/wishlist"
    },
    {
      title: "แจ้งเตือน",
      description: "ข่าวสารและโปรโมชั่น",
      icon: Bell,
      color: "from-orange-500 to-red-500",
      href: "/customer/notifications"
    }
  ];

  // Recent orders mock data
  const recentOrders = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      total: 1250,
      status: "จัดส่งแล้ว",
      items: 3
    },
    {
      id: "ORD-002", 
      date: "2024-01-10",
      total: 890,
      status: "กำลังจัดส่ง",
      items: 2
    }
  ];

  const handleLogout = () => {
    navigate("/customer/login");
    alert("ออกจากระบบแล้ว");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">กำลังโหลดข้อมูล...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <motion.header 
        className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-30"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Customer Portal
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{customerData.name}</p>
                  <p className="text-xs text-slate-500">{customerData.memberLevel} Member</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                title="ออกจากระบบ"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Welcome Section */}
          <motion.div 
            variants={itemVariants}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              ยินดีต้อนรับกลับมา, {customerData.name}! 👋
            </h2>
            <p className="text-slate-600">
              ยินดีที่ได้ให้บริการคุณในฐานะสมาชิก {customerData.memberLevel}
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                className={`${stat.bgColor} p-6 rounded-2xl border border-white/50 backdrop-blur-sm`}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                  <p className="text-sm text-slate-600">{stat.title}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold text-slate-800 mb-6">การดำเนินการด่วน</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <button
                    onClick={() => navigate(action.href)}
                    className="w-full text-left p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 hover:bg-white/90 transition-all duration-300 group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 mb-1">{action.title}</h4>
                        <p className="text-sm text-slate-600">{action.description}</p>
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Orders List */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-800">คำสั่งซื้อล่าสุด</h3>
              <button 
                onClick={() => navigate("/customer/orders")}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                ดูทั้งหมด →
              </button>
            </div>
            
            {recentOrders.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentOrders.map((order, index) => (
                  <motion.div 
                    key={order.id}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6 hover:bg-white/90 transition-all duration-300"
                    whileHover={{ scale: 1.02, y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">#{order.id}</h4>
                        <p className="text-sm text-slate-500">{order.date}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'จัดส่งแล้ว' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">จำนวนสินค้า:</span>
                        <span className="font-medium text-slate-800">{order.items} รายการ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">ยอดรวม:</span>
                        <span className="font-bold text-slate-800">฿{order.total.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => navigate(`/customer/orders/${order.id}`)}
                      className="mt-4 w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-medium"
                    >
                      ดูรายละเอียด
                    </button>
                  </motion.div>
                ))}
                
                {/* Add more sample orders for demo */}
                <motion.div 
                  className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6 hover:bg-white/90 transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">#ORD-003</h4>
                      <p className="text-sm text-slate-500">2024-01-05</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-600">
                      รอชำระเงิน
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">จำนวนสินค้า:</span>
                      <span className="font-medium text-slate-800">1 รายการ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">ยอดรวม:</span>
                      <span className="font-bold text-slate-800">฿750</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => navigate("/customer/orders/ORD-003")}
                    className="mt-4 w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-medium"
                  >
                    ดูรายละเอียด
                  </button>
                </motion.div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50">
                <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-slate-600 mb-2">ยังไม่มีคำสั่งซื้อ</h4>
                <p className="text-slate-500 mb-6">เริ่มช็อปปิ้งเพื่อสร้างคำสั่งซื้อแรกของคุณ</p>
                <button
                  onClick={() => navigate("/products")}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 font-medium"
                >
                  เริ่มช็อปปิ้ง
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerDashboard;