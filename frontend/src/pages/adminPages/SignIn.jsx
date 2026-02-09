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
        theme="light"
      />

      <div className="min-h-screen bg-[#f5f7fb] px-4 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl"
        >
          <div className="grid gap-0 md:grid-cols-[1.1fr_1fr]">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-10 py-12 text-white">
              <motion.h2
                variants={fadeUp}
                className="text-3xl font-bold"
              >
                Welcome Back, Admin
              </motion.h2>
              <p className="mt-4 text-sm text-slate-300">
                Sign in to manage inventory, track orders, and keep
                GadgetHome running smoothly.
              </p>

              <ul className="mt-8 space-y-4 text-sm text-slate-200">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400"></span>
                  Monitor real-time order flow and cancellations.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400"></span>
                  Keep featured products and pricing up to date.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400"></span>
                  Secure access for approved admin accounts only.
                </li>
              </ul>

              <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
                Tip: Use a private browser or secure network for admin access.
              </div>
            </div>

            <div className="px-10 py-12">
              <motion.h3
                variants={fadeUp}
                className="text-2xl font-semibold text-slate-900"
              >
                Admin Sign In
              </motion.h3>
              <p className="mt-2 text-sm text-slate-500">
                Enter your admin credentials to continue.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <motion.div variants={fadeUp} custom={1}>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@gadgethome.com"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                  />
                </motion.div>

                <motion.div variants={fadeUp} custom={2}>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                  />
                </motion.div>

                <motion.button
                  variants={fadeUp}
                  custom={3}
                  disabled={loading}
                  className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </motion.button>
              </form>

              <p className="mt-6 text-sm text-slate-500">
                Don’t have an admin account?{" "}
                <Link
                  to="/admin/signup"
                  className="font-semibold text-cyan-600 hover:text-cyan-700"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AdminSignin;
