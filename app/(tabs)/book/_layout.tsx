import { Stack, useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import { useBookingStore } from "../../../stores/bookingStore";
import { CommonActions, useNavigation } from "@react-navigation/native";

export default function BookLayout() {
  const navigation = useNavigation();
  const hasInitialized = useRef(false);

  // Safety net: when the Book tab regains focus after a completed booking,
  // ensure any stale screens (success, payment, etc.) are cleared from the stack.
  useFocusEffect(
    useCallback(() => {
      // Skip the very first render to avoid resetting on app launch
      if (!hasInitialized.current) {
        hasInitialized.current = true;
        return;
      }

      const state = useBookingStore.getState();
      if (!state.fromCity && !state.toCity && !state.travelDate) {
        // Booking session is cleared — reset this stack to only the index screen
        navigation.dispatch((navState) => {
          // navState here is the Tab navigator's state; find the book tab route
          const bookRoute = navState.routes.find(
            (r: any) => r.name === "book"
          );
          // Only reset if the book stack has more than 1 screen stacked
          if (bookRoute?.state && (bookRoute.state as any).index > 0) {
            const bookState = bookRoute.state as any;
            const currentRoute = bookState.routes[bookState.index];
            if (currentRoute && currentRoute.name === "reminder-setup") {
              return CommonActions.reset(navState);
            }

            return CommonActions.reset({
              ...navState,
              routes: navState.routes.map((r: any) =>
                r.name === "book"
                  ? { ...r, state: { index: 0, routes: [{ name: "index" }] } }
                  : r
              ),
            });
          }
          // No action needed — return a noop navigation action
          return CommonActions.reset(navState);
        });
      }
    }, [navigation])
  );

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
