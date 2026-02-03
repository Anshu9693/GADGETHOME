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

  const handleTrackClick = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const clickPos = ((e.clientX - rect.left) / rect.width) * (prices.max - prices.min) + prices.min;

  // Jo thumb click ke paas hai, use move karo
  const distMin = Math.abs(clickPos - localPrice[0]);
  const distMax = Math.abs(clickPos - localPrice[1]);

  if (distMin < distMax) {
    const newVal = Math.min(Math.round(clickPos), localPrice[1] - 500);
    setLocalPrice([newVal, localPrice[1]]);
  } else {
    const newVal = Math.max(Math.round(clickPos), localPrice[0] + 500);
    setLocalPrice([localPrice[0], newVal]);
  }
};

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
        <div className="py-6 select-none">
  {/* <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 mb-10 flex justify-between items-center">
    <span className="flex items-center gap-2">
      <span className="w-2 h-2 bg-cyan-500 rounded-full animate-ping" />
      NEURAL_PRICE_LINK
    </span>
    <span className="text-[8px] bg-cyan-500/10 px-2 py-0.5 rounded text-cyan-400 border border-cyan-500/20">ACTIVE</span>
  </p> */}

  {/* Main Container - Clickable Area */}
  <div 
    className="relative h-4 w-full flex items-center cursor-crosshair group"
    onClick={handleTrackClick}
  >
    {/* Background Track */}
    <div className="absolute h-1.5 w-full bg-white/5 rounded-full border border-white/5 overflow-hidden">
        {/* Subtle Glow beneath the track */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]" />
    </div>

    {/* Visual Active Range (The Colored Bar) */}
    <div 
      className="absolute h-1.5 bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full z-10 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-150 ease-out"
      style={{
        left: `${((localPrice[0] - prices.min) / (prices.max - prices.min)) * 100}%`,
        right: `${100 - ((localPrice[1] - prices.min) / (prices.max - prices.min)) * 100}%`
      }}
    />

    {/* Hidden Logic Inputs */}
    <input
      type="range"
      min={prices.min}
      max={prices.max}
      step="10"
      value={localPrice[0]}
      onChange={(e) => {
        const val = Math.min(Number(e.target.value), localPrice[1] - 500);
        setLocalPrice([val, localPrice[1]]);
      }}
      className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none z-30 fast-range-thumb"
    />

    <input
      type="range"
      min={prices.min}
      max={prices.max}
      step="10"
      value={localPrice[1]}
      onChange={(e) => {
        const val = Math.max(Number(e.target.value), localPrice[0] + 500);
        setLocalPrice([localPrice[0], val]);
      }}
      className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none z-30 fast-range-thumb"
    />
  </div>

  {/* Enhanced Value Display */}
  <div className="flex justify-between mt-10 gap-4">
    <div className="flex-1 bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 p-3 rounded-2xl backdrop-blur-sm group hover:border-cyan-500/50 transition-colors">
       <p className="text-[7px] text-gray-500 font-black uppercase mb-1 tracking-widest">Min_Load</p>
       <div className="flex items-baseline gap-1">
          <span className="text-[10px] text-cyan-500 font-mono">₹</span>
          <span className="text-sm font-mono font-bold text-white group-hover:text-cyan-400 transition-colors">{localPrice[0].toLocaleString()}</span>
       </div>
    </div>

    <div className="flex-1 bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 p-3 rounded-2xl backdrop-blur-sm group hover:border-cyan-500/50 transition-colors text-right">
       <p className="text-[7px] text-gray-500 font-black uppercase mb-1 tracking-widest">Max_Load</p>
       <div className="flex items-baseline gap-1 justify-end">
          <span className="text-[10px] text-cyan-500 font-mono">₹</span>
          <span className="text-sm font-mono font-bold text-white group-hover:text-cyan-400 transition-colors">{localPrice[1].toLocaleString()}</span>
       </div>
    </div>
  </div>

  <style>{`
    .fast-range-thumb::-webkit-slider-thumb {
      appearance: none;
      pointer-events: auto;
      width: 22px;
      height: 22px;
      background: #fff;
      border: 5px solid #06b6d4;
      border-radius: 50%;
      cursor: grab;
      box-shadow: 0 0 15px rgba(0,0,0,0.8), inset 0 0 5px rgba(0,0,0,0.2);
      transition: transform 0.15s cubic-bezier(0.2, 0, 0.2, 1);
    }
    
    .fast-range-thumb::-webkit-slider-thumb:active {
      cursor: grabbing;
      transform: scale(1.3);
      box-shadow: 0 0 25px rgba(6,182,212,0.6);
    }

    .fast-range-thumb:hover::-webkit-slider-thumb {
      border-color: #22d3ee;
    }
  `}</style>
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