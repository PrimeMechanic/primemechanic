import React from "react";
import { StyleSheet, Pressable, View, Image } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";
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
      <View style={styles.avatarContainer}>
        <Image source={conversation.mechanic.avatar} style={styles.avatar} />
        {conversation.mechanic.isAvailable ? (
          <View
            style={[
              styles.onlineIndicator,
              { backgroundColor: colors.success, borderColor: colors.backgroundRoot },
            ]}
          />
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
              conversation.unreadCount > 0 && [
                styles.unreadMessage,
                { color: colors.text },
              ],
            ]}
            numberOfLines={1}
          >
            {conversation.lastMessage}
          </ThemedText>
          {conversation.unreadCount > 0 ? (
            <View style={[styles.unreadBadge, { backgroundColor: colors.accent }]}>
              <ThemedText style={[styles.unreadText, { color: colors.buttonText }]}>
                {conversation.unreadCount}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>
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
  avatarContainer: {
    position: "relative",
    marginRight: Spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
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
  unreadMessage: {
    fontWeight: "500",
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
