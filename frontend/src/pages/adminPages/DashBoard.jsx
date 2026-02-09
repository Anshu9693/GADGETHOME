import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import AdminNavbar from "../../components/Admin/Navbar";
import {
  FaUsers,
  FaBox,
  FaShoppingCart,
  FaRupeeSign,
  FaExclamationTriangle,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/* ================= ANIMATION ================= */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

/* ================= STATUS COLORS ================= */
const getStatusStyle = (status) => {
  switch (status) {
    case "Delivered":
      return "bg-emerald-50 text-emerald-600 border border-emerald-200";
    case "Processing":
      return "bg-amber-50 text-amber-600 border border-amber-200";
    case "Shipped":
      return "bg-blue-50 text-blue-600 border border-blue-200";
    case "Cancelled":
      return "bg-rose-50 text-rose-600 border border-rose-200";
    default:
      return "bg-slate-50 text-slate-600 border border-slate-200";
  }
};

/* ================= WEEKLY SALES CALCULATOR WITH DATES ================= */
const getWeeklySalesData = (orders, startDate = null, endDate = null) => {
  const filteredOrders = orders.filter((o) => {
    if (!startDate || !endDate) return true;
    const d = new Date(o.createdAt);
    return d >= new Date(startDate.setHours(0, 0, 0, 0)) &&
           d <= new Date(endDate.setHours(23, 59, 59, 999));
  });

  const today = startDate ? new Date(startDate) : new Date();
  const sunday = new Date(today);
  sunday.setDate(sunday.getDate() - sunday.getDay());

  const weeklySales = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(sunday);
    dayDate.setDate(sunday.getDate() + i);

    const dayOrders = filteredOrders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.toDateString() === dayDate.toDateString() &&
             o.orderStatus !== "Cancelled";
    });

    const sales = dayOrders.reduce((acc, o) => acc + Number(o.totalAmount), 0);
    weeklySales.push({
      date: dayDate.toLocaleDateString("en-GB"),
      sales,
    });
  }
  return weeklySales;
};

