import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  FaArrowRight,
  FaShoppingCart,
  FaShieldAlt,
  FaPlay,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/User/Footer";

const Home = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const dx = useSpring(mouseX, springConfig);
  const dy = useSpring(mouseY, springConfig);

  const { scrollY } = useScroll();

  const videoScale = useTransform(scrollY, [0, 500], [1, 1.2]);
  const textOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const textY = useTransform(scrollY, [0, 300], [0, -100]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [featuredRes, bestSellingRes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/products/user/featured`,
            { withCredentials: true },
          ),
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/analytics/best-selling`,
            { withCredentials: true },
          ),
        ]);

        setFeaturedProducts(featuredRes.data.products?.slice(0, 8) || []);
        setBestSelling(bestSellingRes.data.bestSelling?.slice(0, 8) || []);
      } catch (err) {
        console.error("Data fetch error:", err);
      }
    };
    fetchAllData();
  }, []);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX - innerWidth / 2) / 25);
    mouseY.set((clientY - innerHeight / 2) / 25);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-black text-white overflow-x-hidden selection:bg-cyan-500"
    >
      {/* 1. UPDATED: FUTURISTIC 3D HERO SECTION */}
      <section
  ref={containerRef}
  className="relative h-screen sm:h-auto flex items-center bg-[#020617] overflow-hidden"
