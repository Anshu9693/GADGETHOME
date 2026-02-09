import React from "react";
import Navbar from "./NavBar";

const About = () => {
  return (
    <section className="bg-white">
      <Navbar />
      <div className="relative mx-auto max-w-[1200px] px-6 pb-20 pt-24 text-slate-900">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-0 h-72 w-72 rounded-full bg-cyan-100/70 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-amber-100/70 blur-3xl" />
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">
              About GadgetHome
            </p>
            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">
              Tech that feels simple, modern, and reliable.
            </h1>
            <p className="mt-4 text-slate-600 leading-relaxed">
              We curate smart gadgets that solve daily problems without the
              confusion. Clear specs, honest pricing, and dependable support
              are built into every order.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-slate-900">10K+</p>
                <p className="text-xs text-slate-500">Customers</p>
              </div>
              <div className="rounded-2xl border border-slate-200 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-slate-900">350+</p>
                <p className="text-xs text-slate-500">Products</p>
              </div>
              <div className="rounded-2xl border border-slate-200 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-slate-900">4.8/5</p>
                <p className="text-xs text-slate-500">Avg Rating</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-3">
              <img
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80"
                alt="Team workspace"
                className="h-64 w-full rounded-2xl object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-6 hidden w-48 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg lg:block">
              <img
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80"
                alt="Smart gadget"
                className="h-24 w-full rounded-xl object-cover"
              />
              <p className="mt-2 text-xs text-slate-600">
                Carefully tested gadgets, ready for your home.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-8">
            <h2 className="text-2xl font-semibold">Our story</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              Started as a small team of gadget lovers, we focused on
              simplifying buying decisions for smart home products. Today, we
              help thousands of customers choose tech with confidence.
            </p>
            <div className="mt-6 space-y-4 border-l-2 border-slate-200 pl-5">
              {[
                "2019 — Curated our first collection of smart essentials",
                "2021 — Launched faster delivery and local support",
                "2024 — Expanded to premium smart living categories",
              ].map((item) => (
                <p key={item} className="text-sm text-slate-600">
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              {
                title: "Verified quality",
                text: "Each product is tested for durability and performance.",
              },
              {
                title: "Transparent pricing",
                text: "Clear offers, no hidden fees, and honest discounts.",
              },
              {
                title: "Reliable support",
                text: "Quick replies before and after your purchase.",
              },
              {
                title: "Future-ready",
                text: "We bring new tech that fits everyday routines.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="rounded-[28px] border border-slate-200 bg-white p-7">
            <h3 className="text-lg font-semibold">Customer reviews</h3>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <p>
                “Fast delivery and the product quality is excellent. Support
                was responsive.”
              </p>
              <p>
                “Pricing felt honest and the device matched the description
                perfectly.”
              </p>
            </div>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-7">
            <h3 className="text-lg font-semibold">Future goals</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>Launch eco-friendly packaging across all orders.</li>
              <li>Expand same-day delivery in key cities.</li>
              <li>Introduce smart bundles for home automation.</li>
            </ul>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-7">
            <h3 className="text-lg font-semibold">Our promise</h3>
            <p className="mt-4 text-sm text-slate-600">
              Shop confidently with clear specifications, trusted brands, and
              reliable after-sales support. GadgetHome is built around you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
