import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  useWindowDimensions,
  TextInput,
} from "react-native";
import {
  getCalendarSummary,
  getMealsWithFoods,
  getWeightByDate,
} from "../db/progressService";
import { Calendar } from "react-native-calendars";
import { useFocusEffect, useNavigation, NavigationProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { deleteFoodLog, updateFoodLog } from "../db/foodService";
import { getGoalForDate } from "../db/getGoalForDate";
import { isFutureDateKey, toDateKey } from "../utils/date";
import AppAlert from "../components/AppAlert";
const CALORIE_GOAL = 2000;
type AppAlertAction = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "danger" | "muted";
};
type RootStackParamList = {
  AddFood: { mealType: string; date: string };
};

export default function ProgressScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const today = new Date();
  const { width } = useWindowDimensions();
  const calendarCardWidth = Math.max(width - 24, 300);
  const calendarWidth = calendarCardWidth - 12;

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [foods, setFoods] = useState<any[]>([]);
  const [weight, setWeight] = useState<any>(null);
const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [editingFood, setEditingFood] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    food_name: "",
    weight: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    meal_type: "Breakfast",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [appAlert, setAppAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "warning" | "danger" | "info";
    actions?: AppAlertAction[];
  }>({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });
  const currentMonth = `${year}-${String(month).padStart(2, "0")}-01`;

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "warning" | "danger" | "info" = "info",
    actions?: AppAlertAction[]
  ) => {
    setAppAlert({ visible: true, title, message, type, actions });
  };

  const loadCalendar = useCallback(async () => {
    const data = await getCalendarSummary(year, month);
    setCalendarData(data);
  }, [month, year]);

  useFocusEffect(
    useCallback(() => {
      loadCalendar();
    }, [loadCalendar])
  );

  const handleDateClick = async (date: string) => {
    if (isFutureDateKey(date)) {
      showAlert(
        "Future Date Blocked",
        "You can only add or view logs for today or past dates.",
        "warning"
      );
      return;
    }

    setSelectedDate(date);

    const mealData = await getMealsWithFoods(date);
    const weightData = await getWeightByDate(date);
    const goalData = await getGoalForDate(date);

    setFoods(mealData);
    setWeight(weightData?.weight || null);
    setSelectedGoal(goalData);
  };

  const startEditFood = (item: any) => {
    setEditingFood(item);
    setEditForm({
      food_name: item.food_name?.toString() || "",
      weight: item.weight?.toString() || "",
      calories: item.calories?.toString() || "",
      protein: item.protein?.toString() || "",
      carbs: item.carbs?.toString() || "",
      fat: item.fat?.toString() || "",
      meal_type: item.meal_type || "Breakfast",
    });
  };

  const handleUpdateFood = async () => {
    if (!editingFood || savingEdit) return;

    try {
      setSavingEdit(true);
      await updateFoodLog(editingFood.id, {
        food_name: editForm.food_name.trim() || "Food",
        weight: Number(editForm.weight || 100),
        calories: Number(editForm.calories || 0),
        protein: Number(editForm.protein || 0),
        carbs: Number(editForm.carbs || 0),
        fat: Number(editForm.fat || 0),
        meal_type: editForm.meal_type,
      });

      if (selectedDate) {
        await handleDateClick(selectedDate);
        await loadCalendar();
      }

      setEditingFood(null);
    } catch {
      showAlert("Update Failed", "Please check the values and try again.", "danger");
    } finally {
      setSavingEdit(false);
    }
  };

  const confirmDeleteFood = (item: any) => {
    showAlert("Delete Food?", `Remove ${item.food_name || "this food"} from your log?`, "danger", [
      { label: "Cancel", variant: "muted" },
      {
        label: "Delete",
        variant: "danger",
        onPress: async () => {
          await deleteFoodLog(item.id);
          if (selectedDate) {
            await handleDateClick(selectedDate);
            await loadCalendar();
          }
        },
      },
    ]);
  };

  const editFields = [
    { key: "food_name", label: "Food name", keyboardType: "default" },
    { key: "weight", label: "Weight", keyboardType: "numeric" },
    { key: "calories", label: "Calories", keyboardType: "numeric" },
    { key: "protein", label: "Protein", keyboardType: "numeric" },
    { key: "carbs", label: "Carbs", keyboardType: "numeric" },
    { key: "fat", label: "Fat", keyboardType: "numeric" },
  ] as const;

  const groupedMeals = ["Breakfast", "Lunch", "Snacks", "Dinner"].map(type => ({
    type,
    items: foods.filter(
      f => f.meal_type?.toLowerCase() === type.toLowerCase()
    ),
  }));
  const getMarkedDates = () => {
  const marked: any = {};
  const todayKey = toDateKey();

  calendarData.forEach((item) => {
    const date = item.date;
    const cal = item.total_calories;

    let color = "#e5e7eb"; // gray

    if (cal > CALORIE_GOAL) color = "#ef4444"; // red
    else if (cal > 0) color = "#22c55e"; // green

    marked[date] = {
      customStyles: {
        container: {
          backgroundColor: color,
          borderRadius: 8,
        },
        text: {
          color: "white",
          fontWeight: "bold",
        },
      },
    };
  });

  const daysInMonth = new Date(year, month, 0).getDate();
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    if (date > todayKey && !marked[date]) {
      marked[date] = {
        disabled: true,
        disableTouchEvent: false,
        customStyles: {
          container: {
            backgroundColor: "#f3f4f6",
            borderRadius: 8,
          },
          text: {
            color: "#cbd5e1",
          },
        },
      };
    }
  }

  return marked;
};

  return (
    <SafeAreaView className="flex-1 bg-[#F7FAF5]" edges={["top", "left", "right"]}>
    <ScrollView
      className="flex-1"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 120,
      }}
    >

      {/* HEADER */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity
          onPress={() => {
            setMonth((m) => {
              if (m === 1) {
                setYear((y) => y - 1);
                return 12;
              }

              return m - 1;
            });
          }}
        >
          <View className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm">
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </View>
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-2xl font-bold text-gray-950">Progress</Text>
          <Text className="text-xs text-gray-500 mt-1">
            {month}/{year}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            setMonth((m) => {
              if (m === 12) {
                setYear((y) => y + 1);
                return 1;
              }

              return m + 1;
            });
          }}
        >
          <View className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm">
            <Ionicons name="chevron-forward" size={22} color="#111827" />
          </View>
        </TouchableOpacity>
      </View>

      {/* 📅 CALENDAR GRID */}
      {/* <View className="flex-row flex-wrap justify-between">
        {Array.from({ length: getDaysInMonth() }).map((_, i) => {
          const day = i + 1;

          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

          const data = calendarData.find(d => d.date === dateStr);

          return (
            <TouchableOpacity
              key={day}
              onPress={() => handleDateClick(day)}
              className={`w-[13%] aspect-square rounded-lg items-center justify-center mb-2 ${getColor(data?.total_calories)}`}
            >
              <Text className="text-xs text-white">{day}</Text>
            </TouchableOpacity>
          );
        })}
      </View> */}


      {/* <ModernCalendar
  onSelectDate={(date: string) => {
    console.log("Selected:", date);
    // 👉 call your DB loader here
  }}
/> */}


