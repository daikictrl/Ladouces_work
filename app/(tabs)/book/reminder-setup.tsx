import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  View as RNView,
  Switch,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StackActions, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, Pressable, TextInput } from "../../../components/tw";
import { Ionicons } from "@expo/vector-icons";
import { useTicketStore } from "../../../stores/ticketStore";
import { useReminderStore } from "../../../stores/reminderStore";
import { parseLocalDate } from "../../../utils/date";
import {
  SUGGESTED_TRAVEL_ITEMS,
  ITEM_ICONS,
} from "../../../constants/reminderDefaults";
import { requestPermissions } from "../../../services/notificationService";
import Button from "../../../components/ui/Button";
import type { ReminderItem, AlarmTime } from "../../../types/reminder";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function ReminderSetupScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { ticketId } = useLocalSearchParams<{ ticketId: string }>();

  // Get the ticket data
  const ticket = useTicketStore((s) =>
    s.tickets.find((t) => t.ticketId === ticketId)
  );
  const addReminder = useReminderStore((s) => s.addReminder);
  const scheduleNotifications = useReminderStore(
    (s) => s.scheduleNotifications
  );

  // Local state for building the reminder checklist items
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    new Set(["passport", "charger", "cash"])
  );
  const [customItems, setCustomItems] = useState<
    { id: string; text: string }[]
  >([]);
  const [customInput, setCustomInput] = useState("");

  // Alarm clock states
  const [alarms, setAlarms] = useState<AlarmTime[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const [saving, setSaving] = useState(false);

  // Set default alarm on mount once ticket is loaded
  useEffect(() => {
    if (!ticket) return;

    // Parse departure date
    const departureDate = parseLocalDate(ticket.travelDate);
    const timeParts = ticket.departureTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (timeParts) {
      let hours = parseInt(timeParts[1], 10);
      const minutes = parseInt(timeParts[2], 10);
      const ampm = timeParts[3];
      if (ampm) {
        if (ampm.toUpperCase() === "PM" && hours !== 12) hours += 12;
        if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;
      }
      departureDate.setHours(hours, minutes, 0, 0);
    }

    const departureTimestamp = departureDate.getTime();
    // Default alarm: 2 minutes before departure (requested for simulation testing)
    const triggerTimestamp = departureTimestamp - 2 * 60 * 1000;

    const formattedTrigger = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(triggerTimestamp));

    setAlarms([
      {
        id: `alarm-default`,
        timestamp: triggerTimestamp,
        label: `Default: 2m before (${formattedTrigger})`,
        enabled: true,
      },
    ]);
  }, [ticket]);

  const toggleItem = useCallback((itemId: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  const addCustom = useCallback(() => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    setCustomItems((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, text: trimmed },
    ]);
    setCustomInput("");
  }, [customInput]);

  const removeCustom = useCallback((id: string) => {
    setCustomItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toggleAlarm = useCallback((alarmId: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === alarmId ? { ...a, enabled: !a.enabled } : a))
    );
  }, []);

  const deleteAlarm = useCallback((alarmId: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== alarmId));
  }, []);

  const getPickerDate = () => {
    if (!ticket) return new Date();
    const tDate = parseLocalDate(ticket.travelDate);
    if (tDate.getTime() < Date.now()) {
      return new Date();
    }
    return tDate;
  };

  const getPickerMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const getPickerMaxDate = () => {
    if (!ticket) return undefined;
    const maxDate = parseLocalDate(ticket.travelDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (maxDate < today) {
      return today;
    }
    return maxDate;
  };

  const handleOpenPicker = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === "dismissed") {
      setTempDate(null);
      return;
    }
    if (selectedDate) {
      setTempDate(selectedDate);
      setShowTimePicker(true);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (event.type === "dismissed" || !tempDate) {
      setTempDate(null);
      return;
    }
    if (selectedTime) {
      const finalDateTime = new Date(tempDate);
      finalDateTime.setHours(selectedTime.getHours());
      finalDateTime.setMinutes(selectedTime.getMinutes());
      finalDateTime.setSeconds(0);
      finalDateTime.setMilliseconds(0);

      const timestamp = finalDateTime.getTime();

      // Check if alarm time is in the future
      if (timestamp <= Date.now()) {
        Alert.alert("Invalid Time", "The reminder alarm must be set to a future time.");
        setTempDate(null);
        return;
      }

      // Check if alarm is before departure
      if (ticket) {
        const departureDate = parseLocalDate(ticket.travelDate);
        const timeParts = ticket.departureTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (timeParts) {
          let hours = parseInt(timeParts[1], 10);
          const minutes = parseInt(timeParts[2], 10);
          const ampm = timeParts[3];
          if (ampm) {
            if (ampm.toUpperCase() === "PM" && hours !== 12) hours += 12;
            if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;
          }
          departureDate.setHours(hours, minutes, 0, 0);
        }

        if (timestamp >= departureDate.getTime()) {
          Alert.alert("Invalid Time", "The reminder alarm must be set before the departure time.");
          setTempDate(null);
          return;
        }
      }

      const formattedLabel = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(finalDateTime);

      setAlarms((prev) => [
        ...prev,
        {
          id: `alarm-${Date.now()}`,
          timestamp,
          label: formattedLabel,
          enabled: true,
        },
      ]);
    }
    setTempDate(null);
  };

  const totalItems = useMemo(
    () => selectedItemIds.size + customItems.length,
    [selectedItemIds, customItems]
  );

  const enabledAlarmsCount = useMemo(
    () => alarms.filter((a) => a.enabled).length,
    [alarms]
  );

  const handleSave = async () => {
    if (!ticket) return;
    setSaving(true);

    try {
      // Request permissions if any alarms are enabled
      let permissionGranted = true;
      if (enabledAlarmsCount > 0) {
        permissionGranted = await requestPermissions();
        if (!permissionGranted) {
          Alert.alert(
            "Notifications Disabled",
            "Your checklist has been saved, but alarms won't fire. You can grant notifications permission later in Settings.",
            [{ text: "OK" }]
          );
        }
      }

      // Build selected items list
      const selectedItems: ReminderItem[] = SUGGESTED_TRAVEL_ITEMS.filter(
        (item) => selectedItemIds.has(item.id)
      ).map((item) => ({
        ...item,
        completed: false,
      }));

      // Build custom items list
      const customReminderItems: ReminderItem[] = customItems.map(
        (item) => ({
          id: item.id,
          text: item.text,
          completed: false,
          isCustom: true,
        })
      );

      const reminderId = `rem-${Date.now()}`;

      const newReminder = {
        reminderId,
        tripId: ticket.ticketId,
        from: ticket.from,
        destination: ticket.to,
        departureTime: ticket.departureTime,
        travelDate: ticket.travelDate,
        agencyName: ticket.agencyName,
        selectedItems,
        customItems: customReminderItems,
        alarms: permissionGranted ? alarms : alarms.map(a => ({ ...a, enabled: false })),
        scheduledNotificationIds: [],
        createdAt: new Date().toISOString(),
      };

      addReminder(newReminder);

      // Schedule notifications if permission granted & alarm active
      if (permissionGranted && enabledAlarmsCount > 0) {
        await scheduleNotifications(reminderId);
      }

      // Clear the book stack so it resets to index when the user returns
      navigation.dispatch(StackActions.popToTop());
      router.navigate("/(tabs)/tickets" as any);
    } catch (error) {
      console.error("Failed to save reminder:", error);
      Alert.alert("Error", "Failed to save your reminder. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    // Clear the book stack so it resets to index when the user returns
    navigation.dispatch(StackActions.popToTop());
    router.navigate("/(tabs)/tickets" as any);
  };

  if (!ticket) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-slate-500 text-[16px] font-medium">
          Ticket not found
        </Text>
      </View>
    );
  }

  const travelDate = parseLocalDate(ticket.travelDate);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(travelDate);

  return (
    <View className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <RNView
          style={{
            paddingTop: Math.max(insets.top, 16),
            backgroundColor: "#f8fafc",
          }}
        >
          <View className="px-5 pt-4 pb-5">
            <View className="flex-row items-center justify-between mb-1">
              <View className="flex-1">
                <Text className="text-[28px] font-bold text-slate-900 tracking-tight">
                  Prepare For{"\n"}Your Trip
                </Text>
              </View>
              <View className="h-14 w-14 rounded-2xl bg-blue-50 border border-blue-100 items-center justify-center">
                <Ionicons name="briefcase-outline" size={28} color="#2563eb" />
              </View>
            </View>
            <Text className="text-[15px] font-medium text-slate-500 mt-1">
              Let's help you remember the important things.
            </Text>

            {/* Trip Info Badge */}
            <View className="flex-row items-center mt-4 bg-white rounded-2xl px-4 py-3 border border-slate-100 shadow-sm">
              <View
                className="h-10 w-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: ticket.agencyColor || "#2563eb" }}
              >
                <Ionicons name="bus" size={20} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-[16px] font-bold text-slate-900">
                  {ticket.from} → {ticket.to}
                </Text>
                <Text className="text-[13px] font-medium text-slate-500 mt-0.5">
                  {formattedDate} • {ticket.departureTime} •{" "}
                  {ticket.agencyName}
                </Text>
              </View>
            </View>
          </View>
        </RNView>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 160 }}
        >
          {/* Section: Suggested Items */}
          <View className="px-5 mt-5">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-[18px] font-bold text-slate-900">
                Travel Essentials
              </Text>
              <View className="bg-blue-50 rounded-full px-3 py-1.5">
                <Text className="text-[12px] font-bold text-blue-600">
                  {selectedItemIds.size} selected
                </Text>
              </View>
            </View>
            <View className="flex-row flex-wrap gap-2.5">
              {SUGGESTED_TRAVEL_ITEMS.map((item) => {
                const isSelected = selectedItemIds.has(item.id);
                const emoji = ITEM_ICONS[item.id] || "📦";
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => toggleItem(item.id)}
                    className={`flex-row items-center rounded-2xl px-4 py-3 border-2 ${
                      isSelected
                        ? "bg-blue-50 border-blue-400"
                        : "bg-white border-slate-100"
                    }`}
                  >
                    <Text className="text-[16px] mr-2">{emoji}</Text>
                    <Text
                      className={`text-[14px] font-semibold ${
                        isSelected ? "text-blue-700" : "text-slate-650"
                      }`}
                    >
                      {item.text}
                    </Text>
                    {isSelected && (
                      <View className="ml-2">
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color="#2563eb"
                        />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Section: Custom Items */}
          <View className="px-5 mt-8">
            <Text className="text-[18px] font-bold text-slate-900 mb-4">
              Custom Items
            </Text>
            <View className="flex-row items-center gap-3 mb-4">
              <View className="flex-1">
                <TextInput
                  value={customInput}
                  onChangeText={setCustomInput}
                  placeholder="Add a custom item..."
                  placeholderTextColor="#94a3b8"
                  returnKeyType="done"
                  onSubmitEditing={addCustom}
                  className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 font-medium text-[15px] text-slate-900"
                />
              </View>
              <Pressable
                onPress={addCustom}
                className={`h-12 w-12 items-center justify-center rounded-2xl ${
                  customInput.trim()
                    ? "bg-blue-600 shadow-lg shadow-blue-600/25"
                    : "bg-slate-200"
                }`}
                disabled={!customInput.trim()}
              >
                <Ionicons
                  name="add"
                  size={22}
                  color={customInput.trim() ? "#fff" : "#94a3b8"}
                />
              </Pressable>
            </View>
            {customItems.length > 0 && (
              <View className="gap-2">
                {customItems.map((item) => (
                  <View
                    key={item.id}
                    className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-slate-100"
                  >
                    <View className="h-8 w-8 rounded-xl bg-purple-50 items-center justify-center mr-3">
                      <Ionicons name="create-outline" size={16} color="#9333ea" />
                    </View>
                    <Text className="flex-1 text-[15px] font-medium text-slate-800">
                      {item.text}
                    </Text>
                    <Pressable
                      onPress={() => removeCustom(item.id)}
                      className="h-8 w-8 items-center justify-center rounded-full bg-slate-50"
                    >
                      <Ionicons name="close" size={16} color="#94a3b8" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Section: Alarm Clock Reminders */}
          <View className="px-5 mt-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-[18px] font-bold text-slate-900">
                Reminders (Alarm Clock)
              </Text>
              <Pressable
                onPress={handleOpenPicker}
                className="bg-purple-55 bg-blue-50 rounded-full px-3 py-1.5 flex-row items-center gap-1"
              >
                <Ionicons name="add" size={14} color="#2563eb" />
                <Text className="text-[12px] font-bold text-blue-600">
                  Add Alarm
                </Text>
              </Pressable>
            </View>
            <Text className="text-[14px] font-medium text-slate-500 mb-4">
              Set custom times (like an alarm clock) to trigger push notification alerts.
            </Text>

            {alarms.length > 0 ? (
              <View className="gap-2.5">
                {alarms.map((alarm) => (
                  <View
                    key={alarm.id}
                    className={`flex-row items-center rounded-2xl px-4 py-3.5 border ${
                      alarm.enabled
                        ? "bg-purple-50/50 border-purple-200"
                        : "bg-white border-slate-100"
                    }`}
                  >
                    <View
                      className={`h-10 w-10 rounded-xl items-center justify-center mr-4 ${
                        alarm.enabled ? "bg-purple-100" : "bg-slate-100"
                      }`}
                    >
                      <Ionicons
                        name="alarm-outline"
                        size={20}
                        color={alarm.enabled ? "#9333ea" : "#94a3b8"}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-[15px] font-bold ${
                          alarm.enabled ? "text-purple-900" : "text-slate-500"
                        }`}
                      >
                        {alarm.label}
                      </Text>
                    </View>
                    <Switch
                      value={alarm.enabled}
                      onValueChange={() => toggleAlarm(alarm.id)}
                      trackColor={{ false: "#cbd5e1", true: "#ddd6fe" }}
                      thumbColor={alarm.enabled ? "#9333ea" : "#f4f4f5"}
                      style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                    />
                    <Pressable
                      onPress={() => deleteAlarm(alarm.id)}
                      className="h-8 w-8 items-center justify-center rounded-full bg-slate-50 ml-3 active:bg-red-50"
                    >
                      <Ionicons name="trash-outline" size={15} color="#94a3b8" />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : (
              <View className="items-center py-6 bg-white rounded-3xl border border-slate-100">
                <Ionicons name="notifications-off-outline" size={32} color="#cbd5e1" />
                <Text className="text-[13px] font-bold text-slate-400 mt-2">
                  No alarms set yet
                </Text>
              </View>
            )}
          </View>

          {/* DateTimePicker Modals */}
          {showDatePicker && (
            <DateTimePicker
              value={getPickerDate()}
              minimumDate={getPickerMinDate()}
              maximumDate={getPickerMaxDate()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}

          {/* Summary */}
          {(totalItems > 0 || enabledAlarmsCount > 0) && (
            <View className="px-5 mt-8">
              <View className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-5 border border-blue-100/50">
                <Text className="text-[15px] font-bold text-slate-800 mb-3">
                  Reminder Summary
                </Text>
                <View className="flex-row items-center mb-2">
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color="#2563eb"
                  />
                  <Text className="ml-2 text-[14px] font-medium text-slate-600">
                    {totalItems} items in your checklist
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons
                    name="notifications-outline"
                    size={18}
                    color="#9333ea"
                  />
                  <Text className="ml-2 text-[14px] font-medium text-slate-600">
                    {enabledAlarmsCount} alarm{enabledAlarmsCount !== 1 ? "s" : ""} scheduled
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom Actions */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-5 pt-4 shadow-2xl"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <Button
            label={saving ? "Saving..." : "Save & Schedule"}
            onPress={handleSave}
            loading={saving}
            disabled={totalItems === 0}
            className="mb-3"
          />
          <Button
            label="Skip For Now"
            variant="ghost"
            onPress={handleSkip}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
