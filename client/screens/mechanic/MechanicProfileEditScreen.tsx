import React, { useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  Image,
  Switch,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";
import { mechanicProfile } from "@/data/mechanicData";
import { services } from "@/data/mockData";
import { useUser } from "@/context/UserContext";
import { useTheme } from "@/context/ThemeContext";

interface SettingsItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  danger?: boolean;
  colors: any;
}

function SettingsItem({
  icon,
  label,
  value,
  onPress,
  toggle,
  toggleValue,
  onToggle,
  danger,
  colors,
}: SettingsItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          padding: Spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        pressed && !toggle && { backgroundColor: colors.backgroundSecondary },
      ]}
      onPress={toggle ? undefined : onPress}
    >
      <View
        style={[
          {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "rgba(0, 212, 255, 0.1)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: Spacing.md,
          },
          danger && { backgroundColor: "rgba(239, 68, 68, 0.1)" },
        ]}
      >
        <Feather
          name={icon as any}
          size={20}
          color={danger ? colors.error : colors.accent}
        />
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText style={[{ fontSize: 16, color: colors.text }, danger && { color: colors.error }]}>
          {label}
        </ThemedText>
        {value ? <ThemedText style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>{value}</ThemedText> : null}
      </View>
      {toggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor={colors.buttonText}
        />
      ) : (
        <Feather name="chevron-right" size={20} color={colors.textSecondary} />
      )}
    </Pressable>
  );
}

