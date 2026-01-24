import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  TextInput,
  Platform,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { services, currentUser, mechanics } from "@/data/mockData";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type BookServiceRouteProp = RouteProp<RootStackParamList, "BookService">;

export default function BookServiceScreen() {
  const navigation = useNavigation();
  const route = useRoute<BookServiceRouteProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const preselectedServiceId = route.params?.serviceId;

  const [selectedService, setSelectedService] = useState<string | null>(
    preselectedServiceId || null
  );
  const [selectedVehicle, setSelectedVehicle] = useState(currentUser.vehicles[0]);
  const [location, setLocation] = useState("123 Main St, Apt 4B");
  const [notes, setNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState("Tomorrow");
  const [selectedTime, setSelectedTime] = useState("10:00 AM");

  const handleServiceSelect = (serviceId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedService(serviceId);
  };

  const handleFindMechanics = () => {
    if (!selectedService) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  const selectedServiceData = services.find((s) => s.id === selectedService);

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing["4xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Select Service</ThemedText>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <Pressable
                key={service.id}
                style={[
                  styles.serviceOption,
                  selectedService === service.id && styles.serviceOptionSelected,
                ]}
                onPress={() => handleServiceSelect(service.id)}
              >
                <View
                  style={[
                    styles.serviceIconContainer,
                    selectedService === service.id &&
                      styles.serviceIconContainerSelected,
                  ]}
                >
                  <Feather
                    name={service.icon as any}
                    size={22}
                    color={
                      selectedService === service.id
                        ? Colors.dark.buttonText
                        : Colors.dark.primary
                    }
                  />
                </View>
                <ThemedText style={styles.serviceOptionName}>
                  {service.name}
                </ThemedText>
                <ThemedText style={styles.serviceOptionPrice}>
                  ${service.price}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Vehicle</ThemedText>
          <Pressable style={styles.inputCard}>
            <View style={styles.iconContainer}>
              <Feather name="truck" size={20} color={Colors.dark.primary} />
            </View>
            <View style={styles.inputContent}>
              <ThemedText style={styles.inputValue}>
                {selectedVehicle.year} {selectedVehicle.make}{" "}
                {selectedVehicle.model}
              </ThemedText>
              <ThemedText style={styles.inputSubtext}>
                {selectedVehicle.licensePlate}
              </ThemedText>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={Colors.dark.textSecondary}
            />
          </Pressable>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Date & Time</ThemedText>
          <View style={styles.dateTimeRow}>
            <Pressable style={[styles.inputCard, styles.dateCard]}>
              <View style={styles.iconContainer}>
                <Feather name="calendar" size={20} color={Colors.dark.primary} />
              </View>
              <View style={styles.inputContent}>
                <ThemedText style={styles.inputLabel}>Date</ThemedText>
                <ThemedText style={styles.inputValue}>{selectedDate}</ThemedText>
              </View>
            </Pressable>
            <Pressable style={[styles.inputCard, styles.timeCard]}>
              <View style={styles.iconContainer}>
                <Feather name="clock" size={20} color={Colors.dark.primary} />
              </View>
              <View style={styles.inputContent}>
                <ThemedText style={styles.inputLabel}>Time</ThemedText>
                <ThemedText style={styles.inputValue}>{selectedTime}</ThemedText>
              </View>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Location</ThemedText>
          <Pressable style={styles.inputCard}>
            <View style={styles.iconContainer}>
              <Feather name="map-pin" size={20} color={Colors.dark.primary} />
            </View>
            <View style={styles.inputContent}>
              <ThemedText style={styles.inputValue}>{location}</ThemedText>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={Colors.dark.textSecondary}
            />
          </Pressable>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Special Instructions</ThemedText>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any details we should know about?"
              placeholderTextColor={Colors.dark.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {selectedServiceData ? (
          <View style={styles.summaryCard}>
            <ThemedText style={styles.summaryTitle}>Booking Summary</ThemedText>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Service</ThemedText>
              <ThemedText style={styles.summaryValue}>
                {selectedServiceData.name}
              </ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Duration</ThemedText>
              <ThemedText style={styles.summaryValue}>
                ~{selectedServiceData.duration} mins
              </ThemedText>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <ThemedText style={styles.totalLabel}>Estimated Total</ThemedText>
              <ThemedText style={styles.totalValue}>
                ${selectedServiceData.price}
              </ThemedText>
            </View>
          </View>
        ) : null}
      </KeyboardAwareScrollViewCompat>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Button
          onPress={handleFindMechanics}
          disabled={!selectedService}
          style={styles.button}
        >
          Find Available Mechanics
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
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
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  serviceOption: {
    width: "31%",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.dark.border,
  },
  serviceOptionSelected: {
    borderColor: Colors.dark.primary,
    backgroundColor: "rgba(255, 107, 53, 0.1)",
  },
  serviceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 107, 53, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  serviceIconContainerSelected: {
    backgroundColor: Colors.dark.primary,
  },
  serviceOptionName: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: 2,
  },
  serviceOptionPrice: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
  },
  inputCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 107, 53, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginBottom: 2,
  },
  inputValue: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.dark.text,
  },
  inputSubtext: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  dateCard: {
    flex: 1,
  },
  timeCard: {
    flex: 1,
  },
  textAreaContainer: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  textArea: {
    fontSize: 15,
    color: Colors.dark.text,
    minHeight: 80,
  },
  summaryCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: Spacing.xl,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Montserrat_600SemiBold",
    color: Colors.dark.text,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.dark.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: Spacing.md,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    color: Colors.dark.primary,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: Colors.dark.backgroundRoot,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  button: {
    width: "100%",
  },
});
