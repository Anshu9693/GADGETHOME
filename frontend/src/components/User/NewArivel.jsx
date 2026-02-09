import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaChevronRight } from "react-icons/fa";

import ProductCard from "../Product/ProductCard.jsx";

const ITEMS = 8;

const NewArivel = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/user/allproducts`,
          { withCredentials: true }
        );
        setProducts(res.data.products || []);

        try {
          const wish = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/wishlist`,
            { withCredentials: true }
          );
          setWishlist(wish.data.products?.map(p => p._id) || []);
        } catch {}
      } catch {
        toast.error("Failed to load new arrivals");
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, []);

  const latestProducts = useMemo(() => {
    const sorted = [...products].sort((a, b) => {
      const aDate = new Date(a.createdAt || a.updatedAt || 0).getTime();
      const bDate = new Date(b.createdAt || b.updatedAt || 0).getTime();
      return bDate - aDate;
    });
    return sorted.slice(0, ITEMS);
  }, [products]);

  const toggleWishlist = async (e, id) => {
    e.stopPropagation();
    try {
      if (wishlist.includes(id)) {
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/wishlist/remove/${id}`,
          { withCredentials: true }
        );
        setWishlist(prev => prev.filter(i => i !== id));
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/wishlist/add`,
          { productId: id },
          { withCredentials: true }
        );
        setWishlist(prev => [...prev, id]);
      }
    } catch {
      navigate("/user/signin");
    }
  };

  const handleAddToCart = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart/add`,
        { productId: id, quantity: 1 },
        { withCredentials: true }
      );
      toast.success("Added to cart");
    } catch {
      navigate("/user/signin");
    }
  };

  const handleShare = async (e, id) => {
    e.stopPropagation();
    const link = `${window.location.origin}/user/productDetail/${id}`;
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

  return (
    <section className="bg-[#f7f7f5] py-24">
      <div className="relative mx-auto max-w-[1400px] px-6">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.12)_1px,transparent_0)] bg-[size:14px_14px]" />
          <div className="absolute -top-12 -right-10 h-40 w-40 rounded-full bg-cyan-200/40 blur-2xl" />
          <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-slate-200/60 blur-3xl" />
        </div>

        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">
              Fresh picks
            </p>
            <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-slate-900">
              New Arrivals
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Latest products added to our store.
            </p>
          </div>
          <button
            onClick={() => navigate("/user/allproducts")}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
          >
            View all products
            <FaChevronRight className="text-xs" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-[420px] animate-pulse rounded-3xl border border-slate-200 bg-white/80"
              />
            ))}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {latestProducts.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                wishlist={wishlist}
                onWishlistToggle={toggleWishlist}
                onAddToCart={handleAddToCart}
                onShare={handleShare}
                onOpen={() => navigate(`/user/productDetail/${product._id}`)}
                showDescription={false}
                showRating={false}
                showCategory={false}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default NewArivel;
