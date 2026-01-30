import React, { useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import type { AuthStackParamList } from "@/navigation/RootStackNavigator";

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function SignUpScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { signUp } = useAuth();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"customer" | "mechanic">("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const customerScale = useSharedValue(1);
  const mechanicScale = useSharedValue(1);

  const customerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: customerScale.value }],
  }));

  const mechanicAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mechanicScale.value }],
  }));

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signUp(email.trim(), password, name.trim(), phone.trim() || undefined, role);
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundRoot }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + Spacing.safeAreaTopOffset + Spacing.xl }]}
        >
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={12}>
              <View style={[styles.backButtonCircle, { backgroundColor: colors.backgroundDefault }]}>
                <Feather name="arrow-left" size={20} color={colors.text} />
              </View>
            </Pressable>
            <ThemedText style={[styles.title, { color: colors.text }]}>Create Account</ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
              Join PrimeMechanic today
            </ThemedText>
          </View>

          <View style={styles.roleContainer}>
            <ThemedText style={[styles.label, { color: colors.textSecondary }]}>I AM A</ThemedText>
            <View style={styles.roleButtons}>
              <AnimatedPressable
                style={[
                  styles.roleButton,
                  { backgroundColor: role === "customer" ? `${colors.primary}12` : colors.backgroundDefault },
                  { borderColor: role === "customer" ? colors.primary : colors.border },
                  customerAnimatedStyle,
                ]}
                onPress={() => setRole("customer")}
                onPressIn={() => { customerScale.value = withSpring(0.97); }}
                onPressOut={() => { customerScale.value = withSpring(1); }}
              >
                <View style={[
                  styles.roleIcon, 
                  { backgroundColor: role === "customer" ? `${colors.primary}20` : `${colors.textSecondary}10` }
                ]}>
                  <Feather 
                    name="user" 
                    size={20} 
                    color={role === "customer" ? colors.primary : colors.textSecondary} 
                  />
                </View>
                <ThemedText 
                  style={[
                    styles.roleText, 
                    { color: role === "customer" ? colors.primary : colors.text }
                  ]}
                >
                  Customer
                </ThemedText>
                {role === "customer" ? (
                  <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                    <Feather name="check" size={12} color="#FFFFFF" />
                  </View>
                ) : null}
              </AnimatedPressable>
              <AnimatedPressable
                style={[
                  styles.roleButton,
                  { backgroundColor: role === "mechanic" ? `${colors.primary}12` : colors.backgroundDefault },
                  { borderColor: role === "mechanic" ? colors.primary : colors.border },
                  mechanicAnimatedStyle,
                ]}
                onPress={() => setRole("mechanic")}
                onPressIn={() => { mechanicScale.value = withSpring(0.97); }}
                onPressOut={() => { mechanicScale.value = withSpring(1); }}
              >
                <View style={[
                  styles.roleIcon, 
                  { backgroundColor: role === "mechanic" ? `${colors.primary}20` : `${colors.textSecondary}10` }
                ]}>
                  <Feather 
                    name="tool" 
                    size={20} 
                    color={role === "mechanic" ? colors.primary : colors.textSecondary} 
                  />
                </View>
                <ThemedText 
                  style={[
                    styles.roleText, 
                    { color: role === "mechanic" ? colors.primary : colors.text }
                  ]}
                >
                  Mechanic
                </ThemedText>
                {role === "mechanic" ? (
                  <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                    <Feather name="check" size={12} color="#FFFFFF" />
                  </View>
                ) : null}
              </AnimatedPressable>
            </View>
          </View>

          <View style={[styles.formCard, { backgroundColor: colors.backgroundDefault }, Shadows.medium]}>
            <View style={styles.inputContainer}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>FULL NAME</ThemedText>
              <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.backgroundRoot }]}>
                <Feather name="user" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  testID="input-name"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>EMAIL</ThemedText>
              <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.backgroundRoot }]}>
                <Feather name="mail" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  testID="input-email"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>PHONE (OPTIONAL)</ThemedText>
              <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.backgroundRoot }]}>
                <Feather name="phone" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter your phone number"
                  placeholderTextColor={colors.textSecondary}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  testID="input-phone"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>PASSWORD</ThemedText>
              <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.backgroundRoot }]}>
                <Feather name="lock" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Create a password"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  testID="input-password"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Feather name={showPassword ? "eye" : "eye-off"} size={20} color={colors.textSecondary} />
                </Pressable>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>CONFIRM PASSWORD</ThemedText>
              <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.backgroundRoot }]}>
                <Feather name="lock" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  testID="input-confirm-password"
                />
              </View>
            </View>

            {error ? (
              <View style={[styles.errorContainer, { backgroundColor: `${colors.error}15` }]}>
                <Feather name="alert-circle" size={16} color={colors.error} />
                <ThemedText style={[styles.errorText, { color: colors.error }]}>{error}</ThemedText>
              </View>
            ) : null}

            <Button
              onPress={handleSignUp}
              disabled={loading}
              size="large"
              style={styles.signUpButton}
            >
              {loading ? <ActivityIndicator color="#FFFFFF" /> : "Create Account"}
            </Button>

            <View style={styles.signinContainer}>
              <ThemedText style={{ color: colors.textSecondary }}>
                Already have an account?{" "}
              </ThemedText>
              <Pressable onPress={() => navigation.goBack()}>
                <ThemedText style={[styles.link, { color: colors.primary }]}>Sign In</ThemedText>
              </Pressable>
            </View>
          </View>

          <ThemedText style={[styles.termsText, { color: colors.textSecondary }]}>
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </ThemedText>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing["4xl"],
  },
  header: {
    marginBottom: Spacing.xl,
    flexShrink: 0,
  },
  backButton: {
    marginBottom: Spacing.lg,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
  },
  roleContainer: {
    marginBottom: Spacing.xl,
  },
  roleButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  roleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  roleText: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  formCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  eyeButton: {
    padding: Spacing.xs,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
  signUpButton: {
    marginTop: Spacing.sm,
  },
  signinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.xl,
  },
  link: {
    fontWeight: "600",
  },
  termsText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});
