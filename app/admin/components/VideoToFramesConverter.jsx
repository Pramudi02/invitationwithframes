'use client';

import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import { 
  Upload, Film, Sparkles, CheckCircle2, Check, CheckSquare, 
  Play, Pause, RefreshCw, Eye, ArrowRight, Layers, FileVideo 
} from 'lucide-react';

export default function VideoToFramesConverter({ 
  currentSlug = 'wedding', 
  existingFrames = [], 
  onFramesSaved, 
  showToast 
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [videoMeta, setVideoMeta] = useState({ duration: 0, width: 0, height: 0, sizeMb: 0 });

  // Conversion Configuration
  const [targetFrameCount, setTargetFrameCount] = useState(24);
  const [targetResolution, setTargetResolution] = useState('720p'); // '540p', '720p', '1080p'
  const [webpQuality, setWebpQuality] = useState(80); // 50 to 95
  const [targetSlug, setTargetSlug] = useState(currentSlug);

  // Processing state & step tracking
  // Step state: 'idle' | 'video_ready' | 'dividing_frames' | 'compressing_webp' | 'saving_files' | 'syncing_db' | 'completed'
  const [currentStep, setCurrentStep] = useState(existingFrames?.length > 0 ? 'completed' : 'idle');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, percent: 0, statusText: '' });
  const [currentFramePreview, setCurrentFramePreview] = useState(null);
  const [extractedThumbnails, setExtractedThumbnails] = useState([]);
  const [resultSummary, setResultSummary] = useState(null);

  // Scrubber preview state
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const playIntervalRef = useRef(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    setTargetSlug(currentSlug);
  }, [currentSlug]);

  // Handle video file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|mov|webm|m4v)$/i)) {
      if (showToast) showToast('error', 'Please select a valid video file (.mp4, .mov, .webm)');
      return;
    }

    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }

    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setVideoPreviewUrl(url);
    setResultSummary(null);
    setExtractedThumbnails([]);
    setCurrentFramePreview(null);
    setCurrentStep('video_ready');

    // Read video metadata
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = url;
    tempVideo.onloadedmetadata = () => {
      setVideoMeta({
        duration: Math.round(tempVideo.duration * 10) / 10,
        width: tempVideo.videoWidth,
        height: tempVideo.videoHeight,
        sizeMb: Math.round((file.size / (1024 * 1024)) * 10) / 10
      });
    };
  };

  // Run the Frame Extraction and WebP Compression Pipeline
  const handleStartConversion = async () => {
    if (!selectedFile || !videoPreviewUrl) {
      if (showToast) showToast('error', 'Please select a video file first');
      return;
    }

    setIsProcessing(true);
    setResultSummary(null);
    setExtractedThumbnails([]);
    setCurrentStep('dividing_frames');
    setProgress({ current: 0, total: targetFrameCount, percent: 0, statusText: 'Initializing video decoder...' });

    try {
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.src = videoPreviewUrl;

      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error('Failed to load video into decoding engine.'));
      });

      const duration = video.duration;
      if (!duration || isNaN(duration)) {
        throw new Error('Could not read video duration.');
      }

      // Determine output dimensions
      let maxDim = 720;
      if (targetResolution === '1080p') maxDim = 1080;
      if (targetResolution === '540p') maxDim = 540;

      let srcW = video.videoWidth || 720;
      let srcH = video.videoHeight || 1280;
      const scale = Math.min(1, maxDim / Math.max(srcW, srcH));
      const targetW = Math.round(srcW * scale);
      const targetH = Math.round(srcH * scale);

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d', { alpha: false });

      const zip = new JSZip();
      const thumbs = [];
      let totalBytes = 0;

      const qualityDecimal = webpQuality / 100;

      // Extract each frame sequentially
      for (let i = 0; i < targetFrameCount; i++) {
        const targetTime = (i / Math.max(1, targetFrameCount - 1)) * duration;

        // Step 2 & 3: Dividing and Compressing
        if (i === Math.floor(targetFrameCount / 2)) {
          setCurrentStep('compressing_webp');
        }

        // Seek video to exact timestamp
        await new Promise((resSeek) => {
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            resSeek();
          };
          video.addEventListener('seeked', onSeeked);
          video.currentTime = targetTime;
        });

        // Draw to canvas
        ctx.drawImage(video, 0, 0, targetW, targetH);

        // Convert to WebP blob
        const blob = await new Promise((resBlob) => {
          canvas.toBlob(resBlob, 'image/webp', qualityDecimal);
        });

        totalBytes += blob.size;
        const paddedIndex = String(i + 1).padStart(4, '0');
        const filename = `frame-${paddedIndex}.webp`;

        zip.file(filename, blob);

        // Thumbnail for live feedback
        const thumbDataUrl = canvas.toDataURL('image/webp', 0.5);
        setCurrentFramePreview(thumbDataUrl);
        if (i % Math.max(1, Math.floor(targetFrameCount / 12)) === 0 || i === targetFrameCount - 1) {
          thumbs.push(thumbDataUrl);
          setExtractedThumbnails([...thumbs]);
        }

        const percent = Math.round(((i + 1) / targetFrameCount) * 100);
        setProgress({
          current: i + 1,
          total: targetFrameCount,
          percent,
          statusText: `Dividing & compressing frame ${i + 1} of ${targetFrameCount} (${percent}%)...`
        });
      }

      // Step 4: Package into Archive & Save
      setCurrentStep('saving_files');
      setProgress(prev => ({ ...prev, statusText: 'Packaging WebP frames into zip archive...' }));
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Step 5: Upload and Sync Database
      setCurrentStep('syncing_db');
      setProgress(prev => ({ ...prev, statusText: `Saving and syncing frames for "/${targetSlug}"...` }));
      const fd = new FormData();
      fd.append('file', zipBlob, 'frames.zip');
      fd.append('slug', targetSlug);

      const res = await fetch('/api/upload-frames', {
        method: 'POST',
        body: fd
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to save frames to server');
      }

      const avgKb = Math.round((totalBytes / targetFrameCount / 1024) * 10) / 10;
      const totalMb = Math.round((totalBytes / (1024 * 1024)) * 100) / 100;

      // Step 6: Completed!
      setCurrentStep('completed');
      setResultSummary({
        frameCount: targetFrameCount,
        resolution: `${targetW}x${targetH}`,
        avgKb,
        totalMb,
        folder: data.folder,
        frames: data.frames
      });

      if (showToast) {
        showToast('success', `Created ${targetFrameCount} compressed WebP frames for /${targetSlug}!`);
      }

      if (onFramesSaved) {
        onFramesSaved({
          enabled: true,
          frameCount: data.frameCount,
          frames: data.frames,
          folder: data.folder,
          poster: data.frames[0] || ''
        });
      }

    } catch (err) {
      console.error('Frame conversion error:', err);
      if (showToast) showToast('error', err.message || 'Frame conversion failed');
      setProgress(prev => ({ ...prev, statusText: `Error: ${err.message}` }));
    } finally {
      setIsProcessing(false);
    }
  };

  // Frame Scrubber auto-play toggle
  const togglePlayPreview = (total) => {
    if (isPlayingPreview) {
      clearInterval(playIntervalRef.current);
      setIsPlayingPreview(false);
    } else {
      setIsPlayingPreview(true);
      playIntervalRef.current = setInterval(() => {
        setPreviewIndex(prev => (prev + 1) % total);
      }, 100);
    }
  };

  useEffect(() => {
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [videoPreviewUrl]);

  const activeFramesList = resultSummary?.frames || existingFrames || [];

  // ========================================================
  // CHECKLIST TO-DO ITEMS DEFINITION WITH RIGHT MARKS (✓)
  // ========================================================
  const isHasExisting = activeFramesList.length > 0 && !selectedFile;

  // Step 1: Video selection
  const step1Done = Boolean(selectedFile) || isHasExisting;
  const step1Status = step1Done ? 'done' : 'pending';

  // Step 2: Divide into frames
  const step2Active = currentStep === 'dividing_frames';
  const step2Done = ['compressing_webp', 'saving_files', 'syncing_db', 'completed'].includes(currentStep) || isHasExisting;
  const step2Status = step2Done ? 'done' : step2Active ? 'active' : 'pending';

  // Step 3: Size-compress to WebP
  const step3Active = currentStep === 'compressing_webp';
  const step3Done = ['saving_files', 'syncing_db', 'completed'].includes(currentStep) || isHasExisting;
  const step3Status = step3Done ? 'done' : step3Active ? 'active' : 'pending';

  // Step 4: Save frames & manifest
  const step4Active = currentStep === 'saving_files';
  const step4Done = ['syncing_db', 'completed'].includes(currentStep) || isHasExisting;
  const step4Status = step4Done ? 'done' : step4Active ? 'active' : 'pending';

  // Step 5: Sync with invitation database
  const step5Active = currentStep === 'syncing_db';
  const step5Done = currentStep === 'completed' || isHasExisting;
  const step5Status = step5Done ? 'done' : step5Active ? 'active' : 'pending';

  // Step 6: Ready for live scrubbing
  const step6Done = currentStep === 'completed' || isHasExisting;
  const step6Status = step6Done ? 'done' : 'pending';

  const todoList = [
    {
      id: 1,
      title: 'Upload Video & Inspect',
      desc: selectedFile 
        ? `${selectedFile.name} (${videoMeta.duration}s • ${videoMeta.width}x${videoMeta.height} • ${videoMeta.sizeMb}MB)`
        : isHasExisting
          ? 'Video frame set active in invitation'
          : 'Select any MP4, MOV, or WebM video file',
      status: step1Status,
      badge: step1Done ? '✓ Uploaded' : 'Waiting for file'
    },
    {
      id: 2,
      title: 'Divide Video into Frames',
      desc: step2Active
        ? `Dividing frame ${progress.current} of ${progress.total} (${progress.percent}%)...`
        : step2Done
          ? `Divided into ${resultSummary?.frameCount || activeFramesList.length} sequential frames`
          : `Will extract ${targetFrameCount} frames across video timeline`,
      status: step2Status,
      badge: step2Done ? '✓ Divided' : step2Active ? '⏳ Extracting' : 'Step 2'
    },
    {
      id: 3,
      title: 'Size-Compress to WebP',
      desc: step3Active
        ? `Compressing frames to WebP (${webpQuality}% quality)...`
        : step3Done
          ? `WebP compressed (Avg: ${resultSummary?.avgKb || '~35'} KB/frame • Total: ${resultSummary?.totalMb || '~0.9'} MB)`
          : `Quality: ${webpQuality}% • Scale: ${targetResolution} (Target ~35-45 KB/frame)`,
      status: step3Status,
      badge: step3Done ? '✓ Compressed' : step3Active ? '⏳ Compressing' : 'Step 3'
    },
    {
      id: 4,
      title: 'Save to Destination Folder',
      desc: step4Active
        ? `Writing frames to /frames/${targetSlug}/...`
        : step4Done
          ? `Saved to public/frames/${targetSlug}/ & generated manifest.json`
          : `Target folder: /public/frames/${targetSlug}/`,
      status: step4Status,
      badge: step4Done ? '✓ Saved' : step4Active ? '⏳ Writing' : 'Step 4'
    },
    {
      id: 5,
      title: 'Sync with Invitation Database',
      desc: step5Active
        ? `Updating MongoDB cinematicFrames config for /${targetSlug}...`
        : step5Done
          ? `Active & linked to invitation /${targetSlug}`
          : `Will link cinematicFrames to invitation /${targetSlug}`,
      status: step5Status,
      badge: step5Done ? '✓ Linked' : step5Active ? '⏳ Syncing' : 'Step 5'
    },
    {
      id: 6,
      title: 'Ready for Live Scrubbing',
      desc: step6Done
        ? 'All steps complete! Drag slider below to test scrub, or view live.'
        : 'Scrubber preview unlocks as soon as frames are saved',
      status: step6Status,
      badge: step6Done ? '✓ Ready' : 'Pending'
    }
  ];

  const completedCount = todoList.filter(t => t.status === 'done').length;

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. Video Selection & Upload Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#C9956A]/10 text-[#C9956A]">
              <Film size={20} />
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-800 tracking-wide">
                Video to Compressed WebP Frames Converter
              </h4>
              <p className="text-xs text-slate-400">
                Upload any wedding video (.mp4, .mov, .webm). It will be split into size-compressed WebP frames customized for this invitation.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Hardware Accelerated
          </span>
        </div>

        {/* Dropzone */}
        {!selectedFile ? (
          <label className="border-2 border-dashed border-[#C9956A]/40 hover:border-[#C9956A] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-50/50 hover:bg-[#FAF7F2]/50 transition-all">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-14 h-14 rounded-full bg-[#C9956A]/10 flex items-center justify-center text-[#C9956A] shadow-inner">
              <Upload size={24} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-800">
                Click or Drop a Video File Here
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Supports MP4, MOV, WebM (up to 100MB)
              </p>
            </div>
          </label>
        ) : (
          <div className="flex flex-col md:flex-row gap-5 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
            {/* Video Player */}
            <div className="w-full md:w-56 aspect-[9/16] md:aspect-[3/4] bg-black rounded-xl overflow-hidden relative shadow-md shrink-0">
              <video
                src={videoPreviewUrl}
                className="w-full h-full object-contain"
                controls
                playsInline
                muted
              />
            </div>

            {/* Video Info & Settings */}
            <div className="flex-1 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 truncate max-w-xs">
                    {selectedFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setVideoPreviewUrl(null);
                      setCurrentStep('idle');
                    }}
                    className="text-[11px] text-rose-500 hover:underline font-semibold"
                  >
                    Change Video
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-white border border-slate-200 text-center mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Duration</span>
                    <strong className="text-xs font-mono text-slate-800">{videoMeta.duration}s</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Resolution</span>
                    <strong className="text-xs font-mono text-slate-800">{videoMeta.width}x{videoMeta.height}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Size</span>
                    <strong className="text-xs font-mono text-slate-800">{videoMeta.sizeMb} MB</strong>
                  </div>
                </div>

                {/* Conversion Settings Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Frame Count Preset */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Total Frames
                    </label>
                    <select
                      value={targetFrameCount}
                      onChange={(e) => setTargetFrameCount(Number(e.target.value))}
                      disabled={isProcessing}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-white outline-none focus:border-[#C9956A]"
                    >
                      <option value={12}>12 frames (Ultra Fast)</option>
                      <option value={18}>18 frames (Fast)</option>
                      <option value={24}>24 frames (Recommended)</option>
                      <option value={30}>30 frames (Smooth 60fps)</option>
                      <option value={45}>45 frames (Cinema)</option>
                      <option value={60}>60 frames (Maximum Detail)</option>
                    </select>
                  </div>

                  {/* Resolution */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Resolution
                    </label>
                    <select
                      value={targetResolution}
                      onChange={(e) => setTargetResolution(e.target.value)}
                      disabled={isProcessing}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-white outline-none focus:border-[#C9956A]"
                    >
                      <option value="540p">540p (Smallest ~25 KB/frame)</option>
                      <option value="720p">720p (Crisp ~40 KB/frame)</option>
                      <option value="1080p">1080p (Full HD ~75 KB/frame)</option>
                    </select>
                  </div>

                  {/* WebP Quality */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      WebP Quality ({webpQuality}%)
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="95"
                      step="5"
                      value={webpQuality}
                      onChange={(e) => setWebpQuality(Number(e.target.value))}
                      disabled={isProcessing}
                      className="accent-[#C9956A] cursor-pointer mt-2"
                    />
                  </div>

                </div>

                {/* Target Slug Selector */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200/60">
                  <span className="text-[11px] font-semibold text-slate-600">Save for Invitation:</span>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 font-mono text-xs text-[#C9956A]">
                    <span>/{targetSlug}</span>
                  </div>
                </div>

              </div>

              {/* Start Extraction Button */}
              <button
                type="button"
                onClick={handleStartConversion}
                disabled={isProcessing}
                className="w-full py-3 rounded-xl bg-[#C9956A] hover:bg-[#b5845a] text-white font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Processing Frames...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>⚡ Convert Video to Compressed WebP Frames</span>
                  </>
                )}
              </button>

            </div>
          </div>
        )}

        {/* Live Processing Progress Bar */}
        {isProcessing && (
          <div className="flex flex-col gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50/50">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
              <span>{progress.statusText}</span>
              <span className="font-mono">{progress.percent}%</span>
            </div>
            
            <div className="w-full h-2 rounded-full bg-amber-200 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-[#C9956A] transition-all duration-150"
                style={{ width: `${progress.percent}%` }}
              />
            </div>

            {currentFramePreview && (
              <div className="flex items-center gap-3 mt-2">
                <img
                  src={currentFramePreview}
                  alt="Current frame preview"
                  className="w-12 h-16 object-cover rounded-md border border-amber-300 shadow-sm"
                />
                <span className="text-[11px] text-amber-800">
                  Converting frame {progress.current} of {progress.total}...
                </span>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ========================================================
          2. TO-DO COMPLETING PIPELINE CHECKLIST CARD (WITH RIGHT MARKS ✓)
          ======================================================== */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#C9956A]/10 text-[#C9956A]">
              <CheckSquare size={18} />
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Conversion & Setup Checklist
              </h4>
              <p className="text-xs text-slate-400">
                Step-by-step progress checklist for video division, compression, and invitation integration.
              </p>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            completedCount === 6
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {completedCount} of 6 Completed
          </span>
        </div>

        {/* 6 Step Cards with Right Marks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {todoList.map((step) => {
            const isDone = step.status === 'done';
            const isActive = step.status === 'active';

            return (
              <div
                key={step.id}
                className={`p-3.5 rounded-xl border transition-all duration-300 flex items-start gap-3 ${
                  isDone
                    ? 'bg-emerald-50/50 border-emerald-200 shadow-xs'
                    : isActive
                      ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20 shadow-sm'
                      : 'bg-slate-50/60 border-slate-200/80 opacity-70'
                }`}
              >
                {/* Status Indicator Icon / Right Mark */}
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  ) : isActive ? (
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-sm animate-spin">
                      <RefreshCw size={12} strokeWidth={2.5} />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 text-[11px] font-bold flex items-center justify-center">
                      {step.id}
                    </div>
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className={`text-xs font-bold tracking-tight truncate ${
                      isDone ? 'text-emerald-950' : isActive ? 'text-amber-950' : 'text-slate-600'
                    }`}>
                      {step.id}. {step.title}
                    </h5>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                      isDone
                        ? 'bg-emerald-100/80 text-emerald-800'
                        : isActive
                          ? 'bg-amber-200/70 text-amber-800 animate-pulse'
                          : 'bg-slate-200/70 text-slate-500'
                    }`}>
                      {step.badge}
                    </span>
                  </div>

                  <p className={`text-[11px] mt-0.5 leading-relaxed truncate ${
                    isDone ? 'text-emerald-800/80' : isActive ? 'text-amber-900/90 font-medium' : 'text-slate-400'
                  }`}>
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Link after 6/6 Completed */}
        {completedCount === 6 && (
          <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>All 6 steps completed! Frames are active for <strong>/{targetSlug}</strong>.</span>
            </span>
            <a
              href={`/${targetSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1"
            >
              <span>Open Live View</span>
              <ArrowRight size={12} />
            </a>
          </div>
        )}
      </div>

      {/* 3. Interactive Frame Scrubber Preview */}
      {activeFramesList.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#C9956A]/10 text-[#C9956A]">
                <Eye size={16} />
              </span>
              <h4 className="text-sm font-bold text-slate-800">
                Interactive Frame Scrubber Preview
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => togglePlayPreview(activeFramesList.length)}
                className="px-3 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {isPlayingPreview ? <Pause size={12} /> : <Play size={12} />}
                <span>{isPlayingPreview ? 'Pause' : 'Auto Play'}</span>
              </button>
              <span className="text-xs font-mono text-slate-500">
                Frame {previewIndex + 1} / {activeFramesList.length}
              </span>
            </div>
          </div>

          {/* Preview Viewport */}
          <div className="relative aspect-[9/16] max-w-xs mx-auto overflow-hidden rounded-xl border border-[#C9956A]/40 bg-black shadow-lg">
            {activeFramesList[previewIndex] ? (
              <img
                src={activeFramesList[previewIndex]}
                alt={`Preview frame ${previewIndex + 1}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                No Frame Loaded
              </div>
            )}
            
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono border border-white/10">
              Frame {previewIndex + 1} of {activeFramesList.length}
            </div>
          </div>

          {/* Slider Scrubber */}
          <div className="flex items-center gap-3 px-2">
            <span className="text-xs font-mono text-slate-400">1</span>
            <input
              type="range"
              min="0"
              max={activeFramesList.length - 1}
              value={previewIndex}
              onChange={(e) => setPreviewIndex(Number(e.target.value))}
              className="flex-1 accent-[#C9956A] cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-400">
              {activeFramesList.length}
            </span>
          </div>

        </div>
      )}

    </div>
  );
}
