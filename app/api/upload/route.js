import { NextResponse } from 'next/server';
import sharp from 'sharp';
import cloudinary from '@/lib/cloudinary';

/**
 * Helper to upload a buffer to Cloudinary
 */
const uploadToCloudinary = (buffer, type = 'general') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'wedding_invites',
        resource_type: 'auto',
        // Optional: tag can help with organization
        tags: [type]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

export async function POST(req) {

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const type = formData.get('type') || 'general';
    const oldImage = formData.get('oldImage'); // URL of the image being replaced

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    // ── Delete old image/video/audio from Cloudinary BEFORE uploading new one ───
    if (oldImage) {
      const { deleteFromCloudinary } = await import('@/lib/cloudinary');
      await deleteFromCloudinary(oldImage);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
    const isVideo = file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mp4');
    const isAudio = type === 'audio' || file.type.startsWith('audio/') || file.name.toLowerCase().endsWith('.mp3');
    let finalBuffer;
    
    if (isGif || isVideo || isAudio) {
      finalBuffer = buffer;
    } else {
      let pipeline = sharp(buffer);
      if (type === 'hero') pipeline = pipeline.resize({ width: 1920, withoutEnlargement: true, fit: 'inside' });
      else if (type === 'gallery') pipeline = pipeline.resize({ width: 1200, withoutEnlargement: true, fit: 'inside' });
      else pipeline = pipeline.resize({ width: 1200, withoutEnlargement: true, fit: 'inside' });

      finalBuffer = await pipeline.webp({ quality: 85 }).toBuffer();
    }

    // Upload new image to Cloudinary
    const uploadResult = await uploadToCloudinary(finalBuffer, type);
    
    return NextResponse.json({ 
      success: true, 
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id 
    });

  } catch (err) {
    console.error('Upload [Cloud] Error:', err);
    return NextResponse.json({ success: false, error: 'Upload failed: Please check Cloudinary config.' }, { status: 500 });
  }
}

export async function DELETE(req) {

  try {
    const body = await req.json();
    const { fileUrl } = body;

    if (!fileUrl) {
      return NextResponse.json({ success: false, error: 'No file URL provided' }, { status: 400 });
    }

    const { deleteFromCloudinary } = await import('@/lib/cloudinary');
    await deleteFromCloudinary(fileUrl);
    
    return NextResponse.json({ success: true, message: 'Image deleted from Cloudinary.' });
  } catch (err) {
    console.error('Delete [Cloud] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
