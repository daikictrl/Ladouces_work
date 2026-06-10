# Implementation Plan: User-Scoped Local State Persistence

Currently, Movana's `ticketStore` and `reminderStore` store data locally using hardcoded keys (`movana_tickets` and `movana-reminders`). Because these stores do not scope local data by the logged-in user, signing out and logging in (or signing up) with a different account on the same device results in the new user seeing the previous user's data.

This plan details the changes to isolate tickets and reminders by the user's Clerk ID, ensuring data is kept separate.

## User Review Required

> [!NOTE]
> 1. **Reminders Store Persistence:** We will refactor `reminderStore.ts` to replace the default Zustand `persist` middleware with custom asynchronous storage calls scoped by User ID (similar to `ticketStore.ts`). This is necessary because Zustand's `persist` middleware does not support dynamic key naming at runtime based on external state (like a logged-in user). This is fully backwards compatible and will not require changing any UI components.
> 2. **Session Cleanup:** We will automatically synchronize the active `userId` with the stores using a `useEffect` inside `app/_layout.tsx` (the root layout). This ensures that sign-out, sign-in, and sign-up are handled automatically across the application.

## Proposed Changes

---

### Stores Configuration

#### [MODIFY] [ticketStore.ts](file:///c:/Users/JOSEPH'S_PC/Desktop/Movana/stores/ticketStore.ts)
- Add `userId: string | null` to the store's state.
- Add `setUserId: (userId: string | null) => Promise<void>` to the store.
- Update `loadTickets`, `addTicket`, and `deleteTicket` to use the user-scoped storage key: `movana_tickets_${userId}`.
- When `setUserId` is called:
  - If `userId` is `null` (signed out), reset `tickets` to `[]`.
  - If `userId` is present, load tickets for that user ID.

#### [MODIFY] [reminderStore.ts](file:///c:/Users/JOSEPH'S_PC/Desktop/Movana/stores/reminderStore.ts)
- Remove `persist` middleware from Zustand store to support dynamic user-scoped storage keys.
- Add `userId: string | null` and `setUserId: (userId: string | null) => Promise<void>` to the store.
- Update `addItem`, `toggleItem`, `deleteItem`, and `resetDefaultItems` to save to AsyncStorage using the key: `movana_reminders_${userId}`.
- When `setUserId` is called:
  - If `userId` is `null` (signed out), reset `items` to `defaultItems`.
  - If `userId` is present, load reminders for that user ID from AsyncStorage (default to `defaultItems` if no saved list exists).

---

### App Layout Integration

#### [MODIFY] [_layout.tsx](file:///c:/Users/JOSEPH'S_PC/Desktop/Movana/app/_layout.tsx)
- Import `useTicketStore`, `useReminderStore`, and `useBookingStore`.
- Update `InitialLayout` component to pull `userId` and `isSignedIn` from Clerk's `useAuth()`.
- Add a `useEffect` that listens to `userId`, `isSignedIn`, and `isLoaded`.
  - Call `setUserId` on both `useTicketStore` and `useReminderStore`.
  - If `isSignedIn` is `false`, call `resetBooking()` from `useBookingStore`.

## Verification Plan

### Manual Verification
1. Sign up/Log in with **User A**.
2. Add a customized packing reminder (e.g., "Bring swim trunks").
3. Book a simulated bus ride to generate a ticket.
4. Verify the reminder and ticket appear in the respective screens.
5. Go to the profile tab and **Sign Out**.
6. Sign up/Log in with a **new User B**.
7. Verify that the packing list has reset to the defaults (or is empty) and "Bring swim trunks" is not present.
8. Verify that the "My Tickets" list is empty.
9. Sign out of **User B** and sign back in as **User A**.
10. Verify that **User A**'s reminder "Bring swim trunks" and booked ticket are fully restored.
