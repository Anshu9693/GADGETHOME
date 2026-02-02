import React, { useState } from "react";
import { motion } from "motion/react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.7,
      ease: "easeOut",
    },
  }),
};


const AdminSignin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.error("Email and password are required");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/login`, // ✅ FIXED URL
        { email, password },
        { withCredentials: true }
      );

      toast.success(res.data.message || "Admin login successful!");

      // Optional redirect
      // navigate("/admin/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
      setPassword("");
      setEmail("");
      navigate("/admin/dashboard");

    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        pauseOnHover
        theme="dark"
      />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-8 text-white"
        >
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-extrabold text-center mb-8"
          >
            Admin Sign In
          </motion.h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <motion.div variants={fadeUp} custom={1} className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full bg-transparent border-b border-gray-500 py-2 text-white outline-none focus:border-cyan-400"
              />
              <label className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 text-sm transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-cyan-400 peer-valid:-top-2 peer-valid:text-xs">
                Email Address
              </label>
            </motion.div>

            {/* Password */}
            <motion.div variants={fadeUp} custom={2} className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer w-full bg-transparent border-b border-gray-500 py-2 text-white outline-none focus:border-cyan-400"
              />
              <label className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 text-sm transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-cyan-400 peer-valid:-top-2 peer-valid:text-xs">
                Password
              </label>
            </motion.div>

            {/* Submit */}
            <motion.button
              variants={fadeUp}
              custom={3}
              disabled={loading}
              className="w-full py-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold hover:scale-105 transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>

          {/* Footer */}
          {/* <p className="text-center text-sm text-gray-400 mt-6">
            Don’t have an admin account?{" "}
            <Link
              to="/admin/signup"
              className="text-cyan-400 hover:underline"
            >
              Sign up
            </Link>
          </p> */}
        </motion.div>
      </div>
    </>
  );
};

export default AdminSignin;