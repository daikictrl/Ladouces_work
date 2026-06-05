MOVANA — DIGITAL TICKET MANAGEMENT
=====================================

OVERVIEW
--------
The tickets section gives users access to all their generated digital tickets.
It has a list screen showing all bookings and a detail screen showing the full
ticket with a scannable QR code. Tickets are persisted locally via AsyncStorage
through the ticketStore (Zustand).


ROUTES
------
Route                    Screen
---                      ---
/(tabs)/tickets/index    all tickets list
/(tabs)/tickets/[id]     single ticket detail with QR code


==================================
SCREEN 1 — TICKETS LIST
==================================

HEADER
------
Title: "My Tickets"
No back button (root tab screen)

FILTER TAB ROW
--------------
Horizontal row of 3 filter chips directly below header:
  "All"   |   "Upcoming"   |   "Past"

Filter logic:
  All        show all tickets sorted by bookedAt descending
  Upcoming   tickets where travelDate >= today, sorted soonest first
  Past       tickets where travelDate < today, sorted most-recent first

Active chip: filled primary blue background, white text
Inactive chip: outline border, muted text

TICKET CARD COMPONENT
----------------------
Name: TicketCard

Layout (card is horizontal, 2-column):
  Left column (70%):
    Agency name          13px medium, muted color
    Route                fromCity → toCity, 18px bold, primary text color
    Date & time          "Wed 04 Jun · 06:00"
    Seat(s)              "Seat 3A, 3B"
    Status badge         "CONFIRMED" — green | "PAST" — gray

  Right column (30%):
    Vertical dashed divider (simulates ticket tear line)
    QR code thumbnail    small 60x60 QR preview (react-native-qrcode-svg)
    Ticket ID            "#TK-XXXXXXXX" 10px, muted

Card style:
  Background:    white / dark card from design theme
  Border radius: 18
  Shadow:        medium soft shadow from design theme
  Margin:        12 horizontal, 8 vertical

Tap: navigate to /(tabs)/tickets/[ticketId]

EMPTY STATE
-----------
If no tickets exist:
  Icon:    ticket-outline, large, muted color
  Text:    "No tickets yet"
  Sub:     "Your booked trips will appear here"
  Button:  "Book a Trip" → navigate to /(tabs)/book


==================================
SCREEN 2 — TICKET DETAIL
==================================

ROUTE
------
/(tabs)/tickets/[id]

HEADER
------
Title: "Ticket"
Back button: returns to /tickets/index

FULL TICKET LAYOUT
------------------
Rendered as a single styled "physical ticket" card.
The card has a torn-edge divider between the main body and the QR section.

Top half of card:
  Agency logo placeholder (large initials circle, colored per agency)
  Agency name centered below logo
  Route:              "Douala  →  Yaoundé"  — large bold
  Departure time:     "06:00"  large, primary color
  Arrival time:       "10:30 (est.)"  smaller, muted

Mid section (grid of 4 labeled fields):
  Label           Value
  ---             ---
  Passenger       full name from ticket
  Date            Wed, 04 Jun 2025
  Seat(s)         3A, 3B
  Class           Standard / Express / VIP

Torn divider: dashed line with circle cutouts on both sides (CSS-style border trick
using alternating dashes with View components)

Bottom half of card:
  QR Code:        centered, size 180x180
                  value = ticket.qrData (JSON string)
                  color = primary dark, background white
  Ticket ID:      "#TK-XXXXXXXX" below QR code, 12px monospace
  Payment method: "Paid via Mobile Money" — 11px muted

Below the card:
  "Amount Paid" label + amount value (large, primary color)
  Status chip: "CONFIRMED" in green badge


QR CODE COMPONENT
-----------------
Library: react-native-qrcode-svg

Props used:
  value        ticket.qrData (string)
  size         180
  color        dark text color from design theme
  backgroundColor  white

The QR encodes: { ticketId, from, to, seats, date, agencyName }


ACTION BUTTONS ROW (below card)
---------------------------------
Two buttons side by side:

Button          Icon                Action
---             ---                 ---
Share Ticket    share-outline       Expo Sharing — share screenshot of card area
Track Bus       navigate-outline    navigate to /(tabs)/home/trip-detail/[id]
                                    only visible if ticket status is "upcoming"


STATE READ (ticketStore)
-------------------------
tickets array — find by ticketId param from route
getTicketById(id): returns single ticket object


INSTALL COMMAND
---------------
npx expo install react-native-qrcode-svg react-native-svg expo-sharing
