import { create } from "zustand";
import { tokenCache } from "../utils/cache";

export type Ticket = {
  ticketId: string;
  passengerId: string;
  passengerName: string;
  from: string;
  to: string;
  agencyName: string;
  agencyInitials: string;
  agencyColor: string;
  departureTime: string;
  arrivalTime: string;
  travelDate: string;
  seats: string[];
  busClass: string;
  totalPaid: number;
  paymentMethod: string;
  bookedAt: string;
  status: "confirmed" | "past";
  qrData: string;
};

type TicketState = {
  tickets: Ticket[];
  loadTickets: () => Promise<void>;
  addTicket: (ticket: Ticket) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  getTicketById: (id: string) => Ticket | undefined;
  getUpcomingTickets: () => Ticket[];
  getPastTickets: () => Ticket[];
};

const STORAGE_KEY = "movana_tickets";

export const useTicketStore = create<TicketState & { pendingFilter: "upcoming" | "past" | null; setPendingFilter: (f: "upcoming" | "past" | null) => void }>((set, get) => ({
  pendingFilter: null,
  setPendingFilter: (f) => set({ pendingFilter: f }),
  tickets: [],
  loadTickets: async () => {
    try {
      const raw = await tokenCache.getToken(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Ticket[];
      if (Array.isArray(parsed)) {
        set({ tickets: parsed });
      }
    } catch {
      set({ tickets: [] });
    }
  },
  addTicket: async (ticket) => {
    set((state) => ({ tickets: [...state.tickets, ticket] }));
    try {
      const current = get().tickets;
      await tokenCache.saveToken(STORAGE_KEY, JSON.stringify(current));
    } catch {
      // persistence is optional
    }
  },
  deleteTicket: async (id) => {
    set((state) => ({ tickets: state.tickets.filter((t) => t.ticketId !== id) }));
    try {
      const current = get().tickets;
      await tokenCache.saveToken(STORAGE_KEY, JSON.stringify(current));
    } catch {
      // persistence is optional
    }
  },
  getTicketById: (id) => {
    return get().tickets.find((t) => t.ticketId === id);
  },
  getUpcomingTickets: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return get().tickets.filter((t) => {
      const travelDate = new Date(t.travelDate);
      travelDate.setHours(0, 0, 0, 0);
      return travelDate.getTime() >= today.getTime();
    });
  },
  getPastTickets: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return get().tickets.filter((t) => {
      const travelDate = new Date(t.travelDate);
      travelDate.setHours(0, 0, 0, 0);
      return travelDate.getTime() < today.getTime();
    });
  },
}));
