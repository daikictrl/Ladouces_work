import * as WebBrowser from "expo-web-browser";
import { ActivityIndicator, View, Text } from "react-native";

// CRITICAL: Must be called at TOP LEVEL, not inside a hook or effect.
// This completes the OAuth redirect back into the app.
WebBrowser.maybeCompleteAuthSession();

export default function OAuthCallback() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8fafc",
      }}
    >
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text style={{ marginTop: 16, fontSize: 14, color: "#64748b" }}>
        Completing sign in...
      </Text>
    </View>
  );
}
