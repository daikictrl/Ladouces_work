import { useState, useEffect, useMemo } from "react";
import { View, Text, Pressable } from "../tw";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTicketStore } from "../../stores/ticketStore";
import { useReminderStore } from "../../stores/reminderStore";
import { computeProgress } from "../../types/reminder";

function getDepartureTimestamp(ticket: any): number {
  const departureDate = new Date(ticket.travelDate);
  const timeParts = ticket.departureTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (timeParts) {
    let hours = parseInt(timeParts[1], 10);
    const minutes = parseInt(timeParts[2], 10);
    const ampm = timeParts[3];
    if (ampm) {
      if (ampm.toUpperCase() === "PM" && hours !== 12) hours += 12;
      if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;
    }
    departureDate.setHours(hours, minutes, 0, 0);
  }
  return departureDate.getTime();
}

export default function ReminderCountdown() {
  const router = useRouter();
  const tickets = useTicketStore((s) => s.tickets);
  const { reminders } = useReminderStore();

  const nextTripInfo = useMemo(() => {
    const now = Date.now();
    const upcoming = tickets
      .map((t) => ({ ticket: t, timestamp: getDepartureTimestamp(t) }))
      .filter((t) => t.timestamp > now)
      .sort((a, b) => a.timestamp - b.timestamp);

    if (upcoming.length === 0) return null;

    const next = upcoming[0];
    const reminder = reminders.find((r) => r.tripId === next.ticket.ticketId) || null;

    return {
      ticket: next.ticket,
      timestamp: next.timestamp,
      reminder,
    };
  }, [tickets, reminders]);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false,
  });

  useEffect(() => {
    if (!nextTripInfo) return;

    const calculateTimeLeft = () => {
      const difference = nextTripInfo.timestamp - Date.now();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isOver: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [nextTripInfo]);

  if (!nextTripInfo) return null;

  const { ticket, reminder } = nextTripInfo;
  const progress = reminder ? computeProgress(reminder) : null;

  const handlePress = () => {
    if (reminder) {
      router.push(`/(tabs)/reminders/${reminder.reminderId}` as any);
    } else {
      router.push({
        pathname: "/(tabs)/book/reminder-setup",
        params: { ticketId: ticket.ticketId },
      } as any);
    }
  };

  const formatNumber = (num: number) => String(num).padStart(2, "0");

  return (
    <Pressable
      className="mx-5 mb-5 rounded-3xl bg-slate-900 px-6 py-5 shadow-xl active:opacity-95"
      onPress={handlePress}
    >
      {/* Header with ellipsis and safety flex alignment */}
      <View className="flex-row items-center justify-between pb-4 border-b border-slate-800">
        <View className="flex-row items-center gap-1.5 flex-1 mr-2">
          <Ionicons name="time" size={15} color="#3b82f6" />
          <Text className="font-bold text-[12px] uppercase tracking-wider text-slate-450 shrink" numberOfLines={1}>
            Departure
          </Text>
        </View>
        <View className="flex-row items-center gap-1 max-w-[55%] shrink">
          <Ionicons name="bus-outline" size={13} color="#64748b" />
          <Text className="text-[11px] font-extrabold text-slate-400" numberOfLines={1} ellipsizeMode="tail">
            {ticket.from} → {ticket.to}
          </Text>
        </View>
      </View>

      {/* Ticking Digital Timer — Responsive, smaller boxes, paddings and gaps to fit SE screens */}
      <View className="my-5 flex-row justify-center items-center gap-1.5 px-2">
        {/* Days */}
        <View className="items-center">
          <View className="bg-slate-800/80 rounded-xl py-1.5 px-2.5 min-w-[42px] items-center justify-center">
            <Text className="text-[20px] font-extrabold text-blue-400 font-mono tracking-tight">
              {formatNumber(timeLeft.days)}
            </Text>
          </View>
          <Text className="text-[9px] font-bold text-slate-500 uppercase mt-1">Days</Text>
        </View>

        <Text className="text-[16px] font-bold text-slate-700 -mt-4">:</Text>

        {/* Hours */}
        <View className="items-center">
          <View className="bg-slate-800/80 rounded-xl py-1.5 px-2.5 min-w-[42px] items-center justify-center">
            <Text className="text-[20px] font-extrabold text-blue-400 font-mono tracking-tight">
              {formatNumber(timeLeft.hours)}
            </Text>
          </View>
          <Text className="text-[9px] font-bold text-slate-500 uppercase mt-1">Hours</Text>
        </View>

        <Text className="text-[16px] font-bold text-slate-700 -mt-4">:</Text>

        {/* Minutes */}
        <View className="items-center">
          <View className="bg-slate-800/80 rounded-xl py-1.5 px-2.5 min-w-[42px] items-center justify-center">
            <Text className="text-[20px] font-extrabold text-blue-400 font-mono tracking-tight">
              {formatNumber(timeLeft.minutes)}
            </Text>
          </View>
          <Text className="text-[9px] font-bold text-slate-500 uppercase mt-1">Mins</Text>
        </View>

        <Text className="text-[16px] font-bold text-slate-700 -mt-4">:</Text>

        {/* Seconds */}
        <View className="items-center">
          <View className="bg-slate-800/80 rounded-xl py-1.5 px-2.5 min-w-[42px] items-center justify-center">
            <Text className="text-[20px] font-extrabold text-purple-400 font-mono tracking-tight">
              {formatNumber(timeLeft.seconds)}
            </Text>
          </View>
          <Text className="text-[9px] font-bold text-slate-500 uppercase mt-1">Secs</Text>
        </View>
      </View>

      {/* Checklist Status Footer — Flex wrap and ellipsis safe */}
      <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-slate-850">
        {reminder ? (
          <View className="flex-1 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 mr-2">
              <Ionicons name="checkbox" size={15} color="#10b981" />
              <Text className="text-[12px] font-semibold text-slate-350 ml-1.5 shrink" numberOfLines={1}>
                Packing Checklist
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Text className="text-[12px] font-bold text-emerald-500">{progress}%</Text>
              <Ionicons name="chevron-forward" size={13} color="#64748b" />
            </View>
          </View>
        ) : (
          <View className="flex-1 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 mr-2">
              <Ionicons name="alert-circle" size={15} color="#f59e0b" />
              <Text className="text-[12px] font-semibold text-slate-350 ml-1.5 shrink" numberOfLines={1}>
                No checklist setup yet
              </Text>
            </View>
            <View className="flex-row items-center gap-1 bg-blue-600 active:bg-blue-700 px-2.5 py-1 rounded-xl">
              <Text className="text-[10px] font-bold text-white">Setup</Text>
              <Ionicons name="arrow-forward" size={10} color="#ffffff" />
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}
