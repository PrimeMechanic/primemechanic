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
import { Conversation } from "@/types";

interface ConversationCardProps {
  conversation: Conversation;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ConversationCard({ conversation, onPress }: ConversationCardProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 20, stiffness: 200 });
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
        { backgroundColor: colors.backgroundDefault },
        Shadows.medium,
        animatedStyle,
      ]}
    >
      <View style={styles.avatarContainer}>
        <Image source={conversation.mechanic.avatar} style={[styles.avatar, { borderColor: colors.primary }]} />
        {conversation.mechanic.isAvailable ? (
          <View style={[styles.onlineIndicator, { backgroundColor: colors.success, borderColor: colors.backgroundDefault }]} />
        ) : null}
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={[styles.name, { color: colors.text }]}>
            {conversation.mechanic.name}
          </ThemedText>
          <ThemedText style={[styles.time, { color: colors.textSecondary }]}>
            {conversation.lastMessageTime}
          </ThemedText>
        </View>
        <View style={styles.messageRow}>
          <ThemedText
            style={[
              styles.message,
              { color: colors.textSecondary },
              conversation.unreadCount > 0 && { color: colors.text, fontWeight: "500" },
            ]}
            numberOfLines={1}
          >
            {conversation.lastMessage}
          </ThemedText>
          {conversation.unreadCount > 0 ? (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <ThemedText style={styles.unreadText}>
                {conversation.unreadCount}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>
      <View style={[styles.chevronContainer, { backgroundColor: `${colors.primary}10` }]}>
        <Feather name="chevron-right" size={16} color={colors.primary} />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  avatarContainer: {
    position: "relative",
    marginRight: Spacing.md,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    borderWidth: 2,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Montserrat_600SemiBold",
  },
  time: {
    fontSize: 12,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  message: {
    fontSize: 14,
    flex: 1,
    marginRight: Spacing.sm,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 7,
  },
  unreadText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  chevronContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
  },
});
