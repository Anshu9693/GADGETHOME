import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaCamera,
  FaSave,
} from "react-icons/fa";
import NavBar from "../../components/User/NavBar.jsx";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const UserProfile = () => {
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    avatar: null,
    oldPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/profile`,
          { withCredentials: true }
        );
        const user = res.data.user;
        setForm((prev) => ({
          ...prev,
          fullName: user.fullName || "",
          email: user.email || "",
          phone: user.phone || "",
        }));
        setImagePreview(user.avatar || null);
      } catch {
        toast.error("Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, avatar: file });
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (!value) return;
        formData.append(key, value);
      });

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/profile`,
        formData,
        { withCredentials: true }
      );
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-[#f7f7f5] text-slate-900">
        <main className="relative mx-auto max-w-[1200px] px-6 pb-24 pt-24">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.12)_1px,transparent_0)] bg-[size:14px_14px]" />
            <div className="absolute -top-12 -right-10 h-40 w-40 rounded-full bg-cyan-200/40 blur-2xl" />
            <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-slate-200/60 blur-3xl" />
          </div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-4xl font-extrabold mb-10"
          >
            My Profile
          </motion.h1>

          <motion.form
            onSubmit={handleSubmit}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-white border border-slate-200 rounded-3xl p-8 space-y-10 shadow-sm"
          >
            {/* PROFILE IMAGE */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={
                    imagePreview ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt="profile"
                  className="w-28 h-28 rounded-full object-cover border border-slate-200"
                />

                <button
                  type="button"
                  onClick={() => fileRef.current.click()}
                  className="absolute bottom-0 right-0 bg-slate-900 text-white p-2 rounded-full"
                >
                  <FaCamera />
                </button>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold">{form.fullName || "User"}</h2>
                <p className="text-slate-500">Customer</p>
              </div>
            </div>

            {/* BASIC INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input icon={<FaUser />} name="fullName" value={form.fullName} onChange={handleChange} placeholder="Full Name" />
              <Input icon={<FaEnvelope />} name="email" value={form.email} onChange={handleChange} placeholder="Email" />
              <Input icon={<FaPhone />} name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
            </div>

            {/* PASSWORD */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaLock /> Change Password
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input type="password" name="oldPassword" value={form.oldPassword} onChange={handleChange} placeholder="Old Password" />
                <Input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} placeholder="New Password" />
              </div>
            </div>

            {/* SAVE */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-3"
            >
              <FaSave />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </motion.form>
        </main>
      </div>
    </>
  );
};

const Input = ({ icon, ...props }) => (
  <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
    <span className="text-cyan-600">{icon}</span>
    <input
      {...props}
      className="bg-transparent outline-none w-full text-slate-900 placeholder:text-slate-400"
    />
  </div>
);

export default UserProfile;
