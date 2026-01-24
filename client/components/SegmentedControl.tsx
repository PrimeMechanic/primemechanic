import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";

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
  const { colors } = useTheme();

  const handlePress = (index: number) => {
    if (index !== selectedIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onIndexChange(index);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {segments.map((segment, index) => (
        <Pressable
          key={segment}
          style={[
            styles.segment,
            index === selectedIndex && { backgroundColor: colors.primary },
          ]}
          onPress={() => handlePress(index)}
        >
          <ThemedText
            style={[
              styles.segmentText,
              { color: index === selectedIndex ? colors.buttonText : colors.textSecondary },
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
  segmentText: {
    fontSize: 14,
    fontWeight: "500",
  },
  selectedSegmentText: {
    fontWeight: "600",
  },
});
