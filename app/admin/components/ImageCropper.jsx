'use client';
import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

/**
 * ImageCropper Modal component
 * @param {string} image - The image source (data URL or object URL)
 * @param {number} aspect - The aspect ratio (e.g., 16/9)
 * @param {Function} onCropComplete - Callback when user clicks 'Apply'
 * @param {Function} onCancel - Callback when user clicks 'Cancel'
 */
export default function ImageCropper({ image, aspect, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [currentAspect, setCurrentAspect] = useState(aspect || 1);

  const aspects = [
    { label: 'Square (1:1)', value: 1 },
    { label: 'Portrait (3:4)', value: 3/4 },
    { label: 'Landscape (16:9)', value: 16/9 },
    { label: 'Banner (3:1)', value: 3 },
  ];

  const onCropChange = (crop) => setCrop(crop);
  const onZoomChange = (zoom) => setZoom(zoom);

  const onCropCompleteInternal = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApply = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Crop Photo</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors text-xl">×</button>
        </div>

        <div className="relative flex-1 bg-slate-100 min-h-[400px]">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={currentAspect}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteInternal}
            classes={{
                containerClassName: 'bg-slate-100',
                mediaClassName: 'max-w-none',
            }}
          />
        </div>

        <div className="px-6 py-6 border-t border-slate-50 flex flex-col gap-5">
          {/* Zoom Slider */}
          <div className="flex items-center gap-4">
            <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest min-w-[40px]">Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              className="flex-1 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#C9956A]"
            />
          </div>

          {/* Aspect Ratio Selection */}
          <div className="flex flex-col gap-2">
            <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Select Size</span>
            <div className="flex flex-wrap gap-2">
              {aspects.map((a) => {
                const isActive = Math.abs(currentAspect - a.value) < 0.01;
                return (
                  <button
                    key={a.label}
                    onClick={() => setCurrentAspect(a.value)}
                    className={`px-3 py-1.5 rounded-lg text-[0.65rem] font-bold uppercase tracking-wider transition-all border ${
                      isActive 
                        ? 'bg-[#C9956A]/10 border-[#C9956A] text-[#C9956A]' 
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              onClick={onCancel}
              className="px-5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors uppercase tracking-wide"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2 bg-[#C9956A] text-white text-xs font-bold rounded-lg shadow-lg shadow-[#C9956A]/20 hover:bg-[#b5845a] transition-all uppercase tracking-wide"
            >
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Creates a cropped image from the source
 */
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      blob.name = 'cropped.jpg';
      resolve(blob);
    }, 'image/jpeg', 0.95);
  });
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}
