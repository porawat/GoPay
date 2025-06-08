import React, { useEffect, useState } from "react";
import CoreAPI from "../../store";
import { useParams } from "react-router-dom";
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
  else if (stock <= 20) colorClass = "text-orange-600";

  return <span className={`font-medium ${colorClass}`}>{stock}</span>;
};

const ProductManagementUI = () => {
  const { shopId } = useParams();
  const [categories, setCategoryList] = useState([]);
  const [masterProducts, setMasterProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getCategorys = async () => {
    try {
      const res = await CoreAPI.categoryHttpService.getCategory();

      const { data, code } = res;
      if (code === 1000) {
        const categoriesWithCount = data.map((category) => ({
          ...category,
          count: 0,
        }));
        setCategoryList(categoriesWithCount);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const getprodoctMaster = async () => {
    try {
      const res = await CoreAPI.productMasterHttpService.getproductMasterByid(
        selectedCategory
      );
      const { data, code } = res;
      if (code === 1000) {
        setMasterProducts(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    console.log(selectedCategory);
    getprodoctMaster();
  }, [selectedCategory]);

  useEffect(() => {
    getCategorys();
  }, []);

  const [sellers] = useState([
    { id: "s1", name: "สมชาย", shop: "ร้านเครื่องดื่มสมชาย" },
    { id: "s2", name: "สมหญิง", shop: "ร้านขนมสมหญิง" },
    { id: "s3", name: "สมศักดิ์", shop: "ร้านอาหารแห้งสมศักดิ์" },
    { id: "s4", name: "สมปอง", shop: "ร้านเครื่องใช้ไฟฟ้าสมปอง" },
  ]);

  const filteredProducts = masterProducts.filter((product) => {
    const matchCategory =
      selectedCategory === "all" || product.category_id === selectedCategory;
    const matchSearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchCategory && matchSearch;
  });

  const handleProductSelect = (product) => {
    setSelectedProducts((prev) => {
      // Check if product is already selected
      const isSelected = prev.some((p) => p.product_id === product.product_id);

      if (isSelected) {
        // Remove product if already selected
        return prev.filter((p) => p.product_id !== product.product_id);
      } else {
        // Add product if not selected
        const newProduct = {
          ...product,
          tempId: Date.now(),
          price: product.selling_price,
          editStock: 0,
          sellerId: "",
          shop_id: shopId,
        };
        return [...prev, newProduct];
      }
    });
  };

  const handlePriceChange = (tempId, newPrice) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.tempId === tempId
          ? { ...product, price: newPrice || 0 }
          : product
      )
    );
  };

  const handleStockChange = (tempId, newStock) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.tempId === tempId
          ? { ...product, editStock: newStock || 0 }
          : product
      )
    );
  };

  const handleSellerChange = (tempId, sellerId) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.tempId === tempId ? { ...product, sellerId } : product
      )
    );
  };

  const removeProduct = (tempId) => {
    setSelectedProducts((prev) => prev.filter((p) => p.tempId !== tempId));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Select all current visible items that aren't already selected
      const newSelectedProducts = currentItems
        .filter(
          (item) =>
            !selectedProducts.some((p) => p.product_id === item.product_id)
        )
        .map((item) => ({
          ...item,
          tempId: Date.now() + item.product_id,
          price: item.selling_price || 0,
          editStock: 0,
          sellerId: "",
        }));

      setSelectedProducts((prev) => [...prev, ...newSelectedProducts]);
    } else {
      // Unselect only current visible items
      setSelectedProducts((prev) =>
        prev.filter(
          (item) =>
            !currentItems.some(
              (current) => current.product_id === item.product_id
            )
        )
      );
    }
  };

  const addProduct = async () => {
    console.log("Click");

    // setIsSubmitting(true);

    // Validate required fields
    const invalidProducts = selectedProducts.filter(
      (product) => !product.price || !product.editStock
    );

    if (invalidProducts.length > 0) {
      console.error("กรุณากรอกข้อมูลให้ครบถ้วน (ราคา, จำนวน, ผู้ขาย)");
      return;
    }

    const products = selectedProducts.map((product) => ({
      product_id: product.product_id,
      shop_id: shopId,
      price: parseFloat(product.price),
      stock: parseInt(product.editStock),
      product_name: product.name,
      description: product.description || "",
      image_url: product.image_url,
      is_active: "ACTIVE",
    }));
    console.log(products);

    try {
      const response = await CoreAPI.productHttpService.createProduct({
        products,
      });
      console.log(response);
      if (response.code === 1000) {
        // message.success("เพิ่มสินค้าสำเร็จ");
        setSelectedProducts([]);
        getprodoctMaster(); // Refresh product list
      } else {
        throw new Error(response.message || "เกิดข้อผิดพลาดในการเพิ่มสินค้า");
      }
    } catch (error) {
      console.error("Error adding products:", error);
      // message.error(error.message || "เกิดข้อผิดพลาดในการเพิ่มสินค้า");
    } finally {
      setIsSubmitting(false);
    }
  };
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
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
          {/* Categories Section */}
          <div className="p-4">
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
                onClick={() => setSelectedCategory("all")}
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
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.category_id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === category.category_id
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category.cat_name}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {category.count}
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
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  กลับ
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
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            {selectedProducts.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedProducts.length} รายการที่เลือก
                </span>
                <button
                  onClick={() => setSelectedProducts([])}
                  className="px-3 py-1.5 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  ลบที่เลือก
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={
                    currentItems.length > 0 &&
                    currentItems.every((item) =>
                      selectedProducts.some(
                        (p) => p.product_id === item.product_id
                      )
                    )
                  }
                  onChange={handleSelectAll}
                  onClick={(e) => e.stopPropagation()}
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
              {currentItems.length === 0 ? (
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
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7h16"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    ไม่พบสินค้า
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    ไม่พบสินค้าที่ตรงกับการค้นหาของคุณ
                  </p>
                </div>
              ) : (
                currentItems.map((product) => (
                  <div
                    key={product.product_id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={selectedProducts.some(
                          (p) => p.product_id === product.product_id
                        )}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleProductSelect(product);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="ml-6 grid grid-cols-12 gap-4 flex-1 items-center">
                        <div className="col-span-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-lg">
                                {product.image_url}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {product.name}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-sm font-medium text-gray-900">
                            ฿{product.selling_price}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <StockIndicator stock={product.stock} />
                        </div>
                        <div className="col-span-2">
                          <StatusBadge status={product.status} />
                        </div>
                        <div className="col-span-2 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              แก้ไข
                            </button>
                            <button
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
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
                ))
              )}
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
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
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
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
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

          {selectedProducts.length > 0 && (
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <h3 className="text-base font-medium text-gray-900">
                    รายการสินค้าที่เลือก
                  </h3>
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {selectedProducts.length} รายการ
                  </span>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto mb-6">
                <div className="space-y-2">
                  {selectedProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <span className="text-lg mr-3">{product.image_url}</span>
                      <span className="flex-1 font-medium text-sm text-gray-700">
                        {product.name}
                      </span>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">ราคา:</span>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={product.price}
                            onChange={(e) =>
                              handlePriceChange(
                                product.tempId,
                                parseFloat(e.target.value)
                              )
                            }
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">จำนวน:</span>
                          <input
                            type="number"
                            min="0"
                            value={product.editStock}
                            onChange={(e) =>
                              handleStockChange(
                                product.tempId,
                                parseInt(e.target.value)
                              )
                            }
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">ผู้ขาย:</span>
                          <select
                            value={product.sellerId}
                            onChange={(e) =>
                              handleSellerChange(product.tempId, e.target.value)
                            }
                            className="w-36 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white cursor-pointer"
                          >
                            <option value="">เลือกผู้ขาย</option>
                            {sellers.map((seller) => (
                              <option key={seller.id} value={seller.id}>
                                {seller.name} ({seller.shop})
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => removeProduct(product.tempId)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  รวม {selectedProducts.length} รายการสินค้า
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedProducts([])}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={addProduct}
                    disabled={isSubmitting}
                    className={`px-4 py-2 text-sm ${
                      isSubmitting
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-md transition-colors`}
                  >
                    {isSubmitting ? "กำลังบันทึก..." : "บันทึกสินค้า"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductManagementUI;
