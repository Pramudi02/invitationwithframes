'use client';
import { useState, useCallback, useEffect, useSyncExternalStore } from 'react';
import NextImage from 'next/image';
import AdminLogin from './components/AdminLogin';
import { motion, AnimatePresence } from 'framer-motion';
import ImageCropper from './components/ImageCropper';
import imageCompression from 'browser-image-compression';
import { Trash2, ImageIcon, Upload, X, Heart, Calendar, Book, MapPin, Image as LucideImage, Mail, Palette, Search, Layers, Sparkles, CheckCircle, AlertCircle, Save, ExternalLink, Music, Crop, RefreshCcw, Eye, Download } from 'lucide-react';
import { PRESET_THEMES } from '../../lib/themes';
import { EVENT_LABELS } from '../../lib/eventLabels';

const ImageField = ({ label, hint, value, path, type, onUpload, onDelete, onCrop, accept = "image/*, video/mp4, video/webm" }) => {
  const isVideo = value?.toLowerCase()?.endsWith('.mp4') || value?.includes('video/upload');

  return (
    <FieldGroup label={label} hint={hint}>
      <div className="flex flex-col gap-3">
        {value ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group">
            {isVideo ? (
              <video src={value} className="w-full h-full object-cover" muted playsInline />
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={value} className="w-full h-full object-cover" alt={label} />
              </>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {onCrop && (
                <button
                  type="button"
                  onClick={() => onCrop(path, value, type)}
                  className="w-8 h-8 flex items-center justify-center bg-white text-slate-700 rounded-full shadow-lg hover:bg-slate-50 transition-colors"
                  title="Crop Image"
                >
                  <Crop size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDelete(path, value);
                }}
                className="w-8 h-8 flex items-center justify-center bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors"
                title="Remove Image"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-400">
            <ImageIcon size={24} className="mb-2 opacity-20" />
            <p className="text-[10px] uppercase tracking-widest font-bold">No Image Selected</p>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter image URL..."
            className={inputCls}
            value={value || ''}
            onChange={e => onUpload(null, path, type, e.target.value)}
            maxLength={2000}
            title={value || ''}
          />
          <label className="shrink-0 cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
            <Upload size={14} />
            Upload
            <input
              type="file"
              className="hidden"
              accept={accept}
              onChange={e => onUpload(e.target.files[0], path, type)}
            />
          </label>
        </div>
      </div>
    </FieldGroup>
  );
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//  Tiny reusable field components
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function FieldGroup({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[0.7rem] font-bold tracking-[0.12em] uppercase text-slate-500">{label}</label>
      {hint && <p className="text-[0.68rem] text-slate-400 -mt-0.5">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls = `w-full px-3 py-2.5 rounded-lg border border-slate-200
  text-sm text-slate-800 bg-white outline-none
  focus:border-[#C9956A] focus:ring-2 focus:ring-[#C9956A]/15
  placeholder:text-slate-300 transition-all duration-200`;

const textareaCls = `${inputCls} resize-y min-h-[80px]`;

function LabelField({ label, fieldKey, hint, value, onChange, placeholder }) {
  return (
    <FieldGroup label={label} hint={hint}>
      <input
        className={inputCls}
        value={value}
        onChange={e => onChange(fieldKey, e.target.value)}
        placeholder={placeholder || ''}
      />
    </FieldGroup>
  );
}

function SectionCard({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full px-6 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <h3 className="font-semibold text-slate-700 text-sm tracking-wide">{title}</h3>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? '' : '-rotate-90'}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-6 pt-1 border-t border-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function ColourField({ label, value, onChange }) {
  return (
    <FieldGroup label={label}>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-10 h-10 p-0.5 rounded-lg border border-slate-200 cursor-pointer bg-white"
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className={inputCls}
        />
      </div>
    </FieldGroup>
  );
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//  Toast
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function Toast({ type, message, onClose }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3
        px-5 py-4 rounded-xl shadow-lg max-w-sm
        ${type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          : 'bg-red-50 border border-red-200 text-red-800'}`}
    >
      <span className="text-lg">
        {type === 'success' ? <CheckCircle size={20} className="text-emerald-500" /> : <AlertCircle size={20} className="text-red-500" />}
      </span>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="text-current opacity-50 hover:opacity-100 transition-opacity"><X size={16} /></button>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//  Gallery row editor
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function GalleryEditor({ gallery, onChange, onUpload, onDelete }) {
  const addPhoto = () => onChange([...gallery, { src: '', alt: '' }]);
  const removePhoto = (i) => {
    const photo = gallery[i];
    if (photo.src && photo.src.startsWith('/images/')) {
      onDelete(`gallery.${i}.src`, photo.src, true, i);
    } else {
      onChange(gallery.filter((_, idx) => idx !== i));
    }
  };
  const updatePhoto = (i, key, val) => {
    const updated = gallery.map((p, idx) => idx === i ? { ...p, [key]: val } : p);
    onChange(updated);
  };

  return (
    <div className="col-span-2 flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {gallery.map((photo, i) => (
          <div key={i} className="relative group bg-slate-50 rounded-xl border border-slate-200 overflow-hidden p-2">
            <div
              className="w-full rounded-lg overflow-hidden mb-2 bg-white relative shadow-sm border border-slate-100"
              style={{ aspectRatio: '3 / 4' }}
            >
              {photo.src ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                  <ImageIcon size={24} className="opacity-20" />
                  <span className="text-[0.6rem] font-bold uppercase mt-1">No Image</span>
                </div>
              )}
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                <span className="text-[0.6rem] text-white font-bold uppercase">{photo.src ? 'Change' : 'Upload'}</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={e => onUpload(e.target.files[0], `gallery.${i}.src`, 'gallery')}
                />
              </label>
            </div>
            <input
              type="text"
              placeholder="URL"
              value={photo.src}
              onChange={e => updatePhoto(i, 'src', e.target.value)}
              className="text-[0.65rem] w-full p-1 border-b border-slate-200 outline-none mb-1 bg-transparent"
            />
            <input
              type="text"
              placeholder="Alt text"
              value={photo.alt}
              onChange={e => updatePhoto(i, 'alt', e.target.value)}
              className="text-[0.65rem] w-full p-1 outline-none bg-transparent"
            />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute top-1 right-1 w-6 h-6 bg-white/90 text-red-500 rounded-full shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >--</button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addPhoto}
        className="self-start text-xs font-semibold text-[#C9956A] flex items-center gap-1 hover:underline"
      >+ Add New Photo Entry</button>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//  Extra Events editor (dynamic list)
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function ExtraEventsEditor({ events, onChange, onUpload, onDelete }) {
  const addEvent = () => onChange([...events, {
    title: '', icon: '🎉', time: '', venueName: '', address: '', mapsUrl: '', dressCode: '', image: ''
  }]);
  const removeEvent = (i) => onChange(events.filter((_, idx) => idx !== i));
  const updateEvent = (i, key, val) => onChange(events.map((e, idx) => idx === i ? { ...e, [key]: val } : e));

  return (
    <div className="col-span-2 flex flex-col gap-6">
      {events.length === 0 && (
        <p className="text-sm text-slate-400 italic text-center py-4 border border-dashed border-slate-200 rounded-xl">
          No additional events yet. Click below to add one.
        </p>
      )}
      {events.map((event, i) => (
        <div key={i} className="relative border border-slate-200 rounded-xl p-5 bg-slate-50">
          <button
            type="button"
            onClick={() => removeEvent(i)}
            className="absolute top-3 right-3 w-7 h-7 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center hover:bg-rose-200 transition-colors"
          >
            <Trash2 size={14} />
          </button>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Extra Event {i + 1}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldGroup label="Title">
              <input type="text" className={inputCls} value={event.title || ''} onChange={e => updateEvent(i, 'title', e.target.value)} placeholder="e.g. Reception" />
            </FieldGroup>
            <FieldGroup label="Emoji Icon">
              <input type="text" className={inputCls} value={event.icon || ''} onChange={e => updateEvent(i, 'icon', e.target.value)} placeholder="🎉" />
            </FieldGroup>
            <FieldGroup label="Time">
              <input type="text" className={inputCls} value={event.time || ''} onChange={e => updateEvent(i, 'time', e.target.value)} placeholder="2:00 PM" />
            </FieldGroup>
            <FieldGroup label="Dress Code">
              <input type="text" className={inputCls} value={event.dressCode || ''} onChange={e => updateEvent(i, 'dressCode', e.target.value)} placeholder="Smart Casual" />
            </FieldGroup>
            <FieldGroup label="Venue Name">
              <input type="text" className={inputCls} value={event.venueName || ''} onChange={e => updateEvent(i, 'venueName', e.target.value)} placeholder="Grand Ballroom" />
            </FieldGroup>
            <FieldGroup label="Address">
              <input type="text" className={inputCls} value={event.address || ''} onChange={e => updateEvent(i, 'address', e.target.value)} placeholder="123 Main St, Colombo" />
            </FieldGroup>
            <FieldGroup label="Google Maps URL" hint="Paste a Google Maps link here">
              <input type="url" className={inputCls} value={event.mapsUrl || ''} onChange={e => updateEvent(i, 'mapsUrl', e.target.value)} placeholder="https://maps.google.com/..." />
            </FieldGroup>
          </div>
          <div className="mt-4">
            <ImageField
              label="Event Image"
              hint="Optional photo for this event (appears in Layout 4)"
              value={event.image || ''}
              path={`extraEvents.${i}.image`}
              type="general"
              onUpload={onUpload}
              onDelete={onDelete}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addEvent}
        className="self-start text-xs font-semibold text-[#C9956A] flex items-center gap-1 hover:underline"
      >
        + Add Extra Event
      </button>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------------// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//  MAIN ADMIN PAGE (Multi-Tenant Container)
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default function AdminPage() {
  const [view, setView] = useState('list'); // 'list' or 'edit'
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [toast, setToast] = useState(null);

  const isAuthenticated = useSyncExternalStore(
    () => () => {},
    () => typeof localStorage !== 'undefined' && localStorage.getItem('wedding_admin_auth') === 'true',
    () => false,
  );

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  if (!isAuthenticated) {
    return (
      <AdminLogin
        onLogin={() => {
          localStorage.setItem('wedding_admin_auth', 'true');
          window.location.reload();
        }}
      />
    );
  }

  return (
    <>
      {view === 'list' ? (
        <InvitationList
          onEdit={(slug) => {
            setSelectedSlug(slug);
            setView('edit');
          }}
          showToast={showToast}
        />
      ) : (
        <AdminDashboard
          slug={selectedSlug}
          onBack={() => setView('list')}
          showToast={showToast}
        />
      )}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

// ─── Download Media Backup ─────────────────────────────────────────────────
function DownloadBackupButton({ slug }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch(`/api/export-media/${slug}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to download backup');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${slug}-media-backup.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Backup download error:', err);
      alert(err.message || 'Failed to download backup. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className={`mt-2 w-full py-2 rounded-lg text-[0.65rem] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 ${
        loading
          ? 'bg-amber-50 text-amber-600'
          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
      }`}
      title="Download all media assets as a ZIP archive"
    >
      {loading ? (
        <><div className="w-3 h-3 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" /> Zipping files... Please wait</>
      ) : (
        <><Download size={12} /> Download Backup (ZIP)</>
      )}
    </button>
  );
}

// ─── Share Client Portal — card-level (list view) ──────────────────────────
function SharePortalButton({ slug, passcode }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e) => {
    e.stopPropagation();
    const baseUrl = window.location.origin;
    const msg = passcode
      ? `Your dashboard login details:\nLink: ${baseUrl}/client-login\nUsername: ${slug}\nPasscode: ${passcode}`
      : `Your invitation link: ${baseUrl}/${slug}\nClient dashboard: ${baseUrl}/client-login (no passcode set yet)`;
    try {
      await navigator.clipboard.writeText(msg);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = msg;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`mt-2 w-full py-2 rounded-lg text-[0.65rem] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 ${
        copied
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-violet-50 text-violet-600 hover:bg-violet-100'
      }`}
      title={passcode ? 'Copy client portal login details' : 'Copy portal link (no passcode set)'}
    >
      {copied ? (
        <><CheckCircle size={12} /> Copied!</>
      ) : (
        <><ExternalLink size={12} /> Share Client Portal</>
      )}
    </button>
  );
}

// ─── Share Client Portal — editor meta tab ──────────────────────────────────
function ClientPortalShareButton({ slug, passcode }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const baseUrl = window.location.origin;
    const msg = passcode
      ? `Your dashboard login details:\nLink: ${baseUrl}/client-login\nUsername: ${slug}\nPasscode: ${passcode}`
      : `Your client dashboard: ${baseUrl}/client-login\nUsername: ${slug}\n(No passcode set — add one above and save first)`;
    try {
      await navigator.clipboard.writeText(msg);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = msg;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
        copied
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-violet-50 text-violet-600 border border-violet-200 hover:bg-violet-100'
      }`}
    >
      {copied ? <CheckCircle size={14} /> : <ExternalLink size={14} />}
      {copied ? 'Copied to Clipboard!' : 'Copy Login Details for Client'}
    </button>
  );
}

function InvitationList({ onEdit, showToast }) {

  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newSlug, setNewSlug] = useState('');
  const [confirmDeleteSlug, setConfirmDeleteSlug] = useState(null);

  const fetchInvitations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/config');
      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error(data.error || 'Server returned invalid data format');
      }

      setInvitations(data.map(item => ({
        ...item,
        slug: item.slug || 'global_config',
        displayNames: item.displayNames || item.couple?.displayNames || 'Legacy Invitation'
      })));
    } catch (err) {
      console.error('[InvitationList] Fetch error:', err);
      setError(err.message);
      showToast('error', 'Failed to load invitations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvitations(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFavourite = async (slug, current) => {
    // Optimistic update
    setInvitations(prev => prev.map(inv => inv.slug === slug ? { ...inv, isFavourite: !current } : inv));
    try {
      const res = await fetch(`/api/config?slug=${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavourite: !current }),
      });
      if (!res.ok) throw new Error('Failed');
    } catch {
      // Revert on failure
      setInvitations(prev => prev.map(inv => inv.slug === slug ? { ...inv, isFavourite: current } : inv));
      showToast('error', 'Failed to update favourite');
    }
  };

  const handleDeleteInvitation = async (slug) => {
    setLoading(true);
    try {
      const url = `/api/config?${new URLSearchParams({ slug }).toString()}`;
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        setInvitations(prev => prev.filter(inv => inv.slug !== slug));
        setConfirmDeleteSlug(null);
        showToast('success', 'Invitation deleted successfully.');
      } else {
        showToast('error', data.error || 'Failed to delete invitation.');
      }
    } catch (err) {
      console.error('[InvitationList] Deletion Error:', err);
      showToast('error', 'Deletion failed due to a server error.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newSlug) return;
    setLoading(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: newSlug }),
      });
      const data = await res.json();
      if (data.success) {
        setCreating(false);
        setNewSlug('');
        fetchInvitations();
        onEdit(newSlug);
        showToast('success', 'New invitation created!');
      } else {
        showToast('error', data.error);
      }
    } catch (err) {
      showToast('error', 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  const getDateStatus = (dateTimeISO) => {
    if (!dateTimeISO) return null;
    try {
      const target = new Date(dateTimeISO);
      const now = new Date();

      // Reset times to compare dates only
      const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());
      const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const diffTime = targetDate - nowDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return { label: 'Today!', cls: 'bg-amber-100 text-amber-800' };
      } else if (diffDays > 0) {
        return { label: `${diffDays} Days Left`, cls: 'bg-emerald-100 text-emerald-800' };
      } else {
        return { label: 'Completed', cls: 'bg-gray-100 text-gray-600' };
      }
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-serif text-slate-800">Wedding Invitations</h1>
            <p className="text-slate-500 text-sm">Manage all your client invitations from one place.</p>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="px-6 py-3 bg-[#C9956A] text-white rounded-xl font-bold uppercase text-xs shadow-lg hover:bg-[#b5845a] transition-all"
          >
            + Create New Invitation
          </button>
        </header>

        {loading && !invitations.length ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 border-4 border-[#C9956A]/20 border-t-[#C9956A] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-medium">Loading invitations...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-rose-100 shadow-sm">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-lg font-serif text-slate-800 mb-2">Failed to Load</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">{error}</p>
            <button
              onClick={fetchInvitations}
              className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search size={24} />
            </div>
            <h3 className="text-lg font-serif text-slate-800 mb-2">No Invitations Yet</h3>
            <p className="text-slate-400 text-sm mb-8">Get started by creating your first wedding invitation.</p>
            <button
              onClick={() => setCreating(true)}
              className="px-8 py-3 bg-[#C9956A] text-white rounded-xl font-bold uppercase text-xs shadow-lg hover:bg-[#b5845a] transition-all"
            >
              + Create First Invitation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invitations.map((inv) => {
              const status = getDateStatus(inv.wedding?.dateTimeISO);
              return (
                <div key={inv.slug} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <button
                      type="button"
                      onClick={() => toggleFavourite(inv.slug, !!inv.isFavourite)}
                      title={inv.isFavourite ? 'Remove from favourites' : 'Add to favourites'}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                        inv.isFavourite
                          ? 'bg-rose-50 hover:bg-rose-100'
                          : 'bg-[#C9956A]/10 hover:bg-rose-50'
                      }`}
                    >
                      <Heart
                        size={20}
                        className={`transition-all duration-200 ${
                          inv.isFavourite ? 'text-rose-500 fill-rose-500' : 'text-[#C9956A]'
                        }`}
                      />
                    </button>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`text-[0.6rem] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${inv.slug === 'global_config'
                          ? 'bg-slate-50 text-slate-400'
                          : (inv.isActive === false)
                            ? 'bg-red-50 text-red-500'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}>
                        {inv.slug === 'global_config' ? 'Legacy' : (inv.isActive === false ? 'Inactive' : 'Active')}
                      </span>
                      {status && (
                        <span className={`text-[0.6rem] font-bold px-2 py-1 rounded-md transition-all ${status.cls}`}>
                          {status.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-lg font-serif text-slate-800 mb-1 line-clamp-1">{inv.displayNames || 'Untitled Invitation'}</h3>
                  <p className="text-slate-400 text-xs mb-6">
                    {inv.eventType && inv.eventType !== 'wedding' && (
                      <span className="inline-block mr-2 px-1.5 py-0.5 rounded text-[0.55rem] font-bold uppercase tracking-widest bg-violet-50 text-violet-400">{inv.eventType}</span>
                    )}
                    Slug: <span className="text-slate-600 font-mono tracking-tighter">/{inv.slug}</span>
                  </p>

                  <div className="flex gap-2 relative z-10">
                    <button
                      onClick={() => onEdit(inv.slug)}
                      className="flex-[2] py-2.5 bg-slate-50 text-slate-700 text-[0.65rem] font-bold uppercase tracking-widest rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      Edit Config
                    </button>
                    <a
                      href={`/${inv.slug}`}
                      target="_blank"
                      className="flex-[2] py-2.5 bg-[#C9956A]/5 text-[#C9956A] text-[0.65rem] font-bold uppercase tracking-widest rounded-lg hover:bg-[#C9956A]/15 transition-colors text-center"
                    >
                      Live View
                    </a>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setConfirmDeleteSlug(inv.slug);
                      }}
                      className="flex-1 flex items-center justify-center py-2.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {/* Share Client Portal */}
                  <SharePortalButton slug={inv.slug} passcode={inv.clientPasscode} />
                  {/* Download Backup */}
                  <DownloadBackupButton slug={inv.slug} />
                </div>
              );
            })}
          </div>
        )}

        <AnimatePresence>
          {confirmDeleteSlug && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
              {/* Premium Backdrop Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmDeleteSlug(null)}
                className="absolute inset-0 bg-black/50 backdrop-blur-md"
              />

              {/* Premium Modal Box */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 15 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative bg-white/95 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-xl p-8 max-w-md w-full text-center"
              >
                <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                  <AlertCircle size={32} />
                </div>
                <h2 className="text-2xl font-serif text-neutral-800 dark:text-neutral-100 mb-3">Delete Invitation?</h2>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-8 leading-relaxed">
                  Are you sure you want to delete <span className="font-bold text-neutral-700 dark:text-neutral-200">/{confirmDeleteSlug}</span>? This will permanently remove all data and linked photos. This action cannot be undone.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteSlug(null)}
                    className="flex-1 py-3 px-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-lg font-bold uppercase text-[10px] tracking-widest hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteInvitation(confirmDeleteSlug);
                    }}
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-rose-500 text-white rounded-lg font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-600 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Deleting...' : 'Yes, Delete Permanently'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {creating && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
            >
              <h2 className="text-2xl font-serif text-slate-800 mb-2">New Invitation</h2>
              <p className="text-slate-400 text-sm mb-6">Enter a unique URL slug for this wedding (only lowercase letters and hyphens).</p>
              <form onSubmit={handleCreate}>
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. kasun-nimesha-2026"
                  className={inputCls}
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  required
                />
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setCreating(false)}
                    className="flex-1 py-3 text-slate-400 text-xs font-bold uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-[#C9956A] text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-[#C9956A]/40"
                  >
                    {loading ? 'Creating...' : 'Initialize'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminDashboard({ slug, onBack, showToast }) {
  const defaultRsvpFields = [
    { id: "guestName", type: "text", label: "Guest Name", placeholder: "Enter your full name", required: true },
    { id: "attending", type: "button-group", label: "Attending?", options: "Joyfully Accept,Regretfully Decline", required: true },
    { id: "guestCount", type: "guest-count", label: "Guest Count", placeholder: "1", required: true },
    { id: "menu", type: "checkbox-group", label: "Menu Choice", options: "Chicken,Fish,Vegetarian", required: false },
    { id: "message", type: "textarea", label: "Message to the Couple", placeholder: "Write your wishes here...", required: false }
  ];

  // ------ Data State ------------------------------------------------------------------------------------------------------------------------------------------------
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [activeTab, setActiveTab] = useState('couple');
  const [confirmDelete, setConfirmDelete] = useState(null); // { path, url, isGallery, index }
  const [eventType, setEventType] = useState('wedding');
  const [savingEventType, setSavingEventType] = useState(false);
  const [birthdayData, setBirthdayData] = useState({ celebrantName: '', age: null, birthdayTheme: '', wishMessage: '' });
  const [generalData, setGeneralData] = useState({ eventTitle: '', hostName: '', customBodyText: '', eventType2: '' });
  const [labelOverrides, setLabelOverrides] = useState({});

  // ------ Cropper State ------------------------------------------------------------------------------------------------------------------------------
  const [cropping, setCropping] = useState(null); // { file, path, type, aspect }

  // ------ Cinematic Video ZIP Upload State ----------------------------------------------------------------------------------------------------------
  const [zipUploading, setZipUploading] = useState(false);
  const [zipMessage, setZipMessage] = useState('');
  const [previewFrameIndex, setPreviewFrameIndex] = useState(0);

  // Deep setter helper
  const setPath = useCallback((path, value) => {
    setConfig(prev => {
      const keys = path.split('.');
      const next = JSON.parse(JSON.stringify(prev));
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);


  const handleUpload = async (file, path, type = 'general', manualValue = null) => {
    if (manualValue !== null) {
      setPath(path, manualValue);
      return;
    }
    if (!file) return;

    // Reject files larger than 10MB
    if (file.size > 10 * 1024 * 1024) {
      showToast('error', 'File too large! Maximum file size is 10MB.');
      return;
    }

    // Determine oldImage based on path
    const keys = path.split('.');
    let currentVal = config;
    try {
      for (let k of keys) currentVal = currentVal[k];
    } catch (e) { currentVal = null; }
    const oldImage = typeof currentVal === 'string' ? currentVal : null;

    // 1. Initial Compression (Reduce huge files before cropping/sending)
    let processedFile = file;
    const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
    const isVideo = file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mp4');
    const isAudio = type === 'audio' || file.type.startsWith('audio/') || file.name.toLowerCase().endsWith('.mp3');

    if (!isGif && !isVideo && !isAudio && file.size > 1024 * 1024) { // Only compress non-GIFs/non-Audio/non-Video > 1MB
      showToast('success', 'Optimizing file size...');
      try {
        const options = {
          maxSizeMB: 2,
          maxWidthOrHeight: 2560,
          useWebWorker: true
        };
        processedFile = await imageCompression(file, options);
      } catch (err) {
        console.error('Compression error:', err);
      }
    }

    // 2. Determine if cropping is needed (But skip for GIFs, Videos, and Audio, and strictly for Layout 9 Full Cover)
    //    Full-section replacements are shown uncropped at their natural aspect ratio, like the Layout 9 cover.
    const isFullBleed = path === 'sectionBackgrounds.hero' || String(path || '').startsWith('sectionReplacements.');
    if ((type === 'hero' || type === 'gallery' || type === 'banner') && !isGif && !isVideo && !isAudio && !isFullBleed) {
      let aspect = 1.0;
      if (type === 'hero') {
        aspect = 3 / 4;
      } else if (type === 'gallery') {
        aspect = 0.75; // Standard 3:4 Portrait for masonry
      } else if (type === 'banner') {
        aspect = 3 / 1; // Default to Banner 3:1
      }

      setCropping({
        file: URL.createObjectURL(processedFile),
        path,
        type,
        aspect,
        oldImage
      });
      return;
    }

    // 3. Direct upload for other types
    await performUpload(processedFile, path, type, oldImage);
  };

  const performUpload = async (file, path, type, oldImage) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (oldImage) {
      formData.append('oldImage', oldImage);
    }

    setLoading(true);
    showToast('success', 'Uploading to server...');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        // Update config with new URL
        setPath(path, data.url);

        // These fields are used by the public invitation immediately after upload.
        // Persist them now so other devices do not depend on the admin form's
        // local state or a later manual Save click.
        const autoSavePaths = [
          'coupleRevealOpeningBgImage',
          'heroDecorationLeftImage',
          'heroDecorationRightImage'
        ];
        if (autoSavePaths.includes(path)) {
          const nextConfig = JSON.parse(JSON.stringify(config));
          const keys = path.split('.');
          let target = nextConfig;
          keys.slice(0, -1).forEach(key => {
            if (!target[key]) target[key] = {};
            target = target[key];
          });
          target[keys[keys.length - 1]] = data.url;

          const saveRes = await fetch(`/api/config?slug=${slug}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nextConfig)
          });
          const saveData = await saveRes.json();
          if (!saveRes.ok || !saveData.success) {
            throw new Error(saveData.error || 'Cloudinary upload succeeded, but saving the image URL failed.');
          }
          showToast('success', 'Image uploaded to Cloudinary and saved.');
        }
        return data;
      } else {
        showToast('error', data.error || 'Upload failed');
      }
    } catch (err) {
      showToast('error', err.message || 'Upload error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleZipUpload = async (file) => {
    if (!file) return;
    setZipUploading(true);
    setZipMessage('Uploading ZIP archive and extracting frames...');
    showToast('success', 'Processing ZIP archive...');

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('slug', slug || config?.slug || 'wedding');

      const res = await fetch('/api/upload-frames', {
        method: 'POST',
        body: fd
      });
      const data = await res.json();

      if (data.success) {
        setZipMessage(`Success! Extracted ${data.frameCount} frames.`);
        setPath('cinematicFrames', {
          enabled: true,
          frameCount: data.frameCount,
          frames: data.frames,
          folder: data.folder,
          poster: data.frames[0] || ''
        });
        setPreviewFrameIndex(0);
        showToast('success', `Extracted ${data.frameCount} frames from ZIP!`);
      } else {
        setZipMessage(`Error: ${data.error || 'Failed to extract'}`);
        showToast('error', data.error || 'Failed to extract ZIP');
      }
    } catch (err) {
      setZipMessage(`Error: ${err.message}`);
      showToast('error', err.message);
    } finally {
      setZipUploading(false);
    }
  };

  const handleCropExisting = (path, imageUrl, type) => {
    let aspect = 1.0;
    if (type === 'hero') aspect = 3 / 4;
    else if (type === 'gallery') aspect = 0.75;
    else if (type === 'banner') aspect = 3 / 1;

    setCropping({
      file: imageUrl,
      path,
      type,
      aspect,
      isExisting: true
    });
  };

  const onCropComplete = async (croppedBlob) => {
    if (!cropping) return;
    if (cropping.isExisting) {
      await performUpload(croppedBlob, cropping.path, cropping.type, cropping.file);
    } else {
      await performUpload(croppedBlob, cropping.path, cropping.type, cropping.oldImage);
    }
    setCropping(null);
  };

  const loadConfig = useCallback(async () => {
    setFetching(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/config?slug=${slug}`);
      const data = await res.json();
      if (data.success === false) throw new Error(data.error || 'Failed to fetch invitation config');
      setConfig(data);
      const resolvedType = data.eventType || 'wedding';
      setEventType(resolvedType);
      // Load type-specific data from separate collections (settings is never modified)
      if (resolvedType === 'birthday') {
        const bRes = await fetch(`/api/birthday-data?slug=${slug}`);
        const bData = await bRes.json();
        if (bData.success !== false) setBirthdayData(bData);
      }
      if (resolvedType === 'general') {
        const gRes = await fetch(`/api/general-data?slug=${slug}`);
        const gData = await gRes.json();
        if (gData.success !== false) setGeneralData(gData);
      }
      // Load per-invitation label overrides
      const loRes = await fetch(`/api/label-overrides?slug=${slug}`);
      const loData = await loRes.json();
      if (loData && loData.success !== false) setLabelOverrides(loData);
    } catch (err) {
      console.error('[AdminDashboard] Load error:', err);
      setFetchError(err.message);
      showToast('error', `Failed to load invitation '${slug}': ${err.message}`);
    } finally {
      setFetching(false);
    }
  }, [slug, showToast]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    if (activeTab === 'edit' || activeTab === 'list') {
      // no-op here now
    }
  }, [activeTab]);

  const handleEventTypeSave = async (newType) => {
    setSavingEventType(true);
    try {
      const res = await fetch(`/api/event-type?slug=${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: newType }),
      });
      const data = await res.json();
      if (data.success) {
        setEventType(newType);
        showToast('success', `Event type set to "${newType}"`);
        // Load type-specific data when switching to birthday or general
        if (newType === 'birthday') {
          const bRes = await fetch(`/api/birthday-data?slug=${slug}`);
          const bData = await bRes.json();
          if (!bData.success === false) setBirthdayData(bData);
        }
        if (newType === 'general') {
          const gRes = await fetch(`/api/general-data?slug=${slug}`);
          const gData = await gRes.json();
          if (!gData.success === false) setGeneralData(gData);
        }
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      showToast('error', `Failed to update event type: ${err.message}`);
    } finally {
      setSavingEventType(false);
    }
  };

  const handleBirthdayDataSave = async (silent = false) => {
    try {
      const res = await fetch(`/api/birthday-data?slug=${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(birthdayData),
      });
      if (res.ok) {
        if (!silent) showToast('success', 'Birthday details saved');
      } else {
        if (!silent) showToast('error', 'Failed to save birthday details');
        throw new Error('Birthday details failed');
      }
    } catch (err) {
      if (!silent) showToast('error', `Failed to save: ${err.message}`);
      if (silent) throw err;
    }
  };

  const handleGeneralDataSave = async (silent = false) => {
    try {
      const res = await fetch(`/api/general-data?slug=${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generalData),
      });
      if (res.ok) {
        if (!silent) showToast('success', 'Event details saved');
      } else {
        if (!silent) showToast('error', 'Failed to save event details');
        throw new Error('Event details failed');
      }
    } catch (err) {
      if (!silent) showToast('error', `Failed to save: ${err.message}`);
      if (silent) throw err;
    }
  };

  const handleLabelOverridesSave = async (silent = false) => {
    try {
      const res = await fetch(`/api/label-overrides?slug=${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(labelOverrides),
      });
      if (res.ok) {
        if (!silent) showToast('success', 'Labels saved successfully!');
      } else {
        if (!silent) showToast('error', 'Failed to save labels');
        throw new Error('Labels failed');
      }
    } catch (err) {
      if (!silent) showToast('error', `Failed to save labels: ${err.message}`);
      if (silent) throw err;
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      // Save all auxiliary data silently
      await Promise.all([
        handleBirthdayDataSave(true),
        handleGeneralDataSave(true),
        handleLabelOverridesSave(true)
      ]);

      const res = await fetch(`/api/config?slug=${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Configuration saved successfully!');
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      showToast('error', `Save failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (path, oldImageUrl, isGallery = false, index = -1) => {
    if (!oldImageUrl) return;

    // We only perform server-side delete if it's a Cloudinary URL
    // If it's a local placeholder /images/..., we just clear it from the state
    if (!oldImageUrl.includes('cloudinary.com')) {
      if (isGallery && index > -1) {
        const newGallery = [...(config?.gallery || [])];
        newGallery.splice(index, 1);
        setConfig(prev => ({ ...prev, gallery: newGallery }));
      } else {
        setPath(path, '');
      }
      showToast('success', 'Image reference removed.');
      return;
    }

    // For Cloudinary images, we use our premium custom confirmation modal.
    setConfirmDelete({ path, url: oldImageUrl, isGallery, index });
  };

  const executeDeleteImage = async () => {
    if (!confirmDelete) return;
    const { path, url, isGallery, index } = confirmDelete;

    try {
      setLoading(true);
      const res = await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: url }),
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.error || 'Failed to delete image');

      if (isGallery && index > -1) {
        const newGallery = [...config.gallery];
        newGallery.splice(index, 1);
        setConfig(prev => ({ ...prev, gallery: newGallery }));
      } else {
        setPath(path, '');
      }

      // CRITICAL: We must auto-save the config after a successful cloud deletion 
      // to ensure the null/empty value is persisted to the database.
      setTimeout(() => {
        const btn = document.getElementById('save-config-btn');
        if (btn) btn.click();
      }, 500);

      showToast('success', 'Image permanently deleted from cloud!');
    } catch (err) {
      showToast('error', `Delete failed: ${err.message}`);
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  };

  if (fetching || (!config && !fetchError)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-[#C9956A]/30 border-t-[#C9956A] animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500 font-sans">Loading Dashboard Data...</p>
        </div>
      </div>
    );
  }

  if (fetchError || !config || !config.couple) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-6">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-serif text-slate-800 mb-2">Editor Error</h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-sm">
          We couldn&apos;t load the configuration for <span className="font-bold text-slate-700">/{slug}</span>.
          {fetchError || 'Configuration data is missing or incomplete.'}
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={loadConfig}
            className="w-full py-4 bg-[#C9956A] text-white rounded-2xl font-bold uppercase text-xs tracking-widest shadow-lg hover:bg-[#b5845a] transition-all"
          >
            Try Again
          </button>
          <button
            onClick={onBack}
            className="w-full py-4 bg-white text-slate-400 rounded-2xl font-bold uppercase text-xs tracking-widest border border-slate-100 hover:bg-slate-50 transition-all"
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'couple', label: '💑 Couple' },
    { id: 'wedding', label: '📅 Event' },
    { id: 'labels', label: '✏️ Labels' },
    { id: 'story', label: '📖 Story' },
    { id: 'events', label: '📍 Events' },
    { id: 'gallery', label: '🖼 Gallery' },
    { id: 'timeline', label: '⏳ Timeline' },
    { id: 'rsvp', label: '✉️ RSVP Settings' },
    { id: 'theme', label: '🎨 Theme' },
    { id: 'meta', label: '🔍 SEO' },
    { id: 'backgrounds', label: '🖼️ Backgrounds' },
    { id: 'replacements', label: '🔁 Replace Sections' },
    { id: 'decor', label: '✨ Decoration' },
    { id: 'cinematic', label: '🎬 Scroll Video (ZIP)' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {cropping && (
        <ImageCropper
          image={cropping.file}
          aspect={cropping.aspect}
          onCropComplete={onCropComplete}
          onCancel={() => setCropping(null)}
        />
      )}

      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-400 transition-colors"
            >
              <X size={20} />
            </button>
            <h1 className="font-bold text-slate-800 text-sm hidden sm:block">Editor: /{slug}</h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/${slug}`}
              target="_blank"
              rel="noopener"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
              </svg>
              View Live
            </a>
            {/* Event Type Selector */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Type</span>
              <select
                value={eventType}
                disabled={savingEventType}
                onChange={e => handleEventTypeSave(e.target.value)}
                className="text-xs font-semibold text-slate-700 bg-transparent border-none outline-none cursor-pointer disabled:opacity-60"
                title="Event type controls section headings and message labels"
              >
                <option value="wedding">💍 Wedding</option>
                <option value="engagement">💌 Engagement</option>
                <option value="birthday">🎂 Birthday</option>
                <option value="general">📩 General</option>
              </select>
              {savingEventType && <span className="w-3 h-3 rounded-full border-2 border-slate-300 border-t-[#C9956A] animate-spin" />}
            </div>
            {/* Active / Inactive toggle */}
            <button
              type="button"
              onClick={() => setPath('isActive', !(config?.isActive ?? true))}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold tracking-wide uppercase border transition-all duration-200 ${(config?.isActive ?? true)
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                }`}
              title={(config?.isActive ?? true) ? 'Invitation is ACTIVE — click to deactivate' : 'Invitation is INACTIVE — click to activate'}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${(config?.isActive ?? true) ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              {(config?.isActive ?? true) ? 'Active' : 'Inactive'}
            </button>
            <button
              form="config-form"
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C9956A] text-white text-xs font-bold tracking-wide uppercase shadow-[0_2px_10px_rgba(201,149,106,0.4)] hover:bg-[#b5845a] disabled:opacity-60 transition-all duration-200"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                <>
                  <Save size={14} /> Save Config
                </>
              )}
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-0.5 overflow-x-auto pb-0 scrollbar-hide">
          {tabs.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`shrink-0 px-3 sm:px-4 py-2.5 text-xs font-semibold tracking-wide border-b-2 transition-all duration-200 whitespace-nowrap ${activeTab === t.id ? 'border-[#C9956A] text-[#C9956A]' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <form id="config-form" onSubmit={handleSave}>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-5">
          {/* ── BIRTHDAY FIELDS — only visible when eventType === 'birthday' ── */}
          {activeTab === 'couple' && eventType === 'birthday' && (
            <SectionCard title="Birthday Details" icon="🎂">
              <FieldGroup label="Celebrant Name">
                <input className={inputCls} value={birthdayData.celebrantName || ''}
                  onChange={e => setBirthdayData(d => ({ ...d, celebrantName: e.target.value }))} />
              </FieldGroup>
              <FieldGroup label="Age">
                <input type="number" className={inputCls} value={birthdayData.age || ''}
                  onChange={e => setBirthdayData(d => ({ ...d, age: Number(e.target.value) }))} />
              </FieldGroup>
              <FieldGroup label="Party Theme">
                <input className={inputCls} value={birthdayData.birthdayTheme || ''}
                  onChange={e => setBirthdayData(d => ({ ...d, birthdayTheme: e.target.value }))} />
              </FieldGroup>
              <FieldGroup label="Wish Message" hint="Shown on the hero/cover">
                <textarea className={textareaCls} value={birthdayData.wishMessage || ''}
                  onChange={e => setBirthdayData(d => ({ ...d, wishMessage: e.target.value }))} />
              </FieldGroup>
              <div className="col-span-2">
                <button type="button" onClick={handleBirthdayDataSave}
                  className="px-6 py-2 bg-[#C9956A] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
                  Save Birthday Details
                </button>
              </div>
            </SectionCard>
          )}
          {/* ── GENERAL EVENT FIELDS — only visible when eventType === 'general' ── */}
          {activeTab === 'couple' && eventType === 'general' && (
            <SectionCard title="Event Details" icon="📩">
              <FieldGroup label="Event Title">
                <input className={inputCls} value={generalData.eventTitle || ''}
                  onChange={e => setGeneralData(d => ({ ...d, eventTitle: e.target.value }))} />
              </FieldGroup>
              <FieldGroup label="Host Name">
                <input className={inputCls} value={generalData.hostName || ''}
                  onChange={e => setGeneralData(d => ({ ...d, hostName: e.target.value }))} />
              </FieldGroup>
              <FieldGroup label="Custom Body Text" hint="Main invitation paragraph">
                <textarea className={textareaCls} value={generalData.customBodyText || ''}
                  onChange={e => setGeneralData(d => ({ ...d, customBodyText: e.target.value }))} />
              </FieldGroup>
              <FieldGroup label="Event Sub-type" hint="e.g. Corporate, Social, Religious">
                <input className={inputCls} value={generalData.eventType2 || ''}
                  onChange={e => setGeneralData(d => ({ ...d, eventType2: e.target.value }))} />
              </FieldGroup>
              <div className="col-span-2">
                <button type="button" onClick={handleGeneralDataSave}
                  className="px-6 py-2 bg-[#C9956A] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
                  Save Event Details
                </button>
              </div>
            </SectionCard>
          )}
          {activeTab === 'couple' && (eventType === 'wedding' || eventType === 'engagement') && (
            <SectionCard title="Couple Information" icon={<Heart size={18} className="text-rose-400" />}>
              <FieldGroup label="Bride First Name">
                <input
                  type="text"
                  className={inputCls}
                  value={config?.couple?.bride?.firstName || ''}
                  onChange={e => setPath('couple.bride.firstName', e.target.value)}
                />
              </FieldGroup>
              <FieldGroup label="Bride Last Name">
                <input
                  type="text"
                  className={inputCls}
                  value={config?.couple?.bride?.lastName || ''}
                  onChange={e => setPath('couple.bride.lastName', e.target.value)}
                />
              </FieldGroup>
              <FieldGroup label="Bride Full Name">
                <input
                  type="text"
                  className={inputCls}
                  value={config?.couple?.bride?.fullName || ''}
                  onChange={e => setPath('couple.bride.fullName', e.target.value)}
                />
              </FieldGroup>
              <div className="hidden md:block" />
              <FieldGroup label="Groom First Name">
                <input
                  type="text"
                  className={inputCls}
                  value={config?.couple?.groom?.firstName || ''}
                  onChange={e => setPath('couple.groom.firstName', e.target.value)}
                />
              </FieldGroup>
              <FieldGroup label="Groom Last Name">
                <input
                  type="text"
                  className={inputCls}
                  value={config?.couple?.groom?.lastName || ''}
                  onChange={e => setPath('couple.groom.lastName', e.target.value)}
                />
              </FieldGroup>
              <FieldGroup label="Groom Full Name">
                <input
                  type="text"
                  className={inputCls}
                  value={config?.couple?.groom?.fullName || ''}
                  onChange={e => setPath('couple.groom.fullName', e.target.value)}
                />
              </FieldGroup>
              <div className="hidden md:block" />
              <FieldGroup label="Display Names (used in Hero & Nav)" hint='e.g. "Amara & Kaveen"'>
                <input
                  type="text"
                  className={inputCls}
                  value={config?.couple?.displayNames || ''}
                  onChange={e => setPath('couple.displayNames', e.target.value)}
                />
              </FieldGroup>
              <FieldGroup label="Tagline" hint='e.g. "Together Forever"'>
                <input type="text" className={inputCls} value={config?.couple?.tagline || ''} onChange={e => setPath('couple.tagline', e.target.value)} />
              </FieldGroup>
            </SectionCard>
          )}

          {activeTab === 'wedding' && (
            <SectionCard title="Hero Style" icon={<Sparkles size={18} className="text-amber-400" />}>
              <div
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden mb-5 transition-all duration-500"
                style={{ aspectRatio: '3 / 4' }}
              >
                {config?.heroImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={config.heroImage} className="w-full h-full object-cover" alt="Hero Preview" />
                  </>
                ) : (
                  <div className="text-center p-6">
                    <ImageIcon size={32} className="opacity-20 mx-auto" />
                    <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest">No Hero Image</p>
                  </div>
                )}
              </div>
              <FieldGroup label="Hero Image" hint="The primary photo shown at the top of the invitation.">
                <ImageField
                  label="Hero Photo"
                  hint="Portrait (3:4) aspect recommended"
                  value={config?.heroImage || ''}
                  path="heroImage"
                  type="hero"
                  onUpload={handleUpload}
                  onDelete={handleDeleteImage}
                  onCrop={handleCropExisting}
                />
              </FieldGroup>
              <FieldGroup label="Hero Background Video" hint="Autplaying loop for the hero background. Recommended: Lightweight .mp4">
                <ImageField
                  label="Hero Video Loop"
                  hint="Provide a direct URL or upload a file"
                  value={config?.heroVideo || ''}
                  path="heroVideo"
                  type="video"
                  accept="video/*,image/*"
                  onUpload={handleUpload}
                  onDelete={handleDeleteImage}
                />
              </FieldGroup>
              <FieldGroup label="SHARE PREVIEW IMAGE (OG Image)" hint="Thumbnail shown when link is shared (Recommended: 1200x630px)">
                <ImageField
                  label="Share Preview Photo"
                  hint="Landscape (1.91:1) aspect recommended"
                  value={config?.sharePreviewImageUrl || ''}
                  path="sharePreviewImageUrl"
                  type="og"
                  onUpload={handleUpload}
                  onDelete={handleDeleteImage}
                  onCrop={handleCropExisting}
                />
              </FieldGroup>

              <FieldGroup label="Wedding Date & Time (ISO 8601)" hint="Format: YYYY-MM-DDTHH:MM:SS">
                <input
                  type="datetime-local"
                  className={inputCls}
                  value={config?.wedding?.dateTimeISO?.slice(0, 16) || ''}
                  onChange={e => setPath('wedding.dateTimeISO', e.target.value + ':00')}
                />
              </FieldGroup>
              <FieldGroup label="Hero Time" hint="Time shown on the hero card (e.g. 4:00 PM). Falls back to the Ceremony time if left blank.">
                <input
                  type="text"
                  placeholder="4:00 PM"
                  className={inputCls}
                  value={config?.wedding?.heroTime || ''}
                  onChange={e => setPath('wedding.heroTime', e.target.value)}
                />
              </FieldGroup>
              <FieldGroup label="Display Date" hint='Human-readable, shown on the invitation'>
                <input
                  type="text"
                  placeholder="December 19, 2026"
                  className={inputCls}
                  value={config?.wedding?.displayDate || ''}
                  onChange={e => setPath('wedding.displayDate', e.target.value)}
                />
              </FieldGroup>
              <FieldGroup label="Year (for footer copyright)">
                <input
                  type="text"
                  placeholder="2026"
                  className={inputCls}
                  value={config?.wedding?.year || ''}
                  onChange={e => setPath('wedding.year', e.target.value)}
                />
              </FieldGroup>

              <FieldGroup label="Design Template" hint="Modern Unique Elegant Wedding Invitation (With Frames)">
                <div className="col-span-2 p-5 rounded-2xl border-2 border-[#C9956A] bg-[#fdf6ef]/60 shadow-sm flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#C9956A]/15 border border-[#C9956A]/30 flex items-center justify-center text-2xl shrink-0">
                    🖼️
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#2C2018]">Signature Framed Elegance</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#C9956A] text-white text-[10px] font-bold uppercase tracking-wider">Active & Modern</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      A modern, unique, and elegant wedding invitation featuring bespoke frames, floating couple portraits, live countdown timer, interactive order of events, framed photo memories gallery, personalized VIP guest pass, and dual WhatsApp/direct RSVP.
                    </p>
                  </div>
                </div>
              </FieldGroup>

              {config?.heroLayout === 9 && (
                <div className="col-span-2 mt-4 pt-6 border-t border-slate-50">
                  <ImageField
                    label="Layout 9 Full-Cover Background (Large Image)"
                    hint="For Layout 9, upload the large background image here. It will be shown in full height."
                    value={config.sectionBackgrounds?.hero}
                    path="sectionBackgrounds.hero"
                    type="hero"
                    onUpload={handleUpload}
                    onDelete={handleDeleteImage}
                    onCrop={handleCropExisting}
                  />
                </div>
              )}
            </SectionCard>
          )}

          {activeTab === 'story' && (
            <SectionCard title="Our Story & Invitation Text" icon={<Book size={18} className="text-indigo-400" />}>
              <FieldGroup label="Formal Invitation Text" hint="Shown in an elegant bordered box">
                <textarea
                  className={`${textareaCls} col-span-2`}
                  value={config?.story?.invitationText || ''}
                  onChange={e => setPath('story.invitationText', e.target.value)}
                />
              </FieldGroup>
              <div className="col-span-2 flex flex-col gap-3">
                <p className="text-[0.7rem] font-bold tracking-[0.12em] uppercase text-slate-500">Story Paragraphs</p>
                {(config?.story?.paragraphs || []).map((p, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <textarea
                      rows={3}
                      className={`${textareaCls} flex-1`}
                      value={p}
                      onChange={e => {
                        const updated = [...(config?.story?.paragraphs || [])];
                        updated[i] = e.target.value;
                        setPath('story.paragraphs', updated);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setPath('story.paragraphs', (config?.story?.paragraphs || []).filter((_, idx) => idx !== i))}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-colors text-lg mt-0.5"
                    >
                      --
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setPath('story.paragraphs', [...(config?.story?.paragraphs || []), ''])}
                  className="self-start text-xs font-semibold text-[#C9956A] flex items-center gap-1 hover:underline"
                >
                  + Add Paragraph
                </button>
              </div>
            </SectionCard>
          )}

          {activeTab === 'events' && (
            <>
            <SectionCard title="Ceremony Details" icon={<MapPin size={18} className="text-emerald-400" />}>
              <FieldGroup label="Title">
                <input
                  type="text"
                  className={inputCls}
                  value={config?.events?.ceremony?.title || ''}
                  onChange={e => setPath('events.ceremony.title', e.target.value)}
                />
              </FieldGroup>
              <FieldGroup label="Emoji Icon">
                <input
                  type="text"
                  className={inputCls}
                  value={config?.events?.ceremony?.icon || ''}
                  onChange={e => setPath('events.ceremony.icon', e.target.value)}
                />
              </FieldGroup>
              <FieldGroup label="Time">
                <input
                  type="text"
                  className={inputCls}
                  placeholder="10:00 AM"
                  value={config?.events?.ceremony?.time || ''}
                  onChange={e => setPath('events.ceremony.time', e.target.value)}
                />
              </FieldGroup>
              <FieldGroup label="Venue Name">
                <input
                  type="text"
                  className={inputCls}
                  value={config?.events?.ceremony?.venueName || ''}
                  onChange={e => setPath('events.ceremony.venueName', e.target.value)}
                />
              </FieldGroup>
              <FieldGroup label="Address">
                <input
                  type="text"
                  className={inputCls}
                  value={config?.events?.ceremony?.address || ''}
                  onChange={e => setPath('events.ceremony.address', e.target.value)}
                />
              </FieldGroup>
              <FieldGroup label="Dress Code">
                <input
                  type="text"
                  className={inputCls}
                  value={config?.events?.ceremony?.dressCode || ''}
                  onChange={e => setPath('events.ceremony.dressCode', e.target.value)}
                />
              </FieldGroup>
              <FieldGroup label="Google Maps URL">
                <input
                  type="url"
                  className={inputCls}
                  value={config?.events?.ceremony?.mapsUrl || ''}
                  onChange={e => setPath('events.ceremony.mapsUrl', e.target.value)}
                />
              </FieldGroup>
              <ImageField
                label="Event Image"
                hint="Upload a photo for this event (appears on the left in Layout 4)"
                value={config?.events?.ceremony?.image || ''}
                path="events.ceremony.image"
                type="general"
                onUpload={handleUpload}
                onDelete={handleDeleteImage}
              />
            </SectionCard>

            <SectionCard title="Additional Events" icon={<Calendar size={18} className="text-violet-400" />} defaultOpen={false}>
              <ExtraEventsEditor
                events={config?.extraEvents || []}
                onChange={val => setPath('extraEvents', val)}
                onUpload={handleUpload}
                onDelete={handleDeleteImage}
              />
            </SectionCard>
            </>
          )}

          {activeTab === 'gallery' && (
            <div className="flex flex-col gap-5">
              <SectionCard title={`Gallery Layout Texts (Layout ${config?.heroLayout || 1})`} icon={<Book size={18} className="text-slate-400" />}>
                <div className="col-span-2 space-y-2 mb-4">
                  <p className="text-xs text-slate-500">Configure titles for the gallery. If left empty, no text will be displayed on the live site.</p>
                </div>
                <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldGroup label="Gallery Title">
                    <input 
                      type="text" 
                      className={inputCls} 
                      placeholder="Captured Moments"
                      value={config?.layoutSettings?.[`layout_${config?.heroLayout || 1}`]?.galleryTitle ?? ''} 
                      onChange={e => setPath(`layoutSettings.layout_${config?.heroLayout || 1}.galleryTitle`, e.target.value)} 
                    />
                  </FieldGroup>
                  <FieldGroup label="Gallery Subtitle">
                    <input 
                      type="text" 
                      className={inputCls} 
                      placeholder="A glimpse into our beautiful journey"
                      value={config?.layoutSettings?.[`layout_${config?.heroLayout || 1}`]?.gallerySubtitle ?? ''} 
                      onChange={e => setPath(`layoutSettings.layout_${config?.heroLayout || 1}.gallerySubtitle`, e.target.value)} 
                    />
                  </FieldGroup>
                </div>
              </SectionCard>

              <SectionCard title="Gallery Photos" icon={<LucideImage size={18} className="text-sky-400" />}>
                <GalleryEditor
                  gallery={config?.gallery || []}
                  onChange={val => setPath('gallery', val)}
                  onUpload={handleUpload}
                  onDelete={handleDeleteImage}
                />
              </SectionCard>
            </div>
          )}

          {activeTab === 'rsvp' && (
            <>
              <SectionCard title="Couple Opening Screen" icon={<Sparkles size={18} className="text-purple-400" />}>
                <ImageField
                  label="Tap-to-Open Background Image"
                  hint="Shown behind the “tap to open” button for Animated Couple and Couple with Rose openings"
                  value={config?.coupleRevealOpeningBgImage || ''}
                  path="coupleRevealOpeningBgImage"
                  type="general"
                  accept="image/*"
                  onUpload={handleUpload}
                  onDelete={handleDeleteImage}
                  onCrop={handleCropExisting}
                />
              </SectionCard>

              <SectionCard title="RSVP Settings" icon={<Mail size={18} className="text-blue-400" />}>
                <FieldGroup label="Submission Destination" hint="Choose where RSVP submissions are sent">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="submissionDest"
                        value="whatsapp"
                        checked={(config?.rsvp?.submissionDestination || 'whatsapp') === 'whatsapp'}
                        onChange={e => setPath('rsvp.submissionDestination', e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">WhatsApp</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="submissionDest"
                        value="google-sheet"
                        checked={(config?.rsvp?.submissionDestination || 'whatsapp') === 'google-sheet'}
                        onChange={e => setPath('rsvp.submissionDestination', e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Google Sheet</span>
                    </label>
                  </div>
                </FieldGroup>

                {(config?.rsvp?.submissionDestination === 'whatsapp' || !config?.rsvp?.submissionDestination) && (
                  <FieldGroup label="WhatsApp Number" hint="Phone number for receiving RSVPs">
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="94771234567"
                      value={config?.rsvp?.whatsappNumber || ''}
                      onChange={e => setPath('rsvp.whatsappNumber', e.target.value)}
                    />
                  </FieldGroup>
                )}

                {config?.rsvp?.submissionDestination === 'google-sheet' && (
                  <FieldGroup label="Google Sheet URL" hint="Apps Script deployment URL for receiving submissions">
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="https://script.google.com/macros/d/.../usercontent"
                      value={config?.rsvp?.googleSheetUrl || ''}
                      onChange={e => setPath('rsvp.googleSheetUrl', e.target.value)}
                    />
                    <p className="text-xs text-slate-400 mt-2">
                      Set up Google Apps Script webhook and paste the deployment URL here. <a href="https://developers.google.com/apps-script" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Learn more</a>
                    </p>
                  </FieldGroup>
                )}

                <FieldGroup label="RSVP Deadline">
                  <input type="text" className={inputCls} value={config?.rsvp?.deadline || ''} onChange={e => setPath('rsvp.deadline', e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Max Guests per RSVP">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    className={inputCls}
                    value={config?.rsvp?.maxGuests || 2}
                    onChange={e => setPath('rsvp.maxGuests', Number(e.target.value))}
                  />
                </FieldGroup>
              </SectionCard>

              {/* ── Dietary Requirements Editor ── */}
              <SectionCard title="Dietary Requirements" icon={<span className="text-green-400">🥗</span>}>
                <p className="text-xs text-slate-400 mb-4">
                  Customise the dietary section shown on RSVP forms. Leave blank to use the built-in defaults.
                </p>

                {/* Section title */}
                <FieldGroup label="Section Title" hint='e.g. "Dietary Requirements & Allergies"'>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="Dietary Requirements & Allergies"
                    value={config?.rsvp?.dietaryTitle || ''}
                    onChange={e => setPath('rsvp.dietaryTitle', e.target.value || null)}
                  />
                </FieldGroup>

                {/* Items list */}
                <FieldGroup label="Dietary Options" hint="Each item will appear as a checkbox. Leave empty to use defaults.">
                  <div className="space-y-2 mt-1">
                    {(config?.rsvp?.dietaryItems || []).map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          className={`${inputCls} flex-1`}
                          placeholder={`Option ${idx + 1} label`}
                          value={item.label || ''}
                          onChange={e => {
                            const updated = [...(config.rsvp.dietaryItems || [])];
                            updated[idx] = { ...updated[idx], label: e.target.value };
                            setPath('rsvp.dietaryItems', updated);
                          }}
                        />
                        <button
                          type="button"
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 text-xs"
                          onClick={() => {
                            const updated = (config.rsvp.dietaryItems || []).filter((_, i) => i !== idx);
                            setPath('rsvp.dietaryItems', updated.length ? updated : null);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="mt-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs"
                      onClick={() => {
                        const existing = config?.rsvp?.dietaryItems || [];
                        setPath('rsvp.dietaryItems', [
                          ...existing,
                          { id: `option${existing.length + 1}`, label: '' }
                        ]);
                      }}
                    >
                      + Add Option
                    </button>

                    {(config?.rsvp?.dietaryItems || []).length > 0 && (
                      <button
                        type="button"
                        className="mt-1 ml-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs"
                        onClick={() => setPath('rsvp.dietaryItems', null)}
                      >
                        Reset to defaults
                      </button>
                    )}
                  </div>
                </FieldGroup>
              </SectionCard>

              <SectionCard title={`RSVP Form Builder (Layout ${config?.heroLayout || 1})`} icon={<Layers size={18} className="text-blue-500" />}>
                <div className="col-span-2 space-y-6">
                  <p className="text-xs text-slate-500 mb-2">Build and customize the exact fields shown to your guests on the RSVP form.</p>
                  
                  {(() => {
                    const coreRsvpFields = [
                      { id: "guestName", type: "text", label: "Guest Name", placeholder: "Enter your full name", required: true, isCore: true },
                      { id: "attending", type: "button-group", label: "Attending?", options: "Joyfully Accept,Regretfully Decline", required: true, isCore: true }
                    ];
                    const currentLayout = config?.heroLayout || 1;
                    const currentFields = config?.layoutSettings?.[`layout_${currentLayout}`]?.rsvpFields;
                    
                    if (!currentFields || currentFields.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center p-10 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                          <p className="text-sm text-slate-500 mb-4">No RSVP form is currently active for this layout. The public site will hide the RSVP section.</p>
                          <button 
                            type="button"
                            onClick={() => setPath(`layoutSettings.layout_${currentLayout}.rsvpFields`, coreRsvpFields)}
                            className="px-6 py-3 bg-[#C9956A] text-white rounded-lg text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
                          >
                            + Initialize RSVP Form
                          </button>
                        </div>
                      );
                    }
                    
                    return (
                      <>
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-xs text-slate-500">Build your dynamic RSVP form. Core fields cannot be removed individually.</p>
                          <button 
                            type="button"
                            onClick={() => {
                              if(window.confirm('Are you sure you want to delete the entire RSVP form? This will hide the section on the public site.')) {
                                setPath(`layoutSettings.layout_${currentLayout}.rsvpFields`, []);
                              }
                            }}
                            className="px-3 py-1.5 bg-red-100 text-red-600 rounded-md text-xs font-bold hover:bg-red-200 transition-colors"
                          >
                            Delete Entire Form
                          </button>
                        </div>
                        
                        {currentFields.map((field, idx) => (
                          <div key={field.id || idx} className="flex flex-col gap-4 p-5 bg-slate-50 border border-slate-200 rounded-xl relative group">
                            {field.id !== 'guestName' && field.id !== 'attending' && (
                              <button 
                                type="button"
                                onClick={() => {
                                  const updated = currentFields.filter((_, i) => i !== idx);
                                  setPath(`layoutSettings.layout_${currentLayout}.rsvpFields`, updated);
                                }}
                                className="absolute top-3 right-3 px-3 py-1.5 bg-rose-100 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-200 transition-colors"
                              >
                                Remove
                              </button>
                            )}
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full pr-20">
                              <FieldGroup label="Field Label (Shown to Guest)">
                                <input 
                                  type="text" 
                                  className={inputCls} 
                                  value={field.label || ''} 
                                  placeholder="e.g., Guest Name"
                                  onChange={e => {
                                    const updated = [...currentFields];
                                    updated[idx] = { ...updated[idx], label: e.target.value };
                                    setPath(`layoutSettings.layout_${currentLayout}.rsvpFields`, updated);
                                  }} 
                                />
                              </FieldGroup>
                              
                              <FieldGroup label="Input Type">
                                <select 
                                  className={inputCls} 
                                  value={field.type || 'text'}
                                  onChange={e => {
                                    const updated = [...currentFields];
                                    updated[idx] = { ...updated[idx], type: e.target.value };
                                    setPath(`layoutSettings.layout_${currentLayout}.rsvpFields`, updated);
                                  }}
                                >
                                  <option value="text">Short Text</option>
                                  <option value="textarea">Long Text (Message)</option>
                                  <option value="number">Number Input</option>
                                  <option value="guest-count">Guest Count (Strict Limit)</option>
                                  <option value="select">Dropdown</option>
                                  <option value="button-group">Buttons (Accept/Decline)</option>
                                  <option value="checkbox-group">Checkboxes (Multiple Ticks)</option>
                                  <option value="tel">Phone Number</option>
                                </select>
                              </FieldGroup>
                              
                              <FieldGroup label="Placeholder Text">
                                <input 
                                  type="text" 
                                  className={inputCls} 
                                  value={field.placeholder || ''} 
                                  placeholder="e.g., Enter answer..."
                                  onChange={e => {
                                    const updated = [...currentFields];
                                    updated[idx] = { ...updated[idx], placeholder: e.target.value };
                                    setPath(`layoutSettings.layout_${currentLayout}.rsvpFields`, updated);
                                  }} 
                                />
                              </FieldGroup>

                              <div className="flex items-center gap-2 h-full mt-4 sm:mt-0">
                                <input 
                                  type="checkbox" 
                                  id={`req-${idx}`}
                                  checked={field.required || false}
                                  onChange={e => {
                                    const updated = [...currentFields];
                                    updated[idx] = { ...updated[idx], required: e.target.checked };
                                    setPath(`layoutSettings.layout_${currentLayout}.rsvpFields`, updated);
                                  }}
                                  className="w-4 h-4 rounded text-[#C9956A] focus:ring-[#C9956A]"
                                />
                                <label htmlFor={`req-${idx}`} className="text-xs font-bold text-slate-600 uppercase cursor-pointer">Required</label>
                              </div>
                            </div>

                            {['select', 'button-group', 'checkbox-group'].includes(field.type) && (
                              <div className="w-full mt-2 p-3 bg-white border border-slate-200 rounded-lg">
                                <FieldGroup label="Dropdown Options (Separate by commas)" hint="e.g. Chicken, Fish, Vegetarian">
                                  <input 
                                    type="text" 
                                    className={inputCls} 
                                    value={field.options || ''} 
                                    placeholder="Option 1, Option 2, Option 3"
                                    onChange={e => {
                                      const updated = [...currentFields];
                                      updated[idx] = { ...updated[idx], options: e.target.value };
                                      setPath(`layoutSettings.layout_${currentLayout}.rsvpFields`, updated);
                                    }} 
                                  />
                                </FieldGroup>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        <button 
                          type="button"
                          onClick={() => {
                            setPath(`layoutSettings.layout_${currentLayout}.rsvpFields`, [...currentFields, { id: `field_${Date.now()}`, type: 'text', label: 'New Question', required: false, placeholder: '' }]);
                          }}
                          className="mt-4 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition-colors inline-flex items-center gap-2"
                        >
                          + Add Custom Field
                        </button>
                      </>
                    );
                  })()}
                </div>
              </SectionCard>

              <SectionCard title="Universal Video Preloader" icon={<Sparkles size={18} className="text-purple-400" />}>
                <div className="col-span-full flex flex-col gap-6 p-2">
                  <div className="flex flex-col">
                    <h4 className="text-[0.7rem] font-bold text-slate-800 uppercase tracking-widest">Global Preloader Video</h4>
                    <p className="text-[0.6rem] text-slate-400 mt-0.5">Overrides any layout with a premium video opening sequence (works for all events)</p>
                  </div>
                  <ImageField
                    label="Preloader Video (MP4)"
                    hint="High-quality video loop. Leave empty to use standard layout reveals."
                    value={config.envelopeVideo || ''}
                    path="envelopeVideo"
                    type="video"
                    accept="video/*"
                    onUpload={handleUpload}
                    onDelete={handleDeleteImage}
                  />
                  <FieldGroup label="Open Mode" hint="How the video starts playing">
                    <div className="flex gap-4 mt-1">
                      <label className="flex items-center gap-2.5 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${(!config.envelopeOpenMode || config.envelopeOpenMode === 'tap' || config.envelopeOpenMode === 'onclick') ? 'border-[#C9956A]' : 'border-slate-300 group-hover:border-slate-400'}`}>
                          {(!config.envelopeOpenMode || config.envelopeOpenMode === 'tap' || config.envelopeOpenMode === 'onclick') && <div className="w-2.5 h-2.5 rounded-full bg-[#C9956A]" />}
                        </div>
                        <input type="radio" className="hidden" name="envelopeOpenMode" value="tap" checked={(!config.envelopeOpenMode || config.envelopeOpenMode === 'tap' || config.envelopeOpenMode === 'onclick')} onChange={() => setPath('envelopeOpenMode', 'tap')} />
                        <span className={`text-sm font-medium ${(!config.envelopeOpenMode || config.envelopeOpenMode === 'tap' || config.envelopeOpenMode === 'onclick') ? 'text-slate-900' : 'text-slate-500'}`}>Tap to Open</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${config.envelopeOpenMode === 'auto' ? 'border-[#C9956A]' : 'border-slate-300 group-hover:border-slate-400'}`}>
                          {config.envelopeOpenMode === 'auto' && <div className="w-2.5 h-2.5 rounded-full bg-[#C9956A]" />}
                        </div>
                        <input type="radio" className="hidden" name="envelopeOpenMode" value="auto" checked={config.envelopeOpenMode === 'auto'} onChange={() => setPath('envelopeOpenMode', 'auto')} />
                        <span className={`text-sm font-medium ${config.envelopeOpenMode === 'auto' ? 'text-slate-900' : 'text-slate-500'}`}>Auto Play</span>
                      </label>
                    </div>
                  </FieldGroup>
                </div>
              </SectionCard>

              <SectionCard title="Opening Animation" icon={<Sparkles size={18} className="text-purple-400" />}>
                <FieldGroup label="Animation Style" hint="Choose how guests first see your invitation">
                  <div className="flex flex-wrap gap-x-6 gap-y-4 mt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${config.revealStyle === 'envelope' ? 'border-[#C9956A]' : 'border-slate-300 group-hover:border-slate-400'}`}>
                        {config.revealStyle === 'envelope' && <div className="w-2.5 h-2.5 rounded-full bg-[#C9956A]" />}
                      </div>
                      <input
                        type="radio"
                        className="hidden"
                        name="revealStyle"
                        value="envelope"
                        checked={config.revealStyle === 'envelope'}
                        onChange={() => setPath('revealStyle', 'envelope')}
                      />
                      <span className={`text-sm font-medium ${config.revealStyle === 'envelope' ? 'text-slate-900' : 'text-slate-500'}`}>Liquid Glass</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${config.revealStyle === 'couple' ? 'border-[#C9956A]' : 'border-slate-300 group-hover:border-slate-400'}`}>
                        {config.revealStyle === 'couple' && <div className="w-2.5 h-2.5 rounded-full bg-[#C9956A]" />}
                      </div>
                      <input
                        type="radio"
                        className="hidden"
                        name="revealStyle"
                        value="couple"
                        checked={config.revealStyle === 'couple'}
                        onChange={() => setPath('revealStyle', 'couple')}
                      />
                      <span className={`text-sm font-medium ${config.revealStyle === 'couple' ? 'text-slate-900' : 'text-slate-500'}`}>Animated Couple</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${config.revealStyle === 'cover' ? 'border-[#C9956A]' : 'border-slate-300 group-hover:border-slate-400'}`}>
                        {config.revealStyle === 'cover' && <div className="w-2.5 h-2.5 rounded-full bg-[#C9956A]" />}
                      </div>
                      <input
                        type="radio"
                        className="hidden"
                        name="revealStyle"
                        value="cover"
                        checked={config.revealStyle === 'cover'}
                        onChange={() => setPath('revealStyle', 'cover')}
                      />
                      <span className={`text-sm font-medium ${config.revealStyle === 'cover' ? 'text-slate-900' : 'text-slate-500'}`}>Cover Page</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${config.revealStyle === 'fade' ? 'border-[#C9956A]' : 'border-slate-300 group-hover:border-slate-400'}`}>
                        {config.revealStyle === 'fade' && <div className="w-2.5 h-2.5 rounded-full bg-[#C9956A]" />}
                      </div>
                      <input
                        type="radio"
                        className="hidden"
                        name="revealStyle"
                        value="fade"
                        checked={config.revealStyle === 'fade'}
                        onChange={() => setPath('revealStyle', 'fade')}
                      />
                      <span className={`text-sm font-medium ${config.revealStyle === 'fade' ? 'text-slate-900' : 'text-slate-500'}`}>Auto Fade Reveal</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${config.revealStyle === 'premium-envelope' ? 'border-[#C9956A]' : 'border-slate-300 group-hover:border-slate-400'}`}>
                        {config.revealStyle === 'premium-envelope' && <div className="w-2.5 h-2.5 rounded-full bg-[#C9956A]" />}
                      </div>
                      <input
                        type="radio"
                        className="hidden"
                        name="revealStyle"
                        value="premium-envelope"
                        checked={config.revealStyle === 'premium-envelope' || config.revealStyle === 'premium_envelope'}
                        onChange={() => setPath('revealStyle', 'premium-envelope')}

                      />
                      <span className={`text-sm font-medium ${config.revealStyle === 'premium-envelope' ? 'text-slate-900' : 'text-slate-500'}`}>Premium Wax Seal Envelope</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${config.revealStyle === 'royal_envelope' ? 'border-[#C9956A]' : 'border-slate-300 group-hover:border-slate-400'}`}>
                        {config.revealStyle === 'royal_envelope' && <div className="w-2.5 h-2.5 rounded-full bg-[#C9956A]" />}
                      </div>
                      <input
                        type="radio"
                        className="hidden"
                        name="revealStyle"
                        value="royal_envelope"
                        checked={config.revealStyle === 'royal_envelope'}
                        onChange={() => setPath('revealStyle', 'royal_envelope')}
                      />
                      <span className={`text-sm font-medium ${config.revealStyle === 'royal_envelope' ? 'text-slate-900' : 'text-slate-500'}`}>Royal Envelope</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${config.revealStyle === 'mint-envelope' ? 'border-[#C9956A]' : 'border-slate-300 group-hover:border-slate-400'}`}>
                        {config.revealStyle === 'mint-envelope' && <div className="w-2.5 h-2.5 rounded-full bg-[#C9956A]" />}
                      </div>
                      <input
                        type="radio"
                        className="hidden"
                        name="revealStyle"
                        value="mint-envelope"
                        checked={config.revealStyle === 'mint-envelope'}
                        onChange={() => setPath('revealStyle', 'mint-envelope')}
                      />
                      <span className={`text-sm font-medium ${config.revealStyle === 'mint-envelope' ? 'text-slate-900' : 'text-slate-500'}`}>DOOR opening Animation</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${config.revealStyle === 'couple_rose' ? 'border-[#C9956A]' : 'border-slate-300 group-hover:border-slate-400'}`}>
                        {config.revealStyle === 'couple_rose' && <div className="w-2.5 h-2.5 rounded-full bg-[#C9956A]" />}
                      </div>
                      <input
                        type="radio"
                        className="hidden"
                        name="revealStyle"
                        value="couple_rose"
                        checked={config.revealStyle === 'couple_rose'}
                        onChange={() => setPath('revealStyle', 'couple_rose')}
                      />
                      <span className={`text-sm font-medium ${config.revealStyle === 'couple_rose' ? 'text-slate-900' : 'text-slate-500'}`}>Couple with Rose</span>
                    </label>
                  </div>
                </FieldGroup>

                <div className="col-span-2 mt-6 pt-6 border-t border-slate-50">
                  <FieldGroup label="Visual Effects" hint="Special animations and decorations">
                    <label className="flex items-center gap-3 cursor-pointer group mt-2">
                      <div
                        className={`w-12 h-6 rounded-full transition-colors relative border ${config.fallingPetals ? 'bg-emerald-500 border-emerald-600' : 'bg-slate-200 border-slate-300'}`}
                        onClick={() => setPath('fallingPetals', !config.fallingPetals)}
                      >
                        <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform ${config.fallingPetals ? 'translate-x-6' : 'translate-x-1'}`} />
                      </div>
                      <span className={`text-sm font-medium ${config.fallingPetals ? 'text-slate-900' : 'text-slate-500'}`}>Enable Falling Petals Animation</span>
                    </label>
                  </FieldGroup>
                </div>

                {config.revealStyle === 'envelope' && (
                  <div className="col-span-2 mt-6 pt-6 border-t border-slate-50">
                    <ImageField
                      label="Liquid Glass Background Image"
                      hint="Upload an optional background image (leave empty for 3D ribbed effect)"
                      value={config?.coverImage || ''}
                      path="coverImage"
                      type="general"
                      onUpload={handleUpload}
                      onDelete={handleDeleteImage}
                    />
                  </div>
                )}

                {(config.revealStyle === 'fade' || config.revealStyle === 'cover') && (
                  <div className="col-span-2 mt-6 pt-6 border-t border-slate-50">
                    <ImageField
                      label="Cover Image"
                      hint="Upload a high-quality photo for the cover page"
                      value={config?.revealCoverImage || ''}
                      path="revealCoverImage"
                      type="general"
                      onUpload={handleUpload}
                      onDelete={handleDeleteImage}
                    />
                  </div>
                )}

                {config.revealStyle === 'couple' && (
                  <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-6 border-t border-slate-50">
                    <ImageField
                      label="Groom Cartoon (Running)"
                      hint="Transparent PNG recommended"
                      value={config.coupleImages?.groom}
                      path="coupleImages.groom"
                      type="general"
                      onUpload={handleUpload}
                      onDelete={handleDeleteImage}
                      onCrop={handleCropExisting}
                    />

                    <ImageField
                      label="Bride Cartoon (Running)"
                      hint="Transparent PNG recommended"
                      value={config.coupleImages?.bride}
                      path="coupleImages.bride"
                      type="general"
                      onUpload={handleUpload}
                      onDelete={handleDeleteImage}
                      onCrop={handleCropExisting}
                    />
                  </div>
                )}

                {config.revealStyle === 'couple_rose' && (
                  <div className="col-span-2 mt-4 pt-6 border-t border-slate-50">
                    <ImageField
                      label="Rose Couple GIF"
                      hint="Upload the GIF to be used in the center of the animation"
                      value={config.coupleRevealRoseGif || ''}
                      path="coupleRevealRoseGif"
                      type="general"
                      onUpload={handleUpload}
                      onDelete={handleDeleteImage}
                    />
                  </div>
                )}
              </SectionCard>

              <SectionCard 
                title="Envelope / Door Cover" 
                icon={<Layers size={18} className="text-slate-400" />}
                defaultOpen={['envelope', 'mint-envelope'].includes(config.revealStyle)}
              >
                <ImageField
                  label="Inner Card Background Image"
                  hint="Upload directly or enter a URL"
                  value={config.envelope?.bgImage}
                  path="envelope.bgImage"
                  type="general"
                  onUpload={handleUpload}
                  onDelete={handleDeleteImage}
                />
                <ImageField
                  label="Outer Background Image"
                  hint="Upload directly or enter a URL"
                  value={config.envelope?.outerBgImage}
                  path="envelope.outerBgImage"
                  type="general"
                  onUpload={handleUpload}
                  onDelete={handleDeleteImage}
                />
                <FieldGroup label="Cover Title">
                  <input type="text" className={inputCls} value={config?.envelope?.title || ''} onChange={e => setPath('envelope.title', e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Cover Subtitle">
                  <input
                    type="text"
                    className={inputCls}
                    value={config?.envelope?.subtitle || ''}
                    onChange={e => setPath('envelope.subtitle', e.target.value)}
                  />
                </FieldGroup>
                <FieldGroup label="Button Text">
                  <input
                    type="text"
                    className={inputCls}
                    value={config?.envelope?.buttonText || ''}
                    onChange={e => setPath('envelope.buttonText', e.target.value)}
                  />
                </FieldGroup>
              </SectionCard>

              {config.revealStyle === 'royal_envelope' && (
                <SectionCard title="Royal Envelope Customization" icon={<Palette size={18} className="text-rose-500" />}>
                  <div className="col-span-full flex flex-col lg:flex-row gap-10 items-start p-2">
                    {/* Left Side: Controls */}
                    <div className="flex-1 w-full flex flex-col gap-6">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                        <div className="flex flex-col">
                          <h4 className="text-[0.7rem] font-bold text-slate-800 uppercase tracking-widest">Envelope Aesthetics</h4>
                          <p className="text-[0.6rem] text-slate-400 mt-0.5">Customize the physical look of your royal invitation</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPath('envelope.royal.envelopeColor', config?.theme?.colorPrimary || '#91091E');
                            setPath('envelope.royal.bgColor1', config?.theme?.colorBg || '#3D0010');
                            setPath('envelope.royal.bgColor2', config?.theme?.colorPrimary || '#91091E');
                            setPath('envelope.royal.sealColor', config?.theme?.colorPrimary || '#91091E');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C9956A]/10 text-[#C9956A] text-[0.6rem] font-bold hover:bg-[#C9956A]/20 transition-all uppercase tracking-wider"
                        >
                          <RefreshCcw size={10} /> Reset
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                        <ColourField
                          label="Envelope Paper"
                          value={config.envelope?.royal?.envelopeColor || config.theme?.colorPrimary || '#91091E'}
                          onChange={val => setPath('envelope.royal.envelopeColor', val)}
                        />
                        <ColourField
                          label="Wax Seal Color"
                          value={config.envelope?.royal?.sealColor || config.theme?.colorPrimary || '#91091E'}
                          onChange={val => setPath('envelope.royal.sealColor', val)}
                        />
                        <ColourField
                          label="Background Base (1)"
                          value={config.envelope?.royal?.bgColor1 || config.theme?.colorBg || '#3D0010'}
                          onChange={val => setPath('envelope.royal.bgColor1', val)}
                        />
                        <ColourField
                          label="Background Accent (2)"
                          value={config.envelope?.royal?.bgColor2 || config.theme?.colorPrimary || '#91091E'}
                          onChange={val => setPath('envelope.royal.bgColor2', val)}
                        />
                      </div>
                    </div>

                    {/* Right Side: Preview */}
                    <div className="shrink-0 w-full lg:w-72 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <Eye size={14} className="text-slate-400" />
                        <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Live Preview</span>
                      </div>
                      <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 p-8 flex items-center justify-center bg-slate-50">
                        <div
                          className="absolute inset-4 rounded-2xl shadow-inner overflow-hidden"
                          style={{
                            background: `radial-gradient(circle at center, ${config.envelope?.royal?.bgColor2 || config.theme?.colorPrimary || '#91091E'} 0%, ${config.envelope?.royal?.bgColor1 || config.theme?.colorBg || '#3D0010'} 100%)`,
                          }}
                        />
                          <div
                            className="relative w-4/5 h-4/5 rounded shadow-xl overflow-hidden border border-black/5 z-10"
                            style={{ backgroundColor: config.envelope?.royal?.envelopeColor || config.theme?.colorPrimary || '#91091E' }}
                          >
                            <div
                              className="absolute top-1/2 -translate-y-1/2 w-full h-3 md:h-4 z-40 shadow-sm overflow-hidden flex flex-col justify-between py-[0.5px]"
                              style={{
                                background: 'linear-gradient(to right, #5d401a 0%, #b8860b 20%, #f7e48b 45%, #ffffff 50%, #f7e48b 55%, #b8860b 80%, #5d401a 100%)',
                              }}
                            >
                              <div className="w-full h-[0.2px] bg-white/40" />
                              <div className="w-full h-[0.2px] bg-white/40" />
                            </div>
                            <div
                              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border border-[#D4AF37] shadow-md flex items-center justify-center text-[5px] font-serif text-[#D4AF37] font-bold overflow-hidden"
                              style={{
                                backgroundColor: config.envelope?.royal?.sealColor || config.theme?.colorPrimary || '#91091E',
                                borderRadius: '41% 59% 41% 59% / 53% 45% 55% 47%',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.2)',
                                border: '1px solid #D4AF37',
                              }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/10 rounded-inherit" />
                              <div
                                className="w-[70%] h-[70%] rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] flex items-center justify-center font-serif font-black italic text-[#D4AF37]"
                                style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                              >
                                <div className="relative z-10 flex items-center gap-0.5 scale-75">
                                  <span>{(config.couple?.bride?.firstName?.[0] || 'D').toUpperCase()}</span>
                                  <span className="scale-75 text-[4px] not-italic font-normal font-script">&</span>
                                  <span>{(config.couple?.groom?.firstName?.[0] || 'C').toUpperCase()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 50%)', border: '1px solid black' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                </SectionCard>
              )}

              {(config?.revealStyle === 'premium-envelope' || config?.revealStyle === 'premium_envelope') && (
                <SectionCard title="Premium Envelope Customization" icon={<Palette size={18} className="text-[#C9956A]" />}>
                  <div className="col-span-full flex flex-col gap-10 p-2">
                    {/* Upper Section: Typography & Main Colors */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="flex flex-col gap-6">
                        <div className="pb-3 border-b border-slate-50 flex items-center justify-between">
                          <div className="flex flex-col">
                            <h4 className="text-[0.7rem] font-bold text-slate-800 uppercase tracking-widest">Card Typography</h4>
                            <p className="text-[0.6rem] text-slate-400 mt-0.5">Text appearing on the inner invitation card</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <FieldGroup label="Card Title" hint="E.g. 'A Wedding Invitation'">
                            <input type="text" className={inputCls} value={config.envelope?.title || ''} onChange={e => setPath('envelope.title', e.target.value)} />
                          </FieldGroup>
                          <FieldGroup label="Card Names" hint="E.g. 'Kasun & Nimesha'">
                            <input type="text" className={inputCls} value={config.envelope?.subtitle || ''} onChange={e => setPath('envelope.subtitle', e.target.value)} />
                          </FieldGroup>
                        </div>
                      </div>

                      <div className="flex flex-col gap-6">
                        <div className="pb-3 border-b border-slate-50 flex items-center justify-between">
                          <div className="flex flex-col">
                            <h4 className="text-[0.7rem] font-bold text-slate-800 uppercase tracking-widest">Base Aesthetics</h4>
                            <p className="text-[0.6rem] text-slate-400 mt-0.5">Primary colors for the card and wax seal</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setPath('envelopeColors.seal', config?.theme?.colorPrimary || '#dc2626');
                              setPath('envelopeColors.back', config?.theme?.colorPrimary || '#064e3b');
                              setPath('envelopeColors.pocket', config?.theme?.colorSecondary || '#047857');
                              setPath('envelopeColors.flap', config?.theme?.colorPrimary || '#064e3b');
                              setPath('envelopeColors.card', config?.theme?.colorBg || '#fef3c7');
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C9956A]/10 text-[#C9956A] text-[0.6rem] font-bold hover:bg-[#C9956A]/20 transition-all uppercase tracking-wider"
                          >
                            <RefreshCcw size={10} /> Reset
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <ColourField label="Wax Seal Color" value={config.envelopeColors?.seal || '#dc2626'} onChange={val => setPath('envelopeColors.seal', val)} />
                          <ColourField label="Card Background" value={config.envelopeColors?.card || '#fef3c7'} onChange={val => setPath('envelopeColors.card', val)} />
                        </div>
                      </div>
                    </div>

                    {/* Lower Section: Detailed Envelope Parts & Media */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-4">
                      <div className="flex flex-col gap-6">
                        <div className="pb-3 border-b border-slate-50">
                          <h4 className="text-[0.7rem] font-bold text-slate-800 uppercase tracking-widest">Envelope Construction</h4>
                          <p className="text-[0.6rem] text-slate-400 mt-0.5">Customize colors for each part of the envelope</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                          <ColourField label="Envelope Back" value={config.envelopeColors?.back || '#064e3b'} onChange={val => setPath('envelopeColors.back', val)} />
                          <ColourField label="Top Flap" value={config.envelopeColors?.flap || '#064e3b'} onChange={val => setPath('envelopeColors.flap', val)} />
                          <div className="sm:col-span-2">
                             <ColourField label="Front Pocket" value={config.envelopeColors?.pocket || '#047857'} onChange={val => setPath('envelopeColors.pocket', val)} />
                          </div>
                        </div>
                      </div>


                    </div>
                  </div>
                </SectionCard>
              )}
            </>
          )}

          {activeTab === 'theme' && (
            <div className="flex flex-col gap-5">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden px-6 py-6">
                <div className="flex items-center gap-3 mb-6">
                  <Palette size={20} className="text-[#C9956A]" />
                  <h3 className="font-semibold text-slate-700 text-sm tracking-wide">Premium Theme Presets</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {PRESET_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        setPath('theme', theme.colors);
                        // Sync Royal Envelope colors automatically when theme is selected
                        setPath('envelope.royal.envelopeColor', theme.colors.colorPrimary);
                        setPath('envelope.royal.bgColor1', theme.colors.colorBg);
                        setPath('envelope.royal.bgColor2', theme.colors.colorPrimary);
                        setPath('envelope.royal.sealColor', theme.colors.colorPrimary);

                        // Sync Premium Envelope colors automatically when theme is selected
                        setPath('envelopeColors.seal', theme.colors.colorPrimary);
                        setPath('envelopeColors.back', theme.colors.colorPrimary);
                        setPath('envelopeColors.pocket', theme.colors.colorSecondary);
                        setPath('envelopeColors.flap', theme.colors.colorPrimary);
                        setPath('envelopeColors.card', theme.colors.colorBg);
                      }}
                      className="group relative flex flex-col items-start p-4 rounded-xl border border-slate-100 hover:border-[#C9956A] hover:shadow-md transition-all text-left"
                    >
                      <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-2">{theme.name}</span>
                      <div className="flex gap-1.5 w-full">
                        <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: theme.colors.colorPrimary }} title="Primary" />
                        <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: theme.colors.colorSecondary }} title="Secondary" />
                        <div className="w-6 h-6 rounded-full shadow-sm border border-slate-100" style={{ backgroundColor: theme.colors.colorBg }} title="Background" />
                        <div className="ml-auto flex -space-x-2">
                          <div className="w-6 h-6 rounded-full border border-white" style={{ backgroundColor: theme.colors.colorTextDark }} />
                          <div className="w-6 h-6 rounded-full border border-white" style={{ backgroundColor: theme.colors.colorTextLight }} />
                        </div>
                      </div>
                      <div className="mt-3 w-full h-1 rounded-full bg-slate-50 overflow-hidden">
                        <div className="h-full w-1/2" style={{ backgroundColor: theme.colors.colorPrimary }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <SectionCard title="Fine-tune Theme Colours" icon={<Palette size={18} className="text-[#C9956A]" />}>
                {[
                  ['colorPrimary', 'Primary Accent'],
                  ['colorSecondary', 'Secondary Accent'],
                  ['colorTextLight', 'Light Text'],
                  ['colorTextDark', 'Dark Text'],
                  ['colorBg', 'Page Background'],
                  ['colorSurface', 'Card Background'],
                ].map(([key, label]) => (
                  <ColourField key={key} label={label} value={config?.theme?.[key] || ''} onChange={val => setPath(`theme.${key}`, val)} />
                ))}
                <FieldGroup label="Hero Overlay Start (rgba)">
                  <input
                    type="text"
                    className={inputCls}
                    value={config?.theme?.heroOverlayStart || ''}
                    onChange={e => setPath('theme.heroOverlayStart', e.target.value)}
                  />
                </FieldGroup>
                <FieldGroup label="Hero Overlay End (rgba)">
                  <input type="text" className={inputCls} value={config?.theme?.heroOverlayEnd || ''} onChange={e => setPath('theme.heroOverlayEnd', e.target.value)} />
                </FieldGroup>

                <div className="col-span-2 mt-2 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[0.68rem] font-bold tracking-[0.1em] uppercase text-slate-400 mb-3">Live Colour Preview</p>
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(config?.theme || {}))
                      .filter(([k]) => k.startsWith('color'))
                      .map(([k, v]) => (
                        <div key={k} className="flex flex-col items-center gap-1">
                          <div className="w-10 h-10 rounded-lg border border-slate-200 shadow-sm" style={{ background: v }} />
                          <span className="text-[0.6rem] text-slate-400">{k.replace('color', '')}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </SectionCard>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="flex flex-col gap-5">
              <SectionCard title="Layout-Specific Text" icon={<Sparkles size={18} className="text-amber-500" />}>
                <FieldGroup label="Extra Text Below Countdown" hint={`Text specific to Layout ${config?.heroLayout || 1} (e.g., Dress code)`}>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="e.g., We can't wait to celebrate with you!"
                    value={config?.layoutSettings?.[`layout_${config?.heroLayout || 1}`]?.countdownExtraText || ''}
                    onChange={e => setPath(`layoutSettings.layout_${config?.heroLayout || 1}.countdownExtraText`, e.target.value)}
                  />
                </FieldGroup>
              </SectionCard>
              <SectionCard title="Wedding Timeline" icon={<Calendar size={18} className="text-amber-500" />}>
                <div className="col-span-2 flex flex-col gap-4">
                  {config.timeline?.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50 relative group">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...config.timeline];
                          updated.splice(idx, 1);
                          setPath('timeline', updated);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <FieldGroup label="Time">
                          <input type="text" className={inputCls} value={item.time} onChange={e => {
                            const updated = [...config.timeline];
                            updated[idx].time = e.target.value;
                            setPath('timeline', updated);
                          }} />
                        </FieldGroup>
                        <FieldGroup label="Title">
                          <input type="text" className={inputCls} value={item.title} onChange={e => {
                            const updated = [...config.timeline];
                            updated[idx].title = e.target.value;
                            setPath('timeline', updated);
                          }} />
                        </FieldGroup>
                        <FieldGroup label="Icon (Emoji)">
                          <input type="text" className={inputCls} value={item.icon} onChange={e => {
                            const updated = [...config.timeline];
                            updated[idx].icon = e.target.value;
                            setPath('timeline', updated);
                          }} />
                        </FieldGroup>
                        <div className="sm:col-span-3">
                          <FieldGroup label="Description">
                            <input type="text" className={inputCls} value={item.description} onChange={e => {
                              const updated = [...config.timeline];
                              updated[idx].description = e.target.value;
                              setPath('timeline', updated);
                            }} />
                          </FieldGroup>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPath('timeline', [...(config.timeline || []), { time: '', title: '', description: '', icon: '✨' }])}
                    className="self-start px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors"
                  >
                    + Add Timeline Event
                  </button>
                </div>
              </SectionCard>
            </div>
          )}

          {activeTab === 'meta' && (
            <>
            <SectionCard title="SEO & Social Sharing" icon={<Search size={18} className="text-slate-500" />}>
              <FieldGroup label="Page Title">
                <input type="text" className={inputCls} value={config?.meta?.title || ''} onChange={e => setPath('meta.title', e.target.value)} />
              </FieldGroup>
              <FieldGroup label="Description">
                <input
                  type="text"
                  className={inputCls}
                  value={config?.meta?.description || ''}
                  onChange={e => setPath('meta.description', e.target.value)}
                />
              </FieldGroup>
              <FieldGroup label="OG Image">
                <input type="text" className={inputCls} value={config?.meta?.ogImage || ''} onChange={e => setPath('meta.ogImage', e.target.value)} />
              </FieldGroup>
            </SectionCard>

            <SectionCard title="Client Portal Access" icon={<Eye size={18} className="text-violet-500" />}>
              <FieldGroup
                label="Client Passcode"
                hint="Set a passcode so your client can log into their private dashboard at /client-login. Leave blank to disable portal access."
              >
                <input
                  type="text"
                  className={inputCls}
                  placeholder="e.g. rose2026"
                  value={config?.clientPasscode || ''}
                  onChange={e => setPath('clientPasscode', e.target.value || null)}
                />
              </FieldGroup>
              <div className="flex items-end">
                <ClientPortalShareButton slug={slug} passcode={config?.clientPasscode} />
              </div>
            </SectionCard>
            </>
          )}

          {activeTab === 'backgrounds' && (
            <SectionCard title="Section Backgrounds" icon={<LucideImage size={18} className="text-slate-400" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { id: 'hero', label: 'Hero Background' },
                  { id: 'guestCard', label: 'Guest Card Background' },
                  { id: 'story', label: 'Story Background' },
                  { id: 'events', label: 'Events Background' },
                  { id: 'timeline', label: 'Timeline Background' },
                  { id: 'gallery', label: 'Gallery Background' },
                  { id: 'rsvp', label: 'RSVP Background' },
                  { id: 'footer', label: 'Footer Background' }
                ].map(sec => (
                  <ImageField
                    key={sec.id}
                    label={sec.label}
                    hint="Full-width background image"
                    value={config.sectionBackgrounds?.[sec.id]}
                    path={`sectionBackgrounds.${sec.id}`}
                    type="general"
                    onUpload={handleUpload}
                    onDelete={handleDeleteImage}
                    onCrop={handleCropExisting}
                  />
                ))}
              </div>
            </SectionCard>
          )}

          {activeTab === 'replacements' && (
            <SectionCard title="Replace Sections With Image" icon={<LucideImage size={18} className="text-slate-400" />}>
              {/* SectionCard already lays children out in a 2-column grid, so the
                  banner spans both columns and the fields flow in as siblings. */}
              <div className="md:col-span-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] leading-relaxed text-amber-800">
                <strong className="font-bold">This replaces the whole section — it is not a background.</strong>{' '}
                Upload an image for a section and that section&apos;s entire content (heading, text, cards,
                decorations) is removed and the image is shown instead: full width, natural height, never
                cropped — exactly like the Layout 9 hero cover. Leave a section empty to keep it exactly as it
                is today. Applies to every layout.
              </div>
              {[
                { id: 'story', label: 'Story Section', hint: 'Replaces the whole story section' },
                { id: 'timeline', label: 'Timeline Section', hint: 'Replaces the whole timeline / programme section' },
                { id: 'events', label: 'Events & Location Section', hint: 'Replaces the whole events / map section' },
                { id: 'guestCard', label: 'Guest Invitation Card', hint: 'Replaces the personalised card — the guest name will no longer show' },
                { id: 'footer', label: 'Footer Section', hint: 'Replaces the whole footer' }
              ].map(sec => (
                <ImageField
                  key={sec.id}
                  label={sec.label}
                  hint={sec.hint}
                  value={config.sectionReplacements?.[sec.id]}
                  path={`sectionReplacements.${sec.id}`}
                  type="hero"
                  accept="image/*"
                  onUpload={handleUpload}
                  onDelete={handleDeleteImage}
                />
              ))}
            </SectionCard>
          )}

          {activeTab === 'decor' && (
            <SectionCard title="Layout Decorations" icon={<Sparkles size={18} className="text-amber-500" />}>
              <FieldGroup label="Layout 1: Event Details Banner" hint="Custom header image for the Layout 1 event section (replaces gallery fallback)">
                <div className="flex flex-col gap-3">
                  {config.layout1EventBanner && (
                    <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={config.layout1EventBanner} className="w-full h-full object-cover" alt="Layout 1 Event Banner Preview" />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="/images/event-banner.jpg"
                      className={inputCls}
                      value={config.layout1EventBanner || ''}
                      onChange={e => setPath('layout1EventBanner', e.target.value)}
                    />
                    <label className="shrink-0 cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold flex items-center transition-colors">
                      Upload
                      <input type="file" className="hidden" accept="image/*" onChange={e => handleUpload(e.target.files[0], 'layout1EventBanner', 'banner')} />
                    </label>
                    {config.layout1EventBanner && (
                      <button
                        type="button"
                        onClick={() => handleDeleteImage('layout1EventBanner', config.layout1EventBanner)}
                        className="shrink-0 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </FieldGroup>
            </SectionCard>
          )}

          {activeTab === 'decor' && (
            <SectionCard title="Background Music" icon={<Music size={18} className="text-purple-500" />}>
              <FieldGroup label="Audio File URL" hint="Paste a URL or upload an MP3 file. This music will play after common interaction.">
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className={inputCls}
                      value={config.audioUrl || ''}
                      onChange={e => setPath('audioUrl', e.target.value)}
                      placeholder="https://example.com/music.mp3"
                    />
                    <label className="shrink-0 cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold flex items-center transition-colors">
                      Upload
                      <input
                        type="file"
                        className="hidden"
                        accept="audio/*"
                        onChange={e => handleUpload(e.target.files[0], 'audioUrl', 'audio')}
                      />
                    </label>
                    {config.audioUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDeleteImage('audioUrl', config.audioUrl);
                        }}
                        className="shrink-0 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {config.audioUrl && (
                    <audio src={config.audioUrl} controls className="w-full h-8 mt-2" />
                  )}
                </div>
              </FieldGroup>
            </SectionCard>
          )}

          {activeTab === 'cinematic' && (
            <div className="flex flex-col gap-6">
              <SectionCard title="Cinematic Scroll Video (Frames)" icon="🎬">
                <FieldGroup label="Enable Scroll Video" hint="When enabled, the top of the wedding invitation plays as a scroll-scrubbed cinematic frame animation.">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPath('cinematicFrames.enabled', !(config?.cinematicFrames?.enabled ?? true))}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                        (config?.cinematicFrames?.enabled ?? true)
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-slate-100 text-slate-500 border-slate-300'
                      }`}
                    >
                      {(config?.cinematicFrames?.enabled ?? true) ? 'Active & Enabled' : 'Disabled'}
                    </button>
                    <span className="text-xs text-slate-500">
                      Total Frames: <strong className="text-slate-800">{config?.cinematicFrames?.frameCount || 60}</strong> frames loaded
                    </span>
                  </div>
                </FieldGroup>

                <FieldGroup label="Upload Frame Sequence (.ZIP Archive)" hint="Upload any ZIP file containing sequential images (e.g. frame-0001.webp, frame-0002.webp, or .jpg, .png). Any number of frames is supported!">
                  <div className="flex flex-col gap-3">
                    <label className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                      zipUploading ? 'border-amber-400 bg-amber-50/50' : 'border-[#C9956A]/40 hover:border-[#C9956A] bg-white hover:bg-[#FAF7F2]/50'
                    }`}>
                      <input
                        type="file"
                        accept=".zip,application/zip"
                        className="hidden"
                        disabled={zipUploading}
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleZipUpload(e.target.files[0]);
                          }
                        }}
                      />
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">📦</span>
                        <span className="text-sm font-bold text-[#2C2018]">
                          {zipUploading ? 'Extracting Frames...' : 'Choose or Drop a .ZIP File Here'}
                        </span>
                        <span className="text-xs text-slate-400 max-w-sm">
                          Supports any number of frames (60, 120, 240+ frames). Image files inside the zip are automatically sorted and mapped.
                        </span>
                      </div>
                    </label>

                    {zipMessage && (
                      <p className={`text-xs font-semibold ${zipMessage.startsWith('Success') ? 'text-emerald-600' : zipMessage.startsWith('Error') ? 'text-red-600' : 'text-amber-600'}`}>
                        {zipMessage}
                      </p>
                    )}
                  </div>
                </FieldGroup>

                <FieldGroup label="Frame Scrubber Preview" hint="Drag the slider to test scrolling through your animation frames directly.">
                  <div className="flex flex-col gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="relative aspect-[9/16] max-w-xs mx-auto overflow-hidden rounded-xl border border-[#C9956A]/40 bg-black shadow-md">
                      {config?.cinematicFrames?.frames?.[previewFrameIndex] ? (
                        <img
                          src={config.cinematicFrames.frames[previewFrameIndex]}
                          alt={`Frame ${previewFrameIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={`/frames/${slug || config?.slug || 'wedding'}/frame-${String(previewFrameIndex + 1).padStart(4, '0')}.webp`}
                          alt={`Frame ${previewFrameIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-mono">
                        Frame {previewFrameIndex + 1} / {config?.cinematicFrames?.frameCount || 60}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs font-mono text-slate-500">1</span>
                      <input
                        type="range"
                        min="0"
                        max={(config?.cinematicFrames?.frameCount || 60) - 1}
                        value={previewFrameIndex}
                        onChange={(e) => setPreviewFrameIndex(Number(e.target.value))}
                        className="flex-1 accent-[#C9956A] cursor-pointer"
                      />
                      <span className="text-xs font-mono text-slate-500">
                        {config?.cinematicFrames?.frameCount || 60}
                      </span>
                    </div>
                  </div>
                </FieldGroup>
              </SectionCard>
            </div>
          )}

          {activeTab === 'labels' && (() => {
            const defaults = EVENT_LABELS[eventType] || EVENT_LABELS.wedding;
            const lbl = (key) => labelOverrides[key] ?? '';
            const setLbl = (key, val) => setLabelOverrides(prev => ({ ...prev, [key]: val }));
            const layout = config?.heroLayout ?? 1;
            // Helpers — which layouts use a given label
            const heroUsesEyebrow   = layout === 1 || layout === 8;
            const heroUsesHeading   = layout === 2;
            const heroUsesFamilies  = layout === 4 || layout === 6 || layout === 10;
            const heroUsesPhotoLbl  = layout === 7;
            const heroUsesLocation  = layout === 11 || layout === 8;
            const storyUsesHeading6 = layout === 6;
            const storyUsesCaption7 = layout === 7;
            const storyUsesSection  = layout === 10;
            const eventsUsesSubtitle = layout === 6;
            const isLayout8         = layout === 8;
            const isLayout10        = layout === 10;
            const isLayout11        = layout === 11;
            // Labels used on every layout
            const always = true;
            return (
              <>
                <div className="rounded-xl bg-amber-50 border border-amber-100 px-5 py-3 text-xs text-amber-700 mb-1">
                  Leave a field <strong>empty</strong> to use the default for <strong>{eventType}</strong> type. The placeholder shows the current default value.
                  {' '}<span className="opacity-70">Fields not used by layout {layout} are hidden.</span>
                </div>

                {(heroUsesEyebrow || heroUsesHeading || heroUsesFamilies || heroUsesPhotoLbl || heroUsesLocation) && (
                <SectionCard title="Hero Section" icon="🎯">
                  {heroUsesEyebrow && <LabelField label="Eyebrow Text" fieldKey="heroEyebrow" hint='Small text above the main heading' value={lbl('heroEyebrow')} onChange={setLbl} placeholder={defaults['heroEyebrow']} />}
                  {heroUsesHeading && <LabelField label="Main Heading" fieldKey="heroHeading" hint='Primary hero heading shown on the invite' value={lbl('heroHeading')} onChange={setLbl} placeholder={defaults['heroHeading']} />}
                  {heroUsesFamilies && <LabelField label="Families / Hosts Line" fieldKey="heroFamiliesLine" hint='Text shown below the names, e.g. "Together with their families invite you"' value={lbl('heroFamiliesLine')} onChange={setLbl} placeholder={defaults['heroFamiliesLine']} />}
                  {heroUsesFamilies && <LabelField label="Families Line (iCal / text export)" fieldKey="heroFamiliesIcal" hint='Same line used in calendar exports — use \, for literal commas' value={lbl('heroFamiliesIcal')} onChange={setLbl} placeholder={defaults['heroFamiliesIcal']} />}
                  {heroUsesPhotoLbl && <LabelField label="Polaroid Card Label" fieldKey="photoLabel" hint='Text on the polaroid-style photo card' value={lbl('photoLabel')} onChange={setLbl} placeholder={defaults['photoLabel']} />}
                  {heroUsesLocation && <LabelField label="Hero Small Text" fieldKey="layout11HeroSmall" hint='Small uppercase line shown above the big location text, e.g. "The celebration takes place at"' value={lbl('layout11HeroSmall')} onChange={setLbl} placeholder={defaults['layout11HeroSmall']} />}
                  {heroUsesLocation && <LabelField label="Hero Big Text" fieldKey="layout11HeroBig" hint='Large italic text shown prominently in the hero, e.g. venue name or custom location text' value={lbl('layout11HeroBig')} onChange={setLbl} placeholder={config?.events?.ceremony?.venueName || 'Venue name (auto-filled from Events if left blank)'} />}
                </SectionCard>
                )}

                <SectionCard title="Hero Decorative Images" icon="🦚">
                  <ImageField
                    label="Left Decoration Image"
                    hint="Optional small PNG shown on the left. Leave empty to use the default peacock emoji."
                    value={config?.heroDecorationLeftImage || ''}
                    path="heroDecorationLeftImage"
                    type="general"
                    accept="image/png,image/webp,image/jpeg"
                    onUpload={handleUpload}
                    onDelete={handleDeleteImage}
                  />
                  <ImageField
                    label="Right Decoration Image"
                    hint="Optional small PNG shown on the right. Leave empty to use the default peacock emoji."
                    value={config?.heroDecorationRightImage || ''}
                    path="heroDecorationRightImage"
                    type="general"
                    accept="image/png,image/webp,image/jpeg"
                    onUpload={handleUpload}
                    onDelete={handleDeleteImage}
                  />
                </SectionCard>

                <SectionCard title="Opening Animation" icon="🎬">
                  <LabelField label="Couple / Host Reveal Tagline" fieldKey="coupleRevealTagline" hint='Text shown during the opening couple reveal animation' value={lbl('coupleRevealTagline')} onChange={setLbl} placeholder={defaults['coupleRevealTagline']} />
                  <LabelField label="Cover Reveal Tagline" fieldKey="coverRevealTagline" hint='Text shown on the cover-style opening reveal' value={lbl('coverRevealTagline')} onChange={setLbl} placeholder={defaults['coverRevealTagline']} />
                </SectionCard>

                <SectionCard title="Envelope" icon="✉️">
                  <LabelField label="Envelope Title" fieldKey="envelopeTitle" hint='Title printed on the envelope e.g. "A Birthday Invitation"' value={lbl('envelopeTitle')} onChange={setLbl} placeholder={defaults['envelopeTitle']} />
                </SectionCard>

                {(storyUsesHeading6 || storyUsesCaption7 || storyUsesSection || always) && (
                <SectionCard title="Story & Photos" icon="📖">
                  {storyUsesSection && <LabelField label="Story Nav Link" fieldKey="storySection" hint='Label used in the navigation link to the story section' value={lbl('storySection')} onChange={setLbl} placeholder={defaults['storySection']} />}
                  {storyUsesHeading6 && <LabelField label="Story Heading (Layout 6)" fieldKey="storyHeading6" hint='Main heading for the story section in layout 6' value={lbl('storyHeading6')} onChange={setLbl} placeholder={defaults['storyHeading6']} />}
                  {(isLayout8 || isLayout11) && <LabelField label="Story Main Title (Layout 8/11)" fieldKey="layout8EternalLabel" hint='Large italic heading in the story section' value={lbl('layout8EternalLabel')} onChange={setLbl} placeholder={defaults['layout8EternalLabel']} />}
                  {(isLayout8 || isLayout11) && <LabelField label="Layout 8/11 — Join Us Line" fieldKey="layout8JoinUs" hint='Opening line before the names, e.g. "Join us for the wedding of"' value={lbl('layout8JoinUs')} onChange={setLbl} placeholder={defaults['layout8JoinUs']} />}
                  {(isLayout8 || isLayout11) && <LabelField label="Layout 8/11 — Gallery Label" fieldKey="layout8GalleryLabel" hint='Label shown above the photo gallery' value={lbl('layout8GalleryLabel')} onChange={setLbl} placeholder={defaults['layout8GalleryLabel']} />}
                  {storyUsesCaption7 && <LabelField label="Photo Caption (Layout 7)" fieldKey="storyCaption7" hint='Caption shown under the photo strip in layout 7' value={lbl('storyCaption7')} onChange={setLbl} placeholder={defaults['storyCaption7']} />}
                  <LabelField label="Story Footer Text" fieldKey="storyFooter" hint='Closing line at the end of the story section' value={lbl('storyFooter')} onChange={setLbl} placeholder={defaults['storyFooter']} />
                  {!heroUsesPhotoLbl && <LabelField label="Polaroid Card Label" fieldKey="photoLabel" hint='Text on the polaroid-style photo card' value={lbl('photoLabel')} onChange={setLbl} placeholder={defaults['photoLabel']} />}
                </SectionCard>
                )}

                <SectionCard title="Timeline & Countdown" icon="⏳">
                  <LabelField label="Timeline Eyebrow" fieldKey="timelineEyebrow" hint='Small uppercase label above the timeline heading' value={lbl('timelineEyebrow')} onChange={setLbl} placeholder={defaults['timelineEyebrow']} />
                  <LabelField label="Timeline Heading" fieldKey="timelineHeading" hint='Main heading for the schedule / timeline section' value={lbl('timelineHeading')} onChange={setLbl} placeholder={defaults['timelineHeading']} />
                  <LabelField label="Countdown Label" fieldKey="countdownLabel" hint='Small text above the countdown timer' value={lbl('countdownLabel')} onChange={setLbl} placeholder={defaults['countdownLabel']} />
                  <LabelField label="Countdown Heading" fieldKey="countdownHeading" hint='Heading above the countdown timer' value={lbl('countdownHeading')} onChange={setLbl} placeholder={defaults['countdownHeading']} />
                </SectionCard>

                {eventsUsesSubtitle && (
                <SectionCard title="Event Details" icon="📍">
                  <LabelField label="Event Section Subtitle (Layout 6)" fieldKey="eventDetailsSubtitle" hint='Italic script text below "The Celebration" heading in layout 6' value={lbl('eventDetailsSubtitle')} onChange={setLbl} placeholder={defaults['eventDetailsSubtitle']} />
                </SectionCard>
                )}

                <SectionCard title="RSVP" icon="💬">
                  <LabelField label="WhatsApp Message Header" fieldKey="rsvpMessageHeader" hint='First line of the WhatsApp RSVP message' value={lbl('rsvpMessageHeader')} onChange={setLbl} placeholder={defaults['rsvpMessageHeader']} />
                  {isLayout10 && <LabelField label="WhatsApp RSVP Alt Header" fieldKey="rsvpMessageHeaderAlt" hint='Alternative RSVP message header used in layout 10' value={lbl('rsvpMessageHeaderAlt')} onChange={setLbl} placeholder={defaults['rsvpMessageHeaderAlt']} />}
                </SectionCard>

                <SectionCard title="Navigation" icon="🧭">
                  <LabelField label="Nav Display Names" fieldKey="navNames" hint='Override the names shown in the navigation bar (leave empty to use default)' value={lbl('navNames')} onChange={setLbl} placeholder={defaults['navNames'] || 'e.g. John & Jane'} />
                </SectionCard>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleLabelOverridesSave}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C9956A] hover:bg-[#b8845a] text-white text-sm font-semibold transition-colors shadow-sm"
                  >
                    <Save size={14} /> Save Labels
                  </button>
                </div>
              </>
            );
          })()}

          <details className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <summary className="px-6 py-4 cursor-pointer text-xs font-bold tracking-wide text-slate-500 uppercase hover:bg-slate-50 transition-colors flex items-center gap-2">
              <Layers size={14} className="opacity-50" /> Raw JSON Preview
            </summary>
            <pre className="text-xs text-slate-600 bg-slate-50 px-6 py-4 overflow-auto max-h-96 border-t border-slate-100">
              {JSON.stringify(config, null, 2)}
            </pre>
          </details>

          <button
            form="config-form"
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-[#C9956A] text-white font-bold text-sm tracking-widest uppercase shadow-[0_4px_20px_rgba(201,149,106,0.35)] hover:bg-[#b5845a] disabled:opacity-60 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Saving...
              </>
            ) : (
              <span className="flex items-center gap-2">
                <Save size={18} /> Save & Update Config
              </span>
            )}
          </button>
        </main>
      </form>

      {/* Premium Media Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDelete(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 15 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative bg-white/95 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-xl p-8 max-w-md w-full text-center"
            >
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                <AlertCircle size={32} />
              </div>
              <h2 className="text-2xl font-serif text-neutral-800 dark:text-neutral-100 mb-3">Delete Media?</h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-8 leading-relaxed">
                Are you sure you want to permanently delete this file from the cloud? This action will remove the asset from all layouts.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-3 px-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-lg font-bold uppercase text-[10px] tracking-widest hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDeleteImage}
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-rose-500 text-white rounded-lg font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-600 disabled:opacity-50 transition-all"
                >
                  {loading ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
