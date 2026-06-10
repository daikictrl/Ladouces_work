import { View, ActivityIndicator, Text } from "react-native";
import { useAuth } from "@clerk/expo";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
      <ActivityIndicator size="large" color="#0f172a" />
      <Text style={{ marginTop: 16, fontSize: 14, color: "#64748b" }}>
        {isLoaded ? (isSignedIn ? "Signed in, loading app..." : "Not signed in, loading auth...") : "Initializing Clerk..."}
      </Text>
    </View>
  );
}
