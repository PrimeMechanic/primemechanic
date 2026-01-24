import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HeaderButton } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import BookServiceScreen from "@/screens/BookServiceScreen";
import MechanicProfileScreen from "@/screens/MechanicProfileScreen";
import BookingDetailScreen from "@/screens/BookingDetailScreen";
import ChatScreen from "@/screens/ChatScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { Colors } from "@/constants/theme";
import { conversations, mechanics } from "@/data/mockData";

export type RootStackParamList = {
  Main: undefined;
  BookService: { serviceId?: string };
  MechanicProfile: { mechanicId: string };
  BookingDetail: { bookingId: string };
  Chat: { conversationId: string; mechanicId?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
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
              <Feather name="x" size={24} color={Colors.dark.text} />
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