{/* <Calendar
  onDayPress={(day) => {
    handleDateClick(new Date(day.dateString).getDate());
  }}
  markedDates={getMarkedDates()}
  theme={{
    todayTextColor: "#22c55e",
    selectedDayBackgroundColor: "#000",
    arrowColor: "black",
  }}
/> */}

<LinearGradient
  colors={["#FFFFFF", "#ECFDF5"]}
  style={{
    alignSelf: "center",
    width: calendarCardWidth,
    borderRadius: 28,
    padding: 6,
    shadowColor: "#16a34a",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 3,
    overflow: "hidden",
  }}
>
  <Calendar
    style={{
      width: calendarWidth,
      alignSelf: "center",
    }}
    markingType={"custom"} // 🔥 VERY IMPORTANT
    current={currentMonth}
    markedDates={getMarkedDates()}
    onMonthChange={(calendarMonth) => {
      setMonth(calendarMonth.month);
      setYear(calendarMonth.year);
    }}
    onDayPress={(day) => {
      const selected = day.dateString;
      handleDateClick(selected);
    }}
    theme={{
      calendarBackground: "transparent",
      todayTextColor: "#16a34a",
      arrowColor: "#16a34a",
      textDayFontWeight: "600",
      textMonthFontWeight: "800",
      textDayHeaderFontWeight: "700",
    }}
  />
