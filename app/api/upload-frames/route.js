import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';
import getMongoClientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const slug = formData.get('slug') || 'wedding';
    const zipFile = formData.get('file');
    const directFrames = formData.getAll('frames');

    // Target folder inside public
    const targetDir = path.join(process.cwd(), 'public', 'frames', slug);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    } else {
      // Clean previous frames in that folder
      const existingFiles = fs.readdirSync(targetDir);
      for (const f of existingFiles) {
        fs.unlinkSync(path.join(targetDir, f));
      }
    }

    const frameList = [];
    const timestamp = Date.now();

    // CASE 1: Direct frames uploaded (e.g. from client-side video extractor)
    if (directFrames && directFrames.length > 0) {
      for (let i = 0; i < directFrames.length; i++) {
        const frame = directFrames[i];
        const ext = path.extname(frame.name || '.webp').toLowerCase() || '.webp';
        const paddedIndex = String(i + 1).padStart(4, '0');
        const filename = `frame-${paddedIndex}${ext}`;
        const destPath = path.join(targetDir, filename);

        const arrayBuffer = await frame.arrayBuffer();
        fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
        frameList.push(`/frames/${slug}/${filename}?v=${timestamp}`);
      }
    } 
    // CASE 2: ZIP archive uploaded
    else if (zipFile) {
      const arrayBuffer = await zipFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const zip = await JSZip.loadAsync(buffer);

      const imageExtensions = ['.webp', '.jpg', '.jpeg', '.png'];
      const entries = [];

      zip.forEach((relativePath, zipEntry) => {
        if (zipEntry.dir) return;
        if (relativePath.includes('__MACOSX') || relativePath.includes('.DS_Store')) return;
        
        const ext = path.extname(relativePath).toLowerCase();
        if (imageExtensions.includes(ext)) {
          entries.push({ relativePath, zipEntry, ext });
        }
      });

      if (entries.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No valid image frames (.webp, .jpg, .png) found inside the zip archive.'
        }, { status: 400 });
      }

      entries.sort((a, b) => naturalSort(a.relativePath, b.relativePath));

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const paddedIndex = String(i + 1).padStart(4, '0');
        const filename = `frame-${paddedIndex}${entry.ext}`;
        const destPath = path.join(targetDir, filename);

        const content = await entry.zipEntry.async('nodebuffer');
        fs.writeFileSync(destPath, content);
        frameList.push(`/frames/${slug}/${filename}?v=${timestamp}`);
      }
    } else {
      return NextResponse.json({ success: false, error: 'No video frames or zip file provided' }, { status: 400 });
    }

    // Write manifest.json
    const manifest = {
      slug,
      version: timestamp,
      frameCount: frameList.length,
      frames: frameList,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(path.join(targetDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

    // Update MongoDB config for this slug
    try {
      if (process.env.MONGODB_URI) {
        const client = await getMongoClientPromise();
        const db = client.db('wedding_app');
        const query = (slug === 'global_config') ? { _id: 'global_config' } : { slug };
        await db.collection('settings').updateOne(
          query,
          {
            $set: {
              cinematicFrames: {
                enabled: true,
                version: timestamp,
                frameCount: frameList.length,
                folder: `/frames/${slug}`,
                frames: frameList,
                poster: frameList[0] || '',
                updatedAt: new Date().toISOString()
              }
            }
          },
          { upsert: true }
        );
      }
    } catch (dbErr) {
      console.warn('Could not update MongoDB with cinematicFrames:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully saved ${frameList.length} customized frames for /${slug}!`,
      version: timestamp,
      frameCount: frameList.length,
      frames: frameList,
      folder: `/frames/${slug}`
    });

  } catch (error) {
    console.error('Error processing frames upload:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET endpoint to fetch existing frames for a slug
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug') || 'wedding';

    const manifestPath = path.join(process.cwd(), 'public', 'frames', slug, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      return NextResponse.json({ success: true, ...data });
    }

    return NextResponse.json({ success: false, error: 'No frames found for this slug' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
