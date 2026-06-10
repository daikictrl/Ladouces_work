import { View, Text, Pressable } from "../tw";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { useReminderStore } from "../../stores/reminderStore";
import { useTicketStore } from "../../stores/ticketStore";
import { computeProgress, getItemCounts } from "../../types/reminder";

export default function ReminderPreview() {
  const router = useRouter();
  const tickets = useTicketStore((s) => s.tickets);
  const { reminders } = useReminderStore();

  // Get upcoming tickets
  const upcomingTickets = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tickets.filter((t) => new Date(t.travelDate) >= today);
  }, [tickets]);

  // Find the next reminder checklist linked to an upcoming ticket
  const nextReminder = useMemo(() => {
    if (upcomingTickets.length === 0) return null;
    // Sort tickets by travelDate
    const sortedTickets = [...upcomingTickets].sort((a, b) => new Date(a.travelDate).getTime() - new Date(b.travelDate).getTime());
    
    // Find the first ticket that has a reminder
    for (const ticket of sortedTickets) {
      const found = reminders.find((r) => r.tripId === ticket.ticketId);
      if (found) return found;
    }
    return null;
  }, [upcomingTickets, reminders]);

  // If there are no upcoming tickets at all, let's not show anything or show a "Go to Book" card
  if (upcomingTickets.length === 0) {
    return null;
  }

  // If there are upcoming tickets but none have reminders, show a setup CTA
  if (!nextReminder) {
    const firstTicket = upcomingTickets[0];
    return (
      <Pressable
        className="mx-5 mb-5 rounded-3xl bg-white px-6 py-6 shadow-xl shadow-slate-200/50 border border-slate-100 active:bg-slate-50"
        onPress={() =>
          router.push({
            pathname: "/(tabs)/book/reminder-setup",
            params: { ticketId: firstTicket.ticketId },
          } as any)
        }
      >
        <View className="flex-row items-center justify-between mb-3">
          <Text className="font-bold text-[17px] text-slate-800">
            Trip Preparation
          </Text>
          <View className="h-8 w-8 rounded-full bg-blue-50 items-center justify-center border border-blue-150">
            <Ionicons name="chevron-forward" size={16} color="#2563eb" />
          </View>
        </View>
        <Text className="text-[14px] font-medium text-slate-500 mb-4">
          Prepare a checklist and schedule reminder alerts for your upcoming trip to {firstTicket.to}.
        </Text>
        <View className="flex-row items-center gap-2 bg-blue-50/50 border border-blue-100 rounded-2xl px-4 py-3">
          <Ionicons name="notifications-outline" size={18} color="#2563eb" />
          <Text className="text-[13px] font-bold text-blue-700">
            Setup Checklist & Notifications
          </Text>
        </View>
      </Pressable>
    );
  }

  const progress = computeProgress(nextReminder);
  const { completed, total } = getItemCounts(nextReminder);
  const allItems = [...(nextReminder.selectedItems || []), ...(nextReminder.customItems || [])];
  const previewItems = allItems.slice(0, 4);

  return (
    <Pressable
      className="mx-5 mb-5 rounded-3xl bg-white px-6 py-6 shadow-xl shadow-slate-200/50 border border-slate-100 active:bg-slate-50"
      onPress={() => router.push(`/(tabs)/reminders/${nextReminder.reminderId}` as any)}
    >
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="font-bold text-[17px] text-slate-800">
            Packing Progress
          </Text>
          <Text className="text-[12px] font-semibold text-slate-400 mt-0.5">
            For trip to {nextReminder.destination}
          </Text>
        </View>
        <View className="h-8 w-8 rounded-full bg-slate-50 items-center justify-center border border-slate-100">
          <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
        </View>
      </View>

      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-semibold text-[13px] text-emerald-600">
          {completed} of {total} items packed
        </Text>
        <Text className="font-bold text-[13px] text-emerald-600">
          {progress}%
        </Text>
      </View>

      <View className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <View
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${progress}%` }}
        />
      </View>

      <View className="mt-5 flex-row flex-wrap gap-2">
        {previewItems.map((item) => (
          <View
            key={item.id}
            className={`flex-row items-center gap-1.5 rounded-xl px-3 py-1.5 ${
              item.completed
                ? "bg-emerald-50 border border-emerald-100/50"
                : "bg-slate-50 border border-slate-100"
            }`}
          >
            <Ionicons
              name={item.completed ? "checkmark-circle" : "ellipse-outline"}
              size={15}
              color={item.completed ? "#10b981" : "#94a3b8"}
            />
            <Text
              className={`font-semibold text-[12px] ${
                item.completed ? "text-emerald-700" : "text-slate-500"
              }`}
            >
              {item.text}
            </Text>
          </View>
        ))}
        {allItems.length > 4 && (
          <View className="bg-slate-100 border border-slate-200/50 rounded-xl px-3 py-1.5 justify-center">
            <Text className="font-bold text-[11px] text-slate-500">
              +{allItems.length - 4} more
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
