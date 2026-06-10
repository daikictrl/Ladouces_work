import { View, Text, Pressable } from "../tw";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTicketStore } from "../../stores/ticketStore";
import { useMemo } from "react";

export default function UpcomingTripCard() {
  const router = useRouter();
  const tickets = useTicketStore((s) => s.tickets);
  const upcoming = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tickets.filter((t) => new Date(t.travelDate) >= today);
  }, [tickets]);
  const trip = upcoming.length > 0 ? upcoming[0] : null;

  if (!trip) {
    return (
      <View className="mx-5 mb-5 rounded-3xl bg-white px-7 py-8 shadow-lg shadow-slate-200/50 border border-slate-100">
        <View className="items-center">
          <View className="h-14 w-14 rounded-full bg-slate-50 items-center justify-center mb-4">
            <Ionicons name="bus-outline" size={28} color="#94a3b8" />
          </View>
          <Text className="font-bold text-[17px] text-slate-800">
            No upcoming trips
          </Text>
          <Text className="mt-1 font-medium text-[14px] text-slate-400">
            Book your first trip to get started!
          </Text>
        </View>
      </View>
    );
  }

  const travelDate = new Date(trip.travelDate);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(travelDate);

  return (
    <Pressable
      className="mx-5 mb-5 rounded-3xl bg-white px-6 py-6 shadow-xl shadow-slate-200/50 border border-slate-100 active:bg-slate-50"
      onPress={() => router.push(`/(tabs)/tickets/${trip.ticketId}`)}
    >
      <View className="flex-row items-center justify-between pb-4 border-b border-slate-100 border-dashed">
        <View className="flex-row items-center gap-2">
          <Ionicons name="calendar-outline" size={16} color="#64748b" />
          <Text className="font-semibold text-[13px] uppercase tracking-wider text-slate-500">
            Next Trip
          </Text>
        </View>
        <View className="rounded-full bg-emerald-100 px-3 py-1.5">
          <Text className="font-bold text-[11px] tracking-widest text-emerald-600">
            CONFIRMED
          </Text>
        </View>
      </View>

      <View className="mt-5 flex-row items-center gap-4">
        <View
          className="size-12 rounded-2xl items-center justify-center shadow-sm"
          style={{ backgroundColor: trip.agencyColor || "#2563eb", shadowColor: trip.agencyColor || "#2563eb" }}
        >
          <Ionicons name="bus" size={24} color="#fff" />
        </View>
        <View className="flex-1">
          <Text className="font-bold text-[20px] text-slate-900 tracking-tight">
            {trip.from} → {trip.to}
          </Text>
          <Text className="mt-1.5 font-medium text-[14px] text-slate-500">
            {formattedDate} • {trip.departureTime} • {trip.agencyName}
          </Text>
        </View>
      </View>


    </Pressable>
  );
}
