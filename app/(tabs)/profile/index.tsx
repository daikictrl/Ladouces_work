import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useClerk, useUser } from "@clerk/expo";
import * as Notifications from "expo-notifications";
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

  // Notifications Diagnostics State
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const [scheduledNotifications, setScheduledNotifications] = useState<any[]>([]);
  const [scheduledCount, setScheduledCount] = useState(0);

  const loadDiagnostics = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
      const list = await Notifications.getAllScheduledNotificationsAsync();
      setScheduledNotifications(list);
      setScheduledCount(list.length);
    } catch (e: any) {
      console.warn("Failed to load diagnostics:", e);
    }
  };

  useEffect(() => {
    if (diagnosticsOpen) {
      loadDiagnostics();
    }
  }, [diagnosticsOpen]);

  const handleSendTestNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Alarm 🔔",
          body: "This is a local travel reminder test from MOVANA!",
          data: { test: true },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2,
        },
      });
      Alert.alert("Success", "Test notification scheduled to trigger in 2 seconds.");
      setTimeout(loadDiagnostics, 500);
    } catch (error: any) {
      Alert.alert("Error", `Failed to schedule test: ${error?.message || error}`);
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      Alert.alert("Success", "All scheduled notifications have been cleared.");
      loadDiagnostics();
    } catch (error: any) {
      Alert.alert("Error", `Failed to clear notifications: ${error?.message || error}`);
    }
  };

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

        <Text className="font-bold text-[12px] tracking-widest text-slate-400 mb-3 ml-2 uppercase mt-6">
          System & Diagnostics
        </Text>
        <MenuItem
          icon="bug-outline"
          label="Notification Debugger"
          subtitle="Test and inspect scheduled alarms"
          iconColor="#6366f1"
          iconBg="bg-indigo-50"
          onPress={() => setDiagnosticsOpen(true)}
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

      {/* Diagnostics Bottom Sheet */}
      <BottomSheet visible={diagnosticsOpen} onClose={() => setDiagnosticsOpen(false)}>
        <View className="flex-row justify-between items-center mb-6">
          <Text className="font-bold text-[20px] text-slate-900">Notification Debugger</Text>
          <Pressable onPress={() => setDiagnosticsOpen(false)} className="h-8 w-8 items-center justify-center bg-slate-100 rounded-full">
            <Ionicons name="close" size={20} color="#64748b" />
          </Pressable>
        </View>

        <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
          {/* Permission Status */}
          <View className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4">
            <Text className="font-bold text-slate-700 text-[14px] mb-1">Permission Status</Text>
            <Text className={`font-semibold text-[16px] ${permissionStatus === "granted" ? "text-emerald-600" : "text-red-500"}`}>
              {permissionStatus ? permissionStatus.toUpperCase() : "LOADING..."}
            </Text>
          </View>

          {/* Test Buttons */}
          <View className="flex-row gap-3 mb-4">
            <Button
              label="Test 2s Alert"
              onPress={handleSendTestNotification}
              className="flex-1"
            />
            <Button
              label="Clear All Alarms"
              variant="secondary"
              textClassName="text-red-500"
              onPress={handleClearAllNotifications}
              className="flex-1"
            />
          </View>

          {/* Scheduled List */}
          <Text className="font-bold text-slate-700 text-[14px] mb-2 ml-1">
            Active Scheduled Alarms ({scheduledCount})
          </Text>
          
          {scheduledNotifications.length > 0 ? (
            scheduledNotifications.map((notif: any) => {
              const trigger = notif.trigger;
              let triggerDesc = "Unknown trigger";
              if (trigger && typeof trigger === "object") {
                if (trigger.seconds !== undefined) {
                  triggerDesc = `In ${trigger.seconds}s (${trigger.repeats ? "Repeating" : "One-shot"})`;
                } else if (trigger.type === "timeInterval" || trigger.type === "timeInterval") {
                  triggerDesc = `In ${trigger.seconds}s`;
                }
              }
              return (
                <View key={notif.identifier} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-2">
                  <Text className="font-bold text-slate-800 text-[14px]">{notif.content.title || "No Title"}</Text>
                  <Text className="text-[13px] text-slate-505 text-slate-500 mt-0.5">{notif.content.body || "No Body"}</Text>
                  <Text className="text-[11px] font-semibold text-indigo-650 text-indigo-600 mt-1">{triggerDesc}</Text>
                  <Text className="text-[9px] text-slate-400 mt-0.5">ID: {notif.identifier}</Text>
                </View>
              );
            })
          ) : (
            <View className="items-center py-6 bg-slate-50 rounded-2xl border border-slate-100">
              <Ionicons name="notifications-off-outline" size={24} color="#94a3b8" />
              <Text className="text-[13px] font-bold text-slate-400 mt-2">
                No active notifications scheduled
              </Text>
            </View>
          )}
        </ScrollView>
      </BottomSheet>
    </View>
  );
}
