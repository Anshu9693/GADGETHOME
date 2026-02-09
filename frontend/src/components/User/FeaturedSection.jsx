import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaHeart,
  FaRegHeart,
  FaShareAlt,
  FaShoppingCart,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const ITEMS_PER_PAGE = 8;

const FeaturedSection = () => {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/user/featured`,
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
        toast.error("Failed to load featured products");
      }
    };

    fetchFeatured();
  }, []);

  /* ---------------- WISHLIST ---------------- */
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

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const currentProducts = products.slice(start, start + ITEMS_PER_PAGE);

  return (
    <section className="bg-[#f7f7f4] py-24">
      <div className="relative mx-auto max-w-[1400px] px-6">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.12)_1px,transparent_0)] bg-[size:14px_14px]" />
          <div className="absolute -top-12 -right-10 h-40 w-40 rounded-full bg-cyan-200/40 blur-2xl" />
          <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-slate-200/60 blur-3xl" />
        </div>

        {/* HEADER */}
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">
              Curated picks
            </p>
            <h2 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              Featured Collections
            </h2>
            {/* <p className="mt-2 text-sm text-slate-500">
              Top-rated picks chosen for performance and value.
            </p> */}
          </div>

          {/* VIEW ALL */}
          <button
            onClick={() => navigate("/user/featured")}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-7 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
          >
            View All Collections
          </button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {currentProducts.map(p => (
            <motion.div
              key={p._id}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 220 }}
              onClick={() => navigate(`/user/productDetail/${p._id}`)}
              className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-lg"
            >
              {/* IMAGE */}
              <div className="relative h-72 w-full overflow-hidden bg-slate-100">
                <img
                  src={p.images?.[0]}
                  alt={p.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* DISCOUNT */}
                {p.discountPrice && (
                  <span className="absolute left-4 top-4 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                    {Math.round(
                      ((p.price - p.discountPrice) / p.price) * 100
                    )}
                    % off
                  </span>
                )}

                {/* ACTIONS */}
                <div className="absolute right-4 top-4 flex flex-col gap-3">
                  <button
                    onClick={e => toggleWishlist(e, p._id)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm"
                  >
                    {wishlist.includes(p._id) ? (
                      <FaHeart className="text-red-500" />
                    ) : (
                      <FaRegHeart className="text-gray-600" />
                    )}
                  </button>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(
                        `${window.location.origin}/user/productDetail/${p._id}`
                      );
                      toast.success("Link copied");
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm"
                  >
                    <FaShareAlt size={13} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* INFO PANEL */}
              <div className="bg-white px-6 py-5">
                <h3 className="truncate text-lg font-semibold text-gray-900">
                  {p.name}
                </h3>
                <p className="mt-1 text-[11px] uppercase tracking-wider text-slate-400">
                  {p.brand}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      ₹{(p.discountPrice || p.price).toLocaleString()}
                    </p>
                    {p.discountPrice && (
                      <p className="text-sm text-gray-400 line-through">
                        ₹{p.price.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <button className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-800">
                    <FaShoppingCart size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="mt-20 flex items-center justify-center gap-6">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-gray-700 disabled:opacity-40"
            >
              <FaChevronLeft />
            </button>

            <span className="text-sm font-medium text-gray-500">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-gray-700 disabled:opacity-40"
            >
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedSection;
