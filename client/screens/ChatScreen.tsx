import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  Pressable,
  Image,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/context/ThemeContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { conversations, mechanics } from "@/data/mockData";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Message } from "@/types";

type ChatRouteProp = RouteProp<RootStackParamList, "Chat">;

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Hi! I saw you need help with your vehicle. What seems to be the issue?",
    senderId: "mechanic",
    timestamp: "10:00 AM",
    isRead: true,
  },
  {
    id: "2",
    text: "Hey! Yes, my car has been making a strange noise when I brake. I think it might be the brake pads.",
    senderId: "user",
    timestamp: "10:02 AM",
    isRead: true,
  },
  {
    id: "3",
    text: "That's a common issue. I can come take a look tomorrow morning if that works for you?",
    senderId: "mechanic",
    timestamp: "10:05 AM",
    isRead: true,
  },
  {
    id: "4",
    text: "That would be great! What time works best?",
    senderId: "user",
    timestamp: "10:08 AM",
    isRead: true,
  },
  {
    id: "5",
    text: "I'll be there in 15 minutes!",
    senderId: "mechanic",
    timestamp: "10:30 AM",
    isRead: false,
  },
];

export default function ChatScreen() {
  const route = useRoute<ChatRouteProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const flatListRef = useRef<FlatList>(null);
  const { colors } = useTheme();

  const conversation = conversations.find((c) => c.id === route.params.conversationId);
  const mechanic = conversation?.mechanic || mechanics[0];

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (!inputText.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      senderId: "user",
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      isRead: false,
    };

    setMessages((prev) => [newMessage, ...prev]);
    setInputText("");
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.senderId === "user";

    return (
      <View
        style={[
          styles.messageBubble,
          isUser
            ? {
                alignSelf: "flex-end",
                backgroundColor: colors.primary,
                borderBottomRightRadius: 4,
              }
            : {
                alignSelf: "flex-start",
                backgroundColor: colors.backgroundRoot,
                borderBottomLeftRadius: 4,
                borderWidth: 1,
                borderColor: colors.border,
              },
        ]}
      >
        <ThemedText
          style={[
            styles.messageText,
            {
              color: isUser ? colors.buttonText : colors.text,
            },
          ]}
        >
          {item.text}
        </ThemedText>
        <ThemedText
          style={[
            styles.messageTime,
            isUser
              ? {
                  color: "rgba(255, 255, 255, 0.7)",
                  textAlign: "right",
                }
              : {
                  color: colors.textSecondary,
                },
          ]}
        >
          {item.timestamp}
        </ThemedText>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Image source={mechanic.avatar} style={styles.emptyAvatar} />
      <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
        Start a conversation
      </ThemedText>
      <ThemedText style={[styles.emptyMessage, { color: colors.textSecondary }]}>
        Send a message to {mechanic.name} about your vehicle service.
      </ThemedText>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.backgroundDefault }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        inverted={messages.length > 0}
        contentContainerStyle={[
          styles.messagesList,
          { paddingTop: headerHeight + Spacing.md },
          messages.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      <View
        style={[
          styles.inputContainer,
          {
            paddingBottom: insets.bottom + Spacing.sm,
            backgroundColor: colors.backgroundRoot,
            borderTopColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={500}
          />
          <Pressable
            style={[
              styles.sendButton,
              !inputText.trim()
                ? { backgroundColor: colors.backgroundTertiary }
                : { backgroundColor: colors.primary },
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Feather
              name="send"
              size={20}
              color={
                inputText.trim() ? colors.buttonText : colors.textSecondary
              }
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  emptyAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Montserrat_600SemiBold",
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  inputContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: BorderRadius.lg,
    paddingLeft: Spacing.md,
    paddingRight: 4,
    paddingVertical: 4,
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: Spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
