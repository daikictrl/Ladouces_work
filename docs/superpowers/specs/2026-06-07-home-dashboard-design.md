# Home Dashboard — Design Spec

## Overview

The Home screen is the first screen users see after authentication. It serves as a central hub showing upcoming trip info, quick actions, packing progress, and recent activity — all in a scrollable card feed layout.

## Layout Architecture

- Top-level: `SafeAreaView` > `ScrollView` with vertical padding
- Each section is a floating white card (`borderRadius: 18-24`, soft shadow, margin between)
- Background: `#f8fafc` (theme background)
- Cards ordered top-to-bottom

## Sections

### 1. Welcome Section

- Greeting: "Welcome to Movana"
- Subtitle: "Ready for your next adventure?"
- Left side: text; right side: MOVANA logo (`assets/images/movana logo.jpeg`)
- Subtle blue→purple gradient background on the card
- Uses `LinearGradient` from `expo-linear-gradient`

### 2. Upcoming Trip Card

- Conditionally rendered — only if `useTicketStore` has upcoming tickets
- Displays: route (from → to), date, departure time, agency name with color dot
- Status badge: "CONFIRMED" in green
- Tapping navigates to trip detail
- Falls back to a "No upcoming trips" empty state if none exist

### 3. Quick Actions

- Horizontal row of 3 action pills
- "Book a Trip" → navigates to Book tab
- "My Tickets" → navigates to Tickets tab
- "Packing List" → navigates to Reminders tab
- Each action has a label and a small icon (from `@expo/vector-icons/Ionicons`)

### 4. Reminder Preview 

- Shows packing progress from a reminder store(Create one if it's not there yet)
- "Packing Progress" header
- Progress bar (green fill)
- "X/Y items packed" text
- Tap navigates to Reminders tab
- If no reminders exist, show a subtle prompt to create one

### 5. Recent Activity / Countdown

- If upcoming trip exists: countdown widget ("Trip in X days · Month Day")
- If no upcoming trip: last past trip summary or "No trips yet" prompt
- Minimal treatment — single line or small card

## States

### Loading
- Skeleton placeholder cards shimmer while Zustand stores hydrate

### Empty (no trips, no reminders)
- Upcoming trip card → "No upcoming trips. Book your first trip!"
- Reminder preview → "No packing list yet. Create one!"
- Both show a muted card with a CTA

### Error
- If store data fails to load, show muted fallback (no crash)

## Component Tree

```
HomeScreen (index.tsx)
├── ScrollView
│   ├── WelcomeCard
│   │   ├── GreetingText
│   │   ├── SubtitleText
│   │   └── LogoImage
│   ├── UpcomingTripCard | EmptyTripState
│   │   ├── RouteText
│   │   ├── DateTimeText
│   │   ├── AgencyBadge
│   │   └── StatusBadge
│   ├── QuickActions
│   │   ├── ActionPill (Book)
│   │   ├── ActionPill (Tickets)
│   │   └── ActionPill (Packing)
│   ├── ReminderPreview | EmptyReminderState
│   │   ├── ProgressHeader
│   │   ├── ProgressBar
│   │   └── ProgressText
│   └── RecentActivity
│       └── CountdownText | LastTripText | EmptyText
```

## Styling

- Colors: primary `#2563eb`, accent `#9333ea`, success `#16a34a`, text `#0f172a`
- Font: Poppins (Regular/Medium/SemiBold/Bold) — loaded via `useFonts` in root layout
- Card style: white background, `borderRadius: 20`, `shadowOpacity: 0.06`, `shadowRadius: 16`, `elevation: 4`
- Padding: 20px horizontal card padding, 16-20px vertical section spacing

## Dependencies

- `react-native-css` (NativeWind v5) for className-based styling
- `expo-image` for the logo
- `expo-linear-gradient` for welcome card gradient
- `@expo/vector-icons/Ionicons` for action icons
- `expo-router` for navigation
- Zustand stores (`useTicketStore`, `useBookingStore`)

## Files to Create/Modify

1. **`app/(tabs)/home/index.tsx`** — main Home screen (replace placeholder)
2. **`components/home/WelcomeCard.tsx`** — welcome section with logo
3. **`components/home/UpcomingTripCard.tsx`** — upcoming trip card
4. **`components/home/QuickActions.tsx`** — quick action pills
5. **`components/home/ReminderPreview.tsx`** — packing progress preview
6. **`components/home/RecentActivity.tsx`** — countdown / recent trip
7. — (stores already exist, no changes needed unless reminder store missing)
