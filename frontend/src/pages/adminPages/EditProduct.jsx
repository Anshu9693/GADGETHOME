import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { FaSave, FaImage, FaSpinner } from "react-icons/fa";
import AdminNavbar from "../../components/Admin/Navbar";
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
const powerSources = ["Battery", "Plug-in", "USB"];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ================= COMPONENT ================= */

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
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

  /* ================= FETCH PRODUCT ================= */

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/admin/${id}`,
          { withCredentials: true }
        );

        const p = data.product;

        setForm({
          name: p.name || "",
          brand: p.brand || "",
          category: p.category || "",
          price: p.price || "",
          discountPrice: p.discountPrice || "",
          stock: p.stock || "",
          description: p.description || "",
          powerSource: p.powerSource || "",
          warranty: p.warranty || "",
          isFeatured: p.isFeatured || false,
          connectivity: p.connectivity || [],
        });
      } catch {
        toast.error("Failed to load product");
      } finally {
        setPageLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const toggleConnectivity = (item) => {
    setForm((prev) => ({
      ...prev,
      connectivity: prev.connectivity.includes(item)
        ? prev.connectivity.filter((c) => c !== item)
        : [...prev.connectivity, item],
    }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/updateproduct/${id}`,
        formData,
        { withCredentials: true }
      );

      toast.success("Product updated successfully");
      setTimeout(() => navigate("/admin/products"), 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading product...
      </div>
    );
  }

  return (
    <>
      <AdminNavbar />
      <ToastContainer theme="light" />

      <div className="min-h-screen bg-[#f7f7f5] text-slate-900 px-6 py-10">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-4xl font-extrabold mb-10"
        >
          Edit Product
        </motion.h1>

        <motion.form
          onSubmit={handleSubmit}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 space-y-8 shadow-sm"
        >
          {/* BASIC INFO */}
          <div className="grid md:grid-cols-2 gap-6">
            <input className="admin-input" name="name" value={form.name} onChange={handleChange} placeholder="Product Name" />
            <input className="admin-input" name="brand" value={form.brand} onChange={handleChange} placeholder="Brand" />
          </div>

          {/* CATEGORY & PRICE */}
          <div className="grid md:grid-cols-3 gap-6">
            <select className="admin-input" name="category" value={form.category} onChange={handleChange}>
              <option value="">Select Category</option>
              {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

            <input type="number" className="admin-input" name="price" value={form.price} onChange={handleChange} placeholder="Price" />
            <input type="number" className="admin-input" name="discountPrice" value={form.discountPrice} onChange={handleChange} placeholder="Discount Price" />
          </div>

          {/* STOCK & POWER */}
          <div className="grid md:grid-cols-3 gap-6">
            <input type="number" className="admin-input" name="stock" value={form.stock} onChange={handleChange} placeholder="Stock" />

            <select className="admin-input" name="powerSource" value={form.powerSource} onChange={handleChange}>
              <option value="">Select Power Source</option>
              {powerSources.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

            <input className="admin-input" name="warranty" value={form.warranty} onChange={handleChange} placeholder="Warranty" />
          </div>

          {/* CONNECTIVITY */}
          <div>
            <p className="text-sm text-slate-600 mb-2">Connectivity</p>
            <div className="flex flex-wrap gap-3">
              {connectivityOptions.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => toggleConnectivity(c)}
                  className={`px-4 py-2 rounded-full border transition ${
                    form.connectivity.includes(c)
                      ? "bg-cyan-500 text-black border-cyan-400"
                      : "border-slate-200 text-slate-600 hover:border-cyan-400"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* DESCRIPTION */}
          <textarea
            className="admin-input min-h-[140px]"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Product Description"
          />

          {/* IMAGE UPLOAD + PREVIEW */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-3 px-6 py-3 border border-slate-200 rounded-xl hover:border-slate-300 transition text-slate-600 hover:text-slate-900 bg-white"
            >
              <FaImage />
              Replace / Add Images
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                setImages([...e.target.files]);
                toast.success(`${e.target.files.length} image(s) selected`);
              }}
            />

            {/* IMAGE PREVIEW */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden border border-slate-200"
                  >
                    <img
                      src={URL.createObjectURL(img)}
                      alt="preview"
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FEATURED */}
          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} />
            Featured Product
          </label>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 rounded-xl text-lg"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {loading ? "Updating..." : "Update Product"}
          </button>
        </motion.form>
      </div>

      {/* INPUT STYLES */}
      <style>
        {`
          .admin-input {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            padding: 14px 16px;
            border-radius: 14px;
            color: #0f172a;
            width: 100%;
            transition: all 0.2s ease;
          }
          .admin-input::placeholder {
            color: #94a3b8;
          }
          .admin-input:focus {
            border-color: #22d3ee;
            box-shadow: 0 0 0 3px rgba(34,211,238,0.15);
            outline: none;
          }
        `}
      </style>
    </>
  );
};

export default EditProduct;
