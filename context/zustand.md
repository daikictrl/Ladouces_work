MOVANA — ZUSTAND STATE MANAGEMENT
====================================

OVERVIEW
--------
This spec defines every Zustand store used in MOVANA, their full TypeScript
type shapes, all actions, persistence rules, and correct usage patterns in
components.

MOVANA uses 5 stores total:

  Store               Persisted   Purpose
  ---                 ---         ---
  bookingStore        NO          booking wizard flow state (ephemeral)
  ticketStore         YES         confirmed digital tickets
  reminderStore       YES         packing checklists
  settingsStore       YES         theme, language, notification preferences
  notificationStore   YES         scheduled Expo notification IDs

IMPORTANT — NO authStore:
  User identity (name, email, photo) comes directly from Clerk via the
  useUser() hook. Do NOT create a Zustand store for auth state. Zustand does
  not own anything Clerk already owns.

  Correct usage in components:
    import { useUser } from "@clerk/clerk-expo"
    const { user } = useUser()
    user.firstName, user.fullName, user.imageUrl


INSTALL
-------
`npx expo install zustand @react-native-async-storage/async-storage`


FOLDER STRUCTURE
----------------
store/
  bookingStore.ts
  ticketStore.ts
  reminderStore.ts
  settingsStore.ts
  notificationStore.ts
  types.ts              shared TypeScript types used across all stores


========================================
SHARED TYPES  (store/types.ts)
========================================

All types used across stores are defined in one file and imported into each
store file. The AI builder must create this file first before any store file.

--- types.ts contents ---

export type Agency = {
  id:          string
  name:        string
  initials:    string
  color:       string
}

export type BusSchedule = {
  id:           string
  agencyId:     string
  departureTime: string
  arrivalTime:   string
  duration:      string
  pricePerSeat:  number
  seatsAvailable: number
  busClass:      "Standard" | "Express" | "VIP"
}

export type Ticket = {
  ticketId:       string
  passengerId:    string
  passengerName:  string
  from:           string
  to:             string
  agencyName:     string
  agencyInitials: string
  agencyColor:    string
  departureTime:  string
  arrivalTime:    string
  travelDate:     string       // ISO date string "YYYY-MM-DD"
  seats:          string[]
  totalPaid:      number
  paymentMethod:  string
  bookedAt:       string       // ISO datetime string
  status:         "confirmed" | "past"
  qrData:         string
  busClass:       "Standard" | "Express" | "VIP"
}

export type ChecklistItem = {
  id:       string
  label:    string
  isPacked: boolean
}

export type Checklist = {
  id:             string
  title:          string
  linkedTicketId: string | null
  createdAt:      string       // ISO datetime string
  items:          ChecklistItem[]
}


========================================
STORE 1 — bookingStore  (store/bookingStore.ts)
========================================

PURPOSE
-------
Holds the state for the active booking wizard session.
NOT persisted — state lives only for the current session.
After a booking is confirmed (success screen mounts), resetBooking() is called
and all fields return to their default empty values.

STATE SHAPE
-----------
Field             Type                Default     Set at step
---               ---                 ---         ---
fromCity          string              ""          Step 1
toCity            string              ""          Step 1
travelDate        string              ""          Step 1  (ISO date "YYYY-MM-DD")
selectedAgency    Agency | null       null        Step 2
selectedBus       BusSchedule | null  null        Step 3
selectedSeats     string[]            []          Step 4
totalPrice        number              0           Step 4 (seats × pricePerSeat)
paymentMethod     string              ""          Step 5

ACTIONS
-------
Action                                        Effect
---                                           ---
setFromCity(city: string)                     set fromCity
setToCity(city: string)                       set toCity
setTravelDate(date: string)                   set travelDate
setSelectedAgency(agency: Agency)             set selectedAgency
setSelectedBus(bus: BusSchedule)              set selectedBus
setSelectedSeats(seats: string[])             set selectedSeats
setTotalPrice(price: number)                  set totalPrice
setPaymentMethod(method: string)              set paymentMethod
resetBooking()                                reset ALL fields to defaults

FULL STORE CODE
---------------

