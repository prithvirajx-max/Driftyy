import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { 
  createHangoutRequest, 
  getUserHangoutRequests, 
  updateHangoutRequestStatus,
  getAvailableUsers,
  updateAvailabilityStatus
} from '../controllers/hangoutController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateJWT);

// Get available users for hangouts
router.get('/available-users', getAvailableUsers);

// Update current user's availability status
router.put('/availability', updateAvailabilityStatus);

// Get all hangout requests for current user
router.get('/requests', getUserHangoutRequests);

// Create a new hangout request
router.post('/requests', createHangoutRequest);

// Update a hangout request status (accept/reject)
router.put('/requests/:requestId', updateHangoutRequestStatus);

export default router;
