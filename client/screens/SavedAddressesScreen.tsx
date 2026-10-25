import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useIsFocused } from "@react-navigation/native";
import { apiRequest } from "@/lib/query-client";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

interface Address {
  id: number;
  userId: string;
  label: string;
  street: string;
  apt: string | null;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean | null;
}

const LABEL_OPTIONS = ["Home", "Other"];

function getLabelIcon(label: string): string {
  switch (label.toLowerCase()) {
    case "home":
      return "home";
    default:
      return "map-pin";
  }
}

export default function SavedAddressesScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { colors } = useTheme();
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();
  const userId = authUser?.id || "demo";

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

  const [label, setLabel] = useState("Home");
  const [street, setStreet] = useState("");
  const [apt, setApt] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const isFocused = useIsFocused();

  const { data: addressList = [], isLoading, refetch } = useQuery<Address[]>({
    queryKey: ["/api/users", userId, "addresses"],
    enabled: isFocused,
    staleTime: 0,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/addresses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "addresses"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PATCH", `/api/addresses/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "addresses"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "addresses"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setAddressToDelete(null);
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (addressId: number) => {
      await apiRequest("POST", `/api/addresses/${addressId}/default`, { userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "addresses"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingAddress(null);
    setLabel("Home");
    setStreet("");
    setApt("");
    setCity("");
    setState("");
    setZipCode("");
    setIsDefault(false);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const openEditForm = (addr: Address) => {
    setEditingAddress(addr);
    setLabel(addr.label);
    setStreet(addr.street);
    setApt(addr.apt || "");
    setCity(addr.city);
    setState(addr.state);
    setZipCode(addr.zipCode);
    setIsDefault(addr.isDefault || false);
    setShowForm(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = () => {
    if (!street.trim() || !city.trim() || !state.trim() || !zipCode.trim()) return;

    const data = {
      userId,
      label,
      street: street.trim(),
      apt: apt.trim() || null,
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      isDefault,
    };

    if (editingAddress) {
      updateMutation.mutate({ id: editingAddress.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (addr: Address) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAddressToDelete(addr);
  };

  const confirmDelete = () => {
    if (addressToDelete) {
      deleteMutation.mutate(addressToDelete.id);
    }
  };

  const isFormValid = street.trim() && city.trim() && state.trim() && zipCode.trim();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.backgroundRoot }]}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing["2xl"],
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            SAVED ADDRESSES
          </ThemedText>

          {isLoading ? (
            <View style={[styles.card, { backgroundColor: colors.backgroundDefault }, Shadows.small]}>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Loading addresses...
                </ThemedText>
              </View>
            </View>
          ) : addressList.length > 0 ? (
            <View style={[styles.card, { backgroundColor: colors.backgroundDefault }, Shadows.small]}>
              {addressList.map((addr, index) => (
                <Pressable
                  key={addr.id}
                  style={[
                    styles.addressRow,
                    index > 0 ? { borderTopWidth: 1, borderTopColor: colors.border } : null,
                  ]}
                  onPress={() => openEditForm(addr)}
                  testID={`card-address-${addr.id}`}
                >
                  <View style={[styles.addressIconContainer, { backgroundColor: `${colors.primary}10` }]}>
                    <Feather name={getLabelIcon(addr.label) as any} size={22} color={colors.primary} />
                  </View>
                  <View style={styles.addressInfo}>
                    <View style={styles.addressNameRow}>
                      <ThemedText style={[styles.addressLabel, { color: colors.text }]}>
                        {addr.label}
                      </ThemedText>
                      {addr.isDefault ? (
                        <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
                          <ThemedText style={styles.defaultBadgeText}>Default</ThemedText>
                        </View>
                      ) : null}
                    </View>
                    <ThemedText style={[styles.addressDetails, { color: colors.textSecondary }]} numberOfLines={2}>
                      {addr.street}{addr.apt ? `, ${addr.apt}` : ""}
                    </ThemedText>
                    <ThemedText style={[styles.addressDetails, { color: colors.textSecondary }]}>
                      {addr.city}, {addr.state} {addr.zipCode}
                    </ThemedText>
                  </View>
                  <View style={styles.addressActions}>
                    {!addr.isDefault ? (
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          setDefaultMutation.mutate(addr.id);
                        }}
                        hitSlop={8}
                        style={styles.actionButton}
                        testID={`button-set-default-address-${addr.id}`}
                      >
                        <Feather name="check-circle" size={18} color={colors.textSecondary} />
                      </Pressable>
                    ) : null}
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDelete(addr);
                      }}
                      hitSlop={8}
                      style={styles.actionButton}
                      testID={`button-delete-address-${addr.id}`}
                    >
                      <Feather name="trash-2" size={18} color={colors.error} />
                    </Pressable>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: colors.backgroundDefault }, Shadows.small]}>
              <View style={[styles.emptyIconCircle, { backgroundColor: `${colors.primary}10` }]}>
                <Feather name="map-pin" size={32} color={colors.primary} />
              </View>
              <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
                No Saved Addresses
              </ThemedText>
              <ThemedText style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Add your home or other locations for faster booking
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] },
            ]}
            onPress={openAddForm}
            testID="button-add-address"
          >
            <LinearGradient
              colors={["#0FA958", "#0B8A47"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addButtonGradient}
            >
              <Feather name="plus" size={20} color="#FFFFFF" />
              <ThemedText style={styles.addButtonText}>Add Address</ThemedText>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={[styles.infoCard, { backgroundColor: `${colors.primary}08` }]}>
            <Feather name="info" size={18} color={colors.primary} style={styles.infoIcon} />
            <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
              Save your frequent locations so mechanics can find you quickly when you book a service.
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      {/* Add / Edit Form Modal */}
      <Modal
        visible={showForm}
        transparent
        animationType="slide"
        onRequestClose={resetForm}
      >
        <View style={[styles.formOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <View style={[styles.formContent, { backgroundColor: colors.backgroundDefault }]}>
            <View style={styles.formHeader}>
              <ThemedText style={[styles.formTitle, { color: colors.text }]}>
                {editingAddress ? "Edit Address" : "Add Address"}
              </ThemedText>
              <Pressable onPress={resetForm} hitSlop={12} testID="button-close-form">
                <Feather name="x" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.formScroll}>
              <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>LABEL</ThemedText>
              <View style={styles.labelOptions}>
                {LABEL_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt}
                    style={[
                      styles.labelChip,
                      { borderColor: label === opt ? colors.primary : colors.border },
                      label === opt ? { backgroundColor: `${colors.primary}10` } : null,
                    ]}
                    onPress={() => setLabel(opt)}
                    testID={`button-label-${opt.toLowerCase()}`}
                  >
                    <Feather
                      name={getLabelIcon(opt) as any}
                      size={16}
                      color={label === opt ? colors.primary : colors.textSecondary}
                    />
                    <ThemedText
                      style={[
                        styles.labelChipText,
                        { color: label === opt ? colors.primary : colors.textSecondary },
                      ]}
                    >
                      {opt}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>STREET ADDRESS</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.backgroundRoot, color: colors.text, borderColor: colors.border }]}
                value={street}
                onChangeText={setStreet}
                placeholder="123 Main Street"
                placeholderTextColor={colors.textSecondary}
                testID="input-street"
              />

              <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>APT / SUITE / UNIT</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.backgroundRoot, color: colors.text, borderColor: colors.border }]}
                value={apt}
                onChangeText={setApt}
                placeholder="Apt 4B (optional)"
                placeholderTextColor={colors.textSecondary}
                testID="input-apt"
              />

              <View style={styles.rowFields}>
                <View style={styles.fieldHalf}>
                  <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>CITY</ThemedText>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.backgroundRoot, color: colors.text, borderColor: colors.border }]}
                    value={city}
                    onChangeText={setCity}
                    placeholder="City"
                    placeholderTextColor={colors.textSecondary}
                    testID="input-city"
                  />
                </View>
                <View style={styles.fieldQuarter}>
                  <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>STATE</ThemedText>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.backgroundRoot, color: colors.text, borderColor: colors.border }]}
                    value={state}
                    onChangeText={setState}
                    placeholder="CA"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="characters"
                    maxLength={2}
                    testID="input-state"
                  />
                </View>
                <View style={styles.fieldQuarter}>
                  <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>ZIP</ThemedText>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.backgroundRoot, color: colors.text, borderColor: colors.border }]}
                    value={zipCode}
                    onChangeText={setZipCode}
                    placeholder="90210"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="number-pad"
                    maxLength={10}
                    testID="input-zip"
                  />
                </View>
              </View>

              <Pressable
                style={styles.defaultToggleRow}
                onPress={() => setIsDefault(!isDefault)}
                testID="button-toggle-default"
              >
                <View style={[styles.checkbox, { borderColor: isDefault ? colors.primary : colors.border, backgroundColor: isDefault ? colors.primary : "transparent" }]}>
                  {isDefault ? <Feather name="check" size={14} color="#fff" /> : null}
                </View>
                <ThemedText style={[styles.defaultToggleText, { color: colors.text }]}>
                  Set as default address
                </ThemedText>
              </Pressable>
            </ScrollView>

            <View style={styles.formActions}>
              <Pressable
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={resetForm}
                testID="button-cancel-form"
              >
                <ThemedText style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={[
                  styles.saveButton,
                  !isFormValid && { opacity: 0.5 },
                ]}
                onPress={handleSave}
                disabled={!isFormValid || isSaving}
                testID="button-save-address"
              >
                <LinearGradient
                  colors={["#0FA958", "#0B8A47"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButtonGradient}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <ThemedText style={styles.saveButtonText}>
                      {editingAddress ? "Update" : "Save"}
                    </ThemedText>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={addressToDelete !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setAddressToDelete(null)}
      >
        <Pressable
          style={styles.deleteOverlay}
          onPress={() => setAddressToDelete(null)}
        >
          <View style={[styles.deleteContent, { backgroundColor: colors.backgroundDefault }]}>
            <View style={styles.deleteIconWrap}>
              <View style={[styles.deleteIconCircle, { backgroundColor: "#FEE2E2" }]}>
                <Feather name="map-pin" size={24} color="#E53E3E" />
              </View>
            </View>
            <ThemedText style={[styles.deleteTitle, { color: colors.text }]}>
              Remove Address
            </ThemedText>
            <ThemedText style={[styles.deleteMessage, { color: colors.textSecondary }]}>
              Are you sure you want to remove your &quot;{addressToDelete?.label}&quot; address at {addressToDelete?.street}?
            </ThemedText>
            <View style={styles.deleteButtons}>
              <Pressable
                style={[styles.deleteBtn, styles.deleteCancelBtn, { borderColor: colors.border }]}
                onPress={() => setAddressToDelete(null)}
                testID="button-cancel-delete-address"
              >
                <ThemedText style={[styles.deleteBtnText, { color: colors.text }]}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.deleteBtn, styles.deleteConfirmBtn]}
                onPress={confirmDelete}
                testID="button-confirm-delete-address"
              >
                {deleteMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText style={[styles.deleteBtnText, { color: "#fff" }]}>Remove</ThemedText>
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
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  addressIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  addressInfo: {
    flex: 1,
  },
  addressNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: 2,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  addressDetails: {
    fontSize: 13,
    lineHeight: 18,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  addressActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  actionButton: {
    padding: Spacing.xs,
  },
  emptyCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing["3xl"],
    alignItems: "center",
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  addButton: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  addButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  infoCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  infoIcon: {
    marginRight: Spacing.md,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  loadingContainer: {
    padding: Spacing["2xl"],
    alignItems: "center",
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: 14,
  },
  formOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  formContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    maxHeight: "85%",
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  formScroll: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  labelOptions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  labelChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
  labelChipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  rowFields: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  fieldHalf: {
    flex: 2,
  },
  fieldQuarter: {
    flex: 1,
  },
  defaultToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  defaultToggleText: {
    fontSize: 15,
    fontWeight: "500",
  },
  formActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  saveButtonGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  deleteOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  deleteContent: {
    width: "100%",
    maxWidth: 340,
    borderRadius: BorderRadius.xl,
    padding: Spacing["2xl"],
    alignItems: "center",
  },
  deleteIconWrap: {
    marginBottom: Spacing.lg,
  },
  deleteIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  deleteMessage: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  deleteButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    width: "100%",
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteCancelBtn: {
    borderWidth: 1,
  },
  deleteConfirmBtn: {
    backgroundColor: "#E53E3E",
  },
  deleteBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
