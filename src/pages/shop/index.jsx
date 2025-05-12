import react, { useState, useEffect } from "react";
import { API_URL } from "../../config/config"; // Removed unused TOKEN
import axios from "axios";
const ShopPage = () => {
  console.log(API_URL);
  const token = localStorage.getItem("token");
  console.log(token);
  const [myshop, setMyshop] = useState([]);
  const getmyshop = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/getmyshop`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data);

      if (response?.data?.code === 1000) {
        setMyshop(response?.data?.datarow);
      }
    } catch (error) {}
  };
  useEffect(() => {
    getmyshop();
  }, []);

  return <>{myshop.length > 0 ? <>show gride</> : <>create</>}</>;
};
export default ShopPage;
