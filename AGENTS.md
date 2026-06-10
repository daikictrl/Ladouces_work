# MOVANA — agent.md

## Project Identity

MOVANA is a modern smart travel companion and reminder management mobile application built with Expo and React Native.

The application combines:

* transport booking simulation,
* digital ticket management,
* seat reservation,
* reminder checklist systems,
* local notifications,
* simulated bus tracking,
* and future Bluetooth hardware integration support.

MOVANA is not a real transport infrastructure platform. All transport systems, payment systems, and tracking systems are simulation-based for educational and demonstration purposes.

The application must feel:

* modern,
* premium,
* intelligent,
* minimalistic,
* organized,
* and user-friendly.

The overall experience should resemble a polished production-grade mobile application.

---

# Core Technical Stack

Frontend:

* Expo
* React Native
* TypeScript
* Expo Router or React Navigation

Backend:

* Supabase

Authentication:

* Clerk

State Management:

* Zustand

Styling:

* NativeWind

Animations:

* Reanimated
* Moti

Notifications:

* Expo Notifications

QR Code:

* react-native-qrcode-svg


# Application Architecture Rules

## 1. Feature-Based Architecture

The application must follow a scalable feature-based architecture.

Avoid:

* giant component files,
* mixed responsibilities,
* deeply nested logic,
* duplicated business logic.

Each feature must remain isolated and maintainable.


# Architectural Principles

## 1. Separation of Concerns

UI components must NOT:

* directly handle business logic,
* directly query databases,
* directly manage complex state.

Business logic belongs in:

* services,
* hooks,
* stores,
* utilities.

---

## 2. Reusable Components

All repeated UI patterns must become reusable components.

Examples:

* buttons,
* cards,
* inputs,
* modals,
* loaders,
* empty states,
* ticket cards,
* trip cards.

Avoid copy-pasting UI code.

---

## 3. Centralized State Management

Use Zustand for:

* authentication state,
* booking state,
* reminder state,
* ticket state,
* notification state,
* UI preferences.

Avoid:

* excessive prop drilling,
* duplicated local states,
* scattered global logic.

---

## 4. Simulation-First Architecture

All booking systems, tracking systems, and payment systems are simulations.

Do NOT:

* implement real financial processing,
* promise live GPS synchronization,
* create fake backend complexity,
* pretend real APIs exist.

The simulation system must still feel realistic and polished.

---

# UI/UX Design Rules

## Design Philosophy

MOVANA must feel:

* light,
* elegant,
* futuristic,
* clean,
* calm,
* and premium.

The UI should prioritize:

* clarity,
* spacing,
* readability,
* and smooth interactions.

---

# Visual Style

Use:

* floating cards,
* rounded corners,
* soft shadows,
* clean layouts,
* minimal clutter,
* smooth animations.

Avoid:

* overcrowded screens,
* harsh shadows,
* inconsistent spacing,
* flashy unnecessary effects.

---

# Primary Colors

Blue:

* primary actions,
* navigation,
* interactive elements.

Purple:

* gradients,
* highlights,
* futuristic accents.

Green:

* confirmations,
* successful actions,
* reminder completion.

White:

* backgrounds,
* clarity,
* spaciousness.

---

# Navigation Rules

The application uses:

* Bottom Tab Navigation.

Main Tabs:

* Home
* Trips
* Reminder
* Devices
* Profile

Use stack navigation inside tabs when necessary.

Hidden screens:

* payment,
* seat selection,
* onboarding,
* authentication,
* ticket details.

Navigation must feel smooth and intuitive.

---

# Performance Rules

The application must:

* avoid unnecessary re-renders,
* lazy load heavy screens,
* memoize expensive components,
* optimize FlatLists,
* minimize animation lag.

Avoid:

* unnecessary global state,
* giant screens,
* oversized components,
* unoptimized maps.

---

# Animation Rules

Animations should be:

* smooth,
* subtle,
* intentional,
* meaningful.

Avoid:

* excessive bouncing,
* distracting motion,
* animation overload.

Good animation areas:

* onboarding,
* ticket reveal,
* payment processing,
* seat selection,
* page transitions,
* reminder completion.

---

# Notification Rules

Notifications are local notifications only.

Use notifications for:

* upcoming trips,
* unchecked reminder items,
* departure alerts,
* travel countdown reminders.

Avoid spam notifications.

Notifications should feel helpful, not annoying.

---

# Booking System Rules

The booking flow must remain simple and realistic.

User flow:

* select departure,
* select destination,
* select agency,
* select date,
* select seat,
* simulate payment,
* generate ticket.

The booking system must:

* validate selected seats,
* prevent duplicate bookings,
* persist booking history,
* generate realistic ticket IDs.

---

# Bus Tracking Rules

Bus tracking is simulated.

The map system must:

* animate movement smoothly,
* show trip progress,
* display estimated arrival,
* simulate realistic travel flow.

Avoid fake random movement.

Movement should follow predefined route coordinates.

---

# Reminder System Rules

The reminder checklist is one of MOVANA’s core differentiators.

The reminder system must:

* persist checklist state,
* support custom items,
* support check/uncheck logic,
* track packing progress,
* integrate with notifications.


# Error Handling Rules

The app must gracefully handle:

* failed simulations,
* missing data,
* loading states,
* network delays,
* invalid form input.

Always provide:

* loading states,
* fallback UI,
* user feedback.

Avoid silent failures.

---

# Code Quality Rules

Code must be:

* modular,
* readable,
* scalable,
* strongly typed,
* reusable.

Avoid:

* hardcoded values,
* deeply nested logic,
* giant files,
* duplicated functions.

Use:

* constants,
* utility helpers,
* typed interfaces,
* reusable hooks.

---

# TypeScript Rules

Use strict typing everywhere.

Avoid:

* any types,
* untyped responses,
* unsafe object structures.

Create dedicated types for:

* bookings,
* reminders,
* tickets,
* agencies,
* trips,
* notifications,
* seats.

---

# Accessibility Rules

The application must support:

* proper touch targets,
* readable font sizes,
* responsive layouts,
* keyboard-safe forms,
* accessible labels.

Avoid:

* tiny clickable areas,
* unreadable text,
* broken layouts on small screens.

---

# Development Philosophy

MOVANA should be developed incrementally.

Priority order:

1. architecture,
2. navigation,
3. authentication,
4. booking flow,
5. ticket system,
6. reminders,
7. notifications,
8. tracking,
9. polish and animations.

Do NOT prematurely optimize.

Focus first on:

* stability,
* clean architecture,
* and complete user flows.

---

# Final Goal

The final MOVANA application should feel like:

* a realistic modern travel companion,
* a premium productivity app,
* and a polished mobile product prototype.

The project should demonstrate:

* strong UI/UX skills,
* clean architecture,
* scalable frontend engineering,
* state management,
* simulation systems,
* and mobile application development expertise.
