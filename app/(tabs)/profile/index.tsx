import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useClerk, useUser } from "@clerk/expo";
import { useTicketStore } from "../../../stores/ticketStore";
import { View, Text, Pressable, ScrollView, TextInput } from "../../../components/tw";
import BottomSheet from "../../../components/ui/BottomSheet";
import Button from "../../../components/ui/Button";

function MenuItem({
  icon,
  label,
  onPress,
  subtitle,
  iconColor,
  iconBg,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between rounded-2xl bg-white px-5 py-4 mb-3 shadow-sm shadow-slate-100 border border-slate-100 active:bg-slate-50"
    >
      <View className="flex-row items-center">
        <View className={`h-11 w-11 rounded-xl items-center justify-center mr-4 ${iconBg}`}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View>
          <Text className="font-semibold text-[16px] text-slate-800">{label}</Text>
          {subtitle && (
            <Text className="font-medium text-[13px] text-slate-400 mt-0.5">{subtitle}</Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
    </Pressable>
  );
}

export default function ProfileIndex() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useClerk();
  const { isLoaded, user } = useUser();
  const setPendingFilter = useTicketStore((state) => state.setPendingFilter);
  const [editOpen, setEditOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
    }
  }, [user]);

  const displayName = useMemo(() => {
    if (!user) return "MOVANA Traveler";
    return user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ") || "MOVANA Traveler";
  }, [user]);

  const initials = useMemo(() => {
    if (!user || !displayName) return "MV";
    return displayName
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  }, [displayName, user]);

  const handleEdit = () => setEditOpen(true);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await user.update({ firstName: firstName.trim(), lastName: lastName.trim() });
      setEditOpen(false);
    } catch (error) {
      Alert.alert("Update failed", "Unable to update your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const confirmSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      "Delete account",
      "This will remove your profile and all saved settings from this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await user?.delete();
            } catch {
              Alert.alert("Delete failed", "We couldn't delete your account. Please try again later.");
            }
          },
        },
      ]
    );
  };

  if (!isLoaded) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        style={{ paddingTop: Math.max(insets.top, 16) }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 24) + 80 }}
      >
        <View className="flex-row items-center justify-between mb-5 mt-2">
          <Text className="font-bold text-[28px] text-slate-900">Profile</Text>
          <Pressable
            onPress={() => setAccountMenuOpen(true)}
            className="h-11 w-11 rounded-2xl bg-white items-center justify-center shadow-sm shadow-slate-100 border border-slate-100 active:bg-slate-50"
          >
            <Ionicons name="settings-outline" size={22} color="#475569" />
          </Pressable>
        </View>

        <View className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 mb-6">
          <View className="flex-row items-center gap-5">
            <View className="h-[84px] w-[84px] rounded-[32px] bg-blue-50 items-center justify-center border border-blue-100">
              <Text className="text-blue-600 font-bold text-[28px]">{initials}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-[22px] text-slate-900 mb-1">{displayName}</Text>
              <Text className="font-medium text-[14px] text-slate-500 mb-3">
                {user?.emailAddresses?.[0]?.emailAddress ?? "No email available"}
              </Text>
              <Pressable
                onPress={handleEdit}
                className="bg-blue-600 rounded-xl py-2.5 px-4 self-start active:bg-blue-700"
              >
                <Text className="text-white font-semibold text-[13px]">Edit Profile</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Text className="font-bold text-[12px] tracking-widest text-slate-400 mb-3 ml-2 uppercase">
          My Account
        </Text>
        <MenuItem
          icon="ticket-outline"
          label="My Tickets"
          subtitle="View all tickets"
          iconColor="#8b5cf6"
          iconBg="bg-purple-50"
          onPress={() => router.push("/(tabs)/tickets")}
        />
        <MenuItem
          icon="checkmark-circle-outline"
          label="My Reminders"
          subtitle="Manage packing lists"
          iconColor="#10b981"
          iconBg="bg-emerald-50"
          onPress={() => router.push("/(tabs)/reminders")}
        />
        <MenuItem
          icon="time-outline"
          label="Travel History"
          subtitle="Past trips summary"
          iconColor="#f59e0b"
          iconBg="bg-amber-50"
          onPress={() => {
            setPendingFilter("past");
            router.push("/(tabs)/tickets");
          }}
        />
      </ScrollView>

      {/* Edit Profile Bottom Sheet */}
      <BottomSheet visible={editOpen} onClose={() => setEditOpen(false)}>
        <View className="flex-row justify-between items-center mb-6">
          <Text className="font-bold text-[20px] text-slate-900">Edit Profile</Text>
          <Pressable onPress={() => setEditOpen(false)} className="h-8 w-8 items-center justify-center bg-slate-100 rounded-full">
            <Ionicons name="close" size={20} color="#64748b" />
          </Pressable>
        </View>

        <Text className="font-semibold text-[13px] text-slate-700 mb-2 ml-1">First Name</Text>
        <TextInput
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First name"
          placeholderTextColor="#94a3b8"
          className="bg-slate-50 border border-slate-200 rounded-2xl p-4 font-medium text-[15px] text-slate-900 mb-4"
        />

        <Text className="font-semibold text-[13px] text-slate-700 mb-2 ml-1">Last Name</Text>
        <TextInput
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last name"
          placeholderTextColor="#94a3b8"
          className="bg-slate-50 border border-slate-200 rounded-2xl p-4 font-medium text-[15px] text-slate-900 mb-6"
        />

        <Button
          label="Save Changes"
          onPress={handleSaveProfile}
          loading={saving}
          className="mb-2"
        />
      </BottomSheet>

      {/* Account Menu Bottom Sheet */}
      <BottomSheet visible={accountMenuOpen} onClose={() => setAccountMenuOpen(false)}>
        <View className="flex-row justify-between items-center mb-6">
          <Text className="font-bold text-[20px] text-slate-900">Account Settings</Text>
          <Pressable onPress={() => setAccountMenuOpen(false)} className="h-8 w-8 items-center justify-center bg-slate-100 rounded-full">
            <Ionicons name="close" size={20} color="#64748b" />
          </Pressable>
        </View>

        <Button
          label="Sign Out"
          onPress={() => {
            setAccountMenuOpen(false);
            confirmSignOut();
          }}
          className="mb-3"
        />

        <Button
          label="Delete Account"
          variant="secondary"
          textClassName="text-red-500"
          onPress={() => {
            setAccountMenuOpen(false);
            confirmDeleteAccount();
          }}
          className="mb-2"
        />
      </BottomSheet>
    </View>
  );
}
