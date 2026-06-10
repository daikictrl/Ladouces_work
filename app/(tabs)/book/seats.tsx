import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, View as RNView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, Pressable } from "../../../components/tw";
import { useBookingStore } from "../../../stores/bookingStore";
import BookingStepIndicator from "./_BookingStepIndicator";
import Button from "../../../components/ui/Button";
import { Ionicons } from "@expo/vector-icons";

const makeRouteLabel = (from: string, to: string) => `${from} → ${to}`;

const getSeatRows = () => {
  const rows: { row: number; columns: string[] }[] = [];
  for (let row = 1; row <= 9; row += 1) {
    rows.push({ row, columns: ["A", "B", "C", "D"] });
  }
  return rows;
};

const createSeededOccupied = (busId: string, allSeats: string[]) => {
  const seed = busId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return allSeats.filter((seat, index) => {
    const value = (seed * (index + 7) * 9301 + 49297) % 233280;
    return value / 233280 < 0.54;
  });
};

export default function BookSeats() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const selectedBus = useBookingStore((state) => state.selectedBus);
  const selectedAgency = useBookingStore((state) => state.selectedAgency);
  const fromCity = useBookingStore((state) => state.fromCity);
  const toCity = useBookingStore((state) => state.toCity);
  const storedSeats = useBookingStore((state) => state.selectedSeats);
  const setSelectedSeats = useBookingStore((state) => state.setSelectedSeats);
  const setTotalPrice = useBookingStore((state) => state.setTotalPrice);

  const [selectedSeats, setLocalSelectedSeats] = useState<string[]>(storedSeats);
  const [feedback, setFeedback] = useState<string>("");

  useEffect(() => {
    if (!fromCity || !toCity) router.replace("/(tabs)/book");
    else if (!selectedAgency) router.replace("/(tabs)/book/agency");
    else if (!selectedBus) router.replace("/(tabs)/book/bus");
  }, [fromCity, toCity, selectedAgency, selectedBus, router]);

  const allSeats = useMemo(() => {
    return getSeatRows().flatMap(({ row, columns }) => columns.map((column) => `${row}${column}`));
  }, []);

  const occupiedSeats = useMemo(() => {
    if (!selectedBus) return [];
    return createSeededOccupied(selectedBus.id, allSeats);
  }, [selectedBus, allSeats]);

  const handleSeatPress = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) {
      setFeedback("Seat already occupied");
      setTimeout(() => setFeedback(""), 1400);
      return;
    }
    const isSelected = selectedSeats.includes(seatId);
    if (!isSelected && selectedSeats.length >= 4) {
      setFeedback("Maximum 4 seats per booking");
      setTimeout(() => setFeedback(""), 1400);
      return;
    }
    setLocalSelectedSeats(isSelected ? selectedSeats.filter((s) => s !== seatId) : [...selectedSeats, seatId]);
  };

  const seatTotal = selectedBus ? selectedSeats.length * selectedBus.price : 0;

  const handleContinue = () => {
    if (!selectedBus) return;
    if (!selectedSeats.length) {
      setFeedback("Select at least one seat");
      setTimeout(() => setFeedback(""), 1400);
      return;
    }
    setSelectedSeats(selectedSeats);
    setTotalPrice(seatTotal);
    router.push("/(tabs)/book/payment");
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Sticky Header */}
      <RNView style={{ paddingTop: Math.max(insets.top, 16), backgroundColor: "#f8fafc", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" }}>
        <View className="px-5 pb-3">
          {/* Back + Title row */}
          <View className="flex-row items-center mb-3">
            <Pressable
              className="h-9 w-9 items-center justify-center bg-white rounded-full border border-slate-200 mr-3"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={18} color="#0f172a" />
            </Pressable>
            <Text className="text-[17px] font-bold text-slate-900">Select Your Seat</Text>
          </View>
          <BookingStepIndicator currentStep={4} />
        </View>
      </RNView>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 150 }}
      >
        {/* Route info card */}
        <View className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm shadow-slate-100 mb-5">
          <Text className="text-[17px] font-bold text-slate-900 mb-0.5">{makeRouteLabel(fromCity, toCity)}</Text>
          <Text className="text-[14px] font-medium text-blue-600 mb-1">{selectedAgency?.name}</Text>
          <Text className="text-[13px] font-medium text-slate-500">
            {selectedBus?.departure} • {selectedBus?.busClass} • {selectedBus?.seatsAvailable} seats left
          </Text>
        </View>

        {/* Legend */}
        <View className="flex-row justify-between mb-6 px-2">
          <View className="flex-row items-center">
            <View className="h-3 w-3 rounded-md bg-white border-2 border-slate-300 mr-2" />
            <Text className="text-[12px] font-semibold text-slate-600">Available</Text>
          </View>
          <View className="flex-row items-center">
            <View className="h-3 w-3 rounded-md bg-indigo-500 mr-2" />
            <Text className="text-[12px] font-semibold text-slate-600">Selected</Text>
          </View>
          <View className="flex-row items-center">
            <View className="h-3 w-3 rounded-md bg-slate-200 mr-2" />
            <Text className="text-[12px] font-semibold text-slate-600">Occupied</Text>
          </View>
        </View>

        {/* Seat Map */}
        <View className="items-center pb-8">
          <View className="w-full max-w-[280px] bg-white rounded-[32px] p-6 border border-slate-200 shadow-xl shadow-slate-200/50">
            {/* Driver Box */}
            <View className="items-end mb-8 border-b border-slate-100 pb-4">
              <View className="bg-slate-800 rounded-xl px-4 py-2">
                <Text className="text-white text-[12px] font-bold">Driver</Text>
              </View>
            </View>

            {/* Seats Grid */}
            {getSeatRows().map(({ row, columns }) => (
              <View key={row} className="flex-row justify-between mb-4">
                <View className="flex-row gap-3">
                  {columns.slice(0, 2).map((col) => {
                    const seatId = `${row}${col}`;
                    const isOccupied = occupiedSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    return (
                      <Pressable
                        key={seatId}
                        onPress={() => handleSeatPress(seatId)}
                        className={`will-change-pressable h-12 w-12 rounded-xl items-center justify-center border-2 ${
                          isOccupied ? 'bg-slate-100 border-slate-200' :
                          isSelected ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-slate-300 active:bg-slate-50'
                        }`}
                      >
                        <Text className={`text-[12px] font-bold ${
                          isOccupied ? 'text-slate-400' :
                          isSelected ? 'text-white' : 'text-slate-600'
                        }`}>{seatId}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Aisle Spacer */}
                <View className="w-8" />

                <View className="flex-row gap-3">
                  {columns.slice(2, 4).map((col) => {
                    const seatId = `${row}${col}`;
                    const isOccupied = occupiedSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    return (
                      <Pressable
                        key={seatId}
                        onPress={() => handleSeatPress(seatId)}
                        className={`will-change-pressable h-12 w-12 rounded-xl items-center justify-center border-2 ${
                          isOccupied ? 'bg-slate-100 border-slate-200' :
                          isSelected ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-slate-300 active:bg-slate-50'
                        }`}
                      >
                        <Text className={`text-[12px] font-bold ${
                          isOccupied ? 'text-slate-400' :
                          isSelected ? 'text-white' : 'text-slate-600'
                        }`}>{seatId}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-5 pt-4 flex-row items-center justify-between shadow-2xl" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <View className="flex-1">
          <Text className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {selectedSeats.length} Seat{selectedSeats.length !== 1 ? 's' : ''}
          </Text>
          <Text className="text-[22px] font-bold text-slate-900">{seatTotal.toLocaleString()} XAF</Text>
        </View>
        <View className="w-40">
          <Button
            label="Continue"
            onPress={handleContinue}
            disabled={!selectedSeats.length}
          />
        </View>
      </View>

      {/* Toast */}
      {feedback ? (
        <View className="absolute bottom-32 left-5 right-5 bg-slate-900/90 rounded-2xl p-4 items-center">
          <Text className="text-white font-medium text-[15px]">{feedback}</Text>
        </View>
      ) : null}
    </View>
  );
}