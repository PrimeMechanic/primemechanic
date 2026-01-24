import React from "react";
import { StyleSheet, View, Image, Pressable, ScrollView, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";
import { currentUser } from "@/data/mockData";
import { useUser } from "@/context/UserContext";
import { useTheme } from "@/context/ThemeContext";

interface SettingsItemProps {
  icon: string;
  label: string;
  onPress?: () => void;
  showBadge?: boolean;
  badgeText?: string;
  danger?: boolean;
  highlight?: boolean;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
}

function SettingsItem({
  icon,
  label,
  onPress,
  showBadge,
  badgeText,
  danger,
  highlight,
  toggle,
  toggleValue,
  onToggle,
}: SettingsItemProps) {
  const { colors } = useTheme();
  
  const handlePress = () => {
    if (toggle) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingsItem, 
        { borderBottomColor: colors.border },
        pressed && !toggle && { backgroundColor: colors.backgroundSecondary }
      ]}
      onPress={handlePress}
    >
      <View style={[
        styles.settingsIconContainer, 
        { backgroundColor: danger ? "rgba(239, 68, 68, 0.1)" : highlight ? `${colors.primary}15` : `${colors.accent}15` }
      ]}>
        <Feather
          name={icon as any}
          size={20}
          color={danger ? colors.error : highlight ? colors.primary : colors.accent}
        />
      </View>
      <ThemedText style={[
        styles.settingsLabel, 
        { color: danger ? colors.error : highlight ? colors.primary : colors.text }
      ]}>
        {label}
      </ThemedText>
      <View style={styles.settingsRight}>
        {showBadge ? (
          <View style={[styles.badge, { backgroundColor: colors.success }]}>
            <ThemedText style={styles.badgeText}>{badgeText}</ThemedText>
          </View>
        ) : null}
        {toggle ? (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        ) : (
          <Feather name="chevron-right" size={20} color={colors.textSecondary} />
        )}
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { toggleRole } = useUser();
  const { isDark, toggleTheme, colors } = useTheme();

  const vehicle = currentUser.vehicles[0];

  const handleSwitchToMechanic = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toggleRole();
  };

  const handleThemeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTheme();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.backgroundDefault }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileSection}>
        <Image source={currentUser.avatar} style={[styles.avatar, { borderColor: colors.accent }]} />
        <ThemedText style={[styles.name, { color: colors.text }]}>{currentUser.name}</ThemedText>
        <ThemedText style={[styles.email, { color: colors.textSecondary }]}>{currentUser.email}</ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>My Vehicles</ThemedText>
        <View style={[styles.vehicleCard, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}>
          <View style={[styles.vehicleIconContainer, { backgroundColor: `${colors.accent}15` }]}>
            <Feather name="truck" size={24} color={colors.accent} />
          </View>
          <View style={styles.vehicleInfo}>
            <ThemedText style={[styles.vehicleName, { color: colors.text }]}>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </ThemedText>
            <ThemedText style={[styles.vehiclePlate, { color: colors.textSecondary }]}>
              {vehicle.licensePlate}
            </ThemedText>
          </View>
          <Pressable style={styles.addButton}>
            <Feather name="edit-2" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>
        <Pressable style={styles.addVehicleButton}>
          <Feather name="plus" size={20} color={colors.accent} />
          <ThemedText style={[styles.addVehicleText, { color: colors.accent }]}>Add Vehicle</ThemedText>
        </Pressable>
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</ThemedText>
        <View style={[styles.settingsGroup, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}>
          <SettingsItem
            icon={isDark ? "moon" : "sun"}
            label="Dark Mode"
            toggle
            toggleValue={isDark}
            onToggle={handleThemeToggle}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>Settings</ThemedText>
        <View style={[styles.settingsGroup, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}>
          <SettingsItem
            icon="bell"
            label="Notifications"
            onPress={() => {}}
            showBadge
            badgeText="On"
          />
          <SettingsItem icon="credit-card" label="Payment Methods" onPress={() => {}} />
          <SettingsItem icon="map-pin" label="Saved Addresses" onPress={() => {}} />
          <SettingsItem icon="help-circle" label="Help & Support" onPress={() => {}} />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>Demo</ThemedText>
        <View style={[styles.settingsGroup, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}>
          <SettingsItem
            icon="tool"
            label="Switch to Mechanic View"
            onPress={handleSwitchToMechanic}
            highlight
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account</ThemedText>
        <View style={[styles.settingsGroup, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}>
          <SettingsItem icon="log-out" label="Sign Out" onPress={() => {}} />
          <SettingsItem icon="trash-2" label="Delete Account" onPress={() => {}} danger />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: Spacing.md,
    borderWidth: 3,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  vehicleCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  vehicleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  vehiclePlate: {
    fontSize: 14,
  },
  addButton: {
    padding: Spacing.sm,
  },
  addVehicleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  addVehicleText: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  settingsGroup: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
  },
  settingsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  settingsLabel: {
    flex: 1,
    fontSize: 16,
  },
  settingsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
