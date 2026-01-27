import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/User/NavBar.jsx";
import {
  FaFilter,
  FaShoppingCart,
  FaSearch,
  FaTimes,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import AuthFooter from "../../components/User/AuthFooter.jsx";

/* ================= ANIMATION VARIANTS ================= */
const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const sidebarVariants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { type: "spring", stiffness: 200, damping: 25 } },
  exit: { x: "100%" },
};

const PAGE_LIMIT = 20; // Number of products per page

const ProductListing = () => {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [isHudOpen, setIsHudOpen] = useState(false);

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      let url = `${import.meta.env.VITE_BACKEND_URL}/api/products/user/allproducts?page=${pageNum}&limit=${PAGE_LIMIT}`;

      const res = await axios.get(url, { withCredentials: true });
      const newProducts = res.data.products || [];

      if (reset) {
        setProducts(newProducts);
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
      }

      setHasMore(newProducts.length === PAGE_LIMIT);
    } catch (err) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH WISHLIST ================= */
  const fetchWishlist = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/wishlist`, { withCredentials: true });
      setWishlist(res.data.products.map((p) => p._id));
    } catch {
      // ignore if user not logged in
    }
  };

  useEffect(() => {
    fetchProducts(1, true);
    fetchWishlist();
  }, []);

  /* ================= FILTER + SORT ================= */
  const filteredProducts = products
    .filter((p) => (category === "All" ? true : p.category === category))
    .filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "low-high") return a.price - b.price;
      if (sortBy === "high-low") return b.price - a.price;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  /* ================= CART ACTION ================= */
  const handleAddToCart = async (e, productId) => {
    e.stopPropagation();
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart/add`,
        { productId, quantity: 1 },
        { withCredentials: true }
      );
      toast.success("Added to cart 🛒");
    } catch (err) {
      if (err.response?.status === 401) navigate("/user/signin");
      else toast.error("Failed to add to cart");
    }
  };

  /* ================= WISHLIST ACTION ================= */
  const toggleWishlist = async (e, productId) => {
    e.stopPropagation();
    try {
      if (wishlist.includes(productId)) {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/wishlist/remove/${productId}`, { withCredentials: true });
        setWishlist(wishlist.filter((id) => id !== productId));
        toast.success("Removed from wishlist ❤️");
      } else {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/wishlist/add`, { productId }, { withCredentials: true });
        setWishlist([...wishlist, productId]);
        toast.success("Added to wishlist ❤️");
      }
    } catch (err) {
      if (err.response?.status === 401) navigate("/user/signin");
      else toast.error("Wishlist action failed");
    }
  };

  return (
    <>
      <NavBar />

      <div className="min-h-screen bg-[#050505] text-white pt-24 pb-24 px-3 md:px-10">
        <div className="max-w-7xl mx-auto">
          {/* ================= HUD ================= */}
          <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
            <AnimatePresence>
              {isHudOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  className="bg-black/60 backdrop-blur-md border border-cyan-500/20 p-3 rounded-2xl shadow-lg flex flex-col gap-3 w-[280px] md:w-auto md:flex-row md:items-center"
                >
                  <div className="relative flex-1">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500 text-xs" />
                    <input
                      autoFocus
                      placeholder="SEARCH..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs font-mono outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-full py-2 px-4 text-[10px] font-black uppercase"
                    >
                      <option value="newest">Newest</option>
                      <option value="low-high">Price Low-High</option>
                      <option value="high-low">Price High-Low</option>
                    </select>
                    <button
                      onClick={() => setShowFilters(true)}
                      className="bg-cyan-500 text-black px-5 rounded-full text-[10px] font-black uppercase"
                    >
                      Filter
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsHudOpen(!isHudOpen)}
              className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-md ${
                isHudOpen ? "bg-red-500 border-red-400 rotate-90" : "bg-black border-cyan-500"
              }`}
            >
              {isHudOpen ? <FaTimes className="text-white" /> : <FaFilter className="text-cyan-400" />}
            </motion.button>
          </div>

          {/* ================= PRODUCT GRID ================= */}
          {loading && products.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
              {[...Array(PAGE_LIMIT)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <motion.div variants={pageVariants} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product._id}
                  variants={cardVariants}
                  whileHover={{ y: -5 }}
                  className="group relative bg-[#0b0b0b] border border-white/5 rounded-2xl overflow-hidden cursor-pointer flex flex-col"
                  onClick={() => navigate(`/user/productDetail/${product._id}`)}
                >
                  <div className="relative aspect-square overflow-hidden bg-neutral-900/50">
                    <img
                      src={product.images[0]}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt={product.name}
                      loading="lazy"
                    />
                    <button
                      onClick={(e) => toggleWishlist(e, product._id)}
                      className="absolute top-2 right-2 p-2 bg-black/40 rounded-xl z-10 border border-white/10 hover:bg-red-500/20 transition-all"
                    >
                      {wishlist.includes(product._id) ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-white" />}
                    </button>
                  </div>

                  <div className="p-3 md:p-5 flex flex-col flex-1">
                    <p className="text-cyan-500 text-[9px] md:text-[11px] font-black uppercase tracking-widest mb-1 opacity-80">{product.brand}</p>
                    <h3 className="text-xs md:text-base font-bold line-clamp-2 mb-2 group-hover:text-cyan-400 transition-colors">{product.name}</h3>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                      <span className="text-sm md:text-xl font-black text-white">₹{product.price.toLocaleString()}</span>
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={(e) => handleAddToCart(e, product._id)}
                        className="p-2.5 md:p-3 bg-white text-black rounded-lg md:rounded-xl hover:bg-cyan-500 transition-all z-20 shadow-lg"
                      >
                        <FaShoppingCart size={14} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ================= LOAD MORE ================= */}
          {hasMore && !loading && (
            <div className="flex justify-center mt-12">
              <button
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  fetchProducts(nextPage);
                }}
                className="px-6 py-3 bg-cyan-500 text-black rounded-full font-black uppercase hover:bg-cyan-400 transition-all"
              >
                Load More
              </button>
            </div>
          )}

          {/* ================= EMPTY STATE ================= */}
          {!loading && filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <FaSearch size={40} className="mb-4 opacity-20" />
              <p className="font-mono text-sm uppercase tracking-widest">No results found</p>
            </div>
          )}
        </div>
      </div>

      {/* ================= SIDEBAR FILTER ================= */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilters(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110]" />
            <motion.aside
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-[#080808] border-l border-white/10 z-[120] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                  <h2 className="text-xl font-black tracking-tighter">FILTERS</h2>
                  <div className="h-1 w-12 bg-cyan-500" />
                </div>
                <button onClick={() => setShowFilters(false)} className="p-2 bg-white/5 rounded-full">
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Categories</p>
                {["All", "Smart Lighting", "Home Security", "Kitchen Gadgets", "Wearables"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setCategory(cat); setShowFilters(false); }}
                    className={`w-full text-left px-5 py-4 rounded-2xl text-xs font-black tracking-widest transition-all uppercase border ${
                      category === cat
                        ? "bg-cyan-500 text-black border-cyan-500 shadow-lg"
                        : "bg-white/5 text-gray-400 border-transparent hover:border-white/20"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="mt-12">
                <button
                  onClick={() => { setCategory("All"); setSearchQuery(""); setShowFilters(false); }}
                  className="w-full py-4 text-[10px] font-black uppercase text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                >
                  Reset Filters
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
       <AuthFooter />
    </>
  );
};

export default ProductListing;
  