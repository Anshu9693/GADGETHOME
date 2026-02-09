import React from "react";
import { motion } from "framer-motion";
import {
  FaMicrochip,
  FaLightbulb,
  FaWifi,
  FaBolt,
} from "react-icons/fa";

const icons = [FaMicrochip, FaLightbulb, FaWifi, FaBolt];

const GadgetLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020617]">
      
      {/* Rotating ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
        className="relative w-32 h-32 rounded-full border-2 border-cyan-400/40 flex items-center justify-center"
      >
        {/* Pulsing glow */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 rounded-full bg-cyan-400/10 blur-xl"
        />

        {/* Center icon */}
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-cyan-400 text-3xl"
        >
          <FaMicrochip />
        </motion.div>
      </motion.div>

      {/* Cycling gadget icons */}
      <div className="flex gap-6 mt-10">
        {icons.map((Icon, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              delay: i * 0.2,
            }}
            className="text-cyan-400 text-xl"
          >
            <Icon />
          </motion.div>
        ))}
      </div>

      {/* Text */}
      <p className="mt-8 text-xs tracking-[0.4em] text-cyan-400 uppercase">
        Initializing Smart Devices
      </p>
    </div>
  );
};

export default GadgetLoader;
