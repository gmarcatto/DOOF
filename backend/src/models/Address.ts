import mongoose, { Document, Schema } from 'mongoose';

export interface IAddress extends Document {
  user: mongoose.Types.ObjectId;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  complemento?: string;
  selected: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rua: {
      type: String,
      required: true,
      trim: true,
    },
    numero: {
      type: String,
      required: true,
      trim: true,
    },
    bairro: {
      type: String,
      required: true,
      trim: true,
    },
    cidade: {
      type: String,
      required: true,
      trim: true,
    },
    estado: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 2,
    },
    complemento: {
      type: String,
      trim: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
AddressSchema.index({ user: 1 });

// Ensure only one address is selected per user
AddressSchema.pre('save', async function (next) {
  if (this.selected && this.isModified('selected')) {
    try {
      await mongoose.model('Address').updateMany(
        { user: this.user, _id: { $ne: this._id } },
        { $set: { selected: false } }
      );
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});

export default mongoose.model<IAddress>('Address', AddressSchema);

