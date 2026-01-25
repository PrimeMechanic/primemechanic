import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#FFFFFF",
    textSecondary: "#9CA3AF",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B7280",
    tabIconSelected: "#2EFF3A",
    link: "#2EFF3A",
    primary: "#2EFF3A",
    primaryVariant: "#25CC2E",
    accent: "#2EFF3A",
    success: "#2EFF3A",
    warning: "#F59E0B",
    error: "#EF4444",
    border: "#3A3F46",
    backgroundRoot: "#121212",
    backgroundDefault: "#1A1A1A",
    backgroundSecondary: "#2A2F36",
    backgroundTertiary: "#3A3F46",
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#9CA3AF",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B7280",
    tabIconSelected: "#2EFF3A",
    link: "#2EFF3A",
    primary: "#2EFF3A",
    primaryVariant: "#25CC2E",
    accent: "#2EFF3A",
    success: "#2EFF3A",
    warning: "#F59E0B",
    error: "#EF4444",
    border: "#3A3F46",
    backgroundRoot: "#121212",
    backgroundDefault: "#1A1A1A",
    backgroundSecondary: "#2A2F36",
    backgroundTertiary: "#3A3F46",
  },
};

export type ThemeColors = typeof Colors.light;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
    fontFamily: "Montserrat_700Bold",
  },
  h2: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "600" as const,
    fontFamily: "Montserrat_600SemiBold",
  },
  h3: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600" as const,
    fontFamily: "Montserrat_600SemiBold",
  },
  h4: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600" as const,
    fontFamily: "Montserrat_600SemiBold",
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
};

export const Shadows = {
  small: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
