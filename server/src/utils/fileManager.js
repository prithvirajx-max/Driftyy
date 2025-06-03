import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to uploads directory
const uploadsDir = path.join(__dirname, '../../uploads');

/**
 * Delete a file from the uploads directory
 * @param {string} filename - The filename to delete (not full path, just the filename)
 * @returns {Promise<boolean>} - True if deleted, false if error
 */
export const deleteFile = async (filename) => {
  try {
    // Don't allow path traversal
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(uploadsDir, sanitizedFilename);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Extract filename from photoUrl
 * @param {string} photoUrl - The photo URL (e.g., "/uploads/photo-123456.jpg")
 * @returns {string|null} - The filename or null if invalid
 */
export const getFilenameFromUrl = (photoUrl) => {
  if (!photoUrl || typeof photoUrl !== 'string') return null;
  
  // Extract filename from URL
  const filename = photoUrl.split('/').pop();
  return filename || null;
};
