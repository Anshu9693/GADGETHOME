import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import NavBar from "../../components/User/NavBar.jsx";
import Footer from "../../components/User/Footer.jsx";
import {
  FaBox,
  FaCheckCircle,
  FaArrowLeft,
  FaCopy,
  FaMapMarkerAlt,
  FaReceipt,
  FaShippingFast,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

/* ================= API ================= */
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

/* ================= PAGE ================= */
const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/api/order/user/${orderId}`);
        setOrder(res.data.order);
      } catch {
        toast.error("Unable to load order");
        navigate("/user/myorders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, navigate]);

  const cancelOrder = async () => {
    if (!window.confirm("Cancel this order?")) return;
    setCancelling(true);
    try {
      const res = await api.put(`/api/order/user/cancel/${orderId}`);
      setOrder(res.data.order);
      toast.success("Order cancelled");
    } catch {
      toast.error("Cancellation failed");
    } finally {
      setCancelling(false);
    }
  };

  const copyId = () => {
    navigator.clipboard.writeText(order._id);
    toast.success("Order ID copied");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <NavBar />

      <div className="min-h-screen bg-[#050505] text-white pt-28 pb-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* HEADER */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/user/myorders")}
              className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-cyan-400"
            >
              <FaArrowLeft /> Back
            </button>
            <StatusBadge status={order.orderStatus} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT */}
            <div className="lg:col-span-2 space-y-6">

              {/* ORDER ID */}
              <div className="relative bg-[#0b0b0b] border border-white/5 rounded-2xl p-6">
                <p className="text-[10px] font-mono text-gray-500 mb-1">
                  ORDER ID
                </p>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold truncate">
                    #{order._id.slice(-10)}
                  </h1>
                  <button
                    onClick={copyId}
                    className="p-1.5 rounded-md hover:bg-white/5 text-gray-400"
                  >
                    <FaCopy size={13} />
                  </button>
                </div>
                <FaReceipt className="absolute -top-4 -right-4 text-white/5 text-[90px]" />
              </div>

              {/* TRACKING */}
              <div className="bg-[#0b0b0b] border border-white/5 rounded-2xl p-6">
                <p className="text-[10px] font-mono text-gray-500 mb-5 flex items-center gap-2">
                  <FaShippingFast className="text-cyan-400" /> ORDER STATUS
                </p>

                <div className="flex items-center justify-between">
                  <OrderStep active label="Placed" />
                  <Progress active={["Processing", "Shipped", "Delivered"].includes(order.orderStatus)} />
                  <OrderStep active={["Processing", "Shipped", "Delivered"].includes(order.orderStatus)} label="Processing" />
                  <Progress active={["Shipped", "Delivered"].includes(order.orderStatus)} />
                  <OrderStep active={["Shipped", "Delivered"].includes(order.orderStatus)} label="Shipped" />
                  <Progress active={order.orderStatus === "Delivered"} />
                  <OrderStep active={order.orderStatus === "Delivered"} label="Delivered" />
                </div>
              </div>

              {/* ITEMS */}
              <div className="space-y-3">
                <p className="text-[10px] font-mono text-gray-500">
                  ITEMS ({order.items.length})
                </p>

                {order.items.map((item, i) => (
                  <motion.div
                    key={item.product}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 bg-white/5 rounded-xl p-4"
                  >
                    <img
                      src={item.image}
                      alt=""
                      className="w-14 h-14 object-contain bg-black rounded-lg p-1"
                    />

                    <div className="flex-1">
                      <h3 className="text-sm font-semibold line-clamp-1">
                        {item.name}
                      </h3>
                      <div className="flex gap-3 mt-1 text-xs font-mono text-gray-400">
                        <span>₹{item.price}</span>
                        <span>QTY {item.quantity}</span>
                      </div>
                    </div>

                    <div className="text-sm font-semibold text-cyan-400">
                      ₹{item.price * item.quantity}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-6">

              {/* ADDRESS */}
              <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-6">
                <p className="text-[10px] font-mono text-cyan-400 mb-3 flex items-center gap-2">
                  <FaMapMarkerAlt /> SHIPPING
                </p>
                <p className="font-semibold text-sm">
                  {order.shippingAddress?.fullName}
                </p>
                <p className="text-xs font-mono text-gray-400 mt-1 leading-relaxed">
                  {order.shippingAddress?.address}, {order.shippingAddress?.city},{" "}
                  {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                </p>
                <p className="text-xs font-mono text-gray-500 mt-2">
                  {order.shippingAddress?.phone}
                </p>
              </div>

              {/* PAYMENT */}
              <div className="bg-[#0b0b0b] border border-white/5 rounded-2xl p-6">
                <p className="text-[10px] font-mono text-gray-500 mb-4">
                  PAYMENT
                </p>

                <Row label="Method" value={order.paymentMethod} />
                <Row
                  label="Status"
                  value={order.paymentStatus}
                  valueClass={
                    order.paymentStatus === "Paid"
                      ? "text-green-400"
                      : "text-yellow-400"
                  }
                />

                <div className="h-px bg-white/5 my-4" />

                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-gray-500">TOTAL</span>
                  <span className="text-xl font-bold text-cyan-400">
                    ₹{order.totalAmount}
                  </span>
                </div>

                {order.orderStatus === "Placed" && (
                  <button
                    disabled={cancelling}
                    onClick={cancelOrder}
                    className="w-full mt-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500 hover:text-white"
                  >
                    {cancelling ? "Cancelling..." : "Cancel Order"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

/* ================= HELPERS ================= */

const OrderStep = ({ active, label }) => (
  <div className="flex flex-col items-center">
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs
      ${active ? "bg-cyan-500 text-black" : "bg-black border border-white/10 text-gray-500"}`}
    >
      {active ? <FaCheckCircle size={10} /> : <FaBox size={10} />}
    </div>
    <span className="mt-1 text-[9px] font-mono text-gray-500">
      {label}
    </span>
  </div>
);

const Progress = ({ active }) => (
  <div className="flex-1 h-[1.5px] bg-white/5 mx-1">
    <div className={`h-full ${active ? "bg-cyan-500" : ""}`} />
  </div>
);

const Row = ({ label, value, valueClass = "text-white" }) => (
  <div className="flex justify-between text-xs text-gray-400 mb-2">
    <span>{label}</span>
    <span className={valueClass}>{value}</span>
  </div>
);

const StatusBadge = ({ status }) => {
  const colors = {
    Placed: "text-yellow-400",
    Processing: "text-blue-400",
    Shipped: "text-purple-400",
    Delivered: "text-green-400",
    Cancelled: "text-red-400",
  };
  return (
    <span className={`text-xs font-semibold ${colors[status]}`}>
      {status}
    </span>
  );
};

export default OrderDetails;
