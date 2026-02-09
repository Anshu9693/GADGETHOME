import React, { useState } from "react";
import { motion } from "motion/react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

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

const AdminSignup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !password) {
      return toast.error("All fields are required");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/signup`,
        { fullName, email, password },
        { withCredentials: true }
      );

      toast.success(
        res.data.message || "Admin account created successfully!"
      );

      setFullName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
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
                Create Admin Account
              </motion.h2>
              <p className="mt-4 text-sm text-slate-300">
                Manage products, orders, and customers from a secure,
                streamlined dashboard built for GadgetHome.
              </p>

              <ul className="mt-8 space-y-4 text-sm text-slate-200">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400"></span>
                  Full control over inventory, pricing, and featured sections.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400"></span>
                  Track live orders, cancellations, and customer updates.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400"></span>
                  Secure access with role-based admin permissions.
                </li>
              </ul>

              <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
                Tip: Use a strong password and keep admin access limited.
              </div>
            </div>

            <div className="px-10 py-12">
              <motion.h3
                variants={fadeUp}
                className="text-2xl font-semibold text-slate-900"
              >
                Admin Signup
              </motion.h3>
              <p className="mt-2 text-sm text-slate-500">
                Fill in the details to create a new admin account.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <motion.div variants={fadeUp} custom={1}>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                  />
                </motion.div>

                <motion.div variants={fadeUp} custom={2}>
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

                <motion.div variants={fadeUp} custom={3}>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                  />
                </motion.div>

                <motion.button
                  variants={fadeUp}
                  custom={4}
                  disabled={loading}
                  className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {loading ? "Creating..." : "Create Admin Account"}
                </motion.button>
              </form>

              <p className="mt-6 text-sm text-slate-500">
                Already have an admin account?{" "}
                <Link
                  to="/admin/signin"
                  className="font-semibold text-cyan-600 hover:text-cyan-700"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AdminSignup;
