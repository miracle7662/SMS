import express from 'express';
import { 
  getSocieties,      // ✅ Only these 2 exist
  selectSociety      // ✅ Only these 2 exist
} from '../controllers/society.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';

const router = express.Router();

// Get all societies (Super Admin gets all, normal user gets their societies)
router.get('/societies', authenticate, getSocieties);

// Select society
router.post('/select-society', authenticate, selectSociety);

export default router;