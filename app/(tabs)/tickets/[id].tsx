import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { View as RNView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, Pressable, ScrollView } from "../../../components/tw";
import QRCode from "react-native-qrcode-svg";
import { useTicketStore } from "../../../stores/ticketStore";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../../components/ui/Button";

export default function TicketDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tickets = useTicketStore((state) => state.tickets);
  const deleteTicket = useTicketStore((state) => state.deleteTicket);
  const ticket = tickets.find((t) => t.ticketId === id);

  const formattedDate = useMemo(() => {
    if (!ticket) return "";
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(ticket.travelDate));
  }, [ticket]);

  const isUpcoming = useMemo(() => {
    if (!ticket) return false;
    const travelDate = new Date(ticket.travelDate);
    travelDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return travelDate.getTime() >= today.getTime();
  }, [ticket]);

  const handleDelete = () => {
    Alert.alert("Delete Ticket", "Are you sure you want to delete this ticket?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: () => {
          if (id) {
            deleteTicket(id);
            router.back();
          }
        } 
      },
    ]);
  };

  if (!ticket) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center p-5">
        <Text className="text-[18px] font-medium text-slate-500 mb-6">Ticket not found</Text>
        <Pressable
          className="bg-blue-600 px-6 py-3.5 rounded-2xl active:bg-blue-700"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold text-[15px]">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <View className="flex-row items-center justify-between px-4 pb-2 bg-slate-50" style={{ paddingTop: Math.max(insets.top, 16) }}>
        <Pressable className="h-10 w-10 items-center justify-center bg-white rounded-full border border-slate-200" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0f172a" />
        </Pressable>
        <Text className="text-[17px] font-bold text-slate-900 tracking-tight">Ticket</Text>
        <Pressable className="h-10 w-10 items-center justify-center bg-white rounded-full border border-red-100" onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20), flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Ticket Wrapper */}
        <View className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-6">
          
          {/* Top Half */}
          <View className="p-5 items-center">
            <View
              className="w-14 h-14 rounded-2xl items-center justify-center mb-2 shadow-md"
              style={{ backgroundColor: ticket.agencyColor || '#2563eb' }}
            >
              <Text className="text-white font-bold text-[20px]">
                {ticket.agencyInitials || ticket.agencyName.charAt(0)}
              </Text>
            </View>
            <Text className="text-[14px] font-semibold text-slate-500 mb-2">{ticket.agencyName}</Text>
            
            <Text className="text-[24px] font-bold text-slate-900 tracking-tight mb-4">
              {ticket.from} <Text className="text-slate-300">→</Text> {ticket.to}
            </Text>

            <View className="flex-row items-center w-full justify-between bg-slate-50 rounded-2xl p-3 border border-slate-100">
              <View className="items-center">
                <Text className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Departure</Text>
                <Text className="text-[20px] font-bold text-blue-600">{ticket.departureTime}</Text>
              </View>
              <View className="flex-1 items-center px-4">
                <View className="w-full h-[1px] border-b border-dashed border-slate-300" />
                <View className="bg-white px-2 py-0.5 rounded-full border border-slate-200 absolute -top-3">
                  <Ionicons name="bus" size={14} color="#94a3b8" />
                </View>
              </View>
              <View className="items-center">
                <Text className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Arrival</Text>
                <Text className="text-[20px] font-bold text-slate-800">{ticket.arrivalTime || "—"}</Text>
              </View>
            </View>
          </View>

          {/* Details Grid */}
          <View className="px-5 pb-4">
            <View className="flex-row mb-3">
              <View className="flex-1">
                <Text className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Passenger</Text>
                <Text className="text-[15px] font-bold text-slate-800">{ticket.passengerName}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Date</Text>
                <Text className="text-[15px] font-bold text-slate-800">{formattedDate}</Text>
              </View>
            </View>
            <View className="flex-row">
              <View className="flex-1">
                <Text className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Seat(s)</Text>
                <Text className="text-[15px] font-bold text-slate-800">{ticket.seats.join(", ")}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Class</Text>
                <Text className="text-[15px] font-bold text-slate-800">{ticket.busClass}</Text>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View className="flex-row items-center relative h-6 overflow-hidden">
            <View className="absolute left-[-16px] h-6 w-8 rounded-full bg-slate-50 border-r border-slate-100" />
            <View className="flex-1 border-t-2 border-dashed border-slate-200 mx-6" />
            <View className="absolute right-[-16px] h-6 w-8 rounded-full bg-slate-50 border-l border-slate-100" />
          </View>

          {/* Bottom Half */}
          <View className="p-4 items-center bg-slate-50/50 justify-center">
            <View className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm mb-3">
              <QRCode value={ticket.qrData} size={120} color="#0f172a" backgroundColor="transparent" />
            </View>
            <Text className="text-[12px] font-bold text-slate-400 tracking-widest uppercase mb-1">
              #{ticket.ticketId}
            </Text>
            <Text className="text-[11px] font-medium text-slate-400">
              Paid via {ticket.paymentMethod}
            </Text>
          </View>

        </View>

        {/* Footer Info */}
        <View className="flex-row items-center justify-between mt-auto">
          <View>
            <Text className="text-[12px] font-medium text-slate-500 mb-0.5">Amount Paid</Text>
            <Text className="text-[20px] font-bold text-slate-900">{ticket.totalPaid.toLocaleString()} XAF</Text>
          </View>
          <View className={`px-4 py-2 rounded-xl ${isUpcoming ? 'bg-emerald-100' : 'bg-slate-200'}`}>
            <Text className={`text-[12px] font-bold tracking-wider ${isUpcoming ? 'text-emerald-700' : 'text-slate-600'}`}>
              {isUpcoming ? "CONFIRMED" : "PAST"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
