import mongoose from 'mongoose';

const pizzaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['veg', 'non-veg', 'specialty'],
      default: 'veg',
    },
    image: {
      type: String,
      default: '',
    },
    price: {
      small: { type: Number, default: 199 },
      medium: { type: Number, default: 399 },
      large: { type: Number, default: 599 },
    },
    ingredients: [String],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Pizza', pizzaSchema);
