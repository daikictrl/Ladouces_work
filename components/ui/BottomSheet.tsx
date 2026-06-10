import React from "react";
import { Modal, KeyboardAvoidingView, Platform, StyleSheet, Pressable } from "react-native";
import { View } from "../tw";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <View className="flex-1 justify-end bg-slate-900/40">
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          <View
            className="rounded-t-[32px] bg-white pt-6 px-6"
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
          >
            {/* Handle bar */}
            <View className="absolute left-0 right-0 top-3 items-center">
              <View className="h-1.5 w-12 rounded-full bg-slate-200" />
            </View>
            
            {children}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
});
