import React from "react";
import { StyleSheet, View, Image, Pressable, ScrollView, Switch, Share } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
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
        pressed && !toggle && { backgroundColor: `${colors.primary}05` }
      ]}
      onPress={handlePress}
    >
      <View style={[
        styles.settingsIconContainer, 
        { backgroundColor: danger ? `${colors.error}12` : highlight ? `${colors.primary}12` : `${colors.primary}08` }
      ]}>
        <Feather
          name={icon as any}
          size={18}
          color={danger ? colors.error : highlight ? colors.primary : colors.primary}
        />
      </View>
      <ThemedText style={[
        styles.settingsLabel, 
        { color: danger ? colors.error : colors.text }
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
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        ) : (
          <Feather name="chevron-right" size={18} color={colors.textSecondary} />
        )}
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
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

  const handleShareWithFriends = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: "Check out PrimeMechanic - the best app for finding mobile mechanics! Get your car fixed wherever you are. Download now!",
        title: "Share PrimeMechanic",
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  const handleInviteMechanic = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: "Join PrimeMechanic as a mobile mechanic! Set your own schedule, grow your business, and earn more. Sign up today and start accepting jobs in your area!",
        title: "Invite a Mechanic",
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing.safeAreaTopOffset,
        paddingBottom: tabBarHeight + Spacing["2xl"],
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.profileCard, { backgroundColor: colors.backgroundDefault }, Shadows.medium]}>
        <LinearGradient
          colors={["#0FA958", "#0B3D2E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileGradient}
        >
          <Image source={currentUser.avatar} style={styles.avatar} />
          <ThemedText style={styles.nameOnGradient}>{currentUser.name}</ThemedText>
          <ThemedText style={styles.emailOnGradient}>{currentUser.email}</ThemedText>
        </LinearGradient>
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>MY VEHICLES</ThemedText>
        <View style={[styles.card, { backgroundColor: colors.backgroundDefault }, Shadows.small]}>
          <View style={styles.vehicleRow}>
            <View style={[styles.vehicleIconContainer, { backgroundColor: `${colors.primary}10` }]}>
              <Feather name="truck" size={22} color={colors.primary} />
            </View>
            <View style={styles.vehicleInfo}>
              <ThemedText style={[styles.vehicleName, { color: colors.text }]}>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </ThemedText>
              <ThemedText style={[styles.vehiclePlate, { color: colors.textSecondary }]}>
                {vehicle.licensePlate}
              </ThemedText>
            </View>
            <Pressable style={styles.editButton} hitSlop={8}>
              <Feather name="edit-2" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>
          <Pressable style={[styles.addVehicleRow, { borderTopColor: colors.border }]}>
            <Feather name="plus-circle" size={18} color={colors.primary} />
            <ThemedText style={[styles.addVehicleText, { color: colors.primary }]}>Add Vehicle</ThemedText>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPEARANCE</ThemedText>
        <View style={[styles.settingsGroup, { backgroundColor: colors.backgroundDefault }, Shadows.small]}>
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
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>SETTINGS</ThemedText>
        <View style={[styles.settingsGroup, { backgroundColor: colors.backgroundDefault }, Shadows.small]}>
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
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>SHARE</ThemedText>
        <View style={[styles.settingsGroup, { backgroundColor: colors.backgroundDefault }, Shadows.small]}>
          <SettingsItem
            icon="share-2"
            label="Share with Friends"
            onPress={handleShareWithFriends}
          />
          <SettingsItem
            icon="user-plus"
            label="Invite My Mechanic"
            onPress={handleInviteMechanic}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>DEMO</ThemedText>
        <View style={[styles.settingsGroup, { backgroundColor: colors.backgroundDefault }, Shadows.small]}>
          <SettingsItem
            icon="tool"
            label="Switch to Mechanic View"
            onPress={handleSwitchToMechanic}
            highlight
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACCOUNT</ThemedText>
        <View style={[styles.settingsGroup, { backgroundColor: colors.backgroundDefault }, Shadows.small]}>
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
  profileCard: {
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing["2xl"],
    overflow: "hidden",
  },
  profileGradient: {
    paddingTop: Spacing["2xl"],
    paddingBottom: Spacing["2xl"],
    alignItems: "center",
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
    marginBottom: Spacing.md,
  },
  nameOnGradient: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  emailOnGradient: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  card: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  vehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  vehicleIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
  editButton: {
    padding: Spacing.xs,
  },
  addVehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  addVehicleText: {
    fontSize: 15,
    fontWeight: "600",
  },
  settingsGroup: {
    borderRadius: BorderRadius.md,
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
    width: 34,
    height: 34,
    borderRadius: 10,
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
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
