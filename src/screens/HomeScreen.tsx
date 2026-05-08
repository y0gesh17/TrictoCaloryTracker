import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  NavigationProp,
  useIsFocused,
} from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { getGoalForDate } from "../db/getGoalForDate";
import { getWeightByDate } from "../db/getWeightByDate";

import { getTodayMeals } from "../db/getMealsByType";
import { getTodaySummary } from "../db/getSummary";
import { saveWeight } from "../db/saveWeight";
import { toDateKey } from "../utils/date";
type RootStackParamList = {
  Home: undefined;
  AddFood: { mealType: string; date: string };
};
type Goals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};
type IconName = React.ComponentProps<typeof Ionicons>["name"];

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [summary, setSummary] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [goals, setGoals] = useState<Goals>({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 60,
  });

  const [meals, setMeals] = useState<any[]>([]);
  
  const [weight, setWeight] = useState("");
  const [saved, setSaved] = useState(false);
  const [savingWeight, setSavingWeight] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const isFocused = useIsFocused();

  // LOAD DATA
  // const loadData = useCallback(async () => {
  //   const data = await getTodaySummary();
  //   const mealData = await getTodayMeals();
  //   const goalData = await getUserGoals();

  //   setSummary(data);
  //   setMeals(mealData);
  //   setGoals(goalData);
  // }, []);
//   const loadData = useCallback(async () => {
//   // const data = await getTodaySummary();
//   // const mealData = await getTodayMeals();
//   const date = toDateKey(selectedDate);

// const data = await getTodaySummary(date);
// const mealData = await getTodayMeals(date);
//   const goalData = await getUserGoals();

//   //const date = toDateKey(selectedDate);
//   const weightData = await getWeightByDate(date);

