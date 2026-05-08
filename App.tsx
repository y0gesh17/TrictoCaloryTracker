import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import BottomTabs from "./src/navigation/BottomTabs";
import "./global.css";
import { initDB } from "./src/db/init";
import { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AddFoodScreen from "@/screens/AddFoodScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OnboardingScreen from "@/screens/OnboardingScreen";
import db from "@/db/database";
const Stack = createStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    const setup = async () => {
      try {
        await initDB();
        await checkOnboarding();
      } catch (error) {
        console.log("❌ Error setting up app", error);
        setLoading(false);
      }
    };
  // resetDatabase();
    setup();
  }, []);

  const checkOnboarding = async () => {
   // await AsyncStorage.setItem("onboardingDone", "false"); // ✅ TEMP: reset onboarding for testing
    const done = await AsyncStorage.getItem("onboardingDone");
    setOnboardingDone(done === "true");
    setLoading(false);
  };
 const resetDatabase = async () => {
  try {
    // 🔥 Drop all tables
    await db.execAsync(`
      DROP TABLE IF EXISTS food_logs;
      DROP TABLE IF EXISTS foods;
      DROP TABLE IF EXISTS daily_summary;
      DROP TABLE IF EXISTS user_goals;
      DROP TABLE IF EXISTS goal_history;
      DROP TABLE IF EXISTS weight_logs;


    `);

    console.log("🗑️ All tables deleted");

    // 🔁 Recreate tables
    await initDB();

    console.log("✅ Database recreated");

  } catch (error) {
    console.log("❌ Error resetting DB:", error);
  }
};
  if (loading) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>

          {!onboardingDone ? (
            // 🔥 SHOW ONBOARDING
            <Stack.Screen name="Onboarding">
              {(props) => (
                <OnboardingScreen
                  {...props}
                  setOnboardingDone={setOnboardingDone}
                  checkOnboarding={checkOnboarding}
                />
              )}
            </Stack.Screen>
          ) : (
            // 🔥 SHOW MAIN APP
            <>
              <Stack.Screen name="MainTabs" component={BottomTabs} />
              <Stack.Screen name="AddFood" component={AddFoodScreen} />
            </>
          )}

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
