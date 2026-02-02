import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaBoxOpen,
  FaShoppingCart,
  FaSearch,
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import axios from "axios";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/logout`,
        {},
        { withCredentials: true }
      );
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10 px-4 py-3">
      <div className="flex items-center justify-between">

        {/* Logo */}
        <h1
          onClick={() => navigate("/admin/dashboard")}
          className="text-xl md:text-2xl font-extrabold text-cyan-400 cursor-pointer"
        >
          Admin Panel
        </h1>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          
          <NavItem to="/admin/dashboard" label="Dashboard" />
          <NavItem to="/admin/add-product" label="Add Product" />
          <NavItem to="/admin/products" label="Products" />
          <NavItem to="/admin/orders" label="All Orders" />
          <NavItem to="/" label=" Go toHome" />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">

          {/* Search (hidden on very small screens) */}
          <div className="hidden sm:flex items-center bg-white/10 rounded-full px-3 py-1 border border-white/10">
            <FaSearch className="text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none px-2 text-sm w-24 text-white"
            />
          </div>

          {/* Profile */}
          <div className="relative group hidden md:block">
            <FaUserCircle className="text-2xl cursor-pointer text-gray-300 hover:text-cyan-400" />
            <div className="absolute right-0 top-0 mt-3 w-40 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all">
              {/* <button
                onClick={() => navigate("/admin/profile")}
                className="w-full px-4 py-2 text-white text-left text-sm hover:bg-white/10"
              >
                Profile
              </button> */}
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/10 flex items-center gap-2"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white text-xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 bg-black/70 backdrop-blur-xl rounded-xl border border-white/10 p-4 space-y-3">
          <NavItem to="/admin/dashboard" label="Dashboard" mobile />
          <NavItem to="/admin/add-product" label="Add Product" mobile />
          <NavItem to="/admin/products" label="Products" mobile />
          <NavItem to="/admin/orders" label="Orders" mobile />

          <hr className="border-white/10 my-2" />

          <button
            onClick={() => navigate("/admin/profile")}
            className="w-full text-left px-3 py-2 rounded-lg text-gray-300 hover:bg-white/10"
          >
            Profile
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-lg text-red-400 hover:bg-white/10 flex items-center gap-2"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

const NavItem = ({ to, label, mobile }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${
          mobile
            ? "block px-3 py-2 rounded-lg"
            : "px-3 py-2 rounded-full"
        } transition ${
          isActive
            ? "bg-cyan-500/20 text-cyan-400"
            : "text-gray-300 hover:bg-white/10"
        }`
      }
    >
      {label}
    </NavLink>
  );
};

export default AdminNavbar;
