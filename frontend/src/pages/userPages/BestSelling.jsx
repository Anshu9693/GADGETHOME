import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaFire, FaSearch, FaChevronDown } from "react-icons/fa";

import NavBar from "../../components/User/NavBar.jsx";
import Filter from "../../components/User/Filter.jsx";
import ProductCard from "../../components/Product/ProductCard.jsx";

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
    transition: { staggerChildren: 0.05 },
  },
};

const BestSelling = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

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

  // Filter state and derived lists
  const rawProducts = products.map((item) => item.product).filter(Boolean);

  const filtered = (() => {
    let res = [...rawProducts];
    const { priceRange, brands, categories, connectivity } = filters || {};
    if (priceRange) {
      res = res.filter((p) => {
        const price = p.discountPrice ?? p.price ?? 0;
        return price >= (priceRange[0] ?? -Infinity) && price <= (priceRange[1] ?? Infinity);
      });
    }
    if (brands && brands.length) res = res.filter((p) => brands.includes(p.brand));
    if (categories && categories.length) res = res.filter((p) => categories.includes(p.category));
    if (connectivity && connectivity.length) res = res.filter((p) => {
      const conn = p.connectivity;
      if (!conn) return false;
      if (Array.isArray(conn)) return conn.some((c) => connectivity.includes(c));
      return connectivity.includes(conn);
    });
    return res;
  })();

  /* ================= SHARE ================= */
  const handleShare = async (e, productId) => {
    e.stopPropagation();
    const link = `${window.location.origin}/user/productDetail/${productId}`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const input = document.createElement("input");
        input.value = link;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      toast.success("Link copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  /* ================= CART ================= */
  const handleAddToCart = async (e, productId) => {
    e.stopPropagation();
    try {
      await api.post("/api/cart/add", { productId, quantity: 1 });
      toast.success("Added to cart");
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
      toast.error("Login first to manage wishlist");
    }
  };

  const displayed = filtered.slice(0, 8);

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-[#f7f7f5]">
        <main className="relative mx-auto max-w-[1400px] px-6 pb-24 pt-24">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.12)_1px,transparent_0)] bg-[size:14px_14px]" />
            <div className="absolute -top-12 -right-10 h-40 w-40 rounded-full bg-amber-200/40 blur-2xl" />
            <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-slate-200/60 blur-3xl" />
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
            <aside className="hidden lg:block">
              <div className="sticky top-28 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
                <Filter products={rawProducts} onChange={setFilters} />
              </div>
            </aside>

            <section className="lg:col-span-3">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="w-full max-w-xs text-left">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Best Selling</p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-900">Top Picks</h2>
                  <p className="mt-1 text-[12px] text-slate-500">
                    {filtered.length} items
                  </p>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <FaFire className="text-amber-500" />
                  <span className="text-xs uppercase tracking-[0.2em]">Trending now</span>
                </div>
              </div>
              {loading ? (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-[420px] animate-pulse rounded-3xl border border-slate-200 bg-white/80"
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  variants={pageVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {displayed.map((product, index) => {
                    if (!product) return null;
                    const totalSold = (products.find(i => i.product?._id === product._id)?.totalSold) ?? 0;

                    const hasDiscount = Boolean(product.discountPrice);

                    return (
                      <div key={product._id} className="relative">
                        <span
                          className={`pointer-events-none absolute z-10 rounded-full bg-amber-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white shadow ${
                            hasDiscount ? "left-3 top-12" : "left-3 top-3"
                          }`}
                        >
                          #{index + 1} best
                        </span>

                        <ProductCard
                          product={product}
                          wishlist={wishlist}
                          onWishlistToggle={toggleWishlist}
                          onAddToCart={handleAddToCart}
                          onShare={handleShare}
                          onOpen={() =>
                            isLoggedIn
                              ? navigate(`/user/productDetail/${product._id}`)
                              : navigate("/user/signin")
                          }
                        />

                        <p className="mt-2 text-xs text-slate-500">
                          Sold {totalSold} times
                        </p>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </section>
          </div>

          <div className="lg:hidden">
            <Filter products={rawProducts} onChange={setFilters} />
          </div>
        </main>
      </div>
    </>
  );
};

export default BestSelling;
