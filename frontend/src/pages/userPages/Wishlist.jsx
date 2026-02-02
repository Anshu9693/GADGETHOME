import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaShoppingCart, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/User/NavBar.jsx";

const Wishlist = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/wishlist`,
        { withCredentials: true }
      );
      setProducts(res.data.products || []);
    } catch (error) {
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/wishlist/remove/${id}`,
        { withCredentials: true }
      );
      toast.success("Removed from Archive");
      // UI se turant hatane ke liye
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      toast.error("Failed to remove");
    }
  };

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation();
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart/add`,
        { productId, quantity: 1 },
        { withCredentials: true }
      );
      toast.success("Added to Cart 🛒");
    } catch {
      toast.error("Please login again");
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-[#050505] text-white pt-32 pb-24 px-4 md:px-10">
        <div className="max-w-7xl mx-auto">

           <button 
              onClick={() => navigate("/user/allproducts")}
              className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-widest border border-white/10 px-6 py-3 rounded-full hover:bg-white hover:text-black transition-all"
            >
              <FaArrowLeft /> Back to Store
            </button>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[400px] rounded-[2rem] bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-[3rem]">
              <p className="text-gray-500 font-mono mb-6 uppercase tracking-widest">Database is empty</p>
              <button 
                onClick={() => navigate("/user/allproducts")}
                className="bg-cyan-500 text-black px-10 py-4 rounded-2xl font-black uppercase text-xs"
              >
                Scan Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <div
                  key={p._id}
                  onClick={() => navigate(`/user/productDetail/${p._id}`)}
                  className="group relative flex flex-col bg-[#0b0b0b] border border-white/5 rounded-[2rem] overflow-hidden hover:border-red-500/40 transition-all duration-500"
                >
                  {/* IMAGE AREA */}
                  <div className="relative h-48 md:h-56 p-4 flex items-center justify-center bg-neutral-900/30">
                    <img 
                      src={p.images?.[0]} 
                      className="max-h-full object-contain group-hover:scale-110 transition-transform duration-700" 
                      alt={p.name} 
                    />
                    
                    {/* DELETE ACTION */}
                    <button 
                      onClick={(e) => removeFromWishlist(p._id, e)}
                      className="absolute top-4 right-4 p-3 bg-red-500/10 backdrop-blur-xl border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all z-20"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>

                  {/* INFO AREA */}
                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-cyan-500 font-mono text-[9px] uppercase tracking-[0.2em] mb-1">{p.brand || "CYBER_LAB"}</p>
                    <h3 className="font-bold text-sm md:text-base line-clamp-1 group-hover:text-cyan-400 transition-colors uppercase">{p.name}</h3>
                    
                    {/* DESCRIPTION */}
                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-2 leading-relaxed h-8">
                      {p.description}
                    </p>

                    <div className="mt-auto pt-4 flex justify-between items-end border-t border-white/5">
                      <div className="flex flex-col">
                        {p.discountPrice ? (
                          <>
                            <span className="text-xs line-through text-gray-600 font-mono">₹{p.price}</span>
                            <span className="text-lg md:text-xl font-black text-cyan-400 italic">₹{p.discountPrice}</span>
                          </>
                        ) : (
                          <span className="text-lg md:text-xl font-black italic">₹{p.price?.toLocaleString()}</span>
                        )}
                      </div>
                      <button 
                        onClick={(e) => handleAddToCart(e, p._id)}
                        className="bg-white text-black p-3 rounded-xl hover:bg-cyan-500 transition-all shadow-lg active:scale-90 z-20"
                      >
                        <FaShoppingCart size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Wishlist;