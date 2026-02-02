import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaBoxOpen, 
  FaExclamationTriangle, 
  FaTags,
  FaSearch
} from "react-icons/fa";
import AdminNavbar from "../../components/Admin/Navbar";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/admin/allproducts`,
        { withCredentials: true }
      );
      setProducts(res.data.products || []);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm("⚠️ Are you sure? This action cannot be undone!")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/deleteproduct/${id}`,
        { withCredentials: true }
      );
      toast.success("Product deleted successfully");
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // Filtered products for search
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStock = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 10).length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans">
      <AdminNavbar />
      <ToastContainer position="bottom-right" theme="dark" />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10">
        
        {/* HEADER SECTION - Design Match */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          {/* <div>
            <h1 className="text-3xl font-bold text-white mb-2">Inventory Overview</h1>
            <p className="text-gray-400 text-sm">Manage your product catalog and stock levels.</p>
          </div> */}

          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative flex-grow md:w-80">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full bg-[#1c2128] border border-gray-700 rounded-full py-2.5 pl-11 pr-4 text-sm focus:border-cyan-500 outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             <button
                onClick={() => navigate("/admin/add-product")}
                className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-cyan-500/20"
              >
                <FaPlus /> Add Product
              </button>
          </div>
        </div>

        {/* QUICK STATS BAR - Refined Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           <StatCard icon={<FaBoxOpen />} label="Total Inventory" value={totalStock} color="text-cyan-400" />
           <StatCard icon={<FaExclamationTriangle />} label="Low Stock" value={lowStockCount} color="text-orange-400" />
           <StatCard icon={<FaTags />} label="Out of Stock" value={outOfStockCount} color="text-red-400" />
        </div>

        {/* PRODUCTS GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-[#1c2128]/50 rounded-3xl animate-pulse border border-gray-800" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-[#1c2128]/40 rounded-3xl border border-dashed border-gray-700">
            <FaBoxOpen size={40} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 uppercase tracking-widest text-sm">No products found in registry</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-[#1c2128]/40 border border-gray-800 rounded-3xl overflow-hidden hover:border-cyan-500/40 hover:bg-[#1c2128]/60 transition-all duration-300 relative"
                >
                  {/* Stock Status Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase backdrop-blur-md border ${
                      product.stock <= 0 ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                      product.stock < 10 ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                      'bg-green-500/10 text-green-400 border-green-500/20'
                    }`}>
                      {product.stock <= 0 ? "Empty" : `Stock: ${product.stock}`}
                    </span>
                  </div>

                  {/* Product Image */}
                  <div className="relative h-48 overflow-hidden bg-gray-900">
                    <img
                      src={product.images?.[0] || "/placeholder.png"}
                      alt={product.name}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                        product.stock <= 0 ? 'opacity-30 grayscale' : ''
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1c2128] via-transparent to-transparent" />
                  </div>

                  {/* Info Section */}
                  <div className="p-5">
                    <span className="text-cyan-500 text-[10px] font-bold uppercase tracking-widest mb-1 block">
                      {product.category || "Uncategorized"}
                    </span>
                    <h3 className="font-bold text-white mb-4 line-clamp-1">
                      {product.name}
                    </h3>

                    <div className="flex justify-between items-end mb-6">
                      <div className="text-2xl font-bold text-white italic">
                        ₹{Number(product.price).toLocaleString()}
                      </div>
                      {product.stock > 0 && product.stock < 10 && (
                        <span className="text-[10px] text-orange-400 font-bold animate-pulse">Low stock alert</span>
                      )}
                    </div>

                    {/* Actions - Styled as dark mode buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate("/editproduct/" + product._id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#0d1117] hover:bg-white hover:text-black border border-gray-700 py-2.5 rounded-xl transition-all font-bold text-xs"
                      >
                        <FaEdit size={12} /> Edit
                      </button>

                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="px-4 flex items-center justify-center bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

/* REFINED STAT CARD */
const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-[#1c2128]/40 border border-gray-800 p-6 rounded-3xl flex items-center gap-5 hover:bg-[#1c2128]/60 transition-all group">
    <div className={`text-xl ${color} bg-[#0d1117] p-4 rounded-2xl border border-gray-800 group-hover:border-cyan-500/30 transition-all`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-[11px] uppercase font-bold tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-bold tracking-tight text-white`}>{value}</p>
    </div>
  </div>
);

export default MyProducts;