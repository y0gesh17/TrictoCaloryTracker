

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  updateCalorieGoal,
  resetTodayData,
  resetAllData,
} from "../db/profileService";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { toDateKey } from "../utils/date";
import AppAlert from "../components/AppAlert";
export default function ProfileScreen() {
  const navigation = useNavigation();
  const [goalModal, setGoalModal] = useState(false);
  const [newCalories, setNewCalories] = useState("");
 const [saving, setSaving] = useState(false);
  const [appAlert, setAppAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "warning" | "danger" | "info";
    actions?: {
      label: string;
      onPress?: () => void;
      variant?: "primary" | "danger" | "muted";
    }[];
  }>({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });
  const today = toDateKey();
  const [goalInputs, setGoalInputs] = useState({
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
});

const handleSaveGoal = async () => {
  if (saving) return;

  try {
    setSaving(true);

    await updateCalorieGoal({
      calories: Number(goalInputs.calories || 2000),
      protein: Number(goalInputs.protein || 150),
      carbs: Number(goalInputs.carbs || 200),
      fat: Number(goalInputs.fat || 60),
    });

   setGoalModal(false);

navigation.goBack(); // 🔥 FORCE HOME REFRESH
  } catch (e) {
    console.log(e);
  } finally {
    setSaving(false);
  }
};
//   const handleSaveGoal = async () => {
//   if (saving || !newCalories) return;

//   try {
//     setSaving(true);

//     await updateCalorieGoal({
//       calories: Number(newCalories),
//       protein: 150,
//       carbs: 200,
//       fat: 60,
//     });

//     setGoalModal(false);
//   } catch (e) {
//     console.log(e);
//   } finally {
//     setSaving(false);
//   }
// };
type GoalKeys = "calories" | "protein" | "carbs" | "fat";
const goalFields: GoalKeys[] = [
  "calories",
  "protein",
  "carbs",
  "fat",
];

const confirmResetToday = () => {
  setAppAlert({
    visible: true,
    title: "Reset Today's Data?",
    message: "This will clear today's meals and weight.",
    type: "warning",
    actions: [
      { label: "Cancel", variant: "muted" },
      {
        label: "Reset",
        variant: "danger",
        onPress: () => resetTodayData(today),
      },
    ],
  });
};

const confirmResetAll = () => {
  setAppAlert({
    visible: true,
    title: "Reset All Data?",
    message: "This will permanently delete all meals, weights, and summaries.",
    type: "danger",
    actions: [
      { label: "Cancel", variant: "muted" },
      {
        label: "Delete All",
        variant: "danger",
        onPress: () => resetAllData(),
      },
    ],
  });
};

  const Item = ({ icon, title, subtitle, color, onPress }: any) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between p-4 bg-white rounded-2xl mb-3 shadow-sm"
    >
      <View className="flex-row items-center">
        <LinearGradient
          colors={
            color.includes("red")
              ? ["#F87171", "#DC2626"]
              : color.includes("yellow")
              ? ["#FBBF24", "#F97316"]
              : color.includes("orange")
              ? ["#FB923C", "#EA580C"]
              : color.includes("gray")
              ? ["#374151", "#111827"]
              : ["#22C55E", "#16A34A"]
          }
          style={{
            width: 42,
            height: 42,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Ionicons name={icon} size={20} color="white" />
        </LinearGradient>

        <View>
          <Text className="font-semibold">{title}</Text>
          {subtitle && (
            <Text className="text-gray-400 text-xs">{subtitle}</Text>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#999" />
    </TouchableOpacity>
  );

  return (
  <SafeAreaView className="flex-1 bg-[#F7FAF5]">
  <ScrollView
    keyboardShouldPersistTaps="handled"
    contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
  >
      {/* HEADER */}
      <LinearGradient
        colors={["#111827", "#166534"]}
        style={{
          borderRadius: 28,
          padding: 24,
          alignItems: "center",
          marginBottom: 24,
          shadowColor: "#16a34a",
          shadowOpacity: 0.16,
          shadowRadius: 18,
          elevation: 4,
        }}
      >
        <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-3 border border-white/30">
          <Text className="text-white text-2xl font-bold">Y</Text>
        </View>

        <Text className="text-white text-2xl font-bold">Your Profile</Text>
        <Text className="text-white/80 text-sm mt-1">Stay consistent 💪</Text>
      </LinearGradient>

      {/* SECTION: GOALS */}
      <Text className="text-gray-400 mb-2 ml-1">Goals</Text>

      <Item
        icon="flame"
        title="Calorie Goal"
        subtitle="Set your daily target"
        color="bg-orange-500"
        onPress={() => setGoalModal(true)}
      />

      {/* <Item
        icon="fitness"
        title="Edit Onboarding"
        subtitle="Recalculate goals"
        color="bg-blue-500"
        onPress={() => {}}
      /> */}

      {/* SECTION: DATA */}
      <Text className="text-gray-400 mt-4 mb-2 ml-1">Data</Text>

      <Item
        icon="refresh"
        title="Reset Today"
        subtitle="Clear today's meals & weight"
        color="bg-yellow-500"
        onPress={confirmResetToday}
      />

      <Item
        icon="trash"
        title="Reset All Data"
        subtitle="Delete everything permanently"
        color="bg-red-500"
        onPress={confirmResetAll}
      />

      {/* SECTION: EXTRA */}
      <Text className="text-gray-400 mt-4 mb-2 ml-1">More</Text>

      <Item
        icon="moon"
        title="Dark Mode"
        subtitle="Coming soon"
        color="bg-gray-700"
        onPress={() => {}}
      />

      <Item
        icon="analytics"
        title="Weekly Report"
        subtitle="Coming soon"
        color="bg-green-500"
        onPress={() => {}}
      />

      {/* 🔥 MODAL */}
      <Modal visible={goalModal} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-black/40 justify-center px-4"
        >
          <LinearGradient
            colors={["#FFFFFF", "#ECFDF5"]}
            style={{ padding: 20, borderRadius: 24 }}
          >

            <Text className="font-bold mb-4 text-xl text-gray-950">
              Set Daily Goals
            </Text>

            {/* <TextInput
              keyboardType="numeric"
              placeholder="2000"
              value={newCalories}
              onChangeText={setNewCalories}
              className="border p-3 rounded mb-4"
            /> */}
{goalFields.map((key) => (
  <View key={key} className="mb-4">

    <Text className="text-gray-500 mb-1 capitalize">
      {key}
    </Text>

    <View className="flex-row items-center bg-white rounded-xl px-3 border border-green-100">

      <Ionicons
        name={
          key === "calories"
            ? "flame"
            : key === "protein"
            ? "restaurant"
            : key === "carbs"
            ? "leaf"
            : "water"
        }
        size={18}
        color="#666"
      />

      <TextInput
        placeholder={`Enter ${key}`}
        keyboardType="numeric"
        value={goalInputs[key]}
        onChangeText={(t) =>
          setGoalInputs({ ...goalInputs, [key]: t })
        }
        className="flex-1 p-3 ml-2"
      />

      <Text className="text-gray-400 text-xs">
        {key === "calories" ? "kcal" : "g"}
      </Text>
    </View>

  </View>
))}

            {/* <TouchableOpacity
              onPress={async () => {
  if (saving) return;

  setSaving(true);

  await updateCalorieGoal(Number(newCalories));

  setGoalModal(false);
  setSaving(false);
}}
              className="bg-black p-3 rounded-xl mb-2"
            >
              <Text className="text-white text-center">Save</Text>
            </TouchableOpacity> */}
            <TouchableOpacity
  disabled={saving}
  onPress={handleSaveGoal}
>
  <LinearGradient
    colors={saving ? ["#9CA3AF", "#6B7280"] : ["#22C55E", "#16A34A"]}
    style={{ borderRadius: 16, padding: 14, marginBottom: 10 }}
  >
    <Text className="text-white text-center font-semibold">
      {saving ? "Saving..." : "Save"}
    </Text>
  </LinearGradient>
</TouchableOpacity>

            <TouchableOpacity onPress={() => setGoalModal(false)}>
              <Text className="text-center text-gray-400">Cancel</Text>
            </TouchableOpacity>

          </LinearGradient>
        </KeyboardAvoidingView>
      </Modal>

      <AppAlert
        visible={appAlert.visible}
        title={appAlert.title}
        message={appAlert.message}
        type={appAlert.type}
        actions={appAlert.actions}
        onClose={() => setAppAlert((alert) => ({ ...alert, visible: false }))}
      />

    </ScrollView>
    </SafeAreaView>
  );
}
