import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaHeart,
  FaRegHeart,
  FaChevronLeft,
  FaShoppingCart,
  FaShareAlt,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import NavBar from "../../components/User/NavBar.jsx";

/* ================= AXIOS ================= */
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const zoomRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [zoom, setZoom] = useState({ x: 50, y: 50, show: false });

  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/api/products/user/${id}`);
        setProduct(res.data.product);
        setMainImage(res.data.product.images?.[0]);
        setIsInWishlist(Boolean(res.data.isInWishlist));
      } catch {
        toast.error("Product not found");
        navigate(-1);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await api.get("/api/wishlist");
        const ids = res.data.products?.map(p => p._id) || [];
        setIsInWishlist(ids.includes(id));
      } catch (err) {
        if (err?.response?.status === 401) return;
      }
    };

    fetchWishlist();
  }, [id]);

  /* ================= SHARE ================= */
  const handleShare = () => {
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Product link copied");
    }
  };

  const handleAddToCart = async () => {
    try {
      await api.post("/api/cart/add", { productId: id });
      toast.success("Added to cart");
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        navigate("/user/signin");
        return;
      }
      toast.error("Failed to add to cart");
    }
  };

  /* ================= WISHLIST ================= */
  const toggleWishlist = async () => {
    try {
      if (isInWishlist) {
        await api.delete(`/api/wishlist/remove/${id}`);
        setIsInWishlist(false);
        toast.success("Removed from wishlist");
      } else {
        await api.post(`/api/wishlist/add`, { productId: id });
        setIsInWishlist(true);
        toast.success("Added to wishlist");
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        navigate("/user/signin");
        return;
      }
      toast.error("Wishlist update failed");
    }
  };

  const handleZoomMove = (e) => {
    const el = zoomRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.min(100, Math.max(0, x));
    const clampedY = Math.min(100, Math.max(0, y));
    setZoom({ x: clampedX, y: clampedY, show: true });
  };

  const handleZoomLeave = () => {
    setZoom((z) => ({ ...z, show: false }));
  };

  if (!product) return null;

  return (
    <>
      <NavBar />

      <div className="min-h-screen bg-[#f7f7f5]">
        <main className="relative mx-auto max-w-[1200px] px-6 pb-24 pt-24">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.12)_1px,transparent_0)] bg-[size:14px_14px]" />
            <div className="absolute -top-12 -right-10 h-40 w-40 rounded-full bg-amber-200/40 blur-2xl" />
            <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-slate-200/60 blur-3xl" />
          </div>

          {/* BACK */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            <FaChevronLeft /> Back
          </button>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* ================= LEFT : IMAGES ================= */}
            <div className="space-y-4">
              <div className="relative">
                <div
                  ref={zoomRef}
                  onMouseMove={handleZoomMove}
                  onMouseLeave={handleZoomLeave}
                  className="relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]"
                >
                  <motion.img
                    key={mainImage}
                    src={mainImage}
                    alt={product.name}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />

                  {zoom.show && (
                    <div
                      className="pointer-events-none absolute h-36 w-36 rounded-full border-2 border-white/80 bg-white/20 shadow-[0_0_25px_rgba(15,23,42,0.18)]"
                      style={{
                        left: `calc(${zoom.x}% - 72px)`,
                        top: `calc(${zoom.y}% - 72px)`,
                      }}
                    />
                  )}
                </div>

                {zoom.show && (
                  <div
                    className="pointer-events-none absolute right-[-340px] top-0 hidden h-[340px] w-[340px] rounded-3xl border border-slate-200 bg-white shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)] lg:block"
                    style={{
                      backgroundImage: `url(${mainImage})`,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "250%",
                      backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                    }}
                  />
                )}
              </div>

              {/* THUMBNAILS */}
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(img)}
                    className={`h-20 w-20 flex-shrink-0 rounded-2xl border p-2 transition ${
                      mainImage === img
                        ? "border-slate-900 bg-white"
                        : "border-slate-200 bg-white/80 hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* ================= RIGHT : INFO ================= */}
            <div className="space-y-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
                  {product.brand}
                </p>

                <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                  {product.name}
                </h1>
              </div>

              {/* PRICE */}
              <div className="flex items-end gap-4">
                {product.discountPrice ? (
                  <>
                    <span className="text-3xl font-semibold text-slate-900">
                      ₹{product.discountPrice.toLocaleString()}
                    </span>
                    <span className="text-lg text-slate-400 line-through">
                      ₹{product.price.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-semibold text-slate-900">
                    ₹{product.price.toLocaleString()}
                  </span>
                )}
                {product.stock > 0 ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-600">
                    In stock
                  </span>
                ) : (
                  <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-600">
                    Out of stock
                  </span>
                )}
              </div>

              <p className="text-sm leading-relaxed text-slate-500">
                {product.description}
              </p>

              {/* ACTION BUTTONS */}
              <div className="space-y-4">
                <button
                  onClick={handleAddToCart}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <FaShoppingCart />
                  Add to cart
                </button>

                <div className="flex items-center justify-center gap-10">
                  <button
                    onClick={handleShare}
                    className="h-12 w-12 flex items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    <FaShareAlt />
                  </button>

                  <button
                    onClick={toggleWishlist}
                    className={`h-12 w-12 flex items-center justify-center rounded-2xl border transition ${
                      isInWishlist
                        ? "border-rose-200 bg-rose-50 text-rose-600"
                        : "border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:text-rose-600"
                    }`}
                  >
                    {isInWishlist ? <FaHeart /> : <FaRegHeart />}
                  </button>
                </div>
              </div>

              <div className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
                Hover on image to zoom
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ProductDetails;
