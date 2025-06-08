import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaStore } from "react-icons/fa6";
import { jwtDecode } from "jwt-decode";
import { Layout, Menu, Dropdown, Button, Avatar, Space } from "antd";
import {
  HomeOutlined,
  ShopOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();

  // Token decoding for role and username
  let role = null;
  let username = "ผู้ใช้";
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = decoded.role || null;
      username = decoded.username || decoded.name || decoded.phone || "ผู้ใช้";
      console.log("Sidebar decoded:", { role, username });
    } catch (error) {
      console.error("Invalid token in Sidebar:", error);
    }
  }

  // Handle logout
  const handleLogout = () => {
    console.log("Logging out, removing token, customerId, user_id, owner");
    localStorage.removeItem("token");
    localStorage.removeItem("customerId");
    localStorage.removeItem("user_id");
    localStorage.removeItem("owner");
    navigate(role === "customer" ? "/customer/login" : "/login");
  };

  // Navigation items based on role
  const adminNavItems = [
    {
      key: "dashboard",
      icon: <HomeOutlined />,
      label: "แดชบอร์ด",
      path: "/dashboard",
    },
    {
      key: "myshop",
      icon: <ShopOutlined />,
      label: "ร้านค้า",
      path: "/myshop",
    },
    {
      key: "members",
      icon: <UserOutlined />,
      label: "สมาชิก",
      path: "/members",
    },
    {
      key: "admin",
      icon: <FaStore style={{ color: "green", marginRight: 8 }} />,
      label: "Admin",
      path: "/admin",
    },
  ];

  const customerNavItems = [
    {
      key: "customer-dashboard",
      icon: <HomeOutlined />,
      label: "แดชบอร์ด",
      path: "/customer/dashboard",
    },
    {
      key: "customer-orders",
      icon: <ShopOutlined />,
      label: "คำสั่งซื้อ",
      path: "/customer/orders",
    },
  ];

  const navItems = role === "customer" ? customerNavItems : adminNavItems;

  // User menu items for dropdown
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "โปรไฟล์",
      path: role === "customer" ? "/customer/profile" : "/profile",
    },
    ...(role === "admin"
      ? [
          {
            key: "settings",
            icon: <SettingOutlined />,
            label: "การตั้งค่า",
            path: "/settings",
          },
        ]
      : []),
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "ออกจากระบบ",
      onClick: handleLogout,
    },
  ];

  // Dropdown menu for user actions
  const userMenu = (
    <Menu
      items={userMenuItems.map((item) => ({
        key: item.key,
        label: item.path ? (
          <NavLink to={item.path} onClick={() => {}}>
            <Space>
              {item.icon}
              {item.label}
            </Space>
          </NavLink>
        ) : (
          <Space>
            {item.icon}
            {item.label}
          </Space>
        ),
        onClick: item.onClick,
      }))}
      style={{ minWidth: 150 }}
    />
  );

  return (
    <Sider
      width={isOpen ? 256 : 80}
      className="fixed h-screen z-50"
      style={{
        background: "linear-gradient(180deg, #4F46E5, #9333EA)",
        color: "white",
        transition: "width 0.3s ease-in-out",
        overflowY: "auto",
      }}
      collapsed={!isOpen}
    >
      {/* Header with Toggle Button */}
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: "rgba(99, 102, 241, 0.3)" }}
      >
        {isOpen && (
          <span className="text-xl font-bold tracking-wide text-white">
            ระบบ GoPay
          </span>
        )}
        <Button
          type="text"
          icon={isOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          onClick={() => setIsOpen(!isOpen)}
          style={{ color: "white" }}
        />
      </div>

      {/* Navigation Menu */}
      <Menu
        mode="inline"
        theme="dark"
        style={{
          background: "transparent",
          color: "white",
          borderRight: "none",
        }}
        selectedKeys={navItems
          .filter((item) => window.location.pathname === item.path)
          .map((item) => item.key)}
        items={navItems.map((item) => ({
          key: item.key,
          icon: item.icon,
          label: (
            <NavLink to={item.path} className="text-white">
              {item.label}
            </NavLink>
          ),
        }))}
      />

      {/* User Section */}
      <div className="absolute bottom-0 w-full p-4 border-t" style={{ borderColor: "rgba(99, 102, 241, 0.3)" }}>
        <Dropdown overlay={userMenu} trigger={["click"]}>
          <div className="flex items-center cursor-pointer">
            <Avatar
              icon={<UserOutlined />}
              style={{ backgroundColor: "#6366F1" }}
            />
            {isOpen && (
              <span className="ml-3 text-white truncate">{username}</span>
            )}
          </div>
        </Dropdown>
      </div>
    </Sider>
  );
}

export default Sidebar;