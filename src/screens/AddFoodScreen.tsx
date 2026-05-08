import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Modal,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  RouteProp,
} from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import { addFoodLog } from "../db/foodService";
import { isFutureDateKey, toDateKey } from "../utils/date";
import AppAlert from "../components/AppAlert";


// ✅ NAVIGATION TYPES
type RootStackParamList = {
  AddFood: {
    date?: string;
    mealType?: string;
  };
};

type AddFoodRouteProp = RouteProp<RootStackParamList, "AddFood">;

export default function AddFoodScreen() {
  const navigation = useNavigation();
  const route = useRoute<AddFoodRouteProp>();

  // ✅ FIXED TIMER TYPE
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [mode, setMode] = useState<"text" | "image" | "manual" | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [manualFood, setManualFood] = useState({
    food_name: "",
    weight: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });
  const [showModal, setShowModal] = useState(false);

  const [mealType, setMealType] = useState("Breakfast");
  const [showDropdown, setShowDropdown] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [appAlert, setAppAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "warning" | "danger" | "info",
  });

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "warning" | "danger" | "info" = "info"
  ) => {
    setAppAlert({ visible: true, title, message, type });
  };

  // ✅ INIT FROM NAV PARAMS
  useEffect(() => {
    if (route.params?.mealType) {
      setMealType(route.params.mealType);
    }
  }, [route.params?.mealType]);

  // ✅ CLEANUP TIMER
  useEffect(() => {
    return () => {
      if (successTimer.current) {
        clearTimeout(successTimer.current);
      }
    };
  }, []);

  // 🎯 STEPS
 const getSteps = () => {
  if (mode === "text") {
    return [
      "Enter your food description",
      "Tap 'Share Prompt' (copies + opens ChatGPT)",
      "Paste in ChatGPT and send",
      "Copy JSON response from ChatGPT",
      "Paste JSON here and save",
    ];
  }

  if (mode === "image") {
    return [
      "Select or capture food image",
      "Tap 'Copy Prompt'",
      "Open ChatGPT and upload image",
      "Paste copied prompt and send",
      "Copy JSON response from ChatGPT",
      "Paste JSON here and save",
    ];
  }

  if (mode === "manual") {
    return [
      "Enter food name and nutrition values",
      "Choose the correct meal type",
      "Tap Save Food",
    ];
  }

  return ["Select Text or Image to begin"];
};

  const getPrompt = () => `
Analyze the following and return ONLY JSON ARRAY.

Format:
[
  {
    "food_name": "",
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "weight": number
  }
]

Input:
${inputText}
`;

  const resetMode = () => {
    setMode(null);
    setImage(null);
    setInputText("");
    setJsonInput("");
    setManualFood({
      food_name: "",
      weight: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    });
  };

  // 📷 IMAGE
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({});
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({});
    if (!result.canceled) setImage(result.assets[0].uri);
  };
