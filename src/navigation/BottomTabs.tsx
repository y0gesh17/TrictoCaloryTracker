import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import HomeScreen from "../screens/HomeScreen";
import ProgressScreen from "../screens/ProgressScreen";
import AddFoodScreen from "../screens/AddFoodScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const insets = useSafeAreaInsets(); // ✅ KEY FIX

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarBackground: () => (
          <LinearGradient
            colors={["#FFFFFF", "#ECFDF5"]}
            style={{
              flex: 1,
              borderRadius: 25,
            }}
          />
        ),

        tabBarStyle: {
  position: "absolute",
  left: 12,
  right: 12,
  bottom: insets.bottom,

  height: 75, // 👈 increased

  backgroundColor: "transparent",
  borderRadius: 25,
  borderTopWidth: 0,

  elevation: 10,
  shadowColor: "#000",
  shadowOpacity: 0.14,
  shadowRadius: 10,

  overflow: "visible", // ✅ VERY IMPORTANT
},

        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
        },

        tabBarActiveTintColor: "#22c55e",
        tabBarInactiveTintColor: "#9ca3af",

        tabBarIcon: ({ color, focused }) => {
          if (route.name === "Home") {
            return <Ionicons name="home" size={26} color={color} />;
          }

          if (route.name === "Progress") {
            return (
              <Ionicons name="stats-chart" size={26} color={color} />
            );
          }

          if (route.name === "Profile") {
            return (
              <Ionicons
                name="person"
                size={26}
                color={focused ? "#000" : "#9ca3af"}
              />
            );
          }

          if (route.name === "AddFood") {
            return (
              
                  <Ionicons name="add" size={28} color={color}/>
              
            );
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="AddFood" component={AddFoodScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
