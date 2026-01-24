import React from "react";
import { StyleSheet, View, Image, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { currentUser } from "@/data/mockData";

interface SettingsItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  showBadge?: boolean;
  badgeText?: string;
  danger?: boolean;
}

function SettingsItem({
  icon,
  label,
  onPress,
  showBadge,
  badgeText,
  danger,
}: SettingsItemProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.settingsItem, pressed && styles.settingsItemPressed]}
      onPress={handlePress}
    >
      <View style={[styles.settingsIconContainer, danger && styles.dangerIconContainer]}>
        <Feather
          name={icon as any}
          size={20}
          color={danger ? Colors.dark.error : Colors.dark.accent}
        />
      </View>
      <ThemedText style={[styles.settingsLabel, danger && styles.dangerLabel]}>
        {label}
      </ThemedText>
      <View style={styles.settingsRight}>
        {showBadge ? (
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText}>{badgeText}</ThemedText>
          </View>
        ) : null}
        <Feather name="chevron-right" size={20} color={Colors.dark.textSecondary} />
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const vehicle = currentUser.vehicles[0];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileSection}>
        <Image source={currentUser.avatar} style={styles.avatar} />
        <ThemedText style={styles.name}>{currentUser.name}</ThemedText>
        <ThemedText style={styles.email}>{currentUser.email}</ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>My Vehicles</ThemedText>
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleIconContainer}>
            <Feather name="truck" size={24} color={Colors.dark.accent} />
          </View>
          <View style={styles.vehicleInfo}>
            <ThemedText style={styles.vehicleName}>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </ThemedText>
            <ThemedText style={styles.vehiclePlate}>
              {vehicle.licensePlate}
            </ThemedText>
          </View>
          <Pressable style={styles.addButton}>
            <Feather name="edit-2" size={18} color={Colors.dark.textSecondary} />
          </Pressable>
        </View>
        <Pressable style={styles.addVehicleButton}>
          <Feather name="plus" size={20} color={Colors.dark.accent} />
          <ThemedText style={styles.addVehicleText}>Add Vehicle</ThemedText>
        </Pressable>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Settings</ThemedText>
        <View style={styles.settingsGroup}>
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
        <ThemedText style={styles.sectionTitle}>Account</ThemedText>
        <View style={styles.settingsGroup}>
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
    backgroundColor: Colors.dark.backgroundDefault,
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
    borderColor: Colors.dark.accent,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    color: Colors.dark.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  vehicleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundRoot,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  vehicleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 212, 255, 0.1)",
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
    color: Colors.dark.text,
    marginBottom: 2,
  },
  vehiclePlate: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
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
    color: Colors.dark.accent,
    marginLeft: Spacing.sm,
  },
  settingsGroup: {
    backgroundColor: Colors.dark.backgroundRoot,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: "hidden",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  settingsItemPressed: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  settingsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  dangerIconContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  settingsLabel: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark.text,
  },
  dangerLabel: {
    color: Colors.dark.error,
  },
  settingsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  badge: {
    backgroundColor: Colors.dark.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.dark.buttonText,
  },
});
