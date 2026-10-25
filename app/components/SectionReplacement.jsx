/**
 * Full-section image override.
 *
 * When the admin uploads an image for a section, that section's entire content
 * — headings, cards, text, decorations — is swapped for the image. Styling
 * mirrors the Layout 9 hero cover: 100% width, natural height, never cropped.
 *
 * Callers must decide between this and the original section OUTSIDE the
 * section's own guards, since several sections return null when their content
 * is empty (Timeline with no items, StorySection with no story text). An image
 * uploaded for an otherwise-empty section still has to render.
 */

// The image carries all of the section's content, so give assistive tech
// something better than an empty alt.
const FALLBACK_ALT = {
  story: 'Our story',
  timeline: 'Event programme',
  events: 'Event details',
  guestCard: 'Your invitation',
  footer: 'Closing note',
};

/** Returns the override URL for a section, or '' to keep the original. */
export function getSectionReplacement(config, key) {
  const value = config?.sectionReplacements?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

export default function SectionReplacement({ id, sectionKey, src, alt, as: Tag = 'section' }) {
  if (!src) return null;

  return (
    <Tag id={id} className="w-full relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt ?? FALLBACK_ALT[sectionKey ?? id] ?? ''}
        className="w-full h-auto block"
        loading="lazy"
      />
    </Tag>
  );
}
