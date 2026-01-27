import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "../../components/User/NavBar.jsx";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

/* ================= AXIOS INSTANCE ================= */
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  timeout: 8000,
});

const Checkout = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [shippingForm, setShippingForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  /* ================= FETCH CART ================= */
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get("/api/cart/getItems");

        const items = res.data?.cart?.items || [];

        // Normalize data for checkout UI
        const normalizedItems = items.map((item) => ({
          productId: item.product._id,
          name: item.product.name,
          brand: item.product.brand,
          image: item.product.images?.[0],
          price: item.priceAtAddTime,
          quantity: item.quantity,
        }));

        setCartItems(normalizedItems);
      } catch (err) {
        toast.error("Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  /* ================= UPDATE QUANTITY ================= */
  const updateQuantity = async (productId, newQty) => {
    if (newQty < 1) return;

    try {
      await api.put("/api/cart/updateItems", {
        productId,
        quantity: newQty,
      });

      setCartItems((prev) =>
        prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: newQty }
            : item
        )
      );
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  /* ================= REMOVE ITEM ================= */
  const removeItem = async (productId) => {
    try {
      await api.delete(`/api/cart/remove/${productId}`);
      setCartItems((prev) =>
        prev.filter((item) => item.productId !== productId)
      );
      toast.success("Item removed");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  /* ================= TOTAL ================= */
  const totalAmount = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  /* ================= PLACE ORDER ================= */
 const placeOrder = async () => {
  if (orderProcessing) return;

  // Validate shipping form
  if (
    !shippingForm.fullName ||
    !shippingForm.phone ||
    !shippingForm.address ||
    !shippingForm.city ||
    !shippingForm.state ||
    !shippingForm.pincode
  ) {
    toast.error("Please fill all shipping details");
    return;
  }

  setOrderProcessing(true);
  try {
    // 1️⃣ Place order first (Pending)
    const orderRes = await api.post("/api/order/user/place-order", {
      paymentMethod: "STRIPE",
      shippingAddress: shippingForm,
    });

    const orderId = orderRes.data.order._id;

    // 2️⃣ Create Stripe session
    const stripeRes = await api.post("/api/stripe/create-session", {
      orderId,
    });

    // 3️⃣ Redirect to Stripe
    window.location.href = stripeRes.data.url;
  } catch (err) {
    console.error("Order Error:", err); // Log error for debugging
    toast.error(err.response?.data?.message || "Payment failed");
  } finally {
    setOrderProcessing(false);
  }
};

  /* ================= LOADER ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-[#050505] text-white pt-32 px-6 md:px-12 pb-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-black mb-10">Checkout</h1>

          {cartItems.length === 0 ? (
            <p className="text-gray-400 text-center mt-20">
              Your cart is empty.
            </p>
          ) : (
            <>
              {/* SHIPPING FORM */}
              <div className="mb-10 bg-white/5 border border-white/10 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={shippingForm.fullName}
                    onChange={(e) =>
                      setShippingForm({
                        ...shippingForm,
                        fullName: e.target.value,
                      })
                    }
                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={shippingForm.phone}
                    onChange={(e) =>
                      setShippingForm({
                        ...shippingForm,
                        phone: e.target.value,
                      })
                    }
                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={shippingForm.address}
                    onChange={(e) =>
                      setShippingForm({
                        ...shippingForm,
                        address: e.target.value,
                      })
                    }
                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 md:col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={shippingForm.city}
                    onChange={(e) =>
                      setShippingForm({
                        ...shippingForm,
                        city: e.target.value,
                      })
                    }
                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={shippingForm.state}
                    onChange={(e) =>
                      setShippingForm({
                        ...shippingForm,
                        state: e.target.value,
                      })
                    }
                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={shippingForm.pincode}
                    onChange={(e) =>
                      setShippingForm({
                        ...shippingForm,
                        pincode: e.target.value,
                      })
                    }
                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              {/* ITEMS */}
              <div className="space-y-6 mb-10">
                {cartItems.map((item) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 bg-white/5 p-4 rounded-2xl border border-white/10"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-contain rounded-xl"
                    />

                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{item.name}</h3>
                      <p className="text-cyan-400 text-sm">{item.brand}</p>
                      <p className="mt-1 font-bold">₹{item.price}</p>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity - 1
                            )
                          }
                          className="w-8 h-8 bg-white/5 rounded-lg"
                        >
                          −
                        </button>
                        <span className="w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity + 1
                            )
                          }
                          className="w-8 h-8 bg-white/5 rounded-lg"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-red-500"
                    >
                      <FaTrash />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* TOTAL */}
              <div className="flex justify-between items-center bg-white/5 border border-white/10 p-6 rounded-2xl">
                <p className="text-2xl font-black">
                  Total: ₹{totalAmount.toLocaleString()}
                </p>
                <button
                  onClick={placeOrder}
                  disabled={orderProcessing}
                  className="bg-cyan-500 text-black px-8 py-4 rounded-xl font-black hover:bg-cyan-400"
                >
                  {orderProcessing ? "Processing..." : "Place Order"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Checkout;
