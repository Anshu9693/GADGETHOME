import React from "react";
import { motion } from "framer-motion";
import {
  FaShoppingCart,
  FaHeart,
  FaRegHeart,
  FaShareAlt,
} from "react-icons/fa";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const ProductCard = ({
  product,
  wishlist,
  onWishlistToggle,
  onAddToCart,
  onShare,
  onOpen,
  showDescription = true,
  showRating = true,
  showCategory = true,
}) => {
  const hasDiscount = Boolean(product.discountPrice);
  const rating = product.ratings ?? product.rating ?? 0;
  const outOfStock = (product.stock ?? 0) <= 0;
  const basePrice = product.price ?? 0;
  const discountPrice = product.discountPrice ?? 0;
  const discountPercent = hasDiscount && basePrice > 0
    ? Math.round(((basePrice - discountPrice) / basePrice) * 100)
    : 0;

  return (
    <motion.div
      variants={cardVariants}
      layout="position"
      whileHover={{ y: -6 }}
      onClick={onOpen}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.45)] transition-all duration-300 hover:shadow-[0_22px_60px_-30px_rgba(15,23,42,0.55)] cursor-pointer"
    >
      {/* IMAGE */}
      <div className="relative h-60 overflow-hidden bg-slate-100">
        {hasDiscount && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">
            {discountPercent}% off
          </span>
        )}

        <img
          src={product.images?.[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* ACTIONS */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
          <button
            onClick={(e) => onWishlistToggle(e, product._id)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
            aria-label="toggle wishlist"
          >
            {wishlist.includes(product._id) ? (
              <FaHeart className="text-rose-500" />
            ) : (
              <FaRegHeart />
            )}
          </button>

          {onShare && (
            <button
              onClick={(e) => onShare(e, product._id)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
              aria-label="share product"
            >
              <FaShareAlt size={12} />
            </button>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
              {product.brand}
            </span>
            <h3 className="mt-1 line-clamp-1 text-lg font-semibold text-slate-900">
              {product.name}
            </h3>
          </div>
          <div className="text-right">
            {showRating && (
              <div className="text-xs text-slate-500">
                {rating.toFixed(1)} <span className="text-amber-500">★</span>
              </div>
            )}
            {outOfStock ? (
              <div className="mt-1 rounded-full bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-600">
                Out of stock
              </div>
            ) : (
              <div className="mt-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600">
                In stock
              </div>
            )}
          </div>
        </div>

        {showDescription && (
          <p className="line-clamp-2 text-sm text-slate-500">
            {product.description}
          </p>
        )}
        {showCategory && product.category && (
          <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-slate-400">
            {product.category}
          </p>
        )}

        {/* FOOTER */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            {hasDiscount ? (
              <div>
                <span className="text-xl font-semibold text-slate-900">
                  ₹{discountPrice.toLocaleString()}
                </span>
                <span className="block text-xs text-slate-400 line-through">
                  ₹{basePrice.toLocaleString()}
                </span>
              </div>
            ) : (
              <span className="text-xl font-semibold text-slate-900">
                ₹{basePrice.toLocaleString()}
              </span>
            )}
          </div>

          <button
            onClick={(e) => onAddToCart(e, product._id)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md transition hover:bg-slate-800 active:scale-95"
            aria-label="add to cart"
          >
            <FaShoppingCart />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
