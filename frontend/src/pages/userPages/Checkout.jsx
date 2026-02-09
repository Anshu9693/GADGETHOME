import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "../../components/User/NavBar.jsx";
import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";
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
  const [paymentMethod, setPaymentMethod] = useState("STRIPE");
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

        const normalizedItems = items.map((item) => ({
          productId: item.product._id,
          name: item.product.name,
          brand: item.product.brand,
          image: item.product.images?.[0],
          price: item.priceAtAddTime ?? item.product.discountPrice ?? item.product.price,
          quantity: item.quantity,
        }));

        setCartItems(normalizedItems);
      } catch {
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
      if (paymentMethod === "COD") {
        await api.post("/api/order/user/place-order", {
          paymentMethod: "COD",
          shippingAddress: shippingForm,
        });
        toast.success("Order placed with Cash on Delivery");
        navigate("/user/myorders");
      } else {
        const orderRes = await api.post("/api/order/user/place-order", {
          paymentMethod: "STRIPE",
          shippingAddress: shippingForm,
        });

        const orderId = orderRes.data.order._id;
        const stripeRes = await api.post("/api/stripe/create-session", {
          orderId,
        });

        window.location.href = stripeRes.data.url;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally {
      setOrderProcessing(false);
    }
  };

  /* ================= LOADER ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-[#f7f7f5]">
        <main className="relative mx-auto max-w-[1200px] px-6 pb-24 pt-24">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.12)_1px,transparent_0)] bg-[size:14px_14px]" />
            <div className="absolute -top-12 -right-10 h-40 w-40 rounded-full bg-amber-200/40 blur-2xl" />
            <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-slate-200/60 blur-3xl" />
          </div>

          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Checkout</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">Complete your order</h1>
          </div>

          {cartItems.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white/90 py-24 text-center text-slate-500">
              Your cart is empty.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                {/* SHIPPING FORM */}
                <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Shipping address</h2>
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
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-300"
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
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-300"
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
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-300 md:col-span-2"
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
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-300"
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
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-300"
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
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-300"
                    />
                  </div>
                </div>

                {/* PAYMENT */}
                <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment method</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("STRIPE")}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        paymentMethod === "STRIPE"
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <p className="text-sm font-semibold">Online Payment</p>
                      <p className="text-xs opacity-70">Pay via card/UPI</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("COD")}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        paymentMethod === "COD"
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <p className="text-sm font-semibold">Cash on Delivery</p>
                      <p className="text-xs opacity-70">Pay at your doorstep</p>
                    </button>
                  </div>
                </div>

                {/* ITEMS */}
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.productId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4 rounded-3xl border border-slate-200 bg-white/95 p-4"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-24 w-24 object-contain rounded-2xl bg-slate-100 p-2"
                      />

                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-slate-900">{item.name}</h3>
                        <p className="text-sm text-slate-500">{item.brand}</p>
                        <p className="mt-1 font-semibold text-slate-900">₹{item.price}</p>

                        <div className="mt-2 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="h-8 w-8 rounded-lg text-slate-600 hover:text-slate-900"
                          >
                            <FaMinus size={10} />
                          </button>
                          <span className="w-8 text-center text-sm text-slate-700">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="h-8 w-8 rounded-lg text-slate-600 hover:text-slate-900"
                          >
                            <FaPlus size={10} />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-600 transition hover:border-rose-300 hover:bg-rose-100"
                      >
                        <FaTrash />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* SUMMARY */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]">
                  <h3 className="text-lg font-semibold text-slate-900 mb-5">Summary</h3>

                  <div className="space-y-3 text-sm text-slate-500 mb-6">
                    <div className="flex justify-between">
                      <span>Items</span>
                      <span className="text-slate-900">{cartItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span className="text-slate-900">₹0</span>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex justify-between">
                      <span className="text-slate-900 font-semibold">Total</span>
                      <span className="text-xl text-slate-900 font-semibold">
                        ₹{totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={placeOrder}
                    disabled={orderProcessing}
                    className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    {orderProcessing ? "Processing..." : "Place order"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Checkout;
