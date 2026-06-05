MOVANA — SIMULATED PAYMENT SCREEN
===================================

OVERVIEW
--------
The payment screen is step 5 in the booking flow. It presents a simulated
payment interface where the user selects a payment method and enters dummy
credentials. No real financial transaction is processed. On confirmation,
the system generates a booking record and a digital ticket, then navigates
to the success screen.


ROUTE
-----
/(tabs)/book/payment
headerShown: false (full-screen layout, custom top area)


SCREEN LAYOUT — TOP TO BOTTOM
-------------------------------
Order   Section                Component
---     ---                    ---
1       Trip summary header    PaymentTripSummary
2       Amount display         PaymentAmountBlock
3       Payment method list    PaymentMethodList
4       Payment detail form    PaymentDetailForm
5       Pay button             PayButton
6       Security note          SecurityNote


SECTION 1 — TRIP SUMMARY HEADER
---------------------------------
Compact card (not full booking card, just key info):
  Route:       Douala → Yaoundé
  Agency:      Vatican Express
  Seats:       3A, 3B
  Date:        Wed, 04 Jun 2025 at 06:00

Data sourced from bookingStore fields.
Background: gradient card from design theme.
Close / back button top-left (navigate back to /book/seats).


SECTION 2 — AMOUNT DISPLAY
----------------------------
Center-aligned:
  Label:   "Total Amount"
  Amount:  "9,000 XAF"  (large, bold, primary color)

Derived from bookingStore.totalPrice, formatted with thousands separator.


SECTION 3 — PAYMENT METHOD LIST
---------------------------------
4 selectable method cards in a 2x2 grid.

Method         Icon Source               Field Required
---            ---                       ---
Mobile Money   custom MTN yellow icon    phone number
Orange Money   custom Orange icon        phone number
Visa           generic card icon         card number + expiry + CVV
PayPal         generic PayPal icon       email address

Icons: use @expo/vector-icons or simple colored initials boxes if SVG unavailable.
Selected card: blue border + checkmark badge.
Only one method selectable at a time.


SECTION 4 — PAYMENT DETAIL FORM
---------------------------------
Form renders conditionally based on selected payment method.

If Mobile Money or Orange Money:
  Field         Placeholder
  ---           ---
  PhoneInput    "Enter phone number (e.g. 6XXXXXXXX)"

If Visa:
  Field            Placeholder
  ---              ---
  CardNumber       "Card number"
  ExpiryDate       "MM/YY"
  CVV              "CVV"
  CardholderName   "Name on card"

If PayPal:
  Field         Placeholder
  ---           ---
  EmailInput    "PayPal email address"

Validation rules:
  Mobile/Orange  phone must be 9 digits, starts with 6, 7
  Visa           card = 16 digits, expiry = valid future date, CVV = 3 digits
  PayPal         valid email format

Validation runs on Pay button press, not on change.


SECTION 5 — PAY BUTTON
------------------------
Label:    "Pay [amount] XAF"
Style:    full width, primary gradient background, rounded 16
Disabled: if no payment method selected OR form is invalid

On press:
  1. Run form validation — show inline field errors if fails
  2. Show loading spinner inside button (isProcessing state)
  3. Simulate network delay with setTimeout 2500ms
  4. Call generateTicket() function (see Ticket Generation below)
  5. Save ticket to AsyncStorage via ticketStore
  6. Navigate to /book/success


SECTION 6 — SECURITY NOTE
---------------------------
Small text at bottom:
  "🔒 This is a simulated payment. No real transaction will be processed."
Font: 11px, muted gray, center-aligned.


TICKET GENERATION FUNCTION
---------------------------
Called after payment simulation succeeds.
Generates an object with the following fields:

Field            Type       Source
---              ---        ---
ticketId         string     "TK-" + 8 random alphanumeric chars
passengerId      string     Clerk user.id
passengerName    string     Clerk user.fullName
from             string     bookingStore.fromCity
to               string     bookingStore.toCity
agencyName       string     bookingStore.selectedAgency.name
departureTime    string     bookingStore.selectedBus.departureTime
arrivalTime      string     bookingStore.selectedBus.arrivalTime
seats            string[]   bookingStore.selectedSeats
totalPaid        number     bookingStore.totalPrice
paymentMethod    string     selected method label
bookedAt         Date       new Date()
status           string     "confirmed"
qrData           string     JSON.stringify({ ticketId, from, to, seats, date })

The generated ticket is saved to ticketStore.addTicket(ticket).
ticketStore persists to AsyncStorage.


STATE READ (bookingStore)
--------------------------
fromCity, toCity, travelDate, selectedAgency, selectedBus,
selectedSeats, totalPrice

STATE WRITTEN (ticketStore)
-----------------------------
addTicket(ticket) — appends to tickets array, persists to AsyncStorage


INSTALL COMMAND
---------------
No new packages needed.
AsyncStorage is already required by Zustand persist (zustand.md spec).
