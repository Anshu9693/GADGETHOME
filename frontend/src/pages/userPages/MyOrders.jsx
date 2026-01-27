import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "../../components/User/NavBar.jsx";
import {
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

/* ================= AXIOS ================= */
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  timeout: 8000,
});

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});

  /* ================= FETCH ORDERS ================= */
  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/order/user");
      setOrders(res.data.orders || []);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // 🔥 If redirected back from Stripe with session_id, confirm payment with backend
    const handleStripeReturn = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");
      if (sessionId) {
        try {
          const res = await api.post("/api/stripe/confirm", { sessionId });
          toast.success(res.data.message || "Payment confirmed");
          // notify navbar and other listeners that cart changed
          window.dispatchEvent(new Event("cart-updated"));
          // refresh orders to show updated payment status
          fetchOrders();
        } catch (err) {
          console.error("Stripe confirm error:", err.response || err);
          toast.error(err.response?.data?.message || "Failed to confirm payment");
        }
        // Clean up URL
        window.history.replaceState({}, document.title, "/user/myorders");
      }
    };

    handleStripeReturn();
  }, []);

  /* ================= CANCEL ORDER ================= */
  const cancelOrder = async (orderId) => {
    if (busy[orderId]) return;

    if (!confirm("Are you sure you want to cancel this order?")) return;

    setBusy((p) => ({ ...p, [orderId]: true }));

    try {
      const res = await api.put(`/api/order/user/cancel/${orderId}`);
      toast.success(res.data.message || "Order cancelled successfully");
      fetchOrders(); // Refresh the orders list
    } catch (err) {
      console.error("Cancel Error Details:", err.response || err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to cancel order";
      toast.error(errorMsg);
    } finally {
      setBusy((p) => ({ ...p, [orderId]: false }));
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-14 h-14 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-[#050505] text-white pt-32 px-6 md:px-12 pb-20">
        <div className="max-w-7xl mx-auto">

          {/* HEADER */}
          <h1 className="text-3xl md:text-4xl font-black mb-10">
            My <span className="text-cyan-400">Orders</span>
          </h1>

          {orders.length === 0 ? (
            <div className="text-center py-32 opacity-50">
              <FaBox size={40} className="mx-auto mb-4" />
              <p className="font-mono text-sm">NO_ORDERS_FOUND</p>
            </div>
          ) : (
            <div className="space-y-8">
              <AnimatePresence>
                {orders.map((order) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8"
                  >
                    {/* TOP BAR */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                      <div>
                        <p className="text-xs font-mono text-gray-500">
                          ORDER ID
                        </p>
                        <p className="font-bold break-all">{order._id.slice(0,6)}</p>
                      </div>

                      <StatusBadge status={order.orderStatus} />
                    </div>

                    {/* ITEMS */}
                    <div className="space-y-4 mb-6">
                      {order.items.map((item) => (
                        <div
                          key={item.product}
                          className="flex gap-4 bg-black/30 rounded-xl p-4"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-contain rounded-lg bg-black"
                          />

                          <div className="flex-1">
                            <h3 className="font-bold">{item.name}</h3>
                            <p className="text-cyan-400 text-sm">
                              ₹{item.price} × {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ADDRESS */}
                    <div className="text-sm text-gray-400 mb-6">
                      <p className="font-mono text-xs text-gray-500 mb-1">
                        DELIVERY ADDRESS
                      </p>
                      <p>
                        {order.shippingAddress?.fullName},{" "}
                        {order.shippingAddress?.address},{" "}
                        {order.shippingAddress?.city},{" "}
                        {order.shippingAddress?.state} –{" "}
                        {order.shippingAddress?.pincode}
                      </p>
                    </div>

                    {/* FOOTER */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <p className="text-xl font-black text-cyan-400">
                        ₹{order.totalAmount.toLocaleString()}
                      </p>

                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            navigate(`/user/order/${order._id}`)
                          }
                          className="px-6 py-2 rounded-full border border-cyan-500/30 hover:bg-cyan-500 hover:text-black transition-all text-sm font-bold"
                        >
                          View Details
                        </button>

                        {order.orderStatus === "Placed" && (
                          <button
                            disabled={busy[order._id]}
                            onClick={() => cancelOrder(order._id)}
                            className="px-6 py-2 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-black transition-all text-sm font-bold disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/* ================= STATUS BADGE ================= */

const StatusBadge = ({ status }) => {
  const map = {
    Placed: {
      text: "Placed",
      icon: <FaBox />,
      className: "bg-yellow-500/10 text-yellow-400 border-yellow-400/30",
    },
    Shipped: {
      text: "Shipped",
      icon: <FaTruck />,
      className: "bg-blue-500/10 text-blue-400 border-blue-400/30",
    },
    Delivered: {
      text: "Delivered",
      icon: <FaCheckCircle />,
      className: "bg-green-500/10 text-green-400 border-green-400/30",
    },
    Cancelled: {
      text: "Cancelled",
      icon: <FaTimesCircle />,
      className: "bg-red-500/10 text-red-400 border-red-400/30",
    },
  };

  const s = map[status] || map.Placed;

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase ${s.className}`}
    >
      {s.icon}
      {s.text}
    </div>
  );
};

export default MyOrders;