const handleBack = () => {
  if (mode) {
    // go back to mode selection
    setMode(null);
    setImage(null);
    setInputText("");
    setJsonInput("");
    setManualFood({
      food_name: "",
      weight: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    });
  } else {
    // go back to previous screen
    navigation.goBack();
  }
};
  // 🔗 TEXT
  const shareText = async () => {
    const prompt = getPrompt();
    await Clipboard.setStringAsync(prompt);
    await Share.share({ message: prompt });
  };

  const copyPrompt = async () => {
    await Clipboard.setStringAsync(getPrompt());
  };

  const shareImage = async () => {
    if (image) await Sharing.shareAsync(image);
  };

  // 💾 SAVE
  const handleSubmit = async () => {
    if (saving) return;

    try {
      setSaving(true);
      let cleaned = jsonInput.trim();
      cleaned = cleaned.replace(/```json/g, "").replace(/```/g, "");

      const data = JSON.parse(cleaned);
      if (!Array.isArray(data)) {
        throw new Error("JSON must be an array");
      }

      // ✅ FIXED TYPE SAFE ACCESS
      const logDate =
        route.params?.date ||
        toDateKey();

      if (isFutureDateKey(logDate)) {
        showAlert(
          "Future Date Blocked",
          "You can only add food for today or past dates.",
          "warning"
        );
        return;
      }

      for (let item of data) {
        await addFoodLog({
          food_name: item.food_name,
          weight: item.weight || 100,
          calories: item.calories || 0,
          protein: item.protein || 0,
          carbs: item.carbs || 0,
          fat: item.fat || 0,
          date: logDate,
          meal_type: mealType,
          image_uri: image || null,
        });
      }

      setShowSuccess(true);
      setShowModal(false);

      successTimer.current = setTimeout(() => {
        setShowSuccess(false);
        navigation.goBack();
      }, 2000);

      resetMode();
    } catch {
      showAlert("Invalid JSON", "Paste a valid JSON array before saving.", "warning");
    } finally {
      setSaving(false);
    }
  };

  const handleManualSubmit = async () => {
    if (saving) return;

    if (!manualFood.food_name.trim()) {
      showAlert("Food Name Required", "Enter a food name before saving.", "warning");
      return;
    }

    try {
      setSaving(true);
      const logDate =
        route.params?.date ||
        toDateKey();

      if (isFutureDateKey(logDate)) {
        showAlert(
          "Future Date Blocked",
          "You can only add food for today or past dates.",
          "warning"
        );
        return;
      }

      await addFoodLog({
        food_name: manualFood.food_name.trim(),
        weight: Number(manualFood.weight || 100),
        calories: Number(manualFood.calories || 0),
        protein: Number(manualFood.protein || 0),
        carbs: Number(manualFood.carbs || 0),
        fat: Number(manualFood.fat || 0),
        date: logDate,
        meal_type: mealType,
        image_uri: null,
      });

      setShowSuccess(true);
      setShowModal(false);

      successTimer.current = setTimeout(() => {
        setShowSuccess(false);
        navigation.goBack();
      }, 2000);

      resetMode();
    } catch {
      showAlert("Save Failed", "Please check the values and try again.", "danger");
    } finally {
      setSaving(false);
    }
  };

  const manualFields = [
    { key: "food_name", label: "Food name", keyboardType: "default", placeholder: "e.g. Rice bowl" },
    { key: "weight", label: "Weight", keyboardType: "numeric", placeholder: "100" },
    { key: "calories", label: "Calories", keyboardType: "numeric", placeholder: "250" },
    { key: "protein", label: "Protein", keyboardType: "numeric", placeholder: "10" },
    { key: "carbs", label: "Carbs", keyboardType: "numeric", placeholder: "35" },
    { key: "fat", label: "Fat", keyboardType: "numeric", placeholder: "8" },
  ] as const;

  return (
    <SafeAreaView className="flex-1 bg-[#F7FAF5]">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >

        {/* HEADER */}
    <LinearGradient
      colors={["#FFFFFF", "#ECFDF5"]}
      style={{
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 24,
        paddingHorizontal: 12,
        paddingVertical: 10,
        shadowColor: "#16a34a",
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 2,
      }}
    >
    <View className="flex-row items-center justify-between">

  {/* 🔙 BACK BUTTON */}
  <TouchableOpacity onPress={handleBack} className="p-2">
    <Ionicons name="arrow-back" size={24} color="#111827" />
  </TouchableOpacity>

  <View className="items-center">
    <Text className="text-xl font-bold text-gray-950">Add Food</Text>
    <Text className="text-xs text-gray-500">Log your meal</Text>
  </View>

  {/* INFO BUTTON */}
  <TouchableOpacity onPress={() => setShowModal(true)}>
    <Ionicons name="information-circle-outline" size={26} color="#166534" />
  </TouchableOpacity>

</View>
    </LinearGradient>
        {/* MODE */}
        {!mode && (
          <View className="mx-4 mt-6 flex-row flex-wrap justify-between">
            <TouchableOpacity
              onPress={() => {
                setMode("text");
                setShowModal(true);
              }}
              className="w-[48%]"
            >
              <LinearGradient
                colors={["#FFFFFF", "#DCFCE7"]}
                style={{
                  width: "100%",
                  height: 144,
                  borderRadius: 24,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View className="w-14 h-14 rounded-full bg-white items-center justify-center mb-3">
                  <Ionicons name="create" size={30} color="#16a34a" />
                </View>
                <Text className="font-bold text-gray-900">Text</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setMode("image");
                setShowModal(true);
              }}
              className="w-[48%]"
            >
              <LinearGradient
                colors={["#FFFFFF", "#FFEDD5"]}
                style={{
                  width: "100%",
                  height: 144,
                  borderRadius: 24,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View className="w-14 h-14 rounded-full bg-white items-center justify-center mb-3">
                  <Ionicons name="camera" size={30} color="#f97316" />
                </View>
                <Text className="font-bold text-gray-900">Image</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setMode("manual");
              }}
              className="w-full mt-4"
            >
              <LinearGradient
                colors={["#111827", "#166534"]}
                style={{
                  width: "100%",
                  height: 96,
                  borderRadius: 24,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="create-outline" size={30} color="white" />
                <Text className="font-bold text-white mt-2">Quick Manual Add</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* MEAL SELECTOR */}
        {mode && (
          <View className="mx-4 mt-4 bg-white p-4 rounded-2xl shadow-sm">
            <Text className="mb-2 font-semibold">Meal Type</Text>

            <TouchableOpacity
              onPress={() => setShowDropdown(!showDropdown)}
              className="bg-green-50 p-3 rounded-xl flex-row justify-between"
            >
              <Text>{mealType}</Text>
              <Ionicons name="chevron-down" />
            </TouchableOpacity>

            {showDropdown && (
              <View className="bg-gray-100 mt-2 rounded-xl">
                {["Breakfast", "Lunch", "Snacks", "Dinner"].map((item) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => {
                      setMealType(item);
                      setShowDropdown(false);
                    }}
                    className="p-3 border-b border-gray-200"
                  >
                    <Text>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* TEXT */}
        {mode === "text" && (
          <View className="mx-4 mt-4 bg-white p-4 rounded-2xl">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Enter food"
              multiline
              className="bg-green-50 p-3 rounded-xl min-h-[110px]"
            />

            <TouchableOpacity
              onPress={shareText}
            >
              <LinearGradient
                colors={["#111827", "#166534"]}
                style={{ borderRadius: 16, paddingVertical: 14, marginTop: 16 }}
              >
                <Text className="text-white text-center font-semibold">Share Prompt</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* IMAGE */}
        {mode === "image" && (
          <View className="mx-4 mt-4">
            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={pickImage}
                className="w-[48%]"
              >
                <LinearGradient
                  colors={["#FFFFFF", "#DCFCE7"]}
                  style={{
                    width: "100%",
                    height: 128,
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="images" size={28} color="#16a34a" />
                  <Text className="font-semibold mt-2">Gallery</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={takePhoto}
                className="w-[48%]"
              >
                <LinearGradient
                  colors={["#FFFFFF", "#FFEDD5"]}
                  style={{
                    width: "100%",
                    height: 128,
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="camera" size={28} color="#f97316" />
                  <Text className="font-semibold mt-2">Camera</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {image && (
              <>
                <Image source={{ uri: image }} className="h-40 mt-4 rounded-2xl" />

                <TouchableOpacity
                  onPress={copyPrompt}
                  className="bg-gray-200 mt-4 py-3 rounded-xl"
                >
                  <Text className="text-center">Copy Prompt</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={shareImage}
                >
                  <LinearGradient
                    colors={["#111827", "#166534"]}
                    style={{ borderRadius: 16, paddingVertical: 14, marginTop: 12 }}
                  >
                    <Text className="text-white text-center font-semibold">Share Image</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* MANUAL */}
        {mode === "manual" && (
          <View className="mx-4 mt-4 bg-white p-4 rounded-2xl shadow-sm">
            <Text className="font-bold text-lg mb-3">Quick Add Food</Text>

            {manualFields.map((field) => (
              <View key={field.key} className="mb-3">
                <Text className="text-gray-500 mb-1">{field.label}</Text>
                <TextInput
                  value={manualFood[field.key]}
                  onChangeText={(text) =>
                    setManualFood({ ...manualFood, [field.key]: text })
                  }
                  placeholder={field.placeholder}
                  keyboardType={field.keyboardType}
                  className="bg-green-50 p-3 rounded-xl"
                />
              </View>
            ))}

            <TouchableOpacity
              disabled={saving}
              onPress={handleManualSubmit}
            >
              <LinearGradient
                colors={saving ? ["#9CA3AF", "#6B7280"] : ["#22C55E", "#16A34A"]}
                style={{ borderRadius: 16, paddingVertical: 16, marginTop: 4 }}
              >
                <Text className="text-white text-center font-bold">
                  {saving ? "Saving..." : "Save Food"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* JSON */}
        {(mode === "text" || mode === "image") && (
          <View className="mx-4 mt-4 bg-white p-4 rounded-2xl shadow-sm">
            <TextInput
              value={jsonInput}
              onChangeText={setJsonInput}
              placeholder="Paste JSON"
              multiline
              className="bg-green-50 p-3 rounded-xl min-h-[120px]"
            />

            <TouchableOpacity
              disabled={saving}
              onPress={handleSubmit}
            >
              <LinearGradient
                colors={saving ? ["#9CA3AF", "#6B7280"] : ["#22C55E", "#16A34A"]}
                style={{ borderRadius: 16, paddingVertical: 16, marginTop: 16 }}
              >
                <Text className="text-white text-center font-bold">
                  {saving ? "Saving..." : "Save Food"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* MODAL */}
      <Modal visible={showModal} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-end">
          <LinearGradient
            colors={["#FFFFFF", "#ECFDF5"]}
            style={{ borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20 }}
          >

            <View className="flex-row justify-between mb-4">
              <Text className="text-xl font-bold">Instructions</Text>

              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} />
              </TouchableOpacity>
            </View>

            {getSteps().map((step, i) => (
              <Text key={i} className="mb-2">
                {i + 1}. {step}
              </Text>
            ))}

          </LinearGradient>
        </View>
      </Modal>

      <Modal visible={showSuccess} transparent animationType="fade">
        <View className="flex-1 bg-black/45 items-center justify-center px-6">
          <LinearGradient
            colors={["#FFFFFF", "#ECFDF5", "#FFF7ED"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: "100%",
              borderRadius: 30,
              padding: 24,
              alignItems: "center",
              shadowColor: "#16a34a",
              shadowOpacity: 0.22,
              shadowRadius: 24,
              elevation: 8,
            }}
          >
            <LinearGradient
              colors={["#22C55E", "#16A34A"]}
              style={{
                width: 86,
                height: 86,
                borderRadius: 43,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
              }}
            >
              <Ionicons name="checkmark" size={46} color="white" />
            </LinearGradient>

            <Text className="text-2xl font-bold text-gray-950 text-center">
              Food Added
            </Text>
            <Text className="text-gray-500 text-center mt-2 leading-5">
              Your meal was saved successfully and your daily log is now updated.
            </Text>

            <View className="flex-row mt-5 bg-white/80 rounded-2xl px-4 py-3">
              <View className="items-center px-3">
                <Ionicons name="restaurant" size={18} color="#16a34a" />
                <Text className="text-xs text-gray-500 mt-1">{mealType}</Text>
              </View>

              <View className="w-px bg-gray-200 mx-2" />

              <View className="items-center px-3">
                <Ionicons name="calendar" size={18} color="#f97316" />
                <Text className="text-xs text-gray-500 mt-1">
                  {route.params?.date || "Today"}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </Modal>

      <AppAlert
        visible={appAlert.visible}
        title={appAlert.title}
        message={appAlert.message}
        type={appAlert.type}
        onClose={() => setAppAlert((alert) => ({ ...alert, visible: false }))}
      />
    </SafeAreaView>
  );
}
