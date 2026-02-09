import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FaFire } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";
import ProductCard from "../Product/ProductCard.jsx";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

const BestSellingForLandingpage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const rawProducts = products.map((item) => item.product).filter(Boolean);
  const displayed = rawProducts.slice(0, 5);

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

  return (
    <section className="relative overflow-hidden bg-white/93 py-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-10 right-0 h-48 w-48 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute -bottom-16 left-0 h-56 w-56 rounded-full bg-slate-200/60 blur-3xl" />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.08)_1px,transparent_0)] bg-[size:14px_14px]" />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">
              Best Selling
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              Top 5 Best Sellers
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Customer favorites you can shop right away.
            </p>
          </div>
          <Link
            to="/user/bestselling"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-widest text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
          >
            <FaFire className="text-amber-500" />
            View All
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-[420px] animate-pulse rounded-3xl border border-slate-200 bg-white/80"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
            {displayed.map((product) => {
              if (!product) return null;
              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
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
                    showDescription={false}
                    showRating={false}
                    showCategory={false}
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default BestSellingForLandingpage;
