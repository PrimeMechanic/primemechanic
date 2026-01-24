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
import { Spacing, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { services, currentUser, mechanics } from "@/data/mockData";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type BookServiceRouteProp = RouteProp<RootStackParamList, "BookService">;

export default function BookServiceScreen() {
  const navigation = useNavigation();
  const route = useRoute<BookServiceRouteProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { colors } = useTheme();

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
    <View style={[styles.container, { backgroundColor: colors.backgroundDefault }]}>
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
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>Select Service</ThemedText>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <Pressable
                key={service.id}
                style={[
                  styles.serviceOption,
                  { backgroundColor: colors.backgroundRoot, borderColor: colors.border },
                  selectedService === service.id && { borderColor: colors.accent, backgroundColor: "rgba(0, 212, 255, 0.05)" },
                ]}
                onPress={() => handleServiceSelect(service.id)}
              >
                <View
                  style={[
                    styles.serviceIconContainer,
                    { backgroundColor: "rgba(0, 212, 255, 0.1)" },
                    selectedService === service.id && { backgroundColor: colors.accent },
                  ]}
                >
                  <Feather
                    name={service.icon as any}
                    size={22}
                    color={
                      selectedService === service.id
                        ? colors.buttonText
                        : colors.accent
                    }
                  />
                </View>
                <ThemedText style={[styles.serviceOptionName, { color: colors.text }]}>
                  {service.name}
                </ThemedText>
                <ThemedText style={[styles.serviceOptionPrice, { color: colors.textSecondary }]}>
                  ${service.price}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>Vehicle</ThemedText>
          <Pressable style={[styles.inputCard, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}>
            <View style={[styles.iconContainer, { backgroundColor: "rgba(0, 212, 255, 0.1)" }]}>
              <Feather name="truck" size={20} color={colors.accent} />
            </View>
            <View style={styles.inputContent}>
              <ThemedText style={[styles.inputValue, { color: colors.text }]}>
                {selectedVehicle.year} {selectedVehicle.make}{" "}
                {selectedVehicle.model}
              </ThemedText>
              <ThemedText style={[styles.inputSubtext, { color: colors.textSecondary }]}>
                {selectedVehicle.licensePlate}
              </ThemedText>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>Date & Time</ThemedText>
          <View style={styles.dateTimeRow}>
            <Pressable style={[styles.inputCard, styles.dateCard, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}>
              <View style={[styles.iconContainer, { backgroundColor: "rgba(0, 212, 255, 0.1)" }]}>
                <Feather name="calendar" size={20} color={colors.accent} />
              </View>
              <View style={styles.inputContent}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Date</ThemedText>
                <ThemedText style={[styles.inputValue, { color: colors.text }]}>{selectedDate}</ThemedText>
              </View>
            </Pressable>
            <Pressable style={[styles.inputCard, styles.timeCard, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}>
              <View style={[styles.iconContainer, { backgroundColor: "rgba(0, 212, 255, 0.1)" }]}>
                <Feather name="clock" size={20} color={colors.accent} />
              </View>
              <View style={styles.inputContent}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Time</ThemedText>
                <ThemedText style={[styles.inputValue, { color: colors.text }]}>{selectedTime}</ThemedText>
              </View>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>Location</ThemedText>
          <Pressable style={[styles.inputCard, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}>
            <View style={[styles.iconContainer, { backgroundColor: "rgba(0, 212, 255, 0.1)" }]}>
              <Feather name="map-pin" size={20} color={colors.accent} />
            </View>
            <View style={styles.inputContent}>
              <ThemedText style={[styles.inputValue, { color: colors.text }]}>{location}</ThemedText>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>Special Instructions</ThemedText>
          <View style={[styles.textAreaContainer, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}>
            <TextInput
              style={[styles.textArea, { color: colors.text }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any details we should know about?"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {selectedServiceData ? (
          <View style={[styles.summaryCard, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}>
            <ThemedText style={[styles.summaryTitle, { color: colors.text }]}>Booking Summary</ThemedText>
            <View style={styles.summaryRow}>
              <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>Service</ThemedText>
              <ThemedText style={[styles.summaryValue, { color: colors.text }]}>
                {selectedServiceData.name}
              </ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>Duration</ThemedText>
              <ThemedText style={[styles.summaryValue, { color: colors.text }]}>
                ~{selectedServiceData.duration} mins
              </ThemedText>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryRow}>
              <ThemedText style={[styles.totalLabel, { color: colors.text }]}>Estimated Total</ThemedText>
              <ThemedText style={[styles.totalValue, { color: colors.primary }]}>
                ${selectedServiceData.price}
              </ThemedText>
            </View>
          </View>
        ) : null}
      </KeyboardAwareScrollViewCompat>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg, backgroundColor: colors.backgroundRoot, borderTopColor: colors.border }]}>
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
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  serviceOptionSelected: {},
  serviceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  serviceIconContainerSelected: {},
  serviceOptionName: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 2,
  },
  serviceOptionPrice: {
    fontSize: 11,
  },
  inputCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  inputValue: {
    fontSize: 15,
    fontWeight: "500",
  },
  inputSubtext: {
    fontSize: 13,
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
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
  },
  textArea: {
    fontSize: 15,
    minHeight: 80,
  },
  summaryCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Montserrat_600SemiBold",
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  button: {
    width: "100%",
  },
});
