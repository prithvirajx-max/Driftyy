import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { 
  createGroup,
  getUserGroups,
  getGroup,
  updateGroup,
  addMembers,
  removeMember,
  deleteGroup,
  upload
} from '../controllers/groupController.js';

const router = express.Router();

// All routes are protected with authentication
router.use(protect);

// Get all groups for the current user
router.get('/', getUserGroups);

// Create a new group
router.post('/', upload.single('photo'), createGroup);

// Get a specific group
router.get('/:groupId', getGroup);

// Update a group
router.put('/:groupId', upload.single('photo'), updateGroup);

// Add members to a group
router.post('/:groupId/members', addMembers);

// Remove a member from a group
router.delete('/:groupId/members/:memberId', removeMember);

// Delete a group
router.delete('/:groupId', deleteGroup);

export default router;
