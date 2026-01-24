import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet } from "react-native";

import MechanicDashboardScreen from "@/screens/mechanic/MechanicDashboardScreen";
import JobsScreen from "@/screens/mechanic/JobsScreen";
import EarningsScreen from "@/screens/mechanic/EarningsScreen";
import MechanicProfileEditScreen from "@/screens/mechanic/MechanicProfileEditScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/context/ThemeContext";

export type MechanicTabParamList = {
  DashboardTab: undefined;
  JobsTab: undefined;
  EarningsTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MechanicTabParamList>();

export default function MechanicTabNavigator() {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="DashboardTab"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.backgroundRoot,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontFamily: "Montserrat_600SemiBold",
          fontSize: 18,
          color: colors.text,
        },
        headerShadowVisible: false,
        headerTransparent: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
            android: colors.backgroundRoot,
            web: colors.backgroundRoot,
          }),
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={MechanicDashboardScreen}
        options={{
          title: "Dashboard",
          headerTitle: () => <HeaderTitle title="PrimeMechanic" />,
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="JobsTab"
        component={JobsScreen}
        options={{
          title: "Jobs",
          headerTitle: "My Jobs",
          tabBarIcon: ({ color, size }) => (
            <Feather name="briefcase" size={size} color={color} />
          ),
          tabBarBadge: 2,
          tabBarBadgeStyle: {
            backgroundColor: colors.accent,
            fontSize: 10,
          },
        }}
      />
      <Tab.Screen
        name="EarningsTab"
        component={EarningsScreen}
        options={{
          title: "Earnings",
          headerTitle: "Earnings",
          tabBarIcon: ({ color, size }) => (
            <Feather name="dollar-sign" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={MechanicProfileEditScreen}
        options={{
          title: "Profile",
          headerTitle: "My Profile",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
