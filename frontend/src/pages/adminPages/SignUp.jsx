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
            Admin Signup
          </motion.h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <motion.div variants={fadeUp} custom={1} className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="peer w-full bg-transparent border-b border-gray-500 py-2 text-white outline-none focus:border-cyan-400"
              />
              <label className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 text-sm transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-cyan-400 peer-valid:-top-2 peer-valid:text-xs">
                Full Name
              </label>
            </motion.div>

            {/* Email */}
            <motion.div variants={fadeUp} custom={2} className="relative">
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
            <motion.div variants={fadeUp} custom={3} className="relative">
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
              custom={4}
              disabled={loading}
              className="w-full py-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold hover:scale-105 transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Admin Account"}
            </motion.button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
                      Already have an admin account?{" "}
                      <Link
                        to="/admin/signin"
                        className="text-cyan-400 hover:underline"
                      >
                        Sign in
                      </Link>
                    </p>
        </motion.div>
      </div>
    </>
  );
};

export default AdminSignup;
