import mongoose, { Document, Schema } from 'mongoose';

export interface IRestaurant extends Document {
  name: string;
  description: string;
  category: string[];
  logo?: string;
  banner?: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  phone: string;
  email: string;
  owner: mongoose.Types.ObjectId;
  openingHours: {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    open: string; // "09:00"
    close: string; // "22:00"
    closed: boolean;
  }[];
  deliveryFee: number;
  minimumOrder: number;
  averageDeliveryTime: number; // in minutes
  rating: number;
  totalReviews: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantSchema = new Schema<IRestaurant>(
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
    category: [{
      type: String,
      required: true,
    }],
    logo: {
      type: String,
    },
    banner: {
      type: String,
    },
    address: {
      street: { type: String, required: true },
      number: { type: String, required: true },
      complement: String,
      neighborhood: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    openingHours: [
      {
        dayOfWeek: {
          type: Number,
          min: 0,
          max: 6,
        },
        open: String,
        close: String,
        closed: {
          type: Boolean,
          default: false,
        },
      },
    ],
    deliveryFee: {
      type: Number,
      required: true,
      default: 0,
    },
    minimumOrder: {
      type: Number,
      default: 0,
    },
    averageDeliveryTime: {
      type: Number,
      default: 40,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);


