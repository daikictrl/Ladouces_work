import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, View as RNView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, Pressable } from "../../../components/tw";
import TicketCard from "../../../components/TicketCard";
import { useTicketStore } from "../../../stores/ticketStore";
import Button from "../../../components/ui/Button";

type Filter = "upcoming" | "past";

const filters: { key: Filter; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
];

export default function TicketsIndex() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tickets = useTicketStore((state) => state.tickets);
  const loadTickets = useTicketStore((state) => state.loadTickets);
  const pendingFilter = useTicketStore((state) => state.pendingFilter);
  const setPendingFilter = useTicketStore((state) => state.setPendingFilter);
  const [activeFilter, setActiveFilter] = useState<Filter>("upcoming");

  useEffect(() => {
    if (pendingFilter && (pendingFilter === "upcoming" || pendingFilter === "past")) {
      setActiveFilter(pendingFilter);
      setPendingFilter(null);
    }
  }, [pendingFilter, setPendingFilter]);

  useFocusEffect(
    useCallback(() => {
      loadTickets();
    }, [loadTickets])
  );

  const filteredTickets = tickets.filter((t) => {
    const travelDate = new Date(t.travelDate);
    travelDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (activeFilter === "upcoming") return travelDate.getTime() >= today.getTime();
    if (activeFilter === "past") return travelDate.getTime() < today.getTime();
    return true;
  });

  const sortedTickets = activeFilter === "upcoming"
    ? [...filteredTickets].sort((a, b) => new Date(a.travelDate).getTime() - new Date(b.travelDate).getTime())
    : [...filteredTickets].sort((a, b) => new Date(b.travelDate).getTime() - new Date(a.travelDate).getTime());

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-20 px-5">
      <View className="h-24 w-24 rounded-full bg-blue-50 items-center justify-center mb-6">
        <Text className="text-[40px]">🎫</Text>
      </View>
      <Text className="text-[22px] font-bold text-slate-900 mb-2">
        {activeFilter === "upcoming" ? "No upcoming tickets" : "No past tickets"}
      </Text>
      <Text className="text-[15px] font-medium text-slate-500 text-center mb-8">
        {activeFilter === "upcoming"
          ? "Your booked trips will appear here"
          : "Your completed trips will appear here"}
      </Text>
      {activeFilter === "upcoming" && (
        <View className="w-48">
          <Button label="Book a Trip" onPress={() => router.push("/(tabs)/book")} />
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <RNView style={{ paddingTop: Math.max(insets.top, 16) }}>
        <View className="px-5 pb-4">
          <Text className="text-[32px] font-bold text-slate-900 tracking-tight">My Tickets</Text>
        </View>

        <View className="flex-row px-5 pb-4 gap-2">
          {filters.map((f) => {
            const isActive = activeFilter === f.key;
            return (
              <Pressable
                key={f.key}
                className={`px-5 py-2.5 rounded-full border ${
                  isActive ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'
                }`}
                onPress={() => setActiveFilter(f.key)}
              >
                <Text className={`text-[14px] font-semibold ${
                  isActive ? 'text-white' : 'text-slate-600'
                }`}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </RNView>

      <FlatList
        data={sortedTickets}
        keyExtractor={(item) => item.ticketId}
        renderItem={({ item }) => <TicketCard ticket={item} />}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={sortedTickets.length === 0 ? { flexGrow: 1 } : { paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
