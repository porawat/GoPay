import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_ENDPOINT;
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found in localStorage");
      navigate("/");
      return;
    }

    axios
      .get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("Profile response:", response.data);
        setProfile(response.data);
      })
      .catch((err) => {
        console.error("Profile fetch error:", err);
        setError(err.response?.data?.message || "ไม่สามารถโหลดโปรไฟล์ได้");
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.log("Unauthorized or Forbidden, removing token");
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("username");
          navigate("/");
        }
      });
  }, [navigate]);

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-100 min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">โปรไฟล์</h1>
            <p className="mt-2 text-gray-600">จัดการข้อมูลส่วนตัวของคุณ</p>
          </div>
          <button
            onClick={() => navigate("/profile/edit")}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            แก้ไขโปรไฟล์
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Section with Avatar */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 flex items-center">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mr-4">
              <svg
                className="w-10 h-10 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                {profile.username}
              </h3>
              <p className="text-indigo-100 capitalize">{profile.role}</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              ข้อมูลผู้ใช้
            </h4>
            <div className="space-y-4">
              <div className="flex items-center border-b border-gray-200 pb-4">
                <div className="w-1/3 text-sm font-medium text-gray-500">
                  อีเมล
                </div>
                <div className="w-2/3 text-sm text-gray-900">
                  {profile.email}
                </div>
              </div>
              <div className="flex items-center border-b border-gray-200 pb-4">
                <div className="w-1/3 text-sm font-medium text-gray-500">
                  ชื่อเต็ม
                </div>
                <div className="w-2/3 text-sm text-gray-900">
                  {profile.full_name || "ไม่ระบุ"}
                </div>
              </div>
              <div className="flex items-center border-b border-gray-200 pb-4">
                <div className="w-1/3 text-sm font-medium text-gray-500">
                  หมายเลขโทรศัพท์
                </div>
                <div className="w-2/3 text-sm text-gray-900">
                  {profile.phone || "ไม่ระบุ"}
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-1/3 text-sm font-medium text-gray-500">
                  วันที่สมัคร
                </div>
                <div className="w-2/3 text-sm text-gray-900">
                  {new Date(profile.created_at).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Actions */}
        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => navigate("/change-password")}
            className="flex items-center px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11c0-1.104-.896-2-2-2s-2 .896-2 2v1H7v4h6v-4h-1v-1zm-2-3a3 3 0 013 3v1h1a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4a2 2 0 012-2h1v-1a3 3 0 013-3zm0-4a7 7 0 00-7 7v4a7 7 0 0014 0v-4a7 7 0 00-7-7z"
              />
            </svg>
            เปลี่ยนรหัสผ่าน
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
