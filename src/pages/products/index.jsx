import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import PropTypes from "prop-types"; // ต้องติดตั้งด้วย `npm install prop-types`
import CoreAPI from "../../store";
import { Button, Flex, Modal } from "antd";
import ProductForm from "./modal/productEditForm";
import styled from "styled-components";
const ProductPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const shopId = params?.shopId || "";
  const [editModalOpen, setEditModalOpen] = useState({
    open: false,
    product: null,
  });

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
  const handleOk = (e) => {
    console.log(e);
    setOpen(false);
    getProducts();
  };
  const handleCancel = (e) => {
    // console.log(e);
    setEditModalOpen({ open: false, product: null });
    false;
  };
  useEffect(() => {
    getProducts();
  }, [shopId]);

  // ฟังก์ชันค้นหา
  useEffect(() => {
    const filtered = products.filter((product) => {
      const productName = product.product_name || product.name || "";
      return productName.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // กำหนดคอลัมน์สำหรับ DataTable
  const columns = [
    {
      name: "ชื่อสินค้า",
      selector: (row) => row.product_name,
      sortable: true,
      wrap: true,
      cell: (row) => (
        <span className="font-medium text-gray-800">{row.product_name}</span>
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
      name: "ราคา (บาท)",
      selector: (row) => row.price,
      sortable: true,
      cell: (row) => (
        <span className="text-indigo-600 font-medium">
          {Number(row.price).toFixed(2)}
        </span>
      ),
    },
    {
      name: "สต็อก",
      selector: (row) => row.stock,
      sortable: true,
      cell: (row) => (
        <span
          className={`font-medium ${
            row.stock > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {row.stock}
        </span>
      ),
    },
    {
      name: "สถานะ",
      selector: (row) => row.is_active,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.is_active === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.is_active === "ACTIVE" ? "ใช้งาน" : "ไม่ใช้งาน"}
        </span>
      ),
    },
    {
      name: "การจัดการ",
      cell: (row) => (
        <button
          onClick={() => setEditModalOpen({ open: true, product: row })}
          className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        >
          แก้ไข
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-8 px-4">
      <div className="w-full max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 px-6 py-6 relative">
          <button
            onClick={() => navigate(`/shopmanage/${shopId}`)}
            className="absolute top-6 left-6 md:hidden p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
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
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                รายการสินค้า
              </h2>
              <p className="text-indigo-100 mt-2 text-sm">
                จัดการสินค้าทั้งหมดในร้านของคุณ
              </p>
            </div>
            <button
              onClick={() => navigate(`/shopmanage/${shopId}/addproduct`)}
              className="mt-4 md:mt-0 px-6 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors flex items-center"
            >
              <svg
                className="h-5 w-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              เพิ่มสินค้า
            </button>
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
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <svg
                className="h-16 w-16 text-gray-400 mb-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a8 8 0 100 16 8 8 0 000-16zM7 9a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                ไม่พบสินค้า
              </h2>
              <p className="text-gray-600 mb-4">
                กรุณาเพิ่มสินค้าใหม่สำหรับร้านของคุณ
              </p>
              <button
                onClick={() => navigate(`/shopmanage/${shopId}/addproduct`)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors flex items-center"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                เพิ่มสินค้า
              </button>
            </div>
          ) : (
            <div>
              {/* Search Bar */}
              <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
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
                    placeholder="ค้นหาสินค้าตามชื่อ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm"
                  />
                </div>
              </div>

              {/* DataTable */}
              <DataTable
                columns={columns}
                data={filteredProducts}
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 25, 50]}
                customStyles={customStyles}
                noDataComponent={
                  <div className="py-8 text-center text-gray-600">
                    ไม่พบสินค้าที่ตรงกับคำค้นหา
                  </div>
                }
                highlightOnHover
                pointerOnHover
                responsive
              />
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

      {editModalOpen.open && (
        <Modal
          title={false}
          footer={false}
          open={editModalOpen.open}
          onOk={handleOk}
          onCancel={handleCancel}
          maskClosable={false}
          centered // <-- บังคับให้ modal อยู่ตรงกลาง ไม่ลอยขึ้นลง
          keyboard={false}
        >
          <ProductForm
            productId={editModalOpen.product}
            onClose={() => setEditModalOpen({ open: false, product: null })}
            onSuccesss={() => {
              getProducts();
              setEditModalOpen({ open: false, product: null });
            }}
          />
        </Modal>
      )}
    </div>
  );
};

// ลบส่วนนี้หากไม่ต้องการใช้ PropTypes หรือยังไม่ได้ติดตั้ง prop-types
ProductPage.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      product_uid: PropTypes.string,
      product_id: PropTypes.string,
      product_name: PropTypes.string,
      name: PropTypes.string, // รองรับกรณี API ส่ง name
      price: PropTypes.number,
      stock: PropTypes.number,
      is_active: PropTypes.string,
      description: PropTypes.string,
    })
  ),
};

export default ProductPage;

const ClassificationContainerWrapper = styled.div`
  position: absolute;
  border: 1px solid #15181c;
  border-radius: 8px;
  right: 10px;
  z-index: 2000;
  bottom: 16px;
  top: 2px;
  display: flex;
  background: radial-gradient(
        396.06% 200.48% at 15.69% 86.61%,
        rgba(124, 135, 254, 0.49485) 0%,
        rgba(11, 252, 243, 0.7) 0%,
        rgba(11, 252, 243, 0) 100%
      )
      /* warning: gradient uses a rotation that is not supported by CSS and may not behave as expected */,
    linear-gradient(0deg, rgba(12, 25, 57, 0.5), rgba(12, 25, 57, 0.5)),
    linear-gradient(0deg, rgba(12, 25, 57, 0.2), rgba(12, 25, 57, 0.2));
`;
