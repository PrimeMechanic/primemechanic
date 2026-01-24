import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
}

export function SegmentedControl({
  segments,
  selectedIndex,
  onIndexChange,
}: SegmentedControlProps) {
  const handlePress = (index: number) => {
    if (index !== selectedIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onIndexChange(index);
    }
  };

  return (
    <View style={styles.container}>
      {segments.map((segment, index) => (
        <Pressable
          key={segment}
          style={[
            styles.segment,
            index === selectedIndex && styles.selectedSegment,
          ]}
          onPress={() => handlePress(index)}
        >
          <ThemedText
            style={[
              styles.segmentText,
              index === selectedIndex && styles.selectedSegmentText,
            ]}
          >
            {segment}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.xs,
  },
  selectedSegment: {
    backgroundColor: Colors.dark.primary,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.dark.textSecondary,
  },
  selectedSegmentText: {
    color: Colors.dark.buttonText,
    fontWeight: "600",
  },
});
