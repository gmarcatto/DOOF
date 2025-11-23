import { Response } from 'express';
import Address from '../models/Address';
import { AuthRequest } from '../middleware/auth';

// Get all addresses for authenticated user
export const getAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const addresses = await Address.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ addresses });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get single address
export const getAddressById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }

    res.json({ address });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create new address
export const createAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { rua, numero, bairro, cidade, estado, complemento, selected } = req.body;

    // Validate required fields
    if (!rua || !numero || !bairro || !cidade || !estado) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // If this address is selected, unselect all others
    if (selected) {
      await Address.updateMany(
        { user: req.user._id },
        { $set: { selected: false } }
      );
    }

    const address = await Address.create({
      user: req.user._id,
      rua,
      numero,
      bairro,
      cidade,
      estado: estado.toUpperCase(),
      complemento,
      selected: selected || false,
    });

    res.status(201).json({
      message: 'Address created successfully',
      address,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update address
export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { rua, numero, bairro, cidade, estado, complemento, selected } = req.body;

    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }

    // If this address is being selected, unselect all others
    if (selected && !address.selected) {
      await Address.updateMany(
        { user: req.user._id, _id: { $ne: address._id } },
        { $set: { selected: false } }
      );
    }

    // Update address
    address.rua = rua || address.rua;
    address.numero = numero || address.numero;
    address.bairro = bairro || address.bairro;
    address.cidade = cidade || address.cidade;
    address.estado = estado ? estado.toUpperCase() : address.estado;
    address.complemento = complemento !== undefined ? complemento : address.complemento;
    address.selected = selected !== undefined ? selected : address.selected;

    await address.save();

    res.json({
      message: 'Address updated successfully',
      address,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete address
export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Set address as selected
export const selectAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }

    // Unselect all addresses
    await Address.updateMany(
      { user: req.user._id },
      { $set: { selected: false } }
    );

    // Select this address
    address.selected = true;
    await address.save();

    res.json({
      message: 'Address selected successfully',
      address,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

