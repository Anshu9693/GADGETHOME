  import React, { useState } from "react";
  import { motion } from "framer-motion"; // Note: Changed to framer-motion for standard imports
  import axios from "axios";
  import { toast, ToastContainer } from "react-toastify";
  import { Link, useNavigate } from "react-router-dom";
  import "react-toastify/dist/ReactToastify.css";
import AuthFooter from "../../components/User/AuthFooter";

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
  const UserSignin = () => {
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
          `${import.meta.env.VITE_BACKEND_URL}/api/user/login`, // ✅ User Login Route
          { email, password },
          { withCredentials: true }
        );
        toast.success(
          res.data.message ||
          "Welcome back to GADGETHOME!");
        
        // Redirect to home or previous page after success
        setTimeout(() => {
          navigate("/user/allproducts"); 
        }, 1500);

      } catch (error) {
        toast.error(
          // error.response?.data?.message ||
          "Invalid credentials. Please try again."
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
                Sign in to your account
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div variants={fadeUp} custom={1}>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
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
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </motion.button>
            </form>

            <div className="mt-6 flex flex-col items-center gap-3 text-sm">
              <p className="text-slate-500">
                New to GADGETHOME?{" "}
                <Link to={"/user/signup"} className="font-semibold text-cyan-600 hover:text-cyan-700">
                  Create Account
                </Link>
              </p>
              <Link to="/forgot-password" size="sm" className="text-slate-500 hover:text-slate-700 transition-colors">
                Forgot your password?
              </Link>
            </div>
          </motion.div>
        </div>
        <AuthFooter />
      </>
    );
  };

  export default UserSignin;
