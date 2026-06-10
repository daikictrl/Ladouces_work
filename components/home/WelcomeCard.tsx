import { View, Text } from "../tw";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";

export default function WelcomeCard() {
  return (
    <View className="mx-5 mb-5 rounded-3xl shadow-xl shadow-blue-500/20 bg-white">
      <LinearGradient
        colors={["#2563eb", "#6366f1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 24, overflow: "hidden" }}
      >
        <View className="flex-row items-center justify-between px-6 py-7">
          <View className="flex-1 pr-4">
            <Text className="font-bold text-[24px] leading-tight text-white mb-1.5">
              Welcome to Movana
            </Text>
            <Text className="font-medium text-[15px] text-blue-100">
              Ready for your next adventure?
            </Text>
          </View>
          <View className="h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30">
            <Image
              source={require("../../assets/images/movana logo.jpeg")}
              style={{ width: 44, height: 44, borderRadius: 22 }}
              contentFit="cover"
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
