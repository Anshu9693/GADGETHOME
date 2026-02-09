import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";

const VisitStore = () => {
  return (
    <section className="w-full bg-[#f5f5f5] py-16 px-6">
      <div className="max-w-7xl mx-auto bg-white rounded-[32px] shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* LEFT IMAGE */}
          <div className="h-[260px] lg:h-[420px]">
            <img
              src="shop.png"
              alt="Smart Home Experience Store"
              className="w-full h-full object-cover"
            />
          </div>

          {/* RIGHT CONTENT */}
          <div className="flex flex-col justify-center px-8 py-10 lg:px-14">

            {/* ICON */}
            <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center mb-5">
              <FaMapMarkerAlt className="text-slate-700 text-lg" />
            </div>

            {/* HEADING */}
            <h2 className="text-3xl lg:text-4xl font-serif font-semibold text-slate-900 leading-tight">
              Experience Smart Living
              <br />
              Visit Our Experience Stores
            </h2>

            {/* DESCRIPTION */}
            <p className="mt-5 text-slate-600 text-base leading-relaxed max-w-xl">
              See smart home technology come to life. Explore our range of
              intelligent gadgets and electronic solutions, experience seamless
              automation, and get expert guidance to build a smarter, safer,
              and more connected home.
            </p>

            {/* BUTTON */}
            <a
              href="https://www.google.com/search?q=GadgetHome+near+me"
              target="_blank"
              rel="noreferrer"
              className="mt-8 w-fit px-9 py-3.5 rounded-full bg-slate-900 text-white
                         text-base font-medium hover:bg-slate-800 transition shadow-lg"
            >
              Find a Store Near You
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisitStore;
