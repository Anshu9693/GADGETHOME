import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaMinus,
  FaTrash,
  FaShoppingCart,
  FaArrowLeft,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

/* ================= AXIOS ================= */
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  timeout: 8000,
});

const Cart = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({
    items: [],
    totalItems: 0,
    totalPrice: 0,
  });
  const [busy, setBusy] = useState({});

  /* ================= FETCH CART ================= */
  const fetchCart = async () => {
    try {
      const res = await api.get("/api/cart/getItems");

      const cartData = res.data.cart || {};
      setCart({
        items: cartData.items || [],
        totalItems: cartData.totalItems || 0,
        totalPrice: cartData.totalPrice || 0,
      });

      // 🔥 Sync navbar badge
      window.dispatchEvent(new Event("cartUpdated"));
    } catch {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  /* ================= UPDATE QUANTITY ================= */
  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1 || busy[productId]) return;

    setBusy((p) => ({ ...p, [productId]: true }));

    try {
      const res = await api.put("/api/cart/update", {
        productId,
        quantity,
      });

      setCart(res.data.cart);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch {
      toast.error("Quantity update failed");
    } finally {
      setBusy((p) => ({ ...p, [productId]: false }));
    }
  };

  /* ================= REMOVE ITEM ================= */
  const removeItem = async (productId) => {
    if (busy[productId]) return;

    setBusy((p) => ({ ...p, [productId]: true }));

    try {
      const res = await api.delete(`/api/cart/remove/${productId}`);
      setCart(res.data.cart);
      toast.success("Item removed");
      window.dispatchEvent(new Event("cartUpdated"));
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setBusy((p) => ({ ...p, [productId]: false }));
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-14 h-14 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 md:px-10 py-28">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-cyan-500 hover:text-black transition-all"
          >
            <FaArrowLeft size={14} />
          </button>

          <div>
            <h2 className="text-3xl md:text-4xl font-black uppercase italic">
              Cart_<span className="text-cyan-500">Session</span>
            </h2>
            <p className="text-xs font-mono text-gray-500 mt-1">
              {cart.totalItems} ITEM(S)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-24 border border-dashed border-white/10 rounded-3xl flex flex-col items-center opacity-40"
                >
                  <FaShoppingCart size={40} />
                  <p className="mt-4 text-xs font-mono tracking-widest">
                    CART_EMPTY
                  </p>
                </motion.div>
              ) : (
                cart.items.map((item) => (
                  <motion.div
                    key={item.product._id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className={`relative flex gap-6 bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 ${
                      busy[item.product._id] ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    {/* IMAGE */}
                    <img
                      src={item.product.images?.[0]}
                      className="w-28 h-28 object-contain rounded-xl bg-black cursor-pointer"
                      onClick={() =>
                        navigate(`/user/productDetail/${item.product._id}`)
                      }
                    />

                    {/* DETAILS */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-lg">
                          {item.product.name}
                        </h3>
                        <p className="text-cyan-500 mt-1">
                          ₹{item.product.price.toLocaleString()}
                        </p>
                      </div>

                      {/* QUANTITY */}
                      <div className="flex items-center gap-3 bg-white/5 w-fit p-1 rounded-lg border border-white/10">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product._id,
                              item.quantity - 1
                            )
                          }
                          disabled={item.quantity <= 1}
                        >
                          <FaMinus size={10} />
                        </button>

                        <span className="w-6 text-center font-mono text-xs">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product._id,
                              item.quantity + 1
                            )
                          }
                        >
                          <FaPlus size={10} />
                        </button>
                      </div>
                    </div>

                    {/* REMOVE */}
                    <button
                      onClick={() => removeItem(item.product._id)}
                      className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                    >
                      <FaTrash size={14} />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* SUMMARY */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-[#0a0a0a] border border-cyan-500/20 rounded-3xl p-8">
              <h3 className="text-xl font-black uppercase mb-6">
                Summary
              </h3>

              <div className="space-y-3 text-sm text-gray-400 mb-6">
                <div className="flex justify-between">
                  <span>Items</span>
                  <span className="text-white">{cart.totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="text-white">₹0</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between">
                  <span className="text-cyan-400 font-bold">Total</span>
                  <span className="text-xl text-white font-black">
                    ₹{cart.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                disabled={cart.items.length === 0}
                onClick={() => navigate("/user/checkout")}
                className="w-full py-4 bg-cyan-500 text-black font-black rounded-xl hover:bg-cyan-400 transition-all"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;
