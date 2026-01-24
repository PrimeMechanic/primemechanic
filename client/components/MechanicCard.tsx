import React from "react";
import { StyleSheet, Pressable, View, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { Mechanic } from "@/types";

interface MechanicCardProps {
  mechanic: Mechanic;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MechanicCard({ mechanic, onPress }: MechanicCardProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        animatedStyle,
        { backgroundColor: colors.backgroundRoot, borderColor: colors.border },
      ]}
    >
      <Image source={mechanic.avatar} style={styles.avatar} />
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={[styles.name, { color: colors.text }]}>{mechanic.name}</ThemedText>
          {mechanic.isAvailable ? (
            <View
              style={[
                styles.availableBadge,
                { backgroundColor: `rgba(${colors.success === "#22C55E" ? "34, 197, 94" : "34, 197, 94"}, 0.1)` },
              ]}
            >
              <View style={[styles.availableDot, { backgroundColor: colors.success }]} />
              <ThemedText style={[styles.availableText, { color: colors.success }]}>
                Available
              </ThemedText>
            </View>
          ) : null}
        </View>
        <ThemedText style={[styles.specialty, { color: colors.textSecondary }]}>
          {mechanic.specialty}
        </ThemedText>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Feather name="star" size={14} color={colors.warning} />
            <ThemedText style={[styles.statText, { color: colors.textSecondary }]}>
              {mechanic.rating} ({mechanic.reviewCount})
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <Feather name="map-pin" size={14} color={colors.textSecondary} />
            <ThemedText style={[styles.statText, { color: colors.textSecondary }]}>
              {mechanic.distance}
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <Feather name="dollar-sign" size={14} color={colors.success} />
            <ThemedText style={[styles.statText, { color: colors.textSecondary }]}>
              ${mechanic.hourlyRate}/hr
            </ThemedText>
          </View>
        </View>
      </View>
      <Feather name="chevron-right" size={20} color={colors.textSecondary} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Montserrat_600SemiBold",
    marginRight: Spacing.sm,
  },
  availableBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  availableText: {
    fontSize: 11,
    fontWeight: "500",
  },
  specialty: {
    fontSize: 14,
    marginBottom: 8,
  },
  stats: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
});
