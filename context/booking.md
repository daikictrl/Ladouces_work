MOVANA — TRANSPORT BOOKING FLOW
================================

OVERVIEW
--------
The booking flow is a 4-step wizard that lets the user select a route and date,
choose a transport agency, choose a bus departure time, and then proceed to seat
selection. Each step is a separate screen inside the /(tabs)/book stack. A
persistent step indicator at the top of each screen shows progress.


ROUTES
------
Step   Route                   Screen Purpose
---    ---                     ---
1      /(tabs)/book/index      Select cities and travel date
2      /(tabs)/book/agency     Select transport agency
3      /(tabs)/book/bus        Select bus departure schedule
4      /(tabs)/book/seats      Seat selection (see separate spec)
5      /(tabs)/book/payment    Payment (see separate spec)
6      /(tabs)/book/success    Booking confirmed


STEP INDICATOR COMPONENT
------------------------
Shared component rendered at the top of steps 1–5.
Shows 4 numbered circles connected by lines.
Active step:    filled primary blue circle, white number
Completed step: filled blue with checkmark icon
Upcoming step:  gray outline circle

Component name: BookingStepIndicator
Props:          currentStep (1–4)


===========================
STEP 1 — ROUTE AND DATE
===========================

Route: /(tabs)/book/index
Header title: "Book a Trip"

UI FIELDS
---------
Field             Type              Placeholder / Label
---               ---               ---
Departure City    CityPickerModal   "From — Select city"
Destination City  CityPickerModal   "To — Select city"
Travel Date       DatePickerModal   "Select travel date"
Swap button       IconButton        swap departure and destination (arrows-exchange icon)

CITY PICKER MODAL
-----------------
Opens a bottom sheet modal with a searchable list of cities.

Available cities (hardcoded):
  Douala, Yaoundé, Bafoussam, Bamenda, Buea, Ngaoundéré, Garoua, Maroua, Bertoua, Ebolowa

Search input at top filters the list in real time.
Tap a city → closes modal, populates the corresponding field.

DATE PICKER
-----------
Use @react-native-community/datetimepicker wrapped in a custom modal.
Minimum date: today
Maximum date: 6 months from today
Format displayed: "Wed, 04 Jun 2025"

VALIDATION
----------
Rule                                  Error message
---                                   ---
Departure city is empty               "Please select a departure city"
Destination city is empty             "Please select a destination city"
Departure === Destination             "Departure and destination cannot be the same"
No date selected                      "Please select a travel date"

CONTINUE BUTTON
---------------
Label: "Search Buses"
Disabled (grayed) until all 3 fields are filled and validation passes.
On press: saves { from, to, date } to bookingStore, navigates to /book/agency.


===========================
STEP 2 — SELECT AGENCY
===========================

Route: /(tabs)/book/agency
Header title: "Choose Agency"

DATA — TRANSPORT AGENCIES
--------------------------
Agency Name          Logo Placeholder    Note
---                  ---                 ---
General Express      initials "GE"       common Cameroon intercity operator
Finexs               initials "FX"       operates Douala–Yaoundé primarily
Vatican Express      initials "VE"       premium service
Touristique Express  initials "TE"       budget option
Buca Voyages         initials "BV"       regional routes

Agencies are hardcoded array in a constants file: constants/agencies.ts

Each agency card shows:
  Logo placeholder (colored circle with initials)
  Agency name (bold)
  Route served: "Douala → Yaoundé" (from bookingStore)
  Starting price: "From 3,500 XAF"
  Rating stars: static value per agency

SELECTION BEHAVIOR
------------------
Tap a card → card shows selected state (blue border + checkmark badge).
Only one agency can be selected at a time.

CONTINUE BUTTON
---------------
Label: "Continue"
Disabled until an agency is selected.
On press: saves selectedAgency to bookingStore, navigates to /book/bus.


===========================
STEP 3 — SELECT BUS
===========================

Route: /(tabs)/book/bus
Header title: "Select Departure"

SCHEDULE CARDS
--------------
Each card represents one bus departure. Data is hardcoded / simulated.
6–8 cards shown per agency per route.

Card fields:
Field                Value Example
---                  ---
Departure time       06:00
Arrival time (est.)  10:30
Duration             ~4h 30min
Seats available      12 seats left
Price                4,500 XAF
Bus class            Standard / Express / VIP

FILTER ROW
----------
Horizontal chip row above the list:
  "All"  |  "Morning"  |  "Afternoon"  |  "Evening"
Tapping a chip filters cards by time of day:
  Morning     06:00–11:59
  Afternoon   12:00–17:59
  Evening     18:00+

SELECTION BEHAVIOR
------------------
Tap a card → selected state (blue border, filled checkmark top-right corner).
Only one bus selectable at a time.
Cards with 0 seats show "Full" badge and are non-selectable (grayed).

CONTINUE BUTTON
---------------
Label: "Choose Seats"
Disabled until a bus is selected.
On press: saves selectedBus to bookingStore, navigates to /book/seats.


STATE MANAGED (Zustand — bookingStore)
--------------------------------------
Field              Type       Set At Step
---                ---        ---
fromCity           string     1
toCity             string     1
travelDate         Date       1
selectedAgency     object     2
selectedBus        object     3
selectedSeats      array      4 (seat selection spec)
paymentMethod      string     5 (payment spec)


INSTALL COMMANDS
----------------
npx expo install @react-native-community/datetimepicker
