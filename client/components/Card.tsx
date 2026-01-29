import React from "react";
import { StyleSheet, Pressable, ViewStyle, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/context/ThemeContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface CardProps {
  elevation?: "small" | "medium" | "large" | "none";
  title?: string;
  description?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: "default" | "compact" | "none";
}

const springConfig: WithSpringConfig = {
  damping: 20,
  mass: 0.4,
  stiffness: 200,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({
  elevation = "small",
  title,
  description,
  children,
  onPress,
  style,
  padding = "default",
}: CardProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, springConfig);
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, springConfig);
    }
  };

  const getShadow = () => {
    switch (elevation) {
      case "small":
        return Shadows.small;
      case "medium":
        return Shadows.medium;
      case "large":
        return Shadows.large;
      default:
        return {};
    }
  };

  const getPadding = () => {
    switch (padding) {
      case "compact":
        return Spacing.md;
      case "none":
        return 0;
      default:
        return Spacing.lg;
    }
  };

  const cardStyle = [
    styles.card,
    { 
      backgroundColor: colors.backgroundDefault,
      padding: getPadding(),
    },
    getShadow(),
    animatedStyle,
    style,
  ];

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={cardStyle}
      >
        {title ? (
          <ThemedText type="h4" style={styles.cardTitle}>
            {title}
          </ThemedText>
        ) : null}
        {description ? (
          <ThemedText type="small" style={[styles.cardDescription, { color: colors.textSecondary }]}>
            {description}
          </ThemedText>
        ) : null}
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <Animated.View style={cardStyle}>
      {title ? (
        <ThemedText type="h4" style={styles.cardTitle}>
          {title}
        </ThemedText>
      ) : null}
      {description ? (
        <ThemedText type="small" style={[styles.cardDescription, { color: colors.textSecondary }]}>
          {description}
        </ThemedText>
      ) : null}
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  cardTitle: {
    marginBottom: Spacing.xs,
  },
  cardDescription: {
    marginBottom: Spacing.sm,
  },
});
