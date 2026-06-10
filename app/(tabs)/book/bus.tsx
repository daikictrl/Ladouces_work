import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBookingStore } from "../../../stores/bookingStore";
import BookingStepIndicator from "./_BookingStepIndicator";
import { Ionicons } from "@expo/vector-icons";

const filterOptions = [
  "All",
  "Morning",
  "Afternoon",
  "Evening",
] as const;

type TimeFilter = (typeof filterOptions)[number];

type BusOption = {
  id: string;
  departure: string;
  arrival: string;
  duration: string;
  seatsAvailable: number;
  price: number;
  busClass: string;
};

const formatCurrency = (value: number) =>
  `${value.toLocaleString()} XAF`;

export default function BookBus() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const fromCity = useBookingStore(
    (state) => state.fromCity,
  );

  const toCity = useBookingStore(
    (state) => state.toCity,
  );

  const selectedAgency = useBookingStore(
    (state) => state.selectedAgency,
  );

  const selectedBus = useBookingStore(
    (state) => state.selectedBus,
  );

  const setSelectedBus = useBookingStore(
    (state) => state.setSelectedBus,
  );

  const [filter, setFilter] =
    useState<TimeFilter>("All");

  const [selectedBusId, setSelectedBusId] =
    useState<string>(selectedBus?.id ?? "");

  useFocusEffect(
    useCallback(() => {
      if (!fromCity || !toCity) {
        router.replace("/(tabs)/book");
      } else if (!selectedAgency) {
        router.replace("/(tabs)/book/agency");
      }
    }, [fromCity, toCity, selectedAgency, router])
  );

  const routeLabel = `${fromCity} → ${toCity}`;

  const busOptions = useMemo<BusOption[]>(() => {
    const basePrice =
      selectedAgency?.startingPrice ?? 3500;

    return [
      {
        id: "b1",
        departure: "06:00",
        arrival: "10:20",
        duration: "4h 20m",
        seatsAvailable: 12,
        price: basePrice + 900,
        busClass: "Standard",
      },
      {
        id: "b2",
        departure: "07:30",
        arrival: "11:40",
        duration: "4h 10m",
        seatsAvailable: 8,
        price: basePrice + 1100,
        busClass: "Express",
      },
      {
        id: "b3",
        departure: "09:15",
        arrival: "13:30",
        duration: "4h 15m",
        seatsAvailable: 4,
        price: basePrice + 1300,
        busClass: "VIP",
      },
      {
        id: "b4",
        departure: "12:00",
        arrival: "16:35",
        duration: "4h 35m",
        seatsAvailable: 0,
        price: basePrice + 700,
        busClass: "Standard",
      },
      {
        id: "b5",
        departure: "14:20",
        arrival: "18:45",
        duration: "4h 25m",
        seatsAvailable: 7,
        price: basePrice + 1000,
        busClass: "Express",
      },
      {
        id: "b6",
        departure: "18:10",
        arrival: "22:30",
        duration: "4h 20m",
        seatsAvailable: 5,
        price: basePrice + 1200,
        busClass: "VIP",
      },
    ];
  }, [selectedAgency]);

  const filteredBuses = useMemo(() => {
    return busOptions.filter((bus) => {
      if (filter === "All") return true;

      const hour = Number(
        bus.departure.split(":")[0],
      );

      if (filter === "Morning") {
        return hour >= 6 && hour < 12;
      }

      if (filter === "Afternoon") {
        return hour >= 12 && hour < 18;
      }

      return hour >= 18 || hour < 6;
    });
  }, [busOptions, filter]);

  const selected = busOptions.find(
    (bus) => bus.id === selectedBusId,
  );

  const handleContinue = () => {
    if (!selected) return;

    setSelectedBus(selected);

    router.push("/(tabs)/book/seats");
  };

  return (
    <View style={styles.screen}>
      {/* Sticky Header */}
      <View style={[styles.stickyHeader, { paddingTop: Math.max(insets.top, 16) }]}>
        {/* Back + Title row */}
        <View style={styles.headerRow}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={18} color="#0f172a" />
          </Pressable>
          <Text style={styles.headerTitle}>Choose Departure</Text>
        </View>

        <BookingStepIndicator currentStep={3} />

        {/* Route + Agency pill */}
        <View style={styles.routeRow}>
          <Text style={styles.routeText}>
            {routeLabel}
          </Text>
          <Text style={styles.agencyText}>
            {selectedAgency?.name}
          </Text>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          {filterOptions.map((option) => (
            <Pressable
              key={option}
              onPress={() => setFilter(option)}
              style={[
                styles.filterChip,
                filter === option && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === option && styles.filterTextActive,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* BUS LIST */}
      <FlatList
        data={filteredBuses}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={styles.busList}
        contentContainerStyle={styles.busListContent}
        renderItem={({ item }) => {
          const isSelected =
            selectedBusId === item.id;

          const isFull =
            item.seatsAvailable === 0;

          return (
            <Pressable
              disabled={isFull}
              onPress={() => {
                if (!isFull) {
                  setSelectedBusId(item.id);
                }
              }}
              style={[
                styles.busCard,

                isSelected &&
                  styles.busCardSelected,

                isFull &&
                  styles.busCardDisabled,
              ]}
            >
              <View style={styles.cardTopRow}>
                <Text style={styles.timeValue}>
                  {item.departure}
                </Text>

                <View
                  style={styles.durationPill}
                >
                  <Text
                    style={
                      styles.durationValue
                    }
                  >
                    {item.duration}
                  </Text>
                </View>

                <Text style={styles.timeValue}>
                  {item.arrival}
                </Text>
              </View>

              <View style={styles.cardMetaRow}>
                <View style={styles.classTag}>
                  <Text
                    style={
                      styles.classTagText
                    }
                  >
                    {item.busClass}
                  </Text>
                </View>

                <View
                  style={styles.seatsBadge}
                >
                  <View
                    style={[
                      styles.seatsDot,
                      {
                        backgroundColor:
                          isFull
                            ? "#dc2626"
                            : "#16a34a",
                      },
                    ]}
                  />

                  <Text
                    style={[
                      styles.seatsText,
                      {
                        color: isFull
                          ? "#dc2626"
                          : "#16a34a",
                      },
                    ]}
                  >
                    {isFull
                      ? "Full"
                      : `${item.seatsAvailable} seats`}
                  </Text>
                </View>
              </View>

              <View
                style={styles.cardDivider}
              />

              <View
                style={styles.cardPriceRow}
              >
                <Text
                  style={styles.priceLabel}
                >
                  Total per seat
                </Text>

                <Text
                  style={styles.priceValue}
                >
                  {formatCurrency(item.price)}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />

      {/* BUTTON */}
      <View style={[styles.bottomButtonWrapper, { bottom: Math.max(insets.bottom, 10) }]}>
        <Pressable
          disabled={!selected}
          onPress={handleContinue}
          style={[
            styles.continueButton,

            (!selected ||
              !selectedBusId) &&
              styles.continueButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.continueButtonText,

              (!selected ||
                !selectedBusId) &&
                styles.continueButtonTextDisabled,
            ]}
          >
            Choose Seats
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  stickyHeader: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  backButton: {
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginRight: 12,
  },

  headerTitle: {
    fontSize: 17,
    fontFamily: "Poppins-Bold",
    color: "#0f172a",
  },

  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
    marginBottom: 10,
  },

  routeText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#0f172a",
  },

  agencyText: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: "#2563eb",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },

  filterScroll: {
    flexGrow: 0,
  },

  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 16,
  },

  filterChip: {
    height: 36,
    paddingHorizontal: 14,
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  filterChipActive: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a",
  },

  filterText: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "#64748b",
  },

  filterTextActive: {
    color: "#ffffff",
  },

  busList: {
    flex: 1,
  },

  busListContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 120,
  },

  busCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  busCardSelected: {
    borderWidth: 2,
    borderColor: "#2563eb",
    backgroundColor: "#fafcff",
  },

  busCardDisabled: {
    opacity: 0.5,
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  timeValue: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: "#0f172a",
  },

  durationPill: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 999,
  },

  durationValue: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "#64748b",
  },

  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  classTag: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  classTagText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#475569",
  },

  seatsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  seatsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  seatsText: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
  },

  cardDivider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 12,
  },

  cardPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },

  priceLabel: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "#94a3b8",
  },

  priceValue: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#2563eb",
  },

  bottomButtonWrapper: {
    position: "absolute",
    left: 16,
    right: 16,
  },

  continueButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: "#2563eb",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 4,
  },

  continueButtonDisabled: {
    backgroundColor: "#cbd5e1",
    shadowOpacity: 0,
    elevation: 0,
  },

  continueButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontFamily: "Poppins-Bold",
  },

  continueButtonTextDisabled: {
    color: "#f1f5f9",
  },
});