import express from 'express';
import { predictWaste, getHistory, getStats } from '../controllers/waste.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes
router.post('/predict', upload.single('image'), predictWaste);
router.get('/history', getHistory);
router.get('/stats', getStats);

export default router;
