import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import CoreAPI from "../../../../store";

export default function ProductMasterForm({
  action = "create",
  onCancel,
  onSuccess,
}) {
  const navigate = useNavigate();
  const { id: employeeId, shopId } = useParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      category_id: "",
      supplier_id: "",
      cost_price: 1,
      selling_price: 1,
      image_url: "",
      status: "ACTIVE",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  const [categoryList, setCategoryList] = useState([]);

  const getCategoryList = async () => {
    const res = await CoreAPI.categoryHttpService.getCategory();
    console.log("API Response:", res);
    const { code, message, data } = res;
    try {
      if (code === 1000) {
        setCategoryList(data);
      } else {
        setCategoryList([]);
        console.error("Error fetching products:", message);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  useEffect(() => {
    getCategoryList();
  }, []);

  const onSubmit = async (postdata) => {
    setIsLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setSubmitError("กรุณาเข้าสู่ระบบ");
      navigate("/login");
      setIsLoading(false);
      return;
    }
    console.log("Form data:", postdata);
    const res = await CoreAPI.productMasterHttpService.createproductMaster(
      postdata
    );
    console.log("API Response:", res);
    const { code, message, data } = res;
    if (code === 1000) {
      setSubmitSuccess("บันทึกข้อมูลสำเร็จ");
      setIsLoading(false);
      onSuccess(true);
      reset();
      setTimeout(() => {
        setSubmitSuccess(null);
        onCancel();
      }, 2000);
    } else {
      setSubmitError("ไม่สามารถบันทึกข้อมูลได้: " + message);
      setIsLoading(false);
    }
  };
  return (
    <div className="bg-white p-8 rounded-lg ">
      <h2 className="text-2xl font-semibold mb-6">
        {action === "edit" ? "แก้ไขข้อมูลสินค้า" : "เพิ่มสินค้า"}
      </h2>

      {submitSuccess && (
        <p className="text-green-700 bg-green-100 p-3 rounded mb-4">
          {submitSuccess}
        </p>
      )}
      {submitError && (
        <p className="text-red-700 bg-red-100 p-3 rounded mb-4">
          {submitError}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            ชื่อสินค้า<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="ชื่อ"
            className={`w-full p-3 bg-white rounded border ${
              errors.first_name ? "border-red-500" : "border-gray-300"
            } text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            {...register("name", {
              required: "ต้องระบุชื่อ",
              minLength: {
                value: 2,
                message: "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร",
              },
            })}
          />
          {errors.first_name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            SKU<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="SKU สินค้า"
            className={`w-full p-3 bg-white rounded border ${
              errors.sku ? "border-red-500" : "border-gray-300"
            } text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            {...register("sku", {
              required: "ต้องระบุ sku",
              minLength: {
                value: 5,
                message: "sku ต้องมีอย่างน้อย 5 ตัวอักษร",
              },
            })}
          />
          {errors.sku && (
            <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">รายละเอียด</label>
          <input
            type="text"
            placeholder="รายละเอียด"
            className={`w-full p-3 bg-white rounded border ${
              errors.description ? "border-red-500" : "border-gray-300"
            } text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            {...register("description")}
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {action === "create" && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              หมวดหมู่
              <span className="text-red-500">*</span>
            </label>
            <select
              className={`w-full p-3 bg-white rounded border ${
                errors.category_id ? "border-red-500" : "border-gray-300"
              } text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              {...register("category_id", { required: "ต้องเลือกหมวดหมู่" })}
            >
              <option value="">-- เลือกหมวดหมู่ --</option>
              {categoryList.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.cat_name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-red-500 text-xs mt-1">
                {errors.category_id.message}
              </p>
            )}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            ราคาต้นทุน<span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            placeholder="ราคาต้นทุน"
            className={`w-full p-3 bg-white rounded border ${
              errors.cost_price ? "border-red-500" : "border-gray-300"
            } text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            {...register("cost_price", {
              required: "ต้องระบุราคาต้นทุน",
              min: {
                value: 1,
                message: "ราคาต้นทุนต้องมากกว่าหรือเท่ากับ 1",
              },
            })}
          />
          {errors.cost_price && (
            <p className="text-red-500 text-xs mt-1">
              {errors.cost_price.message}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            ราคาแนะนำ<span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            placeholder="ราคาแนะนำ"
            className={`w-full p-3 bg-white rounded border ${
              errors.selling_price ? "border-red-500" : "border-gray-300"
            } text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            {...register("selling_price", {
              required: "ต้องระบุราคาแนะนำ",
              min: {
                value: 1,
                message: "ราคาแนะนำต้องมากกว่าหรือเท่ากับ 1",
              },
              message: "ต้องระบุราคาแนะนำ",
            })}
          />
          {errors.selling_price && (
            <p className="text-red-500 text-xs mt-1">
              {errors.selling_price.message}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            สถานะ<span className="text-red-500">*</span>
          </label>
          <select
            className={`w-full p-3 bg-white rounded border ${
              errors.status ? "border-red-500" : "border-gray-300"
            } text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            {...register("status", { required: "ต้องเลือกสถานะ" })}
          >
            <option value="ACTIVE">ใช้งาน</option>
            <option value="INACTIVE">ไม่ใช้งาน</option>
            <option value="SUSPENDED">ระงับ</option>
          </select>
          {errors.status && (
            <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>
          )}
        </div>

        <div className="flex justify-end mt-6 space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading
              ? "กำลังดำเนินการ..."
              : action === "edit"
              ? "บันทึกการแก้ไข"
              : "เพิ่มสินค้า"}
          </button>
        </div>
      </form>
    </div>
  );
}
