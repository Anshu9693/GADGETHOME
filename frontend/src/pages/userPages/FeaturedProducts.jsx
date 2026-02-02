import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
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

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* ================= FETCH FEATURED PRODUCTS ================= */
  const fetchFeaturedProducts = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/user/featured`,
        { withCredentials: true }
      );
      setProducts(res.data.products || []);
    } catch {
      toast.error("Failed to load featured products");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH WISHLIST ================= */
  const fetchWishlist = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/wishlist`,
        { withCredentials: true }
      );
      setWishlist(res.data.products.map((p) => p._id));
    } catch {}
  };

  useEffect(() => {
    fetchFeaturedProducts();
    fetchWishlist();
  }, []);

  /* ================= ADD TO CART ================= */
  const addToCart = async (productId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart/add`,
        { productId, quantity: 1 },
        { withCredentials: true }
      );
      toast.success("Added to cart 🛒");
    } catch (err) {
      if (err.response?.status === 401) navigate("/user/signin");
      else toast.error("Failed to add to cart");
    }
  };

  /* ================= TOGGLE WISHLIST ================= */
  const toggleWishlist = async (productId) => {
    try {
      if (wishlist.includes(productId)) {
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/wishlist/remove/${productId}`,
          { withCredentials: true }
        );
        setWishlist(wishlist.filter((id) => id !== productId));
        toast.success("Removed from wishlist 💔");
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/wishlist/add`,
          { productId },
          { withCredentials: true }
        );
        setWishlist([...wishlist, productId]);
        toast.success("Added to wishlist ❤️");
      }
    } catch {
      toast.error("Wishlist action failed");
    }
  };

  /* ================= SHARE PRODUCT ================= */
  const handleShare = (e, productId) => {
    e.stopPropagation();
    const link = `${window.location.origin}/user/productDetail/${productId}`;
    navigator.clipboard.writeText(link);
    toast.success("Product link copied 🔗");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-14 h-14 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <NavBar />

      <div className="min-h-screen bg-black text-white px-6 md:px-12 pt-32 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* <h1 className="text-5xl font-black mb-12">
            Featured <span className="text-cyan-500">Products</span>
          </h1> */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((p) => (
              <motion.div
                key={p._id}
                whileHover={{ scale: 1.03 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 group cursor-pointer flex flex-col"
                onClick={() => navigate(`/user/productDetail/${p._id}`)}
              >
                {/* IMAGE */}
                <div className="relative h-56 flex items-center justify-center mb-6">
                  <img
                    src={p.images?.[0]}
                    alt={p.name}
                    className="max-h-full object-contain"
                  />

                  {/* ACTION BUTTONS */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    {/* WISHLIST */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(p._id);
                      }}
                      className="w-11 h-11 bg-black/60 rounded-full flex items-center justify-center"
                    >
                      {wishlist.includes(p._id) ? (
                        <FaHeart className="text-red-500" />
                      ) : (
                        <FaRegHeart className="text-white" />
                      )}
                    </button>

                    {/* SHARE */}
                    <button
                      onClick={(e) => handleShare(e, p._id)}
                      className="w-11 h-11 bg-black/60 rounded-full flex items-center justify-center hover:bg-cyan-500 transition-all"
                    >
                      <FaShareAlt className="text-white" />
                    </button>
                  </div>
                </div>

                {/* INFO */}
                <p className="text-cyan-400 text-xs font-black uppercase mb-1">
                  {p.brand}
                </p>
                <h3 className="font-black text-xl mb-1 line-clamp-2">
                  {p.name}
                </h3>

                <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                  {p.description}
                </p>

                {p.stock <= 10 && (
                  <span className="text-xs font-bold text-red-500 mb-3">
                    ⚠ Only {p.stock} left
                  </span>
                )}

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                  <div className="flex flex-col">
                    {p.discountPrice ? (
                      <>
                        <span className="text-xl font-black text-cyan-400">
                          ₹{p.discountPrice.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          ₹{p.price.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className="text-xl font-black">
                        ₹{p.price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(p._id);
                    }}
                    className="bg-white text-black w-12 h-12 rounded-xl flex items-center justify-center hover:bg-cyan-500 transition-all"
                  >
                    <FaShoppingCart />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default FeaturedProducts;
