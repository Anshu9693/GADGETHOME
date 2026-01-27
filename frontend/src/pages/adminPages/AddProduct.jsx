import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import AdminNavbar from "../../components/Admin/Navbar";
import { FaPlus, FaImage, FaSpinner, FaTimes } from "react-icons/fa"; // Added FaTimes
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ================= CONSTANTS ================= */

const categories = [
  "Smart Lighting",
  "Home Security",
  "Kitchen Gadgets",
  "Smart Plugs",
  "Wearables",
  "Entertainment",
  "Others",
];

const connectivityOptions = ["Wi-Fi", "Bluetooth", "Zigbee", "Thread"];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ================= COMPONENT ================= */

const AddProduct = () => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);

  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    discountPrice: "",
    stock: "",
    description: "",
    powerSource: "",
    warranty: "",
    isFeatured: false,
    connectivity: [],
  });

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleConnectivity = (value) => {
    setForm((prev) => ({
      ...prev,
      connectivity: prev.connectivity.includes(value)
        ? prev.connectivity.filter((c) => c !== value)
        : [...prev.connectivity, value],
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    // Allow adding to existing images or replace (Currently configured to append)
    setImages((prev) => [...prev, ...files]);
  };

  // ✅ New Handler to remove specific image from preview
  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.price || !form.category) {
      toast.error("Name, Price and Category are required");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value === "" || value === null) return;

        if (Array.isArray(value)) {
          value.forEach((v) => formData.append(key, v));
        } else {
          formData.append(key, value);
        }
      });

      images.forEach((img) => formData.append("images", img));

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/createproduct`,
        formData,
        { withCredentials: true }
      );

      toast.success("✅ Product added successfully");

      setForm({
        name: "",
        brand: "",
        category: "",
        price: "",
        discountPrice: "",
        stock: "",
        description: "",
        powerSource: "",
        warranty: "",
        isFeatured: false,
        connectivity: [],
      });

      setImages([]);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "❌ Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <>
      <AdminNavbar />
      <ToastContainer position="top-right" theme="dark" autoClose={3000} />

      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white px-6 py-10">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-4xl font-extrabold mb-10"
        >
          Add New Product
        </motion.h1>

        <motion.form
          onSubmit={handleSubmit}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-8"
        >
          {/* BASIC INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              className="admin-input"
              type="text"
              name="name"
              placeholder="Product Name"
              value={form.name}
              onChange={handleChange}
            />
            <input
              className="admin-input"
              type="text"
              name="brand"
              placeholder="Brand"
              value={form.brand}
              onChange={handleChange}
            />
          </div>

          {/* CATEGORY & PRICE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <select
              className="admin-input"
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c} value={c} className="text-black">
                  {c}
                </option>
              ))}
            </select>

            <input
              className="admin-input"
              type="number"
              name="price"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
            />

            <input
              className="admin-input"
              type="number"
              name="discountPrice"
              placeholder="Discount Price"
              value={form.discountPrice}
              onChange={handleChange}
            />
          </div>

          {/* STOCK & POWER */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input
              className="admin-input"
              type="number"
              name="stock"
              placeholder="Stock"
              value={form.stock}
              onChange={handleChange}
            />

            <select
              className="admin-input"
              name="powerSource"
              value={form.powerSource}
              onChange={handleChange}
            >
              <option value="">Select Power Source</option>
              <option value="Battery" className="text-black">
                Battery
              </option>
              <option value="Plug-in" className="text-black">
                Plug-in
              </option>
              <option value="USB" className="text-black">
                USB
              </option>
            </select>

            <input
              className="admin-input"
              type="text"
              name="warranty"
              placeholder="Warranty (e.g. 1 Year)"
              value={form.warranty}
              onChange={handleChange}
            />
          </div>

          {/* CONNECTIVITY */}
          <div>
            <p className="text-sm text-gray-300 mb-2">Connectivity</p>
            <div className="flex flex-wrap gap-3">
              {connectivityOptions.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => handleConnectivity(c)}
                  className={`px-4 py-2 rounded-full border transition ${
                    form.connectivity.includes(c)
                      ? "bg-cyan-500 text-black"
                      : "border-white/20 text-gray-300 hover:border-cyan-400"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* DESCRIPTION */}
          <textarea
            className="admin-input min-h-[120px]"
            name="description"
            placeholder="Product Description"
            value={form.description}
            onChange={handleChange}
          />

          {/* IMAGE UPLOAD SECTION */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer w-fit text-gray-300 hover:text-white mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition">
                <FaImage />
                <span>Upload Images (max 5)</span>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />
            </label>

            {/* ✅ IMAGE PREVIEWS */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`preview-${index}`}
                      className="w-full h-24 object-cover rounded-xl border border-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FEATURED */}
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              name="isFeatured"
              checked={form.isFeatured}
              onChange={handleChange}
              className="w-4 h-4 accent-cyan-500"
            />
            Featured Product
          </label>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold py-3 rounded-xl transition"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
            {loading ? "Adding Product..." : "Add Product"}
          </button>
        </motion.form>
      </div>

      {/* INPUT STYLES */}
      <style>
        {`
          .admin-input {
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.15);
            padding: 12px 14px;
            border-radius: 12px;
            outline: none;
            color: white;
            width: 100%;
          }

          .admin-input::placeholder {
            color: rgba(255,255,255,0.5);
          }

          .admin-input:focus {
            border-color: #22d3ee;
            background: rgba(255,255,255,0.12);
          }
        `}
      </style>
    </>
  );
};

export default AddProduct;