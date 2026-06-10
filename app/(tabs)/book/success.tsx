import { useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StackActions, useNavigation } from "@react-navigation/native";
import { View, Text, ScrollView } from "../../../components/tw";
import { useBookingStore } from "../../../stores/bookingStore";
import { useTicketStore, type Ticket } from "../../../stores/ticketStore";
import { colors } from "../../../theme";
import Button from "../../../components/ui/Button";
import { Ionicons } from "@expo/vector-icons";

function generateTicketId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function BookSuccess() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useUser();

  const resetBooking = useBookingStore((state) => state.resetBooking);
  const addTicket = useTicketStore((state) => state.addTicket);

  const {
    fromCity,
    toCity,
    travelDate,
    selectedAgency,
    selectedBus,
    selectedSeats,
    totalPrice,
    paymentMethod,
  } = useMemo(() => {
    const state = useBookingStore.getState();
    return {
      fromCity: state.fromCity,
      toCity: state.toCity,
      travelDate: state.travelDate,
      selectedAgency: state.selectedAgency,
      selectedBus: state.selectedBus,
      selectedSeats: state.selectedSeats,
      totalPrice: state.totalPrice,
      paymentMethod: state.paymentMethod,
    };
  }, []);

  const formattedDate = useMemo(() => {
    if (!travelDate) return "";
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(travelDate);
  }, [travelDate]);

  const handleSaveTicket = () => {
    const ticketId = generateTicketId();
    const qrData = JSON.stringify({
      ticketId,
      from: fromCity,
      to: toCity,
      seats: selectedSeats,
      date: travelDate?.toISOString(),
      agencyName: selectedAgency?.name,
    });

    const ticket: Ticket = {
      ticketId,
      passengerId: user?.id || "guest",
      passengerName: user?.fullName || user?.primaryEmailAddress?.emailAddress || "Passenger",
      from: fromCity,
      to: toCity,
      agencyName: selectedAgency?.name || "",
      agencyInitials: selectedAgency?.initials || "",
      agencyColor: selectedAgency?.color || colors.primary,
      departureTime: selectedBus?.departure || "",
      arrivalTime: selectedBus?.arrival || "",
      travelDate: travelDate?.toISOString() || "",
      seats: selectedSeats,
      busClass: selectedBus?.busClass || "Standard",
      totalPaid: totalPrice,
      paymentMethod,
      bookedAt: new Date().toISOString(),
      status: "confirmed",
      qrData,
    };

    addTicket(ticket);
    resetBooking();

    // Clear the book stack (pops success, payment, seats, bus, agency)
    // so the Book tab resets to its index when the user returns
    navigation.dispatch(StackActions.popToTop());
    router.navigate("/(tabs)/tickets" as any);
  };

  const handleCancel = () => {
    resetBooking();
    // Pop all screens back to the book index for a clean slate
    navigation.dispatch(StackActions.popToTop());
  };

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingTop: Math.max(insets.top, 24), paddingBottom: Math.max(insets.bottom, 24), paddingHorizontal: 20, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <View className="flex-1 bg-white rounded-[32px] p-6 shadow-2xl shadow-slate-200/50 border border-slate-100 mt-10">
        <View className="items-center -mt-16 mb-6">
          <View className="h-24 w-24 rounded-full bg-emerald-50 border-4 border-white items-center justify-center shadow-lg shadow-emerald-500/20">
            <Ionicons name="checkmark-circle" size={64} color="#10b981" />
          </View>
        </View>

        <Text className="text-[28px] font-bold text-slate-900 text-center mb-2">TICKET</Text>
        <Text className="text-[15px] font-medium text-slate-500 text-center mb-6">
          Your ticket is ready.
        </Text>

        <View className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 flex-1 justify-center">
          <View className="mb-3">
            <Text className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Route</Text>
            <Text className="text-[16px] font-bold text-slate-900">{fromCity} → {toCity}</Text>
          </View>
          <View className="mb-3">
            <Text className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Agency</Text>
            <Text className="text-[16px] font-bold text-slate-900">{selectedAgency?.name}</Text>
          </View>
          <View className="mb-3">
            <Text className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Departure</Text>
            <Text className="text-[16px] font-bold text-slate-900">{selectedBus?.departure} · {formattedDate}</Text>
          </View>
          <View className="mb-3">
            <Text className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Seats</Text>
            <Text className="text-[16px] font-bold text-slate-900">{selectedSeats.join(", ")}</Text>
          </View>
          <View>
            <Text className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Total Paid</Text>
            <Text className="text-[18px] font-bold text-emerald-600">{totalPrice.toLocaleString()} XAF</Text>
          </View>
        </View>

        <View className="mt-auto">
          <Button
            label="Save Ticket"
            onPress={handleSaveTicket}
            className="mb-3"
          />
          <Button
            label="Cancel"
            variant="secondary"
            onPress={handleCancel}
          />
        </View>
      </View>
    </ScrollView>
  );
}
