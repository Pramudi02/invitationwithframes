import getMongoClientPromise from '@/lib/mongodb';
import JSZip from 'jszip';
import { NextResponse } from 'next/server';

function getExtensionFromUrl(url) {
  try {
    // For Cloudinary URLs, extract the real extension from before query params
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    // Get last segment
    const lastSegment = pathname.split('/').pop() || '';
    const dotIndex = lastSegment.lastIndexOf('.');
    if (dotIndex !== -1) {
      const ext = lastSegment.substring(dotIndex + 1).toLowerCase();
      if (ext.length >= 2 && ext.length <= 5 && /^[a-z0-9]+$/.test(ext)) {
        return `.${ext}`;
      }
    }
  } catch (e) {
    // ignore
  }
  if (url.includes('video/upload')) return '.mp4';
  if (url.includes('image/upload')) return '.jpg';
  return '.bin';
}

export async function GET(request, { params }) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
  }

  try {
    const client = await getMongoClientPromise();
    const db = client.db('wedding_app');

    const query = (slug === 'global_config') ? { _id: 'global_config' } : { slug };
    const config = await db.collection('settings').findOne(query);

    if (!config) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
    }

    // 1. Collect all HTTP(S) URLs from the entire config — simple flat extraction
    const mediaToDownload = [];
    const seenUrls = new Set();

    function collectUrls(value, nameParts) {
      if (!value) return;

      if (typeof value === 'string') {
        const trimmed = value.trim();
        if ((trimmed.startsWith('http://') || trimmed.startsWith('https://')) && !seenUrls.has(trimmed)) {
          seenUrls.add(trimmed);
          mediaToDownload.push({ url: trimmed, name: nameParts.join('-') });
        }
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item, idx) => collectUrls(item, [...nameParts, String(idx + 1)]));
        return;
      }

      if (value !== null && typeof value === 'object') {
        Object.entries(value).forEach(([k, v]) => {
          if (k === '_id') return;
          collectUrls(v, [...nameParts, k]);
        });
      }
    }

    // Collect from the entire config (excluding internal MongoDB _id)
    const { _id, ...configWithoutId } = config;
    collectUrls(configWithoutId, []);

    console.log(`[export-media] slug=${slug}, found ${mediaToDownload.length} media URLs:`);
    mediaToDownload.forEach(m => console.log('  -', m.name, '→', m.url.substring(0, 80)));

    if (mediaToDownload.length === 0) {
      return NextResponse.json({ error: 'No media found for this invitation' }, { status: 404 });
    }

    const zip = new JSZip();

    // 2. Fetch & add to zip
    for (const media of mediaToDownload) {
      try {
        const response = await fetch(media.url, { signal: AbortSignal.timeout(30000) });
        if (!response.ok) {
          console.error(`[export-media] Failed to fetch ${media.url}: ${response.status} ${response.statusText}`);
          continue;
        }

        const arrayBuffer = await response.arrayBuffer();
        const extension = getExtensionFromUrl(media.url);
        // Sanitize filename
        const safeName = media.name.replace(/[^a-zA-Z0-9_\-]/g, '_');
        const fileName = `${safeName}${extension}`;

        console.log(`[export-media] Adding file: ${fileName}`);
        zip.file(fileName, arrayBuffer);
      } catch (err) {
        console.error(`[export-media] Error fetching ${media.url}:`, err.message);
      }
    }

    const files = Object.keys(zip.files);
    console.log(`[export-media] ZIP contains ${files.length} files:`, files);

    // 3. Generate ZIP
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

    return new Response(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${slug}-media-backup.zip"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('[export-media] Error:', error);
    return NextResponse.json({ error: 'Internal server error while generating backup' }, { status: 500 });
  }
}
