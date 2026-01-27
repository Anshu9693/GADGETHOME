import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShoppingCart,
  FaHeart,
  FaUser,
  FaBars,
  FaTimes,
} from "react-icons/fa";

/* ================= NAV ITEMS ================= */
const NAV_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Products", path: "/user/allproducts" },
  { label: "Featured", path: "/user/featured" },
  { label: "My Order", path: "/user/myorders" },

];

/* ================= AXIOS ================= */
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  timeout: 8000,
});

const Navbar = () => {
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  /* ================= SCROLL EFFECT ================= */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get("/api/user/me");
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  /* ================= FETCH WISHLIST ================= */
  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistCount(0);
      return;
    }

    const fetchWishlist = async () => {
      try {
        const res = await api.get("/api/wishlist");
        setWishlistCount(res.data.products?.length || 0);
      } catch {
        setWishlistCount(0);
      }
    };

    fetchWishlist();
  }, [isAuthenticated]);

  /* ================= FETCH CART (LIVE SYNC) ================= */
  useEffect(() => {
    if (!isAuthenticated) {
      setCartCount(0);
      return;
    }

    const fetchCart = async () => {
      try {
        const res = await api.get("/api/cart/getItems");
        setCartCount(res.data.cart?.totalItems || 0);
      } catch {
        setCartCount(0);
      }
    };

    fetchCart();

    // 🔥 LISTEN FOR CART CHANGES (add / remove / order placed)
    const handleCartUpdate = () => fetchCart();
    window.addEventListener("cart-updated", handleCartUpdate);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, [isAuthenticated]);

  /* ================= CLOSE PROFILE ================= */
  useEffect(() => {
    const close = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    try {
      await api.post("/api/user/logout");
      setIsAuthenticated(false);
      setWishlistCount(0);
      setCartCount(0);
      setProfileOpen(false);
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all ${
        scrolled
          ? "bg-black/80 backdrop-blur border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* LOGO */}
        <Link to="/" className="text-2xl font-black text-white">
          GADGET<span className="text-cyan-400">HOME</span>
        </Link>

        {/* DESKTOP MENU */}
        <ul className="hidden md:flex gap-8 text-sm font-semibold uppercase">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <Link
                to={item.path}
                className="text-gray-400 hover:text-cyan-400 transition"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* RIGHT ICONS */}
        <div className="flex items-center gap-5">
          <NavIcon to="/user/wishlist" badge={wishlistCount} badgeColor="red">
            <FaHeart />
          </NavIcon>

          <NavIcon to="/user/cart" badge={cartCount} badgeColor="cyan">
            <FaShoppingCart />
          </NavIcon>

          {/* PROFILE */}
          <div ref={profileRef} className="relative hidden md:block">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="text-gray-400 hover:text-cyan-400"
            >
              <FaUser />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 mt-3 w-40 rounded-xl bg-[#0b0b0b] border border-white/10 shadow-xl"
                >
                  {!isAuthenticated ? (
                    <Link
                      to="/user/signin"
                      onClick={() => setProfileOpen(false)}
                      className="block px-5 py-3 text-sm text-cyan-400 hover:bg-white/5"
                    >
                      Sign In
                    </Link>
                  ) : (
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-5 py-3 text-sm text-red-400 hover:bg-red-500/10"
                    >
                      Logout
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* MOBILE */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </nav>
  );
};

/* ================= REUSABLE ICON ================= */
const NavIcon = ({ to, children, badge, badgeColor }) => (
  <Link to={to} className="relative text-gray-400 hover:text-cyan-400">
    {children}
    {badge > 0 && (
      <span
        className={`absolute -top-2 -right-2 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
          badgeColor === "red"
            ? "bg-red-500 text-white"
            : "bg-cyan-500 text-black"
        }`}
      >
        {badge}
      </span>
    )}
  </Link>
);

export default Navbar;
