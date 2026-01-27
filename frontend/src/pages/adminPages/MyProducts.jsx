import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";
import AdminNavbar from "../../components/Admin/Navbar";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH PRODUCTS ================= */

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/admin/allproducts`,
        { withCredentials: true }
      );
      setProducts(res.data.products || []);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ================= DELETE PRODUCT ================= */

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/deleteproduct/${id}`,
        { withCredentials: true }
      );
      toast.success("Product deleted");
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const navigate = useNavigate();

  /* ================= UI ================= */

  return (
    <>
      <AdminNavbar />
      <ToastContainer position="top-right" theme="dark" />

      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white px-6 py-10">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-4xl font-extrabold mb-10"
        >
          My Products
        </motion.h1>

        {loading ? (
          <p className="text-gray-400">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-400">No products added yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <motion.div
                key={product._id}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:scale-[1.02] transition"
              >
                {/* IMAGE */}
                <img
                  src={product.images?.[0] || "/placeholder.png"}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />

                {/* CONTENT */}
                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-lg line-clamp-1">
                    {product.name}
                  </h3>

                  <p className="text-sm text-gray-400">
                    {product.category}
                  </p>

                  <div className="flex justify-between items-center mt-3">
                    <span className="font-semibold text-cyan-400">
                      ₹{product.price}
                    </span>
                    <span
                      className={`text-sm ${
                        product.stock > 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      Stock: {product.stock}
                    </span>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-3 mt-4">
                    <button
                      className="flex-1 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-black py-2 rounded-lg text-sm"
                      onClick={() =>
                        // toast.info("Coming to edit page 😉")
                        navigate("/editproduct/" + product._id)
                        // 
                      }
                    >
                      <FaEdit /> Edit
                    </button>

                    <button
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm"
                      onClick={() => deleteProduct(product._id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyProducts;
