import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#ffffff" },
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: "Poppins-Bold", fontSize: 17 },
        headerBackTitle: "",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
      <Stack.Screen name="history" options={{ title: "Travel History" }} />
      <Stack.Screen name="devices" options={{ title: "Connected Devices" }} />
    </Stack>
  );
}
