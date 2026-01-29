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
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
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
    scale.value = withSpring(0.98, { damping: 20, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 200 });
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
        { backgroundColor: colors.backgroundDefault },
        Shadows.small,
      ]}
    >
      <View style={styles.avatarContainer}>
        <Image source={mechanic.avatar} style={styles.avatar} />
        {mechanic.isAvailable ? (
          <View style={[styles.onlineIndicator, { backgroundColor: colors.success, borderColor: colors.backgroundDefault }]} />
        ) : null}
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={[styles.name, { color: colors.text }]}>{mechanic.name}</ThemedText>
          <View style={[styles.ratingBadge, { backgroundColor: `${colors.warning}15` }]}>
            <Feather name="star" size={12} color={colors.warning} />
            <ThemedText style={[styles.ratingText, { color: colors.warning }]}>
              {mechanic.rating}
            </ThemedText>
          </View>
        </View>
        <ThemedText style={[styles.specialty, { color: colors.textSecondary }]}>
          {mechanic.specialty}
        </ThemedText>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Feather name="map-pin" size={13} color={colors.textSecondary} />
            <ThemedText style={[styles.statText, { color: colors.textSecondary }]}>
              {mechanic.distance}
            </ThemedText>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <ThemedText style={[styles.priceText, { color: colors.primary }]}>
              ${mechanic.hourlyRate}/hr
            </ThemedText>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <ThemedText style={[styles.statText, { color: colors.textSecondary }]}>
              {mechanic.reviewCount} reviews
            </ThemedText>
          </View>
        </View>
      </View>
      <View style={[styles.chevronContainer, { backgroundColor: `${colors.primary}10` }]}>
        <Feather name="chevron-right" size={18} color={colors.primary} />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  avatarContainer: {
    position: "relative",
    marginRight: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
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
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
  },
  specialty: {
    fontSize: 14,
    marginBottom: 8,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
  priceText: {
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: "#E3E7E5",
    marginHorizontal: Spacing.sm,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
  },
});
