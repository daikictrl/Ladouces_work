import { useMemo } from "react";
import { ScrollView, View as RNView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { View, Text, Pressable } from "../../../components/tw";
import { Ionicons } from "@expo/vector-icons";
import { useTicketStore } from "../../../stores/ticketStore";
import { useReminderStore } from "../../../stores/reminderStore";
import Button from "../../../components/ui/Button";

export default function NewChecklistScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tickets } = useTicketStore();
  const { reminders } = useReminderStore();

  // Find tickets that don't have a reminder checklist yet
  const pendingTickets = useMemo(() => {
    const now = Date.now();
    return tickets.filter((ticket) => {
      // Only upcoming tickets
      const travelDate = new Date(ticket.travelDate);
      travelDate.setHours(23, 59, 59, 999);
      if (travelDate.getTime() < now) return false;

      // Check if reminder already exists
      return !reminders.some((r) => r.tripId === ticket.ticketId);
    });
  }, [tickets, reminders]);

  const handleSelectTicket = (ticketId: string) => {
    // We replace the current screen in the stack with the setup screen
    router.replace({
      pathname: "/(tabs)/book/reminder-setup",
      params: { ticketId },
    } as any);
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <RNView
        style={{
          paddingTop: Math.max(insets.top, 16),
          backgroundColor: "#ffffff",
          borderBottomWidth: 1,
          borderBottomColor: "#f1f5f9",
        }}
      >
        <View className="flex-row items-center justify-between px-5 pb-4">
          <Text className="text-[20px] font-bold text-slate-900">
            Create Checklist
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center bg-slate-100 rounded-full active:bg-slate-200"
          >
            <Ionicons name="close" size={20} color="#64748b" />
          </Pressable>
        </View>
      </RNView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60 }}
      >
        <Text className="text-[14px] font-medium text-slate-500 mb-4 px-1">
          Choose an upcoming trip to build a packing checklist and set departure notifications:
        </Text>

        {pendingTickets.length > 0 ? (
          <View className="gap-3">
            {pendingTickets.map((ticket) => {
              const tDate = new Date(ticket.travelDate);
              const fDate = new Intl.DateTimeFormat("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              }).format(tDate);
              return (
                <Pressable
                  key={ticket.ticketId}
                  onPress={() => handleSelectTicket(ticket.ticketId)}
                  className="flex-row items-center bg-white rounded-3xl p-4 border border-slate-100 shadow-sm active:bg-slate-50"
                >
                  <View
                    className="h-11 w-11 rounded-2xl items-center justify-center mr-4"
                    style={{ backgroundColor: ticket.agencyColor || "#2563eb" }}
                  >
                    <Ionicons name="bus" size={22} color="#ffffff" />
                  </View>
                  <View className="flex-1 mr-2">
                    <Text className="text-[15px] font-bold text-slate-900" numberOfLines={1}>
                      {ticket.from} → {ticket.to}
                    </Text>
                    <Text className="text-[12px] font-medium text-slate-400 mt-0.5">
                      {fDate} • {ticket.departureTime} • {ticket.agencyName}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View className="items-center justify-center py-16 bg-white rounded-3xl border border-slate-100 px-6">
            <View className="h-16 w-16 rounded-full bg-slate-100 items-center justify-center mb-4">
              <Ionicons name="alert-circle-outline" size={32} color="#94a3b8" />
            </View>
            <Text className="text-[17px] font-bold text-slate-800 mb-2">
              No trips pending setup
            </Text>
            <Text className="text-[14px] font-medium text-slate-500 text-center mb-6">
              All of your booked trips already have checklists created, or you don't have any bookings.
            </Text>
            <Button
              label="Go to Booking"
              onPress={() => router.replace("/(tabs)/book" as any)}
              className="w-full mb-3"
            />
            <Button
              label="Cancel"
              variant="secondary"
              onPress={() => router.back()}
              className="w-full"
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
