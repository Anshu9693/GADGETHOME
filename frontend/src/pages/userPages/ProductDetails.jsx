import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaHeart,
  FaRegHeart,
  FaChevronLeft,
  FaShieldAlt,
  FaTruck,
  FaRedo,
  FaShoppingCart,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import NavBar from "../../components/User/NavBar.jsx";

/* ================= AXIOS INSTANCE ================= */
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  timeout: 8000,
});

/* ================= TRUST COMPONENT ================= */
const Trust = ({ icon, text }) => (
  <div className="flex flex-col items-center gap-2 text-gray-400 text-xs text-center">
    <div className="text-cyan-500 text-2xl mb-1">{icon}</div>
    <span className="font-medium">{text}</span>
  </div>
);

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [wishLoading, setWishLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/api/products/user/${id}`);
        setProduct(res.data.product);
        setMainImage(res.data.product.images?.[0] || "");
        setIsInWishlist(res.data.isInWishlist || false);
      } catch {
        toast.error("Product not found");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  /* ================= ADD TO CART ================= */
  const handleAddToCart = async () => {
    if (cartLoading) return;
    setCartLoading(true);

    try {
      await api.post("/api/cart/add", { productId: id, quantity });
      toast.success("Added to cart 🛒");
    } catch (err) {
      if (err.response?.status === 401) navigate("/user/signin");
      else toast.error(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setCartLoading(false);
    }
  };

  /* ================= TOGGLE WISHLIST ================= */
  const handleWishlistToggle = async () => {
    if (wishLoading) return;
    setWishLoading(true);

    try {
      if (isInWishlist) {
        await api.delete(`/api/wishlist/remove/${id}`);
        setIsInWishlist(false);
        toast.success("Removed from wishlist");
      } else {
        await api.post("/api/wishlist/add", { productId: id });
        setIsInWishlist(true);
        toast.success("Added to wishlist ❤️");
      }
    } catch (err) {
      if (err.response?.status === 401) navigate("/user/signin");
      else toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setWishLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* BACK */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-8 transition-colors"
          >
            <FaChevronLeft /> Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* IMAGES */}
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 aspect-square flex items-center justify-center overflow-hidden">
                <motion.img
                  key={mainImage}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={mainImage}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`w-24 h-24 rounded-2xl border flex-shrink-0 p-2 transition-all ${
                      mainImage === img ? "border-cyan-500 bg-white/5" : "border-white/10"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* INFO */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col justify-center">
              <p className="text-cyan-500 font-bold uppercase mb-3 tracking-widest">{product.brand}</p>
              <h1 className="text-5xl font-black mb-6 leading-tight">{product.name}</h1>

              <div className="flex items-center gap-4 mb-8">
                <span className="text-4xl font-black">₹{product.price}</span>
                <span className="bg-cyan-500/10 text-cyan-400 text-xs px-3 py-1 rounded-full font-bold">
                  IN STOCK
                </span>
              </div>

              <p className="text-gray-400 mb-8 leading-relaxed">{product.description}</p>

              {/* QUANTITY */}
              <div className="flex items-center gap-6 mb-10">
                <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-4 mb-12">
                <button
                  disabled={cartLoading}
                  onClick={handleAddToCart}
                  className="flex-1 h-16 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-cyan-500 transition-all active:scale-95 disabled:opacity-60"
                >
                  <FaShoppingCart />
                  ADD TO CART
                </button>

                <button
                  disabled={wishLoading}
                  onClick={handleWishlistToggle}
                  className={`w-16 h-16 border rounded-2xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-60 ${
                    isInWishlist
                      ? "text-red-500 border-red-500/50 bg-red-500/10"
                      : "border-white/10 hover:border-red-500/50 hover:text-red-500"
                  }`}
                >
                  {isInWishlist ? <FaHeart size={22} /> : <FaRegHeart size={22} />}
                </button>
              </div>

              {/* TRUST */}
              <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
                <Trust icon={<FaTruck />} text="Fast Delivery" />
                <Trust icon={<FaShieldAlt />} text="1 Year Warranty" />
                <Trust icon={<FaRedo />} text="7 Day Return" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
