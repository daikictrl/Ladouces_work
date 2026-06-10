import { create } from "zustand";

export type BookingAgency = {
  id: string;
  name: string;
  initials: string;
  rating: number;
  startingPrice: number;
  color: string;
  description: string;
};

export type BookingBus = {
  id: string;
  departure: string;
  arrival: string;
  duration: string;
  seatsAvailable: number;
  price: number;
  busClass: string;
};

export type BookingState = {
  fromCity: string;
  toCity: string;
  travelDate: Date | null;
  selectedAgency: BookingAgency | null;
  selectedBus: BookingBus | null;
  selectedSeats: string[];
  totalPrice: number;
  paymentMethod: string;
  setRoute: (fromCity: string, toCity: string, travelDate: Date) => void;
  setSelectedAgency: (agency: BookingAgency) => void;
  setSelectedBus: (bus: BookingBus) => void;
  setSelectedSeats: (seats: string[]) => void;
  setTotalPrice: (totalPrice: number) => void;
  setPaymentMethod: (method: string) => void;
  resetBooking: () => void;
};

export const useBookingStore = create<BookingState>((set) => ({
  fromCity: "",
  toCity: "",
  travelDate: null,
  selectedAgency: null,
  selectedBus: null,
  selectedSeats: [],
  totalPrice: 0,
  paymentMethod: "",
  setRoute: (fromCity, toCity, travelDate) =>
    set({
      fromCity,
      toCity,
      travelDate,
      selectedAgency: null,
      selectedBus: null,
      selectedSeats: [],
      totalPrice: 0,
      paymentMethod: "",
    }),
  setSelectedAgency: (agency) => set({ selectedAgency: agency }),
  setSelectedBus: (bus) => set({ selectedBus: bus }),
  setSelectedSeats: (seats) => set({ selectedSeats: seats }),
  setTotalPrice: (totalPrice) => set({ totalPrice }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  resetBooking: () =>
    set({
      fromCity: "",
      toCity: "",
      travelDate: null,
      selectedAgency: null,
      selectedBus: null,
      selectedSeats: [],
      totalPrice: 0,
      paymentMethod: "",
    }),
}));
