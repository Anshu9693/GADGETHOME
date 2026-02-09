import React, { useEffect, useState, useRef } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
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
  { label: "Best Selling", path: "/user/bestselling" },
  { label: "Featured", path: "/user/featured" },
  { label: "My Orders", path: "/user/myorders" },
  { label: "About", path: "/user/about" },
  { label: "Contact", path: "/user/contact" },


];

/* ================= AXIOS ================= */
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  timeout: 8000,
});

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [userAvatar, setUserAvatar] = useState("");

  /* ================= SCROLL ================= */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ================= AUTH ================= */
  useEffect(() => {
    api.get("/api/user/me")
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setUserAvatar("");
      return;
    }
    api.get("/api/user/profile")
      .then(res => setUserAvatar(res.data.user?.avatar || ""))
      .catch(() => setUserAvatar(""));
  }, [isAuthenticated]);

  /* ================= WISHLIST ================= */
  useEffect(() => {
    if (!isAuthenticated) return setWishlistCount(0);
    api.get("/api/wishlist")
      .then(res => setWishlistCount(res.data.products?.length || 0))
      .catch(() => setWishlistCount(0));
  }, [isAuthenticated]);

  /* ================= CART ================= */
  useEffect(() => {
    if (!isAuthenticated) return setCartCount(0);

    const fetchCart = async () => {
      try {
        const res = await api.get("/api/cart/getItems");
        setCartCount(res.data.cart?.totalItems || 0);
      } catch {
        setCartCount(0);
      }
    };

    fetchCart();
    window.addEventListener("cart-updated", fetchCart);
    return () => window.removeEventListener("cart-updated", fetchCart);
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
    await api.post("/api/user/logout");
    setIsAuthenticated(false);
    setWishlistCount(0);
    setCartCount(0);
    setProfileOpen(false);
    navigate("/");
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all
      ${scrolled
        ? "bg-black/75 backdrop-blur border-b border-white/10"
        : location.pathname === "/"
          ? "bg-transparent"
          : "bg-black/55 backdrop-blur border-b border-white/10"}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* LOGO */}
        <Link to="/" className="text-2xl font-black text-white">
          GADGET<span className="text-cyan-400">HOME</span>
        </Link>

        {/* DESKTOP MENU */}
        <ul className="hidden md:flex gap-8 text-sm font-semibold uppercase">
          {NAV_ITEMS.map(item => (
            <li key={item.label}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `pb-1 transition ${
                    isActive
                      ? "text-cyan-400 border-b-2 border-cyan-400"
                      : "text-gray-300 hover:text-cyan-400"
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* RIGHT ICONS */}
        <div className="flex items-center gap-4">
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
              className="text-white p-2 rounded-full hover:bg-white/10"
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt="Profile"
                  className="h-7 w-7 rounded-full object-cover border border-white/20"
                />
              ) : (
                <FaUser />
              )}
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-40 rounded-xl bg-[#0b0b0b] border border-white/10"
                >
                  {!isAuthenticated ? (
                    <>
                    <Link
                      to="/user/signin"
                      onClick={() => setProfileOpen(false)}
                      className="block px-5 py-3 text-sm hover:bg-white/5"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/admin/signin"
                     className="block px-5 py-3 text-sm text-white hover:bg-white/5"

                    >
                      Contineu As admin
                    </Link>
                    
                    </>
                    
                    
                  ) : (
                    <>
                      <Link
                        to="/user/profile"
                        onClick={() => setProfileOpen(false)}
                        className="block px-5 py-3 text-white hover:bg-white/5"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-5 py-3 text-red-400 hover:bg-red-500/10"
                      >
                        Logout
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* MOBILE TOGGLE */}
          <button
            className="md:hidden text-white text-xl"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="md:hidden bg-black/80 border-t border-white/10"
          >
            <ul className="flex flex-col px-6 py-6 gap-5">
              {NAV_ITEMS.map(item => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `text-lg font-semibold ${
                      isActive
                        ? "text-cyan-400"
                        : "text-white hover:text-cyan-400"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="flex gap-6 pt-6 border-t border-white/10">
                <NavIcon to="/user/wishlist" badge={wishlistCount}>
                  <FaHeart />
                </NavIcon>
                <NavIcon to="/user/cart" badge={cartCount}>
                  <FaShoppingCart />
                </NavIcon>

                {!isAuthenticated ? (
                  <>
                    <Link to="/user/signin" className="text-cyan-400 font-semibold">
                      Sign In
                    </Link>
                    <Link to="/admin/signin" className="text-white font-semibold">
                      Continue As Admin
                    </Link>
                  </>
                ) : (
                  <button onClick={handleLogout} className="text-red-400 font-semibold">
                    Logout
                  </button>
                )}
              </div>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

/* ================= NAV ICON ================= */
const NavIcon = ({ to, children, badge, badgeColor }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `relative p-2 rounded-full transition
      ${isActive
        ? "bg-cyan-500/30 text-cyan-400"
        : "text-white bg-white/5 hover:bg-cyan-500/20"}`
    }
  >
    {children}
    {badge > 0 && (
      <span
        className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px]
        flex items-center justify-center font-bold
        ${badgeColor === "red"
          ? "bg-red-500 text-white"
          : "bg-cyan-400 text-black/"}`}
      >
        {badge}
      </span>
    )}
  </NavLink>
);

export default Navbar;
