import React from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ConversationCard } from "@/components/ConversationCard";
import { EmptyState } from "@/components/EmptyState";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { conversations } from "@/data/mockData";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useTheme } from "@/context/ThemeContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MessagesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const handleConversationPress = (conversationId: string) => {
    navigation.navigate("Chat", { conversationId });
  };

  const unreadCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: headerHeight + Spacing.lg }]}>
        {conversations.length > 0 ? (
          <View style={[styles.searchBar, { backgroundColor: colors.backgroundDefault }, Shadows.small]}>
            <Feather name="search" size={18} color={colors.textSecondary} />
            <ThemedText style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
              Search conversations...
            </ThemedText>
          </View>
        ) : null}
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationCard
            conversation={item}
            onPress={() => handleConversationPress(item.id)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing.xl },
          conversations.length === 0 && styles.emptyContainer,
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            image={require("../../assets/images/empty-messages.png")}
            title="No Messages Yet"
            message="Start a conversation by booking a service with a mechanic."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  searchPlaceholder: {
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  separator: {
    height: Spacing.md,
  },
});
