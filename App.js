import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LoginScreen from "./screens/LoginScreen";
import AdminDashboard from "./screens/AdminDashboard";
import StudentDashboard from "./screens/StudentDashboard";
import StudentEventView from "./screens/StudentEventView"; // Import the new screen
import EventsScreen from "./screens/EventsScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ------------------- BOTTOM NAVIGATION FOR ADMIN -------------------
const AdminBottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#6200ee",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { backgroundColor: "#ffffff" },
      }}
    >
      <Tab.Screen
        name="Notifications"
        component={AdminDashboard}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="bell" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// ------------------- BOTTOM NAVIGATION FOR STUDENTS -------------------
const StudentBottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#6200ee",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { backgroundColor: "#ffffff" },
      }}
    >
      <Tab.Screen
        name="Notifications"
        component={StudentDashboard}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="bell" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Events"
        component={StudentEventView}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// ------------------- MAIN APP NAVIGATION -------------------
const App = () => {
  return (

    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen">
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{ headerShown: false }} // Hide header for LoginScreen
        />
        <Stack.Screen
          name="AdminDashboard"
          component={AdminBottomTabs}
          options={{ headerShown: false }} // Hide header for AdminBottomTabs
        />
        <Stack.Screen
          name="StudentDashboard"
          component={StudentBottomTabs}
          options={{ headerShown: false }} // Hide header for StudentBottomTabs
        />
      </Stack.Navigator>
    </NavigationContainer>
    
  );
};

export default App;