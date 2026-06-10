import { useState, useMemo, useCallback } from "react";
import {
  ScrollView,
  View as RNView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, Pressable, TextInput } from "../../../components/tw";
import { Ionicons } from "@expo/vector-icons";
import { useReminderStore } from "../../../stores/reminderStore";
import { useTicketStore } from "../../../stores/ticketStore";
import { parseLocalDate } from "../../../utils/date";
import { computeProgress, getItemCounts } from "../../../types/reminder";
import { requestPermissions } from "../../../services/notificationService";
import Button from "../../../components/ui/Button";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function ReminderDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const reminder = useReminderStore((s) =>
    s.reminders.find((r) => r.reminderId === id)
  );

  const toggleItem = useReminderStore((s) => s.toggleItem);
  const addCustomItem = useReminderStore((s) => s.addCustomItem);
  const deleteItem = useReminderStore((s) => s.deleteItem);
  const updateReminder = useReminderStore((s) => s.updateReminder);
  const scheduleNotifications = useReminderStore((s) => s.scheduleNotifications);

  const [customInput, setCustomInput] = useState("");

  // Alarm Date/Time picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  // Link to the ticket if it still exists
  const ticket = useTicketStore((s) =>
    s.tickets.find((t) => t.ticketId === reminder?.tripId)
  );

  const progress = useMemo(() => {
    if (!reminder) return 0;
    return computeProgress(reminder);
  }, [reminder]);

  const { completed, total } = useMemo(() => {
    if (!reminder) return { completed: 0, total: 0 };
    return getItemCounts(reminder);
  }, [reminder]);

  const handleToggle = useCallback(
    async (itemId: string) => {
      if (!reminder) return;
      toggleItem(reminder.reminderId, itemId);
      
      // Reschedule notifications in the background to refresh packing lists in messages
      setTimeout(() => {
        scheduleNotifications(reminder.reminderId);
      }, 300);
    },
    [reminder, toggleItem, scheduleNotifications]
  );

  const handleAddCustom = useCallback(() => {
    const trimmed = customInput.trim();
    if (!trimmed || !reminder) return;

    addCustomItem(reminder.reminderId, trimmed);
    setCustomInput("");

    // Reschedule notifications in the background to update item counts in notifications
    setTimeout(() => {
      scheduleNotifications(reminder.reminderId);
    }, 300);
  }, [customInput, reminder, addCustomItem, scheduleNotifications]);

  const handleDelete = useCallback(
    (itemId: string, text: string) => {
      if (!reminder) return;
      Alert.alert("Delete Item", `Are you sure you want to remove "${text}"?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteItem(reminder.reminderId, itemId);
            setTimeout(() => {
              scheduleNotifications(reminder.reminderId);
            }, 300);
          },
        },
      ]);
    },
    [reminder, deleteItem, scheduleNotifications]
  );

  const handleToggleAlarm = async (alarmId: string) => {
    if (!reminder) return;
    const currentAlarms = reminder.alarms || [];
    const target = currentAlarms.find((a) => a.id === alarmId);
    if (!target) return;
    const willBeEnabled = !target.enabled;

    let permissionGranted = true;
    if (willBeEnabled) {
      permissionGranted = await requestPermissions();
      if (!permissionGranted) {
        Alert.alert(
          "Permission Blocked",
          "Please enable notification permissions in your device settings to turn on this alarm."
        );
        return;
      }
    }

    const updatedAlarms = currentAlarms.map((a) =>
      a.id === alarmId ? { ...a, enabled: willBeEnabled } : a
    );

    updateReminder(reminder.reminderId, { alarms: updatedAlarms });
    setTimeout(() => {
      scheduleNotifications(reminder.reminderId);
    }, 300);
  };

  const handleDeleteAlarm = (alarmId: string) => {
    if (!reminder) return;
    const updatedAlarms = (reminder.alarms || []).filter((a) => a.id !== alarmId);
    updateReminder(reminder.reminderId, { alarms: updatedAlarms });
    setTimeout(() => {
      scheduleNotifications(reminder.reminderId);
    }, 300);
  };

  const getPickerDate = () => {
    if (!reminder) return new Date();
    const tDate = parseLocalDate(reminder.travelDate);
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
    if (!reminder) return undefined;
    const maxDate = parseLocalDate(reminder.travelDate);
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

  const handleTimeChange = async (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (event.type === "dismissed" || !tempDate || !reminder) {
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
      const departureDate = parseLocalDate(reminder.travelDate);
      const timeParts = reminder.departureTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
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

      const formattedLabel = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(finalDateTime);

      const permissionGranted = await requestPermissions();
      const newAlarm = {
        id: `alarm-${Date.now()}`,
        timestamp,
        label: formattedLabel,
        enabled: permissionGranted,
      };

      const updatedAlarms = [...(reminder.alarms || []), newAlarm];
      updateReminder(reminder.reminderId, { alarms: updatedAlarms });
      setTimeout(() => {
        scheduleNotifications(reminder.reminderId);
      }, 300);
    }
    setTempDate(null);
  };

  if (!reminder) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="text-slate-800 text-[18px] font-bold mt-4">
          Checklist not found
        </Text>
        <Text className="text-slate-500 text-[14px] text-center mt-2 mb-6">
          This checklist may have been deleted or doesn't exist.
        </Text>
        <Button label="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const travelDate = parseLocalDate(reminder.travelDate);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(travelDate);

  const allItems = [...(reminder.selectedItems || []), ...(reminder.customItems || [])];
  const activeAlarms = (reminder.alarms || []).filter((a) => a.enabled).length;

  return (
    <View className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Custom Header */}
        <RNView
          style={{
            paddingTop: Math.max(insets.top, 16),
            backgroundColor: "#ffffff",
            borderBottomWidth: 1,
            borderBottomColor: "#f1f5f9",
          }}
        >
          <View className="flex-row items-center px-4 pb-4">
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-xl bg-slate-100 mr-3 active:bg-slate-200"
            >
              <Ionicons name="arrow-back" size={20} color="#334155" />
            </Pressable>
            <View className="flex-1 mr-2">
              <View className="flex-row items-center flex-wrap gap-1">
                <Text className="text-[18px] font-bold text-slate-900">
                  {reminder.from}
                </Text>
                <Ionicons name="arrow-forward" size={14} color="#64748b" />
                <Text className="text-[18px] font-bold text-slate-900">
                  {reminder.destination}
                </Text>
              </View>
              <Text className="text-[12px] font-semibold text-slate-400 mt-0.5">
                {formattedDate} • {reminder.departureTime}
              </Text>
            </View>
            <View
              className={`h-9 px-3 rounded-full flex-row items-center gap-1 ${
                activeAlarms > 0 ? "bg-purple-50" : "bg-slate-100"
              }`}
            >
              <Ionicons
                name={activeAlarms > 0 ? "notifications" : "notifications-off"}
                size={14}
                color={activeAlarms > 0 ? "#9333ea" : "#64748b"}
              />
              <Text
                className={`text-[11px] font-bold ${
                  activeAlarms > 0 ? "text-purple-600" : "text-slate-500"
                }`}
              >
                {activeAlarms > 0 ? `${activeAlarms} Set` : "Muted"}
              </Text>
            </View>
          </View>
        </RNView>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Progress Card */}
          <View className="px-5 mt-5">
            <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
              <View className="flex-row items-center justify-between mb-3">
                <View>
                  <Text className="text-[16px] font-bold text-slate-900">
                    Packing Progress
                  </Text>
                  <Text className="text-[13px] font-medium text-slate-400 mt-0.5">
                    {completed} of {total} items packed
                  </Text>
                </View>
                <Text
                  className={`text-[24px] font-extrabold ${
                    progress === 100 ? "text-emerald-500" : "text-blue-600"
                  }`}
                >
                  {progress}%
                </Text>
              </View>
              <View className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                <View
                  className={`h-full rounded-full ${
                    progress === 100 ? "bg-emerald-500" : "bg-blue-600"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </View>
              {progress === 100 && total > 0 && (
                <View className="flex-row items-center bg-emerald-50 rounded-2xl px-4 py-3 mt-4 border border-emerald-100/50">
                  <Ionicons name="checkmark-done-circle" size={20} color="#10b981" />
                  <Text className="ml-2 text-[13px] font-semibold text-emerald-700">
                    All set! Safe travels! 🎉
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Checklist Items */}
          <View className="px-5 mt-6">
            <Text className="text-[18px] font-bold text-slate-900 mb-3 px-1">
              Checklist Items
            </Text>

            {/* Quick Add Custom Item Inline */}
            <View className="flex-row items-center gap-2 mb-4 bg-white border border-slate-200/80 rounded-2xl px-3 py-1.5 shadow-sm">
              <TextInput
                value={customInput}
                onChangeText={setCustomInput}
                placeholder="Add item to checklist..."
                placeholderTextColor="#94a3b8"
                returnKeyType="done"
                onSubmitEditing={handleAddCustom}
                className="flex-1 px-2 py-2 font-medium text-[14px] text-slate-900"
              />
              <Pressable
                onPress={handleAddCustom}
                disabled={!customInput.trim()}
                className={`h-9 px-4 rounded-xl flex-row items-center justify-center ${
                  customInput.trim() ? "bg-blue-600" : "bg-slate-100"
                }`}
              >
                <Ionicons
                  name="add"
                  size={16}
                  color={customInput.trim() ? "#ffffff" : "#94a3b8"}
                />
                <Text
                  className={`text-[12px] font-bold ml-1 ${
                    customInput.trim() ? "text-white" : "text-slate-400"
                  }`}
                >
                  Add
                </Text>
              </Pressable>
            </View>

            {allItems.length > 0 ? (
              <View className="gap-3">
                {allItems.map((item) => (
                  <View
                    key={item.id}
                    className={`flex-row items-center bg-white rounded-2xl px-4 py-3.5 border shadow-sm shadow-slate-100/50 ${
                      item.completed
                        ? "border-emerald-100 bg-emerald-50/20"
                        : "border-slate-100"
                    }`}
                  >
                    <Pressable
                      onPress={() => handleToggle(item.id)}
                      className="mr-3"
                    >
                      <View
                        className={`h-6.5 w-6.5 rounded-lg border-2 items-center justify-center ${
                          item.completed
                            ? "bg-emerald-500 border-emerald-500"
                            : "bg-white border-slate-300"
                        }`}
                      >
                        {item.completed && (
                          <Ionicons name="checkmark" size={14} color="#ffffff" />
                        )}
                      </View>
                    </Pressable>

                    <Text
                      className={`flex-1 text-[15px] font-medium ${
                        item.completed
                          ? "line-through text-slate-400 font-semibold"
                          : "text-slate-800"
                      }`}
                    >
                      {item.text}
                    </Text>

                    <Pressable
                      onPress={() => handleDelete(item.id, item.text)}
                      className="h-8 w-8 items-center justify-center rounded-full bg-slate-50 hover:bg-red-50 active:bg-red-50 ml-2"
                    >
                      <Ionicons name="trash-outline" size={15} color="#94a3b8" />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : (
              <View className="items-center py-10 bg-white rounded-3xl border border-slate-100">
                <Ionicons name="checkbox-outline" size={36} color="#cbd5e1" />
                <Text className="text-[15px] font-bold text-slate-500 mt-2">
                  Checklist is empty
                </Text>
              </View>
            )}
          </View>

          {/* Notification Settings */}
          <View className="px-5 mt-8">
            <View className="flex-row items-center justify-between mb-3 px-1">
              <Text className="text-[18px] font-bold text-slate-900">
                Notification Settings
              </Text>
              <Pressable
                onPress={handleOpenPicker}
                className="bg-blue-55 bg-blue-50 rounded-full px-3 py-1.5 flex-row items-center gap-1"
              >
                <Ionicons name="add" size={14} color="#2563eb" />
                <Text className="text-[12px] font-bold text-blue-600">
                  Add Alarm
                </Text>
              </Pressable>
            </View>
            <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
              <Text className="text-[13px] font-medium text-slate-500 mb-4">
                Receive local push notifications prior to bus departure.
              </Text>
              {(reminder.alarms || []).length > 0 ? (
                <View className="gap-3">
                  {(reminder.alarms || []).map((alarm) => (
                    <View
                      key={alarm.id}
                      className={`flex-row items-center rounded-2xl px-4 py-3.5 border ${
                        alarm.enabled
                          ? "bg-purple-50/40 border-purple-200"
                          : "border-slate-100 bg-slate-50/50"
                      }`}
                    >
                      <View
                        className={`h-9 w-9 rounded-xl items-center justify-center mr-3 ${
                          alarm.enabled ? "bg-purple-100" : "bg-slate-200/50"
                        }`}
                      >
                        <Ionicons
                          name="alarm-outline"
                          size={18}
                          color={alarm.enabled ? "#9333ea" : "#64748b"}
                        />
                      </View>
                      <Text
                        className={`flex-1 text-[14px] font-semibold ${
                          alarm.enabled ? "text-purple-900" : "text-slate-600"
                        }`}
                      >
                        {alarm.label}
                      </Text>
                      <Switch
                        value={alarm.enabled}
                        onValueChange={() => handleToggleAlarm(alarm.id)}
                        trackColor={{ false: "#cbd5e1", true: "#ddd6fe" }}
                        thumbColor={alarm.enabled ? "#9333ea" : "#f4f4f5"}
                        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                      />
                      <Pressable
                        onPress={() => handleDeleteAlarm(alarm.id)}
                        className="h-8 w-8 items-center justify-center rounded-full bg-slate-50 ml-2 active:bg-red-50"
                      >
                        <Ionicons name="trash-outline" size={15} color="#94a3b8" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="items-center py-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <Ionicons name="notifications-off-outline" size={28} color="#cbd5e1" />
                  <Text className="text-[13px] font-bold text-slate-400 mt-2">
                    No alarms configured
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Date Picker Modals */}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
