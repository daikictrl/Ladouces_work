import { useState, useEffect } from "react";
import { FlatList, View as RNView, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { View, Text, Pressable } from "../../../components/tw";
import { Ionicons } from "@expo/vector-icons";
import { useReminderStore } from "../../../stores/reminderStore";
import { useTicketStore } from "../../../stores/ticketStore";
import { computeProgress, getItemCounts } from "../../../types/reminder";
import BottomSheet from "../../../components/ui/BottomSheet";
import Button from "../../../components/ui/Button";

export default function RemindersIndex() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { reminders, deleteReminder } = useReminderStore();
  const { tickets, loadTickets } = useTicketStore();

  const [addModalOpen, setAddModalOpen] = useState(false);

  // Load tickets on mount to ensure list of pending setup trips is fresh
  useEffect(() => {
    loadTickets();
  }, []);

  // Filter reminders for upcoming trips
  const upcomingReminders = reminders.filter((r) => {
    const travelDate = new Date(r.travelDate);
    travelDate.setHours(23, 59, 59, 999); // Allow reminders to stay active through travel day
    return travelDate.getTime() >= Date.now();
  });

  // Find tickets that don't have a reminder checklist yet
  const pendingTickets = tickets.filter((ticket) => {
    // Only upcoming tickets
    const travelDate = new Date(ticket.travelDate);
    travelDate.setHours(23, 59, 59, 999);
    if (travelDate.getTime() < Date.now()) return false;

    // Check if reminder already exists
    return !reminders.some((r) => r.tripId === ticket.ticketId);
  });

  const confirmDelete = (reminderId: string, from: string, destination: string) => {
    Alert.alert(
      "Delete Checklist",
      `Are you sure you want to delete the checklist and cancel all scheduled notifications for the trip from ${from} to ${destination}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteReminder(reminderId),
        },
      ]
    );
  };

  const handleSelectTicketForSetup = (ticketId: string) => {
    setAddModalOpen(false);
    router.push({
      pathname: "/(tabs)/book/reminder-setup",
      params: { ticketId },
    } as any);
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <RNView style={{ paddingTop: Math.max(insets.top, 20) }}>
        <View className="flex-row items-center justify-between px-5 pb-5">
          <View>
            <Text className="text-[32px] font-bold text-slate-900 tracking-tight">Packing lists</Text>
            <Text className="text-[15px] font-medium text-slate-500 mt-1">
              {upcomingReminders.length} active trip checklist{upcomingReminders.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <Pressable
            onPress={() => setAddModalOpen(true)}
            className="h-12 w-12 items-center justify-center bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20 active:bg-blue-700"
          >
            <Ionicons name="add" size={24} color="#ffffff" />
          </Pressable>
        </View>
      </RNView>

      {/* Main List */}
      <FlatList
        data={upcomingReminders}
        keyExtractor={(item) => item.reminderId}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        renderItem={({ item }) => {
          const progress = computeProgress(item);
          const { completed, total } = getItemCounts(item);
          const hasNotifications = item.scheduledNotificationIds.length > 0;
          const travelDate = new Date(item.travelDate);
          const formattedDate = new Intl.DateTimeFormat("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }).format(travelDate);

          return (
            <Pressable
              onPress={() => router.push(`/(tabs)/reminders/${item.reminderId}` as any)}
              className="bg-white rounded-3xl p-5 mb-4 border border-slate-100 shadow-sm active:bg-slate-50/50"
            >
              {/* Trip Header */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1">
                  <View className="flex-row items-center flex-wrap gap-1">
                    <Text className="text-[17px] font-bold text-slate-900">
                      {item.from}
                    </Text>
                    <Ionicons name="arrow-forward-outline" size={14} color="#64748b" />
                    <Text className="text-[17px] font-bold text-slate-900">
                      {item.destination}
                    </Text>
                  </View>
                  <Text className="text-[13px] font-medium text-slate-400 mt-1">
                    {formattedDate} • {item.departureTime} • {item.agencyName}
                  </Text>
                </View>

                {/* Status Badges */}
                <View className="flex-row items-center gap-1.5">
                  {hasNotifications && (
                    <View className="h-8 w-8 rounded-xl bg-purple-50 items-center justify-center">
                      <Ionicons name="notifications" size={16} color="#9333ea" />
                    </View>
                  )}
                  <Pressable
                    onPress={() => confirmDelete(item.reminderId, item.from, item.destination)}
                    className="h-8 w-8 rounded-xl bg-red-50 items-center justify-center active:bg-red-100"
                  >
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </Pressable>
                </View>
              </View>

              {/* Progress */}
              <View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-[13px] font-bold text-slate-500">
                    {completed} of {total} packed
                  </Text>
                  <Text className={`text-[14px] font-bold ${progress === 100 ? "text-emerald-600" : "text-blue-600"}`}>
                    {progress}%
                  </Text>
                </View>
                <View className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <View
                    className={`h-full rounded-full ${progress === 100 ? "bg-emerald-500" : "bg-blue-600"}`}
                    style={{ width: `${progress}%` }}
                  />
                </View>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View className="items-center justify-center py-8">
            {/* Empty State Banner */}
            <View className="h-24 w-24 rounded-full bg-slate-100 items-center justify-center mb-6">
              <Ionicons name="briefcase-outline" size={42} color="#94a3b8" />
            </View>
            <Text className="text-[20px] font-bold text-slate-800 mb-2">No checklists active</Text>
            <Text className="text-[15px] font-medium text-slate-500 text-center px-8 mb-8">
              Create a personalized travel packing list and schedule notifications for your upcoming trips.
            </Text>

            {/* If there are tickets pending setup, list them */}
            {pendingTickets.length > 0 ? (
              <View className="w-full mt-2">
                <Text className="text-[15px] font-bold text-slate-800 mb-3 px-1">
                  Trips Pending Setup ({pendingTickets.length})
                </Text>
                {pendingTickets.map((ticket) => {
                  const tDate = new Date(ticket.travelDate);
                  const fDate = new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                  }).format(tDate);
                  return (
                    <View
                      key={ticket.ticketId}
                      className="flex-row items-center bg-white rounded-2xl p-4 border border-slate-100 mb-3"
                    >
                      <View
                        className="h-10 w-10 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: ticket.agencyColor || "#2563eb" }}
                      >
                        <Ionicons name="bus" size={20} color="#ffffff" />
                      </View>
                      <View className="flex-1 mr-2">
                        <Text className="text-[15px] font-bold text-slate-900" numberOfLines={1}>
                          {ticket.from} → {ticket.to}
                        </Text>
                        <Text className="text-[12px] font-medium text-slate-400 mt-0.5">
                          {fDate} • {ticket.departureTime}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => handleSelectTicketForSetup(ticket.ticketId)}
                        className="bg-blue-600 active:bg-blue-700 px-4 py-2.5 rounded-2xl flex-row items-center justify-center"
                      >
                        <Text className="text-white text-[13px] font-bold">Setup</Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View className="w-full bg-white rounded-3xl p-6 border border-slate-100 text-center items-center">
                <Ionicons name="ticket-outline" size={28} color="#2563eb" className="mb-2" />
                <Text className="text-[15px] font-bold text-slate-800 mb-1">Book a new trip</Text>
                <Text className="text-[13px] font-medium text-slate-400 text-center mb-4">
                  Checklists are linked to tickets. Book a ticket to start planning.
                </Text>
                <Button
                  label="Go to Booking"
                  onPress={() => router.push("/(tabs)/book" as any)}
                  className="w-full"
                />
              </View>
            )}
          </View>
        }
      />

      {/* Select Ticket Modal / Bottom Sheet */}
      <BottomSheet
        visible={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      >
        <View className="flex-row items-center justify-between mb-6">
          <Text className="font-bold text-[20px] text-slate-900">Select Trip</Text>
          <Pressable
            onPress={() => setAddModalOpen(false)}
            className="h-8 w-8 items-center justify-center bg-slate-100 rounded-full"
          >
            <Ionicons name="close" size={20} color="#64748b" />
          </Pressable>
        </View>

        <Text className="text-[14px] font-medium text-slate-500 mb-4">
          Choose an upcoming trip to create a packing list and reminders for:
        </Text>

        {pendingTickets.length > 0 ? (
          <ScrollView className="max-h-80" showsVerticalScrollIndicator={false}>
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
                  onPress={() => handleSelectTicketForSetup(ticket.ticketId)}
                  className="flex-row items-center bg-slate-50 hover:bg-slate-100 rounded-2xl p-4 border border-slate-100 mb-3 active:bg-slate-100"
                >
                  <View
                    className="h-10 w-10 rounded-xl items-center justify-center mr-4"
                    style={{ backgroundColor: ticket.agencyColor || "#2563eb" }}
                  >
                    <Ionicons name="bus" size={20} color="#ffffff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[15px] font-bold text-slate-950">
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
          </ScrollView>
        ) : (
          <View className="items-center py-6">
            <Ionicons name="alert-circle-outline" size={32} color="#64748b" className="mb-2" />
            <Text className="text-[15px] font-bold text-slate-800 text-center mb-1">
              No pending trips
            </Text>
            <Text className="text-[13px] font-medium text-slate-400 text-center px-4 mb-4">
              All of your upcoming tickets already have checklists created, or you don't have any bookings.
            </Text>
            <Button
              label="Cancel"
              variant="secondary"
              onPress={() => setAddModalOpen(false)}
              className="w-full"
            />
          </View>
        )}
      </BottomSheet>
    </View>
  );
}
