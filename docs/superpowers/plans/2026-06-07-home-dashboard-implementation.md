# Home Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Home Dashboard screen as a scrollable card feed with welcome, upcoming trips, quick actions, reminder preview, and recent activity.

**Architecture:** The home screen orchestrates 5 sub-components inside a ScrollView, each rendered as a floating white card. Components read from existing Zustand stores (`useTicketStore`) and use local mock state for reminders (no reminder store exists yet). Navigation uses `expo-router`.

**Tech Stack:** Expo 54, React Native 0.81, Expo Router, react-native-css (NativeWind v5), expo-linear-gradient, expo-image, @expo/vector-icons/Ionicons, Zustand

---

### Task 1: Create `components/home/` directory and `WelcomeCard.tsx`

**Files:**
- Create: `components/home/`
- Create: `components/home/WelcomeCard.tsx`

- [ ] **Step 1: Install missing dependencies (expo-linear-gradient)**

Run:
```bash
npx expo install expo-linear-gradient
```

- [ ] **Step 2: Create `components/home/WelcomeCard.tsx`**

```tsx
import { View, Text } from "../../components/tw";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useCSSVariable } from "../../components/tw";

export default function WelcomeCard() {
  const blur = useCSSVariable("--color-surface");

  return (
    <View className="mx-4 mb-4 overflow-hidden rounded-[20px]">
      <LinearGradient
        colors={["#2563eb", "#9333ea"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 20 }}
      >
        <View className="flex-row items-center justify-between px-6 py-6">
          <View className="flex-1">
            <Text className="font-bold text-[22px] leading-tight text-white">
              Welcome to Movana
            </Text>
            <Text className="mt-1 font-medium text-[14px] text-white/80">
              Ready for your next adventure?
            </Text>
          </View>
          <View className="size-[56px] overflow-hidden rounded-full bg-white/20 p-2">
            <Image
              source={require("../../assets/images/movana logo.jpeg")}
              style={{ width: 40, height: 40 }}
              contentFit="contain"
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
```

- [ ] **Step 3: Verify file compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30` and check for errors in WelcomeCard.tsx

---

### Task 2: Create `UpcomingTripCard.tsx`

**Files:**
- Create: `components/home/UpcomingTripCard.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { View, Text } from "../../components/tw";
import { Pressable } from "../../components/tw";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTicketStore } from "../../stores/ticketStore";

export default function UpcomingTripCard() {
  const router = useRouter();
  const upcoming = useTicketStore((s) => s.getUpcomingTickets());
  const trip = upcoming.length > 0 ? upcoming[0] : null;

  if (!trip) {
    return (
      <View className="mx-4 mb-4 rounded-[20px] bg-white px-6 py-6 shadow-lg shadow-black/5">
        <View className="items-center">
          <Ionicons name="bus-outline" size={32} color="#94a3b8" />
          <Text className="mt-3 font-semibold text-[16px] text-slate-800">
            No upcoming trips
          </Text>
          <Text className="mt-1 font-medium text-[13px] text-slate-400">
            Book your first trip!
          </Text>
        </View>
      </View>
    );
  }

  const travelDate = new Date(trip.travelDate);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(travelDate);

  return (
    <Pressable
      className="mx-4 mb-4 rounded-[20px] bg-white px-6 py-5 shadow-lg shadow-black/5"
      onPress={() => router.push(`/(tabs)/home/trip-detail/${trip.ticketId}`)}
    >
      <View className="flex-row items-center justify-between">
        <Text className="font-medium text-[12px] uppercase tracking-wider text-slate-400">
          Next Trip
        </Text>
        <View className="rounded-lg bg-green-100 px-3 py-1">
          <Text className="font-bold text-[11px] tracking-wide text-green-600">
            CONFIRMED
          </Text>
        </View>
      </View>

      <View className="mt-3 flex-row items-center gap-3">
        <View
          className="size-3 rounded-full"
          style={{ backgroundColor: trip.agencyColor || "#2563eb" }}
        />
        <View className="flex-1">
          <Text className="font-bold text-[20px] text-slate-900">
            {trip.from} → {trip.to}
          </Text>
          <Text className="mt-1 font-medium text-[13px] text-slate-500">
            {formattedDate} · {trip.departureTime} · {trip.agencyName}
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row items-center gap-1">
        <Text className="font-medium text-[13px] text-primary">View Details</Text>
        <Ionicons name="chevron-forward" size={14} color="#2563eb" />
      </View>
    </Pressable>
  );
}
```

- [ ] **Step 2: Verify file compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`

---

### Task 3: Create `QuickActions.tsx`

**Files:**
- Create: `components/home/QuickActions.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { View, Text } from "../../components/tw";
import { Pressable } from "../../components/tw";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const actions = [
  { label: "Book a Trip", icon: "search" as const, tab: "/(tabs)/book" },
  { label: "My Tickets", icon: "ticket-outline" as const, tab: "/(tabs)/tickets" },
  { label: "Packing List", icon: "checkmark-circle-outline" as const, tab: "/(tabs)/reminders" },
];

export default function QuickActions() {
  const router = useRouter();

  return (
    <View className="mx-4 mb-4 rounded-[20px] bg-white px-5 py-5 shadow-lg shadow-black/5">
      <Text className="mb-4 font-semibold text-[15px] text-slate-900">
        Quick Actions
      </Text>
      <View className="flex-row gap-3">
        {actions.map((action) => (
          <Pressable
            key={action.label}
            className="flex-1 items-center rounded-2xl bg-slate-50 py-4"
            onPress={() => router.push(action.tab as any)}
          >
            <Ionicons name={action.icon} size={24} color="#2563eb" />
            <Text className="mt-2 font-medium text-[12px] text-slate-700">
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Verify compiles**

---

### Task 4: Create `ReminderPreview.tsx`

**Files:**
- Create: `components/home/ReminderPreview.tsx`

- [ ] **Step 1: Create the component with local mock state**

```tsx
import { View, Text } from "../../components/tw";
import { Pressable } from "../../components/tw";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";

