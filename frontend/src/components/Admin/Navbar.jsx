import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
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
  const [admin, setAdmin] = useState(null);

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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/admin/profile`,
          { withCredentials: true }
        );
        setAdmin(res.data.admin || null);
      } catch {
        setAdmin(null);
      }
    };

    fetchProfile();
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200 px-4 py-3">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between">

        {/* Logo */}
        <h1
          onClick={() => navigate("/admin/dashboard")}
          className="text-xl md:text-2xl font-extrabold text-slate-900 cursor-pointer"
        >
          GadgetHome <span className="text-cyan-500">Admin</span>
        </h1>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4 text-sm font-semibold">
          
          <NavItem to="/admin/dashboard" label="Dashboard" />
          <NavItem to="/admin/add-product" label="Add Product" />
          <NavItem to="/admin/products" label="Products" />
          <NavItem to="/admin/orders" label="All Orders" />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">

          {/* Search (hidden on very small screens) */}
          {/* <div className="hidden sm:flex items-center bg-white rounded-full px-3 py-1 border border-slate-200">
            <FaSearch className="text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none px-2 text-sm w-28 text-slate-700 placeholder:text-slate-400"
            />
          </div> */}  

          {/* Profile */}

          <div className="relative group hidden md:block">
            {admin?.avatar ? (
              <img
                src={admin.avatar}
                alt="Admin"
                className="h-9 w-9 rounded-full object-cover border border-slate-200 cursor-pointer"
              />
            ) : (
              <FaUserCircle className="text-2xl cursor-pointer text-slate-600 hover:text-cyan-500" />
            )}
            <div className="absolute right-0 top-0 mt-3 w-44 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all">
              <button
                onClick={() => navigate("/admin/profile")}
                className="w-full px-4 py-2 text-slate-700 text-left text-sm hover:bg-slate-50"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-slate-700 text-xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <NavItem to="/admin/dashboard" label="Dashboard" mobile />
          <NavItem to="/admin/add-product" label="Add Product" mobile />
          <NavItem to="/admin/products" label="Products" mobile />
          <NavItem to="/admin/orders" label="Orders" mobile />

          <hr className="border-slate-200 my-2" />

          <button
            onClick={() => navigate("/admin/profile")}
            className="w-full text-left px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50"
          >
            Profile
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center gap-2"
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
            ? "bg-cyan-50 text-cyan-600 border border-cyan-100"
            : "text-slate-600 hover:bg-slate-100"
        }`
      }
    >
      {label}
    </NavLink>
  );
};

export default AdminNavbar;
