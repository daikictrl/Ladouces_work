# Remaining MOVANA Specification Documents

## CORE APPLICATION SPECS

### 1. app-navigation.md

Purpose:
Defines the entire application navigation architecture using Expo Router or React Navigation.

Must contain:

* Bottom tab navigation structure
* Stack navigation flow
* Authentication flow
* Protected routes
* Screen hierarchy
* Navigation animations
* Deep linking structure
* Route naming conventions

Bottom Tabs:

* Home
* Trips
* Reminder
* Devices
* Profile

Also define:

* hidden screens,
* modal screens,
* nested navigation stacks.

---

### 2. project-architecture.md

Purpose:
Defines the complete project folder structure and architectural rules.

Must contain:

* src structure
* feature-based architecture
* reusable component strategy
* hooks organization
* services structure
* utils structure
* naming conventions
* import rules
* environment variable handling


### 3. home-dashboard.md

Purpose:
Defines the Home Dashboard screen.

Must contain:

* welcome section
* upcoming trip cards
* reminder preview
* quick actions
* countdown widget
* recent activity
* floating action behavior
* responsive layout rules

---

### 4. transport-booking-system.md

Purpose:
Defines the trip booking flow and transport simulation logic.

Must contain:

* agency listing ()
* route filtering
* departure selection
* destination selection
* travel dates
* trip search logic
* simulated trip generation
* booking workflow
* transport mock data structure

---

### 5. seat-reservation-system.md

Purpose:
Defines the interactive seat selection system.

Must contain:

* bus layout UI
* seat states
* seat selection logic
* occupied seat simulation
* seat validation
* animations
* selected seat persistence
* responsive seat grid behavior

Seat colors:

* blue = available
* purple = selected
* gray = occupied

---

### 6. payment-simulation-system.md

Purpose:
Defines the fake payment workflow.

Must contain:

* payment methods UI
* fake processing states
* loading animations
* success/failure simulation
* receipt generation
* transaction history structure
* payment confirmation flow

Important:
Clearly specify:
NO REAL PAYMENT PROCESSING.

---

### 7. digital-ticket-system.md

Purpose:
Defines QR tickets and ticket management.

Must contain:

* QR generation
* ticket UI layout
* ticket ID generation
* downloadable/shareable ticket logic
* ticket storage
* ticket history
* ticket validation simulation

---

### 8. reminder-checklist-system.md

Purpose:
Defines the smart reminder feature.

Must contain:

* checklist creation
* checklist editing
* packing progress
* checked state persistence
* reminder categories
* smart suggestions
* trip-linked reminders

---

### 9. notification-system.md

Purpose:
Defines local notification behavior.

Must contain:

* Expo notification setup
* scheduled notifications
* trip reminder timing
* reminder alerts
* permission handling
* notification categories
* notification storage logic

Example:

* trip tomorrow
* unpacked items
* departure alerts

---

### 10. bus-tracking-simulation.md

Purpose:
Defines simulated live tracking.

Must contain:

* map integration
* fake GPS movement
* route coordinates
* trip progress animation
* estimated arrival calculations
* route rendering
* simulation intervals
* marker animations

Important:
This is SIMULATION ONLY.

---

### 11. devices-system.md

Purpose:
Defines future hardware connection architecture.

Must contain:

* device connection UI
* BLE preparation architecture
* mock connection states
* battery UI
* sync simulation
* device status cards

Important:
Do NOT implement full BLE logic in V1.

---

### 12. profile-settings-system.md

Purpose:
Defines profile and settings behavior.

Must contain:

* user profile UI
* edit profile flow
* language switching
* dark mode logic
* notification preferences
* logout flow
* travel history
* saved reminders
* connected devices list

---

## STATE MANAGEMENT SPECS

### 13. global-state-architecture.md

Purpose:
Defines all Zustand stores.

Must contain:

* auth store
* booking store
* reminder store
* ticket store
* notification store
* UI store
* persistence rules

Important:
Define:

* what belongs in global state,
* what stays local state.

---

### 14. async-data-flow.md

Purpose:
Defines async handling patterns.

Must contain:

* loading states
* optimistic updates
* retry handling
* error states
* API simulation delays
* mock service architecture

---

## BACKEND & DATABASE SPECS

### 15. supabase-schema.md

Purpose:
Defines complete database structure.

Must contain:

* tables
* relationships
* indexes
* row-level security rules
* booking relationships
* reminder relationships
* ticket relationships

Tables:

* users
* agencies
* trips
* buses
* bookings
* reminders
* notifications

---

### 16. mock-data-system.md

Purpose:
Defines fake simulation data architecture.

Must contain:

* transport agencies
* buses
* seats
* routes
* fake transactions
* tracking coordinates
* fake trip schedules

This is VERY important for realism.

---

## UI/UX SPECS

### 17. reusable-components.md

Purpose:
Defines reusable UI components.

Must contain:

* buttons
* cards
* inputs
* modals
* bottom sheets
* loaders
* empty states
* toast messages
* headers
* section titles

---

### 18. animations-system.md

Purpose:
Defines animation standards.

Must contain:

* screen transitions
* card animations
* onboarding animations
* loading animations
* seat selection animations
* payment animations
* ticket reveal animations

Recommended:

* Reanimated
* Moti

---

### 19. typography-spacing-system.md

Purpose:
Defines:

* typography scale
* spacing system
* padding rules
* margin consistency
* icon sizing
* card radius
* shadow rules

This prevents inconsistent UI.

---

### 20. accessibility-responsiveness.md

Purpose:
Defines:

* responsive behavior
* small-screen handling
* keyboard avoidance
* touch target sizes
* accessibility labels
* font scaling

---

## DEVELOPMENT SPECS

### 21. api-services-layer.md

Purpose:
Defines service abstraction layer.

Must contain:

* Supabase service functions
* mock service functions
* separation of UI and logic
* reusable request patterns

---

### 22. environment-config.md

Purpose:
Defines:

* environment variables
* API keys
* Supabase keys
* Clerk keys
* development/production configs

---

### 23. error-handling-system.md

Purpose:
Defines:

* app-wide error handling
* fallback states
* network simulation errors
* retry UI
* empty states

---

### 24. testing-strategy.md

Purpose:
Defines:

* component testing
* flow testing
* booking testing
* reminder testing
* notification testing
* simulation testing

---

### 25. deployment-build-system.md

Purpose:
Defines:

* Expo build setup
* Android build process
* APK generation
* EAS build configuration
* app icon setup
* splash screen setup
* production checklist

---

# Suggested Development Order

1. Design Theme
2. Typography & Components
3. Navigation
4. Authentication
5. Home Dashboard
6. Booking System
7. Seat Reservation
8. Payment Simulation
9. Ticket System
10. Reminder System
11. Notifications
12. Tracking Simulation
13. Profile & Settings
14. Device System
15. Final Polish & Animations

This order prevents architectural chaos later.
