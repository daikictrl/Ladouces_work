import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, View as RNView } from "react-native";
import { View, Text, Pressable, ScrollView, TextInput } from "../../../components/tw";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBookingStore } from "../../../stores/bookingStore";
import BookingStepIndicator from "./_BookingStepIndicator";
import BottomSheet from "../../../components/ui/BottomSheet";
import Button from "../../../components/ui/Button";

const cities = [
  "Douala",
  "Yaoundé",
  "Bafoussam",
  "Bamenda",
  "Buea",
  "Ngaoundéré",
  "Garoua",
  "Maroua",
  "Bertoua",
  "Ebolowa",
];

const formatDateLabel = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatCompactDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
  }).format(date);
};

export default function BookIndex() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setRoute = useBookingStore((state) => state.setRoute);

  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [travelDate, setTravelDate] = useState<Date | null>(null);
  const [activeField, setActiveField] = useState<"from" | "to" | "date" | null>(null);
  const [citySearch, setCitySearch] = useState("");

  const dateOptions = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 180 }).map((_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      return date;
    });
  }, []);

  const filteredCities = useMemo(() => {
    return cities.filter((city) =>
      city.toLowerCase().includes(citySearch.trim().toLowerCase())
    );
  }, [citySearch]);

  const fromError = !fromCity ? "Please select a departure city" : undefined;
  const toError = !toCity
    ? "Please select a destination city"
    : fromCity && fromCity === toCity
      ? "Departure and destination cannot be the same"
      : undefined;
  const dateError = !travelDate ? "Please select a travel date" : undefined;

  const canContinue = !fromError && !toError && !dateError;

  const handleSwap = () => {
    if (!fromCity || !toCity) return;
    setFromCity(toCity);
    setToCity(fromCity);
  };

  const handleContinue = () => {
    if (!canContinue || !travelDate) return;
    setRoute(fromCity, toCity, travelDate);
    router.push("/(tabs)/book/agency");
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Sticky Header */}
      <RNView style={{ paddingTop: Math.max(insets.top, 16), backgroundColor: "#f8fafc" }}>
        <View className="px-5 pb-3">
          <BookingStepIndicator currentStep={1} />
          <Text className="mt-4 text-[28px] font-bold text-slate-900">Route & Date</Text>
          <Text className="mt-1 text-[15px] font-medium text-slate-500">
            Pick your departure, destination, and travel date.
          </Text>
        </View>
      </RNView>

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 24) + 80 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-4 rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
          <Text className="mb-2 text-[13px] font-semibold text-slate-500 uppercase tracking-wider">
            Departure
          </Text>
          <Pressable
            className="rounded-2xl border border-slate-200 bg-slate-50 py-4 px-4 active:bg-slate-100"
            onPress={() => setActiveField("from")}
          >
            <Text className={`text-[16px] font-medium ${fromCity ? 'text-slate-900' : 'text-slate-400'}`}>
              {fromCity || "From — Select city"}
            </Text>
          </Pressable>

          <View className="items-end mt-4">
            <Pressable
              className={`rounded-xl bg-indigo-50 py-2.5 px-4 active:bg-indigo-100 ${!(fromCity && toCity) ? 'opacity-50' : ''}`}
              onPress={handleSwap}
              disabled={!(fromCity && toCity)}
            >
              <Text className="text-[13px] font-semibold text-indigo-600">Swap cities</Text>
            </Pressable>
          </View>

          <Text className="mt-2 mb-2 text-[13px] font-semibold text-slate-500 uppercase tracking-wider">
            Destination
          </Text>
          <Pressable
            className="rounded-2xl border border-slate-200 bg-slate-50 py-4 px-4 active:bg-slate-100"
            onPress={() => setActiveField("to")}
          >
            <Text className={`text-[16px] font-medium ${toCity ? 'text-slate-900' : 'text-slate-400'}`}>
              {toCity || "To — Select city"}
            </Text>
          </Pressable>

          <Text className="mt-6 mb-2 text-[13px] font-semibold text-slate-500 uppercase tracking-wider">
            Travel Date
          </Text>
          <Pressable
            className="rounded-2xl border border-slate-200 bg-slate-50 py-4 px-4 active:bg-slate-100"
            onPress={() => setActiveField("date")}
          >
            <Text className={`text-[16px] font-medium ${travelDate ? 'text-slate-900' : 'text-slate-400'}`}>
              {travelDate ? formatDateLabel(travelDate) : "Select travel date"}
            </Text>
          </Pressable>
        </View>

        <Button
          label="Search Agencies"
          onPress={handleContinue}
          disabled={!canContinue}
          className="mt-6"
        />
      </ScrollView>

      {/* Date & City Selection Bottom Sheet */}
      <BottomSheet visible={activeField !== null} onClose={() => setActiveField(null)}>
        <Text className="font-bold text-[20px] text-slate-900 mb-4">
          {activeField === "date"
            ? "Select travel date"
            : activeField === "from"
            ? "Select departure city"
            : "Select destination city"}
        </Text>

        {activeField === "date" ? (
          <RNView style={{ height: 350 }}>
            <FlatList
              data={dateOptions}
              keyExtractor={(item) => item.toISOString()}
              renderItem={({ item }) => {
                const selected = travelDate?.toDateString() === item.toDateString();
                return (
                  <Pressable
                    className={`py-4 px-5 border-b border-slate-100 ${selected ? "bg-indigo-50" : ""}`}
                    onPress={() => {
                      setTravelDate(item);
                      setActiveField(null);
                    }}
                  >
                    <Text className={`text-[16px] font-medium ${selected ? "text-blue-600" : "text-slate-900"}`}>
                      {formatDateLabel(item)}
                    </Text>
                    <Text className="mt-1 text-[13px] text-slate-500">
                      {formatCompactDate(item)}
                    </Text>
                  </Pressable>
                );
              }}
              showsVerticalScrollIndicator={false}
            />
          </RNView>
        ) : (
          <RNView style={{ height: 350 }}>
            <TextInput
              value={citySearch}
              onChangeText={setCitySearch}
              placeholder="Search city"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-4 font-medium text-[15px] text-slate-900"
            />
            <FlatList
              data={filteredCities}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected = item === (activeField === "from" ? fromCity : toCity);
                return (
                  <Pressable
                    onPress={() => {
                      if (activeField === "from") setFromCity(item);
                      else setToCity(item);
                      setCitySearch("");
                      setActiveField(null);
                    }}
                    className={`py-3.5 px-4 mb-2 rounded-xl ${isSelected ? "bg-indigo-50 border border-indigo-100" : "bg-slate-50"}`}
                  >
                    <Text className={`text-[16px] font-medium ${isSelected ? "text-indigo-600" : "text-slate-900"}`}>
                      {item}
                    </Text>
                  </Pressable>
                );
              }}
              showsVerticalScrollIndicator={false}
            />
          </RNView>
        )}
      </BottomSheet>
    </View>
  );
}
