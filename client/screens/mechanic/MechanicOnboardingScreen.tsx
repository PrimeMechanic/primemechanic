import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  type ScrollViewInstance,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TOTAL_STEPS = 6;

const REQUIRED_DOCUMENTS = [
  { key: "insurance", label: "Proof of Insurance", icon: "shield" as const, description: "Upload your general liability insurance certificate" },
  { key: "license", label: "License / Certification", icon: "credit-card" as const, description: "GA mechanic license or ASE certification" },
  { key: "w9", label: "W-9 Tax Form", icon: "file-text" as const, description: "Completed W-9 for tax reporting" },
];

const SPECIALTIES = [
  { label: "German Vehicles", icon: "settings" as const },
  { label: "Japanese Imports", icon: "zap" as const },
  { label: "Domestic Vehicles", icon: "truck" as const },
  { label: "Electric Vehicles", icon: "battery-charging" as const },
  { label: "Luxury Vehicles", icon: "star" as const },
  { label: "General Repair", icon: "tool" as const },
];

const SERVICE_OPTIONS = [
  "General Maintenance",
  "Engine Repair",
  "Transmission Service",
  "Brake Service",
  "Suspension & Steering",
  "Electrical & Diagnostics",
  "Heating & Air Conditioning (A/C)",
  "Tire & Wheel Service",
  "Exhaust & Emissions",
  "Cooling System Service",
  "Fuel System Service",
  "Drivetrain Service",
  "Inspections & Diagnostics",
  "Battery & Charging System",
  "Mobile Mechanic Services",
  "Pre-Purchase Inspections",
  "Performance Upgrades",
  "Fleet & Commercial Service",
];

interface Props {
  onComplete: () => void;
}

interface MechanicOnboardResponse {
  id: number;
}

