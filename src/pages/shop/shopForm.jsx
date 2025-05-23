import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Camera } from "lucide-react";
import { useForm } from "react-hook-form";
import { API_URL } from "../../config/config";
import axios from "axios";

export default function ShopForm({ action = "create" }) {
  const navigate = useNavigate();
  const { id: shopId } = useParams(); // ดึง shopId จาก URL (สำหรับโหมด edit)
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      shopName: "",
      shopSlugId: "",
      tel: "",
      email: "",
      contact_person: "",
    },
  });

  const [fileData, setFileData] = useState({
    avatar: null,
    cover: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // ดึงข้อมูลร้านค้าสำหรับโหมดแก้ไข
  useEffect(() => {
    if (action === "edit" && shopId) {
      const fetchShop = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          setSubmitError("กรุณาเข้าสู่ระบบ");
          navigate("/");
          return;
        }

        try {
          const response = await axios.get(`${API_URL}/shop/${shopId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data.code === 1000 && response.data.datarow) {
            const shopData = response.data.datarow;
            // เติมข้อมูลลงในฟอร์ม
            reset({
              shopName: shopData.shop_name || "",
              shopSlugId: shopData.slug_id || "",
              tel: shopData.shop_tel || "",
              email: shopData.email || "",
              contact_person: shopData.contact_name || "",
            });
            // ตั้งค่า preview สำหรับ avatar และ cover ถ้ามี
            if (shopData.avatar) {
              setAvatarPreview(`${API_URL}/files/uploads/${shopData.avatar}`);
            }
            if (shopData.cover) {
              setCoverPreview(`${API_URL}/files/uploads/${shopData.cover}`);
            }
          } else {
            setSubmitError("ไม่สามารถดึงข้อมูลร้านค้าได้");
          }
        } catch (error) {
          setSubmitError(
            "เกิดข้อผิดพลาดในการดึงข้อมูล: " +
              (error.response?.data?.message || error.message)
          );
        }
      };

      fetchShop();
    }
  }, [action, shopId, reset, navigate]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("ไฟล์ใหญ่เกินไป (สูงสุด 5MB)");
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น");
        return;
      }
      setFileData((prev) => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("ไฟล์ใหญ่เกินไป (สูงสุด 5MB)");
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น");
        return;
      }
      setFileData((prev) => ({ ...prev, cover: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setSubmitError("กรุณาเข้าสู่ระบบก่อนดำเนินการ");
      navigate("/");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });

    if (fileData.avatar) {
      formData.append("avatar", fileData.avatar);
    }
    if (fileData.cover) {
      formData.append("cover", fileData.cover);
    }

    try {
      const isEditMode = action === "edit" && shopId;
      const url = isEditMode
        ? `${API_URL}/shop/updateshop/${shopId}`
        : `${API_URL}/shop/createshop`;
      const method = isEditMode ? "put" : "post";

      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.code === 1000) {
        setSubmitSuccess(
          isEditMode
            ? "บันทึกการแก้ไขเรียบร้อยแล้ว!"
            : "ร้านค้าถูกสร้างเรียบร้อยแล้ว!"
        );
        if (!isEditMode) {
          // รีเซ็ตฟอร์มสำหรับโหมดสร้าง
          reset();
          setFileData({ avatar: null, cover: null });
          setAvatarPreview(null);
          setCoverPreview(null);
          if (avatarInputRef.current) avatarInputRef.current.value = "";
          if (coverInputRef.current) coverInputRef.current.value = "";
        }
        // นำทางกลับไปยังหน้า myshop หลังจากบันทึก
        setTimeout(() => {
          setSubmitSuccess(null);
          navigate("/myshop");
        }, 2000);
      } else {
        setSubmitError(
          response.data.message || "เกิดข้อผิดพลาดในการดำเนินการ"
        );
      }
    } catch (error) {
      let errorMessage = `เกิดข้อผิดพลาดในการ${
        action === "edit" ? "แก้ไข" : "สร้าง"
      }ร้านค้า`;
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "ไม่พบ endpoint API กรุณาตรวจสอบ URL หรือเซิร์ฟเวอร์";
        } else if (error.response.status === 401) {
          errorMessage = "การยืนยันตัวตนล้มเหลว กรุณาเข้าสู่ระบบใหม่";
          navigate("/");
        } else if (error.response.status === 400) {
          errorMessage = error.response.data.message || "ข้อมูลที่ส่งไม่ถูกต้อง";
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      }
      setSubmitError(errorMessage);
      console.error("Error details:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-gray-900 text-gray-200">
      <div className="flex flex-col gap-6">
        {/* Cover Image */}
        <div className="relative w-full h-48">
          <div
            className="w-full h-48 bg-gray-800 flex items-center justify-center cursor-pointer"
            onClick={() => coverInputRef.current.click()}
          >
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Cover Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Camera size={20} />
                <span>เพิ่มภาพปก</span>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={coverInputRef}
            onChange={handleCoverChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Avatar */}
        <div
          className="relative flex justify-center"
          style={{ marginTop: "-5rem", zIndex: 10 }}
        >
          <div
            className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center cursor-pointer overflow-hidden border-4 border-gray-900"
            onClick={() => avatarInputRef.current.click()}
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <Camera size={24} />
                <span className="text-sm mt-1">เพิ่มรูปภาพ</span>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={avatarInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Form fields */}
        <div className="p-6 bg-gray-800 rounded -mt-24 mb-32">
          <h2 className="text-xl mb-6">
            {action === "edit" ? "แก้ไขข้อมูลร้านค้า" : "สร้างข้อมูลร้านค้า"}
          </h2>

          {submitSuccess && (
            <p className="text-green-500 mb-4">{submitSuccess}</p>
          )}
          {submitError && <p className="text-red-500 mb-4">{submitError}</p>}

          <div className="mb-4">
            <label className="block text-sm mb-1">
              ชื่อร้านค้า<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="ชื่อร้านค้า"
              className={`w-full p-2 bg-gray-700 rounded border ${
                errors.shopName ? "border-red-500" : "border-gray-600"
              } text-white`}
              {...register("shopName", {
                required: "ต้องระบุชื่อร้านค้า",
                minLength: {
                  value: 3,
                  message: "ชื่อร้านค้าต้องมีอย่างน้อย 3 ตัวอักษร",
                },
                maxLength: {
                  value: 24,
                  message: "ชื่อร้านค้าต้องไม่เกิน 24 ตัวอักษร",
                },
              })}
            />
            {errors.shopName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.shopName.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1">
              Slug ID<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Slug ID ตัวเลขภาษาอังกฤษ"
              className={`w-full p-2 bg-gray-700 rounded border ${
                errors.shopSlugId ? "border-red-500" : "border-gray-600"
              } text-white`}
              {...register("shopSlugId", {
                required: "ต้องระบุ Slug ID",
                pattern: {
                  value: /^[a-z0-9-]{3,24}$/,
                  message:
                    "ต้องประกอบด้วย a-z, ตัวเลข, เครื่องหมายขีด และมีความยาว 3-24 ตัวอักษร",
                },
              })}
            />
            {errors.shopSlugId && (
              <p className="text-red-500 text-xs mt-1">
                {errors.shopSlugId.message}
              </p>
            )}
            <ul className="mt-2 text-sm text-gray-400">
              <li className="flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-gray-400 inline-block mr-1"></span>
                ตัวอักษร a-z, ตัวเลข, และเครื่องหมายขีด
              </li>
              <li className="flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-gray-400 inline-block mr-1"></span>
                อย่างน้อย 3 ตัวอักษรและสูงสุด 24 ตัวอักษร
              </li>
            </ul>
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1">ชื่อผู้ติดต่อ</label>
            <input
              type="text"
              placeholder="ผู้ติดต่อ"
              className={`w-full p-2 bg-gray-700 rounded border ${
                errors.contact_person ? "border-red-500" : "border-gray-600"
              } text-white`}
              {...register("contact_person", {})}
            />
            {errors.contact_person && (
              <p className="text-red-500 text-xs mt-1">
                {errors.contact_person.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1">โทรศัพท์</label>
            <input
              type="tel"
              placeholder="หมายเลขโทรศัพท์"
              className={`w-full p-2 bg-gray-700 rounded border ${
                errors.tel ? "border-red-500" : "border-gray-600"
              } text-white`}
              {...register("tel", {
                pattern: {
                  value: /^[0-9-+\s()]*$/,
                  message: "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง",
                },
              })}
            />
            {errors.tel && (
              <p className="text-red-500 text-xs mt-1">{errors.tel.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              placeholder="ที่อยู่อีเมล"
              className={`w-full p-2 bg-gray-700 rounded border ${
                errors.email ? "border-red-500" : "border-gray-600"
              } text-white`}
              {...register("email", {
                pattern: {
                  value: /^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "กรุณากรอกอีเมลที่ถูกต้อง",
                },
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={handleFormSubmit(onSubmit)}
              disabled={isLoading}
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading
                ? "กำลังดำเนินการ..."
                : action === "edit"
                ? "บันทึกการแก้ไข"
                : "สร้างร้านค้า"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}