// Mock reminder data — will connect to reminder store when built
const mockItems = ["Passport", "Phone Charger", "Travel Pillow", "Sunscreen", "Umbrella"];
const mockChecked = 3;

export default function ReminderPreview() {
  const router = useRouter();
  const progress = useMemo(() => (mockChecked / mockItems.length) * 100, []);

  return (
    <Pressable
      className="mx-4 mb-4 rounded-[20px] bg-white px-6 py-5 shadow-lg shadow-black/5"
      onPress={() => router.push("/(tabs)/reminders")}
    >
      <View className="flex-row items-center justify-between">
        <Text className="font-semibold text-[15px] text-slate-900">
          Packing Progress
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
      </View>

      <View className="mt-3 h-2 w-full rounded-full bg-slate-100">
        <View
          className="h-full rounded-full bg-green-500"
          style={{ width: `${progress}%` }}
        />
      </View>

      <Text className="mt-2 font-medium text-[13px] text-green-600">
        {mockChecked}/{mockItems.length} items packed
      </Text>

      <View className="mt-3 flex-row flex-wrap gap-2">
        {mockItems.map((item) => {
          const isChecked = mockItems.indexOf(item) < mockChecked;
          return (
            <View
              key={item}
              className={`flex-row items-center gap-1 rounded-lg px-3 py-1.5 ${
                isChecked ? "bg-green-50" : "bg-slate-50"
              }`}
            >
              <Ionicons
                name={isChecked ? "checkmark-circle" : "ellipse-outline"}
                size={14}
                color={isChecked ? "#16a34a" : "#94a3b8"}
              />
              <Text
                className={`font-medium text-[12px] ${
                  isChecked ? "text-green-700" : "text-slate-400"
                }`}
              >
                {item}
              </Text>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}
```

- [ ] **Step 2: Verify compiles**

---

### Task 5: Create `RecentActivity.tsx`

**Files:**
- Create: `components/home/RecentActivity.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { View, Text } from "../../components/tw";
import { Ionicons } from "@expo/vector-icons";
import { useTicketStore } from "../../stores/ticketStore";
import { useMemo } from "react";

export default function RecentActivity() {
  const upcoming = useTicketStore((s) => s.getUpcomingTickets());
  const past = useTicketStore((s) => s.getPastTickets());
  const trip = upcoming.length > 0 ? upcoming[0] : past.length > 0 ? past[past.length - 1] : null;

  const countdown = useMemo(() => {
    if (!trip) return null;
    const diff = new Date(trip.travelDate).getTime() - Date.now();
    if (diff <= 0) return null;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days === 1 ? "1 day" : `${days} days`;
  }, [trip]);

  return (
    <View className="mx-4 mb-6 rounded-[20px] bg-white px-6 py-5 shadow-lg shadow-black/5">
      {countdown ? (
        <View className="flex-row items-center gap-3">
          <View className="rounded-full bg-primary/10 p-3">
            <Ionicons name="time-outline" size={22} color="#2563eb" />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-[18px] text-slate-900">
              Trip in {countdown}
            </Text>
            <Text className="mt-0.5 font-medium text-[13px] text-slate-500">
              {trip.from} → {trip.to} · {new Date(trip.travelDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
            </Text>
          </View>
        </View>
      ) : trip ? (
        <View className="flex-row items-center gap-3">
          <View className="rounded-full bg-slate-100 p-3">
            <Ionicons name="bus-outline" size={22} color="#64748b" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-[15px] text-slate-700">
              Last Trip
            </Text>
            <Text className="mt-0.5 font-medium text-[13px] text-slate-400">
              {trip.from} → {trip.to}
            </Text>
          </View>
        </View>
      ) : (
        <View className="flex-row items-center gap-3">
          <View className="rounded-full bg-slate-100 p-3">
            <Ionicons name="compass-outline" size={22} color="#94a3b8" />
          </View>
          <View className="flex-1">
            <Text className="font-medium text-[14px] text-slate-400">
              No trips yet. Start exploring!
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
```

- [ ] **Step 2: Verify compiles**

---

### Task 6: Update `app/(tabs)/home/index.tsx`

**Files:**
- Modify: `app/(tabs)/home/index.tsx`

- [ ] **Step 1: Replace the placeholder with the full home screen**

Overwrite the entire file:

```tsx
import { ScrollView } from "../../../components/tw";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import WelcomeCard from "../../../components/home/WelcomeCard";
import UpcomingTripCard from "../../../components/home/UpcomingTripCard";
import QuickActions from "../../../components/home/QuickActions";
import ReminderPreview from "../../../components/home/ReminderPreview";
import RecentActivity from "../../../components/home/RecentActivity";

export default function HomeIndex() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="pt-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <WelcomeCard />
        <UpcomingTripCard />
        <QuickActions />
        <ReminderPreview />
        <RecentActivity />
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Verify compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`

---

### Task 7: Verify build

- [ ] **Step 1: Run TypeScript check**

```bash
npx tsc --noEmit --pretty 2>&1
```

Fix any type errors found.

- [ ] **Step 2: Run Expo export check**

```bash
npx expo export --platform web --output-dir dist --no-minify 2>&1 | tail -20
```

This confirms the app bundles without errors.
