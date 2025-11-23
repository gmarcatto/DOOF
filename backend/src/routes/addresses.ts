import { Router } from 'express';
import {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  selectAddress,
} from '../controllers/addressController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all addresses for user
router.get('/', getAddresses);

// Get single address
router.get('/:id', getAddressById);

// Create new address
router.post('/', createAddress);

// Update address
router.put('/:id', updateAddress);

// Delete address
router.delete('/:id', deleteAddress);

// Select address (set as selected)
router.patch('/:id/select', selectAddress);

export default router;




