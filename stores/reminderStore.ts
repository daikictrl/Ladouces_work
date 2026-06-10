// stores/reminderStore.ts — Trip-linked reminder state management
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  TripReminder,
  ReminderItem,
  AlarmTime,
} from "../types/reminder";
import {
  cancelReminderNotifications,
  scheduleReminderNotifications,
} from "../services/notificationService";

interface ReminderState {
  reminders: TripReminder[];

  // CRUD operations
  addReminder: (reminder: TripReminder) => void;
  updateReminder: (
    reminderId: string,
    updates: Partial<TripReminder>
  ) => void;
  deleteReminder: (reminderId: string) => void;

  // Item operations
  toggleItem: (reminderId: string, itemId: string) => void;
  addCustomItem: (reminderId: string, text: string) => void;
  deleteItem: (reminderId: string, itemId: string) => void;

  // Queries
  getReminderByTripId: (tripId: string) => TripReminder | undefined;
  getUpcomingReminders: () => TripReminder[];

  // Notification management
  scheduleNotifications: (reminderId: string) => Promise<void>;
  cancelNotifications: (reminderId: string) => Promise<void>;
}

export const useReminderStore = create<ReminderState>()(
  persist(
    (set, get) => ({
      reminders: [],

      addReminder: (reminder) =>
        set((state) => ({
          reminders: [reminder, ...state.reminders],
        })),

      updateReminder: (reminderId, updates) =>
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.reminderId === reminderId ? { ...r, ...updates } : r
          ),
        })),

      deleteReminder: (reminderId) => {
        const reminder = get().reminders.find(
          (r) => r.reminderId === reminderId
        );
        const ids = reminder?.scheduledNotificationIds || [];
        if (ids.length) {
          cancelReminderNotifications(ids);
        }
        set((state) => ({
          reminders: state.reminders.filter(
            (r) => r.reminderId !== reminderId
          ),
        }));
      },

      toggleItem: (reminderId, itemId) =>
        set((state) => ({
          reminders: state.reminders.map((r) => {
            if (r.reminderId !== reminderId) return r;
            return {
              ...r,
              selectedItems: (r.selectedItems || []).map((item) =>
                item.id === itemId
                  ? { ...item, completed: !item.completed }
                  : item
              ),
              customItems: (r.customItems || []).map((item) =>
                item.id === itemId
                  ? { ...item, completed: !item.completed }
                  : item
              ),
            };
          }),
        })),

      addCustomItem: (reminderId, text) =>
        set((state) => ({
          reminders: state.reminders.map((r) => {
            if (r.reminderId !== reminderId) return r;
            const newItem: ReminderItem = {
              id: `custom-${Date.now()}`,
              text,
              completed: false,
              isCustom: true,
            };
            return {
              ...r,
              customItems: [...(r.customItems || []), newItem],
            };
          }),
        })),

      deleteItem: (reminderId, itemId) =>
        set((state) => ({
          reminders: state.reminders.map((r) => {
            if (r.reminderId !== reminderId) return r;
            return {
              ...r,
              selectedItems: (r.selectedItems || []).filter(
                (item) => item.id !== itemId
              ),
              customItems: (r.customItems || []).filter(
                (item) => item.id !== itemId
              ),
            };
          }),
        })),

      getReminderByTripId: (tripId) => {
        return get().reminders.find((r) => r.tripId === tripId);
      },

      getUpcomingReminders: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return get().reminders.filter((r) => {
          const travelDate = new Date(r.travelDate);
          travelDate.setHours(0, 0, 0, 0);
          return travelDate.getTime() >= today.getTime();
        });
      },

      scheduleNotifications: async (reminderId) => {
        const reminder = get().reminders.find(
          (r) => r.reminderId === reminderId
        );
        if (!reminder) return;

        // Cancel existing notifications first
        const existingIds = reminder.scheduledNotificationIds || [];
        if (existingIds.length > 0) {
          await cancelReminderNotifications(existingIds);
        }

        // Schedule new ones
        const newIds = await scheduleReminderNotifications(reminder);

        // Update the store with new notification IDs
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.reminderId === reminderId
              ? { ...r, scheduledNotificationIds: newIds }
              : r
          ),
        }));
      },

      cancelNotifications: async (reminderId) => {
        const reminder = get().reminders.find(
          (r) => r.reminderId === reminderId
        );
        if (!reminder) return;

        await cancelReminderNotifications(
          reminder.scheduledNotificationIds || []
        );

        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.reminderId === reminderId
              ? { ...r, scheduledNotificationIds: [] }
              : r
          ),
        }));
      },
    }),
    {
      name: "movana-trip-reminders",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
