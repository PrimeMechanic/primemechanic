import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#1C1C1C",
    textSecondary: "#6B6F73",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B6F73",
    tabIconSelected: "#0FA958",
    link: "#0FA958",
    primary: "#0FA958",
    primaryVariant: "#0B3D2E",
    accent: "#14C97A",
    success: "#0FA958",
    warning: "#F59E0B",
    error: "#EF4444",
    border: "#E3E7E5",
    backgroundRoot: "#F6F8F7",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#FFFFFF",
    backgroundTertiary: "#E3E7E5",
  },
  dark: {
    text: "#B0B0B0",
    textSecondary: "#808080",
    buttonText: "#FFFFFF",
    tabIconDefault: "#707070",
    tabIconSelected: "#0FA958",
    link: "#0FA958",
    primary: "#0FA958",
    primaryVariant: "#0B3D2E",
    accent: "#0FA958",
    success: "#0FA958",
    warning: "#F59E0B",
    error: "#EF4444",
    border: "#2A2A2A",
    backgroundRoot: "#111111",
    backgroundDefault: "#1A1A1A",
    backgroundSecondary: "#0B3D2E",
    backgroundTertiary: "#2A2A2A",
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
  inputHeight: 52,
  buttonHeight: 56,
  /** Extra padding to add after safe area inset for screen headers */
  safeAreaTopOffset: 24,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
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
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  large: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  fab: {
    shadowColor: "#0FA958",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
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
