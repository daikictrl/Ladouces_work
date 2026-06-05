MOVANA — SMART NOTIFICATION SYSTEM
=====================================

OVERVIEW
--------
MOVANA uses Expo local notifications to remind users about upcoming trips and
unpacked checklist items. All notifications are scheduled locally on the device —
no push notification server or backend is required. Notifications are triggered
at defined time offsets before departure and when checklist items remain unchecked.


TECHNOLOGY
----------
Package                   Notes
---                       ---
expo-notifications        local notification scheduling and handling
expo-device               check if running on physical device (required for permissions)


SETUP — PERMISSIONS
--------------------
Permission request must happen before any notification is scheduled.
Request permissions immediately after a user completes their first booking.
Do NOT request permissions at app launch (bad UX, users reject it).

Permission request code is placed in a shared function:
  requestNotificationPermission() in lib/notifications.ts

Logic:
  1. Call Notifications.requestPermissionsAsync()
  2. If status !== "granted" → show in-app banner:
       "Enable notifications to get trip reminders."
       Button: "Open Settings" → Linking.openSettings()
  3. If granted → proceed to schedule notifications

Note: on Android, set notification channel before scheduling.
Channel config:
  id:          "movana-channel"
  name:        "MOVANA Travel Alerts"
  importance:  Notifications.AndroidImportance.HIGH


NOTIFICATION TRIGGERS
----------------------

1. TRIP REMINDER — 1 DAY BEFORE
  When scheduled:  after booking is confirmed (payment success screen)
  Trigger time:    travelDate - 24 hours
  Title:           "Your trip is tomorrow!"
  Body:            "Douala → Yaoundé at 06:00 with Vatican Express. Get ready."
  Data:            { type: "trip_reminder", ticketId }

2. TRIP REMINDER — 3 HOURS BEFORE
  When scheduled:  after booking is confirmed
  Trigger time:    travelDate departure time - 3 hours
  Title:           "Departing in 3 hours"
  Body:            "Head to the station soon. Seat 3A is waiting."
  Data:            { type: "trip_reminder", ticketId }

3. CHECKLIST REMINDER — NIGHT BEFORE TRIP
  When scheduled:  after checklist is created with a linked ticket
  Trigger time:    travelDate - 18 hours (e.g. the evening before)
  Condition:       only if checklist.items.some(i => !i.isPacked)
  Title:           "Don't forget to pack!"
  Body:            "You still have unpacked items for your trip tomorrow."
  Data:            { type: "checklist_reminder", checklistId }

4. MORNING OF TRIP — FINAL CHECK
  When scheduled:  after checklist is created with a linked ticket
  Trigger time:    travelDate - 2 hours
  Condition:       only if checklist.items.some(i => !i.isPacked)
  Title:           "Final packing check ✅"
  Body:            "3 items still unpacked. Open MOVANA to review."
  Data:            { type: "checklist_reminder", checklistId }


NOTIFICATION ID STORAGE
------------------------
After scheduling a notification, Expo returns a notificationId string.
Store these IDs so they can be cancelled later.

Stored in notificationStore (Zustand + AsyncStorage):
  Field             Type         Description
  ---               ---          ---
  scheduledIds      object       key = ticketId or checklistId, value = string[]

Example: { "TK-XXXXXXXX": ["notif_abc", "notif_xyz"] }


CANCELLING NOTIFICATIONS
------------------------
When:
  User deletes a ticket → cancel all notificationIds linked to that ticketId
  User marks all checklist items as packed → cancel checklist reminder notifications
  User manually disables notifications in profile settings

Cancel using: Notifications.cancelScheduledNotificationAsync(notificationId)

Bulk cancel on ticket delete:
  const ids = notificationStore.scheduledIds[ticketId] ?? []
  for (const id of ids) {
    await Notifications.cancelScheduledNotificationAsync(id)
  }
  notificationStore.removeIds(ticketId)


NOTIFICATION TAP HANDLING
--------------------------
Register a response listener in the root layout (_layout.tsx):
  Notifications.addNotificationResponseReceivedListener(response => {
    const { type, ticketId, checklistId } = response.notification.request.content.data
    if (type === "trip_reminder") → router.push(`/tickets/${ticketId}`)
    if (type === "checklist_reminder") → router.push(`/reminders/${checklistId}`)
  })

Register a received listener (for foreground notifications):
  Notifications.addNotificationReceivedListener(notification => {
    // show in-app toast using a toast library or custom banner
  })

Both listeners should be cleaned up in the useEffect return.


IN-APP NOTIFICATION BANNER
---------------------------
When a notification arrives while the app is in the foreground, show a custom
slide-down banner instead of the system notification.

Banner component: NotificationBanner
  Position: absolute top, full width, zIndex high
  Content:  icon + title + body (truncated to 1 line)
  Duration: 4 seconds, then auto-hide with slide-up animation
  Tap:      navigates using notification data same as tap handler above

Triggered by: addNotificationReceivedListener


HELPER FUNCTIONS (lib/notifications.ts)
-----------------------------------------
Function                         Description
---                              ---
requestNotificationPermission()  requests OS permission, sets up Android channel
scheduleBookingNotifications(ticket)  schedules trip reminder notifications 1 and 2
scheduleChecklistNotifications(checklist, ticket)  schedules checklist reminders 3 and 4
cancelNotificationsFor(ticketId)  cancels all notifications for a given ticket
cancelChecklistNotifications(checklistId)  cancels checklist-specific notifications


INSTALL COMMAND
---------------
npx expo install expo-notifications expo-device
