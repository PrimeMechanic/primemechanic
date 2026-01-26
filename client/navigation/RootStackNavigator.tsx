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
import SignInScreen from "@/screens/SignInScreen";
import SignUpScreen from "@/screens/SignUpScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useUser } from "@/context/UserContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { conversations, mechanics } from "@/data/mockData";

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  Demo: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  MechanicMain: undefined;
  BookService: { serviceId?: string };
  MechanicProfile: { mechanicId: string };
  BookingDetail: { bookingId: string };
  Chat: { conversationId: string; mechanicId?: string };
} & AuthStackParamList;

const Stack = createNativeStackNavigator<RootStackParamList>();

function DemoScreen() {
  const { setRole } = useUser();
  React.useEffect(() => {
    setRole("customer");
  }, []);
  return null;
}

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { role, setRole } = useUser();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { colors } = useTheme();

  const [isDemo, setIsDemo] = React.useState(false);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated && !isDemo) {
    return (
      <Stack.Navigator screenOptions={{ ...screenOptions, headerShown: false }}>
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen 
          name="Demo" 
          options={{ headerShown: false }}
        >
          {() => {
            React.useEffect(() => {
              setIsDemo(true);
              setRole("customer");
            }, []);
            return null;
          }}
        </Stack.Screen>
      </Stack.Navigator>
    );
  }

  const currentRole = user?.role === "mechanic" ? "mechanic" : role;

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
        options={({ route }) => {
          const conversation = conversations.find(
            (c) => c.id === route.params.conversationId
          );
          const mechanic = conversation?.mechanic || 
            mechanics.find((m) => m.id === route.params.mechanicId) || 
            mechanics[0];
          return {
            headerTitle: mechanic.name,
          };
        }}
      />
    </Stack.Navigator>
  );
}
