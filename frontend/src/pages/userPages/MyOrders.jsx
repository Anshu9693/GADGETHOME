import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "../../components/User/NavBar.jsx";
import Footer from "../../components/User/Footer.jsx";
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
      result = result.filter((order) =>
        order.items.some((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
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
      result = result.filter(
        (order) => new Date(order.createdAt) <= end
      );
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
    toast.success("Filters Reset");
  };

  /* ================= CANCEL ORDER ================= */
  const cancelOrder = async (orderId) => {
    if (busy[orderId]) return;
    if (!window.confirm("Confirm cancel order?")) return;

    setBusy((p) => ({ ...p, [orderId]: true }));
    try {
      await api.put(`/api/order/user/cancel/${orderId}`);
      toast.success("Order Cancelled");
      fetchOrders();
    } catch {
      toast.error("Cancellation failed");
    } finally {
      setBusy((p) => ({ ...p, [orderId]: false }));
    }
  };

  /* ================= LOADING ================= */
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

      <div className="min-h-screen bg-[#050505] text-white pt-32 px-6 md:px-12 pb-24">
        <div className="max-w-7xl mx-auto space-y-10">

          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order) => (
              <motion.div
                key={order._id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0b0b0b] border border-white/5 rounded-[2.5rem] 
                p-6 md:p-10 hover:border-cyan-500 transition-all duration-500"
              >
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between gap-8 mb-8 pb-6 border-b border-white/5">
                  <div className="flex flex-wrap gap-8 text-[11px] font-mono uppercase tracking-widest text-gray-500">
                    <Info label="REF_ID" value={order._id.slice(-10)} />
                    <Info
                      label="DATE"
                      value={new Date(order.createdAt).toLocaleDateString()}
                    />
                    <StatusBadge status={order.orderStatus} />
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] tracking-widest font-mono uppercase text-gray-500">
                      Amount
                    </p>
                    <p className="text-3xl font-black italic tracking-tight text-cyan-400">
                      ₹{order.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* ITEMS */}
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.product}
                      className="flex items-center gap-6 bg-white/5 rounded-2xl 
                      p-4 border border-transparent hover:border-white/10"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 object-contain bg-black rounded-lg p-1"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold uppercase tracking-wide">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-gray-400 font-mono tracking-wide">
                          QTY: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ACTIONS */}
                <div className="mt-8 flex gap-3">
                  <ActionButton
                    text="Details"
                    onClick={() => navigate(`/user/order/${order._id}`)}
                  />

                  {order.orderStatus === "Placed" && (
                    <button
                      onClick={() => cancelOrder(order._id)}
                      className="px-6 py-3 rounded-xl bg-red-500/10 
                      text-red-500 border border-red-500/20 
                      text-[11px] tracking-widest font-black uppercase 
                      hover:bg-red-500 hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredOrders.length === 0 && (
            <div className="text-center py-24 opacity-40">
              <FaBox size={42} className="mx-auto mb-4" />
              <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500">
                No Orders Found
              </p>
            </div>
          )}
        </div>

        {/* FILTER BUTTON */}
        <button
          onClick={() => setShowFilters(true)}
          className="fixed bottom-10 right-10 w-16 h-16 bg-cyan-500 text-black 
          rounded-full flex items-center justify-center 
          shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-110 
          transition-all z-40 border-4 border-black"
        >
          <FaFilter size={20} />
        </button>

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

      <Footer />
    </>
  );
};

/* ================= SMALL COMPONENTS ================= */

const Info = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-[10px] tracking-widest text-gray-500">{label}</p>
    <p className="text-sm font-semibold text-white">{value}</p>
  </div>
);

const ActionButton = ({ text, onClick }) => (
  <button
    onClick={onClick}
    className="px-6 py-3 rounded-xl border border-white/10 
    hover:border-cyan-500 text-[11px] tracking-widest 
    font-black uppercase transition-all"
  >
    {text}
  </button>
);

const StatusBadge = ({ status }) => {
  const map = {
    Placed: ["Placed", <FaBox />, "yellow"],
    Shipped: ["Shipped", <FaTruck />, "blue"],
    Delivered: ["Delivered", <FaCheckCircle />, "green"],
    Cancelled: ["Cancelled", <FaTimesCircle />, "red"],
  };

  const colors = {
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const [text, icon, color] = map[status] || map.Placed;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 rounded-md border 
      text-[10px] font-black uppercase tracking-[0.25em] ${colors[color]}`}
    >
      {icon} {text}
    </div>
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
          className="fixed inset-0 bg-black/80 z-50"
        />
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 h-full w-full max-w-[350px] 
          bg-[#0b0b0b] border-l border-white/10 z-[60] p-8 flex flex-col"
        >
          <div className="flex justify-between mb-10">
            <h2 className="text-2xl font-black italic tracking-tight">
              FILTERS_
            </h2>
            <button onClick={onClose}>
              <FaTimes />
            </button>
          </div>

          <div className="space-y-6">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="PRODUCT NAME"
              className="w-full bg-black border border-white/10 rounded-xl 
              py-3 px-4 text-[11px] font-mono uppercase tracking-widest 
              focus:border-cyan-500 outline-none"
            />

            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          <button
            onClick={resetFilters}
            className="mt-auto py-4 border border-red-500/20 
            text-red-500 hover:bg-red-500 hover:text-white 
            rounded-xl uppercase text-[11px] tracking-widest font-black"
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
