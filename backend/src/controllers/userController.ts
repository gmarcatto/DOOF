import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Get all users (Admin only)
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get single user
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update user
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, address, avatar } = req.body;
    const userId = req.params.id;

    // Check authorization
    if (req.user?.role !== 'admin' && req.user?._id.toString() !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone, address, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'User updated successfully', user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    // Check authorization
    if (req.user?.role !== 'admin' && req.user?._id.toString() !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create user (Admin only)
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      role: role || 'customer',
      authProvider: 'local',
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};




