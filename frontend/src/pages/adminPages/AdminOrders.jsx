import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../../components/Admin/Navbar";
import { toast, ToastContainer } from "react-toastify";
import { FaSpinner, FaSyncAlt } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

/* ================= CONSTANTS ================= */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const orderStatusOptions = [
  "Placed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const paymentStatusOptions = ["Pending", "Paid", "Failed"];

/* ================= COMPONENT ================= */
const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  /* ================= FETCH ORDERS ================= */
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/order/admin/allorder`,
        { withCredentials: true }
      );
      setOrders(data.orders || []);
    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* ================= UPDATE ORDER ================= */
  const handleUpdate = async (orderId, orderStatus, paymentStatus) => {
    try {
      setUpdatingId(orderId);
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/order/admin/updateorder/${orderId}`,
        { orderStatus, paymentStatus },
        { withCredentials: true }
      );
      toast.success("Order updated successfully");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ================= UI ================= */
  return (
    <>
      <AdminNavbar />
      <ToastContainer theme="dark" />

      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white px-6 py-10">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-4xl font-extrabold mb-10"
        >
          All Orders
        </motion.h1>

        {loading ? (
          <div className="flex justify-center items-center text-lg gap-2">
            <FaSpinner className="animate-spin" />
            Loading Orders...
          </div>
        ) : orders.length === 0 ? (
          <p className="text-gray-300 text-center">No orders found.</p>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <motion.div
                key={order._id}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-5"
              >
                {/* USER INFO */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-white/20 pb-3">
                  <div>
                    <p>
                      <span className="font-semibold">User:</span>{" "}
                      {order.user?.fullName} ({order.user?.email})
                    </p>
                    <p>
                      <span className="font-semibold">Order ID:</span>{" "}
                      {order._id}
                    </p>
                    <p>
                      <span className="font-semibold">Placed:</span>{" "}
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="mt-2 md:mt-0 text-lg font-semibold">
                    ₹{order.totalAmount.toFixed(2)}
                  </div>
                </div>

                {/* ORDER ITEMS */}
                <div className="grid md:grid-cols-3 gap-4">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 items-center bg-white/5 p-3 rounded-xl"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg border border-white/20"
                      />
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm">Qty: {item.quantity}</p>
                        <p className="text-sm">
                          ₹{item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* SHIPPING INFO (FIXED 💥) */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="font-semibold mb-1">Shipping Address</p>

                  {order.shippingAddress ? (
                    <>
                      <p>{order.shippingAddress.fullName}</p>
                      <p>{order.shippingAddress.phone}</p>
                      <p>
                        {order.shippingAddress.address},{" "}
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state} -{" "}
                        {order.shippingAddress.pincode}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      Shipping address not available
                    </p>
                  )}
                </div>

                {/* STATUS CONTROLS */}
                <div className="flex flex-col md:flex-row md:justify-between gap-3">
                  <div className="flex gap-3 flex-wrap">
                    <select
                      value={order.orderStatus}
                      disabled={updatingId === order._id}
                      onChange={(e) =>
                        handleUpdate(
                          order._id,
                          e.target.value,
                          order.paymentStatus
                        )
                      }
                      className="admin-input"
                    >
                      {orderStatusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <select
                      value={order.paymentStatus}
                      disabled={updatingId === order._id}
                      onChange={(e) =>
                        handleUpdate(
                          order._id,
                          order.orderStatus,
                          e.target.value
                        )
                      }
                      className="admin-input"
                    >
                      {paymentStatusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={fetchOrders}
                    className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-2 rounded-xl font-semibold"
                  >
                    <FaSyncAlt />
                    Refresh
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* INPUT STYLES */}
      <style>{`
        .admin-input {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          padding: 10px 12px;
          border-radius: 12px;
          outline: none;
          min-width: 150px;
          color: black;
        }
        .admin-input:focus {
          border-color: #22d3ee;
          background: rgba(255,255,255,0.12);
        }
      `}</style>
    </>
  );
};

export default AdminOrders;
