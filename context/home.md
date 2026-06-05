MOVANA — HOME SCREEN
=====================

OVERVIEW
--------
The home screen is the main dashboard. It greets the user by name, surfaces
their next upcoming trip, provides quick-access action buttons for core features,
and gives a summary of active packing reminders. This is the first screen a
signed-in user sees after onboarding.


ROUTE
-----
/(tabs)/home/index


UI SECTIONS — TOP TO BOTTOM
----------------------------
Order   Section                  Component
---     ---                      ---
1       Top header bar           HomeHeader
2       Upcoming trip card       UpcomingTripCard
3       Quick action grid        QuickActionsGrid
4       Recent tickets row       RecentTicketsRow
5       Active reminder card     ActiveReminderCard


SECTION 1 — HOME HEADER
------------------------
Left side:
  Greeting text:   "Good morning, Joseph" (time-aware: morning / afternoon / evening)
  Sub-text:        "Where are you heading today?"

Right side:
  Notification bell icon (Ionicons: notifications-outline)
  User avatar: initials circle if no photo, profile photo if set via Clerk

Padding: horizontal 20, top safeAreaInset + 12


SECTION 2 — UPCOMING TRIP CARD
--------------------------------
State: if upcomingTrip exists in bookingStore

  Card background:    gradient (blue → purple) from design theme
  Text color:         white
  Border radius:      20
  Contents:
    Top row:          agency name (left) | countdown badge (right)
    Middle row:       departure city → destination city, large font
    Bottom row:       date and time (left) | seat number (right)
    Action button:    "View Details" → navigates to /(tabs)/home/trip-detail/[id]

  Countdown badge values:
    More than 2 days   "In X days"
    Tomorrow           "Tomorrow"
    Today              "Today"
    Overdue / past     do not show card

State: if no upcomingTrip

  Empty state card:
    Icon: bus-outline, muted color
    Text: "No upcoming trips"
    Sub-text: "Start planning your next journey"
    Button: "Book a Trip" → navigates to /(tabs)/book


SECTION 3 — QUICK ACTION GRID
-------------------------------
2x2 grid of square tappable cards.

Card Label        Icon                    Navigate To
---               ---                     ---
Book Trip         bus-outline             /(tabs)/book
My Tickets        ticket-outline          /(tabs)/tickets
Reminders         checkmark-done-outline  /(tabs)/reminders
Track Bus         map-outline             /(tabs)/home/trip-detail/[id] if trip exists
                                          else show toast "No active trip to track"

Each card:
  Background:     white (light) / dark card (dark)
  Border radius:  16
  Shadow:         soft, from design theme
  Icon size:      28, primary blue
  Label:          12px, theme regular font, centered below icon
  Padding:        16 all sides


SECTION 4 — RECENT TICKETS ROW
--------------------------------
Horizontal ScrollView of the last 3 confirmed tickets.
Section title: "Recent Tickets" — 16px bold, left-aligned

Each mini ticket card:
  Width:          150
  Border radius:  14
  Background:     white / dark card
  Contents:
    Agency name   top, 12px medium font
    Route         departure → destination, 13px bold
    Date          bottom, 11px muted color

Tap: navigate to /(tabs)/tickets/[id]

If no tickets: hide entire section (render null)


SECTION 5 — ACTIVE REMINDER CARD
----------------------------------
Shows packing checklist progress for the upcoming trip.

If activeChecklist exists in reminderStore:
  Card title:    "Packing Checklist"
  Progress text: "5 of 8 items packed"
  Progress bar:  filled with primary blue, track in muted gray, height 6, rounded
  Button:        "Open Checklist" → navigates to /(tabs)/reminders/[id]

If no checklist:
  Text:          "Create a packing list for your trip"
  Button:        "New Checklist" → navigates to /(tabs)/reminders/new


STATE CONSUMED (Zustand)
------------------------
Store             Fields
---               ---
bookingStore      upcomingTrip, recentTickets
reminderStore     activeChecklist, packedCount, totalCount
authStore         user.firstName, user.profileImageUrl


SCROLL BEHAVIOR
---------------
Entire screen wrapped in ScrollView.
No nested scroll — horizontal ticket row uses its own horizontal ScrollView.
RefreshControl on outer ScrollView re-reads state on pull-down.
Content padding bottom: 20 (above tab bar).


INSTALL COMMAND
---------------
No additional packages beyond expo-router and expo-linear-gradient (design theme).
expo-linear-gradient is required for the upcoming trip card gradient.
npx expo install expo-linear-gradient
