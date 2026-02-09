import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import NavBar from "../../components/User/NavBar.jsx";
import Filter from "../../components/User/Filter.jsx";
import ProductCard from "../../components/Product/ProductCard.jsx";

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
      const prodRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/user/featured`,
        { withCredentials: true }
      );
      setProducts(prodRes.data.products || []);

      try {
        const wishRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/wishlist`,
          { withCredentials: true }
        );
        if (wishRes.data?.products) {
          setWishlist(wishRes.data.products.map((p) => p._id));
        }
      } catch {
        // Guest users may not have a wishlist
      }
    } catch {
      toast.error("Failed to load featured products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ================= FILTERING LOGIC ================= */
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
      toast.success("Added to cart");
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Please login");
        navigate("/user/signin");
      } else {
        toast.error("Failed to add to cart");
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
        toast.success("Removed from wishlist");
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/wishlist/add`,
          { productId },
          { withCredentials: true }
        );
        setWishlist((prev) => [...prev, productId]);
        toast.success("Added to wishlist");
      }
    } catch (err) {
      if (err.response?.status === 401) navigate("/user/signin");
      else toast.error("Wishlist update failed");
    }
  };

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

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <NavBar />

      <main className="relative mx-auto max-w-[1400px] px-6 pb-24 pt-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.12)_1px,transparent_0)] bg-[size:14px_14px]" />
          <div className="absolute -top-12 -right-10 h-40 w-40 rounded-full bg-amber-200/40 blur-2xl" />
          <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-slate-200/60 blur-3xl" />
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
          <aside className="hidden lg:block">
            <div className="sticky top-28 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
              <Filter products={products} onChange={setFilters} />
            </div>
          </aside>

          <section className="lg:col-span-3">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="w-full max-w-xs text-left">
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Featured</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">Editor Picks</h2>
                <p className="mt-1 text-[12px] text-slate-500">
                  {filteredProducts.length} items
                </p>
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
            ) : filteredProducts.length > 0 ? (
              <motion.div layout className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((p) => (
                  <ProductCard
                    key={p._id}
                    product={p}
                    wishlist={wishlist}
                    onWishlistToggle={toggleWishlist}
                    onAddToCart={addToCart}
                    onShare={handleShare}
                    onOpen={() => navigate(`/user/productDetail/${p._id}`)}
                  />
                ))}
              </motion.div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white/90 py-32 text-center text-slate-500">
                No featured products found
              </div>
            )}
          </section>
        </div>

        <div className="lg:hidden">
          <Filter products={products} onChange={setFilters} />
        </div>
      </main>
    </div>
  );
};

export default FeaturedProducts;
