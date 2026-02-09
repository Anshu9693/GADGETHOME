import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaFilter, FaTimes } from "react-icons/fa";

const uniq = (arr) => [...new Set(arr.filter(Boolean))];

const CheckboxGroup = ({ title, items, value, onChange }) => (
  <div className="mt-6">
    <div className="flex items-center justify-between">
      <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">{title}</p>
      <span className="text-[10px] text-slate-400">{value.length} selected</span>
    </div>
    <div className="mt-3 grid gap-2">
      {items.map(i => {
        const active = value.includes(i);
        return (
          <label
            key={i}
            className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs transition ${
              active
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300"
            }`}
          >
            <span className="truncate">{i}</span>
            <input
              type="checkbox"
              checked={active}
              onChange={() =>
                onChange(prev =>
                  prev.includes(i)
                    ? prev.filter(x => x !== i)
                    : [...prev, i]
                )
              }
              className="h-4 w-4 accent-slate-900"
            />
          </label>
        );
      })}
    </div>
  </div>
);

const Filter = ({ products = [], onChange }) => {
  const [open, setOpen] = useState(false);
  const rangeRef = useRef(null);
  const draggingRef = useRef(false);

  /* ---------- DATA ---------- */
  const brands = useMemo(() => uniq(products.map(p => p.brand)), [products]);
  const categories = useMemo(() => uniq(products.map(p => p.category)), [products]);

  const prices = useMemo(() => {
    const vals = products.map(p => p.discountPrice ?? p.price ?? 0);
    return {
      min: Math.min(...vals, 0),
      max: Math.max(...vals, 50000),
    };
  }, [products]);

  /* ---------- STATE ---------- */
  const [price, setPrice] = useState([prices.min, prices.max]);
  const [priceDraft, setPriceDraft] = useState([prices.min, prices.max]);
  const [brandsSel, setBrandsSel] = useState([]);
  const [catSel, setCatSel] = useState([]);
  const [rating, setRating] = useState(0);
  const [stock, setStock] = useState(false);

  /* ---------- APPLY ---------- */
  useEffect(() => {
    const id = setTimeout(() => {
      onChange({
        priceRange: price,
        brands: brandsSel,
        categories: catSel,
        minRating: rating,
        inStockOnly: stock,
      });
    }, 180);
    return () => clearTimeout(id);
  }, [price, brandsSel, catSel, rating, stock]);

  const reset = () => {
    setPrice([prices.min, prices.max]);
    setPriceDraft([prices.min, prices.max]);
    setBrandsSel([]);
    setCatSel([]);
    setRating(0);
    setStock(false);
  };

  useEffect(() => {
    setPrice([prices.min, prices.max]);
    setPriceDraft([prices.min, prices.max]);
  }, [prices.min, prices.max]);

  useEffect(() => {
    const id = setTimeout(() => {
      setPrice(priceDraft);
    }, 160);
    return () => clearTimeout(id);
  }, [priceDraft]);

  const updateRangeFromPointer = (clientX, commit = false) => {
    const el = rangeRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    const clamped = Math.min(1, Math.max(0, ratio));
    const raw = prices.min + clamped * (prices.max - prices.min);
    const value = Math.round(raw);
    const next = [prices.min, value];
    setPriceDraft(next);
    if (commit) setPrice(next);
  };

  /* ---------- UI ---------- */
  const Panel = () => (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.4)]">
      <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.12)_1px,transparent_0)] bg-[size:14px_14px]" />
      <div className="pointer-events-none absolute -top-10 -right-6 h-28 w-28 rounded-full bg-amber-200/40 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-slate-200/60 blur-3xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Filters</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">Refine results</h3>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="md:hidden rounded-full border border-slate-200 bg-white/90 p-2 text-slate-500 shadow-sm transition hover:text-slate-800"
          aria-label="Close filters"
        >
          <FaTimes />
        </button>
      </div>

      {/* PRICE */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white/90 p-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Price</p>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] text-white">
            ₹ {price[0]} – ₹ {price[1]}
          </span>
        </div>
        <input
          type="range"
          min={prices.min}
          max={prices.max}
          step={1}
          value={priceDraft[1]}
          onChange={e => setPriceDraft([prices.min, Number(e.target.value)])}
          onPointerDown={e => {
            draggingRef.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            updateRangeFromPointer(e.clientX);
          }}
          onPointerMove={e => {
            if (!draggingRef.current) return;
            updateRangeFromPointer(e.clientX);
          }}
          onPointerUp={e => {
            draggingRef.current = false;
            updateRangeFromPointer(e.clientX, true);
          }}
          onPointerCancel={() => {
            draggingRef.current = false;
          }}
          ref={rangeRef}
          style={{ touchAction: "none" }}
          className="mt-4 w-full accent-slate-900"
        />
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
          <span>Min ₹ {prices.min}</span>
          <span>Max ₹ {prices.max}</span>
        </div>
      </div>

      <CheckboxGroup
        title="Category"
        items={categories}
        value={catSel}
        onChange={setCatSel}
      />

      <CheckboxGroup
        title="Brand"
        items={brands}
        value={brandsSel}
        onChange={setBrandsSel}
      />

      {/* RATING */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white/90 p-4">
        <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Min rating</p>
        <select
          value={rating}
          onChange={e => setRating(+e.target.value)}
          className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
        >
          <option value={0}>Any</option>
          <option value={4}>4+ ★</option>
          <option value={5}>5 ★</option>
        </select>
      </div>

      {/* STOCK */}
      <label className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700">
        <span className="font-medium">In stock only</span>
        <input
          type="checkbox"
          checked={stock}
          onChange={() => setStock(!stock)}
          className="h-5 w-5 accent-slate-900"
        />
      </label>

      <button
        onClick={reset}
        className="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-900 py-3 text-xs font-semibold tracking-widest text-white transition hover:bg-slate-800"
      >
        RESET FILTERS
      </button>
    </div>
  );

  return (
    <>
      <div className="hidden md:block">
        <Panel />
      </div>

      <div className="md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-6 py-3 text-sm font-semibold text-slate-800 shadow-[0_14px_30px_-12px_rgba(15,23,42,0.45)] ring-1 ring-slate-200/70 backdrop-blur"
          aria-label="Open filters"
        >
          <FaFilter />
          Filters
        </button>

        {open && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-slate-900/60"
              onClick={() => setOpen(false)}
            />
            <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-slate-200 bg-white/95 p-5 shadow-[0_-20px_60px_-30px_rgba(15,23,42,0.5)]">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
              <Panel />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Filter;
