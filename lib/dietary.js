/**
 * Shared dietary options utility.
 * Layouts read from config.rsvp.dietaryTitle / config.rsvp.dietaryItems.
 * When those are null/undefined the built-in defaults below are used,
 * so existing live invitations are completely unaffected.
 */

export const DEFAULT_DIETARY_TITLE = 'Dietary Requirements & Allergies';

export const DEFAULT_DIETARY_ITEMS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'glutenFree', label: 'Gluten-Free' },
  { id: 'noPorkBeef', label: 'No Pork/Beef' },
];

/** Returns the section title to show, falling back to the default. */
export function getDietaryTitle(config) {
  const t = config?.rsvp?.dietaryTitle;
  return (t && t.trim()) ? t.trim() : DEFAULT_DIETARY_TITLE;
}

/**
 * Returns the items array to render.
 * Falls back to DEFAULT_DIETARY_ITEMS when the admin hasn't customised them.
 */
export function getDietaryItems(config) {
  const items = config?.rsvp?.dietaryItems;
  return (Array.isArray(items) && items.length > 0) ? items : DEFAULT_DIETARY_ITEMS;
}

/**
 * Builds the initial dietary checkbox state object from an items array.
 * { vegetarian: false, vegan: false, ... }
 */
export function getInitialDietary(items) {
  return Object.fromEntries(items.map(item => [item.id, false]));
}

/**
 * Converts the current dietary checkbox state back to a human-readable
 * comma-separated string for the WhatsApp message.
 * Uses the item labels (not raw keys) so custom labels appear correctly.
 */
export function buildDietaryString(dietary, items) {
  return items
    .filter(item => dietary[item.id])
    .map(item => item.label)
    .join(', ') || 'None';
}
