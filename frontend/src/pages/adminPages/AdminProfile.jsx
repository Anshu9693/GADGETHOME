// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import { motion } from "framer-motion";
// import { toast, ToastContainer } from "react-toastify";
// import {
//   FaUser,
//   FaEnvelope,
//   FaPhone,
//   FaLock,
//   FaCamera,
//   FaSave,
//   FaCog,
// } from "react-icons/fa";
// import AdminNavbar from "../../components/Admin/Navbar";
// import "react-toastify/dist/ReactToastify.css";

// const fadeUp = {
//   hidden: { opacity: 0, y: 20 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
// };

// const AdminProfile = () => {
//   const fileRef = useRef(null);

//   const [loading, setLoading] = useState(false);
//   const [imagePreview, setImagePreview] = useState(null);

//   const [form, setForm] = useState({
//     fullName: "",
//     email: "",
//     phone: "",
//     avatar: null,
//     oldPassword: "",
//     newPassword: "",
//   });

//   const [settings, setSettings] = useState({
//     emailNotifications: true,
//     orderAlerts: true,
//   });

//   /* ================= FETCH ADMIN ================= */

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const res = await axios.get(
//           `${import.meta.env.VITE_BACKEND_URL}/api/admin/profile`,
//           { withCredentials: true }
//         );

//         const admin = res.data.admin;

//         setForm((prev) => ({
//           ...prev,
//           fullName: admin.fullName,
//           email: admin.email,
//           phone: admin.phone || "",
//         }));

//         setImagePreview(admin.avatar);
//       } catch (error) {
//         toast.error("Failed to load profile");
//       }
//     };

//     fetchProfile();
//   }, []);

//   /* ================= HANDLERS ================= */

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setForm({ ...form, avatar: file });
//     setImagePreview(URL.createObjectURL(file));
//   };

//   const handleSettingToggle = (key) => {
//     setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
//   };

//   /* ================= UPDATE PROFILE ================= */

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       setLoading(true);
//       const formData = new FormData();

//       Object.entries(form).forEach(([key, value]) => {
//         if (!value) return;
//         formData.append(key, value);
//       });

//       await axios.put(
//         `${import.meta.env.VITE_BACKEND_URL}/api/admin/profile`,
//         formData,
//         { withCredentials: true }
//       );

//       toast.success("Profile updated successfully");
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Update failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <AdminNavbar />
//       <ToastContainer position="top-right" theme="dark" />

//       <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white px-6 py-10">
//         <motion.h1
//           variants={fadeUp}
//           initial="hidden"
//           animate="visible"
//           className="text-4xl font-extrabold mb-10"
//         >
//           Admin Profile
//         </motion.h1>

//         <motion.form
//           onSubmit={handleSubmit}
//           variants={fadeUp}
//           initial="hidden"
//           animate="visible"
//           className="max-w-5xl mx-auto bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-10"
//         >
//           {/* PROFILE IMAGE */}
//           <div className="flex items-center gap-6">
//             <div className="relative">
//               <img
//                 src={
//                   imagePreview ||
//                   "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//                 }
//                 alt="profile"
//                 className="w-28 h-28 rounded-full object-cover border border-white/20"
//               />

//               <button
//                 type="button"
//                 onClick={() => fileRef.current.click()}
//                 className="absolute bottom-0 right-0 bg-cyan-500 text-black p-2 rounded-full"
//               >
//                 <FaCamera />
//               </button>

//               <input
//                 ref={fileRef}
//                 type="file"
//                 accept="image/*"
//                 hidden
//                 onChange={handleImageChange}
//               />
//             </div>

//             <div>
//               <h2 className="text-2xl font-bold">{form.fullName}</h2>
//               <p className="text-gray-400">Administrator</p>
//             </div>
//           </div>

//           {/* BASIC INFO */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <Input icon={<FaUser />} name="fullName" value={form.fullName} onChange={handleChange} placeholder="Full Name" />
//             <Input icon={<FaEnvelope />} name="email" value={form.email} onChange={handleChange} placeholder="Email" />
//             <Input icon={<FaPhone />} name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
//           </div>

//           {/* PASSWORD */}
//           <div>
//             <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//               <FaLock /> Change Password
//             </h3>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <Input type="password" name="oldPassword" value={form.oldPassword} onChange={handleChange} placeholder="Old Password" />
//               <Input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} placeholder="New Password" />
//             </div>
//           </div>

//           {/* SETTINGS */}
//           <div>
//             <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//               <FaCog /> Settings
//             </h3>

//             <div className="space-y-3">
//               <Toggle
//                 label="Email Notifications"
//                 enabled={settings.emailNotifications}
//                 onToggle={() => handleSettingToggle("emailNotifications")}
//               />
//               <Toggle
//                 label="Order Alerts"
//                 enabled={settings.orderAlerts}
//                 onToggle={() => handleSettingToggle("orderAlerts")}
//               />
//             </div>
//           </div>

//           {/* SAVE */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold py-3 rounded-xl flex items-center justify-center gap-3"
//           >
//             <FaSave />
//             {loading ? "Saving..." : "Save Changes"}
//           </button>
//         </motion.form>
//       </div>
//     </>
//   );
// };

// /* ================= REUSABLE COMPONENTS ================= */

// const Input = ({ icon, ...props }) => (
//   <div className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-xl px-4 py-3">
//     <span className="text-cyan-400">{icon}</span>
//     <input
//       {...props}
//       className="bg-transparent outline-none w-full text-white placeholder-gray-400"
//     />
//   </div>
// );

// const Toggle = ({ label, enabled, onToggle }) => (
//   <div className="flex items-center justify-between">
//     <span className="text-gray-300">{label}</span>
//     <button
//       type="button"
//       onClick={onToggle}
//       className={`w-12 h-6 rounded-full transition ${
//         enabled ? "bg-cyan-500" : "bg-gray-600"
//       }`}
//     >
//       <div
//         className={`w-5 h-5 bg-black rounded-full transform transition ${
//           enabled ? "translate-x-6" : "translate-x-1"
//         }`}
//       />
//     </button>
//   </div>
// );

// export default AdminProfile;


import React from 'react'

const AdminProfile = () => {
  return (
    <div>
      Work in Progress
    </div>
  )
}

export default AdminProfile
