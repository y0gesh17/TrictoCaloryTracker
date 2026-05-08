import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import AddFoodScreen from "../screens/AddFoodScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
      <Stack.Screen name="Home" component={HomeScreen} />
      
      {/* ✅ Add here */}
      <Stack.Screen name="AddFood" component={AddFoodScreen} />

    </Stack.Navigator>
  );
}