import Group from '../models/Group.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads/groups');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage for group photos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'group-' + uniqueSuffix + ext);
  }
});

// Configure file filter
const fileFilter = (req, file, cb) => {
  // Only accept images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Set up multer for file uploads
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Create a new group
export const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    const creator = req.user.id;

    // Validate name
    if (!name || name.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Group name is required'
      });
    }

    // Create group with creator as first admin member
    const group = new Group({
      name,
      description: description || '',
      creator,
      members: [{
        user: creator,
        role: 'admin',
        joinedAt: new Date()
      }]
    });

    // Set photo URL if there's an uploaded file
    if (req.file) {
      group.photoURL = `/uploads/groups/${req.file.filename}`;
    }

    // Generate a unique conversation ID for the group
    group.conversationId = `group_${uuidv4()}`;

    await group.save();

    // Return the created group
    const populatedGroup = await Group.findById(group._id)
      .populate('creator', 'displayName photoURL')
      .populate('members.user', 'displayName photoURL');

    res.status(201).json({
      status: 'success',
      data: populatedGroup
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create group'
    });
  }
};

// Get all groups the user is a member of
export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all groups where user is a member
    const groups = await Group.find({
      $or: [
        { creator: userId },
        { 'members.user': userId }
      ],
      isActive: true
    })
      .populate('creator', 'displayName photoURL')
      .populate('members.user', 'displayName photoURL')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      status: 'success',
      data: groups
    });
  } catch (error) {
    console.error('Error getting user groups:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get user groups'
    });
  }
};

// Get a specific group by ID
export const getGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Find the group
    const group = await Group.findById(groupId)
      .populate('creator', 'displayName photoURL')
      .populate('members.user', 'displayName photoURL');

    if (!group) {
      return res.status(404).json({
        status: 'error',
        message: 'Group not found'
      });
    }

    // Check if user is a member of the group
    if (!group.isMember(userId)) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not a member of this group'
      });
    }

    res.status(200).json({
      status: 'success',
      data: group
    });
  } catch (error) {
    console.error('Error getting group:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get group'
    });
  }
};

// Update a group
export const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;

    // Find the group
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        status: 'error',
        message: 'Group not found'
      });
    }

    // Check if user is an admin of the group
    if (!group.isAdmin(userId)) {
      return res.status(403).json({
        status: 'error',
        message: 'Only group admins can update the group'
      });
    }

    // Update fields
    if (name && name.trim() !== '') {
      group.name = name;
    }

    if (description !== undefined) {
      group.description = description;
    }

    // Update photo if there's an uploaded file
    if (req.file) {
      // Delete old photo if it exists
      if (group.photoURL) {
        const oldFilename = group.photoURL.split('/').pop();
        const oldFilePath = path.join(uploadDir, oldFilename);
        
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      group.photoURL = `/uploads/groups/${req.file.filename}`;
    }

    group.updatedAt = new Date();
    await group.save();

    // Return the updated group
    const updatedGroup = await Group.findById(groupId)
      .populate('creator', 'displayName photoURL')
      .populate('members.user', 'displayName photoURL');

    res.status(200).json({
      status: 'success',
      data: updatedGroup
    });
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update group'
    });
  }
};

// Add members to a group
export const addMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { members } = req.body;
    const userId = req.user.id;

    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Members array is required'
      });
    }

    // Find the group
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        status: 'error',
        message: 'Group not found'
      });
    }

    // Check if user is an admin of the group
    if (!group.isAdmin(userId)) {
      return res.status(403).json({
        status: 'error',
        message: 'Only group admins can add members'
      });
    }

    // Add members
    const results = [];
    for (const member of members) {
      const { userId: memberUserId, role = 'member' } = member;
      
      // Check if user exists
      const userExists = await User.exists({ _id: memberUserId });
      if (!userExists) {
        results.push({
          userId: memberUserId,
          success: false,
          message: 'User not found'
        });
        continue;
      }
      
      // Try to add the member
      const added = await group.addMember(memberUserId, role);
      results.push({
        userId: memberUserId,
        success: added,
        message: added ? 'Added successfully' : 'User is already a member'
      });
    }

    // Return the updated group
    const updatedGroup = await Group.findById(groupId)
      .populate('creator', 'displayName photoURL')
      .populate('members.user', 'displayName photoURL');

    res.status(200).json({
      status: 'success',
      data: {
        group: updatedGroup,
        results
      }
    });
  } catch (error) {
    console.error('Error adding members to group:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to add members to group'
    });
  }
};

// Remove a member from a group
export const removeMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user.id;

    // Find the group
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        status: 'error',
        message: 'Group not found'
      });
    }

    // Check if user is an admin or the member being removed is the user themselves
    if (!group.isAdmin(userId) && userId !== memberId) {
      return res.status(403).json({
        status: 'error',
        message: 'Only group admins can remove other members'
      });
    }

    // Prevent removing the group creator
    if (memberId === group.creator.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot remove the group creator'
      });
    }

    // Remove the member
    const removed = await group.removeMember(memberId);

    if (!removed) {
      return res.status(404).json({
        status: 'error',
        message: 'User is not a member of this group'
      });
    }

    // Return the updated group
    const updatedGroup = await Group.findById(groupId)
      .populate('creator', 'displayName photoURL')
      .populate('members.user', 'displayName photoURL');

    res.status(200).json({
      status: 'success',
      data: updatedGroup
    });
  } catch (error) {
    console.error('Error removing member from group:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to remove member from group'
    });
  }
};

// Delete a group (soft delete)
export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Find the group
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        status: 'error',
        message: 'Group not found'
      });
    }

    // Only the creator can delete the group
    if (group.creator.toString() !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the group creator can delete the group'
      });
    }

    // Soft delete
    group.isActive = false;
    await group.save();

    res.status(200).json({
      status: 'success',
      message: 'Group deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to delete group'
    });
  }
};
