import React, { useState, useEffect } from "react";
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

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [isInWishlist, setIsInWishlist] = useState(false);

  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/api/products/user/${id}`);
        setProduct(res.data.product);
        setMainImage(res.data.product.images?.[0]);
        setIsInWishlist(res.data.isInWishlist || false);
      } catch {
        toast.error("Product not found");
        navigate(-1);
      }
    };

    fetchProduct();
  }, [id, navigate]);

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
      toast.success("Product link copied 🔗");
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
        toast.success("Added to wishlist ❤️");
      }
    } catch {
      navigate("/user/signin");
    }
  };

  if (!product) return null;

  return (
    <>
      <NavBar />

      <div className="min-h-screen bg-[#050505] text-white pt-28 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* BACK */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-6"
          >
            <FaChevronLeft /> Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
            {/* ================= LEFT : IMAGES ================= */}
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 aspect-square flex items-center justify-center">
                <motion.img
                  key={mainImage}
                  src={mainImage}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* THUMBNAILS */}
              <div className="flex gap-3 overflow-x-auto">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(img)}
                    className={`w-20 h-20 rounded-xl border p-2 flex-shrink-0 ${
                      mainImage === img
                        ? "border-cyan-500 bg-white/5"
                        : "border-white/10"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* ================= RIGHT : INFO ================= */}
            <div>
              <p className="text-cyan-400 font-bold uppercase mb-2">
                {product.brand}
              </p>

              <h1 className="text-3xl md:text-4xl font-black mb-4">
                {product.name}
              </h1>

              {/* PRICE */}
              <div className="flex items-end gap-4 mb-6">
                {product.discountPrice ? (
                  <>
                    <span className="text-3xl font-black text-cyan-400">
                      ₹{product.discountPrice.toLocaleString()}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      ₹{product.price.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-black">
                    ₹{product.price.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-gray-400 mb-8 leading-relaxed">
                {product.description}
              </p>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3">
                <button className="flex-1 h-14 bg-white text-black rounded-xl font-black flex items-center justify-center gap-2 hover:bg-cyan-500 transition-all">
                  <FaShoppingCart />
                  ADD TO CART
                </button>

                {/* SHARE */}
                <button
                  onClick={handleShare}
                  className="w-14 h-14 border border-white/20 rounded-xl flex items-center justify-center hover:border-cyan-500 hover:text-cyan-400 transition-all"
                >
                  <FaShareAlt />
                </button>

                {/* WISHLIST */}
                <button
                  onClick={toggleWishlist}
                  className={`w-14 h-14 rounded-xl border flex items-center justify-center transition-all ${
                    isInWishlist
                      ? "border-red-500 text-red-500 bg-red-500/10"
                      : "border-white/20 hover:border-red-500 hover:text-red-500"
                  }`}
                >
                  {isInWishlist ? <FaHeart /> : <FaRegHeart />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
