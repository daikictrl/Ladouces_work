import React from "react";
import { ActivityIndicator } from "react-native";
import { Pressable, Text } from "../tw";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  textClassName?: string;
}

export default function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  className = "",
  textClassName = "",
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          bg: "bg-blue-600 active:bg-blue-700",
          text: "text-white",
        };
      case "secondary":
        return {
          bg: "bg-slate-100 active:bg-slate-200",
          text: "text-slate-700",
        };
      case "danger":
        return {
          bg: "bg-red-500 active:bg-red-600",
          text: "text-white",
        };
      case "ghost":
        return {
          bg: "bg-transparent active:bg-slate-100",
          text: "text-blue-600",
        };
    }
  };

  const styles = getVariantStyles();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`flex-row items-center justify-center rounded-2xl py-4 px-6 ${styles.bg} ${
        isDisabled ? "opacity-50" : "opacity-100"
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "secondary" || variant === "ghost" ? "#2563eb" : "#ffffff"} />
      ) : (
        <Text className={`font-semibold text-[16px] ${styles.text} ${textClassName}`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