//   setSummary(data);
//   setMeals(mealData);
//   setGoals(goalData);
//   setWeight(weightData?.toString() || "");
// }, [selectedDate]);
const loadData = useCallback(async () => {
  const date = toDateKey(selectedDate);

  const data = await getTodaySummary(date);
  const mealData = await getTodayMeals(date);
  // const goalData = await getUserGoals();
 console.log("📅 Loading data for date:", data);


  const goalData = await getGoalForDate(date);
  console.log("🎯 Goal for date:", goalData);
  // setGoals({
  //   calories: Number(goalData.calories),
  //   protein: Number(goalData.protein),
  //   carbs: Number(goalData.carbs),
  //   fat: Number(goalData.fat),
  // });
   // console.log("OP", goalData);

  //const goalData = await getGoalForDate(date);
//const goalData = await getGoalForDate(date);
  const weightData = await getWeightByDate(date);

  setSummary(data);
  setMeals(mealData);

setGoals({
  calories: Number(goalData.calories),
  protein: Number(goalData.protein),
  carbs: Number(goalData.carbs),
  fat: Number(goalData.fat),
});
console.log("⚖️ goal for date:", goals);

  setWeight(weightData?.toString() || "");
}, [selectedDate]);

  // useFocusEffect(
  //   useCallback(() => {
  //     loadData();
  //   }, [loadData])
  // );

  useEffect(() => {
  if (isFocused) {
    loadData();
  }
}, [isFocused, loadData]);

  // CALCULATIONS
  const caloriesLeft = Math.max(goals.calories - summary.calories, 0);
  const progress = Math.min(summary.calories / goals.calories, 1);

  const macros: { label: string; value: string; icon: IconName }[] = [
    {
      label: "Protein",
      value: `${Math.floor(summary.protein)}/${goals.protein}g`,
      icon: "restaurant",
    },
    { label: "Carbs", value: `${Math.floor(summary.carbs)}/${goals.carbs}g`, icon: "leaf" },
    { label: "Fats", value: `${Math.floor(summary.fat)}/${goals.fat}g`, icon: "water" },
  ];
  const getLast7Days = () => {
  return [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
};

const days = getLast7Days();

const isSameDay = (d1: Date, d2: Date) =>
  d1.toDateString() === d2.toDateString();

  const mealIcons: Record<string, IconName> = {
    Breakfast: "sunny",
    Lunch: "restaurant",
    Snacks: "cafe",
    Dinner: "moon",
  };

  // const handleSaveWeight = () => {
  //   if (weight.trim()) {
  //     setSaved(true);
  //     setTimeout(() => setSaved(false), 2000);
  //   }
  // };
const handleSaveWeight = async () => {
  if (savingWeight) return;

  try {
    if (!weight.trim()) return;
    setSavingWeight(true);

    const date = toDateKey(selectedDate);

    await saveWeight(Number(weight), date);

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    console.log("✅ Weight saved");

  } catch (err) {
    console.log("❌ Error saving weight", err);
  } finally {
    setSavingWeight(false);
  }
};

  return (
    <SafeAreaView className="flex-1 bg-[#F7FAF5]">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* HEADER */}
        <View className="flex-row justify-between items-center px-4 py-3">
          <View>
            <Text className="text-2xl font-bold text-gray-950">Tricto Cal</Text>
            <Text className="text-xs text-gray-500 mt-1">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>

          <LinearGradient
            colors={["#FFF7ED", "#DCFCE7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}
          >
            <Text className="font-bold text-gray-900">🔥 {Math.floor(summary.calories)}</Text>
          </LinearGradient>
        </View>
        {/* 📅 HORIZONTAL CALENDAR */}
<ScrollView
  horizontal
  keyboardShouldPersistTaps="handled"
  showsHorizontalScrollIndicator={false}
  className="px-4 mt-3"
>
  {days.map((day, index) => {
    const selected = isSameDay(day, selectedDate);

    return (
      <TouchableOpacity
        key={index}
        onPress={() => setSelectedDate(day)}
        className="mr-3 items-center"
      >
        <Text className="text-gray-500">
          {day.toLocaleDateString("en-US", { weekday: "short" })}
        </Text>

        {selected ? (
          <LinearGradient
            colors={["#22C55E", "#F97316"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              marginTop: 4,
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text className="text-white font-bold">{day.getDate()}</Text>
          </LinearGradient>
        ) : (
          <View className="mt-1 w-10 h-10 rounded-full items-center justify-center bg-white border border-gray-200">
            <Text className="text-gray-700">{day.getDate()}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  })}
</ScrollView>

        {/* 🔥 MAIN CARD */}
        <LinearGradient
          colors={["#FFFFFF", "#ECFDF5", "#FFF7ED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            marginHorizontal: 16,
            marginTop: 20,
            borderRadius: 28,
            padding: 20,
            shadowColor: "#16a34a",
            shadowOpacity: 0.12,
            shadowRadius: 18,
            elevation: 4,
          }}
        >

          {/* TOP */}
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-3xl font-bold">
                {Math.floor(summary.calories)}/{goals.calories}
              </Text>

              <Text className="text-gray-500 mt-1">
                Remaining{" "}
                <Text className="font-bold">{caloriesLeft}</Text>
              </Text>
              <Text className="text-gray-400 text-xs mt-2">
                Active goal: P {goals.protein}g • C {goals.carbs}g • F {goals.fat}g
              </Text>
            </View>

            {/* FLAME */}
            <View className="w-20 h-20 rounded-full border-4 border-white items-center justify-center overflow-hidden bg-orange-100">
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  height: `${progress * 100}%`,
                  width: "100%",
                  backgroundColor: "#fb923c",
                }}
              />
              <Ionicons name="flame" size={28} color="white" />
            </View>
          </View>

          {/* MACROS */}
          <View className="flex-row justify-between mt-5">
            {macros.map((item, i) => (
              <View
                key={i}
                className="bg-white/90 w-[31%] rounded-2xl p-3 items-center shadow-sm"
              >
                <Text className="text-sm font-semibold">{item.value}</Text>
                <Text className="text-xs text-gray-500 text-center">
                  {item.label}
                </Text>

                <LinearGradient
                  colors={["#DCFCE7", "#FFEDD5"]}
                  style={{
                    marginTop: 12,
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name={item.icon} size={20} color="#166534" />
                </LinearGradient>
              </View>
            ))}
          </View>

          {/* WEIGHT INPUT */}
          <View className="mt-5">
            <Text className="text-gray-500 mb-2">Weight (kg)</Text>

            <View className="flex-row items-center">
              <TextInput
                value={weight}
                onChangeText={(t) => {
                  setWeight(t);
                  setSaved(false);
                }}
                placeholder="Enter weight"
                keyboardType="numeric"
                className="flex-1 bg-white/90 border border-white rounded-xl px-3 py-2"
              />

              <TouchableOpacity
                disabled={savingWeight}
                onPress={handleSaveWeight}
              >
                <LinearGradient
                  colors={savingWeight ? ["#9CA3AF", "#6B7280"] : ["#111827", "#166534"]}
                  style={{
                    marginLeft: 8,
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                  }}
                >
                  <Text className="text-white font-semibold">
                    {savingWeight ? "Saving..." : "Save"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {saved && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color="green"
                  style={{ marginLeft: 8 }}
                />
              )}
            </View>
          </View>
        </LinearGradient>

        {/* MEALS */}
        <View className="mx-4 mt-5">
          <Text className="text-lg font-semibold mb-3">Meals</Text>

          {meals.length === 0 && (
            <LinearGradient
              colors={["#FFFFFF", "#ECFDF5"]}
              style={{
                borderRadius: 24,
                padding: 20,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Ionicons name="restaurant-outline" size={36} color="#16a34a" />
              <Text className="font-bold text-gray-950 mt-2">No meals logged yet</Text>
              <Text className="text-gray-500 text-center text-sm mt-1">
                Add your first meal for this date.
              </Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("AddFood", {
                    mealType: "Breakfast",
                    date: toDateKey(selectedDate),
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
            </LinearGradient>
          )}

          {["Breakfast", "Lunch", "Snacks", "Dinner"].map((type) => {
            const meal = meals.find(
              (m) => m.meal_type?.toLowerCase() === type.toLowerCase()
            );

            return (
              <View
                key={type}
                className="bg-white rounded-2xl p-4 mb-3 flex-row justify-between items-center shadow-sm"
              >
                <View className="flex-row items-center space-x-3">

                  {meal?.image ? (
                    <Image
                      source={{ uri: meal.image }}
                      className="w-12 h-12 rounded-xl"
                    />
                  ) : (
                    <LinearGradient
                      colors={["#DCFCE7", "#FFEDD5"]}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 16,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name={mealIcons[type]} size={20} color="#166534" />
                    </LinearGradient>
                  )}

                  <View>
                    <Text className="font-semibold">{type}</Text>
                    <Text className="text-gray-400 text-xs">
                      {meal?.total_calories
                        ? `${Math.round(meal.total_calories)} kcal`
                        : "No data"}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("AddFood", {
                      mealType: type,
                      date: toDateKey(selectedDate),
                    })
                  }
                >
                  <LinearGradient
                    colors={["#22C55E", "#16A34A"]}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="add" color="white" size={20} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
// import React, { useCallback, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   Image,
//   Dimensions,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import {
//   useNavigation,
//   NavigationProp,
//   useFocusEffect,
// } from "@react-navigation/native";

// import DateTimePicker from "@react-native-community/datetimepicker";

// import { getTodayMeals } from "../db/getMealsByType";
// import { getTodaySummary } from "../db/getSummary";

// const { width } = Dimensions.get("window");

// type RootStackParamList = {
//   Home: undefined;
//   AddFood: { mealType: string };
// };

// const CALORIE_GOAL = 2000;

// const HomeScreen = () => {
//   const navigation = useNavigation<NavigationProp<RootStackParamList>>();

//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [showPicker, setShowPicker] = useState(false);
//   const [page, setPage] = useState(0);

//   const [summary, setSummary] = useState({
//     calories: 0,
//     protein: 0,
//     carbs: 0,
//     fat: 0,
//   });

//   const [meals, setMeals] = useState<any[]>([]);

//   // 🔥 LOAD DATA BASED ON DATE
//   const loadData = useCallback(async () => {
//     const dateStr = toDateKey(selectedDate);

//     const data = await getTodaySummary(dateStr);
//     const mealData = await getTodayMeals(dateStr);

//     setSummary(data);
//     setMeals(mealData);
//   }, [selectedDate]);

//   useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

//   // 🔥 7 DAY RANGE
//   const getLast7Days = () => {
//     return [...Array(7)].map((_, i) => {
//       const d = new Date();
//       d.setDate(d.getDate() - (6 - i));
//       return d;
//     });
//   };

//   const days = getLast7Days();

//   const isSameDay = (d1: Date, d2: Date) =>
//     d1.toDateString() === d2.toDateString();

//   const progress = Math.min(summary.calories / CALORIE_GOAL, 1);

//   return (
//     <SafeAreaView className="flex-1 bg-[#F6F6F6]">
//       <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>

//         {/* HEADER */}
//         <View className="flex-row justify-between items-center px-4 py-2">

//           <Text className="text-xl font-semibold">Tricto Cal</Text>

//           {/* DATE SELECTOR */}
//           <TouchableOpacity onPress={() => setShowPicker(true)}>
//             <Text className="text-gray-600">
//               {selectedDate.toDateString()}
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* 📅 HORIZONTAL CALENDAR */}
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           className="px-4 mt-3"
//         >
//           {days.map((day, index) => {
//             const selected = isSameDay(day, selectedDate);

//             return (
//               <TouchableOpacity
//                 key={index}
//                 onPress={() => setSelectedDate(day)}
//                 className={`mr-3 items-center`}
//               >
//                 <Text className="text-gray-500">
//                   {day.toLocaleDateString("en-US", { weekday: "short" })}
//                 </Text>

//                 <View
//                   className={`mt-1 w-10 h-10 rounded-full items-center justify-center ${
//                     selected
//                       ? "bg-black"
//                       : "border border-dashed border-gray-300"
//                   }`}
//                 >
//                   <Text className={selected ? "text-white" : "text-gray-700"}>
//                     {day.getDate()}
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             );
//           })}
//         </ScrollView>

//         {/* 📊 SWIPE CARDS */}
//         <ScrollView
//           horizontal
//           pagingEnabled
//           showsHorizontalScrollIndicator={false}
//           onScroll={(e) => {
//             const pageIndex = Math.round(
//               e.nativeEvent.contentOffset.x / width
//             );
//             setPage(pageIndex);
//           }}
//         >
//           {/* 🔥 CARD 1: CALORIES + MACROS */}
//           <View style={{ width }} className="px-4 mt-5">
//             <View className="bg-white rounded-2xl p-5">

//               <Text className="text-2xl font-bold">
//                 {summary.calories}/{CALORIE_GOAL}
//               </Text>

//               <Text className="text-gray-500">
//                 Remaining {Math.max(CALORIE_GOAL - summary.calories, 0)}
//               </Text>

//               {/* 🔥 FLAME */}
//               <View className="mt-4 w-20 h-20 rounded-full border-4 border-gray-200 items-center justify-center overflow-hidden">
//                 <View
//                   style={{
//                     position: "absolute",
//                     bottom: 0,
//                     height: `${progress * 100}%`,
//                     width: "100%",
//                     backgroundColor: "#f97316",
//                   }}
//                 />
//                 <Ionicons name="flame" size={28} color="white" />
//               </View>

//               {/* MACROS */}
//               <View className="flex-row justify-between mt-5">
//                 <Text>Protein {summary.protein}</Text>
//                 <Text>Carbs {summary.carbs}</Text>
//                 <Text>Fat {summary.fat}</Text>
//               </View>
//             </View>
//           </View>

//           {/* ⚖️ CARD 2: WEIGHT */}
//           <View style={{ width }} className="px-4 mt-5">
//             <View className="bg-white rounded-2xl p-5 items-center">
//               <Text className="text-lg font-semibold">
//                 Add Weight
//               </Text>

//               <TouchableOpacity className="mt-4 bg-black px-6 py-3 rounded-xl">
//                 <Text className="text-white">Add Weight</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </ScrollView>

//         {/* 🔘 DOTS */}
//         <View className="flex-row justify-center mt-2">
//           {[0, 1].map((i) => (
//             <View
//               key={i}
//               className={`w-2 h-2 mx-1 rounded-full ${
//                 page === i ? "bg-black" : "bg-gray-300"
//               }`}
//             />
//           ))}
//         </View>

//         {/* 🍽️ MEALS (UNCHANGED BUT DATE BASED NOW) */}
//         <View className="mx-4 mt-5">
//           <Text className="text-lg font-semibold mb-3">Meals</Text>

//           {["Breakfast", "Lunch", "Snacks", "Dinner"].map((type) => {
//             const meal = meals.find(
//               (m) => m.meal_type?.toLowerCase() === type.toLowerCase()
//             );

//             return (
//               <View
//                 key={type}
//                 className="bg-white rounded-2xl p-4 mb-3 flex-row justify-between items-center"
//               >
//                 <View className="flex-row items-center space-x-3">

//                   {meal?.image ? (
//                     <Image
//                       source={{ uri: meal.image }}
//                       className="w-12 h-12 rounded-xl"
//                     />
//                   ) : (
//                     <View className="w-12 h-12 bg-gray-200 rounded-xl items-center justify-center">
//                       <Ionicons name="restaurant" size={20} />
//                     </View>
//                   )}

//                   <View>
//                     <Text className="font-semibold">{type}</Text>
//                     <Text className="text-gray-400 text-xs">
//                       {meal?.total_calories
//                         ? `${Math.round(meal.total_calories)} kcal`
//                         : "No data"}
//                     </Text>
//                   </View>
//                 </View>

//                 <TouchableOpacity
//                   onPress={() =>
//                     navigation.navigate("AddFood", { mealType: type })
//                   }
//                   className="bg-green-500 px-3 py-2 rounded-full"
//                 >
//                   <Ionicons name="add" color="white" />
//                 </TouchableOpacity>
//               </View>
//             );
//           })}
//         </View>
//       </ScrollView>

//       {/* 📅 DATE PICKER */}
//       {showPicker && (
//         <DateTimePicker
//           value={selectedDate}
//           mode="date"
//           onChange={(e, date) => {
//             setShowPicker(false);
//             if (date) setSelectedDate(date);
//           }}
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// export default HomeScreen;
