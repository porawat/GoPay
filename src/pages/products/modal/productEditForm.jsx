import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { FaCamera } from "react-icons/fa";
import { IconClose } from "../../../components/icons";
import {
  AnimatedContainer,
  StyledHover,
} from "../../../components/Container/index.jsx";

import { H1, Text, Text2 } from "../../../components/Typography/index.jsx";
import CoreAPI from "../../../store/index.js";
const ProductForm = ({ productId, onClose }) => {
  // console.log(productId);

  const [preview, setPreview] = useState(null);
  const [productData, setProductData] = useState({});
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: productData });

  const fetchProduct = async () => {
    try {
      const res = await CoreAPI.productHttpService.getProductDetail({
        product_id: productId.product_id,
        shop_id: productId.shop_id,
      });

      console.log(res);
      const { datarow, code } = res;
      if (code === 1000) {
        setProductData({
          product_uid: datarow.product_uid,
          product_id: datarow.product_id,
          shop_id: datarow.shop_id,
          product_name: datarow.product_name,
          description: datarow.description,
          price: datarow.price,
          stock: datarow.stock,
          is_active: datarow.is_active,
        });
        reset({
          product_name: datarow.product_name,
          description: datarow.description,
          price: datarow.price,
          stock: datarow.stock,
          is_active: datarow.is_active,
        });

        if (datarow?.image_url) {
          setPreview(datarow.image_url);
        }
      }
    } catch (err) {
      console.error("ไม่สามารถโหลดข้อมูลสินค้า:", err);
    }
  };
  useEffect(() => {
    fetchProduct();
  }, [productId, reset]);

  const onSubmit = async (formData) => {
    const form = new FormData();
    form.append("product_name", formData.product_name);
    form.append("description", formData.description);
    form.append("price", formData.price);
    form.append("stock", formData.stock);
    form.append("is_active", formData.is_active);
    if (
      formData.image &&
      formData.image.length > 0 &&
      formData.image[0] instanceof File
    ) {
      form.append("image", formData.image[0]);
    }

    formData.product_id = productData.product_id;
    formData.shop_id = productData.shop_id;
    formData.product_uid = productData.product_uid;
    console.log("formData:", formData);
    // try {
    //   await axios.put(`/api/products/${productId}`, form, {
    //     headers: { "Content-Type": "multipart/form-data" },
    //   });
    //   alert("อัปเดตสำเร็จ");
    // } catch (err) {
    //   console.error("อัปเดตสินค้าไม่สำเร็จ:", err);
    // }
  };

  const handleImagePreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className=" flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4 p-2">
        <H1 color="#ffffff">Tracking</H1>
        <StyledHover onClick={onClose}>
          <IconClose />
        </StyledHover>
      </div>

      <div className="flex flex-col md:flex-row gap-4 p-2 h-3/4 overflow-y-auto">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto"
        >
          {/* Avatar รูปภาพ */}
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32 group">
              <img
                src={preview || "https://placehold.co/400"}
                alt="Product Avatar"
                className="w-32 h-32 object-cover rounded-full border shadow"
              />
              <label
                htmlFor="image-upload"
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <FaCamera className="text-white text-2xl" />
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                {...register("image")}
                onChange={handleImagePreview}
                className="hidden"
              />
            </div>
          </div>

          {/* ส่วนอื่นของฟอร์ม */}
          <div className="mb-4">
            <label className="block mb-1 font-medium">ชื่อสินค้า</label>
            <input
              type="text"
              {...register("product_name", { required: "กรุณากรอกชื่อสินค้า" })}
              className="w-full border rounded px-3 py-2"
            />
            {errors.product_name && (
              <p className="text-red-500 text-sm">
                {errors.product_name.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">คำอธิบาย</label>
            <input
              type="text"
              {...register("description")}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1 font-medium">ราคา (บาท)</label>
              <input
                type="number"
                step="0.01"
                {...register("price", { required: true })}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">สต็อก</label>
              <input
                type="number"
                {...register("stock", { required: true })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">สถานะ</label>
            <select
              {...register("is_active")}
              className="w-full border rounded px-3 py-2"
            >
              <option value="ACTIVE">ใช้งาน</option>
              <option value="INACTIVE">ไม่ใช้งาน</option>
            </select>
          </div>

          <div className="text-right">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
