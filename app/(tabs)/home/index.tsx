import { ScrollView } from "react-native";
import { View } from "../../../components/tw";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import WelcomeCard from "../../../components/home/WelcomeCard";
import UpcomingTripCard from "../../../components/home/UpcomingTripCard";
import ReminderCountdown from "../../../components/home/ReminderCountdown";
import ReminderPreview from "../../../components/home/ReminderPreview";
import QuickActions from "../../../components/home/QuickActions";

export default function HomeIndex() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, 16) + 10,
          paddingBottom: Math.max(insets.bottom, 24) + 90,
        }}
      >
        <WelcomeCard />
        <ReminderCountdown />
        <UpcomingTripCard />
        <ReminderPreview />
        <QuickActions />
      </ScrollView>
    </View>
  );
}
