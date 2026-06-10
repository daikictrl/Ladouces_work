import { View, Text, TouchableOpacity, Image, MotiView, MotiText } from "../../components/tw";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function Onboarding() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background relative items-center justify-center overflow-hidden">
      {/* Background Glowing Effect */}
      <View className="absolute inset-0 items-center justify-center">
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{
            type: "timing",
            duration: 2000,
            loop: true,
          }}
          className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-40"
        >
          <LinearGradient
            colors={["rgba(59, 130, 246, 0.4)", "rgba(168, 85, 247, 0.4)", "transparent"]}
            className="w-full h-full rounded-full"
            style={{ filter: "blur(50px)" }}
          />
        </MotiView>
      </View>

      {/* Main Content */}
      <View className="z-10 items-center px-8 w-full">
        {/* Animated Logo */}
        <MotiView
          from={{ opacity: 0, scale: 0.5, translateY: 50 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{
            type: "spring",
            duration: 1500,
            delay: 300,
          }}
          className="mb-10 items-center justify-center"
        >
          <Image
            source={require("../../assets/images/movana logo.jpeg")}
            className="w-32 h-32 rounded-3xl"
            contentFit="cover"
          />
        </MotiView>

        {/* Animated Tagline */}
        <MotiText
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: "timing",
            duration: 1000,
            delay: 1000,
          }}
          className="text-3xl font-heading text-primary text-center"
        >
          MOVANA
        </MotiText>
        
        <MotiText
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: "timing",
            duration: 1000,
            delay: 1200,
          }}
          className="mt-6 text-xl font-medium text-text text-center leading-8"
        >
          Remember More.{"\n"}Travel Smarter.{"\n"}Live Better.
        </MotiText>
      </View>

      {/* Action Button */}
      <MotiView
        from={{ opacity: 0, translateY: 50 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: "spring",
          duration: 1000,
          delay: 1800,
        }}
        className="absolute bottom-16 w-full px-8 z-10"
      >
        <TouchableOpacity
          onPress={() => router.push("/login" as any)}
          activeOpacity={0.8}
          className="w-full bg-primary py-4 rounded-2xl items-center shadow-lg"
        >
          <Text className="text-white font-semibold text-lg">Get Started</Text>
        </TouchableOpacity>
      </MotiView>
    </View>
  );
}
