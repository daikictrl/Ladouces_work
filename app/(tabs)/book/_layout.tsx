import { Stack } from "expo-router";

export default function BookLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="agency" />
      <Stack.Screen name="bus" />
      <Stack.Screen name="seats" />
      <Stack.Screen name="payment" options={{ presentation: "modal" }} />
      <Stack.Screen name="success" options={{ presentation: "modal" }} />
      <Stack.Screen name="reminder-setup" />
    </Stack>
  );
}
