import express from 'express';
import { updateProfile, changePassword } from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

export default router;