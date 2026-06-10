import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Image, ScrollView, View as RNView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, Pressable } from "../../../components/tw";
import { useBookingStore } from "../../../stores/bookingStore";
import BookingStepIndicator from "./_BookingStepIndicator";
import Button from "../../../components/ui/Button";
import { Ionicons } from "@expo/vector-icons";

type PaymentMethod = {
  id: string;
  name: string;
  logo: string;
  accent: string;
};

const paymentMethods: PaymentMethod[] = [
  {
    id: "orange",
    name: "Orange Money",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/Orange_logo.svg",
    accent: "#ff7900",
  },
  {
    id: "mtn",
    name: "MTN Mobile Money",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/New-mtn-logo.jpg",
    accent: "#ffcc00",
  },
  {
    id: "paypal",
    name: "PayPal",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg",
    accent: "#003087",
  },
  {
    id: "visa",
    name: "Visa",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png",
    accent: "#1a1f71",
  },
];

export default function PaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const fromCity = useBookingStore((state) => state.fromCity);
  const toCity = useBookingStore((state) => state.toCity);
  const selectedAgency = useBookingStore((state) => state.selectedAgency);
  const selectedBus = useBookingStore((state) => state.selectedBus);
  const selectedSeats = useBookingStore((state) => state.selectedSeats);
  const totalPrice = useBookingStore((state) => state.totalPrice);
  const setPaymentMethod = useBookingStore((state) => state.setPaymentMethod);

  const [selectedMethod, setSelectedMethod] = useState<string>("orange");

  const routeLabel = useMemo(() => `${fromCity} → ${toCity}`, [fromCity, toCity]);

  const handlePayment = () => {
    const method = paymentMethods.find((m) => m.id === selectedMethod);
    setPaymentMethod(method?.name || selectedMethod);
    router.push("/(tabs)/book/success");
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
            <Text className="text-[17px] font-bold text-slate-900">Payment</Text>
          </View>
          <BookingStepIndicator currentStep={5} />
        </View>
      </RNView>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 150 }}
      >
        {/* Summary Card */}
        <View className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl shadow-slate-200/50 mb-8">
          <Text className="text-[20px] font-bold text-slate-900 mb-1">{routeLabel}</Text>
          <Text className="text-[15px] font-medium text-blue-600 mb-4">{selectedAgency?.name}</Text>

          <View className="h-[1px] bg-slate-100 w-full mb-4" />

          <View className="flex-row justify-between mb-3">
            <Text className="text-[14px] font-medium text-slate-500">Departure</Text>
            <Text className="text-[14px] font-semibold text-slate-900">{selectedBus?.departure}</Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className="text-[14px] font-medium text-slate-500">Bus Type</Text>
            <Text className="text-[14px] font-semibold text-slate-900">{selectedBus?.busClass}</Text>
          </View>

          <View className="flex-row justify-between mb-4">
            <Text className="text-[14px] font-medium text-slate-500">Seats</Text>
            <Text className="text-[14px] font-semibold text-slate-900">{selectedSeats.join(", ")}</Text>
          </View>

          <View className="h-[1px] bg-slate-100 w-full mb-4 border-dashed border-b border-slate-200" />

          <View className="flex-row justify-between items-center">
            <Text className="text-[15px] font-semibold text-slate-900">Total Amount</Text>
            <Text className="text-[24px] font-bold text-blue-600">{totalPrice.toLocaleString()} XAF</Text>
          </View>
        </View>

        <Text className="text-[17px] font-bold text-slate-900 mb-4">Payment Method</Text>

        <View className="mb-8">
          {paymentMethods.map((method) => {
            const isSelected = selectedMethod === method.id;
            return (
              <Pressable
                key={method.id}
                onPress={() => setSelectedMethod(method.id)}
                className={`will-change-variable flex-row items-center justify-between bg-white rounded-2xl p-4 mb-3 border-2 ${
                  isSelected ? 'border-blue-500 shadow-md shadow-blue-500/10' : 'border-slate-100'
                }`}
                style={isSelected ? { borderColor: method.accent } : {}}
              >
                <View className="flex-row items-center">
                  <View className="bg-white rounded-xl h-11 w-11 items-center justify-center mr-4 border border-slate-100 shadow-sm">
                    <Image source={{ uri: method.logo }} style={{ width: 28, height: 28 }} resizeMode="contain" />
                  </View>
                  <Text className="text-[16px] font-semibold text-slate-900">{method.name}</Text>
                </View>
                <View className={`h-6 w-6 rounded-full border-2 items-center justify-center ${isSelected ? '' : 'border-slate-300'}`} style={isSelected ? { borderColor: method.accent } : {}}>
                  {isSelected && <View className="h-3 w-3 rounded-full" style={{ backgroundColor: method.accent }} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-4">
          <Text className="text-[15px] font-bold text-emerald-700 mb-1">Secure Payment</Text>
          <Text className="text-[13px] font-medium text-emerald-600/80 leading-relaxed">
            Your payment information is encrypted and securely processed.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-5 pt-4 flex-row items-center justify-between shadow-2xl" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <View className="flex-1">
          <Text className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Amount
          </Text>
          <Text className="text-[22px] font-bold text-slate-900">{totalPrice.toLocaleString()} XAF</Text>
        </View>
        <View className="w-40">
          <Button
            label="Pay Now"
            onPress={handlePayment}
          />
        </View>
      </View>
    </View>
  );
}