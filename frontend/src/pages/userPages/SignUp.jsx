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
        theme="dark"
      />

      <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="w-full max-w-md rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-10 text-white shadow-2xl"
        >
          {/* Header */}
          <motion.div variants={fadeUp} className="text-center mb-10">
            <h2 className="text-4xl font-black tracking-tighter mb-2">
              GADGET<span className="text-cyan-400">HOME</span>
            </h2>
            <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">
              Create Account
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Full Name */}
            <motion.div variants={fadeUp} custom={1} className="relative">
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder=" "
                required
                className="peer w-full bg-transparent border-b-2 border-white/10 py-3 text-white outline-none focus:border-cyan-400 transition-all"
              />
              <label className="absolute left-0 top-3 text-gray-500 transition-all 
                peer-focus:-top-5 peer-focus:text-xs peer-focus:text-cyan-400 
                peer-[:not(:placeholder-shown)]:-top-5 peer-[:not(:placeholder-shown)]:text-xs">
                Full Name
              </label>
            </motion.div>

            {/* Email */}
            <motion.div variants={fadeUp} custom={2} className="relative">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder=" "
                required
                className="peer w-full bg-transparent border-b-2 border-white/10 py-3 text-white outline-none focus:border-cyan-400 transition-all"
              />
              <label className="absolute left-0 top-3 text-gray-500 transition-all 
                peer-focus:-top-5 peer-focus:text-xs peer-focus:text-cyan-400 
                peer-[:not(:placeholder-shown)]:-top-5 peer-[:not(:placeholder-shown)]:text-xs">
                Email Address
              </label>
            </motion.div>

            {/* Password */}
            <motion.div variants={fadeUp} custom={3} className="relative">
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder=" "
                required
                className="peer w-full bg-transparent border-b-2 border-white/10 py-3 text-white outline-none focus:border-cyan-400 transition-all"
              />
              <label className="absolute left-0 top-3 text-gray-500 transition-all 
                peer-focus:-top-5 peer-focus:text-xs peer-focus:text-cyan-400 
                peer-[:not(:placeholder-shown)]:-top-5 peer-[:not(:placeholder-shown)]:text-xs">
                Password
              </label>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              variants={fadeUp}
              custom={4}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-2xl bg-cyan-500 text-black font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </motion.button>
          </form>

          {/* Bottom Links */}
          <div className="mt-10 text-center text-sm">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link
                to="/user/signin"
                className="text-cyan-400 font-bold hover:underline"
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
