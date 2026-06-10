import { View, Text } from "../tw";
import { Ionicons } from "@expo/vector-icons";
import { useTicketStore } from "../../stores/ticketStore";
import { useMemo } from "react";

export default function RecentActivity() {
  const tickets = useTicketStore((s) => s.tickets);
  const upcoming = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tickets.filter((t) => new Date(t.travelDate) >= today);
  }, [tickets]);
  const past = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tickets.filter((t) => new Date(t.travelDate) < today);
  }, [tickets]);
  const trip = upcoming.length > 0
    ? upcoming[0]
    : past.length > 0
      ? past[past.length - 1]
      : null;

  const countdown = useMemo(() => {
    if (!trip) return null;
    const diff = new Date(trip.travelDate).getTime() - Date.now();
    if (diff <= 0) return null;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days === 1 ? "1 day" : `${days} days`;
  }, [trip]);

  if (!trip) {
    return (
      <View className="mx-5 mb-8 rounded-3xl bg-white px-6 py-6 shadow-xl shadow-slate-200/50 border border-slate-100">
        <View className="flex-row items-center gap-4">
          <View className="h-12 w-12 rounded-full bg-slate-50 items-center justify-center border border-slate-100">
            <Ionicons name="compass-outline" size={24} color="#94a3b8" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-[15px] text-slate-800">
              No recent activity
            </Text>
            <Text className="font-medium text-[13px] text-slate-400 mt-0.5">
              Start exploring the world!
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="mx-5 mb-8 rounded-3xl bg-white px-6 py-6 shadow-xl shadow-slate-200/50 border border-slate-100">
      {countdown ? (
        <View className="flex-row items-center gap-4">
          <View className="h-12 w-12 rounded-full bg-blue-50 items-center justify-center border border-blue-100">
            <Ionicons name="time-outline" size={24} color="#2563eb" />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-[17px] text-slate-900 tracking-tight">
              Trip in {countdown}
            </Text>
            <Text className="mt-1 font-medium text-[13px] text-slate-500">
              {trip.from} → {trip.to} •{" "}
              {new Date(trip.travelDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>
      ) : (
        <View className="flex-row items-center gap-4">
          <View className="h-12 w-12 rounded-full bg-slate-50 items-center justify-center border border-slate-100">
            <Ionicons name="bus-outline" size={24} color="#64748b" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-[16px] text-slate-800">
              Last Trip
            </Text>
            <Text className="mt-1 font-medium text-[13px] text-slate-400">
              {trip.from} → {trip.to}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
