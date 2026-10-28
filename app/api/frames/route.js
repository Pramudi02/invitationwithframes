import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug') || '';

    const framesBaseDir = path.join(process.cwd(), 'public', 'frames');
    if (!fs.existsSync(framesBaseDir)) {
      return NextResponse.json({ success: false, frames: [], frameCount: 0 });
    }

    const imageRegex = /\.(webp|jpg|jpeg|png)$/i;

    // 1. Check if slug-specific directory exists and has frames
    if (slug) {
      const slugDir = path.join(framesBaseDir, slug);
      if (fs.existsSync(slugDir)) {
        const files = fs.readdirSync(slugDir).filter(f => imageRegex.test(f));
        if (files.length > 0) {
          files.sort(naturalSort);
          const frames = files.map(f => `/frames/${slug}/${f}`);
          return NextResponse.json({
            success: true,
            folder: `/frames/${slug}`,
            frameCount: frames.length,
            frames
          });
        }
      }
    }

    // 2. Check if frames exist directly in /public/frames/ (e.g. frame_0001.webp)
    const rootFiles = fs.readdirSync(framesBaseDir).filter(f => imageRegex.test(f));
    if (rootFiles.length > 0) {
      rootFiles.sort(naturalSort);
      const frames = rootFiles.map(f => `/frames/${f}`);
      return NextResponse.json({
        success: true,
        folder: `/frames`,
        frameCount: frames.length,
        frames
      });
    }

    // 3. Fallback: check /public/frames/wedding/
    const weddingDir = path.join(framesBaseDir, 'wedding');
    if (fs.existsSync(weddingDir)) {
      const weddingFiles = fs.readdirSync(weddingDir).filter(f => imageRegex.test(f));
      if (weddingFiles.length > 0) {
        weddingFiles.sort(naturalSort);
        const frames = weddingFiles.map(f => `/frames/wedding/${f}`);
        return NextResponse.json({
          success: true,
          folder: `/frames/wedding`,
          frameCount: frames.length,
          frames
        });
      }
    }

    return NextResponse.json({ success: false, frames: [], frameCount: 0 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
