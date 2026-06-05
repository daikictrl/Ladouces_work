MOVANA — DEVICE CONNECTION SYSTEM
===================================

OVERVIEW
--------
The devices section simulates Bluetooth device discovery and pairing for a
future smart reminder hardware feature. No real Bluetooth communication occurs
at this stage. The screen is a forward-looking UI scaffold showing the concept
of a physical smart reminder device that would integrate with MOVANA.

This screen is explicitly marked as a "coming soon" feature in the UI.
Users can explore and simulate the interface but no actual BLE operations run.


ROUTE
-----
/(tabs)/profile/devices

HEADER
------
Title: "Connected Devices"
Sub-header badge: "Future Feature — Simulation Mode"  (blue pill badge below title)


SCREEN LAYOUT — TOP TO BOTTOM
-------------------------------
Order   Section                    Component
---     ---                        ---
1       Feature explanation card   DevicesExplainerCard
2       Scan button + status       ScanControlRow
3       Discovered devices list    DiscoveredDevicesList
4       Paired devices list        PairedDevicesList


SECTION 1 — FEATURE EXPLANATION CARD
--------------------------------------
Card content:
  Icon:  bluetooth-outline, large, primary blue
  Title: "Smart Reminder Devices"
  Body:  "MOVANA is designed to work with future smart reminder hardware.
          These devices will notify you about unpacked items and upcoming
          departures via physical alerts. This feature is in simulation mode."
  Badge: "Coming Soon" — orange badge, top right of card

Card style: white / dark card, border radius 18, soft shadow, padding 20


SECTION 2 — SCAN CONTROL ROW
------------------------------
Row layout:
  Left:  status text — "Ready to scan" | "Scanning..." | "Scan complete"
  Right: "Scan for Devices" button — primary blue, rounded 12, small

Button states:
  Default:    "Scan for Devices" — active, blue
  Scanning:   "Scanning..." — grayed, shows spinner inside button, disabled
  Cooldown:   "Scan Again (5s)" — countdown, disabled until 5-second cooldown passes

On scan button press:
  1. Set state: isScanning = true
  2. Show animated scanning indicator (pulsing Bluetooth icon centered on screen)
  3. After 3000ms setTimeout:
       - isScanning = false
       - Append 1–3 randomly named simulated devices to discoveredDevices list
       - Show toast: "Found X device(s)"
  4. Start 5-second cooldown before scan button re-enables

SIMULATED DEVICE NAMES POOL
----------------------------
Randomly select from this list on each scan:
  "MOVANA RemindTag A1"
  "MOVANA RemindTag B3"
  "SmartPack Mini 01"
  "TravelAlert Band 2X"
  "MOVANA Beacon 007"

Each discovered device gets:
  id:       random UUID
  name:     from pool above
  signal:   "Strong" | "Medium" | "Weak" (random)
  status:   "discovered"


SECTION 3 — DISCOVERED DEVICES LIST
--------------------------------------
Title: "Nearby Devices"  (only shown when discoveredDevices.length > 0)

Each device card row:
  Left icon:   phone-portrait-outline or radio-outline, muted
  Name:        device.name, 15px medium
  Signal:      "Signal: Strong" — 12px muted
  Right:       "Pair" button — small outline blue button

On "Pair" press:
  1. Show "Pairing..." spinner on the button
  2. After 1500ms setTimeout:
       - Move device from discoveredDevices to pairedDevices
       - status = "paired"
       - Show toast: "Paired with [device name]"

Empty state (no devices found yet, after a scan returned nothing):
  Text: "No devices found. Try scanning again."


SECTION 4 — PAIRED DEVICES LIST
---------------------------------
Title: "Paired Devices"  (only shown when pairedDevices.length > 0)

Each paired device row:
  Left icon:   checkmark-circle, green
  Name:        device.name, 15px medium
  Status:      "Connected" with green dot | "Disconnected" with gray dot
  Right:       "Disconnect" text button — small, red text

On "Disconnect" press:
  Show alert: "Disconnect [device name]?" with Cancel + Disconnect options
  On confirm: remove from pairedDevices list, show toast "Disconnected"

No paired devices yet (initial state or all disconnected):
  Text: "No paired devices. Scan to find nearby devices."
  Display under section title only if section title is visible.


SCANNING ANIMATION OVERLAY
---------------------------
During isScanning state, show an animated overlay inside the scan area:
  Centered Bluetooth icon (large, primary blue)
  3 concentric expanding rings (opacity fade animation, repeat)
  This is a purely CSS/Animated API effect — no BLE library needed

Implementation: use React Native Animated API with looping opacity + scale
animations on 3 View circles staggered by 500ms each.


STATE (component-level only — not persisted to Zustand)
---------------------------------------------------------
Field              Type             Description
---                ---              ---
isScanning         boolean          true during simulated scan
discoveredDevices  DeviceItem[]     list from current scan session
pairedDevices      DeviceItem[]     persisted within session only

DeviceItem type:
  id       string
  name     string
  signal   "Strong" | "Medium" | "Weak"
  status   "discovered" | "paired"

Note: paired devices are NOT persisted to AsyncStorage at this stage
(feature is simulation-only). State resets on unmount.


NO REAL BLUETOOTH
-----------------
Do NOT install expo-bluetooth or react-native-ble-plx.
All BLE behavior is faked with timeouts and pre-defined data.
If the AI builder attempts to add a real BLE library, stop and use
setTimeout-based simulation instead.


NO INSTALL COMMANDS REQUIRED
-----------------------------
This screen uses only React Native core (Animated, View, Text, TouchableOpacity)
and @expo/vector-icons. No additional packages needed.
