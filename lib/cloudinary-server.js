import { v2 as cloudinary } from 'cloudinary';
import { getPublicId, getResourceType } from './cloudinary.js';

// Server-only configuration with sensitive credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Deletes an asset from Cloudinary given its URL.
 * SERVER-ONLY: Contains api_secret, never expose to client.
 */
export async function deleteFromCloudinary(url) {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return;

  const publicId = getPublicId(url);
  const resourceType = getResourceType(url);

  if (publicId) {
    try {
      // CRITICAL: We MUST specify resource_type for videos and audio to be deleted correctly.
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      console.log(`[Cloudinary] Successfully deleted (${resourceType}): ${publicId}`);
    } catch (err) {
      console.warn(`[Cloudinary] Failed to delete ${publicId} (${resourceType}):`, err.message);
    }
  }
}

export default cloudinary;
