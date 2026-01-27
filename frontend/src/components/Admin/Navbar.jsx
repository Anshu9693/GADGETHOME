import React from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaFire,
  FaBoxOpen,
  FaList,
  FaShoppingCart,
  FaSearch,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import axios from "axios";

const AdminNavbar = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/admin/logout`, { withCredentials: true });
            navigate("/admin/signin");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

  return (
    <nav className="sticky top-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/10 px-6 py-4">
      <div className="flex items-center justify-between">

        {/* Logo */}
        <h1 
        onClick={()=>{
            navigate("/admin/dashboard");
        }} className="text-2xl font-extrabold text-cyan-400 cursor-pointer">
          Admin Panel
        </h1>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <NavItem to="/admin/dashboard" icon={<FaBoxOpen />} label="Dashbord" />
          <NavItem to="/admin/add-product" icon={<FaPlus />} label="Add Product" />
          <NavItem to="/admin/products" icon={<FaBoxOpen />} label="Products" />
          <NavItem to="/admin/orders" icon={<FaShoppingCart />} label="Orders" />
          {/* <NavItem to="/admin/categories" icon={<FaList />} label="Categories" /> */}
          {/* <NavItem to="/admin/best-selling" icon={<FaFire />} label="Best Selling" /> */}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">

          {/* Search */}
          <div className="hidden sm:flex items-center bg-white/10 rounded-full px-3 py-1 border border-white/10">
            <FaSearch className="text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none px-2 text-sm w-28 text-white"
            />
          </div>

          {/* Profile */}
          <div className="relative group">
            <FaUserCircle className="text-2xl cursor-pointer text-gray-300 hover:text-cyan-400" />

            {/* Dropdown */}
            <div className="absolute right-0 mt-3 w-40 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all">
              <button onClick={()=>{
                navigate("/admin/profile")
              }} className="w-full px-4 py-2 text-white text-left text-sm hover:bg-white/10">
                Profile
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/10 flex items-center gap-2" 
              onClick={()=>{handleLogout()}}>
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};

const NavItem = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-full transition ${
          isActive
            ? "bg-cyan-500/20 text-cyan-400"
            : "text-gray-300 hover:bg-white/10"
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

export default AdminNavbar;
