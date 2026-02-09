import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "../../components/User/NavBar.jsx";
import {
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaFilter,
  FaTimes,
  FaUndo,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

/* ================= API INSTANCE ================= */
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  timeout: 8000,
});

/* ================= MAIN COMPONENT ================= */
const MyOrders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  /* FILTER STATES */
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  /* ================= FETCH ORDERS ================= */
  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/order/user");
      setOrders(res.data.orders || []);
    } catch {
      toast.error("Login required to view orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* ================= FILTER + SORT ================= */
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((order) =>
        order.items.some((item) => item.name.toLowerCase().includes(q))
      );
    }

    if (startDate) {
      result = result.filter(
        (order) => new Date(order.createdAt) >= new Date(startDate)
      );
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((order) => new Date(order.createdAt) <= end);
    }

    result.sort((a, b) =>
      sortBy === "newest"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

    return result;
  }, [orders, searchTerm, sortBy, startDate, endDate]);

  /* ================= RESET FILTERS ================= */
  const resetFilters = () => {
    setSearchTerm("");
    setSortBy("newest");
    setStartDate("");
    setEndDate("");
    toast.success("Filters reset");
  };

  /* ================= CANCEL ORDER ================= */
  const cancelOrder = async (orderId) => {
    if (busy[orderId]) return;
    const confirmText = window.prompt(
      "Type CANCEL to confirm order cancellation:"
    );
    if (confirmText !== "CANCEL") {
      toast.error("Cancellation not confirmed");
      return;
    }

    setBusy((p) => ({ ...p, [orderId]: true }));
    try {
      await api.put(`/api/order/user/cancel/${orderId}`);
      toast.success("Order cancelled");
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, orderStatus: "Cancelled" } : o
        )
      );
      fetchOrders();
    } catch (err) {
      const msg = err?.response?.data?.message || "Cancellation failed";
      toast.error(msg);
    } finally {
      setBusy((p) => ({ ...p, [orderId]: false }));
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
      </div>
    );
  }

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

          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="w-full max-w-xs text-left">
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Orders</p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-900">My Orders</h1>
              <p className="mt-1 text-[12px] text-slate-500">
                {filteredOrders.length} orders
              </p>
            </div>
            <button
              onClick={() => setShowFilters(true)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
            >
              <FaFilter />
              Filters
            </button>
          </div>

          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order) => (
              <motion.div
                key={order._id}
                layout="position"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-6 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]"
              >
                {/* HEADER */}
                <div className="flex flex-col gap-6 border-b border-slate-100 pb-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap gap-6 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    <Info label="Order ID" value={order._id.slice(-10)} />
                    <Info
                      label="Date"
                      value={new Date(order.createdAt).toLocaleDateString()}
                    />
                    <Info
                      label="Time"
                      value={new Date(order.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    />
                    <StatusBadge status={order.orderStatus} />
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                      Amount
                    </p>
                    <p className="text-2xl font-semibold text-slate-900">
                      ₹{order.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* ITEMS */}
                <div className="mt-6 space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.product}
                      className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-14 w-14 rounded-xl bg-slate-100 object-contain p-2"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-slate-900">
                          {item.name}
                        </h4>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                          Qty {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* ACTIONS */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <ActionButton
                    text="Details"
                    onClick={() => navigate(`/user/order/${order._id}`)}
                  />

                  {["Placed", "Processing"].includes(order.orderStatus) && (
                    <button
                      onClick={() => cancelOrder(order._id)}
                      disabled={busy[order._id]}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-600 transition hover:border-rose-300 hover:bg-rose-100 disabled:opacity-60"
                    >
                      {busy[order._id] ? "Cancelling..." : "Cancel"}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredOrders.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white/90 py-32 text-center text-slate-500">
              <FaBox size={36} className="mx-auto mb-4" />
              <p className="text-[11px] uppercase tracking-[0.25em]">No orders found</p>
            </div>
          )}
        </main>

        <FilterDrawer
          open={showFilters}
          onClose={() => setShowFilters(false)}
          {...{
            searchTerm,
            setSearchTerm,
            startDate,
            setStartDate,
            endDate,
            setEndDate,
            sortBy,
            setSortBy,
            resetFilters,
          }}
        />
      </div>
    </>
  );
};

/* ================= SMALL COMPONENTS ================= */

const Info = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
    <p className="text-sm font-semibold text-slate-900">{value}</p>
  </div>
);

const ActionButton = ({ text, onClick }) => (
  <button
    onClick={onClick}
    className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-300"
  >
    {text}
  </button>
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

/* ================= FILTER DRAWER ================= */

const FilterDrawer = ({
  open,
  onClose,
  searchTerm,
  setSearchTerm,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  sortBy,
  setSortBy,
  resetFilters,
}) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-900/50"
        />
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 z-[60] flex h-full w-full max-w-[360px] flex-col border-l border-slate-200 bg-white p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
            <button onClick={onClose} className="text-slate-500">
              <FaTimes />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Search
              </label>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  From
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  To
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Sort
              </label>
              <select
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>

          <button
            onClick={resetFilters}
            className="mt-auto rounded-2xl border border-rose-200 bg-rose-50 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-rose-600 transition hover:border-rose-300 hover:bg-rose-100"
          >
            <FaUndo className="inline mr-2" />
            Reset
          </button>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default MyOrders;
