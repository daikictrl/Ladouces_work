import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function TripDetail() {
  const { id } = useLocalSearchParams();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 18, fontFamily: "Poppins-Medium" }}>Trip Detail: {id}</Text>
    </View>
  );
}