import { create } from "zustand"
import { Agency, BusSchedule } from "./types"

type BookingState = {
  fromCity:        string
  toCity:          string
  travelDate:      string
  selectedAgency:  Agency | null
  selectedBus:     BusSchedule | null
  selectedSeats:   string[]
  totalPrice:      number
  paymentMethod:   string
  setFromCity:     (city: string) => void
  setToCity:       (city: string) => void
  setTravelDate:   (date: string) => void
  setSelectedAgency: (agency: Agency) => void
  setSelectedBus:  (bus: BusSchedule) => void
  setSelectedSeats: (seats: string[]) => void
  setTotalPrice:   (price: number) => void
  setPaymentMethod: (method: string) => void
  resetBooking:    () => void
}

const defaultState = {
  fromCity:       "",
  toCity:         "",
  travelDate:     "",
  selectedAgency: null,
  selectedBus:    null,
  selectedSeats:  [],
  totalPrice:     0,
  paymentMethod:  "",
}

export const useBookingStore = create<BookingState>((set) => ({
  ...defaultState,
  setFromCity:       (city)    => set({ fromCity: city }),
  setToCity:         (city)    => set({ toCity: city }),
  setTravelDate:     (date)    => set({ travelDate: date }),
  setSelectedAgency: (agency)  => set({ selectedAgency: agency }),
  setSelectedBus:    (bus)     => set({ selectedBus: bus }),
  setSelectedSeats:  (seats)   => set({ selectedSeats: seats }),
  setTotalPrice:     (price)   => set({ totalPrice: price }),
  setPaymentMethod:  (method)  => set({ paymentMethod: method }),
  resetBooking:      ()        => set(defaultState),
}))


========================================
STORE 2 — ticketStore  (store/ticketStore.ts)
========================================

PURPOSE
-------
Stores all confirmed digital tickets. Persisted to AsyncStorage so tickets
survive app restarts. Exposes computed getters for the home screen and
tracking screen.

NOTE ON home.md CORRECTION:
  home.md incorrectly listed "upcomingTrip" and "recentTickets" as fields in
  bookingStore. They are NOT stored there. They are COMPUTED from ticketStore
  using the getters below. The home screen should import useTicketStore, not
  useBookingStore, for those values.

STATE SHAPE
-----------
Field      Type        Default     Notes
---        ---         ---         ---
tickets    Ticket[]    []          all confirmed tickets

COMPUTED GETTERS (not stored state — call inside components)
------------------------------------------------------------
Getter                          Returns
---                             ---
getUpcomingTickets()            tickets where travelDate >= today, sorted soonest first
getPastTickets()                tickets where travelDate < today, sorted most-recent first
getTicketById(id)               single Ticket | undefined
getUpcomingTrip()               the soonest upcoming ticket | null  (used by home screen)
getRecentTickets(limit)         last N tickets sorted by bookedAt desc (used by home screen)

These are plain functions inside the store, not computed properties.
Components call them like: useTicketStore.getState().getUpcomingTrip()
Or define them as actions that return values (see full code below).

ACTIONS
-------
Action                    Effect
---                       ---
addTicket(ticket)         append to tickets array, persist
deleteTicket(ticketId)    remove from tickets array, persist

PERSISTENCE
-----------
Uses Zustand persist middleware.
Storage key: "movana-tickets"
Storage engine: AsyncStorage from @react-native-async-storage/async-storage
Partialize: persist only the tickets array (not actions)

FULL STORE CODE
---------------

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ticket } from "./types"

type TicketState = {
  tickets:           Ticket[]
  addTicket:         (ticket: Ticket) => void
  deleteTicket:      (ticketId: string) => void
  getTicketById:     (ticketId: string) => Ticket | undefined
  getUpcomingTickets: () => Ticket[]
  getPastTickets:    () => Ticket[]
  getUpcomingTrip:   () => Ticket | null
  getRecentTickets:  (limit: number) => Ticket[]
}

