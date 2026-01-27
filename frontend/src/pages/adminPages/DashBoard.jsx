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
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ================= ANIMATION ================= */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

/* ================= STATUS COLORS ================= */
const getStatusStyle = (status) => {
  switch (status) {
    case "Delivered":
      return "bg-green-500/20 text-green-400";
    case "Processing":
      return "bg-yellow-500/20 text-yellow-400";
    case "Shipped":
      return "bg-blue-500/20 text-blue-400";
    case "Cancelled":
      return "bg-red-500/20 text-red-400";
    default:
      return "bg-gray-500/20 text-gray-300";
  }
};

/* ================= REAL WEEKLY SALES CALCULATOR (FIXED) ================= */
const getWeeklySalesData = (orders) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // 1. Initialize structure
  const weeklySales = days.map((day) => ({
    name: day,
    sales: 0,
  }));

  // 2. Determine the time range for the CURRENT week
  const today = new Date();
  
  // Calculate the date of the most recent Sunday (Start of week)
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0); // Reset time to beginning of day

  // Calculate the date of the coming Saturday (End of week)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999); // Reset time to end of day

  // 3. Process Orders
  orders.forEach((order) => {
    if (order.orderStatus !== "Cancelled") {
      const orderDate = new Date(order.createdAt);

      // ONLY count orders that happened between this Sunday and this Saturday
      if (orderDate >= startOfWeek && orderDate <= endOfWeek) {
        const dayIndex = orderDate.getDay();
        weeklySales[dayIndex].sales += Number(order.totalAmount);
      }
    }
  });

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

  /* ================= FETCH DASHBOARD DATA ================= */
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          ordersRes,
          productsRes,
          usersRes,
          revenueRes,
        ] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/order/admin/allorder`,
            { withCredentials: true }
          ),
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/products/admin/allproducts`,
            { withCredentials: true }
          ),
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/admin/stats/total-users`,
            { withCredentials: true }
          ),
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/admin/stats/total-revenue`,
            { withCredentials: true }
          ),
        ]);

        const orders = ordersRes.data.orders || [];
        const products = productsRes.data.products || [];

        /* ===== RECENT ORDERS (SORT BY LAST UPDATE) ===== */
        const sortedOrders = [...orders].sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );

        setTotalOrders(sortedOrders.length);
        setRecentOrders(sortedOrders.slice(0, 5));

        /* ===== REAL GRAPH DATA (FIXED) ===== */
        setSalesData(getWeeklySalesData(orders));

        /* ===== PRODUCTS ===== */
        setTotalProducts(products.length);
        setLowStock(products.filter((p) => Number(p.stock) <= 10));

        /* ===== USERS & REVENUE ===== */
        setTotalUsers(usersRes.data.totalUsers);
        setTotalRevenue(revenueRes.data.totalRevenue);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      }
    };

    fetchDashboardData();
  }, []);

  /* ================= STATS ================= */
  const stats = [
    { title: "Total Users", value: totalUsers, icon: <FaUsers /> },
    { title: "Total Orders", value: totalOrders, icon: <FaShoppingCart /> },
    {
      title: "Total Revenue",
      value: `₹${totalRevenue}`,
      icon: <FaRupeeSign />,
    },
    { title: "Total Products", value: totalProducts, icon: <FaBox /> },
  ];

  return (
    <>
      <AdminNavbar />

      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white px-6 py-10">
        {/* ================= HEADER ================= */}
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-4xl font-extrabold mb-10"
        >
          Admin Dashboard
        </motion.h1>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((item, i) => (
            <motion.div
              key={item.title}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex items-center gap-4"
            >
              <div className="text-3xl text-cyan-400">{item.icon}</div>
              <div>
                <p className="text-gray-400 text-sm">{item.title}</p>
                <h3 className="text-2xl font-bold">{item.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ================= REAL SALES GRAPH ================= */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-12"
        >
          <h2 className="text-xl font-semibold mb-6">Weekly Sales (Current Week)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <XAxis dataKey="name" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip 
                contentStyle={{ backgroundColor: "#333", border: "none", color: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#22d3ee"
                strokeWidth={3}
                dot={{ fill: "#22d3ee", r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ================= BOTTOM SECTION ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ===== RECENT ORDERS ===== */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="lg:col-span-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>

            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b border-white/10">
                <tr>
                  <th className="text-left py-2">Order ID</th>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="border-b border-white/5">
                    <td className="py-3">#{order._id.slice(-6)}</td>
                    <td className="text-center">
                      {order.user?.fullName || "User"}
                    </td>
                    <td className="text-center">₹{order.totalAmount}</td>
                    <td className="text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* ===== LOW STOCK ===== */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaExclamationTriangle className="text-red-400" />
              Low Stock Alerts
            </h2>

            {lowStock.length === 0 ? (
              <p className="text-gray-400 text-sm">
                All products are sufficiently stocked 🎉
              </p>
            ) : (
              <ul className="space-y-3">
                {lowStock.map((item) => (
                  <li
                    key={item._id}
                    className="flex justify-between text-sm"
                  >
                    <span>{item.name}</span>
                    <span className="text-red-400">
                      {item.stock} left
                    </span>
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