import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // 🔹 BASIC INFO
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Smart Lighting",
        "Home Security",
        "Kitchen Gadgets",
        "Smart Plugs",
        "Wearables",
        "Entertainment",
        "Others",
      ],
      index: true,
    },

    // 🔹 PRICING
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      default: null,
      validate: {
        validator: function (value) {
          if (value == null) return true;
          return value < this.price;
        },
        message: "Discount price must be less than actual price",
      },
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    description: {
      type: String,
      required: true,
    },

    // 🔹 IMAGES
    images: {
      type: [String], // Cloudinary URLs
      required: true,
      validate: {
        validator: (val) => val.length > 0,
        message: "At least one product image is required",
      },
    },

    // 🔹 SMART GADGET DETAILS
    connectivity: {
      type: [String],
      enum: ["Wi-Fi", "Bluetooth", "Zigbee", "Thread"],
      default: [],
    },

    voiceAssistantSupport: {
      alexa: { type: Boolean, default: false },
      googleAssistant: { type: Boolean, default: false },
      appleHomeKit: { type: Boolean, default: false },
    },

    powerSource: {
      type: String,
      enum: ["Battery", "Plug-in", "USB"],
      default: null,
    },

    warranty: {
      type: String, // e.g. "1 Year"
      default: null,
    },

    energyRating: {
      type: String, // e.g. "5 Star"
      default: null,
    },

    specifications: {
      type: Map,
      of: String,
      default: {},
    },

    // 🔹 RATINGS (SYNCED WITH REVIEWS)
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    // 🔹 ADMIN CONTROLS
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 🔍 TEXT SEARCH (SEARCH BAR)
productSchema.index({
  name: "text",
  brand: "text",
  category: "text",
});

// ⚡ VIRTUAL: Final Price
productSchema.virtual("finalPrice").get(function () {
  return this.discountPrice ?? this.price;
});

export default mongoose.model("Product", productSchema);