export default function MechanicOnboardingScreen({ onComplete }: Props) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0);
  const [specialty, setSpecialty] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState("75");
  const [serviceRadius, setServiceRadius] = useState("10");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, string>>({});
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [backgroundCheckConsent, setBackgroundCheckConsent] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  const scrollRef = useRef<ScrollViewInstance>(null);
  const progressWidth = useSharedValue(1 / TOTAL_STEPS);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  const goToStep = (nextStep: number) => {
    setStep(nextStep);
    progressWidth.value = withSpring((nextStep + 1) / TOTAL_STEPS);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const pickDocument = async (docKey: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });
      if (result.canceled) return;

      setUploadingDoc(docKey);
      const uri = result.assets[0].uri;

      const baseUrl = getApiUrl();
      const uploadRes = await fetch(new URL("/api/objects/upload", baseUrl).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: `doc-${docKey}-${Date.now()}.jpg`,
          contentType: "image/jpeg",
          directory: ".private",
        }),
      });
      const uploadData = await uploadRes.json();

      if (uploadData.uploadUrl) {
        const imageResponse = await fetch(uri);
        const blob = await imageResponse.blob();
        await fetch(uploadData.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": "image/jpeg" },
          body: blob,
        });
      }

      const fileUrl = uploadData.objectPath || uri;
      setUploadedDocs((prev) => ({ ...prev, [docKey]: fileUrl }));
    } catch (err) {
      setError("Failed to upload document. Please try again.");
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleNext = () => {
    setError(null);
    if (step === 0 && !specialty) {
      setError("Please select your specialty");
      return;
    }
    if (step === 1 && selectedServices.length === 0) {
      setError("Please select at least one service");
      return;
    }
    if (step === 2 && (!hourlyRate || parseFloat(hourlyRate) < 1)) {
      setError("Please enter a valid hourly rate");
      return;
    }
    if (step === 4) {
      const missingDocs = REQUIRED_DOCUMENTS.filter((d) => !uploadedDocs[d.key]);
      if (missingDocs.length > 0) {
        setError(`Please upload: ${missingDocs.map((d) => d.label).join(", ")}`);
        return;
      }
    }
    if (step === 5) {
      if (!backgroundCheckConsent) {
        setError("You must consent to a background check");
        return;
      }
      if (!agreementAccepted) {
        setError("You must accept the contractor agreement");
        return;
      }
    }
    if (step < TOTAL_STEPS - 1) {
      goToStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setError(null);
      goToStep(step - 1);
    }
  };

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const profileResponse = await apiRequest("POST", "/api/mechanics/onboard", {
        userId: user.id,
        specialty,
        bio: bio.trim() || `Specializing in ${specialty}`,
        hourlyRate,
        serviceRadius: parseInt(serviceRadius) || 10,
      });
      const profile: MechanicOnboardResponse = await profileResponse.json();

      const mechanicId = profile.id;
      if (mechanicId) {
        const docUploads = Object.entries(uploadedDocs).map(([docType, fileUrl]) =>
          apiRequest("POST", `/api/mechanics/${mechanicId}/documents`, {
            documentType: docType,
            fileUrl,
          })
        );
        await Promise.all(docUploads);
      }

      onComplete();
    } catch (err: any) {
      setError(err.message || "Failed to complete setup");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <Animated.View entering={FadeIn.duration(300)} key="step0">
            <View style={styles.stepHeader}>
              <View style={[styles.stepIconCircle, { backgroundColor: `${colors.primary}15` }]}>
                <Feather name="award" size={28} color={colors.primary} />
              </View>
              <ThemedText style={[styles.stepTitle, { color: colors.text }]}>
                What&apos;s your specialty?
              </ThemedText>
              <ThemedText style={[styles.stepDescription, { color: colors.textSecondary }]}>
                Choose the type of vehicles you work with most
              </ThemedText>
            </View>
            <View style={styles.optionsGrid}>
              {SPECIALTIES.map((item) => {
                const isSelected = specialty === item.label;
                return (
                  <Pressable
                    key={item.label}
                    style={[
                      styles.specialtyCard,
                      {
                        backgroundColor: isSelected ? `${colors.primary}12` : colors.backgroundDefault,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSpecialty(item.label)}
                    testID={`specialty-${item.label.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    <View
                      style={[
                        styles.specialtyIcon,
                        { backgroundColor: isSelected ? `${colors.primary}20` : `${colors.textSecondary}10` },
                      ]}
                    >
                      <Feather
                        name={item.icon}
                        size={22}
                        color={isSelected ? colors.primary : colors.textSecondary}
                      />
                    </View>
                    <ThemedText
                      style={[
                        styles.specialtyLabel,
                        { color: isSelected ? colors.primary : colors.text },
                      ]}
                    >
                      {item.label}
                    </ThemedText>
                    {isSelected ? (
                      <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                        <Feather name="check" size={12} color="#FFFFFF" />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        );

      case 1:
        return (
          <Animated.View entering={FadeIn.duration(300)} key="step1">
            <View style={styles.stepHeader}>
              <View style={[styles.stepIconCircle, { backgroundColor: `${colors.primary}15` }]}>
                <Feather name="list" size={28} color={colors.primary} />
              </View>
              <ThemedText style={[styles.stepTitle, { color: colors.text }]}>
                Services you offer
              </ThemedText>
              <ThemedText style={[styles.stepDescription, { color: colors.textSecondary }]}>
                Select all the services you can provide
              </ThemedText>
            </View>
            <View style={styles.servicesList}>
              {SERVICE_OPTIONS.map((service) => {
                const isSelected = selectedServices.includes(service);
                return (
                  <Pressable
                    key={service}
                    style={[
                      styles.serviceItem,
                      {
                        backgroundColor: isSelected ? `${colors.primary}12` : colors.backgroundDefault,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => toggleService(service)}
                    testID={`service-${service.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    <View
                      style={[
                        styles.serviceCheck,
                        {
                          backgroundColor: isSelected ? colors.primary : "transparent",
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      {isSelected ? (
                        <Feather name="check" size={14} color="#FFFFFF" />
                      ) : null}
                    </View>
                    <ThemedText
                      style={[
                        styles.serviceText,
                        { color: isSelected ? colors.primary : colors.text },
                      ]}
                    >
                      {service}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View entering={FadeIn.duration(300)} key="step2">
            <View style={styles.stepHeader}>
              <View style={[styles.stepIconCircle, { backgroundColor: `${colors.primary}15` }]}>
                <Feather name="dollar-sign" size={28} color={colors.primary} />
              </View>
              <ThemedText style={[styles.stepTitle, { color: colors.text }]}>
                Set your rates
              </ThemedText>
              <ThemedText style={[styles.stepDescription, { color: colors.textSecondary }]}>
                You can always change these later
              </ThemedText>
            </View>

            <View style={[styles.rateCard, { backgroundColor: colors.backgroundDefault }, Shadows.small]}>
              <ThemedText style={[styles.rateLabel, { color: colors.textSecondary }]}>
                HOURLY RATE
              </ThemedText>
              <View style={styles.rateInputRow}>
                <ThemedText style={[styles.dollarSign, { color: colors.primary }]}>$</ThemedText>
                <TextInput
                  style={[styles.rateInput, { color: colors.text, borderColor: colors.border }]}
                  value={hourlyRate}
                  onChangeText={setHourlyRate}
                  keyboardType="numeric"
                  placeholder="75"
                  placeholderTextColor={colors.textSecondary}
                  testID="input-hourly-rate"
                />
                <ThemedText style={[styles.rateUnit, { color: colors.textSecondary }]}>/hr</ThemedText>
              </View>
              <View style={styles.rateSuggestions}>
                {["50", "75", "85", "100"].map((rate) => (
                  <Pressable
                    key={rate}
                    style={[
                      styles.ratePill,
                      {
                        backgroundColor: hourlyRate === rate ? `${colors.primary}15` : `${colors.textSecondary}08`,
                        borderColor: hourlyRate === rate ? colors.primary : "transparent",
                      },
                    ]}
                    onPress={() => setHourlyRate(rate)}
                  >
                    <ThemedText
                      style={[
                        styles.ratePillText,
                        { color: hourlyRate === rate ? colors.primary : colors.textSecondary },
                      ]}
                    >
                      ${rate}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View
              style={[
                styles.rateCard,
                { backgroundColor: colors.backgroundDefault, marginTop: Spacing.lg },
                Shadows.small,
              ]}
            >
              <ThemedText style={[styles.rateLabel, { color: colors.textSecondary }]}>
                SERVICE RADIUS
              </ThemedText>
              <View style={styles.rateInputRow}>
                <TextInput
                  style={[styles.rateInput, { color: colors.text, borderColor: colors.border }]}
                  value={serviceRadius}
                  onChangeText={setServiceRadius}
                  keyboardType="numeric"
                  placeholder="10"
                  placeholderTextColor={colors.textSecondary}
                  testID="input-service-radius"
                />
                <ThemedText style={[styles.rateUnit, { color: colors.textSecondary }]}>miles</ThemedText>
              </View>
              <View style={styles.rateSuggestions}>
                {["5", "10", "15", "25"].map((radius) => (
                  <Pressable
                    key={radius}
                    style={[
                      styles.ratePill,
                      {
                        backgroundColor: serviceRadius === radius ? `${colors.primary}15` : `${colors.textSecondary}08`,
                        borderColor: serviceRadius === radius ? colors.primary : "transparent",
                      },
                    ]}
                    onPress={() => setServiceRadius(radius)}
                  >
                    <ThemedText
                      style={[
                        styles.ratePillText,
                        { color: serviceRadius === radius ? colors.primary : colors.textSecondary },
                      ]}
                    >
                      {radius} mi
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View entering={FadeIn.duration(300)} key="step3">
            <View style={styles.stepHeader}>
              <View style={[styles.stepIconCircle, { backgroundColor: `${colors.primary}15` }]}>
                <Feather name="edit-3" size={28} color={colors.primary} />
              </View>
              <ThemedText style={[styles.stepTitle, { color: colors.text }]}>
                Tell customers about yourself
              </ThemedText>
              <ThemedText style={[styles.stepDescription, { color: colors.textSecondary }]}>
                A short bio helps build trust with customers
              </ThemedText>
            </View>

            <View style={[styles.bioCard, { backgroundColor: colors.backgroundDefault }, Shadows.small]}>
              <TextInput
                style={[
                  styles.bioInput,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.backgroundRoot,
                  },
                ]}
                value={bio}
                onChangeText={setBio}
                placeholder={`I specialize in ${specialty || "automotive repair"} with years of hands-on experience...`}
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                testID="input-bio"
              />
              <ThemedText style={[styles.charCount, { color: colors.textSecondary }]}>
                {bio.length}/500
              </ThemedText>
            </View>

            <View style={[styles.summaryCard, { backgroundColor: `${colors.primary}08` }]}>
              <ThemedText style={[styles.summaryTitle, { color: colors.text }]}>
                Profile Summary
              </ThemedText>
              <View style={styles.summaryRow}>
                <Feather name="award" size={16} color={colors.primary} />
                <ThemedText style={[styles.summaryText, { color: colors.textSecondary }]}>
                  {specialty || "Not set"}
                </ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <Feather name="list" size={16} color={colors.primary} />
                <ThemedText style={[styles.summaryText, { color: colors.textSecondary }]}>
                  {selectedServices.length > 0 ? `${selectedServices.length} services` : "None selected"}
                </ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <Feather name="dollar-sign" size={16} color={colors.primary} />
                <ThemedText style={[styles.summaryText, { color: colors.textSecondary }]}>
                  ${hourlyRate}/hr
                </ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <Feather name="map-pin" size={16} color={colors.primary} />
                <ThemedText style={[styles.summaryText, { color: colors.textSecondary }]}>
                  {serviceRadius} mile radius
                </ThemedText>
              </View>
            </View>
          </Animated.View>
        );

      case 4:
        return (
          <Animated.View entering={FadeIn.duration(300)} key="step4">
            <View style={styles.stepHeader}>
              <View style={[styles.stepIconCircle, { backgroundColor: `${colors.primary}15` }]}>
                <Feather name="upload" size={28} color={colors.primary} />
              </View>
              <ThemedText style={[styles.stepTitle, { color: colors.text }]}>
                Upload your documents
              </ThemedText>
              <ThemedText style={[styles.stepDescription, { color: colors.textSecondary }]}>
                Required for verification before you can accept jobs
              </ThemedText>
            </View>

            <View style={styles.servicesList}>
              {REQUIRED_DOCUMENTS.map((doc) => {
                const isUploaded = !!uploadedDocs[doc.key];
                const isUploading = uploadingDoc === doc.key;
                return (
                  <Pressable
                    key={doc.key}
                    style={[
                      styles.docCard,
                      {
                        backgroundColor: isUploaded ? `${colors.success}08` : colors.backgroundDefault,
                        borderColor: isUploaded ? colors.success : colors.border,
                      },
                      Shadows.small,
                    ]}
                    onPress={() => pickDocument(doc.key)}
                    disabled={isUploading}
                    testID={`doc-upload-${doc.key}`}
                  >
                    <View style={[styles.docIconWrap, { backgroundColor: isUploaded ? `${colors.success}15` : `${colors.textSecondary}10` }]}>
                      {isUploading ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <Feather name={isUploaded ? "check-circle" : doc.icon} size={22} color={isUploaded ? colors.success : colors.textSecondary} />
                      )}
                    </View>
                    <View style={styles.docContent}>
                      <ThemedText style={[styles.docTitle, { color: isUploaded ? colors.success : colors.text }]}>
                        {doc.label}
                      </ThemedText>
                      <ThemedText style={[styles.docDesc, { color: colors.textSecondary }]} numberOfLines={1}>
                        {isUploaded ? "Uploaded - tap to replace" : doc.description}
                      </ThemedText>
                    </View>
                    <Feather name={isUploaded ? "check" : "upload"} size={18} color={isUploaded ? colors.success : colors.primary} />
                  </Pressable>
                );
              })}
            </View>

            <View style={[styles.infoBox, { backgroundColor: `${colors.primary}08` }]}>
              <Feather name="info" size={16} color={colors.primary} />
              <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
                Documents are reviewed within 24-48 hours. You can begin onboarding now but won&apos;t receive jobs until verified.
              </ThemedText>
            </View>
          </Animated.View>
        );

      case 5:
        return (
          <Animated.View entering={FadeIn.duration(300)} key="step5">
            <View style={styles.stepHeader}>
              <View style={[styles.stepIconCircle, { backgroundColor: `${colors.primary}15` }]}>
                <Feather name="check-square" size={28} color={colors.primary} />
              </View>
              <ThemedText style={[styles.stepTitle, { color: colors.text }]}>
                Agreement & Background Check
              </ThemedText>
              <ThemedText style={[styles.stepDescription, { color: colors.textSecondary }]}>
                Review and accept the terms to complete your setup
              </ThemedText>
            </View>

            <View style={[styles.agreementCard, { backgroundColor: colors.backgroundDefault }, Shadows.small]}>
              <ThemedText style={[styles.agreementTitle, { color: colors.text }]}>
                Independent Contractor Agreement
              </ThemedText>
              <ScrollView style={[styles.agreementScroll, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]} nestedScrollEnabled>
                <ThemedText style={[styles.agreementBody, { color: colors.textSecondary }]}>
                  {`By accepting this agreement, you acknowledge and agree to the following terms:\n\n1. INDEPENDENT CONTRACTOR STATUS: You are an independent contractor, not an employee of PrimeMechanic. You are responsible for your own taxes, insurance, and business expenses.\n\n2. SERVICE STANDARDS: You agree to perform all services in a professional, workmanlike manner consistent with industry standards.\n\n3. COMMISSION: PrimeMechanic retains a 20% platform commission on all completed jobs. Your payout is 80% of the job total.\n\n4. BEFORE/AFTER DOCUMENTATION: You are required to photograph the vehicle before and after every service for quality assurance and dispute resolution.\n\n5. INSURANCE: You must maintain valid general liability insurance at all times while active on the platform.\n\n6. COMPLIANCE: You agree to comply with all applicable federal, state, and local laws and regulations in the state of Georgia.\n\n7. CANCELLATION: Either party may terminate this agreement at any time with written notice.\n\n8. W-9: You agree to provide a completed W-9 form for tax reporting purposes. PrimeMechanic will issue a 1099 for earnings over $600/year.`}
                </ThemedText>
              </ScrollView>
            </View>

            <Pressable
              style={[styles.checkboxRow, { borderColor: agreementAccepted ? colors.primary : colors.border }]}
              onPress={() => setAgreementAccepted(!agreementAccepted)}
              testID="checkbox-agreement"
            >
              <View style={[styles.checkbox, { backgroundColor: agreementAccepted ? colors.primary : "transparent", borderColor: agreementAccepted ? colors.primary : colors.border }]}>
                {agreementAccepted ? <Feather name="check" size={14} color="#FFFFFF" /> : null}
              </View>
              <ThemedText style={[styles.checkboxLabel, { color: colors.text }]}>
                I have read and accept the Independent Contractor Agreement
              </ThemedText>
            </Pressable>

            <Pressable
              style={[styles.checkboxRow, { borderColor: backgroundCheckConsent ? colors.primary : colors.border }]}
              onPress={() => setBackgroundCheckConsent(!backgroundCheckConsent)}
              testID="checkbox-background-check"
            >
              <View style={[styles.checkbox, { backgroundColor: backgroundCheckConsent ? colors.primary : "transparent", borderColor: backgroundCheckConsent ? colors.primary : colors.border }]}>
                {backgroundCheckConsent ? <Feather name="check" size={14} color="#FFFFFF" /> : null}
              </View>
              <ThemedText style={[styles.checkboxLabel, { color: colors.text }]}>
                I consent to a background check as required by PrimeMechanic
              </ThemedText>
            </Pressable>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundRoot }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <View style={[styles.topBar, { paddingTop: insets.top + Spacing.md }]}>
          <View style={styles.progressContainer}>
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <Animated.View
                style={[styles.progressFill, { backgroundColor: colors.primary }, progressStyle]}
              />
            </View>
            <ThemedText style={[styles.stepIndicator, { color: colors.textSecondary }]}>
              Step {step + 1} of {TOTAL_STEPS}
            </ThemedText>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          keyboardShouldPersistTaps="handled"
        >
          {renderStepContent()}

          {error ? (
            <View style={[styles.errorContainer, { backgroundColor: `${colors.error}15` }]}>
              <Feather name="alert-circle" size={16} color={colors.error} />
              <ThemedText style={[styles.errorText, { color: colors.error }]}>{error}</ThemedText>
            </View>
          ) : null}
        </ScrollView>

        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: colors.backgroundRoot,
              paddingBottom: insets.bottom + Spacing.md,
              borderTopColor: colors.border,
            },
          ]}
        >
          <View style={styles.buttonRow}>
            {step > 0 ? (
              <Pressable
                onPress={handleBack}
                style={[styles.backBtn, { borderColor: colors.border }]}
                testID="button-back"
              >
                <Feather name="arrow-left" size={20} color={colors.text} />
              </Pressable>
            ) : (
              <View style={styles.backPlaceholder} />
            )}
            <Button
              onPress={handleNext}
              disabled={loading}
              size="large"
              style={styles.nextButton}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : step === TOTAL_STEPS - 1 ? (
                "Complete Setup"
              ) : (
                "Continue"
              )}
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  progressContainer: {
    gap: Spacing.sm,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  stepIndicator: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "right",
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  stepHeader: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  stepIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  stepDescription: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  specialtyCard: {
    width: "47%",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    gap: Spacing.sm,
  },
  specialtyIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  specialtyLabel: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  servicesList: {
    gap: Spacing.sm,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  serviceCheck: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceText: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  rateCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  rateLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  rateInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  dollarSign: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
  },
  rateInput: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    borderBottomWidth: 2,
    paddingBottom: Spacing.xs,
    minWidth: 80,
    textAlign: "center",
  },
  rateUnit: {
    fontSize: 16,
    fontWeight: "500",
  },
  rateSuggestions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  ratePill: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  ratePillText: {
    fontSize: 14,
    fontWeight: "500",
  },
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  docIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  docContent: {
    flex: 1,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Montserrat_600SemiBold",
    marginBottom: 2,
  },
  docDesc: {
    fontSize: 13,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  agreementCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  agreementTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Montserrat_600SemiBold",
    marginBottom: Spacing.md,
  },
  agreementScroll: {
    maxHeight: 200,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
  },
  agreementBody: {
    fontSize: 13,
    lineHeight: 20,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
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
  checkboxLabel: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  bioCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  bioInput: {
    fontSize: 15,
    lineHeight: 22,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    textAlign: "right",
    marginTop: Spacing.sm,
  },
  summaryCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Montserrat_600SemiBold",
    marginBottom: Spacing.xs,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  summaryText: {
    fontSize: 14,
    flex: 1,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderTopWidth: 1,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  backPlaceholder: {
    width: 48,
  },
  nextButton: {
    flex: 1,
  },
});
