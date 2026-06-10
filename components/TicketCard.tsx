import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Alert } from "react-native";
import { View, Text, Pressable } from "./tw";
import QRCode from "react-native-qrcode-svg";
import { Ionicons } from "@expo/vector-icons";
import type { Ticket } from "../stores/ticketStore";
import { useTicketStore } from "../stores/ticketStore";

type Props = {
  ticket: Ticket;
};

export default function TicketCard({ ticket }: Props) {
  const router = useRouter();
  const deleteTicket = useTicketStore((s) => s.deleteTicket);
  const isPast = useMemo(() => {
    const travelDate = new Date(ticket.travelDate);
    travelDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return travelDate.getTime() < today.getTime();
  }, [ticket.travelDate]);

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    }).format(new Date(ticket.travelDate));
  }, [ticket.travelDate]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Ticket",
      `Are you sure you want to delete the ticket for ${ticket.from} → ${ticket.to}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTicket(ticket.ticketId),
        },
      ]
    );
  };

  return (
    <View className="relative">
      <Pressable
        className="flex-row bg-white rounded-3xl mx-5 my-2.5 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
        onPress={() => router.push(`/(tabs)/tickets/${ticket.ticketId}`)}
      >
        {/* Left Column */}
        <View className="flex-1 p-5 pr-4 justify-between border-r border-dashed border-slate-200">
          <View>
            <Text className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {ticket.agencyName}
            </Text>
            <Text className="text-[20px] font-bold text-slate-900 mb-3 tracking-tight">
              {ticket.from} → {ticket.to}
            </Text>
            <View className="flex-row items-center gap-3">
              <View>
                <Text className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Date</Text>
                <Text className="text-[14px] font-semibold text-slate-700">{formattedDate}</Text>
              </View>
              <View className="h-8 w-[1px] bg-slate-200" />
              <View>
                <Text className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Time</Text>
                <Text className="text-[14px] font-semibold text-slate-700">{ticket.departureTime}</Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-end justify-between mt-4">
            <View>
              <Text className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Seats</Text>
              <Text className="text-[15px] font-bold text-blue-600">{ticket.seats.join(", ")}</Text>
            </View>
            <View className={`px-3 py-1.5 rounded-lg ${isPast ? 'bg-slate-100' : 'bg-emerald-50'}`}>
              <Text className={`text-[11px] font-bold tracking-wider ${isPast ? 'text-slate-500' : 'text-emerald-600'}`}>
                {isPast ? "PAST" : "CONFIRMED"}
              </Text>
            </View>
          </View>
        </View>

        {/* Cutout Top/Bottom */}
        <View className="absolute top-[-10px] right-[88px] h-5 w-5 rounded-full bg-slate-50 border border-slate-100" />
        <View className="absolute bottom-[-10px] right-[88px] h-5 w-5 rounded-full bg-slate-50 border border-slate-100" />

        {/* Right Column */}
        <View className="w-[100px] p-4 items-center justify-center bg-slate-50/50">
          <View className="bg-white p-1.5 rounded-xl border border-slate-100 shadow-sm mb-2">
            <QRCode
              value={ticket.qrData}
              size={64}
              color="#0f172a"
              backgroundColor="transparent"
            />
          </View>
          <Text className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase">
            #{ticket.ticketId}
          </Text>
        </View>
      </Pressable>

      {/* Delete Button */}
      <Pressable
        className="absolute top-1 right-3 h-8 w-8 rounded-full bg-red-50 border border-red-100 items-center justify-center z-10 active:bg-red-100"
        onPress={handleDelete}
        hitSlop={8}
      >
        <Ionicons name="trash-outline" size={15} color="#ef4444" />
      </Pressable>
    </View>
  );
}
