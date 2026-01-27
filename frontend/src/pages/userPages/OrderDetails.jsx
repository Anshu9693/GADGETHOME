import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import NavBar from "../../components/User/NavBar.jsx";
import {
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

/* ================= AXIOS ================= */
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  timeout: 8000,
});

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  /* ================= FETCH ORDER DETAILS ================= */
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await api.get(`/api/order/user/${orderId}`);
        setOrder(res.data.order);
      } catch (err) {
        toast.error("Failed to load order details");
        navigate("/user/myorders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, navigate]);

  /* ================= CANCEL ORDER ================= */
  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    setCancelling(true);
    try {
      const res = await api.put(`/api/order/user/cancel/${orderId}`);
      setOrder(res.data.order);
      toast.success(res.data.message || "Order cancelled successfully");
      // notify navbar / cart listeners in case cart was restored
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.error("Cancel Error Details:", err.response || err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to cancel order";
      toast.error(errorMsg);
    } finally {
      setCancelling(false);
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

  if (!order) {
    return (
      <div className="min-h-screen bg-[#050505] text-white pt-32">
        <NavBar />
        <div className="text-center text-gray-400">Order not found</div>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-[#050505] text-white pt-32 px-6 md:px-12 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* BACK BUTTON */}
          <button
            onClick={() => navigate("/user/myorders")}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 transition-colors"
          >
            <FaArrowLeft size={16} />
            Back to Orders
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8"
          >
            {/* HEADER */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs font-mono text-gray-500 mb-2">
                    ORDER ID
                  </p>
                  <p className="text-xl font-bold text-cyan-400 break-all">
                    {order._id.slice(0, 6)}
                  </p>
                </div>
                <StatusBadge status={order.orderStatus} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="text-xs font-mono text-gray-500 mb-2">
                    ORDER DATE
                  </p>
                  <p className="font-bold">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="text-xs font-mono text-gray-500 mb-2">
                    PAYMENT METHOD
                  </p>
                  <p className="font-bold">{order.paymentMethod}</p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="text-xs font-mono text-gray-500 mb-2">
                    PAYMENT STATUS
                  </p>
                  <p
                    className={`font-bold ${
                      order.paymentStatus === "Paid"
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {order.paymentStatus}
                  </p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="text-xs font-mono text-gray-500 mb-2">
                    TOTAL AMOUNT
                  </p>
                  <p className="text-xl font-bold text-cyan-400">
                    ₹{order.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* ITEMS SECTION */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <motion.div
                    key={item.product}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-4 bg-black/30 rounded-xl p-4 border border-white/5"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-contain rounded-lg bg-black"
                    />

                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <p className="text-gray-400 text-sm mb-2">
                        Price: ₹{item.price.toLocaleString()}
                      </p>
                      <p className="text-cyan-400 font-bold">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-lg font-bold text-cyan-400 mt-2">
                        Subtotal: ₹
                        {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* SHIPPING ADDRESS */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
              <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                <p className="font-bold text-lg mb-2">
                  {order.shippingAddress?.fullName}
                </p>
                <p className="text-gray-300 mb-1">
                  {order.shippingAddress?.address}
                </p>
                <p className="text-gray-300 mb-1">
                  {order.shippingAddress?.city},{" "}
                  {order.shippingAddress?.state} –{" "}
                  {order.shippingAddress?.pincode}
                </p>
                <p className="text-gray-300">
                  Phone: {order.shippingAddress?.phone}
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/user/myorders")}
                className="flex-1 px-6 py-3 rounded-full border border-cyan-500/30 hover:bg-cyan-500 hover:text-black transition-all text-sm font-bold"
              >
                Back to Orders
              </button>

              {order.orderStatus === "Placed" && (
                <button
                  disabled={cancelling}
                  onClick={handleCancelOrder}
                  className="flex-1 px-6 py-3 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-black transition-all text-sm font-bold disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Cancel Order"}
                </button>
              )}
            </div>
          </motion.div>
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
    Processing: {
      text: "Processing",
      icon: <FaBox />,
      className: "bg-blue-500/10 text-blue-400 border-blue-400/30",
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

export default OrderDetails;
