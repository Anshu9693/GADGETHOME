import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Wishlist = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/wishlist`,
        { withCredentials: true }
      );
      setProducts(res.data.products || []);
    } catch (error) {
      toast.error("Failed to load wishlist");
    }
  };

  const removeFromWishlist = async (id, e) => {
    e.stopPropagation(); // 🔥 prevent navigation on button click
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/wishlist/remove/${id}`,
        { withCredentials: true }
      );
      toast.success("Removed from wishlist");
      fetchWishlist();
    } catch {
      toast.error("Failed to remove");
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-black mb-8">My Wishlist ❤️</h1>

      {products.length === 0 ? (
        <p className="text-gray-400">Your wishlist is empty</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((p) => (
            <div
              key={p._id}
              onClick={() => navigate(`/user/productDetail/${p._id}`)}
              className="bg-white/5 p-6 rounded-3xl border border-white/10 
                         cursor-pointer hover:border-cyan-500 transition-all"
            >
              <img
                src={p.images?.[0]}
                alt={p.name}
                className="h-48 w-full object-cover rounded-xl mb-4"
              />

              <h3 className="font-semibold text-lg">{p.name}</h3>
              <p className="text-cyan-400 font-black mb-4">
                ₹{p.price.toLocaleString()}
              </p>

              <button
                onClick={(e) => removeFromWishlist(p._id, e)}
                className="bg-red-500 px-4 py-2 rounded-xl flex items-center gap-2
                           hover:bg-red-600 transition-all"
              >
                <FaTrash /> Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
