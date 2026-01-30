import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import { Spacing } from "@/constants/theme";

interface SafeAreaScreenProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: ("top" | "bottom" | "left" | "right")[];
  extraTopPadding?: number;
}

export function SafeAreaScreen({ 
  children, 
  style, 
  edges = ["top"],
  extraTopPadding = 0,
}: SafeAreaScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const paddingStyle: ViewStyle = {
    paddingTop: edges.includes("top") ? insets.top + Spacing.safeAreaTopOffset + extraTopPadding : 0,
    paddingBottom: edges.includes("bottom") ? insets.bottom : 0,
    paddingLeft: edges.includes("left") ? insets.left : 0,
    paddingRight: edges.includes("right") ? insets.right : 0,
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundRoot }, paddingStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
