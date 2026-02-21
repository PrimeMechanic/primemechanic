import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  FlatList,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useMutation } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, Shadows, Typography } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { vehicleMakesList, getModelsForMake, getTrimsForMakeModel, getYearRange } from "@/data/vehicleData";
import { apiRequest, queryClient } from "@/lib/query-client";
import { useAuth } from "@/context/AuthContext";

type Step = "make" | "model" | "year" | "trim" | "plate" | "review";

const ALL_STEPS: Step[] = ["make", "model", "year", "trim", "plate", "review"];

export default function AddVehicleScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { colors } = useTheme();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>("make");
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [selectedTrim, setSelectedTrim] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const years = useMemo(() => getYearRange(), []);
  const models = useMemo(() => getModelsForMake(selectedMake), [selectedMake]);
  const trims = useMemo(() => getTrimsForMakeModel(selectedMake, selectedModel), [selectedMake, selectedModel]);

  const filteredMakes = useMemo(() => {
    if (!searchQuery.trim()) return vehicleMakesList;
    const q = searchQuery.toLowerCase();
    return vehicleMakesList.filter((m) => m.toLowerCase().includes(q));
  }, [searchQuery]);

  const filteredModels = useMemo(() => {
    if (!searchQuery.trim()) return models;
    const q = searchQuery.toLowerCase();
    return models.filter((m) => m.toLowerCase().includes(q));
  }, [searchQuery, models]);

  const filteredTrims = useMemo(() => {
    if (!searchQuery.trim()) return trims;
    const q = searchQuery.toLowerCase();
    return trims.filter((t) => t.toLowerCase().includes(q));
  }, [searchQuery, trims]);

  const createVehicleMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/vehicles", {
        userId: user?.id || "demo",
        make: selectedMake,
        model: selectedModel,
        year: selectedYear,
        trim: selectedTrim || null,
        licensePlate: licensePlate || null,
      });
      return res.json();
    },
    onSuccess: () => {
      const uid = user?.id || "demo";
      queryClient.invalidateQueries({ queryKey: ["/api/users", uid, "vehicles"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    },
  });

  const handleSelectMake = (make: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMake(make);
    setSelectedModel("");
    setSelectedTrim("");
    setSearchQuery("");
    setStep("model");
  };

  const handleSelectModel = (model: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedModel(model);
    setSelectedTrim("");
    setSearchQuery("");
    setStep("year");
  };

  const handleSelectYear = (year: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedYear(year);
    setSearchQuery("");
    const availableTrims = getTrimsForMakeModel(selectedMake, selectedModel);
    if (availableTrims.length > 0) {
      setStep("trim");
    } else {
      setStep("plate");
    }
  };

  const handleSelectTrim = (trim: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTrim(trim);
    setSearchQuery("");
    setStep("plate");
  };

  const handleSkipTrim = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTrim("");
    setStep("plate");
  };

  const handleContinueToReview = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep("review");
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSearchQuery("");
    if (step === "model") setStep("make");
    else if (step === "year") setStep("model");
    else if (step === "trim") setStep("year");
    else if (step === "plate") {
      const availableTrims = getTrimsForMakeModel(selectedMake, selectedModel);
      if (availableTrims.length > 0) {
        setStep("trim");
      } else {
        setStep("year");
      }
    }
    else if (step === "review") setStep("plate");
  };

  const handleSave = () => {
    createVehicleMutation.mutate();
  };

  const stepTitles: Record<Step, string> = {
    make: "Select Make",
    model: "Select Model",
    year: "Select Year",
    trim: "Select Trim",
    plate: "License Plate",
    review: "Review Vehicle",
  };

  const activeSteps = useMemo(() => {
    const availableTrims = getTrimsForMakeModel(selectedMake, selectedModel);
    if (availableTrims.length > 0) {
      return ALL_STEPS;
    }
    return ALL_STEPS.filter((s) => s !== "trim");
  }, [selectedMake, selectedModel]);

  const stepNumber = activeSteps.indexOf(step) + 1;
  const totalSteps = activeSteps.length;

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorRow}>
      {activeSteps.map((s, i) => (
        <View
          key={s}
          style={[
            styles.stepDot,
            {
              backgroundColor: i + 1 <= stepNumber ? colors.primary : colors.border,
            },
            i + 1 === stepNumber ? styles.stepDotActive : null,
          ]}
        />
      ))}
    </View>
  );

  const renderBreadcrumb = () => {
    const parts: string[] = [];
    if (selectedMake) parts.push(selectedMake);
    if (selectedModel) parts.push(selectedModel);
    if (selectedYear) parts.push(String(selectedYear));
    if (selectedTrim) parts.push(selectedTrim);
    if (parts.length === 0) return null;

    return (
      <View style={styles.breadcrumbRow}>
        <Feather name="truck" size={14} color={colors.primary} />
        <ThemedText style={[styles.breadcrumbText, { color: colors.textSecondary }]}>
          {parts.join(" / ")}
        </ThemedText>
      </View>
    );
  };

  const renderSearchBar = (placeholder: string) => (
    <View style={[styles.searchContainer, { backgroundColor: colors.backgroundDefault, borderColor: colors.border }]}>
      <Feather name="search" size={18} color={colors.textSecondary} />
      <TextInput
        style={[styles.searchInput, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCorrect={false}
        testID="input-search-vehicle"
      />
      {searchQuery.length > 0 ? (
        <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
          <Feather name="x" size={18} color={colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );

  const renderListItem = ({ item, onPress, selected }: { item: string; onPress: () => void; selected?: boolean }) => (
    <Pressable
      style={({ pressed }) => [
        styles.listItem,
        { backgroundColor: colors.backgroundDefault, borderColor: colors.border },
        selected ? { borderColor: colors.primary, backgroundColor: `${colors.primary}08` } : null,
        pressed ? { backgroundColor: `${colors.primary}05` } : null,
      ]}
      onPress={onPress}
      testID={`item-${item}`}
    >
      <ThemedText style={[styles.listItemText, { color: colors.text }, selected ? { color: colors.primary, fontWeight: "700" } : null]}>
        {item}
      </ThemedText>
      {selected ? (
        <Feather name="check-circle" size={20} color={colors.primary} />
      ) : (
        <Feather name="chevron-right" size={18} color={colors.textSecondary} />
      )}
    </Pressable>
  );

  const renderMakeStep = () => (
    <View style={styles.listContainer}>
      {renderSearchBar("Search makes...")}
      <FlatList
        data={filteredMakes}
        keyExtractor={(item) => item}
        renderItem={({ item }) =>
          renderListItem({
            item,
            onPress: () => handleSelectMake(item),
            selected: item === selectedMake,
          })
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        keyboardShouldPersistTaps="handled"
        testID="list-makes"
      />
    </View>
  );

  const renderModelStep = () => (
    <View style={styles.listContainer}>
      {renderSearchBar("Search models...")}
      <FlatList
        data={filteredModels}
        keyExtractor={(item) => item}
        renderItem={({ item }) =>
          renderListItem({
            item,
            onPress: () => handleSelectModel(item),
            selected: item === selectedModel,
          })
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        keyboardShouldPersistTaps="handled"
        testID="list-models"
      />
    </View>
  );

  const renderYearStep = () => (
    <View style={styles.listContainer}>
      <FlatList
        data={years}
        keyExtractor={(item) => String(item)}
        numColumns={3}
        renderItem={({ item }) => {
          const isSelected = item === selectedYear;
          return (
            <Pressable
              style={({ pressed }) => [
                styles.yearItem,
                { backgroundColor: colors.backgroundDefault, borderColor: colors.border },
                isSelected ? { borderColor: colors.primary, backgroundColor: `${colors.primary}08` } : null,
                pressed ? { backgroundColor: `${colors.primary}05` } : null,
              ]}
              onPress={() => handleSelectYear(item)}
              testID={`year-${item}`}
            >
              <ThemedText
                style={[
                  styles.yearText,
                  { color: colors.text },
                  isSelected ? { color: colors.primary, fontWeight: "700" } : null,
                ]}
              >
                {item}
              </ThemedText>
            </Pressable>
          );
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        columnWrapperStyle={styles.yearRow}
        testID="list-years"
      />
    </View>
  );

  const renderTrimStep = () => (
    <View style={styles.listContainer}>
      {trims.length > 6 ? renderSearchBar("Search trims...") : null}
      <FlatList
        data={filteredTrims}
        keyExtractor={(item) => item}
        renderItem={({ item }) =>
          renderListItem({
            item,
            onPress: () => handleSelectTrim(item),
            selected: item === selectedTrim,
          })
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={
          <Pressable
            style={({ pressed }) => [
              styles.skipButton,
              { borderColor: colors.border },
              pressed ? { backgroundColor: `${colors.primary}05` } : null,
            ]}
            onPress={handleSkipTrim}
            testID="button-skip-trim"
          >
            <ThemedText style={[styles.skipText, { color: colors.textSecondary }]}>
              Skip - I don't know my trim
            </ThemedText>
          </Pressable>
        }
        testID="list-trims"
      />
    </View>
  );

  const renderPlateStep = () => (
    <KeyboardAvoidingView
      style={styles.plateContainer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.plateCard, { backgroundColor: colors.backgroundDefault }, Shadows.small]}>
        <View style={[styles.plateIconContainer, { backgroundColor: `${colors.primary}10` }]}>
          <Feather name="credit-card" size={28} color={colors.primary} />
        </View>
        <ThemedText style={[styles.plateLabel, { color: colors.text }]}>
          License Plate Number
        </ThemedText>
        <ThemedText style={[styles.plateSubtext, { color: colors.textSecondary }]}>
          Optional - helps identify your vehicle
        </ThemedText>
        <TextInput
          style={[
            styles.plateInput,
            {
              backgroundColor: colors.backgroundRoot,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="e.g., ABC 1234"
          placeholderTextColor={colors.textSecondary}
          value={licensePlate}
          onChangeText={setLicensePlate}
          autoCapitalize="characters"
          autoCorrect={false}
          testID="input-license-plate"
        />
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.continueButton,
          pressed ? { opacity: 0.9, transform: [{ scale: 0.97 }] } : null,
        ]}
        onPress={handleContinueToReview}
        testID="button-continue-plate"
      >
        <LinearGradient
          colors={["#0FA958", "#0B8A47"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.continueGradient}
        >
          <ThemedText style={styles.continueText}>Continue</ThemedText>
          <Feather name="arrow-right" size={18} color="#FFFFFF" />
        </LinearGradient>
      </Pressable>
    </KeyboardAvoidingView>
  );

  const renderReviewStep = () => (
    <View style={styles.reviewContainer}>
      <View style={[styles.reviewCard, { backgroundColor: colors.backgroundDefault }, Shadows.medium]}>
        <View style={[styles.reviewIconContainer, { backgroundColor: `${colors.primary}10` }]}>
          <Feather name="truck" size={32} color={colors.primary} />
        </View>
        <ThemedText style={[styles.reviewVehicleName, { color: colors.text }]}>
          {selectedYear} {selectedMake}
        </ThemedText>
        <ThemedText style={[styles.reviewModel, { color: colors.primary }]}>
          {selectedModel}{selectedTrim ? ` ${selectedTrim}` : ""}
        </ThemedText>
        {licensePlate.length > 0 ? (
          <View style={[styles.reviewPlateContainer, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}>
            <ThemedText style={[styles.reviewPlateText, { color: colors.text }]}>
              {licensePlate}
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.reviewDetails}>
          {[
            { label: "Make", value: selectedMake, icon: "tag" },
            { label: "Model", value: selectedModel, icon: "layers" },
            { label: "Trim", value: selectedTrim || "Not specified", icon: "sliders" },
            { label: "Year", value: String(selectedYear), icon: "calendar" },
            { label: "Plate", value: licensePlate || "Not provided", icon: "credit-card" },
          ].map((detail) => (
            <View key={detail.label} style={[styles.reviewDetailRow, { borderBottomColor: colors.border }]}>
              <View style={styles.reviewDetailLeft}>
                <Feather name={detail.icon as any} size={16} color={colors.textSecondary} />
                <ThemedText style={[styles.reviewDetailLabel, { color: colors.textSecondary }]}>
                  {detail.label}
                </ThemedText>
              </View>
              <ThemedText style={[styles.reviewDetailValue, { color: colors.text }]}>
                {detail.value}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.saveButton,
          pressed ? { opacity: 0.9, transform: [{ scale: 0.97 }] } : null,
          createVehicleMutation.isPending ? { opacity: 0.7 } : null,
        ]}
        onPress={handleSave}
        disabled={createVehicleMutation.isPending}
        testID="button-save-vehicle"
      >
        <LinearGradient
          colors={["#0FA958", "#0B8A47"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.saveGradient}
        >
          {createVehicleMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Feather name="check" size={20} color="#FFFFFF" />
              <ThemedText style={styles.saveText}>Save Vehicle</ThemedText>
            </>
          )}
        </LinearGradient>
      </Pressable>
      {createVehicleMutation.isError ? (
        <ThemedText style={[styles.errorText, { color: colors.error }]}>
          Something went wrong. Please try again.
        </ThemedText>
      ) : null}
    </View>
  );

  const renderStepContent = () => {
    switch (step) {
      case "make": return renderMakeStep();
      case "model": return renderModelStep();
      case "year": return renderYearStep();
      case "trim": return renderTrimStep();
      case "plate": return renderPlateStep();
      case "review": return renderReviewStep();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundRoot, paddingTop: headerHeight }]}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          {step !== "make" ? (
            <Pressable onPress={handleBack} style={styles.backButton} hitSlop={8} testID="button-back-step">
              <Feather name="arrow-left" size={20} color={colors.primary} />
            </Pressable>
          ) : (
            <View style={styles.backButtonPlaceholder} />
          )}
          <ThemedText style={[styles.stepTitle, { color: colors.text }]}>
            {stepTitles[step]}
          </ThemedText>
          <View style={styles.backButtonPlaceholder} />
        </View>
        {renderStepIndicator()}
        {renderBreadcrumb()}
      </View>
      {renderStepContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonPlaceholder: {
    width: 36,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    textAlign: "center",
    flex: 1,
  },
  stepIndicatorRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: Spacing.sm,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepDotActive: {
    width: 24,
    borderRadius: 4,
  },
  breadcrumbRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  breadcrumbText: {
    fontSize: 13,
    fontWeight: "500",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  listContainer: {
    flex: 1,
    paddingTop: Spacing.sm,
  },
  flatListContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing["3xl"],
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  listItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  yearRow: {
    gap: Spacing.sm,
  },
  yearItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  yearText: {
    fontSize: 16,
    fontWeight: "500",
  },
  skipButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderStyle: "dashed",
    marginTop: Spacing.sm,
  },
  skipText: {
    fontSize: 15,
    fontWeight: "500",
  },
  plateContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing["2xl"],
    justifyContent: "space-between",
    paddingBottom: Spacing["3xl"],
  },
  plateCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing["2xl"],
    alignItems: "center",
  },
  plateIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  plateLabel: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    marginBottom: 4,
  },
  plateSubtext: {
    fontSize: 14,
    marginBottom: Spacing.xl,
  },
  plateInput: {
    width: "100%",
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 2,
  },
  continueButton: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  continueGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    gap: Spacing.sm,
  },
  continueText: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    color: "#FFFFFF",
  },
  reviewContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing["3xl"],
  },
  reviewCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing["2xl"],
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  reviewIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  reviewVehicleName: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    marginBottom: 2,
  },
  reviewModel: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  reviewPlateContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  reviewPlateText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 2,
  },
  reviewDetails: {
    width: "100%",
    marginTop: Spacing.sm,
  },
  reviewDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  reviewDetailLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  reviewDetailLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  reviewDetailValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  saveButton: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  saveGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    gap: Spacing.sm,
  },
  saveText: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    color: "#FFFFFF",
  },
  errorText: {
    textAlign: "center",
    marginTop: Spacing.md,
    fontSize: 14,
  },
});
