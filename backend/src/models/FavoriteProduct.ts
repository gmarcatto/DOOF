import mongoose, { Document, Schema } from 'mongoose';

export interface IFavoriteProduct extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteProductSchema = new Schema<IFavoriteProduct>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índice único para evitar favoritos duplicados
FavoriteProductSchema.index({ user: 1, product: 1 }, { unique: true });

export default mongoose.model<IFavoriteProduct>('FavoriteProduct', FavoriteProductSchema);




