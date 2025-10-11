import { Response } from 'express';
import Product from '../models/Product';
import Restaurant from '../models/Restaurant';
import { AuthRequest } from '../middleware/auth';

// Get all products
export const getAllProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { restaurant, category, available, search } = req.query;
    const filter: any = {};

    if (restaurant) {
      filter.restaurant = restaurant;
    }

    if (category) {
      filter.category = category;
    }

    if (available !== undefined) {
      filter.available = available === 'true';
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter).populate('restaurant', 'name logo');

    res.json({ products });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get single product
export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id).populate('restaurant', 'name logo');

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ product });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create product
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { restaurant: restaurantId } = req.body;

    // Verify restaurant ownership
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }

    if (
      req.user?.role !== 'admin' &&
      restaurant.owner.toString() !== req.user?._id.toString()
    ) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update product
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id).populate('restaurant');

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Check authorization
    const restaurant = product.restaurant as any;
    if (
      req.user?.role !== 'admin' &&
      restaurant.owner.toString() !== req.user?._id.toString()
    ) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete product
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id).populate('restaurant');

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Check authorization
    const restaurant = product.restaurant as any;
    if (
      req.user?.role !== 'admin' &&
      restaurant.owner.toString() !== req.user?._id.toString()
    ) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};




