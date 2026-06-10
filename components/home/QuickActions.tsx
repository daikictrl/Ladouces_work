import { View, Text, Pressable } from "../tw";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const actions = [
  { label: "Book a Trip", icon: "search" as const, tab: "/(tabs)/book", color: "text-blue-600", bg: "bg-blue-50" },
  { label: "My Tickets", icon: "ticket-outline" as const, tab: "/(tabs)/tickets", color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Packing List", icon: "checkmark-circle-outline" as const, tab: "/(tabs)/reminders", color: "text-emerald-600", bg: "bg-emerald-50" },
];

export default function QuickActions() {
  const router = useRouter();

  return (
    <View className="mx-5 mb-5 rounded-3xl bg-white px-6 py-6 shadow-xl shadow-slate-200/50 border border-slate-100">
      <Text className="mb-5 font-bold text-[17px] text-slate-800">
        Quick Actions
      </Text>
      <View className="flex-row gap-3">
        {actions.map((action) => (
          <Pressable
            key={action.label}
            className={`flex-1 items-center justify-center rounded-2xl ${action.bg} py-4 px-2 active:opacity-70`}
            onPress={() => router.push(action.tab as any)}
          >
            <Ionicons name={action.icon} size={24} color={action.color.replace('text-', '').replace('600', '500')} />
            <Text className={`mt-2.5 font-semibold text-[12px] ${action.color} text-center`}>
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
