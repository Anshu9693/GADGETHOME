import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaArrowRight, FaShieldAlt, FaBolt, FaLeaf, FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";
import Footer from "../components/User/Footer";
import { useNavigate } from "react-router-dom";
/* ================= ANIMATION VARIANTS ================= */
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.8, ease: "easeOut" }
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const Home = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/user/featured`, { withCredentials: true });
        setFeaturedProducts(res.data.products.slice(0, 4)); // Get top 4
      } catch (err) {
        console.error("Error fetching featured products", err);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans">
      
      {/* 1. HERO SECTION */}
      {/* Admin Login Button */}
<div className="absolute top-6 right-6 z-20">
  <button
    onClick={() => navigate("/admin/signin")}
    className="px-5 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md
               text-sm font-semibold text-white hover:bg-cyan-500 hover:text-black
               transition-all shadow-lg"
  >
    Admin Login
  </button>
</div>

      <section className="relative h-screen flex items-center justify-center px-6">
        {/* Animated Background Glows */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-[150px]" />

        <div className="max-w-7xl mx-auto text-center z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={1}>
            <span className="px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-widest">
              The Future of Living is Here
            </span>
          </motion.div>

          <motion.h1 
            initial="hidden" animate="visible" variants={fadeInUp} custom={2}
            className="mt-6 text-6xl md:text-8xl font-black tracking-tighter leading-none"
          >
            SMART <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">SPACES</span> <br />
            GENIUS GADGETS.
          </motion.h1>

          <motion.p 
            initial="hidden" animate="visible" variants={fadeInUp} custom={3}
            className="mt-6 text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Upgrade your home with next-gen automation. From voice-controlled lighting to AI-powered security, control everything from your fingertips.
          </motion.p>

          <motion.div 
            initial="hidden" animate="visible" variants={fadeInUp} custom={4}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/user/allproducts" className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center justify-center gap-2">
              Shop Now <FaArrowRight />
            </Link>
              {/* <button 
              onClick={()=>Navigate("/user/explorcategory")}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-xl font-semibold transition-all">
                Explore Categories
              </button> */}
          </motion.div>
        </div>
      </section>

      {/* 2. FEATURES GRID (TRUST BUILDING) */}
      <section className="py-20 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <FaBolt />, title: "Energy Efficient", desc: "Reduce your bills by 30% with smart power tracking." },
            { icon: <FaShieldAlt />, title: "End-to-End Security", desc: "Military grade encryption for all your smart devices." },
            { icon: <FaLeaf />, title: "Eco Friendly", desc: "Sustainable tech built for a greener tomorrow." },
          ].map((feature, i) => (
            <motion.div 
              key={i} whileHover={{ y: -10 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-2xl mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-extrabold">Top Picks</h2>
            <p className="text-gray-500 mt-2">The most loved gadgets this week.</p>
          </div>
          <Link to="/user/allproducts" className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-2">
            View All <FaArrowRight />
          </Link>
        </div>

        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {featuredProducts.map((product) => (
            <motion.div 
              key={product._id} variants={fadeInUp}
              className="group bg-white/5 border border-white/10 rounded-[32px] overflow-hidden hover:border-cyan-500/50 transition-all duration-500"
            >
              <div className="h-64 overflow-hidden relative">
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                {product.discountPrice && (
                  <span className="absolute top-4 left-4 bg-cyan-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase">
                    Sale
                  </span>
                )}
              </div>
              <div className="p-6">
                <p className="text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-1">{product.brand}</p>
                <h3 className="text-lg font-bold truncate mb-2">{product.name}</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xl font-black">₹{product.price}</span>
                    {product.discountPrice && <span className="ml-2 text-sm text-gray-500 line-through">₹{product.discountPrice}</span>}
                  </div>
                  <button className="p-3 bg-white text-black rounded-2xl hover:bg-cyan-400 transition-colors shadow-lg">
                    <FaShoppingCart />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 4. NEWSLETTER / CTA */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-cyan-600 to-blue-700 rounded-[40px] p-12 text-center relative overflow-hidden shadow-2xl shadow-cyan-500/20">
            <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-black mb-4">Join the Smart Revolution</h2>
                <p className="text-white/80 max-w-xl mx-auto mb-8 font-medium">Get exclusive early access to new smart gadget launches and 15% off your first order.</p>
                <form className="flex flex-col sm:row max-w-md mx-auto gap-4">
                    <input type="email" placeholder="Enter your email" className="bg-white/20 backdrop-blur-md border border-white/30 px-6 py-4 rounded-2xl placeholder:text-white/60 focus:outline-none focus:ring-2 ring-white/50" />
                    <button className="bg-black text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform">Subscribe</button>
                </form>
            </div>
            {/* Decorative circle */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* 5. FOOTER */}
     <Footer/>  

    </div>
  );
};

<Footer/>
export default Home;