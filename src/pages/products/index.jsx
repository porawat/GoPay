import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import CoreAPI from "../../store";
import { Modal } from "antd";
import ProductForm from "./modal/productEditForm";

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

const StockIndicator = ({ stock }) => {
  let colorClass = "text-green-600";
  if (stock === 0) colorClass = "text-red-600";
  else if (stock < 10) colorClass = "text-yellow-600";

  return <span className={`font-medium ${colorClass}`}>{stock}</span>;
};

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
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const shopId = params?.shopId || "";
  const [editModalOpen, setEditModalOpen] = useState({
    open: false,
    product: null,
  });
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const fetchFilters = async () => {
    try {
      const warehouseResponse = await CoreAPI.warehouseHttpService.getWarehouses(shopId);
      console.log('Warehouse Response:', JSON.stringify(warehouseResponse, null, 2));
      const warehouseData = warehouseResponse?.datarow || warehouseResponse?.data || [];
      setWarehouses(warehouseData);
      console.log('Set Warehouses:', JSON.stringify(warehouseData, null, 2));

      const categoryResponse = await CoreAPI.categoryHttpService.getCategories();
      console.log('Category Response:', JSON.stringify(categoryResponse, null, 2));
      const categoryData = categoryResponse?.datarow || categoryResponse?.data || [];
      setCategories(categoryData);
      console.log('Set Categories:', JSON.stringify(categoryData, null, 2));

      const supplierResponse = await CoreAPI.supplierHttpService.getSuppliers();
      console.log('Supplier Response:', JSON.stringify(supplierResponse, null, 2));
      const supplierData = supplierResponse?.datarow || supplierResponse?.data || [];
      setSuppliers(supplierData);
      console.log('Set Suppliers:', JSON.stringify(supplierData, null, 2));

      if (!warehouseData.length || !categoryData.length || !supplierData.length) {
        console.warn("Some filter data is empty, relying on product response.");
      }
    } catch (error) {
      console.error("Error fetching filters:", error);
      setWarehouses([]);
      setCategories([]);
      setSuppliers([]);
    }
  };

  const getProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching products for shopId:', shopId);
      const response = await CoreAPI.productHttpService.getproduct(shopId);
      console.log('Product Response:', JSON.stringify(response, null, 2));
      if (response?.code === 1000) {
        const validProducts = (response?.datarow || []).map((product) => ({
          ...product,
          product_name: product.product_name || product.name || "ไม่มีชื่อสินค้า",
          supplier_id: product.supplier_id || null,
          warehouse_id: product.warehouse_id || null,
          category_id: product.category_id || null,
          is_active: product.is_active || "INACTIVE",
        }));
        setProducts(validProducts);
        setFilteredProducts(validProducts);

        const uniqueWarehouses = [
          ...new Map(
            validProducts.map((p) => [p.warehouse_id, p.warehouse])
          ).values(),
        ].filter((w) => w && w.warehouse_id);
        const uniqueCategories = [
          ...new Map(
            validProducts.map((p) => [p.category_id, p.category])
          ).values(),
        ].filter((c) => c && c.category_id);
        const uniqueSuppliers = [
          ...new Map(
            validProducts.map((p) => [p.supplier_id, p.supplier])
          ).values(),
        ].filter((s) => s && s.supplier_id);

        console.log('Extracted Warehouses:', JSON.stringify(uniqueWarehouses, null, 2));
        console.log('Extracted Categories:', JSON.stringify(uniqueCategories, null, 2));
        console.log('Extracted Suppliers:', JSON.stringify(uniqueSuppliers, null, 2));

        setWarehouses((prev) => (prev.length ? prev : uniqueWarehouses));
        setCategories((prev) => (prev.length ? prev : uniqueCategories));
        setSuppliers((prev) => (prev.length ? prev : uniqueSuppliers));
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
    console.log('Shop ID:', shopId);
    getProducts();
    fetchFilters();
  }, [shopId]);

  useEffect(() => {
    console.log('Filtering with:', {
      searchTerm,
      selectedCategory,
      selectedWarehouse,
      selectedSupplier,
    });
    let filtered = products.filter((product) => {
      const productName = product.product_name || product.name || "";
      const matchesSearch = productName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" ||
        product.category_id === selectedCategory;
      const matchesWarehouse =
        selectedWarehouse === "all" ||
        product.warehouse_id === selectedWarehouse;
      const matchesSupplier =
        selectedSupplier === "all" ||
        product.supplier_id === selectedSupplier;
      return matchesSearch && matchesCategory && matchesWarehouse && matchesSupplier;
    });
    console.log('Filtered Products:', JSON.stringify(filtered, null, 2));
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchTerm, products, selectedCategory, selectedWarehouse, selectedSupplier]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(currentItems.map((item) => item.product_uid));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productUid) => {
    setSelectedProducts((prev) =>
      prev.includes(productUid)
        ? prev.filter((id) => id !== productUid)
        : [...prev, productUid]
    );
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
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
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
          {/* Warehouses */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                คลังสินค้า
              </h3>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  console.log('Selecting all warehouses');
                  setSelectedWarehouse("all");
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedWarehouse === "all"
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>ทั้งหมด</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {products.length}
                  </span>
                </div>
              </button>

              {warehouses.length === 0 && (
                <div className="text-sm text-gray-500 px-3 py-2">ไม่มีคลังสินค้า</div>
              )}
              {warehouses.map((warehouse) => (
                <button
                  key={warehouse.warehouse_id}
                  onClick={() => {
                    console.log('Selecting warehouse:', warehouse.warehouse_id);
                    setSelectedWarehouse(warehouse.warehouse_id);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedWarehouse === warehouse.warehouse_id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{warehouse.name || 'ไม่มีชื่อคลัง'}</div>
                      <div className="text-xs text-gray-500">
                        {warehouse.location || '-'}
                      </div>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {products.filter(p => p.warehouse_id === warehouse.warehouse_id).length}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Suppliers */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 1.857h10M12 3a9 9 0 110 18"
                  />
                </svg>
                ผู้ขาย
              </h3>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  console.log('Selecting all suppliers');
                  setSelectedSupplier("all");
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedSupplier === "all"
                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>ทั้งหมด</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {products.length}
                  </span>
                </div>
              </button>

              {suppliers.length === 0 && (
                <div className="text-sm text-gray-500 px-3 py-2">ไม่มีผู้ขาย</div>
              )}
              {suppliers.map((supplier) => (
                <button
                  key={supplier.supplier_id}
                  onClick={() => {
                    console.log('Selecting supplier:', supplier.supplier_id);
                    setSelectedSupplier(supplier.supplier_id);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedSupplier === supplier.supplier_id
                      ? "bg-purple-50 text-purple-700 border border-purple-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{supplier.name || 'ไม่มีชื่อผู้ขาย'}</div>
                      <div className="text-xs text-gray-500">
                        {supplier.contact_info || '-'}
                      </div>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {products.filter(p => p.supplier_id === supplier.supplier_id).length}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                หมวดหมู่
              </h3>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  console.log('Selecting all categories');
                  setSelectedCategory("all");
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === "all"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>ทั้งหมด</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {products.length}
                  </span>
                </div>
              </button>

              {categories.length === 0 && (
                <div className="text-sm text-gray-500 px-3 py-2">ไม่มีหมวดหมู่</div>
              )}
              {categories.map((category) => (
                <button
                  key={category.category_id}
                  onClick={() => {
                    console.log('Selecting category:', category.category_id);
                    setSelectedCategory(category.category_id);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === category.category_id
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category.cat_name || 'ไม่มีหมวดหมู่'}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {products.filter(p => p.category_id === category.category_id).length}
                    </span>
                  </div>
                </button>
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
                <p className="mt-1 text-sm text-gray-500">
                  {filteredProducts.length} รายการ
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
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
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
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
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
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
                <button
                  className="px-3 py-1.5 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
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
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
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
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 8"
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
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
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
                    key={product.product_uid}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={selectedProducts.includes(product.product_uid)}
                        onChange={() => handleSelectProduct(product.product_uid)}
                      />
                      <div className="ml-6 grid grid-cols-12 gap-4 flex-1 items-center">
                        <div className="col-span-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.product_name}
                                  className="h-10 w-10 object-cover rounded-lg"
                                />
                              ) : (
                                <svg
                                  className="h-5 w-5 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 8"
                                  />
                                </svg>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {product.product_name}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {product.description || '-'}
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
                              onClick={() => setEditModalOpen({ open: true, product })}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                            >
                              แก้ไข
                            </button>
                            <button
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
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
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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

        <Modal
          title={
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
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
    </div>
  );
};

export default ProductPage;