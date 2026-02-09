import React from "react";
import { useNavigate } from "react-router-dom";

const categories = [
  {
    title: "Smart Lighting",
    image:
      "https://images.unsplash.com/photo-1606170033648-5d55a3edf314?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    path: "/user/Category/smartlighting",
  },
  {
    title: "Entertainment",
    image:
      "entertenment.png",
    path: "/user/Category/entertainment",
  },
  {
    title: "Home Security",
    image:
      "homesecurity.jpg",
    path: "/user/Category/homesecurity",
  },
  {
    title: "Kitchen Gadgets",
    image:
      "kitchen.png",
    path: "/user/Category/kitchen",
  },
  {
    title: "Wearables",
    image:
      "wearable.jpg",
    path: "/user/Category/wearables",
  },
];

const ShopByCategories = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4">
            <span className="h-10 w-[2px] bg-slate-900"></span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
              Shop by <span className="text-cyan-500">Categories</span>
            </h2>
          </div>
          {/* <p className="mt-4 text-slate-500 italic">
            Curated smart-home collections designed for modern living.
          </p> */}
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {categories.map(category => (
            <div
              key={category.title}
              onClick={() => navigate(category.path)}
              className="group relative cursor-pointer overflow-hidden rounded-[28px] shadow-[0_16px_40px_-30px_rgba(15,23,42,0.55)]"
            >
              <img
                src={category.image}
                alt={category.title}
                className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
              <div className="absolute bottom-5 left-5">
                <span className="text-lg font-bold uppercase tracking-wider text-white">
                  {category.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByCategories;
