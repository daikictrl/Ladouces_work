// constants/reminderDefaults.ts — Default suggested items for travel packing checklist

import type { ReminderItem } from "../types/reminder";

/**
 * Default suggested travel items displayed during reminder setup.
 * Users can select/deselect these and also add custom items.
 */
export const SUGGESTED_TRAVEL_ITEMS: Omit<ReminderItem, "completed">[] = [
  { id: "passport", text: "Passport / ID Card", isCustom: false },
  { id: "charger", text: "Phone Charger", isCustom: false },
  { id: "pillow", text: "Travel Pillow", isCustom: false },
  { id: "sunscreen", text: "Sunscreen", isCustom: false },
  { id: "umbrella", text: "Umbrella", isCustom: false },
  { id: "water", text: "Water Bottle", isCustom: false },
  { id: "snacks", text: "Snacks", isCustom: false },
  { id: "headphones", text: "Headphones", isCustom: false },
  { id: "medicine", text: "Medication", isCustom: false },
  { id: "clothes", text: "Extra Clothes", isCustom: false },
  { id: "cash", text: "Cash / Wallet", isCustom: false },
  { id: "documents", text: "Travel Documents", isCustom: false },
];

/**
 * Emoji icons for each suggested item (used in the selection UI).
 */
export const ITEM_ICONS: Record<string, string> = {
  passport: "🪪",
  charger: "🔌",
  pillow: "🛏️",
  sunscreen: "🧴",
  umbrella: "☂️",
  water: "💧",
  snacks: "🍪",
  headphones: "🎧",
  medicine: "💊",
  clothes: "👕",
  cash: "💰",
  documents: "📄",
};
