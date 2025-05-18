import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function EditProfile() {
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
        setFormData({
          email: response.data.email,
          full_name: response.data.full_name || "",
          phone: response.data.phone || "",
        });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("อัปเดตโปรไฟล์สำเร็จ");
      setTimeout(() => navigate("/profile"), 2000);
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.response?.data?.message || "ไม่สามารถอัปเดตโปรไฟล์ได้");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col w-full h-screen bg-gray-50">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            แก้ไขโปรไฟล์
          </h2>
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center">
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
          {success && (
            <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 flex items-center">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {success}
            </div>
          )}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="full_name"
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  ชื่อเต็ม
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                  placeholder="กรอกชื่อเต็ม"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  อีเมล
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                  placeholder="กรอกอีเมล"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  หมายเลขโทรศัพท์
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="เช่น +66 123 456 789"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors text-lg font-medium"
              >
                บันทึกการเปลี่ยนแปลง
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
