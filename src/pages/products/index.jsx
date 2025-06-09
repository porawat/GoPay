import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import CoreAPI from "../../store";
import { Modal } from "antd";
import ProductForm from "./modal/productEditForm";

// Define StatusBadge as a standalone component
const StatusBadge = ({ status }) => {
  const isActive = status === "ACTIVE";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive
          ? "bg-green-100 text-green-800 border border-green-200"
          : "bg-red-100 text-red-800 border border-red-200"
      }`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          isActive ? "bg-green-500" : "bg-red-500"
        }`}
      ></div>
      {isActive ? "ใช้งาน" : "ไม่ใช้งาน"}
    </span>
  );
};

// Define StockIndicator as a standalone component
const StockIndicator = ({ stock }) => {
  let colorClass = "text-green-600";
  if (stock === 0) colorClass = "text-red-600";
  else if (stock < 10) colorClass = "text-yellow-600";

  return <span className={`font-medium ${colorClass}`}>{stock}</span>;
};

// PropTypes for StatusBadge and StockIndicator
StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

StockIndicator.propTypes = {
  stock: PropTypes.number.isRequired,
};

const ProductPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedWarehouse, setSelectedWarehouse] = useState("all");
  const [selectedWholesaleStore, setSelectedWholesaleStore] = useState("all");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedWarehouses, setExpandedWarehouses] = useState({});
  const [expandedWholesaleStores, setExpandedWholesaleStores] = useState({});
  const shopId = params?.shopId || "";
  const [editModalOpen, setEditModalOpen] = useState({
    open: false,
    product: null,
  });

  // Mock data for warehouses, wholesale stores, and categories
  const warehouses = [
    { id: "wh1", name: "คลังสินค้าหลัก", location: "กรุงเทพ", count: 150 },
    { id: "wh2", name: "คลังสินค้าภาคเหนือ", location: "เชียงใหม่", count: 75 },
    { id: "wh3", name: "คลังสินค้าภาคใต้", location: "ภูเก็ต", count: 50 },
  ];

  const wholesaleStores = [
    { id: "ws1", name: "ร้านค้าส่ง A", location: "กรุงเทพ", count: 100 },
    { id: "ws2", name: "ร้านค้าส่ง B", location: "เชียงใหม่", count: 60 },
    { id: "ws3", name: "ร้านค้าส่ง C", location: "ขอนแก่น", count: 40 },
  ];

  const categories = [
    {
      id: "electronics",
      name: "อิเล็กทรอนิกส์",
      count: 45,
      subcategories: [
        { id: "mobile", name: "มือถือ", count: 25 },
        { id: "laptop", name: "คอมพิวเตอร์", count: 15 },
        { id: "accessories", name: "อุปกรณ์เสริม", count: 5 },
      ],
    },
    {
      id: "fashion",
      name: "เสื้อผ้าแฟชั่น",
      count: 80,
      subcategories: [
        { id: "men", name: "เสื้อผ้าผู้ชาย", count: 30 },
        { id: "women", name: "เสื้อผ้าผู้หญิง", count: 40 },
        { id: "shoes", name: "รองเท้า", count: 10 },
      ],
    },
    {
      id: "home",
      name: "ของใช้ในบ้าน",
      count: 35,
      subcategories: [
        { id: "furniture", name: "เฟอร์นิเจอร์", count: 15 },
        { id: "kitchen", name: "ห้องครัว", count: 20 },
      ],
    },
  ];

  const getProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await CoreAPI.productHttpService.getproduct(shopId);
      console.log("API Response:", response);
      console.log("Products Data:", response?.datarow);
      if (response?.code === 1000) {
        const validProducts = (response?.datarow || []).map((product) => ({
          ...product,
          product_name:
            product.product_name || product.name || "ไม่มีชื่อสินค้า",
        }));
        setProducts(validProducts);
        setFilteredProducts(validProducts);
      } else {
        setError(
          "ไม่สามารถดึงข้อมูลสินค้าได้: " +
            (response?.message || "ข้อผิดพลาดไม่ทราบสาเหตุ")
        );
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("ไม่สามารถโหลดข้อมูลสินค้าได้");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOk = () => {
    setEditModalOpen({ open: false, product: null });
    getProducts();
  };

  const handleCancel = () => {
    setEditModalOpen({ open: false, product: null });
  };

  useEffect(() => {
    getProducts();
  }, [shopId]);

  // Search and filter logic
  useEffect(() => {
    let filtered = products.filter((product) => {
      const productName = product.product_name || product.name || "";
      const matchesSearch = productName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || true; // Replace with actual category check
      const matchesWarehouse = selectedWarehouse === "all" || true; // Replace with actual warehouse check
      const matchesWholesaleStore = selectedWholesaleStore === "all" || true; // Added wholesale store check
      return matchesSearch && matchesCategory && matchesWarehouse && matchesWholesaleStore;
    });

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchTerm, products, selectedCategory, selectedWarehouse, selectedWholesaleStore]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(
        currentItems.map((item) => item.id || item.product_id)
      );
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const toggleWarehouseExpand = (warehouseId) => {
    setExpandedWarehouses((prev) => ({
      ...prev,
      [warehouseId]: !prev[warehouseId],
    }));
  };

  const toggleWholesaleStoreExpand = (storeId) => {
    setExpandedWholesaleStores((prev) => ({
      ...prev,
      [storeId]: !prev[storeId],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/shopmanage/${shopId}`)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              จัดการสินค้า
            </h2>
            <div></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Warehouses Section */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                คลังสินค้า
              </h3>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setSelectedWarehouse("all")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedWarehouse === "all"
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>ทั้งหมด</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {warehouses.reduce((sum, wh) => sum + wh.count, 0)}
                  </span>
                </div>
              </button>

              {warehouses.map((warehouse) => (
                <div key={warehouse.id}>
                  <button
                    onClick={() => setSelectedWarehouse(warehouse.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedWarehouse === warehouse.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{warehouse.name}</div>
                        <div className="text-xs text-gray-500">
                          {warehouse.location}
                        </div>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {warehouse.count}
                      </span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Wholesale Stores Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h18v18H3V3zm2 2v14h14V5H5zm3 2h8v2H8V7zm0 4h8v2H8v-2zm0 4h5v2H8v-2z"
                  />
                </svg>
                ร้านค้าส่ง
              </h3>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setSelectedWholesaleStore("all")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedWholesaleStore === "all"
                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>ทั้งหมด</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {wholesaleStores.reduce((sum, ws) => sum + ws.count, 0)}
                  </span>
                </div>
              </button>

              {wholesaleStores.map((store) => (
                <div key={store.id}>
                  <button
                    onClick={() => setSelectedWholesaleStore(store.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedWholesaleStore === store.id
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{store.name}</div>
                        <div className="text-xs text-gray-500">
                          {store.location}
                        </div>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {store.count}
                      </span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Categories Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                หมวดสินค้า
              </h3>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory("all")} // Fixed missing parenthesis
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === "all"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>ทั้งหมด</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {categories.reduce((sum, cat) => sum + cat.count, 0)}
                  </span>
                </div>
              </button>

              {categories.map((category) => (
                <div key={category.id}>
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleCategoryExpand(category.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <svg
                        className={`w-3 h-3 text-gray-400 transition-transform ${
                          expandedCategories[category.id] ? "rotate-90" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex-1 text-left px-2 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.id
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {category.count}
                        </span>
                      </div>
                    </button>
                  </div>

                  {expandedCategories[category.id] && (
                    <div className="ml-6 mt-1 space-y-1">
                      {category.subcategories.map((subcategory) => (
                        <button
                          key={subcategory.id}
                          onClick={() => setSelectedCategory(subcategory.id)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                            selectedCategory === subcategory.id
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{subcategory.name}</span>
                            <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                              {subcategory.count}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  รายการสินค้า
                </h1>
                <p className="text-sm text-gray-500">
                  {filteredProducts.length} รายการ
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  ตัวกรอง
                </button>

                <button
                  onClick={() => navigate(`/shopmanage/${shopId}/addproduct`)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  เพิ่มสินค้า
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="ค้นหาสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {selectedProducts.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedProducts.length} รายการที่เลือก
                </span>
                <button className="px-3 py-1.5 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                  ลบที่เลือก
                </button>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    เกิดข้อผิดพลาด
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">{error}</p>
                  <button
                    onClick={() => getProducts()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ลองใหม่
                  </button>
                </div>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1L9 3"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  ไม่มีสินค้า
                </h3>
                <p className="mt-2 text-sm text-gray-500 max-w-sm">
                  เริ่มต้นสร้างแคตตาล็อกสินค้าของคุณโดยเพิ่มสินค้าแรก
                </p>
                <button
                  onClick={() => navigate(`/shopmanage/${shopId}/addproduct`)}
                  className="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  เพิ่มสินค้าแรก
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    onChange={handleSelectAll}
                    checked={
                      selectedProducts.length === currentItems.length &&
                      currentItems.length > 0
                    }
                  />
                  <div className="ml-6 grid grid-cols-12 gap-4 flex-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="col-span-4">สินค้า</div>
                    <div className="col-span-2">ราคา</div>
                    <div className="col-span-2">สต็อก</div>
                    <div className="col-span-2">สถานะ</div>
                    <div className="col-span-2 text-right">การจัดการ</div>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {currentItems.map((product) => (
                  <div
                    key={product.id || product.product_id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={selectedProducts.includes(
                          product.id || product.product_id
                        )}
                        onChange={() =>
                          handleSelectProduct(product.id || product.product_id)
                        }
                      />
                      <div className="ml-6 grid grid-cols-12 gap-4 flex-1 items-center">
                        <div className="col-span-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                              <svg
                                className="h-5 w-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1L9 3"
                                />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {product.product_name}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {product.description || "-"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <span className="text-sm font-medium text-gray-900">
                            ฿{Number(product.price || 0).toLocaleString()}
                          </span>
                        </div>

                        <div className="col-span-2">
                          <StockIndicator stock={product.stock || 0} />
                        </div>

                        <div className="col-span-2">
                          <StatusBadge status={product.is_active} />
                        </div>

                        <div className="col-span-2 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() =>
                                setEditModalOpen({ open: true, product })
                              }
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                            >
                              แก้ไข
                            </button>
                            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 6a1 1 0 110-2 1 1 0 010 2zm0 6a1 1 0 110-2 1 1 0 010 2z"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      แสดง {indexOfFirstItem + 1} -{" "}
                      {Math.min(indexOfLastItem, filteredProducts.length)} จาก{" "}
                      {filteredProducts.length} รายการ
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        ก่อนหน้า
                      </button>

                      <div className="flex items-center space-x-1">
                        {[...Array(totalPages)].map((_, index) => {
                          const page = index + 1;
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                  currentPage === page
                                    ? "bg-blue-600 text-white"
                                    : "border border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {page}
                              </button>
                            );
                          } else if (page === currentPage - 2 || page === currentPage + 2) {
                            return (
                              <span key={page} className="text-gray-400">
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>

                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        ถัดไป
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        title={
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-blue-600"
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
            แก้ไขข้อมูลสินค้า
          </div>
        }
        open={editModalOpen.open}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
        footer={null}
        maskClosable={false}
        destroyOnClose={true}
        className="edit-product-modal"
      >
        {editModalOpen.product && (
          <ProductForm
            product={editModalOpen.product}
            shopId={shopId}
            onSuccess={handleOk}
            onCancel={handleCancel}
          />
        )}
      </Modal>
    </div>
  );
};

export default ProductPage;
export { StatusBadge, StockIndicator };