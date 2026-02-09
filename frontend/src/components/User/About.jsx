import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./NavBar";

const About = () => {
  const stats = [
    { value: "12K+", label: "Happy customers" },
    { value: "400+", label: "Gadgets curated" },
    { value: "25+", label: "Cities delivered" },
    { value: "4.8/5", label: "Average rating" },
  ];

  return (
    <section className="bg-white">
      <Navbar />

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-0 h-72 w-72 rounded-full bg-cyan-100/70 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-amber-100/70 blur-3xl" />
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.06)_1px,transparent_0)] bg-[size:18px_18px]" />
        </div>

        <div className="mx-auto max-w-[1200px] px-6 pb-16 pt-28 text-slate-900">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.4em] text-slate-500">
              About GadgetHome
            </p>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight">
              About <span className="text-cyan-500">Gadget</span>
              <span className="text-slate-900">Home</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg text-slate-600">
              We bring smart gadgets that feel effortless to use. Clear specs,
              fair prices, and reliable support so you can upgrade your home
              with confidence.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold">Our story</h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                GadgetHome started with a simple idea: make modern tech easy to
                choose and easy to love. We focus on products that solve real
                problems, backed by honest guidance and dependable after-sales
                care.
              </p>
              <div className="mt-6 space-y-3 border-l-2 border-slate-200 pl-5 text-sm text-slate-600">
                <p>2019 - Curated our first smart home essentials.</p>
                <p>2022 - Expanded to lifestyle tech and wearables.</p>
                <p>2025 - Reached nationwide delivery with faster support.</p>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-3">
              <img
                src="/shop.png"
                alt="Smart gadgets"
                className="h-full max-h-[360px] w-full rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-14">
          <h3 className="text-center text-lg font-semibold tracking-[0.35em] text-slate-700">
            GADGETHOME BY THE NUMBERS
          </h3>
          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-center"
              >
                <p className="text-3xl font-extrabold text-amber-500">
                  {item.value}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-slate-500">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden bg-slate-50">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
          <p className="text-xl md:text-2xl font-extrabold uppercase tracking-widest text-slate-900">
            Ready to upgrade your home?
          </p>
          <Link
            to="/user/allproducts"
            className="rounded-full bg-black px-8 py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:bg-slate-900"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    </section>
  );
};

export default About;

