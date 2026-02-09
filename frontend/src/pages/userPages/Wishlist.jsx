import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaShoppingCart, FaArrowLeft, FaShareAlt } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/User/NavBar.jsx";

const Wishlist = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/wishlist`,
        { withCredentials: true }
      );
      setProducts(res.data.products || []);
    } catch {
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/wishlist/remove/${id}`,
        { withCredentials: true }
      );
      toast.success("Removed from wishlist");
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      toast.error("Failed to remove");
    }
  };

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation();
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart/add`,
        { productId, quantity: 1 },
        { withCredentials: true }
      );
      toast.success("Added to cart");
    } catch {
      toast.error("Please login again");
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

  useEffect(() => {
    fetchWishlist();
  }, []);

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

          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/user/allproducts")}
                className="rounded-full border border-slate-200 bg-white p-3 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                <FaArrowLeft size={14} />
              </button>
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Wishlist</p>
                <h1 className="mt-1 text-2xl font-semibold text-slate-900">Saved items</h1>
                <p className="mt-1 text-[12px] text-slate-500">{products.length} items</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[360px] rounded-3xl bg-white/80 border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white/90 py-24 text-center text-slate-500">
              <p className="text-xs uppercase tracking-[0.25em]">Your wishlist is empty</p>
              <button
                onClick={() => navigate("/user/allproducts")}
                className="mt-6 rounded-2xl bg-slate-900 px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                Browse products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <div
                  key={p._id}
                  onClick={() => navigate(`/user/productDetail/${p._id}`)}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.35)] transition hover:shadow-[0_22px_50px_-30px_rgba(15,23,42,0.45)]"
                >
                  <div className="relative h-52 bg-slate-100">
                    <img
                      src={p.images?.[0]}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={p.name}
                    />

                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={(e) => handleShare(e, p._id)}
                        className="rounded-full border border-slate-200 bg-white/95 p-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                      >
                        <FaShareAlt size={12} />
                      </button>
                      <button
                        onClick={(e) => removeFromWishlist(p._id, e)}
                        className="rounded-full border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:border-rose-300 hover:bg-rose-100"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">{p.brand}</p>
                    <h3 className="mt-1 text-base font-semibold text-slate-900 line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                      {p.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                      <div>
                        {p.discountPrice ? (
                          <>
                            <span className="text-lg font-semibold text-slate-900">
                              ₹{p.discountPrice.toLocaleString()}
                            </span>
                            <span className="block text-xs text-slate-400 line-through">
                              ₹{p.price.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-semibold text-slate-900">
                            ₹{p.price?.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleAddToCart(e, p._id)}
                        className="rounded-2xl bg-slate-900 p-3 text-white transition hover:bg-slate-800"
                      >
                        <FaShoppingCart size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Wishlist;
