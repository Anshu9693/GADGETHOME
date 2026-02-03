import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShoppingCart,
  FaHeart,
  FaRegHeart,
  FaShareAlt,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/User/NavBar.jsx";
import Footer from "../../components/User/Footer.jsx";
import Filter from "../../components/User/Filter.jsx";

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();

  /* ================= FETCH DATA ================= */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch Featured Products
      const prodRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/user/featured`,
        { withCredentials: true }
      );
      setProducts(prodRes.data.products || []);

      // Fetch Wishlist (wrapped in try-catch to handle non-logged in users)
      try {
        const wishRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/wishlist`,
          { withCredentials: true }
        );
        if (wishRes.data?.products) {
          setWishlist(wishRes.data.products.map((p) => p._id));
        }
      } catch (err) {
        // Silently fail if user is not logged in
        console.log("Wishlist not fetched: User might be guest.");
      }
    } catch (error) {
      toast.error("Failed to sync with sector database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ================= FILTERING LOGIC (OPTIMIZED) ================= */
  const filteredProducts = useMemo(() => {
    let res = [...products];
    const { priceRange, brands, categories, connectivity } = filters || {};

    if (priceRange) {
      res = res.filter((p) => {
        const price = p.discountPrice ?? p.price ?? 0;
        return price >= (priceRange[0] ?? 0) && price <= (priceRange[1] ?? Infinity);
      });
    }

    if (brands?.length) {
      res = res.filter((p) => brands.includes(p.brand));
    }

    if (categories?.length) {
      res = res.filter((p) => categories.includes(p.category));
    }

    if (connectivity?.length) {
      res = res.filter((p) => {
        if (!p.connectivity) return false;
        const pConn = Array.isArray(p.connectivity) ? p.connectivity : [p.connectivity];
        return pConn.some((c) => connectivity.includes(c));
      });
    }

    return res;
  }, [products, filters]);

  /* ================= ACTIONS ================= */
  const addToCart = async (e, productId) => {
    e.stopPropagation();
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart/add`,
        { productId, quantity: 1 },
        { withCredentials: true }
      );
      toast.success("Secured in Cart 🛒");
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Unauthorized: Please Login");
        navigate("/user/signin");
      } else {
        toast.error("Cart Uplink Failed");
      }
    }
  };

  const toggleWishlist = async (e, productId) => {
    e.stopPropagation();
    try {
      if (wishlist.includes(productId)) {
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/wishlist/remove/${productId}`,
          { withCredentials: true }
        );
        setWishlist((prev) => prev.filter((id) => id !== productId));
        toast.success("Removed from Wishlist");
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/wishlist/add`,
          { productId },
          { withCredentials: true }
        );
        setWishlist((prev) => [...prev, productId]);
        toast.success("Added to Wishlist ❤️");
      }
    } catch (err) {
      if (err.response?.status === 401) navigate("/user/signin");
      else toast.error("Wishlist Override Failed");
    }
  };

  const handleShare = (e, productId) => {
    e.stopPropagation();
    const link = `${window.location.origin}/user/productDetail/${productId}`;
    navigator.clipboard.writeText(link);
    toast.success("Link Copied to Clipboard 🔗");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-14 h-14 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <NavBar />

      <main className="px-6 md:px-12 pt-32 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* FILTER SIDEBAR */}
            <aside className="hidden md:block md:col-span-1">
              <div className="sticky top-32">
                <Filter products={products} onChange={setFilters} />
              </div>
            </aside>

            {/* PRODUCT GRID */}
            <section className="md:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => (
                      <motion.div
                        key={p._id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ y: -5 }}
                        className="bg-white/5 border border-white/10 rounded-[2rem] p-6 group cursor-pointer flex flex-col hover:border-cyan-500/30 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                        onClick={() => navigate(`/user/productDetail/${p._id}`)}
                      >
                        {/* IMAGE AREA */}
                        <div className="relative h-52 flex items-center justify-center mb-6 overflow-hidden">
                          <img
                            src={p.images?.[0]}
                            alt={p.name}
                            className="max-h-full object-contain group-hover:scale-110 transition-transform duration-700"
                          />

                          {/* FLOATING ACTIONS */}
                          <div className="absolute top-0 right-0 flex flex-col gap-2">
                            <button
                              onClick={(e) => toggleWishlist(e, p._id)}
                              className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:border-red-500/50 transition-colors"
                            >
                              {wishlist.includes(p._id) ? (
                                <FaHeart className="text-red-500" />
                              ) : (
                                <FaRegHeart className="text-white" />
                              )}
                            </button>

                            <button
                              onClick={(e) => handleShare(e, p._id)}
                              className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:border-cyan-500/50 transition-colors"
                            >
                              <FaShareAlt size={14} className="text-white" />
                            </button>
                          </div>
                        </div>

                        {/* PRODUCT INFO */}
                        <div className="flex flex-col flex-1">
                          <span className="text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-1">
                            {p.brand}
                          </span>
                          <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-cyan-400 transition-colors">
                            {p.name}
                          </h3>

                          <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                            {p.description}
                          </p>

                          {p.stock <= 10 && p.stock > 0 && (
                            <div className="mb-4 inline-flex items-center gap-2 text-[10px] font-bold text-red-500 uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                              Limited: {p.stock} Units Left
                            </div>
                          )}

                          <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                            <div className="flex flex-col">
                              {p.discountPrice ? (
                                <>
                                  <span className="text-xl font-black text-white">
                                    ₹{p.discountPrice.toLocaleString()}
                                  </span>
                                  <span className="text-xs text-gray-500 line-through">
                                    ₹{p.price.toLocaleString()}
                                  </span>
                                </>
                              ) : (
                                <span className="text-xl font-black text-white">
                                  ₹{p.price.toLocaleString()}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={(e) => addToCart(e, p._id)}
                              className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-cyan-500 hover:scale-105 transition-all active:scale-95 shadow-lg"
                            >
                              <FaShoppingCart size={18} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center">
                      <p className="text-gray-500 font-mono tracking-widest">NO PRODUCTS FOUND IN THIS SECTOR</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FeaturedProducts;