import React from "react";
import { Link } from "react-router-dom";
import { FaShieldAlt, FaEnvelope } from "react-icons/fa";

const AuthFooter = () => {
  return (
    <footer className="w-full bg-[#050505]/90 backdrop-blur-xl border-t border-white/10 px-6 py-5">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">

        {/* Top Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

          {/* Brand */}
          <div className="text-[11px] text-gray-500 flex items-center gap-2">
            <span className="font-semibold text-white">
              GADGET<span className="text-cyan-400">HOME</span>
            </span>
            <span>© {new Date().getFullYear()}</span>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-4 text-[11px] text-gray-500">
            <Link to="/privacy" className="hover:text-cyan-400 transition">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-cyan-400 transition">
              Terms
            </Link>
            <Link to="/help" className="hover:text-cyan-400 transition">
              Help
            </Link>
            <Link to="/admin/signin" className="hover:text-cyan-400 transition">
              Admin
            </Link>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5 pt-3">

          {/* Security Trust */}
          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <FaShieldAlt className="text-cyan-400 text-xs" />
            <span>Secure login • Encrypted authentication</span>
          </div>

          {/* Support */}
          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <FaEnvelope className="text-cyan-400 text-xs" />
            <span>support@gadgethome.com</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default AuthFooter;
