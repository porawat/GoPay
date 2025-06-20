import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import CoreAPI from "../../../../store";
import { Select } from 'antd';
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
    setValue,
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
  const [supplierList, setSupplierList] = useState([]);
  const onChange = value => {
  console.log(`selected ${value}`);
};
const onSearch = value => {
  console.log('search:', value);
};
  const getCategoryList = async () => {
    const res = await CoreAPI.categoryHttpService.getCategories();
    console.log("API Response:", res);
    const { code, message, datarow } = res;
    try {
      if (code === 1000) {
        setCategoryList(datarow);
      } else {
        setCategoryList([]);
        console.error("Error fetching products:", message);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
const getsupplier = async ()=>{
  const res = await CoreAPI.supplierHttpService.getSuppliers();
   console.log(res)
  const { code,datarow } = res;

  if(code ===1000){
    setSupplierList(datarow)
  }
 
}

  useEffect(() => {
    getCategoryList();
    getsupplier();
  }, []);

  const onSubmit = async (postdata) => {
  //  setIsLoading(true);
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
    const { code, message } = res;
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

  <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Supplier
            <span className="text-red-500">*</span>
          </label>
         
          <select
            className={`w-full p-3 bg-white rounded border ${
              errors.supplier_id ? "border-red-500" : "border-gray-300"
            } text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            {...register("supplier_id", { required: "ต้องเลือกหมวดหมู่" })}
          >
            <option value="">-- เลือกหมวดหมู่ --</option>
            {supplierList.map((item) => (
              <option key={item.supplier_id} value={item.supplier_id}>
                {item.name}
              </option>
            ))}
          </select>
          {errors.supplier_id && (
            <p className="text-red-500 text-xs mt-1">
              {errors.supplier_id.message}
            </p>
          )}
        
</div>
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
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="SKU สินค้า"
              className={`flex-1 p-3 bg-white rounded border ${
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
            <button
              type="button"
              onClick={() => {
                // สร้าง SKU อัตโนมัติ
                const generateSKU = () => {
                  // สร้างตัวย่อจากหมวดหมู่ (ถ้ามีการเลือกหมวดหมู่)
                  const categoryPrefix = (() => {
                    const selectedCategoryId = document.querySelector(
                      'select[name="category_id"]'
                    )?.value;
                    if (selectedCategoryId) {
                      const selectedCategory = categoryList.find(
                        (cat) => cat.category_id === selectedCategoryId
                      );
                      if (selectedCategory) {
                        // ใช้ตัวอักษรแรกของแต่ละคำในชื่อหมวดหมู่
                        return selectedCategory.cat_prefix
                          .split(" ")
                          .map((word) => word)

                          .join("")
                          .toUpperCase();
                      }
                    }
                    return "PRD"; // ค่าเริ่มต้นถ้าไม่มีหมวดหมู่
                  })();

                  // สร้างส่วนที่เป็นตัวเลข (timestamp)
                  const timestamp = Date.now().toString().slice(-6);

                  // สร้างตัวอักษรสุ่ม 2 ตัว
                  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                  const randomChars = [...Array(2)]
                    .map(() =>
                      chars.charAt(Math.floor(Math.random() * chars.length))
                    )
                    .join("");

                  return `${categoryPrefix}-${timestamp}${randomChars}`;
                };

                // อัพเดต field ด้วย SKU ที่สร้างขึ้น
                const generatedSKU = generateSKU();
                const field = "sku";
                const fieldValue = generatedSKU;

                // ใช้ setValue จาก useForm เพื่อตั้งค่า field
                setValue(field, fieldValue, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
              className="px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              สร้าง SKU
            </button>
          </div>
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
