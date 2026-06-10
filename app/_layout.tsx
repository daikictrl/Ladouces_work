import "../global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import Constants from "expo-constants";
import { useEffect } from "react";
import { LogBox, View, Text } from "react-native";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "../utils/cache";
import * as Notifications from "expo-notifications";
import { setupNotificationHandler } from "../services/notificationService";


// Ignore deprecation and environment-specific alerts from third-party libraries
LogBox.ignoreLogs([
  "SafeAreaView has been deprecated",
  "ProgressBarAndroid has been extracted",
  "Clipboard has been extracted",
  "PushNotificationIOS has been extracted",
  "expo-notifications: Android Push notifications",
]);
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore error if it's already hidden
});

// Suppress specific warnings in the terminal
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === "string" && args[0].includes("SafeAreaView has been deprecated")) {
    return;
  }
  originalWarn(...args);
};

// Suppress specific errors in development (such as expo-notifications push warning in Expo Go)
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === "string" &&
    args[0].includes("Android Push notifications (remote notifications) functionality")
  ) {
    return;
  }
  originalError(...args);
};

const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    setupNotificationHandler();

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data && data.reminderId) {
          router.push(`/(tabs)/reminders/${data.reminderId}` as any);
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = (segments[0] as string) === "(auth)";
    const inTabsGroup = (segments[0] as string) === "(tabs)";
    const isOAuthCallback = segments.includes("oauth-callback" as never);

    // Don't redirect while on the OAuth callback screen — let it finish processing
    if (isOAuthCallback) return;

    if (isSignedIn && !inTabsGroup) {
      router.replace("/(tabs)/home" as any);
    } else if (!isSignedIn && !inAuthGroup) {
      router.replace("/(auth)/onboarding" as any);
    }
  }, [isSignedIn, segments, isLoaded]);

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {
        // Ignore if already hidden
      });
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  const publishableKey =
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    (Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Text style={{ fontSize: 18, textAlign: "center", color: "#0f172a" }}>
          Missing Clerk publishable key. Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your
          .env file and restart the project.
        </Text>
      </View>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <InitialLayout />
    </ClerkProvider>
  );
}
