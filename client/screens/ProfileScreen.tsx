import React, { useState } from "react";
import { StyleSheet, View, Image, Pressable, ScrollView, Switch, Share, ActivityIndicator, Modal } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/query-client";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { currentUser } from "@/data/mockData";
import { useUser } from "@/context/UserContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user: authUser, signOut } = useAuth();

  const queryClient = useQueryClient();
  const userId = authUser?.id || "demo";
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<any[]>({
    queryKey: ["/api/users", userId, "vehicles"],
  });

  const [vehicleToDelete, setVehicleToDelete] = useState<any>(null);

  const deleteVehicleMutation = useMutation({
    mutationFn: async (vehicleId: number) => {
      await apiRequest("DELETE", `/api/vehicles/${vehicleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "vehicles"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setVehicleToDelete(null);
    },
  });

  const handleDeleteVehicle = (vehicle: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setVehicleToDelete(vehicle);
  };

  const confirmDelete = () => {
    if (vehicleToDelete) {
      deleteVehicleMutation.mutate(vehicleToDelete.id);
    }
  };

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
    <>
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
          {vehiclesLoading ? (
            <View style={styles.vehicleLoadingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : vehicles.length > 0 ? (
            vehicles.map((v: any, index: number) => (
              <View
                key={v.id}
                style={[
                  styles.vehicleRow,
                  index > 0 ? { borderTopWidth: 1, borderTopColor: colors.border } : null,
                ]}
              >
                <View style={[styles.vehicleIconContainer, { backgroundColor: `${colors.primary}10` }]}>
                  <Feather name="truck" size={22} color={colors.primary} />
                </View>
                <View style={styles.vehicleInfo}>
                  <ThemedText style={[styles.vehicleName, { color: colors.text }]}>
                    {v.year} {v.make} {v.model}
                  </ThemedText>
                  <ThemedText style={[styles.vehiclePlate, { color: colors.textSecondary }]}>
                    {[v.trim, v.licensePlate].filter(Boolean).join(" \u00B7 ") || "No plate"}
                  </ThemedText>
                </View>
                <Pressable
                  onPress={() => handleDeleteVehicle(v)}
                  hitSlop={8}
                  style={styles.deleteButton}
                  testID={`button-delete-vehicle-${v.id}`}
                >
                  <Feather name="trash-2" size={18} color={colors.error || "#E53E3E"} />
                </Pressable>
              </View>
            ))
          ) : (
            <View style={styles.noVehiclesRow}>
              <ThemedText style={[styles.noVehiclesText, { color: colors.textSecondary }]}>
                No vehicles added yet
              </ThemedText>
            </View>
          )}
          <Pressable
            style={[styles.addVehicleRow, { borderTopColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("AddVehicle");
            }}
            testID="button-add-vehicle"
          >
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
          <SettingsItem icon="credit-card" label="Payment Methods" onPress={() => navigation.navigate("PaymentMethods")} />
          <SettingsItem icon="map-pin" label="Saved Addresses" onPress={() => navigation.navigate("SavedAddresses")} />
          <SettingsItem icon="help-circle" label="Help & Support" onPress={() => navigation.navigate("HelpSupport")} />
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
          <SettingsItem icon="log-out" label="Sign Out" onPress={signOut} />
          <SettingsItem icon="trash-2" label="Delete Account" onPress={() => {}} danger />
        </View>
      </View>
    </ScrollView>

      <Modal
        visible={vehicleToDelete !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setVehicleToDelete(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setVehicleToDelete(null)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.backgroundDefault }]}>
            <View style={styles.modalIconWrap}>
              <View style={[styles.modalIconCircle, { backgroundColor: "#FEE2E2" }]}>
                <Feather name="trash-2" size={24} color="#E53E3E" />
              </View>
            </View>
            <ThemedText style={[styles.modalTitle, { color: colors.text }]}>Remove Vehicle</ThemedText>
            <ThemedText style={[styles.modalMessage, { color: colors.textSecondary }]}>
              Are you sure you want to remove your {vehicleToDelete?.year} {vehicleToDelete?.make} {vehicleToDelete?.model}?
            </ThemedText>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalCancelButton, { borderColor: colors.border }]}
                onPress={() => setVehicleToDelete(null)}
                testID="button-cancel-delete"
              >
                <ThemedText style={[styles.modalButtonText, { color: colors.text }]}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalDeleteButton]}
                onPress={confirmDelete}
                testID="button-confirm-delete"
              >
                {deleteVehicleMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText style={[styles.modalButtonText, { color: "#fff" }]}>Remove</ThemedText>
                )}
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
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
    flexShrink: 0,
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
  vehicleLoadingRow: {
    padding: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  noVehiclesRow: {
    padding: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  noVehiclesText: {
    fontSize: 14,
    fontWeight: "500",
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
  deleteButton: {
    padding: Spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    borderRadius: BorderRadius.xl,
    padding: Spacing["2xl"],
    alignItems: "center",
  },
  modalIconWrap: {
    marginBottom: Spacing.lg,
  },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  modalMessage: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelButton: {
    borderWidth: 1,
  },
  modalDeleteButton: {
    backgroundColor: "#E53E3E",
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
