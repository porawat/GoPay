import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function members() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_ENDPOINT;
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    axios
      .get(`${API_URL}/members`, {
        headers: { Authorization: token },
      })
      .then((response) => setMessage(response.data.message))
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/");
      });
  }, [navigate]);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900">members</h1>
        <p className="mt-2 text-gray-600">{message}</p>
      </div>
    </div>
  );
}

export default members;
