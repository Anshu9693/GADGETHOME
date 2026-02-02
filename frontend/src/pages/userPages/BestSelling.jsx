import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaRegHeart,
  FaShoppingCart,
  FaShareAlt,
  FaFire,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import NavBar from "../../components/User/NavBar.jsx";
import AuthFooter from "../../components/User/AuthFooter.jsx";
import Footer from "../../components/User/Footer.jsx";

/* ================= AXIOS ================= */
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

/* ================= ANIMATIONS ================= */
const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const BestSelling = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH BEST SELLERS ================= */
  const fetchBestSelling = async () => {
    try {
      const res = await api.get("/api/analytics/best-selling");
      setProducts(res.data.bestSelling || []);
    } catch {
      toast.error("Failed to load best sellers");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH WISHLIST ================= */
  const fetchWishlist = async () => {
    try {
      const res = await api.get("/api/wishlist");
      setWishlist(res.data.products.map((p) => p._id));
      setIsLoggedIn(true);
    } catch {
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    fetchBestSelling();
    fetchWishlist();
  }, []);

  /* ================= SHARE ================= */
  const handleShare = (e, productId) => {
    e.stopPropagation();
    const link = `${window.location.origin}/user/productDetail/${productId}`;
    navigator.clipboard.writeText(link);
    toast.success("Product link copied 🔗");
  };

  /* ================= CART ================= */
  const handleAddToCart = async (e, productId) => {
    e.stopPropagation();
    try {
      await api.post("/api/cart/add", { productId, quantity: 1 });
      toast.success("Added to cart 🛒");
    } catch (err) {
      if (err.response?.status === 401) navigate("/user/signin");
      else toast.error("Failed to add to cart");
    }
  };

  /* ================= WISHLIST ================= */
  const toggleWishlist = async (e, productId) => {
    e.stopPropagation();
    try {
      if (wishlist.includes(productId)) {
        await api.delete(`/api/wishlist/remove/${productId}`);
        setWishlist(wishlist.filter((id) => id !== productId));
      } else {
        await api.post(`/api/wishlist/add`, { productId });
        setWishlist([...wishlist, productId]);
      }
    } catch {
      toast.error("Wishlist action failed");
    }
  };

  return (
    <>
      <NavBar />

      <div className="min-h-screen bg-[#050505] text-white pt-28 pb-24 px-4 md:px-10">
        <div className="max-w-7xl mx-auto">
          {/* ===== HEADER ===== */}
          {/* <div className="flex items-center gap-3 mb-10">
            <FaFire className="text-orange-500 text-3xl animate-pulse" />
            <h1 className="text-3xl md:text-4xl font-black">
              Best Selling Products
            </h1>
          </div> */}

          {loading ? (
            <p className="text-gray-400">Loading best sellers...</p>
          ) : (
            <motion.div
              variants={pageVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8"
            >
              {products.slice(0, 6).map((item, index)=> {
                const product = item.product;
                if (!product) return null;

                return (
                  <motion.div
                    key={product._id}
                    variants={cardVariants}
                    whileHover={{ y: -6 }}
                    onClick={() =>
                      isLoggedIn
                        ? navigate(`/user/productDetail/${product._id}`)
                        : navigate("/user/signin")
                    }
                    className="relative bg-[#0b0b0b] border border-white/5 rounded-2xl overflow-hidden cursor-pointer group"
                  >
                    {/* ===== RANK BADGE ===== */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-3 py-1 text-xs font-black rounded-full bg-orange-500 text-black">
                        #{index + 1} BEST
                      </span>
                    </div>

                    {/* ===== IMAGE ===== */}
                    <div className="relative aspect-square overflow-hidden bg-neutral-900/50">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition"
                      />

                      {/* ACTIONS */}
                      <div className="absolute top-3 right-3 flex gap-2 z-10">
                        <button
                          onClick={(e) =>
                            toggleWishlist(e, product._id)
                          }
                          className="p-2 bg-black/50 rounded-xl border border-white/10"
                        >
                          {wishlist.includes(product._id) ? (
                            <FaHeart className="text-red-500" />
                          ) : (
                            <FaRegHeart />
                          )}
                        </button>

                        <button
                          onClick={(e) =>
                            handleShare(e, product._id)
                          }
                          className="p-2 bg-black/50 rounded-xl border border-white/10 hover:bg-cyan-500"
                        >
                          <FaShareAlt />
                        </button>
                      </div>
                    </div>

                    {/* ===== INFO ===== */}
                    <div className="p-4 flex flex-col">
                      <p className="text-cyan-500 text-[10px] font-black uppercase">
                        {product.brand}
                      </p>

                      <h3 className="text-sm font-bold line-clamp-2 mb-1">
                        {product.name}
                      </h3>

                      <p className="text-xs text-gray-400 mb-2">
                        🔥 Sold {item.totalSold} times
                      </p>

                      <div className="flex justify-between items-center mt-auto pt-3 border-t border-white/5">
                        <div>
                          {product.discountPrice ? (
                            <>
                              <span className="text-lg font-black text-cyan-400">
                                ₹{product.discountPrice}
                              </span>
                              <span className="block text-xs line-through text-gray-500">
                                ₹{product.price}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-black">
                              ₹{product.price}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) =>
                            handleAddToCart(e, product._id)
                          }
                          className="p-3 bg-white text-black rounded-xl hover:bg-cyan-500"
                        >
                          <FaShoppingCart />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* <AuthFooter /> */}
      <Footer/>
    </>
  );
};

export default BestSelling;
