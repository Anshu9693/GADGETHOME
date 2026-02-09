import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import NavBar from "../../components/User/NavBar.jsx";

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

  const handleDownloadInvoice = () => {
    if (!order) return;
    const win = window.open("", "_blank");
    if (!win) {
      toast.error("Popup blocked. Please allow popups to download.");
      return;
    }

    const orderId = order._id || "order";
    const title = `gadgetHome-${orderId}`;
    const date = new Date(order.createdAt).toLocaleDateString();
    const time = new Date(order.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const company = "GadgetHome";
    const itemsHtml = order.items
      .map(
        (item) => `
          <tr>
            <td>${item.name || "Item"}</td>
            <td>${item.quantity || 0}</td>
            <td>₹${item.price || 0}</td>
            <td>₹${(item.price || 0) * (item.quantity || 0)}</td>
          </tr>
        `
      )
      .join("");

    win.document.open();
    win.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #0f172a; padding: 28px; }
            .header { display: flex; align-items: center; justify-content: space-between; }
            h1 { margin: 0 0 6px; font-size: 24px; letter-spacing: 0.06em; text-transform: uppercase; }
            h2 { margin: 0; font-size: 14px; color: #475569; text-transform: uppercase; letter-spacing: 0.2em; }
            .muted { color: #64748b; font-size: 12px; }
            .section { margin-top: 18px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; font-size: 12px; text-align: left; }
            th { background: #f8fafc; }
            .total { font-size: 16px; font-weight: bold; }
            .pill { display: inline-block; padding: 6px 10px; border-radius: 999px; background: #f1f5f9; font-size: 11px; color: #334155; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2>${company}</h2>
              <h1>Invoice</h1>
              <div class="muted">Order ID: ${orderId}</div>
              <div class="muted">Date: ${date} • ${time}</div>
            </div>
            <div class="pill">Status: ${order.orderStatus || "-"}</div>
          </div>

          <div class="section">
            <strong>Shipping</strong>
            <div class="muted">${order.shippingAddress?.fullName || ""}</div>
            <div class="muted">${order.shippingAddress?.address || ""}, ${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} - ${order.shippingAddress?.pincode || ""}</div>
            <div class="muted">${order.shippingAddress?.phone || ""}</div>
          </div>

          <div class="section">
            <strong>Items</strong>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Line Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="total">Total: ₹${order.totalAmount || 0}</div>
            <div class="muted">Payment: ${order.paymentMethod || "-"}</div>
            <div class="muted">Status: ${order.paymentStatus || "-"}</div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!order) return null;

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

          {/* HEADER */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => navigate("/user/myorders")}
              className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
            >
              <FaArrowLeft /> Back
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadInvoice}
                className="rounded-full border border-slate-200 bg-slate-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-slate-800"
              >
                Download Invoice
              </button>
              <StatusBadge status={order.orderStatus} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* LEFT */}
            <div className="space-y-6 lg:col-span-2">
              {/* ORDER ID */}
              <div className="relative rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Order ID
                </p>
              <div className="mt-2 flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-slate-900 truncate">
                  #{order._id.slice(-10)}
                </h1>
                <button
                  onClick={copyId}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-500 hover:text-slate-900"
                >
                  <FaCopy size={12} />
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {new Date(order.createdAt).toLocaleDateString()} •{" "}
                {new Date(order.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <FaReceipt className="absolute -top-6 -right-4 text-slate-200 text-[90px]" />
            </div>

              {/* TRACKING */}
              <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]">
                <p className="mb-5 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  <FaShippingFast className="text-slate-400" /> Order status
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
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Items ({order.items.length})
                </p>

                {order.items.map((item, i) => (
                  <motion.div
                    key={item.product}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4"
                  >
                    <img
                      src={item.image}
                      alt=""
                      className="h-14 w-14 rounded-xl bg-slate-100 object-contain p-2"
                    />

                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">
                        {item.name}
                      </h3>
                      <div className="mt-1 flex gap-3 text-xs text-slate-500">
                        <span>₹{item.price}</span>
                        <span>Qty {item.quantity}</span>
                      </div>
                    </div>

                    <div className="text-sm font-semibold text-slate-900">
                      ₹{item.price * item.quantity}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-6">
              {/* ADDRESS */}
              <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]">
                <p className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  <FaMapMarkerAlt /> Shipping
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {order.shippingAddress?.fullName}
                </p>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  {order.shippingAddress?.address}, {order.shippingAddress?.city},{" "}
                  {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {order.shippingAddress?.phone}
                </p>
              </div>

              {/* PAYMENT */}
              <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]">
                <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Payment
                </p>

                <Row label="Method" value={order.paymentMethod} />
                <Row
                  label="Status"
                  value={order.paymentStatus}
                  valueClass={
                    order.paymentStatus === "Paid"
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }
                />

                <div className="my-4 h-px bg-slate-100" />

                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Total</span>
                  <span className="text-xl font-semibold text-slate-900">
                    ₹{order.totalAmount}
                  </span>
                </div>

                {order.orderStatus === "Placed" && (
                  <button
                    disabled={cancelling}
                    onClick={cancelOrder}
                    className="mt-5 w-full rounded-2xl border border-rose-200 bg-rose-50 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-rose-600 transition hover:border-rose-300 hover:bg-rose-100"
                  >
                    {cancelling ? "Cancelling..." : "Cancel order"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

/* ================= HELPERS ================= */

const OrderStep = ({ active, label }) => (
  <div className="flex flex-col items-center">
    <div
      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs ${
        active
          ? "bg-slate-900 text-white"
          : "bg-white border border-slate-200 text-slate-400"
      }`}
    >
      {active ? <FaCheckCircle size={10} /> : <FaBox size={10} />}
    </div>
    <span className="mt-1 text-[9px] uppercase tracking-[0.2em] text-slate-500">
      {label}
    </span>
  </div>
);

const Progress = ({ active }) => (
  <div className="mx-1 h-[2px] flex-1 bg-slate-100">
    <div className={`h-full ${active ? "bg-slate-900" : ""}`} />
  </div>
);

const Row = ({ label, value, valueClass = "text-slate-700" }) => (
  <div className="mb-2 flex justify-between text-xs text-slate-500">
    <span>{label}</span>
    <span className={valueClass}>{value}</span>
  </div>
);

const StatusBadge = ({ status }) => {
  const colors = {
    Placed: "bg-amber-50 text-amber-700 border-amber-200",
    Processing: "bg-blue-50 text-blue-700 border-blue-200",
    Shipped: "bg-purple-50 text-purple-700 border-purple-200",
    Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${colors[status]}`}
    >
      {status}
    </span>
  );
};

export default OrderDetails;
