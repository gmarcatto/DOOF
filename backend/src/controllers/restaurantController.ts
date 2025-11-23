import { Response } from 'express';
import Restaurant from '../models/Restaurant';
import { AuthRequest } from '../middleware/auth';
import { updateRestaurantPlaceName } from '../services/geocodingService';

// Get all restaurants
export const getAllRestaurants = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, search, isActive } = req.query;
    const filter: any = {};

    if (category) {
      filter.category = { $in: [category] };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const restaurants = await Restaurant.find(filter)
      .populate('owner', 'name email')
      .sort({ rating: -1 });

    res.json({ restaurants });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get single restaurant
export const getRestaurantById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('owner', 'name email phone');

    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }

    res.json({ restaurant });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create restaurant
export const createRestaurant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const restaurantData = {
      ...req.body,
      owner: req.user?._id,
    };

    const restaurant = await Restaurant.create(restaurantData);

    res.status(201).json({
      message: 'Restaurant created successfully',
      restaurant,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update restaurant
export const updateRestaurant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }

    // Check authorization
    if (
      req.user?.role !== 'admin' &&
      restaurant.owner.toString() !== req.user?._id.toString()
    ) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Restaurant updated successfully',
      restaurant: updatedRestaurant,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete restaurant
export const deleteRestaurant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }

    // Check authorization
    if (
      req.user?.role !== 'admin' &&
      restaurant.owner.toString() !== req.user?._id.toString()
    ) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await Restaurant.findByIdAndDelete(req.params.id);

    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update restaurant place name using reverse geocoding
export const updateRestaurantPlaceNameController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }

    // Check authorization
    if (
      req.user?.role !== 'admin' &&
      restaurant.owner.toString() !== req.user?._id.toString()
    ) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    // Verificar se tem coordenadas
    if (
      !restaurant.address?.coordinates?.latitude ||
      !restaurant.address?.coordinates?.longitude
    ) {
      res.status(400).json({
        error: 'Restaurant does not have coordinates',
      });
      return;
    }

    // Obter nome do lugar via reverse geocoding
    const placeName = await updateRestaurantPlaceName(restaurant);

    if (!placeName) {
      res.status(404).json({
        error: 'Could not find place name for these coordinates',
      });
      return;
    }

    // Atualizar restaurante
    restaurant.address.placeName = placeName;
    await restaurant.save();

    res.json({
      message: 'Place name updated successfully',
      restaurant,
      placeName,
    });
  } catch (error: any) {
    console.error('Error updating place name:', error);
    res.status(500).json({ error: error.message });
  }
};




