import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import { Camera } from "lucide-react";
import { useForm } from "react-hook-form";
import { API_URL } from "../../config/config"; // Removed unused TOKEN
import axios from "axios";

export default function ShopForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset, // Add reset from react-hook-form
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

    console.log("Form submitted:", Object.fromEntries(formData));
    console.log("Token:", token);

    try {
      const response = await axios.post(`${API_URL}/createshop2`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status === "success") {
        setSubmitSuccess("ร้านค้าถูกสร้างเรียบร้อยแล้ว!");
        // Reset form and file inputs
        reset(); // Reset react-hook-form fields
        setFileData({ avatar: null, cover: null });
        setAvatarPreview(null);
        setCoverPreview(null);
        if (avatarInputRef.current) {
          avatarInputRef.current.value = ""; // Clear file input
        }
        if (coverInputRef.current) {
          coverInputRef.current.value = ""; // Clear file input
        }
        // Optionally clear success message after 3 seconds
        setTimeout(() => setSubmitSuccess(null), 3000);
      }

      console.log("Response:", response.data);
    } catch (error) {
      console.log("Error:", error);
      const errorMessage =
        error.response?.data?.message || "เกิดข้อผิดพลาดในการสร้างร้านค้า";
      setSubmitError(errorMessage);
      if (error.response?.data?.code === 4010) {
        navigate("/");
      }
      console.error("Error:", error.response?.data || error.message);
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
                <span>Add Cover</span>
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
                <span className="text-sm mt-1">Add Image</span>
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
          <h2 className="text-xl mb-6">สร้างข้อมูลร้านค้า</h2>

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
              placeholder="Shop Name"
              className={`w-full p-2 bg-gray-700 rounded border ${
                errors.shopName ? "border-red-500" : "border-gray-600"
              } text-white`}
              {...register("shopName", {
                required: "Shop name is required",
                minLength: {
                  value: 3,
                  message: "Shop name must be at least 3 characters",
                },
                maxLength: {
                  value: 24,
                  message: "Shop name must not exceed 24 characters",
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
                required: "Shop slug ID is required",
                pattern: {
                  value: /^[a-z0-9-]{3,24}$/,
                  message:
                    "Must contain only a-z, numbers, hyphens and be 3-24 characters",
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
                ตัวอักษร a-z สามารถใส่ได้ทั้งตัวเลข
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
              placeholder="Email Address"
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
              {isLoading ? "กำลังสร้าง..." : "สร้างร้านค้า"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