export const useTicketStore = create<TicketState>()(
  persist(
    (set, get) => ({
      tickets: [],

      addTicket: (ticket) =>
        set((state) => ({ tickets: [...state.tickets, ticket] })),

      deleteTicket: (ticketId) =>
        set((state) => ({
          tickets: state.tickets.filter((t) => t.ticketId !== ticketId),
        })),

      getTicketById: (ticketId) =>
        get().tickets.find((t) => t.ticketId === ticketId),

      getUpcomingTickets: () => {
        const today = new Date().toISOString().split("T")[0]
        return get()
          .tickets.filter((t) => t.travelDate >= today)
          .sort((a, b) => a.travelDate.localeCompare(b.travelDate))
      },

      getPastTickets: () => {
        const today = new Date().toISOString().split("T")[0]
        return get()
          .tickets.filter((t) => t.travelDate < today)
          .sort((a, b) => b.bookedAt.localeCompare(a.bookedAt))
      },

      getUpcomingTrip: () => {
        const upcoming = get().getUpcomingTickets()
        return upcoming.length > 0 ? upcoming[0] : null
      },

      getRecentTickets: (limit) =>
        [...get().tickets]
          .sort((a, b) => b.bookedAt.localeCompare(a.bookedAt))
          .slice(0, limit),
    }),
    {
      name:    "movana-tickets",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ tickets: state.tickets }),
    }
  )
)


========================================
STORE 3 — reminderStore  (store/reminderStore.ts)
========================================

PURPOSE
-------
Stores all packing checklists. Persisted to AsyncStorage. Exposes item-level
mutation actions so components never manipulate nested arrays directly.

NOTE ON home.md CORRECTION:
  "packedCount" and "totalCount" are NOT stored fields in reminderStore.
  They are computed per checklist inside the component from the checklist's
  items array:
    const packed = checklist.items.filter(i => i.isPacked).length
    const total  = checklist.items.length
  Do NOT add packedCount or totalCount as store fields.

STATE SHAPE
-----------
Field        Type          Default     Notes
---          ---           ---         ---
checklists   Checklist[]   []          all checklists

ACTIONS
-------
Action                                         Effect
---                                            ---
addChecklist(list: Checklist)                  append to checklists, persist
deleteChecklist(checklistId: string)           remove by id, persist
updateChecklistTitle(id, title)                update checklist title, persist
addItem(checklistId, label)                    append new ChecklistItem, persist
toggleItem(checklistId, itemId)                flip isPacked boolean, persist
editItem(checklistId, itemId, label)           update item label text, persist
deleteItem(checklistId, itemId)                remove item from list, persist
reorderItems(checklistId, newItems)            replace items array (drag reorder), persist
getChecklistById(id)                           returns Checklist | undefined
getActiveChecklist(upcomingTicketId)           returns checklist linked to given ticketId | null

PERSISTENCE
-----------
Storage key:    "movana-reminders"
Storage engine: AsyncStorage
Partialize:     checklists array only

FULL STORE CODE
---------------

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Checklist, ChecklistItem } from "./types"
import "react-native-get-random-values"
import { v4 as uuidv4 } from "uuid"

type ReminderState = {
  checklists:           Checklist[]
  addChecklist:         (list: Checklist) => void
  deleteChecklist:      (checklistId: string) => void
  updateChecklistTitle: (checklistId: string, title: string) => void
  addItem:              (checklistId: string, label: string) => void
  toggleItem:           (checklistId: string, itemId: string) => void
  editItem:             (checklistId: string, itemId: string, label: string) => void
  deleteItem:           (checklistId: string, itemId: string) => void
  reorderItems:         (checklistId: string, newItems: ChecklistItem[]) => void
  getChecklistById:     (checklistId: string) => Checklist | undefined
  getActiveChecklist:   (upcomingTicketId: string | null) => Checklist | null
}

const updateChecklist = (
  state: ReminderState,
  checklistId: string,
  updater: (c: Checklist) => Checklist
) => ({
  checklists: state.checklists.map((c) =>
    c.id === checklistId ? updater(c) : c
  ),
})

