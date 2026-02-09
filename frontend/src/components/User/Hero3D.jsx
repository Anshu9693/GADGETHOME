import React from "react";
import Navbar from "./NavBar";
import { useNavigate } from "react-router-dom";

const HeroVideo = () => {
  const navigate = useNavigate();
  return (
    
    <section className="relative h-screen w-full overflow-hidden bg-black">
      <div className="relative z-50">
        <Navbar />
      </div>

      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/video.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70 z-10" />

      {/* Vignette */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/50 via-transparent to-black/90" />

      {/* Hero Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4">
        {/* Badge */}
        <span className="mb-6 px-6 py-2 rounded-full border border-cyan-400 text-cyan-400 text-xs tracking-[0.3em] uppercase">
          Smart Living Starts Here
        </span>

        {/* Title */}
        <h1 className="text-[3.2rem] md:text-[7rem] font-extrabold tracking-tight leading-none">
          <span className="text-white">GADGET</span>
          <span className="text-cyan-400">HOME</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-gray-300 text-xs md:text-sm tracking-[0.35em] uppercase max-w-xl">
          Smart gadgets • Modern living • Trusted technology
        </p>

        {/* Buttons */}
        <div className="mt-12 flex gap-6">
          <button onClick={()=>navigate("/user/allproducts")} className="bg-cyan-400 text-black px-10 py-4 text-xs font-bold tracking-widest uppercase hover:bg-cyan-300 transition">
            Explore Products
          </button>

          <button  onClick={()=>  navigate("/user/about")} className="border border-white/40 text-white px-10 py-4 text-xs tracking-widest uppercase hover:border-cyan-400 hover:text-cyan-400 transition">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroVideo;
