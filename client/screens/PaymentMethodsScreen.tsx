import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getApiUrl } from "@/lib/query-client";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

function formatBrand(brand: string): string {
  switch (brand.toLowerCase()) {
    case "visa":
      return "Visa";
    case "mastercard":
      return "Mastercard";
    case "amex":
      return "American Express";
    case "discover":
      return "Discover";
    default:
      return brand.charAt(0).toUpperCase() + brand.slice(1);
  }
}

export default function PaymentMethodsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { colors } = useTheme();
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();
  const userId = authUser?.id || "demo";

  const [cardToDelete, setCardToDelete] = useState<PaymentMethod | null>(null);
  const [isAddingCard, setIsAddingCard] = useState(false);

  const { data: paymentMethods = [], isLoading } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/users", userId, "payment-methods"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      await apiRequest("DELETE", `/api/payment-methods/${paymentMethodId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/users", userId, "payment-methods"],
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCardToDelete(null);
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      await apiRequest("POST", `/api/payment-methods/${paymentMethodId}/default`, {
        userId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/users", userId, "payment-methods"],
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const handleAddCard = async () => {
    setIsAddingCard(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(new URL(`/api/users/${userId}/checkout-setup`, baseUrl), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();

      if (data.url) {
        await WebBrowser.openBrowserAsync(data.url);
        queryClient.invalidateQueries({
          queryKey: ["/api/users", userId, "payment-methods"],
        });
      }
    } catch (error) {
      console.error("Add card error:", error);
    } finally {
      setIsAddingCard(false);
    }
  };

  const handleDeleteCard = (card: PaymentMethod) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCardToDelete(card);
  };

  const confirmDelete = () => {
    if (cardToDelete) {
      deleteMutation.mutate(cardToDelete.id);
    }
  };

  const handleSetDefault = (card: PaymentMethod) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDefaultMutation.mutate(card.id);
  };

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
            SAVED CARDS
          </ThemedText>

          {isLoading ? (
            <View style={[styles.card, { backgroundColor: colors.backgroundDefault }, Shadows.small]}>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Loading payment methods...
                </ThemedText>
              </View>
            </View>
          ) : paymentMethods.length > 0 ? (
            <View style={[styles.card, { backgroundColor: colors.backgroundDefault }, Shadows.small]}>
              {paymentMethods.map((pm, index) => (
                <View
                  key={pm.id}
                  style={[
                    styles.cardRow,
                    index > 0
                      ? { borderTopWidth: 1, borderTopColor: colors.border }
                      : null,
                  ]}
                  testID={`card-payment-method-${pm.id}`}
                >
                  <View
                    style={[
                      styles.cardIconContainer,
                      { backgroundColor: `${colors.primary}10` },
                    ]}
                  >
                    <Feather name="credit-card" size={22} color={colors.primary} />
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardNameRow}>
                      <ThemedText style={[styles.cardName, { color: colors.text }]}>
                        {formatBrand(pm.brand)}
                      </ThemedText>
                      {pm.isDefault ? (
                        <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
                          <ThemedText style={styles.defaultBadgeText}>Default</ThemedText>
                        </View>
                      ) : null}
                    </View>
                    <ThemedText style={[styles.cardDetails, { color: colors.textSecondary }]}>
                      **** {pm.last4} {" \u00B7 "} {String(pm.expMonth).padStart(2, "0")}/{String(pm.expYear).slice(-2)}
                    </ThemedText>
                  </View>
                  <View style={styles.cardActions}>
                    {!pm.isDefault ? (
                      <Pressable
                        onPress={() => handleSetDefault(pm)}
                        hitSlop={8}
                        style={styles.actionButton}
                        testID={`button-set-default-${pm.id}`}
                      >
                        <Feather name="check-circle" size={18} color={colors.textSecondary} />
                      </Pressable>
                    ) : null}
                    <Pressable
                      onPress={() => handleDeleteCard(pm)}
                      hitSlop={8}
                      style={styles.actionButton}
                      testID={`button-delete-card-${pm.id}`}
                    >
                      <Feather name="trash-2" size={18} color={colors.error} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: colors.backgroundDefault }, Shadows.small]}>
              <View style={[styles.emptyIconCircle, { backgroundColor: `${colors.primary}10` }]}>
                <Feather name="credit-card" size={32} color={colors.primary} />
              </View>
              <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
                No Payment Methods
              </ThemedText>
              <ThemedText style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Add a card to easily pay for mechanic services
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Pressable
            style={({ pressed }) => [
              styles.addCardButtonMain,
              pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] },
            ]}
            onPress={handleAddCard}
            disabled={isAddingCard}
            testID="button-add-card"
          >
            <LinearGradient
              colors={["#0FA958", "#0B8A47"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addCardGradient}
            >
              {isAddingCard ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="plus" size={20} color="#FFFFFF" />
                  <ThemedText style={styles.addCardText}>Add Payment Method</ThemedText>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={[styles.infoCard, { backgroundColor: `${colors.primary}08` }]}>
            <Feather name="shield" size={18} color={colors.primary} style={styles.infoIcon} />
            <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
              Your payment information is securely stored by Stripe. PrimeMechanic never has access to your full card details.
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={cardToDelete !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setCardToDelete(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCardToDelete(null)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.backgroundDefault }]}>
            <View style={styles.modalIconWrap}>
              <View style={[styles.modalIconCircle, { backgroundColor: "#FEE2E2" }]}>
                <Feather name="credit-card" size={24} color="#E53E3E" />
              </View>
            </View>
            <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
              Remove Card
            </ThemedText>
            <ThemedText style={[styles.modalMessage, { color: colors.textSecondary }]}>
              Are you sure you want to remove your {formatBrand(cardToDelete?.brand || "")} ending in {cardToDelete?.last4}?
            </ThemedText>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalCancelButton, { borderColor: colors.border }]}
                onPress={() => setCardToDelete(null)}
                testID="button-cancel-delete-card"
              >
                <ThemedText style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancel
                </ThemedText>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalDeleteButton]}
                onPress={confirmDelete}
                testID="button-confirm-delete-card"
              >
                {deleteMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText style={[styles.modalButtonText, { color: "#fff" }]}>
                    Remove
                  </ThemedText>
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
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  cardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: 2,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardDetails: {
    fontSize: 14,
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
  cardActions: {
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
  addCardButtonMain: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  addCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  addCardText: {
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
