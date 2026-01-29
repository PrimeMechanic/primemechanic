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
import { LinearGradient } from "expo-linear-gradient";
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

type Props = NativeStackScreenProps<AuthStackParamList, "SignIn">;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function SignInScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoScale = useSharedValue(1);

  const demoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: demoScale.value }],
  }));

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signIn(email.trim(), password);
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
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
          contentContainerStyle={[
            styles.scrollContent, 
            { paddingTop: insets.top + Spacing.safeAreaTopOffset + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={["#0FA958", "#0B3D2E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoCircle}
            >
              <Feather name="tool" size={40} color="#FFFFFF" />
            </LinearGradient>
            <ThemedText style={[styles.appName, { color: colors.text }]}>
              PrimeMechanic
            </ThemedText>
            <ThemedText style={[styles.tagline, { color: colors.textSecondary }]}>
              Your trusted mobile mechanic
            </ThemedText>
          </View>

          <View style={[styles.formCard, { backgroundColor: colors.backgroundDefault }, Shadows.medium]}>
            <View style={styles.inputContainer}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>Email</ThemedText>
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
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>Password</ThemedText>
              <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.backgroundRoot }]}>
                <Feather name="lock" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter your password"
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

            {error ? (
              <View style={[styles.errorContainer, { backgroundColor: colors.error + "15" }]}>
                <Feather name="alert-circle" size={16} color={colors.error} />
                <ThemedText style={[styles.errorText, { color: colors.error }]}>{error}</ThemedText>
              </View>
            ) : null}

            <Button
              onPress={handleSignIn}
              disabled={loading}
              size="large"
              style={styles.signInButton}
            >
              {loading ? <ActivityIndicator color="#FFFFFF" /> : "Sign In"}
            </Button>

            <View style={styles.signupContainer}>
              <ThemedText style={{ color: colors.textSecondary }}>
                Don't have an account?{" "}
              </ThemedText>
              <Pressable onPress={() => navigation.navigate("SignUp")}>
                <ThemedText style={[styles.link, { color: colors.primary }]}>Sign Up</ThemedText>
              </Pressable>
            </View>
          </View>

          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <ThemedText style={[styles.dividerText, { color: colors.textSecondary }]}>or</ThemedText>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <AnimatedPressable
            onPress={() => navigation.navigate("Demo")}
            onPressIn={() => { demoScale.value = withSpring(0.97); }}
            onPressOut={() => { demoScale.value = withSpring(1); }}
            style={[
              styles.demoButton,
              { backgroundColor: colors.backgroundDefault, borderColor: colors.border },
              Shadows.small,
              demoAnimatedStyle,
            ]}
          >
            <Feather name="play-circle" size={20} color={colors.primary} />
            <ThemedText style={[styles.demoText, { color: colors.text }]}>
              Continue as Demo User
            </ThemedText>
          </AnimatedPressable>

          <ThemedText style={[styles.termsText, { color: colors.textSecondary }]}>
            By continuing, you agree to our Terms of Service and Privacy Policy
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
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: 16,
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
    fontSize: 13,
    fontWeight: "600",
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
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
  signInButton: {
    marginTop: Spacing.sm,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.xl,
  },
  link: {
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: Spacing.lg,
    fontSize: 14,
  },
  demoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  demoText: {
    fontSize: 16,
    fontWeight: "600",
  },
  termsText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: Spacing.xl,
    lineHeight: 18,
  },
});
