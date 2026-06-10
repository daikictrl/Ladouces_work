MOVANA — NAVIGATION STRUCTURE
==============================

OVERVIEW
--------
Defines the full navigation architecture for MOVANA using Expo Router with a
bottom tab layout. All major sections of the app live in dedicated tabs. Each
tab owns its own stack for nested screen navigation. Auth screens are isolated
in a separate route group with a redirect guard at the root layout level.


TECHNOLOGY
----------
Package                           Notes
---                               ---
expo-router                       v4.x — file-based routing
@expo/vector-icons (Ionicons)     tab bar and in-screen icons
react-native-safe-area-context    insets for tab bar and headers
react-native-screens              native screen optimization


BOTTOM TAB STRUCTURE
--------------------
Tab Index   Label        Icon (Ionicons)             Root Screen
---         ---          ---                         ---
0           Home         home-outline                /(tabs)/home/index
1           Book         bus-outline                 /(tabs)/book/index
2           Tickets      ticket-outline              /(tabs)/tickets/index
3           Reminders    checkmark-circle-outline    /(tabs)/reminders/index
4           Profile      person-outline              /(tabs)/profile/index


FILE / FOLDER STRUCTURE
-----------------------
app/
  _layout.tsx                         root layout — fonts, splash, auth guard
  +not-found.tsx                      fallback 404 screen

  (auth)/
    _layout.tsx                       no tab bar, no header
    login.tsx
    register.tsx
    forgot-password.tsx

  (tabs)/
    _layout.tsx                       bottom tab navigator definition

    home/
      _layout.tsx                     stack for home tab
      index.tsx                       dashboard screen
      trip-detail/
        [id].tsx                      upcoming trip detail + tracking entry

    book/
      _layout.tsx                     stack for booking tab
      index.tsx                       step 1 — route and date selection
      agency.tsx                      step 2 — choose transport agency
      bus.tsx                         step 3 — choose bus schedule
      seats.tsx                       step 4 — interactive seat selection
      payment.tsx                     step 5 — simulated payment
      success.tsx                     booking confirmed screen

    tickets/
      _layout.tsx
      index.tsx                       all tickets list
      [id].tsx                        single ticket detail with QR code

    reminders/
      _layout.tsx
      index.tsx                       all checklists list
      [id].tsx                        checklist detail / edit
      new.tsx                         create new checklist

    profile/
      _layout.tsx
      index.tsx                       user profile dashboard
      settings.tsx                    app settings (theme, language)
      history.tsx                     travel history
      devices.tsx                     connected devices


TAB BAR STYLE
-------------
Property              Value
---                   ---
backgroundColor       white in light mode, dark card color in dark mode
activeTintColor       primary blue from design theme
inactiveTintColor     muted gray from design theme
tabBarStyle height    65
borderTopWidth        0
elevation / shadow    soft shadow from design theme
labelStyle fontSize   11
labelStyle fontFamily theme regular font


SCREEN HEADER DEFAULTS
-----------------------
Property                  Value
---                       ---
headerTitleStyle          theme bold font, size 17
headerBackground          white / dark background from theme
headerShadowVisible       false
headerBackTitle           empty string (hide back label on iOS)

Screens with headerShown false:
  payment.tsx, success.tsx (full-screen modal feel)


ROOT LAYOUT AUTH GUARD
-----------------------
app/_layout.tsx on mount:
  1. Load fonts via expo-font
  2. Check Clerk auth state (useAuth hook)
  3. If not signed in    → redirect to /(auth)/login
  4. If signed in        → redirect to /(tabs)/home
  5. Render SplashScreen until fonts + auth check complete


INSTALL COMMAND
---------------
npx expo install expo-router react-native-safe-area-context react-native-screens \
  expo-linking expo-constants expo-status-bar @expo/vector-icons