export default function MechanicProfileEditScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { toggleRole } = useUser();
  const { isDark, toggleTheme, colors } = useTheme();
  const [isAvailable, setIsAvailable] = useState(mechanicProfile.isAvailable);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSwitchToCustomer = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toggleRole();
  };

  const handleAvailabilityToggle = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsAvailable(value);
  };

  const handleThemeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTheme();
  };

  const mechanicServices = mechanicProfile.services.map((ms) => {
    const service = services.find((s) => s.id === ms.serviceId);
    return { ...service, customPrice: ms.price };
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.backgroundDefault }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing["3xl"],
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ alignItems: "center", paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl }}>
        <View style={{ position: "relative", marginBottom: Spacing.md }}>
          <Image source={mechanicProfile.avatar} style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: colors.accent }} />
          <Pressable style={{ position: "absolute", bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.backgroundDefault }}>
            <Feather name="camera" size={16} color={colors.buttonText} />
          </Pressable>
        </View>
        <ThemedText style={{ fontSize: 22, fontWeight: "700", fontFamily: "Montserrat_700Bold", color: colors.text, marginBottom: 4 }}>{mechanicProfile.name}</ThemedText>
        <ThemedText style={{ fontSize: 15, color: colors.textSecondary, marginBottom: Spacing.lg }}>{mechanicProfile.specialty}</ThemedText>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.backgroundRoot, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Feather name="star" size={16} color={colors.warning} />
            <ThemedText style={{ fontSize: 18, fontWeight: "700", fontFamily: "Montserrat_700Bold", color: colors.text, marginTop: 4 }}>{mechanicProfile.rating}</ThemedText>
            <ThemedText style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>Rating</ThemedText>
          </View>
          <View style={{ width: 1, height: 40, backgroundColor: colors.border }} />
          <View style={{ flex: 1, alignItems: "center" }}>
            <Feather name="briefcase" size={16} color={colors.accent} />
            <ThemedText style={{ fontSize: 18, fontWeight: "700", fontFamily: "Montserrat_700Bold", color: colors.text, marginTop: 4 }}>{mechanicProfile.completedJobs}</ThemedText>
            <ThemedText style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>Jobs</ThemedText>
          </View>
          <View style={{ width: 1, height: 40, backgroundColor: colors.border }} />
          <View style={{ flex: 1, alignItems: "center" }}>
            <Feather name="message-circle" size={16} color={colors.success} />
            <ThemedText style={{ fontSize: 18, fontWeight: "700", fontFamily: "Montserrat_700Bold", color: colors.text, marginTop: 4 }}>{mechanicProfile.reviewCount}</ThemedText>
            <ThemedText style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>Reviews</ThemedText>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: Spacing.lg, marginBottom: Spacing.xl, backgroundColor: colors.backgroundRoot, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              marginRight: Spacing.md,
              backgroundColor: isAvailable ? colors.success : colors.textSecondary,
            }}
          />
          <View>
            <ThemedText style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
              {isAvailable ? "Available for Jobs" : "Not Available"}
            </ThemedText>
            <ThemedText style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
              {isAvailable
                ? "Customers can see and book you"
                : "You won't receive new job requests"}
            </ThemedText>
          </View>
        </View>
        <Switch
          value={isAvailable}
          onValueChange={handleAvailabilityToggle}
          trackColor={{ false: colors.border, true: colors.success }}
          thumbColor={colors.buttonText}
        />
      </View>

      <View style={{ paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl }}>
        <ThemedText style={{ fontSize: 14, fontWeight: "600", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: Spacing.md }}>My Services</ThemedText>
        <View style={{ backgroundColor: colors.backgroundRoot, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }}>
          {mechanicServices.map((service, index) => (
            <Pressable key={service?.id || index} style={{ flexDirection: "row", alignItems: "center", padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0, 212, 255, 0.1)", alignItems: "center", justifyContent: "center", marginRight: Spacing.md }}>
                <Feather
                  name={(service?.icon as any) || "tool"}
                  size={18}
                  color={colors.accent}
                />
              </View>
              <ThemedText style={{ flex: 1, fontSize: 15, color: colors.text }}>{service?.name}</ThemedText>
              <ThemedText style={{ fontSize: 15, fontWeight: "600", color: colors.primary, marginRight: Spacing.md }}>${service?.customPrice}</ThemedText>
              <Feather name="edit-2" size={16} color={colors.textSecondary} />
            </Pressable>
          ))}
          <Pressable style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", padding: Spacing.lg, gap: Spacing.sm }}>
            <Feather name="plus" size={18} color={colors.accent} />
            <ThemedText style={{ fontSize: 15, fontWeight: "600", color: colors.accent }}>Add Service</ThemedText>
          </Pressable>
        </View>
      </View>

      <View style={{ paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl }}>
        <ThemedText style={{ fontSize: 14, fontWeight: "600", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: Spacing.md }}>Profile Settings</ThemedText>
        <View style={{ backgroundColor: colors.backgroundRoot, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }}>
          <SettingsItem
            icon="user"
            label="Personal Info"
            value={mechanicProfile.name}
            onPress={() => {}}
            colors={colors}
          />
          <SettingsItem
            icon="mail"
            label="Email"
            value={mechanicProfile.email}
            onPress={() => {}}
            colors={colors}
          />
          <SettingsItem
            icon="phone"
            label="Phone"
            value={mechanicProfile.phone}
            onPress={() => {}}
            colors={colors}
          />
          <SettingsItem
            icon="file-text"
            label="About Me"
            onPress={() => {}}
            colors={colors}
          />
        </View>
      </View>

      <View style={{ paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl }}>
        <ThemedText style={{ fontSize: 14, fontWeight: "600", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: Spacing.md }}>Appearance</ThemedText>
        <View style={{ backgroundColor: colors.backgroundRoot, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }}>
          <SettingsItem
            icon={isDark ? "moon" : "sun"}
            label="Dark Mode"
            toggle
            toggleValue={isDark}
            onToggle={handleThemeToggle}
            colors={colors}
          />
        </View>
      </View>

      <View style={{ paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl }}>
        <ThemedText style={{ fontSize: 14, fontWeight: "600", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: Spacing.md }}>Preferences</ThemedText>
        <View style={{ backgroundColor: colors.backgroundRoot, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }}>
          <SettingsItem
            icon="bell"
            label="Push Notifications"
            toggle
            toggleValue={notificationsEnabled}
            onToggle={setNotificationsEnabled}
            colors={colors}
          />
          <SettingsItem
            icon="dollar-sign"
            label="Hourly Rate"
            value={`$${mechanicProfile.hourlyRate}/hr`}
            onPress={() => {}}
            colors={colors}
          />
          <SettingsItem icon="map-pin" label="Service Area" onPress={() => {}} colors={colors} />
          <SettingsItem icon="credit-card" label="Bank Account" onPress={() => {}} colors={colors} />
        </View>
      </View>

      <View style={{ paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl }}>
        <ThemedText style={{ fontSize: 14, fontWeight: "600", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: Spacing.md }}>Demo</ThemedText>
        <View style={{ backgroundColor: colors.backgroundRoot, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }}>
          <SettingsItem
            icon="users"
            label="Switch to Customer View"
            onPress={handleSwitchToCustomer}
            colors={colors}
          />
        </View>
      </View>

      <View style={{ paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl }}>
        <ThemedText style={{ fontSize: 14, fontWeight: "600", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: Spacing.md }}>Account</ThemedText>
        <View style={{ backgroundColor: colors.backgroundRoot, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }}>
          <SettingsItem icon="help-circle" label="Help & Support" onPress={() => {}} colors={colors} />
          <SettingsItem icon="log-out" label="Sign Out" onPress={() => {}} colors={colors} />
          <SettingsItem icon="trash-2" label="Delete Account" onPress={() => {}} danger colors={colors} />
        </View>
      </View>
    </ScrollView>
  );
}

