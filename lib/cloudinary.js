import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extract Cloudinary public_id from a secure_url.
 * e.g. https://res.cloudinary.com/cloud/image/upload/v1234/wedding_invites/file.webp
 *   -> wedding_invites/file
 */
export function getPublicId(url) {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return null;
  try {
    const clean = url.split('?')[0];
    const parts = clean.split('/upload/');
    if (parts.length < 2) return null;
    
    const segments = parts[1].split('/');
    // Skip transformation segments and the version segment (v1234)
    let startIndex = 0;
    while (startIndex < segments.length) {
      const seg = segments[startIndex];
      // Skip version (v1234)
      if (/^v\d+$/.test(seg)) {
        startIndex++;
        break; // Public ID starts immediately after version
      }
      // Skip transformations (usually contain commas or match common patterns like c_fill, w_300)
      // If it doesn't look like a transformation, it's likely the start of the folder/publicId
      if (seg.includes(',') || /^[a-z]{1,2}_[a-zA-Z0-9]+$/.test(seg)) {
        startIndex++;
      } else {
        break;
      }
    }
    
    const idWithExt = segments.slice(startIndex).join('/');
    return idWithExt.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
}

/**
 * Detect resource type from Cloudinary URL (image, video, raw)
 */
export function getResourceType(url) {
  if (!url) return 'image';
  if (url.includes('/video/upload/')) return 'video';
  if (url.includes('/raw/upload/')) return 'raw';
  return 'image';
}

/**
 * Checks whether a Cloudinary asset is still in use by ANY invitation in the database.
 * If excludeSlug is passed, checks all invitations EXCEPT that slug (useful when an invitation
 * is deleting or replacing its own image).
 */
export async function isCloudinaryUrlInUse(url, excludeSlug = null) {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return false;

  const targetPublicId = getPublicId(url);
  if (!targetPublicId) return false;

  try {
    const getMongoClientPromise = (await import('./mongodb.js')).default;
    const client = await getMongoClientPromise();
    const db = client.db('wedding_app');

    const query = excludeSlug ? { slug: { $ne: excludeSlug } } : {};
    const docs = await db.collection('settings').find(query).toArray();

    // Helper to recursively check if targetPublicId is anywhere in the doc
    const containsTarget = (obj) => {
      if (!obj || typeof obj !== 'object') return false;
      for (const key in obj) {
        const val = obj[key];
        if (typeof val === 'string' && val.includes('cloudinary.com')) {
          if (getPublicId(val) === targetPublicId) return true;
        } else if (typeof val === 'object') {
          if (containsTarget(val)) return true;
        }
      }
      return false;
    };

    for (const doc of docs) {
      if (containsTarget(doc)) {
        return true;
      }
    }

    // Also check hero_variants
    const variantQuery = excludeSlug ? { slug: { $ne: excludeSlug } } : {};
    const variants = await db.collection('hero_variants').find(variantQuery).toArray();
    for (const v of variants) {
      if (v.imageUrl && getPublicId(v.imageUrl) === targetPublicId) {
        return true;
      }
    }

    return false;
  } catch (err) {
    console.error('[Cloudinary] Safety check error in isCloudinaryUrlInUse:', err);
    // Safety precaution: return true to prevent accidental permanent deletion if DB query fails
    return true;
  }
}

/**
 * Deletes an asset from Cloudinary given its URL, with built-in reference checking.
 * If another invitation in MongoDB is still using this asset, deletion is safely aborted.
 */
export async function deleteFromCloudinary(url, excludeSlug = null) {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return;
  
  const publicId = getPublicId(url);
  const resourceType = getResourceType(url);
  
  if (!publicId) return;

  // SAFETY CHECK: Never delete if another invitation is still using this asset!
  const inUse = await isCloudinaryUrlInUse(url, excludeSlug);
  if (inUse) {
    console.log(`[Cloudinary Safety] Preserved asset '${publicId}' (${resourceType}): still in use by another invitation.`);
    return;
  }

  try {
    // CRITICAL: We MUST specify resource_type for videos and audio to be deleted correctly.
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    console.log(`[Cloudinary] Successfully deleted (${resourceType}): ${publicId}`);
  } catch (err) {
    console.warn(`[Cloudinary] Failed to delete ${publicId} (${resourceType}):`, err.message);
  }
}

export default cloudinary;
