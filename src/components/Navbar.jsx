// Sidebar.jsx
import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaStore } from "react-icons/fa6";
import { jwtDecode } from "jwt-decode";

function Sidebar({ isOpen, setIsOpen }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // ดึงข้อมูลจาก token
  let role = null;
  let username = "ผู้ใช้";
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = decoded.role || null;
      username = decoded.username || decoded.name || decoded.phone || "ผู้ใช้"; // เพิ่ม decoded.username
      console.log("Sidebar decoded:", { role, username });
    } catch (error) {
      console.error("Invalid token in Sidebar:", error);
    }
  }

  // คงโค้ดอื่น ๆ ไว้เหมือนเดิม
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    console.log("Logging out, removing token, customerId, user_id, owner");
    localStorage.removeItem("token");
    localStorage.removeItem("customerId");
    localStorage.removeItem("user_id");
    localStorage.removeItem("owner");
    navigate(role === "customer" ? "/customer/login" : "/login");
  };

  const adminNavItems = [
    {
      name: "แดชบอร์ด",
      path: "/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: "ร้านค้า",
      path: "/myshop",
      icon: <FaStore style={{ color: "#BFECFF" }} />,
    },
    {
      name: "สมาชิก",
      path: "/members",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      ),
    },
    {
      name: "Admin",
      path: "/admin",
      icon: <FaStore style={{ color: "green" }} />,
    },
  ];

  const customerNavItems = [
    {
      name: "แดชบอร์ด",
      path: "/customer/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: "คำสั่งซื้อ",
      path: "/customer/orders",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h18v18H3V3zm4 14h10M7 10h10"
          />
        </svg>
      ),
    },
  ];

  const navItems = role === "customer" ? customerNavItems : adminNavItems;

  const userMenuItems = [
    {
      name: "โปรไฟล์",
      path: role === "customer" ? "/customer/profile" : "/profile",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    ...(role === "admin"
      ? [
          {
            name: "การตั้งค่า",
            path: "/settings",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            ),
          },
        ]
      : []),
    {
      name: "ออกจากระบบ",
      action: handleLogout,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      ),
    },
  ];

  return (
    <div
      className={`fixed h-full bg-gradient-to-b from-indigo-600 to-purple-600 text-white transition-all duration-300 ease-in-out ${
        isOpen ? "w-64" : "w-20"
      } flex flex-col shadow-2xl z-50`}
    >
      <div className="flex items-center justify-between p-4 border-b border-indigo-500/30">
        {isOpen && (
          <span className="text-xl font-bold tracking-wide">ระบบ GoPay</span>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full hover:bg-indigo-700 transition-colors"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-6">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 mx-2 my-1 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-indigo-700 shadow-lg text-white"
                  : "text-indigo-100 hover:bg-indigo-700 hover:shadow-md"
              }`
            }
          >
            {item.icon}
            {isOpen && <span className="ml-3">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-indigo-500/30" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center w-full px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {isOpen && <span className="ml-3 truncate">{username}</span>}
        </button>

        {isDropdownOpen && isOpen && (
          <div className="mt-2 bg-indigo-700 rounded-lg shadow-lg">
            {userMenuItems.map((item) =>
              item.path ? (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 text-indigo-100 hover:bg-indigo-800 first:rounded-t-lg last:rounded-b-lg ${
                      isActive ? "bg-indigo-800" : ""
                    }`
                  }
                  onClick={() => setIsDropdownOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </NavLink>
              ) : (
                <button
                  key={item.name}
                  onClick={() => {
                    setIsDropdownOpen(false);
                    item.action();
                  }}
                  className="flex items-center w-full px-4 py-2 text-indigo-100 hover:bg-indigo-800 last:rounded-b-lg"
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;