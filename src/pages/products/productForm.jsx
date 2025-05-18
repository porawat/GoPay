import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import CoreAPI from "../../store";
//import { v4 as uuidv4 } from "uuid";

const ProductForm = ({ action = "create" }) => {
  const params = useParams();
  const navigate = useNavigate();
  const shopId = params?.shopId || "";
  const productId = params?.productId || "";
  const [masterProducts, setMasterProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    price: "",
    stock: 0,
  });
  console.log("shopId", shopId);
  console.log("productId", productId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // ดึงข้อมูลจาก product_master
  const getMasterProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response =
        await CoreAPI.productMasterHttpService.getproductMaster();
      console.log("Master Products Response:", response);
      if (response?.code === 1000) {
        setMasterProducts(response?.data || []);
      } else {
        setError(
          "ไม่สามารถดึงข้อมูลสินค้าหลักได้: " +
            (response?.message || "ข้อผิดพลาดไม่ทราบสาเหตุ")
        );
      }
    } catch (error) {
      console.error("Error fetching master products:", error);
      setError("ไม่สามารถโหลดข้อมูลสินค้าหลักได้");
    } finally {
      setIsLoading(false);
    }
  };

  // ดึงข้อมูลสินค้าสำหรับแก้ไข
  const getProduct = async () => {
    if (action !== "edit" || !productId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await CoreAPI.productHttpService.getProductById(
        productId
      );
      console.log("Product Response:", response);
      if (response?.code === 1000 && response?.datarow) {
        const product = response.datarow;
        setSelectedProduct({
          product_id: product.product_id,
          name: product.product_name,
          description: product.description,
          selling_price: product.price,
        });
        setFormData({
          price: product.price.toString(),
          stock: product.stock,
        });
      } else {
        setError(
          "ไม่สามารถดึงข้อมูลสินค้าได้: " +
            (response?.message || "ข้อผิดพลาดไม่ทราบสาเหตุ")
        );
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("ไม่สามารถโหลดข้อมูลสินค้าได้");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getMasterProducts();
    if (action === "edit") {
      getProduct();
    }
  }, [action, productId]);

  // กรองข้อมูลตาม searchTerm
  const filteredMasterProducts = masterProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // เมื่อเลือกสินค้าจาก DataTable
  const handleSelectProduct = (row) => {
    if (action === "edit") return; // ป้องกันการเปลี่ยนสินค้าเมื่อแก้ไข
    setSelectedProduct(row);
    setFormData({
      price: row.selling_price.toString(),
      stock: 0,
    });
    setError(null);
  };

  // อัปเดตฟอร์มเมื่อกรอกข้อมูล
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // บันทึกหรืออัปเดตข้อมูล
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      setError("กรุณาเลือกสินค้า");
      return;
    }
    if (
      !formData.price ||
      isNaN(formData.price) ||
      Number(formData.price) <= 0
    ) {
      setError("กรุณากรอกราคาที่ถูกต้อง");
      return;
    }
    if (isNaN(formData.stock) || formData.stock < 0) {
      setError("กรุณากรอกจำนวนสต็อกที่ถูกต้อง");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const productData = {
        ...(action !== "create" && { product_uid: productId }),
        product_id: selectedProduct.product_id,
        product_name: selectedProduct.name,
        shop_id: shopId,
        description: selectedProduct.description || "",
        price: Number(formData.price),
        is_active: "ACTIVE",
        stock: Number(formData.stock),
      };
      console.log("Product Data:", productData);
      let response;
      if (action === "create") {
        response = await CoreAPI.productHttpService.createProduct(productData);
      } else {
        response = await CoreAPI.productHttpService.updateProduct(
          productId,
          productData
        );
      }

      console.log(`${action} Product Response:`, response);
      if (response?.code === 1000) {
        navigate(`/shopmanage/${shopId}`);
      } else {
        setError(
          `ไม่สามารถ${action === "create" ? "บันทึก" : "อัปเดต"}สินค้าได้: ` +
            (response?.message || "ข้อผิดพลาดไม่ทราบสาเหตุ")
        );
      }
    } catch (error) {
      console.error(`Error ${action} product:`, error);
      setError(
        `ไม่สามารถ${action === "create" ? "บันทึก" : "อัปเดต"}สินค้าได้`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // คอลัมน์สำหรับ DataTable
  const columns = [
    {
      name: "ชื่อสินค้า",
      selector: (row) => row.name,
      sortable: true,
      wrap: true,
      cell: (row) => (
        <span className="font-medium text-gray-800">{row.name}</span>
      ),
    },
    {
      name: "คำอธิบาย",
      selector: (row) => row.description || "-",
      sortable: true,
      wrap: true,
      cell: (row) => (
        <span className="text-gray-600">{row.description || "-"}</span>
      ),
    },
    {
      name: "ราคาขาย (บาท)",
      selector: (row) => row.selling_price,
      sortable: true,
      cell: (row) => (
        <span className="text-indigo-600 font-medium">
          {Number(row.selling_price).toFixed(2)}
        </span>
      ),
    },
    {
      name: "สถานะ",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.status === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.status === "ACTIVE" ? "ใช้งาน" : "ไม่ใช้งาน"}
        </span>
      ),
    },
  ];

  // Custom styles สำหรับ DataTable
  const customStyles = {
    table: {
      style: {
        backgroundColor: "white",
        borderRadius: "0.5rem",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      },
    },
    headCells: {
      style: {
        backgroundColor: "#f3f4f6",
        fontSize: "0.875rem",
        fontWeight: "600",
        color: "#1f2937",
        padding: "1rem",
      },
    },
    cells: {
      style: {
        padding: "1rem",
        fontSize: "0.875rem",
        color: "#374151",
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #e5e7eb",
        padding: "0.5rem",
      },
    },
  };
  console.log(searchTerm);
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-8 px-4">
      <div className="w-full max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 px-6 py-6 relative">
          <button
            onClick={() => navigate(`/shopmanage/${shopId}`)}
            className="absolute top-6 left-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="กลับ"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {action === "create" ? "เพิ่มสินค้าใหม่" : "แก้ไขสินค้า"}
            </h2>
            <p className="text-indigo-100 mt-2 text-sm">
              {action === "create"
                ? "เลือกสินค้าจากรายการและกำหนดราคา"
                : "แก้ไขข้อมูลสินค้าและราคา"}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center">
                <svg
                  className="animate-spin h-8 w-8 text-indigo-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
              </div>
            </div>
          ) : error ? (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center animate-fadeIn">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium">เกิดข้อผิดพลาด</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* ส่วนบน: DataTable (ซ่อนเมื่อแก้ไข) */}
              {action === "create" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    รายการสินค้าหลัก
                  </h3>
                  <div className="mb-4 w-full">
                    <div className="relative w-full sm:w-80">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="ค้นหาสินค้าหลัก..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm"
                      />
                    </div>
                  </div>
                  <DataTable
                    columns={columns}
                    data={filteredMasterProducts}
                    pagination
                    paginationPerPage={5}
                    paginationRowsPerPageOptions={[5, 10, 20]}
                    customStyles={customStyles}
                    noDataComponent={
                      <div className="py-8 text-center text-gray-600">
                        ไม่พบสินค้าหลัก
                      </div>
                    }
                    highlightOnHover
                    pointerOnHover
                    responsive
                    onRowClicked={handleSelectProduct}
                  />
                </div>
              )}

              {/* ส่วนล่าง: ฟอร์ม */}
              <div
                className={`${
                  action === "create" ? "border-t border-gray-200 pt-6" : ""
                }`}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  ข้อมูลสินค้า
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        ชื่อสินค้า
                      </label>
                      <input
                        type="text"
                        value={selectedProduct ? selectedProduct.name : ""}
                        readOnly
                        className="mt-1 w-full py-3 px-4 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        คำอธิบาย
                      </label>
                      <input
                        type="text"
                        value={
                          selectedProduct
                            ? selectedProduct.description || ""
                            : ""
                        }
                        readOnly
                        className="mt-1 w-full py-3 px-4 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        ราคา (บาท)
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="กรอกราคา"
                        step="0.01"
                        min="0"
                        className="mt-1 w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        สต็อก
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        placeholder="กรอกจำนวนสต็อก"
                        min="0"
                        className="mt-1 w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => navigate(`/shopmanage/${shopId}`)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors flex items-center ${
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 mr-2 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          กำลังบันทึก...
                        </>
                      ) : action === "create" ? (
                        "บันทึก"
                      ) : (
                        "อัปเดต"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProductForm;
