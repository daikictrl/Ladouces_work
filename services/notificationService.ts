// services/notificationService.ts — Notification scheduling service for MOVANA
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { TripReminder } from "../types/reminder";
import { parseLocalDate } from "../utils/date";

const CHANNEL_ID = "movana-travel-reminders";

/**
 * Set up the notification handler so notifications display when
 * the app is in the foreground.
 * Call this once at the top level of the app (root layout).
 */
export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Create the Android notification channel.
 * Must be called before scheduling any notifications on Android 13+.
 */
export async function setupAndroidChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Travel Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2563eb",
      description: "Reminders for upcoming trips and packing lists",
    });
  }
}

/**
 * Request notification permissions from the user.
 * Only called during reminder setup — NOT on app launch.
 * Returns true if permissions were granted, false otherwise.
 */
export async function requestPermissions(): Promise<boolean> {
  // Set up Android channel first (required for Android 13+ permission prompt)
  await setupAndroidChannel();

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    finalStatus = status;
  }

  return finalStatus === "granted";
}

/**
 * Check if notifications are currently permitted without prompting.
 */
export async function hasPermissions(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

/**
 * Build the notification messages for a trip reminder.
 */
function buildNotificationMessages(reminder: TripReminder) {
  const uncheckedItems = [
    ...(reminder.selectedItems || []),
    ...(reminder.customItems || []),
  ].filter((item) => !item.completed);

  const itemNames = uncheckedItems
    .slice(0, 3)
    .map((i) => i.text.toLowerCase())
    .join(", ");

  const tripLabel = `${reminder.from} → ${reminder.destination}`;

  return {
    trip: {
      title: "🚌 Trip Reminder",
      body: `Your trip ${tripLabel} is coming up! Departure at ${reminder.departureTime}.`,
    },
    packing: {
      title: "🎒 Packing Reminder",
      body:
        uncheckedItems.length > 0
          ? `Don't forget your ${itemNames}${uncheckedItems.length > 3 ? ` and ${uncheckedItems.length - 3} more items` : ""} for your trip to ${reminder.destination}.`
          : `All packed for your trip to ${reminder.destination}! 🎉`,
    },
    departure: {
      title: "⏰ Departure Alert",
      body: `Your bus to ${reminder.destination} departs soon! Make sure you're ready.`,
    },
  };
}

/**
 * Schedule local notifications for a trip reminder.
 * Returns an array of notification IDs that can be used for cancellation.
 */
export async function scheduleReminderNotifications(
  reminder: TripReminder
): Promise<string[]> {
  const permitted = await hasPermissions();
  if (!permitted) return [];

  const scheduledIds: string[] = [];
  const enabledAlarms = (reminder.alarms || []).filter((a) => a.enabled);

  if (enabledAlarms.length === 0) return [];

  // Parse the departure date + time to calculate difference
  const departureDate = parseLocalDate(reminder.travelDate);
  const timeParts = reminder.departureTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (timeParts) {
    let hours = parseInt(timeParts[1], 10);
    const minutes = parseInt(timeParts[2], 10);
    const ampm = timeParts[3];
    if (ampm) {
      if (ampm.toUpperCase() === "PM" && hours !== 12) hours += 12;
      if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;
    }
    departureDate.setHours(hours, minutes, 0, 0);
  }

  const departureTimestamp = departureDate.getTime();
  const now = Date.now();
  const messages = buildNotificationMessages(reminder);

  for (const alarm of enabledAlarms) {
    const triggerTimestamp = alarm.timestamp;

    // Skip if the trigger time is in the past
    if (triggerTimestamp <= now) continue;

    const secondsUntilTrigger = Math.floor((triggerTimestamp - now) / 1000);
    const secondsBeforeDeparture = Math.floor((departureTimestamp - triggerTimestamp) / 1000);

    // Choose message type based on how close to departure
    let content: { title: string; body: string };
    if (secondsBeforeDeparture <= 1800) {
      // 30 min or less before departure → departure alert
      content = messages.departure;
    } else if (secondsBeforeDeparture <= 7200) {
      // 2 hours or less before departure → packing reminder
      content = messages.packing;
    } else {
      // More than 2 hours before departure → trip reminder
      content = messages.trip;
    }

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          ...content,
          data: {
            reminderId: reminder.reminderId,
            tripId: reminder.tripId,
            type: "trip-reminder",
          },
          ...(Platform.OS === "android" ? { color: "#2563eb" } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.max(secondsUntilTrigger, 1),
          channelId: Platform.OS === "android" ? CHANNEL_ID : undefined,
        },
      });
      scheduledIds.push(id);
    } catch (error) {
      console.warn("Failed to schedule notification:", error);
    }
  }

  return scheduledIds;
}

/**
 * Cancel previously scheduled notifications by their IDs.
 */
export async function cancelReminderNotifications(
  notificationIds: string[]
): Promise<void> {
  for (const id of notificationIds) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {
      // Notification may have already fired or been dismissed
    }
  }
}

/**
 * Cancel all MOVANA notifications.
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get count of currently scheduled notifications.
 */
export async function getScheduledCount(): Promise<number> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.length;
}
