import React, { useState, useRef, useEffect } from "react";
import { Modal, KeyboardAvoidingView, Platform, Keyboard, TextInput, ActivityIndicator } from "react-native";
import { View, Text, TouchableOpacity } from "./tw";
import { normalizeVerificationCode } from "../utils/auth-session";

interface VerificationModalProps {
  visible: boolean;
  onClose: () => void;
  email: string;
  onVerify: (code: string) => void;
  isLoading?: boolean;
  error?: string;
}

export default function VerificationModal({ visible, onClose, email, onVerify, isLoading, error }: VerificationModalProps) {
  const [code, setCode] = useState("");
  const inputRef = useRef<any>(null);
  const hasSubmittedRef = useRef(false);
  const CODE_LENGTH = 6;

  useEffect(() => {
    if (visible) {
      setCode("");
      hasSubmittedRef.current = false;
    }
  }, [visible]);

  const handleCodeChange = (text: string) => {
    const nextCode = normalizeVerificationCode(text, CODE_LENGTH);
    setCode(nextCode);

    if (nextCode.length < CODE_LENGTH) {
      hasSubmittedRef.current = false;
      return;
    }

    if (!hasSubmittedRef.current && !isLoading) {
      hasSubmittedRef.current = true;
      Keyboard.dismiss();
      onVerify(nextCode);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} onShow={() => inputRef.current?.focus()}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 24 }}
      >
        <View className="bg-surface rounded-3xl p-8 items-center shadow-2xl w-full">
          <Text className="text-2xl font-heading text-text mb-2 text-center">Verify your email</Text>
          <Text className="text-base text-gray-500 mb-8 text-center leading-6">
            {"We've sent a 6-digit verification code to"}{"\n"}
            <Text className="font-semibold text-text">{email || "your email"}</Text>
          </Text>

          <TouchableOpacity
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}
            className="flex-row justify-center w-full space-x-3 mb-6"
          >
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={handleCodeChange}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              autoFocus
              editable={!isLoading}
              contextMenuHidden
              textContentType="oneTimeCode"
              importantForAutofill="no"
              showSoftInputOnFocus={true}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 56,
                opacity: 0.02,
                zIndex: 10,
              }}
            />

            {[...Array(CODE_LENGTH)].map((_, index) => {
              const digit = code[index] || "";
              const isFocused = code.length === index;

              return (
                <View
                  key={index}
                  className={`w-12 h-14 rounded-xl border-2 items-center justify-center ${
                    isFocused ? "border-primary bg-primary/5" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <Text className="text-2xl font-semibold text-text">{digit}</Text>
                </View>
              );
            })}
          </TouchableOpacity>

          {error ? (
            <Text className="text-red-500 mb-4 text-center">{error}</Text>
          ) : null}

          {isLoading ? (
            <ActivityIndicator color="#0a7ea4" className="mb-4" />
          ) : null}

          <TouchableOpacity
            onPress={() => {
              Keyboard.dismiss();
              onClose();
            }}
            className="py-4 w-full items-center"
          >
            <Text className="text-gray-500 font-medium">Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
