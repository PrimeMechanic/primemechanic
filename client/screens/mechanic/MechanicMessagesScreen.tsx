import React from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { CustomerConversationCard } from "@/components/CustomerConversationCard";
import { EmptyState } from "@/components/EmptyState";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { mechanicConversations } from "@/data/mechanicData";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useTheme } from "@/context/ThemeContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MechanicMessagesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const tabBarHeight = useBottomTabBarHeight();
  const { colors } = useTheme();

  const handleConversationPress = (conversationId: string) => {
    navigation.navigate("Chat", { conversationId });
  };

  const unreadCount = mechanicConversations.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundRoot }]} edges={["top"]}>
      <View style={[styles.header, { paddingTop: Spacing.lg }]}>
        <View style={styles.titleRow}>
          <ThemedText style={[styles.screenTitle, { color: colors.text }]}>Messages</ThemedText>
          {unreadCount > 0 ? (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <ThemedText style={styles.unreadBadgeText}>{unreadCount}</ThemedText>
            </View>
          ) : null}
        </View>
        {mechanicConversations.length > 0 ? (
          <View style={[styles.searchBar, { backgroundColor: colors.backgroundDefault }, Shadows.small]}>
            <Feather name="search" size={18} color={colors.textSecondary} />
            <ThemedText style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
              Search customers...
            </ThemedText>
          </View>
        ) : null}
      </View>
      <FlatList
        data={mechanicConversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CustomerConversationCard
            conversation={item}
            onPress={() => handleConversationPress(item.id)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing.xl },
          mechanicConversations.length === 0 && styles.emptyContainer,
        ]}
        scrollIndicatorInsets={{ bottom: 0 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            image={require("../../../assets/images/empty-messages.png")}
            title="No Messages Yet"
            message="Customer messages will appear here when you accept jobs."
          />
        }
      />
    </SafeAreaView>
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
  },
  unreadBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
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
