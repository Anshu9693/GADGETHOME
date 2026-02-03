import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/User/NavBar.jsx";
import Footer from "../../components/User/Footer.jsx";
import Filter from "../../components/User/Filter.jsx";

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

const PAGE_LIMIT = 12;

const ProductListing = () => {
  const navigate = useNavigate();

  // States
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filter States
  const [showFilters, setShowFilters] = useState(false); // For Mobile Sidebar
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [isHudOpen, setIsHudOpen] = useState(false);
  const [filters, setFilters] = useState({});

  /* ================= FETCH DATA ================= */
  const fetchData = useCallback(async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      const prodRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/user/allproducts?page=${pageNum}&limit=${PAGE_LIMIT}`,
        { withCredentials: true }
      );

      const newProducts = prodRes.data.products || [];
      
      setProducts((prev) => (reset ? newProducts : [...prev, ...newProducts]));
      setHasMore(newProducts.length === PAGE_LIMIT);

      // Check Wishlist on initial load
      if (pageNum === 1) {
        try {
          const wishRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/wishlist`, {
            withCredentials: true,
          });
          if (wishRes.data) {
            setWishlist(wishRes.data.products.map((p) => p._id));
            setIsLoggedIn(true);
          }
        } catch (err) {
          setIsLoggedIn(false);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Signal Lost: Database Offline");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(1, true);
  }, [fetchData]);

  /* ================= FILTER LOGIC (OPTIMIZED) ================= */
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Sidebar Category (Quick Select)
    if (category && category !== "All") {
      result = result.filter((p) => p.category === category);
    }

    // 2. Advanced Filters from Filter Component
    if (filters && Object.keys(filters).length > 0) {
      const { priceRange, brands, categories } = filters;
      
      if (priceRange && priceRange.length === 2) {
        result = result.filter((p) => {
          const price = p.discountPrice ?? p.price ?? 0;
          return price >= priceRange[0] && price <= priceRange[1];
        });
      }
      if (brands && brands.length > 0) {
        result = result.filter((p) => brands.includes(p.brand));
      }
      if (categories && categories.length > 0) {
        result = result.filter((p) => categories.includes(p.category));
      }
    }

    // 3. Search Query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((p) => 
        (p.name?.toLowerCase().includes(q)) || 
        (p.brand?.toLowerCase().includes(q))
      );
    }

    // 4. Sorting
    if (sortBy === "low-high") {
      result.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
    } else if (sortBy === "high-low") {
      result.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
    } else {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [products, category, searchQuery, sortBy, filters]);

  /* ================= HANDLERS ================= */
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
        toast.success("Removed from Wishlist");
      } else {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/wishlist/add`, { productId }, { withCredentials: true });
        setWishlist((prev) => [...prev, productId]);
        toast.success("Added to Wishlist");
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
      toast.error("Please login to add to cart");
      navigate("/user/signin");
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <NavBar />

      <main className="pt-24 pb-24 px-4 md:px-10">
        
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
                    <option value="newest">Latest Units</option>
                    <option value="low-high">Price: Min</option>
                    <option value="high-low">Price: Max</option>
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
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.2)] transition-all duration-500 ${isHudOpen ? "bg-red-500 text-white rotate-90" : "bg-white text-black"}`}
          >
            {isHudOpen ? <FaTimes size={22} /> : <FaFilter size={20} />}
          </motion.button>
        </div>

        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* DESKTOP SIDEBAR */}
            <aside className="hidden md:block md:col-span-1">
               <div className="sticky top-28 bg-white/5 p-6 rounded-[2rem] border border-white/10">
                  <Filter products={products} onChange={setFilters} />
               </div>
            </aside>

            {/* PRODUCT GRID */}
            <div className="md:col-span-3">
              {loading && products.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-[400px] rounded-[2.5rem] bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  <motion.div
                    variants={pageVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredProducts.length === 0 ? (
                        <motion.div key="no-data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-32 text-center">
                          <FaBoxOpen className="mx-auto text-4xl text-gray-800 mb-4" />
                          <p className="text-gray-500 font-mono text-sm tracking-widest uppercase">No Data Found in This sector</p>
                        </motion.div>
                      ) : (
                        filteredProducts.map((product) => (
                          <motion.div
                            key={product._id}
                            variants={cardVariants}
                            layout
                            whileHover={{ y: -10 }}
                            className="group relative flex flex-col bg-white/5 border border-white/10 rounded-[2.5rem] p-6 hover:border-cyan-500/30 transition-all duration-500"
                            onClick={() => navigate(`/user/productDetail/${product._id}`)}
                          >
                            <div className="relative h-56 flex items-center justify-center mb-6 overflow-hidden">
                              <img src={product.images?.[0]} alt={product.name} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700" />
                              
                              <div className="absolute top-0 right-0 flex gap-2">
                                <button onClick={(e) => toggleWishlist(e, product._id)} className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:border-red-500">
                                  {wishlist.includes(product._id) ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                                </button>
                                <button onClick={(e) => handleShare(e, product._id)} className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:border-cyan-500">
                                  <FaShareAlt size={12} />
                                </button>
                              </div>
                            </div>

                            <div className="flex flex-col flex-1">
                              <span className="text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-1">{product.brand}</span>
                              <h3 className="font-bold text-lg uppercase line-clamp-1 group-hover:text-cyan-400 transition-colors">{product.name}</h3>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-2 mb-4">{product.description}</p>
                              
                              <div className="mt-auto pt-4 flex justify-between items-center border-t border-white/10">
                                <div>
                                  {product.discountPrice ? (
                                    <div className="flex flex-col">
                                      <span className="text-xl font-black text-cyan-400">₹{product.discountPrice.toLocaleString()}</span>
                                      <span className="text-xs text-gray-600 line-through">₹{product.price.toLocaleString()}</span>
                                    </div>
                                  ) : (
                                    <span className="text-xl font-black">₹{product.price.toLocaleString()}</span>
                                  )}
                                </div>
                                <button onClick={(e) => handleAddToCart(e, product._id)} className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-cyan-500 transition-all active:scale-90 shadow-lg">
                                  <FaShoppingCart />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {hasMore && (
                    <div className="mt-16 flex justify-center">
                      <button 
                        onClick={loadMore} 
                        disabled={loading} 
                        className="group flex items-center gap-4 bg-white/5 border border-white/10 px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all"
                      >
                        {loading ? "Syncing..." : "Sync More Units"} 
                        {!loading && <FaArrowRight className="group-hover:translate-x-2 transition-transform" />}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE FILTER SIDEBAR */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilters(false)} className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[110]" />
            <motion.aside variants={sidebarVariants} initial="hidden" animate="visible" exit="exit" className="fixed top-0 right-0 h-full w-full max-w-[320px] bg-[#0a0a0a] border-l border-white/10 z-[120] p-8 flex flex-col shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-xl font-black uppercase italic">Sector_Catalog</h2>
                <button onClick={() => setShowFilters(false)} className="text-xl bg-white/5 p-2 rounded-full"><FaTimes /></button>
              </div>
              <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {["All", "Smart Lighting", "Home Security", "Kitchen Gadgets", "Wearables"].map((cat) => (
                  <button 
                    key={cat} 
                    onClick={() => { setCategory(cat); setShowFilters(false); }} 
                    className={`w-full text-left p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${category === cat ? "bg-cyan-500 text-black border-cyan-500" : "bg-white/5 text-gray-500 border-transparent hover:border-white/20"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => { setCategory("All"); setFilters({}); setSearchQuery(""); setShowFilters(false); }} 
                className="mt-6 w-full py-4 border border-red-500/50 text-red-500 rounded-xl font-bold uppercase text-[10px] hover:bg-red-500 hover:text-white transition-all"
              >
                Hard Reset System
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <Footer />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
        select option { background: #050505; color: white; }
      `}</style>
    </div>
  );
};

export default ProductListing;