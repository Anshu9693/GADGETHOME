import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import NavBar from "../../../components/User/NavBar.jsx";
import Filter from "../../../components/User/Filter.jsx";
import Pagination from "../../../components/User/Pagination.jsx";
import ProductCard from "../../../components/Product/ProductCard.jsx";

import { FaSearch, FaChevronDown, FaBoxOpen } from "react-icons/fa";

const PAGE_LIMIT = 8;

const SmartLighting = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const fetchData = useCallback(async () => {
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
        setWishlist(wish.data.products.map(p => p._id));
      } catch (err) {
        console.error("Wishlist fetch error", err);
      }
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const smartLightingProducts = useMemo(() => {
    return products.filter(p => {
      const category = (p.category || "").toLowerCase();
      return category.includes("smart lighting") || category.includes("smartlighting");
    });
  }, [products]);

  /* ---------------- FILTER LOGIC ---------------- */
  const filteredProducts = useMemo(() => {
    let result = [...smartLightingProducts];

    if (filters?.priceRange) {
      result = result.filter(p => {
        const price = p.discountPrice ?? p.price;
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });
    }

    if (filters?.brands?.length > 0) {
      result = result.filter(p => filters.brands.includes(p.brand));
    }

    if (filters?.categories?.length > 0) {
      result = result.filter(p => filters.categories.includes(p.category));
    }

    if (filters?.minRating > 0) {
      result = result.filter(p => (p.ratings || 0) >= filters.minRating);
    }

    if (filters?.inStockOnly) {
      result = result.filter(p => p.stock > 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.name?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q)
      );
    }

    if (sortBy === "low-high") {
      result.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
    } else if (sortBy === "high-low") {
      result.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? b.price));
    } else {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [smartLightingProducts, filters, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_LIMIT);
  const startIndex = (page - 1) * PAGE_LIMIT;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + PAGE_LIMIT);

  useEffect(() => {
    setPage(1);
  }, [filters, searchQuery, sortBy]);

  const toggleWishlist = async (e, id) => {
    e.stopPropagation();
    try {
      if (wishlist.includes(id)) {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/wishlist/remove/${id}`, { withCredentials: true });
        setWishlist(prev => prev.filter(i => i !== id));
      } else {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/wishlist/add`, { productId: id }, { withCredentials: true });
        setWishlist(prev => [...prev, id]);
      }
    } catch {
      navigate("/user/signin");
    }
  };

  const handleAddToCart = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/cart/add`, { productId: id, quantity: 1 }, { withCredentials: true });
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
    <div className="min-h-screen bg-[#f7f7f5]">
      <NavBar />
      <main className="relative mx-auto max-w-[1400px] px-6 pb-24 pt-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.12)_1px,transparent_0)] bg-[size:14px_14px]" />
          <div className="absolute -top-12 -right-10 h-40 w-40 rounded-full bg-cyan-200/40 blur-2xl" />
          <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-slate-200/60 blur-3xl" />
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
          <aside className="hidden lg:block">
            <div className="sticky top-28 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
              <Filter products={smartLightingProducts} onChange={setFilters} />
            </div>
          </aside>

          <section className="lg:col-span-3">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="w-full max-w-xs text-left">
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Category</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">Smart Lighting</h2>
                <p className="mt-1 text-[12px] text-slate-500">
                  {filteredProducts.length} items
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search products"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 sm:w-[280px]"
                  />
                </div>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="appearance-none rounded-2xl border border-slate-200 bg-white px-5 py-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="newest">Newest</option>
                    <option value="low-high">Price: Low to High</option>
                    <option value="high-low">Price: High to Low</option>
                  </select>
                  <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
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
            ) : paginatedProducts.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white/90 py-32 text-center text-slate-500">
                <FaBoxOpen className="mx-auto mb-4 text-4xl" />
                No products found
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedProducts.map(product => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    wishlist={wishlist}
                    onWishlistToggle={toggleWishlist}
                    onAddToCart={handleAddToCart}
                    onShare={handleShare}
                    onOpen={() => navigate(`/user/productDetail/${product._id}`)}
                  />
                ))}
              </motion.div>
            )}

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </section>
        </div>

        <div className="lg:hidden">
          <Filter products={smartLightingProducts} onChange={setFilters} />
        </div>
      </main>
    </div>
  );
};

export default SmartLighting;