>
  {/* Admin Link */}
  <Link
    to="/admin/signin"
    className="group absolute top-6 sm:top-8 right-6 z-30 flex items-center gap-3"
  >
    <div className="hidden md:flex flex-col items-end">
      <span className="text-[8px] font-mono text-cyan-500/50 tracking-[0.2em] leading-none uppercase">
        Authorization_Required
      </span>
      <div className="h-[1px] w-12 bg-gradient-to-l from-cyan-500/50 to-transparent mt-1" />
    </div>

    <div className="relative overflow-hidden px-5 sm:px-6 py-2.5 bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-lg transition-all duration-300 group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]">
      <div className="absolute inset-0 bg-cyan-500/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />

      <div className="relative flex items-center gap-2">
        <span className="flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>

        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white group-hover:text-cyan-400 transition-colors">
          Admin Access
        </span>
      </div>

      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  </Link>

  {/* Background Video */}
  <motion.div style={{ scale: videoScale }} className="absolute inset-0 z-0">
    <video
      autoPlay
      loop
      muted
      playsInline
      className="w-full h-full object-cover opacity-40"
    >
      <source src="/futurevideo.mp4" type="video/mp4" />
    </video>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,1)_100%)]" />
    <div className="absolute inset-0 bg-black/40" />
  </motion.div>

  <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10 grid lg:grid-cols-2 items-center gap-8">
    {/* LEFT TEXT */}
    <motion.div
      style={{ opacity: textOpacity, y: textY }}
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="text-center lg:text-left"
    >
      <div className="relative pl-4 sm:pl-8 border-l-4 border-cyan-400">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-black mb-4 sm:mb-6 uppercase tracking-tight leading-[1] text-white">
          THE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-500 animate-pulse">
            NEXT GEN
          </span>
          <br />
          GADGET
        </h1>

        <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-xs sm:max-w-sm md:max-w-md lg:max-w-sm mx-auto lg:mx-0 mb-6 sm:mb-8 font-medium leading-snug tracking-wide">
          Don’t just follow the future—define it. Own the most advanced
          hardware forged for the digital frontier.
        </p>

        <Link
          to="/user/allproducts"
          className="group relative inline-flex items-center gap-2 sm:gap-4 px-6 sm:px-10 py-3 sm:py-4 bg-cyan-400 text-[#020617] font-black rounded-full uppercase tracking-tighter text-sm transition-all duration-500 hover:bg-white hover:shadow-[0_0_40px_rgba(34,211,238,0.6)]"
        >
          <span>Explore Now</span>
          <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
        </Link>
      </div>
    </motion.div>

    {/* RIGHT CAROUSEL / SCROLLER */}
    <div className="lg:hidden w-full overflow-x-auto flex gap-4 py-6 scroll-smooth snap-x snap-mandatory">
      {featuredProducts.slice(0, 4).map((p, i) => (
        <div
          key={p._id}
          className="flex-shrink-0 w-64 sm:w-72 bg-[#020617]/60 backdrop-blur-md border border-cyan-400/30 p-3 rounded-[2rem] snap-center transition-all duration-500 hover:border-cyan-400 cursor-pointer"
          onClick={() => navigate(`/user/featured`)}
        >
          <img
            src={p.images?.[0]}
            className="w-full h-64 sm:h-72 object-contain rounded-[1.5rem] brightness-90 hover:brightness-110 transition-all duration-700"
            alt={p.name}
          />
          <div className="mt-2 text-center text-[10px] font-mono text-cyan-400/60 tracking-[0.3em] uppercase">
            {p.name}
          </div>
        </div>
      ))}
    </div>

    {/* Desktop 3D Carousel */}
    <div className="hidden lg:flex relative h-[650px] w-full items-center justify-center [perspective:2000px]">
      <div className="relative w-full h-full flex items-center justify-center [transform-style:preserve-3d]">
        {featuredProducts.slice(0, 4).map((p, i) => (
          <motion.div
            key={p._id}
            animate={{ rotateY: [i * 90, i * 90 + 360] }}
            transition={{
              rotateY: { duration: 20, repeat: Infinity, ease: "linear" },
            }}
            className="absolute cursor-pointer flex flex-col items-center"
            style={{
              transformOrigin: "center center -180px",
              backfaceVisibility: "hidden",
            }}
            onClick={() => navigate(`/user/featured`)}
          >
            <div className="mb-4 text-[10px] font-mono text-cyan-400/60 tracking-[0.3em] uppercase">
              ID:UNIT-0{i + 1}
            </div>

            <div className="relative group bg-[#020617]/60 backdrop-blur-md border border-cyan-400/30 p-3 rounded-[2.5rem] transition-all duration-500 hover:border-cyan-400">
              <img
                src={p.images?.[0]}
                className="w-64 h-64 md:w-72 md:h-72 object-contain rounded-[2rem] brightness-90 group-hover:brightness-110 transition-all duration-700"
                alt={p.name}
              />

              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-max opacity-0 group-hover:opacity-100 transition-all duration-500">
                <div className="bg-black border border-white/10 px-6 py-2 rounded-full shadow-xl">
                  <p className="text-[10px] font-bold text-white uppercase tracking-widest">
                    {p.name}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
</section>


      {/* 2. GADGETS EVOLUTION (INTACT) */}
      <section className="py-16 sm:py-20 md:py-32 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row items-center gap-12 sm:gap-14 md:gap-20"
          >
            {/* LEFT CONTENT */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <h2
                className="
            text-[2.6rem]
            sm:text-5xl
            md:text-7xl
            lg:text-8xl
            font-black
            tracking-tighter
            uppercase
            leading-[0.95]
            text-white
            mb-5 sm:mb-6 md:mb-8
          "
              >
                DEFINING <br />
                THE NEW <br />
                <span className="text-cyan-500">GEAR ERA.</span>
              </h2>

              <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-sm sm:max-w-md lg:max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
                Elevate your digital lifestyle with precision-engineered
                peripherals.
              </p>
            </div>

            {/* RIGHT IMAGE */}
            <div className="lg:w-1/2 relative group w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-none">
              {/* GLOW */}
              <motion.div
                animate={{ opacity: [0.25, 0.45, 0.25], scale: [1, 1.03, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -inset-4 bg-cyan-500 rounded-3xl blur-2xl opacity-20"
              />

              <div className="relative overflow-hidden rounded-2xl border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2070"
                  alt="Gear"
                  className="
              w-full
              h-[240px]
              sm:h-[300px]
              md:h-[380px]
              lg:h-[450px]
              object-cover
              transition-all
              duration-700

              /* MOBILE: COLOR */
              grayscale-0

              /* DESKTOP: B&W → COLOR ON HOVER */
              md:grayscale
              md:group-hover:grayscale-0
            "
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. HOME SECURITY SECTION (INTACT) */}
      {/* 3. HOME SECURITY SECTION - REDESIGNED */}
      <section className="py-24 sm:py-32 bg-[#020617] relative overflow-hidden">
        {/* Ambient Gradient Glow */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[320px] sm:w-[520px] h-[320px] sm:h-[520px] bg-indigo-500/10 blur-[120px] sm:blur-[160px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row-reverse items-center gap-12 sm:gap-16 lg:gap-24"
          >
            {/* TEXT CONTENT */}
            <div className="lg:w-1/2 relative z-10 text-center lg:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center lg:justify-start gap-4 mb-6 sm:mb-8">
                <div className="p-3 bg-indigo-500/10 border border-indigo-400/20 rounded-xl">
                  <FaShieldAlt className="text-indigo-400 text-2xl animate-pulse" />
                </div>
                <span className="text-indigo-300 font-mono tracking-[0.35em] text-xs uppercase bg-indigo-500/5 px-3 py-1 rounded-full border border-indigo-400/10 whitespace-nowrap">
                  Protocol: Omega-Shield
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-6 sm:mb-8 uppercase leading-tight sm:leading-[1.1] text-white">
                FORTIFY <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-sky-500 italic">
                  YOUR DOMAIN.
                </span>
              </h2>

              <p className="text-slate-400 text-sm sm:text-base max-w-md sm:max-w-lg mx-auto lg:mx-0 mb-6 sm:mb-10 font-light leading-relaxed tracking-wide">
                Deploy industrial-grade encryption and real-time threat
                detection. Your digital fortress, engineered for the absolute
                edge of security.
              </p>

              <button className="group relative px-8 sm:px-10 py-3 sm:py-5 overflow-hidden rounded-xl bg-transparent border border-indigo-400/30 text-indigo-300 font-bold uppercase text-[9px] sm:text-xs tracking-[0.2em] transition-all duration-500 hover:text-black">
                <span className="relative z-10">Initialize Defense</span>

                {/* Hover Fill */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-cyan-400 to-sky-500 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500" />
              </button>
            </div>

            {/* VISUAL CONTENT */}
            <div className="lg:w-1/2 relative group w-full max-w-[360px] sm:max-w-[480px] lg:max-w-none mt-10 lg:mt-0">
              {/* Soft Halo */}
              <motion.div
                animate={{ opacity: [0.2, 0.35, 0.2], scale: [1, 1.06, 1] }}
                transition={{ duration: 7, repeat: Infinity }}
                className="absolute -inset-8 sm:-inset-10 bg-indigo-500/20 rounded-[2rem] blur-[80px] sm:blur-[120px] opacity-30 group-hover:bg-cyan-500/30 transition-all duration-700"
              />

              <div className="relative p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                {/* Scan Line */}
                <motion.div
                  animate={{ top: ["-120%", "220%"] }}
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute left-0 w-full h-16 sm:h-24 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent z-20 pointer-events-none"
                />

                <div className="relative overflow-hidden rounded-[1.5rem] aspect-[4/3] sm:aspect-auto lg:h-[400px]">
                  <img
                    src="https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=2070"
                    className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-105 transition-all duration-700"
                    alt="Security Tech"
                  />

                  {/* Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-70" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />

                  {/* HUD Info */}
                  <div className="absolute bottom-4 sm:bottom-6 left-4 right-4 flex justify-between items-end border-t border-white/10 pt-2 sm:pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-[8px] sm:text-[10px]">
                    <div className="font-mono text-cyan-400">
                      STATUS: ENCRYPTED
                    </div>
                    <div className="font-mono text-white/40">CORE_V.2.04</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS - COMPACT CYBER CARDS */}
      <section className="py-24 bg-[#050505] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Heading */}
          <div className="flex justify-between items-end mb-12 border-l-4 border-cyan-500 pl-4">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">
                Featured{" "}
                <span className="text-cyan-500 italic text-xl sm:text-2xl md:text-4xl ml-2">
                  // Tech
                </span>
              </h2>
              <p className="text-gray-500 font-mono text-[10px] sm:text-xs mt-2 uppercase tracking-[0.3em]">
                Hardware_Selection_V1.0
              </p>
            </div>

            <Link
              to="/user/allproducts"
              className="hidden sm:flex group text-[10px] font-black text-gray-400 hover:text-cyan-400 uppercase tracking-[0.2em] items-center gap-2 transition-all"
            >
              View All{" "}
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* PRODUCTS */}
          <div
            className="
        flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory
        lg:grid lg:grid-cols-4 lg:overflow-visible
        scrollbar-hide
      "
          >
            {featuredProducts.map((product) => (
              <motion.div
                key={product._id}
                onClick={() => navigate(`/user/productDetail/${product._id}`)}
                whileHover={{ y: -8 }}
                className="
            snap-start shrink-0
            w-[85%] sm:w-[60%] md:w-[45%] lg:w-auto
            h-[380px]
            relative bg-gradient-to-b from-white/5 to-transparent
            group rounded-3xl border border-white/5
            hover:border-cyan-500/40 transition-all duration-500
            overflow-hidden backdrop-blur-sm cursor-pointer
          "
              >
                {/* Top Decor */}
                <div className="absolute top-4 left-6 flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />
                  <div className="w-8 h-[1px] bg-white/10 mt-0.5" />
                </div>

                {/* Image */}
                <div className="h-2/3 p-6 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-cyan-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain brightness-75
                         group-hover:brightness-110 group-hover:scale-110
                         transition-all duration-700 z-10"
                  />
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-black via-black/80 to-transparent">
                  <p className="text-[10px] font-mono text-cyan-500/60 mb-1 uppercase tracking-widest">
                    Premium_Unit
                  </p>

                  <h3 className="text-sm sm:text-base font-bold mb-3 uppercase truncate text-white group-hover:text-cyan-400 transition-colors">
                    {product.name}
                  </h3>

                  <div className="flex justify-between items-center">
                    <span className="text-lg sm:text-xl font-black text-white italic tracking-tighter">
                      ₹{product.price.toLocaleString()}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/user/productDetail/${product._id}`);
                      }}
                      className="bg-cyan-500 text-black px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-white transition"
                    >
                      <span className="flex items-center gap-2">
                        Details <FaShoppingCart size={10} />
                      </span>
                    </button>
                  </div>
                </div>

                {/* Bottom Scan Line */}
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-cyan-500 group-hover:w-full transition-all duration-700" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

     <section className="py-16 md:py-24 relative overflow-hidden bg-gradient-to-br from-[#0b0b0b] via-[#120c08] to-[#070707]">
  {/* Background Glows */}
  <div className="absolute -top-24 -left-24 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-orange-500/10 blur-[120px] md:blur-[180px] rounded-full" />
  <div className="absolute bottom-0 right-0 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-amber-400/10 blur-[100px] md:blur-[160px] rounded-full" />

  <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
    {/* HEADER */}
    <div className="flex justify-between items-end mb-10 md:mb-16 border-l-4 border-orange-400 pl-4 md:pl-6">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
          </span>
          <span className="text-orange-300 font-mono text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.45em] bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
            Live_Trending_Data
          </span>
        </div>

        <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter text-[#f5f5f5] leading-tight">
          Best{" "}
          <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 text-transparent bg-clip-text italic">
            Selling.
          </span>
        </h2>
      </div>

      <Link
        to="/user/bestselling"
        className="group text-[9px] md:text-[10px] font-black text-orange-300/60 hover:text-orange-400 uppercase tracking-[0.2em] md:tracking-[0.25em] mb-2 flex items-center gap-2 transition-all whitespace-nowrap"
      >
        <span className="hidden sm:inline">Analyze All</span>
        <span className="sm:hidden">View All</span>
        <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>

    {/* SLIDER CONTAINER */}
    <div className="relative overflow-visible md:overflow-hidden">
      <motion.div
        className="flex gap-4 md:gap-6 cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ right: 0, left: -2000 }} // Mobile drag support
        animate={window.innerWidth > 768 ? { x: ["0%", "-50%"] } : {}} // Desktop auto-scroll only
        transition={{
          repeat: Infinity,
          duration: 30,
          ease: "linear",
        }}
        style={{ 
          display: 'flex',
          width: 'max-content',
          touchAction: 'pan-y' // Allows vertical scrolling of page while touching slider
        }}
      >
        {/* Double array for infinite effect on desktop */}
        {[...bestSelling, ...bestSelling].map((item, index) => {
          const product = item.product;
          if (!product) return null;

          return (
            <motion.div
              key={`${product._id}-${index}`}
              onClick={() => navigate(`/user/productDetail/${product._id}`)}
              whileHover={{ y: -10, scale: 1.02 }}
              className="w-[260px] sm:w-[300px] md:w-[340px]
              h-[380px] md:h-[420px] group rounded-[2rem] md:rounded-[2.4rem] overflow-hidden 
              bg-gradient-to-br from-[#151515] via-[#1a120d] to-[#0e0e0e]
              border border-orange-500/10 hover:border-orange-400/40
              backdrop-blur-xl transition-all duration-500 relative flex-shrink-0"
            >
              {/* Rank Badge */}
              <div className="absolute top-4 left-4 z-20">
                <div className="bg-gradient-to-r from-orange-400 to-amber-300 text-black text-[9px] md:text-[10px] font-black px-3 py-1 rounded-lg shadow-lg">
                  #{(index % bestSelling.length) + 1}
                </div>
              </div>

              {/* IMAGE AREA */}
              <div className="h-1/2 md:h-2/3 p-6 md:p-8 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  className="max-w-[80%] max-h-full object-contain saturate-90 contrast-110 group-hover:saturate-125 group-hover:scale-110 transition-all duration-700 z-10"
                />
              </div>

              {/* CONTENT AREA */}
              <div className="absolute bottom-0 left-0 w-full p-5 md:p-6 bg-gradient-to-t from-[#080808] via-[#0f0f0f]/95 to-transparent">
                <span className="inline-flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-amber-300 uppercase mb-1 md:mb-2">
                  🔥 {item.totalSold}+ Sold
                </span>

                <h3 className="text-xs md:text-sm font-bold mb-3 md:mb-4 uppercase truncate text-[#eaeaea] group-hover:text-amber-300 transition-colors">
                  {product.name}
                </h3>

                <div className="flex justify-between items-center group-hover:translate-y-[-4px] transition-all duration-500">
                  <div>
                    <span className="text-[9px] md:text-[10px] text-orange-300/40 line-through">
                      ₹{(product.price * 1.2).toFixed(0)}
                    </span>
                    <div className="text-lg md:text-xl font-black italic text-[#fdf4e7] tracking-tight">
                      ₹{product.price.toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents card click
                      navigate(`/user/productDetail/${product._id}`);
                    }}
                    className="bg-gradient-to-br from-orange-400 to-amber-300 text-black p-2.5 md:p-3 rounded-xl hover:scale-110 transition-all duration-300 shadow-xl shadow-orange-900/40"
                  >
                    <FaShoppingCart size={12} />
                  </button>
                </div>
              </div>

              {/* Glow Border */}
              <div className="absolute inset-0 rounded-[2rem] md:rounded-[2.4rem] ring-1 ring-orange-400/10 group-hover:ring-orange-400/30 transition-all" />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  </div>

  {/* CSS for better mobile experience */}
  <style>{`
    @media (max-width: 768px) {
      .flex {
        overflow-x: auto;
        scroll-snap-type: x proximity;
        -webkit-overflow-scrolling: touch;
      }
      .flex::-webkit-scrollbar {
        display: none;
      }
    }
  `}</style>
</section>

      {/* 6. INNOVATION HUB (INTACT) */}
      <section className="py-16 sm:py-24 md:py-32 bg-[#020617] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row items-center gap-10 sm:gap-14 lg:gap-20"
          >
            {/* LEFT CONTENT */}
            <div className="lg:w-1/2 relative z-10 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-5">
                <FaPlay className="text-lime-400 text-2xl sm:text-3xl" />
                <span className="text-lime-400 font-mono tracking-widest text-xs sm:text-sm uppercase">
                  Future Unlocked
                </span>
              </div>

              <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-[1.05] text-white mb-6 sm:mb-8">
                IGNITE <br />
                THE <br />
                <span className="text-lime-400">POTENTIAL.</span>
              </h2>

              <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-sm sm:max-w-md lg:max-w-lg mx-auto lg:mx-0 mb-6 sm:mb-8 font-medium leading-relaxed">
                Experience the next era of technology. Live systems, real-time
                intelligence, and power that performs.
              </p>

              <button className="px-8 sm:px-10 py-3 sm:py-4 border border-lime-400/40 text-lime-400 font-bold uppercase text-xs tracking-widest hover:bg-lime-500 hover:text-black transition-all duration-500">
                Discover More
              </button>
            </div>

            {/* RIGHT IMAGE */}
            <div className="lg:w-1/2 relative group perspective-[1200px] w-full max-w-[360px] sm:max-w-md md:max-w-lg lg:max-w-none mt-10 lg:mt-0">
              {/* GLOW */}
              <motion.div
                animate={{ opacity: [0.25, 0.45, 0.25], scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -inset-6 bg-lime-500 rounded-3xl blur-2xl sm:blur-3xl opacity-30"
              />

              <motion.div
                whileHover={{ rotateY: -8, rotateX: 4, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 120 }}
                className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl transform-style-preserve-3d"
              >
                <img
                  src="/gptimg.png"
                  alt="Working Electronic Device"
                  className="
              w-full
              h-[220px]
              sm:h-[300px]
              md:h-[380px]
              lg:h-[460px]
              object-cover
              brightness-95
              contrast-110
              transition-all
              duration-700
              
              /* MOBILE = FULL COLOR */
              grayscale-0

              /* DESKTOP = B&W → COLOR ON HOVER */
              md:grayscale
              md:group-hover:grayscale-0
            "
                />

                {/* SCAN LIGHT */}
                <motion.div
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-[linear-gradient(120deg,transparent_20%,rgba(163,230,53,0.35)_50%,transparent_80%)]"
                />

                {/* GRID OVERLAY */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
