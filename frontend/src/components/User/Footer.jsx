import React from "react";
import { motion } from "framer-motion";
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedinIn, 
  FaEnvelope, 
  FaPhoneAlt, 
  FaMapMarkerAlt, 
  FaArrowUp 
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-[#050505] pt-20 pb-10 px-6 border-t border-white/10 overflow-hidden">
      {/* Background Subtle Glow to match your Dashboard */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
        
        {/* 1. BRAND & VISION */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black tracking-tighter text-white">
            GADGET<span className="text-cyan-400">HOME</span>
          </h2>
          <p className="text-gray-400 leading-relaxed text-sm">
            Bringing the future to your doorstep. **GADGETHOME** specializes in 
            curating the world's most innovative smart home solutions for a 
            seamless, automated lifestyle.
          </p>
          <div className="flex gap-4">
            {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, i) => (
              <motion.a
                key={i}
                href="#"
                whileHover={{ y: -5, color: "#22d3ee", backgroundColor: "rgba(34, 211, 238, 0.1)" }}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 transition-all"
              >
                <Icon size={16} />
              </motion.a>
            ))}
          </div>
        </div>

        {/* 2. EXPLORE */}
        <div>
          <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-[10px]">Explore Gadgets</h4>
          <ul className="space-y-4 text-sm">
            {["Smart Lighting", "Home Security", "Kitchen Gadgets", "Smart Plugs", "Wearables"].map((item) => (
              <li key={item}>
                <Link to={`/user/category/${item}`} className="text-gray-400 hover:text-cyan-400 transition-colors duration-300">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. CUSTOMER CARE */}
        <div>
          <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-[10px]">Customer Care</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            {["Track My Order", "Shipping Policy", "Terms & Conditions", "Privacy Hub", "Warranty Info"].map((item) => (
              <li key={item} className="hover:text-cyan-400 transition-colors cursor-pointer">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* 4. CONTACT & NEWSLETTER */}
        <div className="space-y-6">
          <h4 className="text-white font-bold uppercase tracking-widest text-[10px]">Get in Touch</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <FaEnvelope className="text-cyan-400 text-xs" />
              <p>hello@gadgethome.com</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <FaPhoneAlt className="text-cyan-400 text-xs" />
              <p>+91 98765 43210</p>
            </div>
          </div>
          <div className="pt-4">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-3 tracking-wider">Stay Updated</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Email" 
                className="bg-white/5 border border-white/10 px-4 py-2 rounded-l-lg focus:outline-none focus:border-cyan-500/50 w-full text-xs"
              />
              <button className="bg-cyan-500 text-black px-4 py-2 rounded-r-lg text-xs font-bold hover:bg-cyan-400 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-gray-500 text-[11px]">
          © 2026 **GADGETHOME** Technologies. Engineered for modern living.
        </p>
        
        {/* Scroll To Top */}
        <motion.button
          onClick={scrollToTop}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group flex items-center gap-3 text-[10px] font-bold text-gray-400 hover:text-cyan-400 transition-all uppercase tracking-widest"
        >
          Scroll to top
          <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-cyan-500/50 group-hover:shadow-[0_0_10px_rgba(34,211,238,0.2)] transition-all">
            <FaArrowUp size={10} />
          </span>
        </motion.button>

        {/* Payment Methods */}
        <div className="flex gap-5 opacity-40 hover:opacity-100 transition-opacity">
           <span className="text-[10px] font-bold text-gray-400">SECURE PAYMENTS:</span>
           {/* Add your payment logos here */}
           <div className="flex gap-3 grayscale contrast-125">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5" />
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;