export const useReminderStore = create<ReminderState>()(
  persist(
    (set, get) => ({
      checklists: [],

      addChecklist: (list) =>
        set((state) => ({ checklists: [...state.checklists, list] })),

      deleteChecklist: (checklistId) =>
        set((state) => ({
          checklists: state.checklists.filter((c) => c.id !== checklistId),
        })),

      updateChecklistTitle: (checklistId, title) =>
        set((state) => updateChecklist(state, checklistId, (c) => ({ ...c, title }))),

      addItem: (checklistId, label) =>
        set((state) =>
          updateChecklist(state, checklistId, (c) => ({
            ...c,
            items: [...c.items, { id: uuidv4(), label, isPacked: false }],
          }))
        ),

      toggleItem: (checklistId, itemId) =>
        set((state) =>
          updateChecklist(state, checklistId, (c) => ({
            ...c,
            items: c.items.map((i) =>
              i.id === itemId ? { ...i, isPacked: !i.isPacked } : i
            ),
          }))
        ),

      editItem: (checklistId, itemId, label) =>
        set((state) =>
          updateChecklist(state, checklistId, (c) => ({
            ...c,
            items: c.items.map((i) =>
              i.id === itemId ? { ...i, label } : i
            ),
          }))
        ),

      deleteItem: (checklistId, itemId) =>
        set((state) =>
          updateChecklist(state, checklistId, (c) => ({
            ...c,
            items: c.items.filter((i) => i.id !== itemId),
          }))
        ),

      reorderItems: (checklistId, newItems) =>
        set((state) =>
          updateChecklist(state, checklistId, (c) => ({ ...c, items: newItems }))
        ),

      getChecklistById: (checklistId) =>
        get().checklists.find((c) => c.id === checklistId),

      getActiveChecklist: (upcomingTicketId) => {
        if (!upcomingTicketId) return null
        return (
          get().checklists.find((c) => c.linkedTicketId === upcomingTicketId) ?? null
        )
      },
    }),
    {
      name:    "movana-reminders",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ checklists: state.checklists }),
    }
  )
)

NOTE ON uuid
------------
react-native-get-random-values must be imported ONCE at the very top of
app/_layout.tsx (before any other import) for uuid to work in React Native.
Install: npx expo install react-native-get-random-values uuid
Add to app/_layout.tsx line 1: import "react-native-get-random-values"


========================================
STORE 4 — settingsStore  (store/settingsStore.ts)
========================================

PURPOSE
-------
Stores user preferences that persist across sessions: theme, language, and
notification toggles. The root layout reads settingsStore.theme to apply the
correct design token set across the entire app.

STATE SHAPE
-----------
Field          Type                              Default     Notes
---            ---                               ---         ---
theme          "light" | "dark" | "system"       "system"    controls app color scheme
language       "en" | "fr"                       "en"        controls string constants
notifTrips     boolean                           true        trip reminders enabled
notifPacking   boolean                           true        checklist reminders enabled
leadTime       "1day" | "3hours" | "both"        "both"      how early to notify

ACTIONS
-------
Action                                  Effect
---                                     ---
setTheme(theme)                         update theme, persist
setLanguage(language)                   update language, persist
setNotifTrips(enabled: boolean)         update notifTrips, persist
setNotifPacking(enabled: boolean)       update notifPacking, persist
setLeadTime(leadTime)                   update leadTime, persist

PERSISTENCE
-----------
Storage key:    "movana-settings"
Storage engine: AsyncStorage

FULL STORE CODE
---------------

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"

type Theme    = "light" | "dark" | "system"
type Language = "en" | "fr"
type LeadTime = "1day" | "3hours" | "both"

