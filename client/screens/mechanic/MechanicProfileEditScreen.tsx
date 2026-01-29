import React, { useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  Image,
  Switch,
  StyleSheet,
} from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
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
  const { colors } = useTheme();
  
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingsItem,
        { borderBottomColor: colors.border },
        pressed && !toggle && { backgroundColor: `${colors.primary}05` },
      ]}
      onPress={toggle ? undefined : onPress}
    >
      <View
        style={[
          styles.settingsIconContainer,
          { backgroundColor: danger ? `${colors.error}12` : `${colors.primary}12` },
        ]}
      >
        <Feather
          name={icon as any}
          size={18}
          color={danger ? colors.error : colors.primary}
        />
      </View>
      <View style={styles.settingsContent}>
        <ThemedText style={[styles.settingsLabel, { color: danger ? colors.error : colors.text }]}>
          {label}
        </ThemedText>
        {value ? (
          <ThemedText style={[styles.settingsValue, { color: colors.textSecondary }]}>{value}</ThemedText>
        ) : null}
      </View>
      {toggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <View style={[styles.chevronContainer, { backgroundColor: `${colors.primary}10` }]}>
          <Feather name="chevron-right" size={16} color={colors.primary} />
        </View>
      )}
    </Pressable>
  );
}

export default function MechanicProfileEditScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
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
      style={[styles.container, { backgroundColor: colors.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing["2xl"],
        paddingBottom: tabBarHeight + Spacing["3xl"],
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileSection}>
        <View style={[styles.profileCard, { backgroundColor: colors.backgroundDefault }, Shadows.medium]}>
          <LinearGradient
            colors={["#0FA958", "#0B8A47"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileGradient}
          >
            <View style={styles.avatarContainer}>
              <Image source={mechanicProfile.avatar} style={styles.avatar} />
              <Pressable style={styles.cameraButton}>
                <Feather name="camera" size={14} color="#FFFFFF" />
              </Pressable>
            </View>
            <ThemedText style={styles.profileName}>{mechanicProfile.name}</ThemedText>
            <ThemedText style={styles.profileSpecialty}>{mechanicProfile.specialty}</ThemedText>
          </LinearGradient>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIconCircle, { backgroundColor: "#F59E0B15" }]}>
                <Feather name="star" size={16} color="#F59E0B" />
              </View>
              <ThemedText style={[styles.statValue, { color: colors.text }]}>{mechanicProfile.rating}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Rating</ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <View style={[styles.statIconCircle, { backgroundColor: `${colors.primary}15` }]}>
                <Feather name="briefcase" size={16} color={colors.primary} />
              </View>
              <ThemedText style={[styles.statValue, { color: colors.text }]}>{mechanicProfile.completedJobs}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Jobs</ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <View style={[styles.statIconCircle, { backgroundColor: "#22C55E15" }]}>
                <Feather name="message-circle" size={16} color="#22C55E" />
              </View>
              <ThemedText style={[styles.statValue, { color: colors.text }]}>{mechanicProfile.reviewCount}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Reviews</ThemedText>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.availabilitySection}>
        <View style={[styles.availabilityCard, { backgroundColor: colors.backgroundDefault }, Shadows.medium]}>
          <View style={styles.availabilityLeft}>
            <View style={[
              styles.availabilityIndicator,
              { backgroundColor: isAvailable ? colors.success : colors.textSecondary }
            ]} />
            <View>
              <ThemedText style={[styles.availabilityTitle, { color: colors.text }]}>
                {isAvailable ? "Available for Jobs" : "Not Available"}
              </ThemedText>
              <ThemedText style={[styles.availabilitySubtitle, { color: colors.textSecondary }]}>
                {isAvailable ? "Customers can see and book you" : "You won't receive new job requests"}
              </ThemedText>
            </View>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={handleAvailabilityToggle}
            trackColor={{ false: colors.border, true: colors.success }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>MY SERVICES</ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: colors.backgroundDefault }, Shadows.medium]}>
          {mechanicServices.map((service, index) => (
            <Pressable 
              key={service?.id || index} 
              style={[
                styles.serviceItem, 
                index < mechanicServices.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
              ]}
            >
              <LinearGradient
                colors={["#0FA958", "#0B8A47"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.serviceIconContainer}
              >
                <Feather name={(service?.icon as any) || "tool"} size={16} color="#FFFFFF" />
              </LinearGradient>
              <ThemedText style={[styles.serviceName, { color: colors.text }]}>{service?.name}</ThemedText>
              <ThemedText style={[styles.servicePrice, { color: colors.primary }]}>${service?.customPrice}</ThemedText>
              <Feather name="edit-2" size={16} color={colors.textSecondary} />
            </Pressable>
          ))}
          <Pressable style={styles.addServiceButton}>
            <Feather name="plus" size={18} color={colors.primary} />
            <ThemedText style={[styles.addServiceText, { color: colors.primary }]}>Add Service</ThemedText>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>PROFILE SETTINGS</ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: colors.backgroundDefault }, Shadows.medium]}>
          <SettingsItem icon="user" label="Personal Info" value={mechanicProfile.name} onPress={() => {}} />
          <SettingsItem icon="mail" label="Email" value={mechanicProfile.email} onPress={() => {}} />
          <SettingsItem icon="phone" label="Phone" value={mechanicProfile.phone} onPress={() => {}} />
          <SettingsItem icon="file-text" label="About Me" onPress={() => {}} />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>APPEARANCE</ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: colors.backgroundDefault }, Shadows.medium]}>
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
        <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>PREFERENCES</ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: colors.backgroundDefault }, Shadows.medium]}>
          <SettingsItem
            icon="bell"
            label="Push Notifications"
            toggle
            toggleValue={notificationsEnabled}
            onToggle={setNotificationsEnabled}
          />
          <SettingsItem icon="dollar-sign" label="Hourly Rate" value={`$${mechanicProfile.hourlyRate}/hr`} onPress={() => {}} />
          <SettingsItem icon="map-pin" label="Service Area" onPress={() => {}} />
          <SettingsItem icon="credit-card" label="Bank Account" onPress={() => {}} />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>DEMO</ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: colors.backgroundDefault }, Shadows.medium]}>
          <SettingsItem icon="users" label="Switch to Customer View" onPress={handleSwitchToCustomer} />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>ACCOUNT</ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: colors.backgroundDefault }, Shadows.medium]}>
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
  },
  profileSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  profileCard: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  profileGradient: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  profileSpecialty: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  statsRow: {
    flexDirection: "row",
    padding: Spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 50,
    alignSelf: "center",
  },
  availabilitySection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  availabilityCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  availabilityLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  availabilityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.md,
  },
  availabilityTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  availabilitySubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  sectionCard: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  serviceIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceName: {
    flex: 1,
    fontSize: 15,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: "600",
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
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  settingsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  settingsContent: {
    flex: 1,
  },
  settingsLabel: {
    fontSize: 16,
  },
  settingsValue: {
    fontSize: 13,
    marginTop: 2,
  },
  chevronContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
