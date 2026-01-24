import React from "react";
import { StyleSheet, Pressable, View, Image } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Conversation } from "@/types";

interface ConversationCardProps {
  conversation: Conversation;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ConversationCard({ conversation, onPress }: ConversationCardProps) {
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
      <View style={styles.avatarContainer}>
        <Image source={conversation.mechanic.avatar} style={styles.avatar} />
        {conversation.mechanic.isAvailable ? (
          <View style={styles.onlineIndicator} />
        ) : null}
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={styles.name}>
            {conversation.mechanic.name}
          </ThemedText>
          <ThemedText style={styles.time}>
            {conversation.lastMessageTime}
          </ThemedText>
        </View>
        <View style={styles.messageRow}>
          <ThemedText
            style={[
              styles.message,
              conversation.unreadCount > 0 && styles.unreadMessage,
            ]}
            numberOfLines={1}
          >
            {conversation.lastMessage}
          </ThemedText>
          {conversation.unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <ThemedText style={styles.unreadText}>
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
    backgroundColor: Colors.dark.backgroundRoot,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
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
    backgroundColor: Colors.dark.success,
    borderWidth: 2,
    borderColor: Colors.dark.backgroundRoot,
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
    color: Colors.dark.text,
  },
  time: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  message: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  unreadMessage: {
    color: Colors.dark.text,
    fontWeight: "500",
  },
  unreadBadge: {
    backgroundColor: Colors.dark.accent,
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
    color: Colors.dark.buttonText,
  },
});
