MOVANA — USER PROFILE AND SETTINGS
=====================================

OVERVIEW
--------
The profile section lets users view and edit their personal info, review their
travel history, toggle app theme. Profile data comes from Clerk. App settings(theme) are stored locally via Zustand + AsyncStorage.


ROUTES
------
Route                        Screen
---                          ---
/(tabs)/profile/index        profile dashboard
/(tabs)/profile/settings     app settings
/(tabs)/profile/history      travel history


=========================================
SCREEN 1 — PROFILE DASHBOARD
=========================================

ROUTE
------
/(tabs)/profile/index

HEADER
------
No navigation header (screen manages its own top padding).

PROFILE TOP SECTION
--------------------
Large avatar area centered:
  Avatar:     profile photo from Clerk (or initials circle if none)
  Size:       90x90, border radius 45
  Border:     3px primary blue ring around avatar

Below avatar:
  Full name:  from Clerk user.fullName, 20px bold
  Email:      from Clerk user.emailAddresses[0], 14px muted
  Edit button: small "Edit Profile" link text → opens EditProfileModal

EDIT PROFILE MODAL
------------------
Bottom sheet modal with:
  First name input (pre-filled)
  Last name input (pre-filled)
  Update button → calls Clerk user.update({ firstName, lastName })
  Changes reflect immediately via useUser() hook

STATS ROW
---------
3-column stats bar between profile top and menu:
  Column 1: total trips booked (from ticketStore.tickets.length)
  Column 2: upcoming trips count
  Column 3: total checklists count (from reminderStore)

Each stat: large number on top, small label below, separated by vertical dividers.

MENU SECTIONS
-------------
Grouped menu rows, each row is a tappable item with icon, label, and chevron.

Group 1 — My Account:
  Row            Icon                Navigate To
  ---            ---                 ---
  My Tickets     ticket-outline      /(tabs)/tickets
  My Reminders   checkmark-outline   /(tabs)/reminders
  Travel History time-outline        /(tabs)/profile/history

Group 2 — App Settings:
  Row               Icon               Navigate To / Action
  ---               ---                ---
  Appearance        contrast-outline   /(tabs)/profile/settings
  profile/settings (scroll to notifications)
  Language          language-outline   /(tabs)/profile/settings (scroll to language)
  Connected Devices bluetooth-outline  /(tabs)/profile/devices

Group 3 — Account:
  Row            Icon                Action
  ---            ---                 ---
  Sign Out       log-out-outline     show confirmation alert → Clerk signOut()
  Delete Account warning-outline     show confirmation alert → Clerk user.delete()

Row style:
  Height: 56
  Icon:   24px, tinted primary blue
  Chevron: chevron-forward-outline, muted
  Divider: 1px line between rows (not between groups)
  Group label: uppercase 11px muted text above each group


=========================================
SCREEN 2 — APP SETTINGS
=========================================

ROUTE
------
/(tabs)/profile/settings

HEADER
------
Title: "Settings"
Back button: returns to profile dashboard

SETTINGS SECTIONS (top to bottom):

APPEARANCE
----------
Setting         Control         Options
---             ---             ---
Theme           ToggleRow       Light | Dark | System
                On toggle: updates settingsStore.theme, applies immediately via
                ThemeProvider context

The app theme wraps the root layout in a context provider that reads
settingsStore.theme and injects the correct design-theme tokens.


ABOUT
-----
Non-interactive rows:
  App Version:    read from expo-constants (Constants.expoConfig.version)
  Build:          read from Constants.expoConfig.extra.buildNumber (if set)
  Privacy Policy: external link (placeholder URL)
  Terms:          external link (placeholder URL)


=========================================
SCREEN 3 — TRAVEL HISTORY
=========================================

ROUTE
------
/(tabs)/profile/history

HEADER
------
Title: "Travel History"

CONTENT
-------
List of all past tickets (travelDate < today), sorted most-recent first.
Uses the same TicketCard component from tickets.md but with:
  Status badge always "PAST" gray
  "Track Bus" button hidden
  "Share" button hidden

Stats summary at top of the list:
  "You have taken X trips with MOVANA"
  Display in a subtle banner card.

Empty state:
  Text: "No past trips yet"
  Sub:  "Your completed trips will appear here"


STATE READ
----------
ticketStore.tickets (filtered where travelDate < today)
reminderStore.checklists.length
settingsStore.theme, settingsStore.language


STATE WRITTEN (settingsStore — Zustand + AsyncStorage)
------------------------------------------------------
Field         Type       Default   Description
---           ---        ---       ---
theme         string     "system"  "light" | "dark" | "system"
language      string     "en"      "en" | "fr"
notifTrips    boolean    true      trip reminder notifications enabled
notifPacking  boolean    true      checklist reminder notifications enabled
leadTime      string     "both"    "1day" | "3hours" | "both"


INSTALL COMMAND
---------------
npx expo install expo-constants
(already likely installed; used for app version display)
