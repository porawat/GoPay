import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, Package, Truck, ShoppingCart, Zap, Palette, MoreHorizontal } from 'lucide-react';

const ProductManagementUI = () => {
  const [categories] = useState([
    { id: 1, name: "เครื่องดื่ม", count: 15, color: "#1890ff" },
    { id: 2, name: "ขนม", count: 28, color: "#52c41a" },
    { id: 3, name: "อาหารแห้ง", count: 12, color: "#fa8c16" },
    { id: 4, name: "เครื่องใช้ไฟฟ้า", count: 8, color: "#eb2f96" },
    { id: 5, name: "เครื่องสำอาง", count: 20, color: "#722ed1" }
  ]);

  const [masterProducts] = useState([
    { 
      id: 1, 
      name: "โค้ก 325ml", 
      description: "เครื่องดื่มโค้ก ขนาด 325 มิลลิลิตร", 
      selling_price: 15.00, 
      category_id: 1,
      category: "เครื่องดื่ม",
      status: "ACTIVE",
      image: "🥤"
    },
    { 
      id: 2, 
      name: "เปปซี่ 325ml", 
      description: "เครื่องดื่มเปปซี่ ขนาด 325 มิลลิลิตร", 
      selling_price: 15.00, 
      category_id: 1,
      category: "เครื่องดื่ม",
      status: "ACTIVE",
      image: "🥤"
    },
    { 
      id: 3, 
      name: "ลูกอม", 
      description: "ลูกอมรสผลไม้", 
      selling_price: 5.00, 
      category_id: 2,
      category: "ขนม",
      status: "ACTIVE",
      image: "🍬"
    },
    { 
      id: 4, 
      name: "ชิปส์", 
      description: "ขนมปังกรอบรสชีส", 
      selling_price: 25.00, 
      category_id: 2,
      category: "ขนม",
      status: "ACTIVE",
      image: "🍟"
    },
    { 
      id: 5, 
      name: "น้ำส้ม", 
      description: "น้ำส้มคั้นสด 100%", 
      selling_price: 20.00, 
      category_id: 1,
      category: "เครื่องดื่ม",
      status: "ACTIVE",
      image: "🍊"
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setScreenHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredProducts = masterProducts.filter(product => {
    const matchCategory = !selectedCategory || product.category_id === selectedCategory.id;
    const matchSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleProductSelect = (product) => {
    const isAlreadySelected = selectedProducts.some(p => p.id === product.id);
    if (!isAlreadySelected) {
      const newProduct = {
        ...product,
        tempId: Date.now(),
        price: product.selling_price,
        stock: 0
      };
      setSelectedProducts(prev => [...prev, newProduct]);
    }
    setSelectedProduct(product);
  };

  const handlePriceChange = (tempId, newPrice) => {
    setSelectedProducts(prev => 
      prev.map(product => 
        product.tempId === tempId 
          ? { ...product, price: parseFloat(newPrice) || 0 }
          : product
      )
    );
  };

  const handleStockChange = (tempId, newStock) => {
    setSelectedProducts(prev => 
      prev.map(product => 
        product.tempId === tempId 
          ? { ...product, stock: parseInt(newStock) || 0 }
          : product
      )
    );
  };

  const removeProduct = (tempId) => {
    setSelectedProducts(prev => prev.filter(p => p.tempId !== tempId));
  };

  // Calculate heights
  const topSectionHeight = Math.floor((screenHeight - 200) * 0.6);
  const bottomSectionHeight = Math.floor((screenHeight - 200) * 0.4);

  const sidebarCategories = [
    { name: 'ร้านค้า', count: 275, icon: Package, color: 'text-blue-600', bgColor: 'bg-blue-50', isMain: true },
    { name: 'ร้านค้าหลัก', count: 150, icon: Package, color: 'text-gray-600', bgColor: 'bg-gray-50', indent: true },
    { name: 'ร้านค้าสาขาเหนือ', count: 75, icon: ShoppingCart, color: 'text-gray-600', bgColor: 'bg-gray-50', indent: true },
    { name: 'ร้านค้าสาขาใต้', count: 50, icon: ShoppingCart, color: 'text-gray-600', bgColor: 'bg-gray-50', indent: true },
    { name: 'หมวดสินค้า', count: masterProducts.length, icon: ShoppingCart, color: 'text-green-600', bgColor: 'bg-green-50', isMain: true, isSelected: true },
    ...categories.map(cat => ({
      name: cat.name,
      count: cat.count,
      icon: Package,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      indent: true,
      categoryData: cat
    }))
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <ArrowLeft className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700" />
            <h1 className="text-lg font-semibold text-gray-900">จัดการสินค้า</h1>
          </div>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {sidebarCategories.map((category, index) => {
              const Icon = category.icon;
              const isSelected = category.isSelected || (selectedCategory && selectedCategory.name === category.name);
              return (
                <div
                  key={index}
                  className={`
                    flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-150
                    ${category.isMain ? 'font-medium' : 'font-normal'}
                    ${category.indent ? 'ml-4' : ''}
                    ${isSelected
                      ? `${category.bgColor} ${category.color}` 
                      : 'hover:bg-gray-50 text-gray-700'
                    }
                  `}
                  onClick={() => {
                    if (category.categoryData) {
                      handleCategorySelect(category.categoryData);
                    } else if (category.name === 'หมวดสินค้า') {
                      setSelectedCategory(null);
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`
                      text-xs px-2 py-1 rounded-full
                      ${isSelected
                        ? 'bg-white/70 text-gray-700' 
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      {category.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">รายการสินค้า</h2>
              <p className="text-sm text-gray-500 mt-1">{filteredProducts.length} รายการ</p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาสินค้า..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto bg-white">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สินค้า
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ราคา
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สต็อก
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    ไม่พบสินค้า
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                      selectedProduct?.id === product.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleProductSelect(product)}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-lg">{product.image}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900 font-medium">฿{product.selling_price.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-green-600">
                        {Math.floor(Math.random() * 100) + 10}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        • ใช้งาน
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Section - Selected Products */}
        {selectedProducts.length > 0 && (
          <div className="border-t border-gray-200 bg-white" style={{ height: `${bottomSectionHeight}px` }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">รายการสินค้าที่เลือก</h3>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                  {selectedProducts.length} รายการ
                </span>
              </div>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedProducts.map((product) => (
                  <div key={product.tempId} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center">
                    <span className="text-xl mr-3">{product.image}</span>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">ราคา:</span>
                        <input
                          type="number"
                          className="w-24 p-2 border border-gray-300 rounded text-center text-sm"
                          placeholder="0.00"
                          min="0.01"
                          step="0.01"
                          defaultValue={product.price}
                          onChange={(e) => handlePriceChange(product.tempId, e.target.value)}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">จำนวน:</span>
                        <input
                          type="number"
                          className="w-20 p-2 border border-gray-300 rounded text-center text-sm"
                          placeholder="0"
                          min="0"
                          step="1"
                          defaultValue={product.stock}
                          onChange={(e) => handleStockChange(product.tempId, e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => removeProduct(product.tempId)}
                        className="text-red-400 hover:text-red-600 font-bold text-lg px-2"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between items-center">
                <span className="text-gray-600">
                  รวม {selectedProducts.length} รายการสินค้า
                </span>
                <div className="space-x-3">
                  <button 
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedProducts([])}
                  >
                    ยกเลิก
                  </button>
                  <button className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    บันทึกสินค้า
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagementUI;