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
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Mechanic } from "@/types";

interface MechanicCardProps {
  mechanic: Mechanic;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MechanicCard({ mechanic, onPress }: MechanicCardProps) {
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
      style={[styles.container, animatedStyle]}
    >
      <Image source={mechanic.avatar} style={styles.avatar} />
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={styles.name}>{mechanic.name}</ThemedText>
          {mechanic.isAvailable ? (
            <View style={styles.availableBadge}>
              <View style={styles.availableDot} />
              <ThemedText style={styles.availableText}>Available</ThemedText>
            </View>
          ) : null}
        </View>
        <ThemedText style={styles.specialty}>{mechanic.specialty}</ThemedText>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Feather name="star" size={14} color={Colors.dark.warning} />
            <ThemedText style={styles.statText}>
              {mechanic.rating} ({mechanic.reviewCount})
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <Feather name="map-pin" size={14} color={Colors.dark.textSecondary} />
            <ThemedText style={styles.statText}>{mechanic.distance}</ThemedText>
          </View>
          <View style={styles.statItem}>
            <Feather name="dollar-sign" size={14} color={Colors.dark.success} />
            <ThemedText style={styles.statText}>${mechanic.hourlyRate}/hr</ThemedText>
          </View>
        </View>
      </View>
      <Feather name="chevron-right" size={20} color={Colors.dark.textSecondary} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
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
    color: Colors.dark.text,
    marginRight: Spacing.sm,
  },
  availableBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(52, 199, 89, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dark.success,
    marginRight: 4,
  },
  availableText: {
    fontSize: 11,
    color: Colors.dark.success,
    fontWeight: "500",
  },
  specialty: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
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
    color: Colors.dark.textSecondary,
  },
});
