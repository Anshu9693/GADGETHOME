import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/User/NavBar.jsx";
import Footer from "../../components/User/Footer.jsx";

import {
  FaFilter,
  FaShoppingCart,
  FaSearch,
  FaTimes,
  FaHeart,
  FaRegHeart,
  FaShareAlt,
  FaArrowRight,
  FaBoxOpen,
} from "react-icons/fa";

import { toast } from "react-hot-toast";

/* ================= ANIMATIONS ================= */
const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const sidebarVariants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { type: "spring", stiffness: 250, damping: 30 } },
  exit: { x: "100%", transition: { ease: "easeInOut", duration: 0.3 } },
};

const PAGE_LIMIT = 20;

const ProductListing = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  /* UI STATES */
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [isHudOpen, setIsHudOpen] = useState(false);

  /* ================= FETCH DATA ================= */
  const fetchData = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      const prodRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/user/allproducts?page=${pageNum}&limit=${PAGE_LIMIT}`,
        { withCredentials: true }
      );

      const newProducts = prodRes.data.products || [];
      
      // Data Loss rokne ke liye: Agar reset true hai toh naya array, warna purane me add
      setProducts((prev) => (reset ? newProducts : [...prev, ...newProducts]));
      setHasMore(newProducts.length === PAGE_LIMIT);

      // Check Login/Wishlist
      const wishRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/wishlist`, {
        withCredentials: true,
      }).catch(() => null);

      if (wishRes && wishRes.data) {
        setWishlist(wishRes.data.products.map((p) => p._id));
        setIsLoggedIn(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Signal Lost: Reconnecting...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, true);
  }, []);

  /* ================= FILTER + SORT (OPTIMIZED) ================= */
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (category !== "All") {
      result = result.filter((p) => p.category === category);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      );
    }

    if (sortBy === "low-high") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "high-low") result.sort((a, b) => b.price - a.price);
    else result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return result;
  }, [products, category, searchQuery, sortBy]);

  /* ================= ACTIONS ================= */
  const handleShare = (e, productId) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/user/productDetail/${productId}`);
    toast.success("Link Uplinked! 🔗");
  };

  const toggleWishlist = async (e, productId) => {
    e.stopPropagation();
    if (!isLoggedIn) return navigate("/user/signin");

    try {
      if (wishlist.includes(productId)) {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/wishlist/remove/${productId}`, { withCredentials: true });
        setWishlist((prev) => prev.filter((id) => id !== productId));
      } else {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/wishlist/add`, { productId }, { withCredentials: true });
        setWishlist((prev) => [...prev, productId]);
      }
    } catch {
      toast.error("System Override Failed");
    }
  };

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation();
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/cart/add`, { productId, quantity: 1 }, { withCredentials: true });
      toast.success("Secured in Cart 🛒");
    } catch {
      navigate("/user/signin");
    }
  };

  return (
    <>
      <NavBar />

      <div className="min-h-screen bg-[#050505] text-white pt-24 pb-24 px-4 md:px-10">
        
        {/* HUD FLOATING CONTROLS */}
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
          <AnimatePresence>
            {isHudOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-black/80 backdrop-blur-2xl border border-cyan-500/20 p-5 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col gap-4 w-[280px] md:w-[300px]"
              >
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/50" />
                  <input
                    placeholder="SCANNING ARCHIVE..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-[10px] font-mono tracking-widest outline-none focus:border-cyan-500/40 transition-all"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-[10px] font-black uppercase outline-none focus:border-cyan-500/40"
                  >
                    <option className="bg-[#050505]" value="newest">Latest Units</option>
                    <option className="bg-[#050505]" value="low-high">Price: Min</option>
                    <option className="bg-[#050505]" value="high-low">Price: Max</option>
                  </select>

                  <button
                    onClick={() => setShowFilters(true)}
                    className="bg-cyan-500 text-black px-5 rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-white transition-colors"
                  >
                    Catalog
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsHudOpen(!isHudOpen)}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.2)] transition-all duration-500 ${
              isHudOpen ? "bg-red-500 text-white rotate-90" : "bg-white text-black"
            }`}
          >
            {isHudOpen ? <FaTimes size={22} /> : <FaFilter size={20} />}
          </motion.button>
        </div>

        {/* GRID SECTION - CHANGED TO 1 COLUMN FOR MOBILE (LIKE FEATURED PAGE) */}
        <div className="max-w-[1400px] mx-auto">
          {loading && products.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-[450px] rounded-[2.5rem] bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <motion.div
              variants={pageVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
            >
              {filteredProducts.length === 0 ? (
                <div className="col-span-full py-32 text-center">
                   <FaBoxOpen className="mx-auto text-4xl text-gray-800 mb-4" />
                   <p className="text-gray-500 font-mono text-sm tracking-widest uppercase">No Data Found in This sector</p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    variants={cardVariants}
                    layout
                    whileHover={{ scale: 1.03 }}
                    onClick={() => navigate(`/user/productDetail/${product._id}`)}
                    className="group relative flex flex-col bg-white/5 border border-white/10 rounded-[2.5rem] p-6 overflow-hidden hover:border-cyan-500/30 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                  >
                    {/* IMAGE AREA */}
                    <div className="relative h-56 md:h-60 flex items-center justify-center mb-6">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out"
                      />

                      {/* QUICK ACTIONS */}
                      <div className="absolute top-0 right-0 flex gap-2">
                        <button
                          onClick={(e) => toggleWishlist(e, product._id)}
                          className="w-11 h-11 bg-black/60 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 hover:border-red-500/50 transition-colors"
                        >
                          {wishlist.includes(product._id) ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-white" />}
                        </button>
                        <button
                          onClick={(e) => handleShare(e, product._id)}
                          className="w-11 h-11 bg-black/60 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 hover:border-cyan-500/50 transition-colors"
                        >
                          <FaShareAlt className="text-white text-xs" />
                        </button>
                      </div>
                    </div>

                    {/* TEXT AREA */}
                    <div className="flex flex-col flex-1">
                      <p className="text-cyan-400 text-[10px] font-black uppercase mb-1 tracking-[0.2em]">
                        {product.brand}
                      </p>

                      <h3 className="font-bold text-xl line-clamp-2 uppercase tracking-tight group-hover:text-cyan-400 transition-colors duration-300">
                        {product.name}
                      </h3>

                      <p className="text-[12px] text-gray-400 line-clamp-2 mt-2 mb-4 leading-relaxed">
                        {product.description}
                      </p>

                      <div className="mt-auto pt-4 flex justify-between items-center border-t border-white/10">
                        <div className="flex flex-col">
                          {product.discountPrice ? (
                            <>
                              <span className="text-xl font-black text-cyan-400 italic">₹{product.discountPrice.toLocaleString()}</span>
                              <span className="text-sm text-gray-500 line-through font-bold">₹{product.price.toLocaleString()}</span>
                            </>
                          ) : (
                            <span className="text-xl font-black text-white italic">₹{product.price.toLocaleString()}</span>
                          )}
                        </div>

                        <button
                          onClick={(e) => handleAddToCart(e, product._id)}
                          className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-cyan-500 hover:scale-105 transition-all active:scale-95 shadow-lg"
                        >
                          <FaShoppingCart size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* LOAD MORE */}
          {hasMore && !loading && (
            <div className="mt-20 flex justify-center">
              <button
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  fetchData(nextPage);
                }}
                className="group flex items-center gap-4 bg-[#0b0b0b] border border-white/10 px-10 py-4 rounded-full font-black uppercase text-[11px] tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-500"
              >
                Sync More Units <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FILTER SIDEBAR */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[110]"
            />

            <motion.aside
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 h-full w-full max-w-[340px] bg-[#050505] border-l border-white/5 z-[120] p-10 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="flex justify-between items-center mb-12">
                <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Sector_Catalog</h2>
                    <p className="text-[9px] text-cyan-500/50 font-mono uppercase tracking-[0.3em] mt-1">Refine Database Output</p>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full hover:bg-red-500 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto scrollbar-hide">
                {["All", "Smart Lighting", "Home Security", "Kitchen Gadgets", "Wearables"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setShowFilters(false);
                    }}
                    className={`w-full text-left p-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-300 ${
                      category === cat
                        ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        : "bg-white/5 text-gray-500 border-white/5 hover:border-white/20"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setCategory("All");
                  setSearchQuery("");
                  setShowFilters(false);
                }}
                className="mt-10 w-full p-5 border border-red-500/30 text-red-500 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95"
              >
                Hard Reset System
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <Footer />

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        option { background: #050505 !important; }
      `}</style>
    </>
  );
};

export default ProductListing;