</LinearGradient>

      {/* 🎨 LEGEND */}
      <View className="flex-row justify-around mt-5 bg-white rounded-2xl py-4 shadow-sm">
        <Legend color="bg-green-400" label="Within Goal" />
        <Legend color="bg-red-400" label="Exceeded" />
        <Legend color="bg-gray-200" label="No Data" />
      </View>

      {calendarData.length === 0 && (
        <View className="bg-white rounded-2xl p-5 mt-5 items-center shadow-sm">
          <Ionicons name="calendar-outline" size={34} color="#16a34a" />
          <Text className="font-bold text-gray-950 mt-2">No progress yet</Text>
          <Text className="text-gray-500 text-center text-sm mt-1">
            Log meals this month to color your calendar.
          </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("AddFood", {
                mealType: "Breakfast",
                date: toDateKey(),
              })
            }
            className="mt-4"
          >
            <LinearGradient
              colors={["#22C55E", "#16A34A"]}
              style={{ borderRadius: 16, paddingHorizontal: 18, paddingVertical: 12 }}
            >
              <Text className="text-white font-bold">Add Food</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* 📊 DAY DETAILS */}
      <Modal visible={!!selectedDate} animationType="slide">
        <SafeAreaView className="flex-1 bg-[#F7FAF5]">
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingTop: 16,
            paddingBottom: 32,
          }}
        >

          <LinearGradient
            colors={["#111827", "#166534"]}
            style={{ borderRadius: 24, padding: 18, marginBottom: 16 }}
          >
            <Text className="text-white text-xl font-bold">{selectedDate}</Text>
            <Text className="text-white/80 mt-2">
              Weight: {weight || "No data"}
            </Text>
            {selectedGoal && (
              <Text className="text-white/80 mt-1">
                Goal: {selectedGoal.calories} kcal • P {selectedGoal.protein}g • C {selectedGoal.carbs}g • F {selectedGoal.fat}g
              </Text>
            )}
          </LinearGradient>

          {foods.length === 0 && (
            <View className="bg-white rounded-2xl p-5 mb-4 items-center shadow-sm">
              <Ionicons name="restaurant-outline" size={34} color="#16a34a" />
              <Text className="font-bold text-gray-950 mt-2">No meals logged yet</Text>
              <Text className="text-gray-500 text-center text-sm mt-1">
                Add food from the Add tab to see meal details here.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedDate(null);
                  navigation.navigate("AddFood", {
                    mealType: "Breakfast",
                    date: selectedDate || toDateKey(),
                  });
                }}
                className="mt-4"
              >
                <LinearGradient
                  colors={["#22C55E", "#16A34A"]}
                  style={{ borderRadius: 16, paddingHorizontal: 18, paddingVertical: 12 }}
                >
                  <Text className="text-white font-bold">Add Food</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* {groupedMeals.map(meal => (
            <View key={meal.type} className="mb-4">

              <Text className="font-bold mb-2">{meal.type}</Text>

              {meal.items.length === 0 ? (
                <Text className="text-gray-400">No data</Text>
              ) : (
                meal.items.map((item, idx) => (
                  <View
                    key={idx}
                    className="flex-row items-center bg-gray-100 p-3 rounded-xl mb-2"
                  >
                    {item.image_uri ? (
                      <Image
                        source={{ uri: item.image_uri }}
                        className="w-10 h-10 rounded-lg mr-3"
                      />
                    ) : (
                      <View className="w-10 h-10 bg-gray-300 rounded-lg mr-3" />
                    )}

                    <View className="flex-1">
                      <Text className="font-semibold">{item.food_name}</Text>
                      <Text className="text-xs text-gray-500">
                        {Math.round(item.calories)} kcal
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          ))} */}
          {groupedMeals.map((meal) => {
  const isOpen = expandedMeal === meal.type;

  const totalCal = meal.items.reduce(
    (sum, item) => sum + (item.calories || 0),
    0
  );

  return (
    <View
      key={meal.type}
      className="bg-white rounded-2xl mb-4 shadow-sm overflow-hidden"
    >
      {/* HEADER */}
      <TouchableOpacity
        onPress={() =>
          setExpandedMeal(isOpen ? null : meal.type)
        }
        className="flex-row justify-between items-center p-4"
      >
        <View>
          <Text className="font-bold text-lg">{meal.type}</Text>
          <Text className="text-gray-500 text-xs">
            {Math.round(totalCal)} kcal
          </Text>
        </View>

        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={22}
          color="#111827"
        />
      </TouchableOpacity>

      {/* DROPDOWN CONTENT */}
      {isOpen && (
        <View className="px-4 pb-4">

          {meal.items.length === 0 ? (
            <Text className="text-gray-400">No data</Text>
          ) : (
            meal.items.map((item, idx) => (
              <View
                key={idx}
                className="flex-row items-center bg-gray-50 p-3 rounded-xl mb-2"
              >
                {/* IMAGE */}
                {item.image_uri ? (
                  <Image
                    source={{ uri: item.image_uri }}
                    className="w-12 h-12 rounded-xl mr-3"
                  />
                ) : (
                  <LinearGradient
                    colors={["#DCFCE7", "#FFEDD5"]}
                    style={{ width: 48, height: 48, borderRadius: 16, marginRight: 12 }}
                  />
                )}

                {/* TEXT */}
                <View className="flex-1">
                  <Text className="font-semibold">
                    {item.food_name}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {Math.round(item.calories)} kcal
                  </Text>
                </View>

                <View className="flex-row">
                  <TouchableOpacity
                    onPress={() => startEditFood(item)}
                    className="w-9 h-9 rounded-full bg-green-50 items-center justify-center mr-2"
                  >
                    <Ionicons name="create-outline" size={18} color="#16a34a" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => confirmDeleteFood(item)}
                    className="w-9 h-9 rounded-full bg-red-50 items-center justify-center"
                  >
                    <Ionicons name="trash-outline" size={18} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

        </View>
      )}
    </View>
  );
})}

          <TouchableOpacity
            onPress={() => setSelectedDate(null)}
          >
            <LinearGradient
              colors={["#111827", "#166534"]}
              style={{ borderRadius: 16, padding: 16, marginTop: 16 }}
            >
              <Text className="text-white text-center font-semibold">Close</Text>
            </LinearGradient>
          </TouchableOpacity>

        </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={!!editingFood} transparent animationType="fade">
        <SafeAreaView className="flex-1 bg-black/40 justify-center px-4">
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 24 }}
          >
            <LinearGradient
              colors={["#FFFFFF", "#ECFDF5"]}
              style={{ borderRadius: 24, padding: 18 }}
            >
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-gray-950">Edit Food</Text>
                <TouchableOpacity onPress={() => setEditingFood(null)}>
                  <Ionicons name="close" size={24} color="#111827" />
                </TouchableOpacity>
              </View>

              <Text className="text-gray-500 mb-2">Meal Type</Text>
              <View className="flex-row flex-wrap mb-3">
                {["Breakfast", "Lunch", "Snacks", "Dinner"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setEditForm({ ...editForm, meal_type: type })}
                    className={`mr-2 mb-2 px-3 py-2 rounded-full ${
                      editForm.meal_type === type ? "bg-green-500" : "bg-white"
                    }`}
                  >
                    <Text
                      className={
                        editForm.meal_type === type ? "text-white" : "text-gray-700"
                      }
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {editFields.map((field) => (
                <View key={field.key} className="mb-3">
                  <Text className="text-gray-500 mb-1">{field.label}</Text>
                  <TextInput
                    value={editForm[field.key]}
                    onChangeText={(text) =>
                      setEditForm({ ...editForm, [field.key]: text })
                    }
                    keyboardType={field.keyboardType}
                    className="bg-white rounded-xl p-3 border border-green-100"
                  />
                </View>
              ))}

              <TouchableOpacity disabled={savingEdit} onPress={handleUpdateFood}>
                <LinearGradient
                  colors={savingEdit ? ["#9CA3AF", "#6B7280"] : ["#22C55E", "#16A34A"]}
                  style={{ borderRadius: 16, padding: 15, marginTop: 8 }}
                >
                  <Text className="text-white text-center font-bold">
                    {savingEdit ? "Saving..." : "Save Changes"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </ScrollView>
        </SafeAreaView>
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

const Legend = ({ color, label }: any) => (
  <View className="items-center">
    <View className={`w-4 h-4 rounded-full ${color}`} />
    <Text className="text-xs mt-1">{label}</Text>
  </View>
);