type SettingsState = {
  theme:          Theme
  language:       Language
  notifTrips:     boolean
  notifPacking:   boolean
  leadTime:       LeadTime
  setTheme:       (theme: Theme) => void
  setLanguage:    (language: Language) => void
  setNotifTrips:  (enabled: boolean) => void
  setNotifPacking: (enabled: boolean) => void
  setLeadTime:    (leadTime: LeadTime) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme:          "system",
      language:       "en",
      notifTrips:     true,
      notifPacking:   true,
      leadTime:       "both",
      setTheme:       (theme)    => set({ theme }),
      setLanguage:    (language) => set({ language }),
      setNotifTrips:  (enabled)  => set({ notifTrips: enabled }),
      setNotifPacking: (enabled) => set({ notifPacking: enabled }),
      setLeadTime:    (leadTime) => set({ leadTime }),
    }),
    {
      name:    "movana-settings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)


========================================
STORE 5 — notificationStore  (store/notificationStore.ts)
========================================

PURPOSE
-------
Tracks the Expo notification IDs that have been scheduled, keyed by ticketId
or checklistId. Required so that notifications can be cancelled correctly when
a ticket is deleted, a checklist is completed, or the user disables notifications
in settings.

STATE SHAPE
-----------
Field           Type                        Default    Notes
---             ---                         ---        ---
scheduledIds    Record<string, string[]>    {}         key = ticketId or checklistId
                                                       value = array of notif IDs

ACTIONS
-------
Action                                          Effect
---                                             ---
addIds(key: string, ids: string[])              append ids to scheduledIds[key], persist
removeIds(key: string)                          delete scheduledIds[key] entirely, persist
getIds(key: string): string[]                   return ids for key or empty array

PERSISTENCE
-----------
Storage key:    "movana-notifications"
Storage engine: AsyncStorage

FULL STORE CODE
---------------

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"

type NotificationState = {
  scheduledIds: Record<string, string[]>
  addIds:       (key: string, ids: string[]) => void
  removeIds:    (key: string) => void
  getIds:       (key: string) => string[]
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      scheduledIds: {},

      addIds: (key, ids) =>
        set((state) => ({
          scheduledIds: {
            ...state.scheduledIds,
            [key]: [...(state.scheduledIds[key] ?? []), ...ids],
          },
        })),

      removeIds: (key) =>
        set((state) => {
          const updated = { ...state.scheduledIds }
          delete updated[key]
          return { scheduledIds: updated }
        }),

      getIds: (key) => get().scheduledIds[key] ?? [],
    }),
    {
      name:    "movana-notifications",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)


========================================
HYDRATION — PREVENTING STALE STATE
========================================

Zustand persist with AsyncStorage is asynchronous on React Native.
On first render, stores return their default values before AsyncStorage has
loaded. For stores that affect UI layout (tickets, reminders, settings), use
the onRehydrateStorage callback to track hydration state and show a loading
screen until data is ready.

Add this to settingsStore (and optionally ticketStore):

  onRehydrateStorage: () => (state) => {
    if (state) state._hasHydrated = true
  }

Add _hasHydrated: boolean = false to state shape.

In app/_layout.tsx:
  const hasHydrated = useSettingsStore((s) => s._hasHydrated)
  if (!hasHydrated) return <SplashScreen />

This prevents a flash of wrong theme or missing ticket data on startup.


========================================
CORRECT USAGE PATTERNS IN COMPONENTS
========================================

READING STATE (subscribe only to what you need — avoids unnecessary re-renders)
--------------------------------------------------------------------------------
  const fromCity = useBookingStore((s) => s.fromCity)
  const tickets  = useTicketStore((s) => s.tickets)

CALLING ACTIONS
---------------
  const setFromCity  = useBookingStore((s) => s.setFromCity)
  const addChecklist = useReminderStore((s) => s.addChecklist)

CALLING GETTERS (call via getState to avoid subscription)
----------------------------------------------------------
  // getters return values but are NOT reactive to state changes
  // use them for one-time reads, not for rendering
  const trip = useTicketStore.getState().getUpcomingTrip()

  // for reactive rendering, derive in the component:
  const tickets    = useTicketStore((s) => s.tickets)
  const upcomingTrip = tickets
    .filter(t => t.travelDate >= today)
    .sort(...)[0] ?? null

CLERK AUTH IN COMPONENTS (not Zustand)
---------------------------------------
  import { useUser } from "@clerk/clerk-expo"
  const { user } = useUser()
  // user.firstName, user.fullName, user.imageUrl, user.id


========================================
COMPLETE INSTALL COMMAND LIST
========================================

npx expo install zustand
npx expo install @react-native-async-storage/async-storage
npx expo install react-native-get-random-values
npx expo install uuid

Add to tsconfig.json compilerOptions if uuid types are missing:
  "types": ["uuid"]
