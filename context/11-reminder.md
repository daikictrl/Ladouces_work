MOVANA — SMART REMINDER CHECKLIST SYSTEM
==========================================

OVERVIEW
--------
The reminders section lets users create packing checklists linked to their
upcoming trips. Each checklist contains a list of items the user wants to
bring. Items can be added, edited, deleted, and marked as packed. Checklist
progress is surfaced on the home screen. This section also provides the data
used by the notification system to send packing reminders.


ROUTES
------
Route                         Screen
---                           ---
/(tabs)/reminders/index       all checklists list
/(tabs)/reminders/new         create new checklist
/(tabs)/reminders/[id]        checklist detail / item editing


=========================================
SCREEN 1 — CHECKLISTS LIST
=========================================

HEADER
------
Title: "Reminders"
Right button: "+" icon → navigate to /reminders/new

LIST ITEMS
----------
Each checklist card shows:
  Title         trip name or custom name e.g. "Douala → Yaoundé – Jun 2025"
  Progress bar  packed / total items
  Progress text "5 of 8 packed"
  Trip date     if linked to a booking
  Status badge  "All packed" (green) if progress = 100%

Card tap: navigate to /reminders/[id]
Long press: show action sheet with "Delete checklist" option

EMPTY STATE
-----------
Icon:    checkmark-circle-outline, large, muted
Text:    "No checklists yet"
Sub:     "Create a checklist before your next trip"
Button:  "New Checklist" → /reminders/new


=========================================
SCREEN 2 — CREATE NEW CHECKLIST
=========================================

ROUTE
------
/(tabs)/reminders/new

HEADER
------
Title: "New Checklist"
Left: Cancel button → go back
Right: "Save" button (disabled until title is filled)

FORM FIELDS
-----------
Field           Type            Placeholder / Label
---             ---             ---
Title           TextInput       "Checklist name (e.g. Yaoundé Trip)"
Link to trip    TripPicker      "Link to an upcoming booking (optional)"
Items           ItemInputList   pre-populated with defaults (see below)

LINK TO TRIP PICKER
-------------------
Dropdown-style selector showing list of confirmed upcoming tickets
from ticketStore.
Displays: route + date per option.
Selecting a trip auto-fills the checklist title with route + date string.

DEFAULT ITEMS (pre-loaded when creating a new list)
---------------------------------------------------
Item
---
National ID / Passport
Phone charger
Wallet
Keys
Clothes
Water bottle
Snacks
Power bank
Headphones
Books / Notebook

All default items start in "unpacked" state.
User can delete any default item before saving.

ADD CUSTOM ITEM
---------------
Text input + "Add" button at bottom of items list.
Pressing Add appends item to list with unpacked state.
Empty input: disabled Add button.
Max items per checklist: 50.

SAVE ACTION
-----------
On Save:
  1. Validate title is not empty
  2. Create checklist object (see Data Model below)
  3. Add to reminderStore
  4. Schedule notifications for this checklist (see notifications.md)
  5. Navigate to /reminders/[newId]


=========================================
SCREEN 3 — CHECKLIST DETAIL / EDITOR
=========================================

ROUTE
------
/(tabs)/reminders/[id]

HEADER
------
Title: checklist.title
Right: edit icon — toggles editMode (allows reordering/deleting items)

TOP PROGRESS AREA
-----------------
Large circular progress ring:
  Shows percentage packed (e.g. 62%)
  Center text: "5 / 8"
  Ring color: primary blue filling clockwise from top
  Track color: muted gray

Below ring: "Keep going, almost done!" — motivational sub-text
  If 100%: "All packed! Have a great trip 🎉"

ITEMS LIST
----------
Each item row:

  [ Checkbox ]  [ Item label ]  [ Edit icon? ]

Checkbox:
  Unpacked: empty square, blue border
  Packed:   filled blue square with white checkmark
  Tap checkbox: toggles packed state, saves immediately

Edit mode (toggled by header edit button):
  Show delete (trash) icon on right of each row
  Show drag handle on left for reordering (use drag-and-drop list)

ADD ITEM INPUT
--------------
Sticky row at bottom of list (above keyboard when focused):
  TextInput placeholder: "Add an item..."
  Add button: "+" rounded button, primary blue
  Pressing Add appends item to list, clears input, scrolls to new item

MARK ALL PACKED BUTTON
-----------------------
Floating action at bottom of screen:
  If not all packed: "Mark All as Packed" — primary blue filled button
  If all packed:     "Uncheck All" — outline button

SWIPE TO DELETE
---------------
Each item supports swipe-left gesture to reveal red Delete button.
Deleting an item prompts no confirmation (undo toast shown for 3 seconds).


DATA MODEL — CHECKLIST OBJECT
------------------------------
Field            Type          Description
---              ---           ---
id               string        unique UUID generated on creation
title            string        checklist name
linkedTicketId   string|null   ticket ID from ticketStore if linked
createdAt        Date
items            ChecklistItem[]

ChecklistItem fields:
Field            Type          Description
---              ---           ---
id               string        unique UUID
label            string        item text
isPacked         boolean       false by default


STATE MANAGED (reminderStore — Zustand + AsyncStorage)
------------------------------------------------------
Action                       Effect
---                          ---
addChecklist(list)           appends to checklists array, persists
updateItem(listId, itemId)   toggles isPacked, persists
addItem(listId, label)       appends new item to list, persists
deleteItem(listId, itemId)   removes item, persists
deleteChecklist(id)          removes checklist, persists
getActiveChecklist()         returns checklist linked to soonest upcoming ticket


INSTALL COMMAND
---------------
npx expo install react-native-draggable-flatlist
(for drag-to-reorder in edit mode)

npx expo install @react-native-async-storage/async-storage
(if not already installed via zustand.md)
