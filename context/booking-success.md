MOVANA — BOOKING SUCCESS SCREEN
=================================

OVERVIEW
--------
The success screen is the final step in the booking flow. It confirms that the
simulated payment and booking were accepted, displays a summary of the new
ticket, and gives the user clear next actions. This screen also triggers
notification scheduling and checklist creation prompts.


ROUTE
-----
/(tabs)/book/success
headerShown: false


SCREEN DESIGN
-------------
Full-screen layout. No scroll needed — all content fits the viewport.

Background: gradient fill (top to bottom: primary blue → lighter blue) from theme.
All text: white.


LAYOUT — TOP TO BOTTOM
-----------------------
Order   Element                      Notes
---     ---                          ---
1       Success animation            Lottie or Animated checkmark icon
2       Confirmation headline        "Booking Confirmed!"
3       Booking reference number     "#TK-XXXXXXXX"
4       Trip summary card            white card inset
5       Action buttons               2 stacked buttons


ELEMENT 1 — SUCCESS ANIMATION
-------------------------------
Option A: Lottie animation (expo-av or lottie-react-native)
  Use a simple checkmark-in-circle lottie animation (free asset from lottiefiles.com)
  Duration: 1.2 seconds, play once on mount, no loop
  Size: 100x100

Option B (fallback if no Lottie): animated checkmark drawn with Animated API
  A circle that fills in with a draw stroke animation
  Checkmark path inside that fades in after circle completes

Implementation preference: Lottie if available in the Expo environment.
Fallback: Animated API circle + scale-in checkmark icon.


ELEMENT 2 — CONFIRMATION HEADLINE
-----------------------------------
Text: "Booking Confirmed!"
Font: 26px bold, white, centered
Sub-text: "Your ticket has been generated and saved."
Sub font: 15px, white 80% opacity, centered
Spacing: 12px gap between headline and sub-text


ELEMENT 3 — BOOKING REFERENCE
-------------------------------
Label: "Booking Reference"
Font: 12px uppercase, white 60% opacity, letter-spacing 1.5
Value: "#TK-XXXXXXXX" (from generated ticket in ticketStore)
Font: 18px bold monospace, white, centered
Copy icon (copy-outline) next to the ID — tap copies to clipboard using Clipboard API


ELEMENT 4 — TRIP SUMMARY CARD
-------------------------------
White card, border radius 20, padding 20.
Black/dark text (against white background).

Fields displayed in a 2-column grid:
  Label        Value
  ---          ---
  From         Douala
  To           Yaoundé
  Date         Wed, 04 Jun 2025
  Departure    06:00
  Agency       Vatican Express
  Seat(s)      3A, 3B
  Amount Paid  9,000 XAF

Label style: 11px muted, uppercase
Value style: 14px bold, primary dark text


ELEMENT 5 — ACTION BUTTONS
----------------------------
Button 1 (primary white):
  Label:       "View My Ticket"
  Style:       white background, primary blue text, full width, rounded 14
  On press:    navigate to /(tabs)/tickets/[ticketId]

Button 2 (ghost outline):
  Label:       "Create Packing Checklist"
  Style:       white outline border, white text, full width, rounded 14
  On press:    navigate to /(tabs)/reminders/new
               AND pass { linkedTicketId: ticketId } as route params

Small text link below both buttons:
  "Back to Home" — tap navigates to /(tabs)/home and clears booking stack history


SIDE EFFECTS ON MOUNT
---------------------
When this screen mounts (inside useEffect):

1. Call scheduleBookingNotifications(ticket) from lib/notifications.ts
   This schedules the trip day-before and 3-hour-before notification alerts.

2. Reset bookingStore booking flow state:
   Clear: fromCity, toCity, travelDate, selectedAgency, selectedBus,
          selectedSeats, totalPrice, paymentMethod
   This ensures a fresh state for the next booking session.

3. Play success haptic feedback:
   import * as Haptics from 'expo-haptics'
   Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)


BACK NAVIGATION PREVENTION
---------------------------
This screen should NOT allow the user to press back into the payment screen.
Implement by replacing the booking stack history on navigation:
  router.replace("/(tabs)/book/success")
  (use replace, not push, so back gesture goes to home not payment)


INSTALL COMMANDS
----------------
npx expo install expo-haptics expo-clipboard
npx expo install lottie-react-native   (optional — only if using Lottie animation)
