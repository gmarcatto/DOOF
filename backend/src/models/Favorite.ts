import mongoose, { Document, Schema } from 'mongoose';

export interface IFavoriteRestaurant extends Document {
  user: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteRestaurantSchema = new Schema<IFavoriteRestaurant>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índice único para evitar favoritos duplicados
FavoriteRestaurantSchema.index({ user: 1, restaurant: 1 }, { unique: true });

// Manter compatibilidade com código antigo (usando Favorite como alias)
export default mongoose.model<IFavoriteRestaurant>('FavoriteRestaurant', FavoriteRestaurantSchema);
// Exportar também como Favorite para compatibilidade
export const Favorite = mongoose.model<IFavoriteRestaurant>('Favorite', FavoriteRestaurantSchema);

