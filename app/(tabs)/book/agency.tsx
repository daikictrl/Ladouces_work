import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, View as RNView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, Pressable } from "../../../components/tw";
import { getAgenciesForRoute } from "../../../constants/agencies";
import { useBookingStore } from "../../../stores/bookingStore";
import BookingStepIndicator from "./_BookingStepIndicator";
import Button from "../../../components/ui/Button";
import { Ionicons } from "@expo/vector-icons";

const formatCurrency = (value: number) => `${value.toLocaleString()} XAF`;

export default function BookAgency() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const fromCity = useBookingStore((state) => state.fromCity);
  const toCity = useBookingStore((state) => state.toCity);
  const selectedAgency = useBookingStore((state) => state.selectedAgency);
  const setSelectedAgency = useBookingStore((state) => state.setSelectedAgency);

  const [selectedAgencyId, setSelectedAgencyId] = useState<string>(
    selectedAgency?.id ?? ""
  );

  useEffect(() => {
    if (!fromCity || !toCity) {
      router.replace("/(tabs)/book");
    }
  }, [fromCity, toCity, router]);

  const routeLabel = useMemo(
    () => `${fromCity} → ${toCity}`,
    [fromCity, toCity]
  );

  // Get only the agencies available for this specific route
  const availableAgencies = useMemo(
    () => getAgenciesForRoute(fromCity, toCity),
    [fromCity, toCity]
  );

  const selected = availableAgencies.find((agency) => agency.id === selectedAgencyId) ?? 
    (selectedAgency && availableAgencies.find(a => a.id === selectedAgency.id) ? selectedAgency : undefined);

  const handleContinue = () => {
    if (!selected) return;
    setSelectedAgency(selected as any);
    router.push("/(tabs)/book/bus");
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Sticky Header */}
      <RNView style={{ paddingTop: Math.max(insets.top, 16), backgroundColor: "#f8fafc" }}>
        <View className="px-5 pb-3">
          {/* Back + Title row */}
          <View className="flex-row items-center mb-3">
            <Pressable
              className="h-9 w-9 items-center justify-center bg-white rounded-full border border-slate-200 mr-3"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={18} color="#0f172a" />
            </Pressable>
            <Text className="text-[17px] font-bold text-slate-900">Choose Agency</Text>
          </View>
          <BookingStepIndicator currentStep={2} />
        </View>
      </RNView>

      {/* Agency List */}
      <FlatList
        data={availableAgencies}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120 }}
        ListHeaderComponent={
          <View className="mb-5">
            <Text className="text-[26px] font-bold text-slate-900">Select Agency</Text>
            <Text className="mt-1 text-[15px] font-medium text-slate-500">
              {availableAgencies.length} agencies available for this route.
            </Text>
            <View className="mt-4 rounded-2xl bg-white p-5 border border-slate-200 shadow-sm shadow-slate-100">
              <Text className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider">Route</Text>
              <Text className="mt-1 text-[17px] font-semibold text-slate-900">{routeLabel}</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const isActive = selectedAgencyId === item.id;
          return (
            <Pressable
              className={`flex-row bg-white rounded-[22px] p-4 mb-4 border ${isActive ? 'border-blue-600 shadow-md shadow-blue-500/20' : 'border-slate-200 shadow-sm shadow-slate-100'}`}
              onPress={() => setSelectedAgencyId(item.id)}
            >
              <View
                className="h-14 w-14 rounded-full items-center justify-center mr-4 shadow-sm"
                style={{ backgroundColor: item.color }}
              >
                <Text className="text-white font-bold text-[16px]">{item.initials}</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-[16px] font-semibold text-slate-900">{item.name}</Text>
                  <View className={`px-2.5 py-1 rounded-full ${isActive ? 'bg-blue-600' : 'bg-slate-100'}`}>
                    <Text className={`text-[11px] font-semibold ${isActive ? 'text-white' : 'text-slate-500'}`}>
                      {isActive ? "SELECTED" : "SELECT"}
                    </Text>
                  </View>
                </View>
                <Text className="text-[13px] text-slate-500 mb-2 leading-tight">{item.description}</Text>

                <View className="flex-row justify-between flex-wrap mt-1">
                  <Text className="text-[13px] font-medium text-slate-600">From {formatCurrency(item.startingPrice)}</Text>
                  <Text className="text-[13px] font-bold text-amber-500">{item.rating.toFixed(1)} ★</Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />

      {/* Footer Button */}
      <View className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-100" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
        <Button
          label="Continue"
          onPress={handleContinue}
          disabled={!selected}
        />
      </View>
    </View>
  );
}
