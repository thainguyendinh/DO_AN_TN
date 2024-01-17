const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A product must have a name"],
      unique: true,
    },
    slug: String,
    rating: {
      type: Number,
      default: 0,
    },
    imageCover: {
      type: String,
      required: [true, "A product must have a cover image"],
    },
    images: [String],
    description: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    storageCapacity: { type: String, required: true },
    category: { type: String, required: true },
    colors: [
      {
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          default: 10,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

productSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;