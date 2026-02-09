import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

/* ================= ANIMATION ================= */

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

const UserSignup = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { fullName, email, password } = form;

    if (!fullName || !email || !password) {
      return toast.error("All fields are required");
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/signup`,
        { fullName, email, password },
        { withCredentials: true }
      );

      toast.success(
        res.data.message || "Account created successfully 🎉"
      );

      setTimeout(() => {
        navigate("/user/allproducts");
      }, 1500);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Signup failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        theme="light"
      />

      <div className="min-h-screen bg-[#f6f7fb] px-4 py-14">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl"
        >
          <motion.div variants={fadeUp} className="text-center mb-8">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">
              GADGET<span className="text-cyan-500">HOME</span>
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Create your account
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={fadeUp} custom={1}>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
              />
            </motion.div>

            <motion.div variants={fadeUp} custom={2}>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
              />
            </motion.div>

            <motion.div variants={fadeUp} custom={3}>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
              />
            </motion.div>

            <motion.button
              variants={fadeUp}
              custom={4}
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-slate-500">
              Already have an account?{" "}
              <Link
                to="/user/signin"
                className="font-semibold text-cyan-600 hover:text-cyan-700"
              >
                Login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default UserSignup;