const AdminDashboard = () => {
  /* ================= STATE ================= */
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  const [showCalendar, setShowCalendar] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [filteredRevenue, setFilteredRevenue] = useState(0);
  const [filteredOrdersCount, setFilteredOrdersCount] = useState(0);

  /* ================= FETCH INITIAL DATA ================= */
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, productsRes, usersRes, revenueRes] =
          await Promise.all([
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/order/admin/allorder`, { withCredentials: true }),
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/admin/allproducts`, { withCredentials: true }),
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/stats/total-users`, { withCredentials: true }),
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/stats/total-revenue`, { withCredentials: true }),
          ]);

        const orders = ordersRes.data.orders || [];
        const products = productsRes.data.products || [];

        setAllOrders(orders);
        setAllProducts(products);
        setTotalProducts(products.length);
        setLowStock(products.filter((p) => Number(p.stock) <= 10));
        setTotalUsers(usersRes.data.totalUsers);
        setTotalRevenue(revenueRes.data.totalRevenue);

        const validOrders = orders.filter((o) => o.orderStatus !== "Cancelled");
        setTotalOrders(validOrders.length);

        const sortedOrders = [...validOrders].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setRecentOrders(sortedOrders.slice(0, 5));
        setSalesData(getWeeklySalesData(validOrders));
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      }
    };
    fetchDashboardData();
  }, []);

  const analyzeOrders = () => {
    if (!startDate || !endDate) return;
    const filtered = allOrders.filter((order) => {
      const d = new Date(order.createdAt);
      return (
        d >= new Date(startDate.setHours(0, 0, 0, 0)) &&
        d <= new Date(endDate.setHours(23, 59, 59, 999)) &&
        order.orderStatus !== "Cancelled"
      );
    });
    const revenue = filtered.reduce((acc, order) => acc + Number(order.totalAmount), 0);
    setFilteredOrdersCount(filtered.length);
    setFilteredRevenue(revenue);
    setSalesData(getWeeklySalesData(filtered, startDate, endDate));
    setRecentOrders(filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5));
  };

  const stats = [
    { title: "Total Users", value: totalUsers, icon: <FaUsers /> },
    { title: "Total Orders", value: totalOrders, icon: <FaShoppingCart /> },
    { title: "Total Profit", value: `₹${totalRevenue}`, icon: <FaRupeeSign /> },
    { title: "Total Products", value: totalProducts, icon: <FaBox /> },
  ];

  return (
    <>
      <AdminNavbar />

      {/* ================= SIDEBAR ================= */}
      <div className={`fixed top-0 left-0 h-full w-96 bg-gradient-to-b from-white to-white backdrop-blur-xl p-6 transition-transform z-50 shadow-2xl border-l-2 border-cyan-400/50 rounded-r-3xl ${showCalendar ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-3"><FaCalendarAlt /> Analyze Your Sell</h2>
          <button onClick={() => setShowCalendar(false)} className="text-slate-900 text-2xl font-bold hover:text-red-500 transition">✕</button>
        </div>
        <div className="flex flex-col gap-4 mb-6">
          <div className="bg-white backdrop-blur-md p-4 rounded-xl flex justify-between items-center shadow-lg border border-cyan-500/30">
            <p className="text-sm text-slate-600">Total Orders</p>
            <h3 className="text-xl font-bold text-cyan-400">{filteredOrdersCount || totalOrders}</h3>
          </div>
          <div className="bg-white backdrop-blur-md p-4 rounded-xl flex justify-between items-center shadow-lg border border-green-500/30">
            <p className="text-sm text-slate-600">Total Revenue</p>
            <h3 className="text-xl font-bold text-green-400">₹{filteredRevenue}</h3>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-slate-500 text-sm mb-1">Start Date:</p>
            <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} dateFormat="dd/MM/yyyy" className="w-full px-3 py-2 rounded-lg bg-white text-slate-900 border border-slate-200" />
          </div>
          <div>
            <p className="text-slate-500 text-sm mb-1">End Date:</p>
            <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} dateFormat="dd/MM/yyyy" className="w-full px-3 py-2 rounded-lg bg-white text-slate-900 border border-slate-200" />
          </div>
          <button onClick={analyzeOrders} className="mt-2 w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-900 font-semibold shadow-lg hover:scale-105 transition-transform duration-300">Analyze</button>
        </div>
      </div>

      {/* ================= MAIN DASHBOARD ================= */}
      <div className="min-h-screen bg-[#f7f7f5] text-slate-900 px-6 py-10">
        
        {/* ✅ FIXED TO BOTTOM RIGHT */}
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-10 right-10 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-900 px-6 py-4 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:scale-110 hover:shadow-cyan-400/60 transition-all z-40 flex items-center gap-2 font-bold border border-slate-200"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <FaCalendarAlt /> Analyze Your Sell
        </motion.button>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((item, i) => (
            <motion.div key={item.title} custom={i} initial="hidden" animate="visible" variants={fadeUp} className="bg-white backdrop-blur-xl border border-slate-200 rounded-2xl p-6 flex items-center gap-4">
              <div className="text-3xl text-cyan-400">{item.icon}</div>
              <div>
                <p className="text-slate-500 text-sm">{item.title}</p>
                <h3 className="text-2xl font-bold">{item.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl p-6 mb-12 shadow-lg">
          <h2 className="text-xl font-semibold mb-6">Weekly Sales</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <XAxis dataKey="date" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#0f172a" }} />
              <Line type="monotone" dataKey="sales" stroke="#22d3ee" strokeWidth={3} dot={{ fill: "#22d3ee", r: 5, stroke: "#0f172a", strokeWidth: 2 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="lg:col-span-2 bg-white backdrop-blur-xl border border-slate-200 rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-2">Order ID</th>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="border-b border-slate-200">
                      <td className="py-3">#{order._id.slice(-12)}</td>
                      <td className="text-center">{order.user?.fullName || "User"}</td>
                      <td className="text-center">₹{order.totalAmount}</td>
                      <td className="text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.orderStatus)}`}>{order.orderStatus}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><FaExclamationTriangle className="text-red-400" /> Low Stock Alerts</h2>
            {lowStock.length === 0 ? (
              <p className="text-slate-500 text-sm">All products are sufficiently stocked 🎉</p>
            ) : (
              <ul className="space-y-3">
                {lowStock.map((item) => (
                  <li key={item._id} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="text-red-400">{item.stock} left</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
