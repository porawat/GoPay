import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CoreAPI from "../../store";
const ProductPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const shopId = params?.shopId || "";
  console.log("shopId", shopId);
  const getProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await CoreAPI.productHttpService.getproduct(shopId);
      console.log("API Response:", response);
      if (response?.code === 1000) {
        setProducts(response?.datarow || []);
      }
      if (response?.code !== 1000) {
        setError(
          "ไม่สามารถดึงข้อมูลสินค้าได้: " +
            (response?.message || "ข้อผิดพลาดไม่ทราบสาเหตุ")
        );
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getProducts();
  }, [shopId]);
  return (
    <>
      {products.length > 0 ? (
        <>
          <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">Product List</h1>
            <ul className="list-disc">
              {products.map((product) => (
                <li key={product.id} className="mb-2">
                  {product.name}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No Products Found</h1>
            <p className="text-gray-600">Please add products to your shop.</p>
            <button
              onClick={() => navigate(`/shopmanage/${shopId}/addproduct`)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Add Product
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductPage;
