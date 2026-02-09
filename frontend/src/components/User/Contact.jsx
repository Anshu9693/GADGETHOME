import React from "react";
import Navbar from "./NavBar";
import { FaMapMarkerAlt, FaPhoneAlt, FaClock, FaEnvelope } from "react-icons/fa";

const Contact = () => {
  return (
    <section className="bg-[#f7f7f5] py-20 text-slate-900">
      <Navbar />
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Contact Us
          </h1>
          <p className="mt-4 text-slate-600">
            Need help with an order or just want to say hello? We’re here to help.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* DETAILS */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-slate-900">Our Details</h2>

            <div className="mt-8 space-y-6 text-slate-700">
              <div className="flex gap-4">
                <div className="mt-1 text-cyan-500">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <p className="font-semibold">Address</p>
                  <p className="text-slate-600">
                    GadgetHome, Rohtak, Haryana, India
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-1 text-cyan-500">
                  <FaPhoneAlt />
                </div>
                <div>
                  <p className="font-semibold">Phone</p>
                  <p className="text-slate-600">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-1 text-cyan-500">
                  <FaEnvelope />
                </div>
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-slate-600">support@gadgethome.com</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-1 text-cyan-500">
                  <FaClock />
                </div>
                <div>
                  <p className="font-semibold">Hours</p>
                  <p className="text-slate-600">Mon–Sat: 10:00 AM – 7:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* MAP */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-slate-900">Find Us</h2>
            </div>
            <iframe
              title="GadgetHome Rohtak"
              src="https://www.google.com/maps?q=Rohtak,+Haryana,+India&output=embed"
              className="w-full h-[380px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
