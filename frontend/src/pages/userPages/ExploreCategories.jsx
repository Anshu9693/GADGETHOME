import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import NavBar from "../../components/User/NavBar.jsx";
import { toast } from "react-hot-toast";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const ExploreCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/categories/user/all`);
        setCategories(res.data.categories);
      } catch {
        toast.error("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-black mb-12 tracking-tight">
            Explore <span className="text-cyan-500">Categories</span>
          </h1>

          {loading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10"
              initial="hidden"
              animate="visible"
            >
              {categories.map((cat) => (
                <motion.div
                  key={cat._id}
                  variants={cardVariants}
                  whileHover={{ scale: 1.05 }}
                  className="relative cursor-pointer group rounded-3xl overflow-hidden border border-white/10 bg-white/5"
                  onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                >
                  {/* Category Image */}
                  <img
                    src={cat.image || "https://via.placeholder.com/400x400?text=Category"}
                    alt={cat.name}
                    className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-2xl font-black">{cat.name}</span>
                  </div>

                  {/* Category Name */}
                  <div className="p-4">
                    <h3 className="text-xl font-bold">{cat.name}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{cat.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default ExploreCategories;
