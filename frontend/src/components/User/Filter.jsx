import React, { useEffect, useMemo, useState } from "react";
import { FaTimes, FaFilter } from "react-icons/fa";

const uniq = (arr) => [...new Set(arr.filter(Boolean))];

const Filter = ({ products = [], onChange = () => {}, initial = {} }) => {
  const [open, setOpen] = useState(false);

  // 1. Products se options nikalna
  const brands = useMemo(() => uniq(products.map((p) => p.brand)), [products]);
  const categories = useMemo(() => uniq(products.map((p) => p.category)), [products]);

  const prices = useMemo(() => {
    const vals = products.map((p) => p.discountPrice ?? p.price ?? 0).filter((v) => typeof v === "number");
    return {
      min: vals.length ? Math.min(...vals) : 0,
      max: vals.length ? Math.max(...vals) : 100000
    };
  }, [products]);

  // 2. States
  // Humne price ke liye do states rakhi hain:
  // 'localPrice' turant move hoga (no lag)
  // 'debouncedPrice' filter apply karega (after delay)
  const [localPrice, setLocalPrice] = useState([initial.min ?? 0, initial.max ?? 100000]);
  const [selectedBrands, setSelectedBrands] = useState(initial.brands || []);
  const [selectedCategories, setSelectedCategories] = useState(initial.categories || []);

  // Sync with dynamic price changes from API
  useEffect(() => {
    if (prices.max > 0) {
      setLocalPrice([prices.min, prices.max]);
    }
  }, [prices.min, prices.max]);

  // 3. Debounce Logic: Ye lag ko khatam karega
  useEffect(() => {
    const handler = setTimeout(() => {
      onChange({
        priceRange: localPrice,
        brands: selectedBrands,
        categories: selectedCategories,
      });
    }, 400); // 400ms ka wait karega drag khatam hone ka

    return () => clearTimeout(handler);
  }, [localPrice, selectedBrands, selectedCategories]);

  const toggle = (arr, v, setFn) => {
    if (!v && v !== 0) return;
    setFn((prev) => (prev.includes(v) ? prev.filter((i) => i !== v) : [...prev, v]));
  };

  const reset = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setLocalPrice([prices.min, prices.max]);
  };

  const Panel = () => (
    <div className="bg-[#0b0b0b] border border-white/10 rounded-[2rem] p-6 w-full shadow-2xl">
      <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
        <h3 className="font-black text-lg uppercase italic tracking-tighter text-white">Sector_Filters</h3>
        <button onClick={() => setOpen(false)} className="md:hidden p-2 text-red-500"><FaTimes/></button>
      </div>

      <div className="space-y-8">
        {/* PRICE SLIDER (OPTIMIZED) */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-cyan-500 mb-4">Price Range</p>
          <div className="relative h-2 w-full bg-white/5 rounded-full mt-8">
            <input
              type="range"
              min={prices.min}
              max={prices.max}
              value={localPrice[0]}
              onChange={(e) => {
                const val = Math.min(Number(e.target.value), localPrice[1] - 1);
                setLocalPrice([val, localPrice[1]]);
              }}
              className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none z-30 range-thumb"
            />
            <input
              type="range"
              min={prices.min}
              max={prices.max}
              value={localPrice[1]}
              onChange={(e) => {
                const val = Math.max(Number(e.target.value), localPrice[0] + 1);
                setLocalPrice([localPrice[0], val]);
              }}
              className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none z-30 range-thumb"
            />
            <div 
              className="absolute h-full bg-cyan-500 rounded-full z-10 shadow-[0_0_10px_#06b6d4]"
              style={{
                left: `${((localPrice[0] - prices.min) / (prices.max - prices.min)) * 100}%`,
                right: `${100 - ((localPrice[1] - prices.min) / (prices.max - prices.min)) * 100}%`
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-gray-400 mt-6">
            <span className="bg-white/5 px-2 py-1 rounded border border-white/5">₹{localPrice[0].toLocaleString()}</span>
            <span className="bg-white/5 px-2 py-1 rounded border border-white/5">₹{localPrice[1].toLocaleString()}</span>
          </div>
        </div>

        {/* CATEGORY */}
        {categories.length > 0 && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-500 mb-3">Classification</p>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {categories.map((c) => (
                <label key={c} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(c)}
                    onChange={() => toggle(selectedCategories, c, setSelectedCategories)}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-cyan-500 transition-all cursor-pointer"
                  />
                  <span className="text-xs uppercase text-gray-400 group-hover:text-cyan-400 transition-colors">{c}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* BRAND */}
        {brands.length > 0 && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-500 mb-3">Manufacturer</p>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {brands.map((b) => (
                <label key={b} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(b)}
                    onChange={() => toggle(selectedBrands, b, setSelectedBrands)}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-cyan-500 transition-all cursor-pointer"
                  />
                  <span className="text-xs uppercase text-gray-400 group-hover:text-cyan-400 transition-colors">{b}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* RESET BUTTON */}
        <button 
          onClick={reset} 
          className="w-full py-3 rounded-xl border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
        >
          Reset System
        </button>
      </div>

      <style>{`
        .range-thumb::-webkit-slider-thumb {
          appearance: none;
          pointer-events: auto;
          width: 18px;
          height: 18px;
          background: #fff;
          border-radius: 50%;
          cursor: pointer;
          border: 3px solid #06b6d4;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
      `}</style>
    </div>
  );

  return (
    <>
      <div className="hidden md:block w-full"><Panel /></div>
      <div className="md:hidden">
        <button onClick={() => setOpen(true)} className="fixed bottom-24 right-8 z-[80] bg-white text-black w-14 h-14 rounded-full shadow-xl flex items-center justify-center">
          <FaFilter size={18} />
        </button>
        {open && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setOpen(false)} />
            <div className="relative w-full max-w-[360px]"><Panel /></div>
          </div>
        )}
      </div>
    </>
  );
};

export default Filter;