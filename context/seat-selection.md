MOVANA — SEAT SELECTION SCREEN
================================

OVERVIEW
--------
The seat selection screen renders an interactive visual layout of a bus interior.
Users tap seats to select them, see real-time price updates, and proceed to
payment. Seat state (available, selected, occupied) is communicated through color.
This screen is step 4 in the booking flow.


ROUTE
-----
/(tabs)/book/seats

HEADER
------
Title: "Select Your Seat"
Back button: returns to /book/bus (does not clear seat selection — user may re-enter)


SEAT COLOR SYSTEM
-----------------
State       Color                     Description
---         ---                       ---
Available   primary blue              user can tap to select
Selected    purple (accent from theme) user has chosen this seat
Occupied    light gray, no border     already booked by another passenger, non-tappable
Driver      dark gray, "Driver" label  non-interactive, top-left of layout


BUS LAYOUT STRUCTURE
--------------------
The bus is rendered as a scrollable column of seat rows.

Layout constants (standard bus, 14 rows):
  Bus capacity:   48 seats
  Layout per row: 2 seats | aisle | 2 seats (columns A, B, aisle, C, D)
  Rows:           1–12 standard, row 13 = back row (5 seats across)
  Row 0 (top):    driver seat (left) + door space (right)

Visual structure top to bottom:
  [ Bus front decorative header — shows agency name ]
  [ Driver block ]
  [ Rows 1–12: A  B  [aisle]  C  D ]
  [ Row 13: A  B  C  D  E (back row) ]

SEAT COMPONENT
--------------
Name: SeatButton
Props:
  seatId        string     e.g. "3A", "7C"
  status        "available" | "selected" | "occupied"
  onPress       function   called only if status === "available" or "selected"

Size: 42x42, border radius 8
Font: seat number centered, 12px

OCCUPIED SEATS GENERATION
--------------------------
Occupied seats are randomly pre-generated on screen mount using a seeded random
function based on the selected bus ID from bookingStore.
About 40–60% of seats are pre-occupied.
Occupied seat list is stored in component state (not Zustand — it is ephemeral).

SELECTION RULES
---------------
Rule                                      Behavior
---                                       ---
Max selectable seats                      4 per booking session
Tap available seat                        status changes to "selected"
Tap selected seat                         deselects it (back to "available")
Tap occupied seat                         no action, show brief "Seat taken" toast
Exceed max selection                      show toast "Maximum 4 seats per booking"


BOTTOM SUMMARY BAR
------------------
Fixed bar pinned to bottom of screen, above tab bar.

Contents:
  Left:   "X seat(s) selected" — updates reactively
  Center: selected seat IDs listed inline e.g. "3A, 3B"
  Right:  total price — seatCount × bus.pricePerSeat formatted as "X,XXX XAF"

Continue button:
  Label:     "Proceed to Payment"
  Width:     full, below the summary text
  Disabled:  if selectedSeats.length === 0
  On press:  save selectedSeats to bookingStore, navigate to /book/payment


SEAT LEGEND ROW
---------------
Displayed above the bus layout, horizontal row:
  [Blue square] Available     [Purple square] Selected     [Gray square] Occupied

SCROLL BEHAVIOR
---------------
The bus layout is placed inside a ScrollView (vertical scroll for tall buses).
The bottom summary bar is outside the ScrollView (position absolute at bottom or
rendered below the ScrollView using flex column layout).


STATE READ (bookingStore)
--------------------------
Field            Used For
---              ---
selectedBus      bus capacity, price per seat, bus ID
selectedAgency   displayed at top of bus layout

STATE WRITTEN (bookingStore)
-----------------------------
Field           Type
---             ---
selectedSeats   string[]   array of seat IDs e.g. ["3A", "3B"]
totalPrice      number     selectedSeats.length × selectedBus.pricePerSeat


NO EXTERNAL PACKAGES REQUIRED
------------------------------
Seat layout is built with React Native View + TouchableOpacity components only.
No third-party seat picker library needed.
