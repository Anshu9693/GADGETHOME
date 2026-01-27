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
            <motion.div variants={fadeUp} className="text-center mb-10">
              <h2 className="text-4xl font-black tracking-tighter mb-2">
                GADGET<span className="text-cyan-400">HOME</span>
              </h2>
              <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">User Login</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Email Input */}
              <motion.div variants={fadeUp} custom={1} className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" " // Keep empty for peer-placeholder-shown logic
                  className="peer w-full bg-transparent border-b-2 border-white/10 py-3 text-white outline-none focus:border-cyan-400 transition-all"
                />
                <label className="absolute left-0 top-3 text-gray-500 text-base transition-all 
                  peer-focus:-top-5 peer-focus:text-xs peer-focus:text-cyan-400 
                  peer-[:not(:placeholder-shown)]:-top-5 peer-[:not(:placeholder-shown)]:text-xs">
                  Email Address
                </label>
              </motion.div>

              {/* Password Input */}
              <motion.div variants={fadeUp} custom={2} className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  className="peer w-full bg-transparent border-b-2 border-white/10 py-3 text-white outline-none focus:border-cyan-400 transition-all"
                />
                <label className="absolute left-0 top-3 text-gray-500 text-base transition-all 
                  peer-focus:-top-5 peer-focus:text-xs peer-focus:text-cyan-400 
                  peer-[:not(:placeholder-shown)]:-top-5 peer-[:not(:placeholder-shown)]:text-xs">
                  Password
                </label>
              </motion.div>

              {/* Action Button */}
              <motion.button
                variants={fadeUp}
                custom={3}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-2xl bg-cyan-500 text-black font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Login to Account"}
              </motion.button>
            </form>

            {/* Bottom Links */}
            <div className="mt-10 flex flex-col items-center gap-4 text-sm">
              <p className="text-gray-400">
                New to GADGETHOME?{" "}
                <Link to={"/user/signup"} className="text-cyan-400 font-bold hover:underline">
                  Create Account
                </Link>
              </p>
              <Link to="/forgot-password" size="sm" className="text-gray-500 hover:text-white transition-colors">
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