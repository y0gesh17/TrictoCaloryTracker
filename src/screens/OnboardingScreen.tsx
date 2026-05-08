import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveUserGoals } from "../db/saveUserGoals";
import { LinearGradient } from "expo-linear-gradient";
import { toDateKey } from "../utils/date";
type UserData = {
  age: string;
  gender: string;
  height: string;
  weight: string;
  activity: string;
  goal: string;
};
type OptionProps = {
  label: string;
  value: string;
  field: keyof UserData; // 🔥 KEY FIX
};
export default function OnboardingScreen({
  setOnboardingDone,
}: any) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState<UserData>({
    age: "",
    gender: "male",
    height: "",
    weight: "",
    activity: "1.2",
    goal: "maintain",
  });

  // 🔥 CALCULATION
  const calculate = () => {
    const age = Number(data.age);
    const weight = Number(data.weight);
    const height = Number(data.height);

    let bmr =
      data.gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    let tdee = bmr * Number(data.activity);

    if (data.goal === "lose") tdee -= 500;
    if (data.goal === "gain") tdee += 300;

    const protein = weight * 1.8;
    const fat = (tdee * 0.25) / 9;
    const carbs = (tdee - protein * 4 - fat * 9) / 4;
   const today = toDateKey();

    return {
      calories: Math.round(tdee),
      protein: Math.round(protein),
      fat: Math.round(fat),
      carbs: Math.round(carbs),
      date: today,
    };
  };

  // 🔥 FINISH
  const handleFinish = async () => {
    if (saving) return;

    try {
      setSaving(true);
      const result = calculate();

      await saveUserGoals(result, Number(data.weight));
      await AsyncStorage.setItem("onboardingDone", "true");

      setOnboardingDone(true);
    } catch (e) {
      console.log("❌ Error saving goals:", e);
    } finally {
      setSaving(false);
    }
  };

  // 🔥 OPTION BUTTON
  const Option = ({ label, value, field }: OptionProps) => {
    const selected = data[field] === value;

    return (
      <TouchableOpacity
        onPress={() => setData({ ...data, [field]: value })}
        className="mb-3"
      >
        <LinearGradient
          colors={selected ? ["#22C55E", "#16A34A"] : ["#FFFFFF", "#F3F4F6"]}
          style={{
            borderRadius: 16,
            padding: 16,
            borderWidth: selected ? 0 : 1,
            borderColor: "#E5E7EB",
          }}
        >
          <Text
            className={`text-center font-semibold ${
              selected ? "text-white" : "text-gray-900"
            }`}
          >
            {label}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-[#F7FAF5] px-6 pt-16"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >

      {/* STEP INDICATOR */}
      <LinearGradient
        colors={["#111827", "#166534"]}
        style={{ borderRadius: 28, padding: 22, marginBottom: 24 }}
      >
        <Text className="text-white/70 text-center mb-2">
          Step {step + 1} / 6
        </Text>
        <Text className="text-white text-3xl font-bold text-center">
          Build your plan
        </Text>
      </LinearGradient>

      {/* 🔥 STEP UI */}
      {step === 0 && (
        <>
          <Text className="text-xl font-bold">Your Age</Text>
          <TextInput
            keyboardType="numeric"
            placeholder="Enter age"
            onChangeText={(t) => setData({ ...data, age: t })}
            className="bg-white border border-green-100 p-4 mt-4 rounded-xl"
          />
        </>
      )}

      {step === 1 && (
        <>
          <Text className="text-xl font-bold mb-4">Gender</Text>
          <Option label="Male" value="male" field="gender" />
          <Option label="Female" value="female" field="gender" />
        </>
      )}

      {step === 2 && (
        <>
          <Text className="text-xl font-bold">Weight (kg)</Text>
          <TextInput
            keyboardType="numeric"
            placeholder="Enter weight"
            onChangeText={(t) => setData({ ...data, weight: t })}
            className="bg-white border border-green-100 p-4 mt-4 rounded-xl"
          />
        </>
      )}

      {step === 3 && (
        <>
          <Text className="text-xl font-bold">Height (cm)</Text>
          <TextInput
            keyboardType="numeric"
            placeholder="Enter height"
            onChangeText={(t) => setData({ ...data, height: t })}
            className="bg-white border border-green-100 p-4 mt-4 rounded-xl"
          />
        </>
      )}

      {step === 4 && (
        <>
          <Text className="text-xl font-bold mb-4">
            Activity Level
          </Text>

          <Option label="Sedentary" value="1.2" field="activity" />
          <Option label="Light" value="1.375" field="activity" />
          <Option label="Moderate" value="1.55" field="activity" />
          <Option label="Active" value="1.725" field="activity" />
        </>
      )}

      {step === 5 && (
        <>
          <Text className="text-xl font-bold mb-4">
            Your Goal
          </Text>

          <Option label="Lose Weight" value="lose" field="goal" />
          <Option label="Maintain" value="maintain" field="goal" />
          <Option label="Gain Muscle" value="gain" field="goal" />
        </>
      )}

      {/* 🔥 BUTTON */}
      <TouchableOpacity
        disabled={saving}
        onPress={() => {
          if (step < 5) setStep(step + 1);
          else handleFinish();
        }}
        className="mt-10"
      >
        <LinearGradient
          colors={saving ? ["#9CA3AF", "#6B7280"] : ["#22C55E", "#16A34A"]}
          style={{ borderRadius: 18, padding: 16 }}
        >
          <Text className="text-white text-center text-lg font-bold">
            {saving ? "Saving..." : step === 5 ? "Finish" : "Next"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

    </ScrollView>
  );
}
