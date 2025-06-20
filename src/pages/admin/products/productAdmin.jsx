import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Flex, Modal } from "antd";
import ProductMasterForm from "./modal/productModalForm";
import CoreAPI from "../../../store";
import { Table, Tag } from "antd";
import {
  DownOutlined,
  DownloadOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { Dropdown, Space } from "antd";
import ImportFileForm from "./Import-modal/import";
const ProductAdminPage = () => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [productsList, setProductsList] = useState([]);
  const [openImportModal, setOpenImportModal] = useState(false);
  const getProducts = async () => {
    const res = await CoreAPI.productMasterHttpService.getproductMaster();
    console.log("API Response:", res);
    const { code, message, data } = res;

    try {
      if (code === 1000) {
        setProductsList(data);
      } else {
        setProductsList([]);
        console.error("Error fetching products:", message);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  const columns = [
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
    },
    {
      title: "ชื่อสินค้า",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "รายละเอียด",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "ราคาทุน",
      dataIndex: "cost_price",
      key: "cost_price",
      render: (text) => `${parseFloat(text).toFixed(2)} ฿`,
    },
    {
      title: "ราคาขาย",
      dataIndex: "selling_price",
      key: "selling_price",
      render: (text) => `${parseFloat(text).toFixed(2)} ฿`,
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "ACTIVE" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "วันที่เพิ่ม",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];
  const onSuccess = () => {
    setOpenModal(false);
    getProducts();
  };
  useEffect(() => {
    getProducts();
  }, []);
  const handleMenuClick = (e) => {
    if (e.key === "add") {
      console.log("add");
      setOpenModal(true);
    } else if (e.key === "import") {
      console.log("import");
      setOpenImportModal(true);
    }
  };
  const menuProps = {
    items: [
      {
        key: "add",
        label: "เพิ่ม",
        icon: (
          <PlusCircleOutlined style={{ fontSize: "16px", color: "#000" }} />
        ),
      },
      {
        key: "import",
        label: "Import",
        icon: <DownloadOutlined style={{ fontSize: "16px", color: "#000" }} />,
      },
    ],
    onClick: handleMenuClick,
  };
  const onImport = (data) => {
    console.log(data);
    setOpenImportModal(false);
  };
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 text-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-indigo-800">รายการสินค้า</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate(`/admin`)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center shadow-sm"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              กลับ
            </button>
            <Dropdown
              menu={menuProps}
              trigger={["click"]}
              placement="bottom"
              arrow={{ pointAtCenter: true }}
            >
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-sm">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                เพิ่มสินค้าใหม่
              </button>
            </Dropdown>
          </div>
        </div>
        {productsList.length > 0 && (
          <Table
            rowKey="product_id"
            columns={columns}
            dataSource={productsList}
            pagination={{ pageSize: 20 }}
          />
        )}

        {openImportModal && (
          <Modal
            title="Import รายการสินค้า"
            open={openImportModal}
            onCancel={() => setOpenImportModal(false)}
            footer={false}
            maskClosable={false}
            width={500}
            className="rounded-lg shadow-lg"
            centered
          >
            <div className="max-h-[70vh] overflow-y-auto p-4">
              <ImportFileForm
                onCancel={() => setOpenImportModal(false)}
                onImport={onImport}
              />
            </div>
          </Modal>
        )}

        {openModal && (
          <Modal
            title="เพิ่มสินค้าใหม่"
            open={openModal}
            onCancel={() => setOpenModal(false)}
            footer={false}
            maskClosable={false}
            width={500}
            className="rounded-lg shadow-lg"
            centered
          >
            <div className="max-h-[70vh] overflow-y-auto p-4">
              <ProductMasterForm
                action="create"
                onCancel={() => setOpenModal(false)}
                onSuccess={onSuccess}
              />
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};
export default ProductAdminPage;
