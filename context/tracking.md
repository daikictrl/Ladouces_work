MOVANA — SIMULATED BUS TRACKING SCREEN
========================================

OVERVIEW
--------
The tracking screen shows simulated live movement of the user's bus on a map
between two cities. It uses a pre-defined coordinate path interpolated over
time to simulate the bus moving. No real GPS data from any transport company
is used. The feature is clearly labeled as a simulation inside the UI.


ROUTE
-----
/(tabs)/home/trip-detail/[id]

This screen is also reachable via:
  "Track Bus" button on home screen UpcomingTripCard
  "Track Bus" button on ticket detail screen


HEADER
------
Title: "Live Tracking" (with a small "(Simulated)" badge in muted color next to it)
Back button: returns to previous screen


SCREEN LAYOUT — TOP TO BOTTOM
-------------------------------
Order   Section                    Component
---     ---                        ---
1       Trip summary bar           TrackingTripBar
2       Map view                   TrackingMapView
3       ETA and status card        TrackingStatusCard
4       Progress timeline          TrackingTimeline


SECTION 1 — TRIP SUMMARY BAR
------------------------------
Compact horizontal bar above the map:
  Agency name + logo placeholder | Route text (Douala → Yaoundé) | Departure time

Background: primary blue, text white
Height: 52, no border radius (full width)


SECTION 2 — MAP VIEW
----------------------
Height: 55% of screen

Library: react-native-maps (MapView component)

Map config:
  Provider:         PROVIDER_GOOGLE on Android, default on iOS
  mapType:          "standard"
  showsUserLocation: false (we are not tracking user, we are tracking bus)
  scrollEnabled:    true
  zoomEnabled:      true
  Initial region:   centered between fromCity and toCity coordinates

MAP ELEMENTS:

  Polyline — full route path
    coordinates:    full list of waypoints for this route
    strokeColor:    primary blue
    strokeWidth:    4
    lineDashPattern: none (solid)

  Bus Marker — current simulated position
    Image or emoji: use a bus emoji or custom SVG bus icon
    Coordinate:     updates every 3 seconds (via simulation interval)
    Rotation:       angle toward next waypoint (calculated from coordinate delta)

  Origin Marker — departure city
    Pin color:      green
    Title:          fromCity name

  Destination Marker — destination city
    Pin color:      red
    Title:          toCity name

CAMERA BEHAVIOR
---------------
On mount: fit map to show full route (fitToCoordinates with edge padding 40)
While bus moves: do NOT auto-scroll map (user controls view)
"Center on Bus" button (floating bottom-right of map):
  On press: animateToRegion to current bus position, zoom level delta 0.5


SECTION 3 — ETA AND STATUS CARD
---------------------------------
Card below the map.

Fields:
  Label            Value
  ---              ---
  Status           "In Transit" (animated green dot)
  Departed         "06:00 from Douala"
  ETA              "Arriving at ~10:30"  (updates based on simulated progress)
  Distance left    "~240 km remaining" (decreases as bus moves)

"In Transit" animated dot: small green circle with pulsing opacity animation (loop)


SECTION 4 — PROGRESS TIMELINE
-------------------------------
Horizontal step indicator showing route waypoints as stops.

Cities shown: Departure → [1–2 intermediate cities] → Destination
Current progress shown by filled vs unfilled nodes.
Bus has "passed" a node when its simulated position passes that waypoint.

Example for Douala → Yaoundé:
  Douala (filled) → Edea (filled if passed) → Yaoundé (unfilled until arrived)


SIMULATION ENGINE
-----------------
The bus position is simulated using a coordinate interpolation approach.

City coordinate constants (hardcoded, approximate):
  City         Latitude    Longitude
  ---          ---         ---
  Douala       3.8480      11.5021
  Yaoundé      3.8667      11.5167
  Bafoussam    5.4781      10.4178
  Bamenda      5.9597      10.1456
  Buea         4.1547      9.2410
  Ngaoundéré   7.3236      13.5832
  Garoua       9.2989      13.3989
  Ebolowa      2.9012      11.1505
  Bertoua      4.5773      13.6844

Route waypoints: for each city-pair, define an array of 12–20 intermediate
lat/lng coordinates simulating the road path.
These are stored in constants/routes.ts as:
  routeWaypoints: Record<"CityA-CityB", LatLng[]>

Simulation state (component-level, not Zustand):
  currentWaypointIndex   number
  busPosition            LatLng

Simulation interval (setInterval, 3000ms):
  Each tick:
    1. Increment currentWaypointIndex by 1
    2. Update busPosition to waypoints[currentWaypointIndex]
    3. Recalculate remaining distance and ETA
    4. Update component state

On arrival (index === waypoints.length - 1):
  Stop interval
  Show "Arrived at Destination" banner
  Change status to "Arrived"
  Show confetti or subtle animation

On unmount: clearInterval to avoid memory leak


SIMULATION NOTE DISCLAIMER
---------------------------
A banner is shown at the top of the map (absolute position, bottom of map area):
  Text: "Simulation mode — not real-time GPS data"
  Background: semi-transparent dark, white text, border radius 8
  Auto-dismiss: does not auto-dismiss (always visible to maintain honesty)


STATE READ
----------
bookingStore: selectedBus, selectedAgency, fromCity, toCity, travelDate
ticketStore: getTicketById(id) — for reaching this screen from ticket detail


INSTALL COMMAND
---------------
npx expo install react-native-maps
npx expo install react-native-reanimated
(reanimated needed for the pulsing "In Transit" dot animation)
