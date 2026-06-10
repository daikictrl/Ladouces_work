// types/reminder.ts — Core data types for the MOVANA Smart Reminder System

export type ReminderItem = {
  id: string;
  text: string;
  completed: boolean;
  isCustom: boolean;
};

export type AlarmTime = {
  id: string;
  timestamp: number; // Exact epoch milliseconds when the notification should fire
  label: string;     // Formatted label (e.g., "Today at 3:15 PM" or "June 10 at 14:00")
  enabled: boolean;
};

export type TripReminder = {
  reminderId: string;
  tripId: string; // links to Ticket.ticketId
  from: string;
  destination: string;
  departureTime: string;
  travelDate: string;
  agencyName: string;
  selectedItems: ReminderItem[];
  customItems: ReminderItem[];
  alarms: AlarmTime[];
  scheduledNotificationIds: string[];
  createdAt: string;
};

/**
 * Computes the packing progress (0–100) for a given TripReminder.
 */
export function computeProgress(reminder: TripReminder): number {
  const allItems = [...(reminder.selectedItems || []), ...(reminder.customItems || [])];
  if (allItems.length === 0) return 100;
  const completed = allItems.filter((item) => item.completed).length;
  return Math.round((completed / allItems.length) * 100);
}

/**
 * Returns the total item count and completed count for a reminder.
 */
export function getItemCounts(reminder: TripReminder): {
  total: number;
  completed: number;
} {
  const allItems = [...(reminder.selectedItems || []), ...(reminder.customItems || [])];
  return {
    total: allItems.length,
    completed: allItems.filter((item) => item.completed).length,
  };
}
