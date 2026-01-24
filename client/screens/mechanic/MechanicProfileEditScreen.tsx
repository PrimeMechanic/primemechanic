import React, { useState } from "react";
import {
  StyleSheet,
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
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
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
}: SettingsItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingsItem,
        pressed && !toggle && styles.settingsItemPressed,
      ]}
      onPress={toggle ? undefined : onPress}
    >
      <View
        style={[
          styles.settingsIconContainer,
          danger && styles.dangerIconContainer,
        ]}
      >
        <Feather
          name={icon as any}
          size={20}
          color={danger ? Colors.dark.error : Colors.dark.accent}
        />
      </View>
      <View style={styles.settingsContent}>
        <ThemedText style={[styles.settingsLabel, danger && styles.dangerLabel]}>
          {label}
        </ThemedText>
        {value ? <ThemedText style={styles.settingsValue}>{value}</ThemedText> : null}
      </View>
      {toggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: Colors.dark.border, true: Colors.dark.accent }}
          thumbColor={Colors.dark.buttonText}
        />
      ) : (
        <Feather name="chevron-right" size={20} color={Colors.dark.textSecondary} />
      )}
    </Pressable>
  );
}

export default function MechanicProfileEditScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { toggleRole } = useUser();
  const { isDark, toggleTheme } = useTheme();
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
      style={styles.container}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing["3xl"],
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image source={mechanicProfile.avatar} style={styles.avatar} />
          <Pressable style={styles.editAvatarButton}>
            <Feather name="camera" size={16} color={Colors.dark.buttonText} />
          </Pressable>
        </View>
        <ThemedText style={styles.name}>{mechanicProfile.name}</ThemedText>
        <ThemedText style={styles.specialty}>{mechanicProfile.specialty}</ThemedText>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Feather name="star" size={16} color={Colors.dark.warning} />
            <ThemedText style={styles.statValue}>{mechanicProfile.rating}</ThemedText>
            <ThemedText style={styles.statLabel}>Rating</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Feather name="briefcase" size={16} color={Colors.dark.accent} />
            <ThemedText style={styles.statValue}>{mechanicProfile.completedJobs}</ThemedText>
            <ThemedText style={styles.statLabel}>Jobs</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Feather name="message-circle" size={16} color={Colors.dark.success} />
            <ThemedText style={styles.statValue}>{mechanicProfile.reviewCount}</ThemedText>
            <ThemedText style={styles.statLabel}>Reviews</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.availabilityCard}>
        <View style={styles.availabilityContent}>
          <View
            style={[
              styles.availabilityDot,
              { backgroundColor: isAvailable ? Colors.dark.success : Colors.dark.textSecondary },
            ]}
          />
          <View>
            <ThemedText style={styles.availabilityTitle}>
              {isAvailable ? "Available for Jobs" : "Not Available"}
            </ThemedText>
            <ThemedText style={styles.availabilitySubtitle}>
              {isAvailable
                ? "Customers can see and book you"
                : "You won't receive new job requests"}
            </ThemedText>
          </View>
        </View>
        <Switch
          value={isAvailable}
          onValueChange={handleAvailabilityToggle}
          trackColor={{ false: Colors.dark.border, true: Colors.dark.success }}
          thumbColor={Colors.dark.buttonText}
        />
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>My Services</ThemedText>
        <View style={styles.servicesCard}>
          {mechanicServices.map((service, index) => (
            <Pressable key={service?.id || index} style={styles.serviceItem}>
              <View style={styles.serviceIconContainer}>
                <Feather
                  name={(service?.icon as any) || "tool"}
                  size={18}
                  color={Colors.dark.accent}
                />
              </View>
              <ThemedText style={styles.serviceName}>{service?.name}</ThemedText>
              <ThemedText style={styles.servicePrice}>${service?.customPrice}</ThemedText>
              <Feather name="edit-2" size={16} color={Colors.dark.textSecondary} />
            </Pressable>
          ))}
          <Pressable style={styles.addServiceButton}>
            <Feather name="plus" size={18} color={Colors.dark.accent} />
            <ThemedText style={styles.addServiceText}>Add Service</ThemedText>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Profile Settings</ThemedText>
        <View style={styles.settingsGroup}>
          <SettingsItem
            icon="user"
            label="Personal Info"
            value={mechanicProfile.name}
            onPress={() => {}}
          />
          <SettingsItem
            icon="mail"
            label="Email"
            value={mechanicProfile.email}
            onPress={() => {}}
          />
          <SettingsItem
            icon="phone"
            label="Phone"
            value={mechanicProfile.phone}
            onPress={() => {}}
          />
          <SettingsItem
            icon="file-text"
            label="About Me"
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Appearance</ThemedText>
        <View style={styles.settingsGroup}>
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
        <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>
        <View style={styles.settingsGroup}>
          <SettingsItem
            icon="bell"
            label="Push Notifications"
            toggle
            toggleValue={notificationsEnabled}
            onToggle={setNotificationsEnabled}
          />
          <SettingsItem
            icon="dollar-sign"
            label="Hourly Rate"
            value={`$${mechanicProfile.hourlyRate}/hr`}
            onPress={() => {}}
          />
          <SettingsItem icon="map-pin" label="Service Area" onPress={() => {}} />
          <SettingsItem icon="credit-card" label="Bank Account" onPress={() => {}} />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Demo</ThemedText>
        <View style={styles.settingsGroup}>
          <SettingsItem
            icon="users"
            label="Switch to Customer View"
            onPress={handleSwitchToCustomer}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Account</ThemedText>
        <View style={styles.settingsGroup}>
          <SettingsItem icon="help-circle" label="Help & Support" onPress={() => {}} />
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
  profileHeader: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.dark.accent,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.dark.backgroundDefault,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    color: Colors.dark.text,
    marginBottom: 4,
  },
  specialty: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundRoot,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.dark.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    color: Colors.dark.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  availabilityCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.dark.backgroundRoot,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  availabilityContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  availabilityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.md,
  },
  availabilityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  availabilitySubtitle: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    marginTop: 2,
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
  servicesCard: {
    backgroundColor: Colors.dark.backgroundRoot,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: "hidden",
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  serviceIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  serviceName: {
    flex: 1,
    fontSize: 15,
    color: Colors.dark.text,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark.primary,
    marginRight: Spacing.md,
  },
  addServiceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  addServiceText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark.accent,
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
    padding: Spacing.lg,
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
  settingsContent: {
    flex: 1,
  },
  settingsLabel: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  dangerLabel: {
    color: Colors.dark.error,
  },
  settingsValue: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
});
