import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../../components/Admin/Navbar";
import { toast, ToastContainer } from "react-toastify";
import { 
  FaSpinner, 
  FaSyncAlt, 
  FaFilter, 
  FaTimes, 
  FaMapMarkerAlt, 
  FaClock, 
  FaBolt,
  FaSearch,
  FaPhoneAlt,
  FaUser,
  FaBox
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";

/* ================= ANIMATION ================= */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ================= STATUS OPTIONS ================= */
const orderStatusOptions = ["Recent", "All", "Placed", "Processing", "Shipped", "Delivered", "Cancelled"];

const statusColors = {
  Placed: "border-yellow-500/50 text-yellow-500 bg-yellow-500/10",
  Processing: "border-cyan-500/50 text-cyan-400 bg-cyan-500/10",
  Shipped: "border-purple-500/50 text-purple-400 bg-purple-500/10",
  Delivered: "border-green-500/50 text-green-400 bg-green-500/10",
  Cancelled: "border-red-500/50 text-red-400 bg-red-500/10",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  /* FILTER STATES */
  const [activeTab, setActiveTab] = useState("Recent");
  const [showFilter, setShowFilter] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [fromTime, setFromTime] = useState("00:00");
  const [toTime, setToTime] = useState("23:59");
  const [searchQuery, setSearchQuery] = useState("");

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

  /* ================= FILTERING LOGIC ================= */
  useEffect(() => {
    let temp = [...orders];
    
    // Tab Filtering
    if (activeTab === "Recent") {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      temp = temp.filter((o) => new Date(o.createdAt) >= oneDayAgo);
      if (temp.length === 0) {
        temp = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
      }
    } else if (activeTab !== "All") {
      temp = temp.filter((o) => o.orderStatus === activeTab);
    }

    // Search Filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      temp = temp.filter(o => 
        o._id.toLowerCase().includes(q) || 
        o.user?.fullName?.toLowerCase().includes(q) ||
        o.shippingAddress?.phone?.includes(q) ||
        o.shippingAddress?.address?.toLowerCase().includes(q)
      );
    }

    // Date Filtering
    if (startDate && endDate) {
      temp = temp.filter((o) => {
        const d = new Date(o.createdAt);
        const start = new Date(startDate);
        const end = new Date(endDate);
        const [fh, fm] = fromTime.split(":");
        const [th, tm] = toTime.split(":");
        start.setHours(fh, fm, 0);
        end.setHours(th, tm, 59);
        return d >= start && d <= end;
      });
    }

    setFilteredOrders(temp.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }, [orders, activeTab, searchQuery, startDate, endDate, fromTime, toTime]);

  const resetFilters = () => {
    setStartDate(null); setEndDate(null);
    setFromTime("00:00"); setToTime("23:59");
    setSearchQuery(""); setActiveTab("Recent");
    setShowFilter(false);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans">
      <AdminNavbar />
      <ToastContainer theme="dark" position="bottom-right" />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Order Management</h1>
            <p className="text-gray-400 text-sm">Monitor and process customer orders in real-time.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative flex-grow md:w-80">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by ID, Name or Phone..."
                  className="w-full bg-[#1c2128] border border-gray-700 rounded-full py-2.5 pl-11 pr-4 text-sm focus:border-cyan-500 outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             <button
                onClick={() => setShowFilter(true)}
                className="p-3 bg-[#1c2128] border border-gray-700 rounded-xl hover:bg-[#2d333b] transition-all group"
                title="Advanced Filters"
              >
                <FaFilter className="text-cyan-500 group-hover:scale-110 transition-transform" />
              </button>
              <button onClick={fetchOrders} className="p-3 bg-[#1c2128] border border-gray-700 rounded-xl hover:bg-[#2d333b] transition-all">
                <FaSyncAlt className={`${loading ? "animate-spin" : ""} text-gray-400`} />
              </button>
          </div>
        </div>

        {/* STATUS TABS */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide">
          {orderStatusOptions.map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all duration-300 border ${
                activeTab === status 
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]" 
                : "bg-[#1c2128] text-gray-500 border-gray-800 hover:border-gray-600"
              }`}
            >
              {status === "Recent" && <FaBolt className="inline mr-2 text-xs" />}
              {status}
            </button>
          ))}
        </div>

        {/* ORDERS CONTENT */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <FaSpinner className="animate-spin text-4xl text-cyan-500 mb-4" />
            <p className="text-gray-500 text-sm tracking-widest uppercase font-bold">Fetching Live Data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-24 bg-[#1c2128]/40 rounded-3xl border border-dashed border-gray-700">
                <FaBox className="mx-auto text-4xl text-gray-700 mb-4" />
                <p className="text-gray-500 uppercase tracking-widest text-sm font-bold">No orders found matching your criteria</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <motion.div
                  key={order._id}
                  variants={fadeUp} initial="hidden" animate="visible"
                  className="bg-[#1c2128]/40 border border-gray-800 rounded-[2rem] p-6 md:p-8 hover:bg-[#1c2128]/60 transition-all duration-300 relative overflow-hidden group shadow-xl"
                >
                  {/* Subtle Gradient Glow */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/5 blur-[100px] rounded-full group-hover:bg-cyan-500/10 transition-colors" />

                  <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
                    <div className="flex items-center gap-4">
                          {/* <div className="w-14 h-14 rounded-2xl bg-[#0d1117] flex items-center justify-center border border-gray-800 text-cyan-400 font-black text-lg shadow-inner">
                              #{order._id.slice(-2)}
                          </div> */}
                        <div>
                            <h3 className="font-mono text-lg font-bold text-white tracking-tighter">ORDER_ID: {order._id.slice(-12).toUpperCase()}</h3>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                <span className="flex items-center gap-1.5"><FaClock className="text-cyan-500/70" /> {new Date(order.createdAt).toLocaleDateString()}</span>
                                <span className="w-1 h-1 bg-gray-700 rounded-full" />
                                <span>{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border tracking-widest mb-3 ${statusColors[order.orderStatus] || "border-gray-700"}`}>
                            {order.orderStatus}
                        </span>
                        <div className="text-3xl font-black text-white tracking-tighter">₹{order.totalAmount.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* CUSTOMER INFO */}
                    <div className="bg-[#0d1117]/60 p-5 rounded-2xl border border-gray-800/50 hover:border-gray-700 transition-colors">
                      <p className="text-[10px] uppercase font-black text-gray-600 mb-4 tracking-widest flex items-center gap-2">
                        <FaUser className="text-cyan-500" /> Customer Details
                      </p>
                      <h4 className="font-bold text-gray-200 text-base">{order.user?.fullName || "Guest User"}</h4>
                      <p className="text-sm text-gray-500 mt-1 truncate">{order.user?.email || "No email provided"}</p>
                      <div className="mt-4 flex items-center gap-2 text-cyan-400 bg-cyan-500/5 w-fit px-3 py-1.5 rounded-lg border border-cyan-500/10">
                        <FaPhoneAlt size={10} />
                        <span className="text-xs font-black">{order.shippingAddress?.phone || "N/A"}</span>
                      </div>
                    </div>

                    {/* ORDERED ITEMS */}
                    <div className="bg-[#0d1117]/60 p-5 rounded-2xl border border-gray-800/50">
                      <p className="text-[10px] uppercase font-black text-gray-600 mb-4 tracking-widest flex items-center gap-2">
                         <FaBox size={10} className="text-cyan-500" /> Items Summary ({order.items?.length})
                      </p>
                      <div className="space-y-3 max-h-[140px] overflow-y-auto custom-scrollbar pr-2">
                        {order.items?.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 bg-[#1c2128]/50 p-2 rounded-xl border border-gray-800/30">
                            <img src={item.image} alt="" className="w-10 h-10 object-cover rounded-lg bg-black" />
                            <div className="min-w-0 flex-grow">
                                <p className="text-xs font-bold text-gray-300 truncate">{item.name}</p>
                                <p className="text-[10px] text-gray-500 font-bold">{item.quantity} Unit{item.quantity > 1 ? 's' : ''} • <span className="text-cyan-500/80">₹{item.price}</span></p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SHIPPING ADDRESS */}
                    <div className="bg-[#0d1117]/60 p-5 rounded-2xl border border-gray-800/50">
                      <p className="text-[10px] uppercase font-black text-gray-600 mb-4 tracking-widest flex items-center gap-2">
                        <FaMapMarkerAlt className="text-cyan-500" /> Shipping Destination
                      </p>
                      <div className="text-xs text-gray-400 leading-relaxed">
                        <p className="font-bold text-gray-300 mb-1">Address:</p>
                        <p className="line-clamp-2 mb-2 italic">"{order.shippingAddress?.address}"</p>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                            <div className="bg-[#1c2128] p-2 rounded-lg border border-gray-800">
                                <p className="text-[9px] text-gray-600 uppercase font-bold">City/State</p>
                                <p className="text-[11px] text-white font-bold truncate">{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                            </div>
                            <div className="bg-[#1c2128] p-2 rounded-lg border border-gray-800">
                                <p className="text-[9px] text-gray-600 uppercase font-bold">Pincode</p>
                                <p className="text-[11px] text-cyan-500 font-black">{order.shippingAddress?.pincode}</p>
                            </div>
                        </div>
                        {/* Essential Phone Number Display In Address Block */}
                        <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
                             <span className="text-[10px] font-bold text-gray-500 uppercase">Contact:</span>
                             <span className="text-xs text-white font-black">{order.shippingAddress?.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ACTION CONTROLS */}
                  <div className="mt-8 pt-6 border-t border-gray-800/50 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex flex-wrap gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black text-gray-600 uppercase tracking-tighter ml-1">Order Status</label>
                            <select
                              value={order.orderStatus}
                              disabled={updatingId === order._id}
                              onChange={(e) => handleUpdate(order._id, e.target.value, order.paymentStatus)}
                              className="bg-[#0d1117] border border-gray-700 text-white text-xs font-black rounded-xl px-4 py-2.5 outline-none focus:border-cyan-500 transition cursor-pointer hover:bg-[#161b22]"
                            >
                              {orderStatusOptions.filter(o => o !== "All" && o !== "Recent").map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black text-gray-600 uppercase tracking-tighter ml-1">Payment</label>
                            <select
                              value={order.paymentStatus}
                              disabled={updatingId === order._id}
                              onChange={(e) => handleUpdate(order._id, order.orderStatus, e.target.value)}
                              className="bg-[#0d1117] border border-gray-700 text-white text-xs font-black rounded-xl px-4 py-2.5 outline-none focus:border-cyan-500 transition hover:bg-[#161b22]"
                            >
                              {["Pending", "Paid", "Failed"].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                        </div>
                    </div>

                    {updatingId === order._id ? (
                      <div className="flex items-center gap-2 text-cyan-400 font-black text-[10px] animate-pulse bg-cyan-500/5 px-4 py-2 rounded-full border border-cyan-500/20">
                        <FaSpinner className="animate-spin" /> WRITING TO DATABASE...
                      </div>
                    ) : (
                        <div className="text-[10px] text-gray-600 font-bold italic">
                            Last Modified: {new Date().toLocaleDateString()}
                        </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* FILTER MODAL */}
      <AnimatePresence>
        {showFilter && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilter(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{type: 'spring', damping: 25}} className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#0d1117] border-l border-gray-800 p-8 z-[60] shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tighter">FILTERS</h2>
                    <p className="text-gray-500 text-xs">Refine order results</p>
                </div>
                <button onClick={() => setShowFilter(false)} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                  <FaTimes size={18} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] block mb-4">Select Date Range</label>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] text-gray-600 ml-1">From:</span>
                        <DatePicker selected={startDate} onChange={setStartDate} className="admin-input-dark w-full" placeholderText="DD/MM/YYYY" dateFormat="dd/MM/yyyy" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] text-gray-600 ml-1">To:</span>
                        <DatePicker selected={endDate} onChange={setEndDate} className="admin-input-dark w-full" placeholderText="DD/MM/YYYY" dateFormat="dd/MM/yyyy" />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-800 grid grid-cols-2 gap-4">
                  <button onClick={() => setShowFilter(false)} className="bg-cyan-500 hover:bg-cyan-400 text-black py-3.5 rounded-xl font-black text-xs transition-all uppercase tracking-widest">Apply</button>
                  <button onClick={resetFilters} className="bg-[#1c2128] text-gray-400 py-3.5 rounded-xl font-black text-xs border border-gray-800 hover:text-white transition-all uppercase tracking-widest">Reset</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .admin-input-dark {
          background: #1c2128;
          border: 1px solid #30363d;
          padding: 12px 16px;
          border-radius: 12px;
          color: white;
          font-size: 13px;
          outline: none;
          width: 100%;
        }
        .admin-input-dark:focus { border-color: #22d3ee; box-shadow: 0 0 10px rgba(34,211,238,0.1); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #30363d; border-radius: 10px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        select option { background: #0d1117; color: white; }
      `}</style>
    </div>
  );
};

export default AdminOrders;