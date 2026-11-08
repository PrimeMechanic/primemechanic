import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HeaderButton } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import MechanicTabNavigator from "@/navigation/MechanicTabNavigator";
import BookServiceScreen from "@/screens/BookServiceScreen";
import MechanicProfileScreen from "@/screens/MechanicProfileScreen";
import BookingDetailScreen from "@/screens/BookingDetailScreen";
import ChatScreen from "@/screens/ChatScreen";
import AddVehicleScreen from "@/screens/AddVehicleScreen";
import PaymentMethodsScreen from "@/screens/PaymentMethodsScreen";
import SavedAddressesScreen from "@/screens/SavedAddressesScreen";
import ShopProfileScreen from "@/screens/ShopProfileScreen";
import HelpSupportScreen from "@/screens/HelpSupportScreen";
import AllServicesScreen from "@/screens/AllServicesScreen";
import MechanicOnboardingScreen from "@/screens/mechanic/MechanicOnboardingScreen";
import JobDetailScreen from "@/screens/mechanic/JobDetailScreen";
import SignInScreen from "@/screens/SignInScreen";
import SignUpScreen from "@/screens/SignUpScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useUser } from "@/context/UserContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  MechanicMain: undefined;
  BookService: { serviceId?: string; mechanicId?: string };
  MechanicProfile: { mechanicId: string };
  BookingDetail: { bookingId: string };
  JobDetail: { bookingId: string };
  Chat: { conversationId: string; mechanicId?: string };
  AddVehicle: undefined;
  PaymentMethods: undefined;
  SavedAddresses: undefined;
  ShopProfile: { shopId: string };
  HelpSupport: undefined;
  AllServices: undefined;
} & AuthStackParamList;

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { role } = useUser();
  const {
    isAuthenticated,
    isLoading,
    user,
    needsOnboarding,
    completeOnboarding,
  } = useAuth();
  const { colors } = useTheme();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ ...screenOptions, headerShown: false }}>
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
      </Stack.Navigator>
    );
  }

  if (needsOnboarding && user?.role === "mechanic") {
    return <MechanicOnboardingScreen onComplete={completeOnboarding} />;
  }

  const currentRole = user?.role === "mechanic" ? role : "customer";

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {currentRole === "customer" ? (
        <Stack.Screen
          name="Main"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="MechanicMain"
          component={MechanicTabNavigator}
          options={{ headerShown: false }}
        />
      )}
      <Stack.Screen
        name="BookService"
        component={BookServiceScreen}
        options={({ navigation }) => ({
          presentation: "modal",
          headerTitle: "Book Service",
          headerLeft: () => (
            <HeaderButton
              onPress={() => navigation.goBack()}
              pressColor="transparent"
              pressOpacity={0.7}
            >
              <Feather name="x" size={24} color={colors.text} />
            </HeaderButton>
          ),
        })}
      />
      <Stack.Screen
        name="MechanicProfile"
        component={MechanicProfileScreen}
        options={{
          headerTitle: "Mechanic Profile",
        }}
      />
      <Stack.Screen
        name="BookingDetail"
        component={BookingDetailScreen}
        options={{
          headerTitle: "Booking Details",
        }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ headerTitle: "Conversation" }}
      />
      <Stack.Screen
        name="AddVehicle"
        component={AddVehicleScreen}
        options={{
          headerTitle: "Add Vehicle",
        }}
      />
      <Stack.Screen
        name="PaymentMethods"
        component={PaymentMethodsScreen}
        options={{
          headerTitle: "Payment Methods",
        }}
      />
      <Stack.Screen
        name="SavedAddresses"
        component={SavedAddressesScreen}
        options={{
          headerTitle: "Saved Addresses",
        }}
      />
      <Stack.Screen
        name="ShopProfile"
        component={ShopProfileScreen}
        options={{
          headerTitle: "Shop Profile",
        }}
      />
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{
          headerTitle: "Help & Support",
        }}
      />
      <Stack.Screen
        name="AllServices"
        component={AllServicesScreen}
        options={{
          headerTitle: "All Services",
        }}
      />
      <Stack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{
          headerTitle: "Job Details",
        }}
      />
    </Stack.Navigator>
  );
}
