import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaMinus,
  FaTrash,
  FaShoppingCart,
  FaArrowLeft,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/User/NavBar.jsx";

/* ================= AXIOS ================= */
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  timeout: 8000,
});

const getProductId = (item) =>
  item?.product?._id || item?.productId || item?.product || item?._id;

const getUnitPrice = (item, product) =>
  Number(item?.priceAtAddTime ?? product?.discountPrice ?? product?.price ?? 0);

const normalizeCart = (cartData, cacheRef) => {
  const items = cartData?.items ?? [];
  if (cacheRef) {
    items.forEach((i) => {
      if (i?.product && typeof i.product === "object") {
        const id = getProductId(i);
        if (id) cacheRef.current.set(id, i.product);
      }
    });
  }

  const totalItems =
    cartData?.totalItems ?? items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const totalPrice =
    cartData?.totalPrice ??
    items.reduce((sum, i) => {
      const product =
        (i?.product && typeof i.product === "object") ? i.product : undefined;
      return sum + getUnitPrice(i, product) * (i.quantity || 0);
    }, 0);

  return { items, totalItems, totalPrice };
};

const mergeCart = (prevCart, nextCart, cacheRef) => {
  const prevMap = new Map(prevCart.items.map((i) => [getProductId(i), i]));
  const nextItems = (nextCart?.items ?? []).map((i) => {
    const id = getProductId(i);
    const prev = prevMap.get(id);
    const product =
      (i?.product && typeof i.product === "object") ? i.product : prev?.product;

    return {
      ...prev,
      ...i,
      product,
      productId: id,
    };
  });

  return normalizeCart({
    items: nextItems,
    totalItems: nextCart?.totalItems,
    totalPrice: nextCart?.totalPrice,
  }, cacheRef);
};

const Cart = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalPrice: 0 });
  const [busy, setBusy] = useState({});
  const pendingTimers = useRef({});
  const productCache = useRef(new Map());

  /* ================= FETCH CART ================= */
  const fetchCart = async () => {
    try {
      const res = await api.get("/api/cart/getItems");
      setCart(normalizeCart(res.data.cart || {}, productCache));
      window.dispatchEvent(new Event("cart-updated"));
    } catch {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    return () => {
      Object.values(pendingTimers.current).forEach((t) => clearTimeout(t));
    };
  }, []);

  /* ================= UPDATE QUANTITY ================= */
  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;

    setCart((prev) => {
      const items = prev.items.map((item) =>
        getProductId(item) === productId ? { ...item, quantity } : item
      );
      return normalizeCart({ items }, productCache);
    });

    if (pendingTimers.current[productId]) {
      clearTimeout(pendingTimers.current[productId]);
    }

    pendingTimers.current[productId] = setTimeout(async () => {
      setBusy((p) => ({ ...p, [productId]: true }));
      try {
        const res = await api.put("/api/cart/updateItems", {
          productId,
          quantity,
        });
        setCart((prev) => mergeCart(prev, res.data.cart, productCache));
        await fetchCart();
        window.dispatchEvent(new Event("cart-updated"));
      } catch {
        toast.error("Quantity update failed");
        fetchCart();
      } finally {
        setBusy((p) => ({ ...p, [productId]: false }));
      }
    }, 250);
  };

  /* ================= REMOVE ITEM ================= */
  const removeItem = async (productId) => {
    if (busy[productId]) return;

    setBusy((p) => ({ ...p, [productId]: true }));

    setCart((prev) => {
      const items = prev.items.filter((item) => getProductId(item) !== productId);
      return normalizeCart({ items }, productCache);
    });

    try {
      const res = await api.delete(`/api/cart/remove/${productId}`);
      setCart((prev) => mergeCart(prev, res.data.cart, productCache));
      toast.success("Item removed");
      await fetchCart();
      window.dispatchEvent(new Event("cart-updated"));
    } catch {
      toast.error("Failed to remove item");
      fetchCart();
    } finally {
      setBusy((p) => ({ ...p, [productId]: false }));
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <NavBar />
      <main className="relative mx-auto max-w-[1400px] px-6 pb-24 pt-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.12)_1px,transparent_0)] bg-[size:14px_14px]" />
          <div className="absolute -top-12 -right-10 h-40 w-40 rounded-full bg-amber-200/40 blur-2xl" />
          <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-slate-200/60 blur-3xl" />
        </div>

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-full border border-slate-200 bg-white p-3 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              <FaArrowLeft size={14} />
            </button>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Cart</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">Your items</h2>
              <p className="mt-1 text-[12px] text-slate-500">{cart.totalItems} items</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-3xl border border-slate-200 bg-white/90 py-24 text-center text-slate-500"
                >
                  <FaShoppingCart size={36} className="mx-auto mb-4" />
                  Cart is empty
                </motion.div>
              ) : (
                cart.items.map((item) => {
                  const productId = getProductId(item);
                  const product =
                    (item?.product && typeof item.product === "object")
                      ? item.product
                      : productCache.current.get(productId);
                  const price = getUnitPrice(item, product);
                  const lineTotal = price * (item.quantity || 0);
                  const isBusy = busy[productId];

                  return (
                    <motion.div
                      key={productId}
                      layout="position"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`relative flex gap-5 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.35)] ${
                        isBusy ? "opacity-60" : ""
                      }`}
                    >
                      {/* IMAGE */}
                      <img
                        src={product?.images?.[0] || item.image}
                        className="h-24 w-24 rounded-2xl bg-slate-100 object-contain p-3 cursor-pointer"
                        onClick={() => productId && navigate(`/user/productDetail/${productId}`)}
                      />

                      {/* DETAILS */}
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-slate-900">
                          {product?.name || item.name || "Product"}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          ₹{price.toLocaleString()}
                          {product?.discountPrice && (
                            <span className="ml-2 text-xs text-slate-400 line-through">
                              ₹{Number(product.price).toLocaleString()}
                            </span>
                          )}
                        </p>

                        {/* QUANTITY */}
                        <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(productId, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isBusy}
                            className="rounded-lg p-2 text-slate-600 transition hover:text-slate-900 disabled:opacity-40"
                            aria-label="Decrease quantity"
                          >
                            <FaMinus size={10} />
                          </button>

                          <span className="w-6 text-center text-xs font-semibold text-slate-700">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => updateQuantity(productId, item.quantity + 1)}
                            disabled={isBusy}
                            className="rounded-lg p-2 text-slate-600 transition hover:text-slate-900 disabled:opacity-40"
                            aria-label="Increase quantity"
                          >
                            <FaPlus size={10} />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <span className="text-sm font-semibold text-slate-900">
                          ₹{lineTotal.toLocaleString()}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeItem(productId)}
                          disabled={isBusy}
                          className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:border-rose-300 hover:bg-rose-100 disabled:opacity-40"
                          aria-label="Remove item"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* SUMMARY */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]">
              <h3 className="text-lg font-semibold text-slate-900 mb-5">Summary</h3>

              <div className="space-y-3 text-sm text-slate-500 mb-6">
                <div className="flex justify-between">
                  <span>Items</span>
                  <span className="text-slate-900">{cart.totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="text-slate-900">₹0</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between">
                  <span className="text-slate-900 font-semibold">Total</span>
                  <span className="text-xl text-slate-900 font-semibold">
                    ₹{Number(cart.totalPrice || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                disabled={cart.items.length === 0}
                onClick={() => navigate("/user/checkout")}
                className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                Proceed to checkout
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cart;
