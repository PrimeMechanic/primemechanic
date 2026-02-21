import React from "react";
import { StyleSheet, View, Image, ScrollView, Pressable, Linking, Platform } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/context/ThemeContext";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { shops, services } from "@/data/mockData";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type ShopProfileRouteProp = RouteProp<RootStackParamList, "ShopProfile">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const shopReviews = [
  {
    id: "1",
    author: "Mike T.",
    rating: 5,
    date: "3 days ago",
    text: "Brought my car in for brake service and they did an excellent job. Fair pricing and great communication throughout.",
  },
  {
    id: "2",
    author: "Lisa K.",
    rating: 4,
    date: "1 week ago",
    text: "Quick oil change and tire rotation. Professional staff and clean waiting area. Will come back again.",
  },
];

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundDefault,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      alignItems: "center",
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 20,
      marginBottom: Spacing.md,
      borderWidth: 3,
      borderColor: colors.accent,
    },
    name: {
      fontSize: 24,
      fontWeight: "700",
      fontFamily: "Montserrat_700Bold",
      color: colors.text,
      marginBottom: 4,
      textAlign: "center",
    },
    addressText: {
      fontSize: 15,
      color: colors.textSecondary,
      marginBottom: Spacing.sm,
      textAlign: "center",
    },
    verifiedBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: `${colors.primary}15`,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    verifiedDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginRight: 6,
    },
    verifiedText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.primary,
    },
    statsRow: {
      flexDirection: "row",
      paddingHorizontal: Spacing.lg,
      gap: Spacing.md,
      marginBottom: Spacing.xl,
    },
    statCard: {
      flex: 1,
      alignItems: "center",
      backgroundColor: colors.backgroundRoot,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statIconContainer: {
      marginBottom: Spacing.sm,
    },
    statValue: {
      fontSize: 20,
      fontWeight: "700",
      fontFamily: "Montserrat_700Bold",
      color: colors.text,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    section: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: Spacing.md,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      fontFamily: "Montserrat_600SemiBold",
      color: colors.text,
      marginBottom: Spacing.md,
    },
    reviewCount: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    aboutCard: {
      backgroundColor: colors.backgroundRoot,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    aboutText: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
    },
    infoCard: {
      backgroundColor: colors.backgroundRoot,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    infoRowLast: {
      borderBottomWidth: 0,
    },
    infoIcon: {
      marginRight: Spacing.md,
    },
    infoContent: {
      flex: 1,
    },
    infoLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    infoValue: {
      fontSize: 15,
      color: colors.text,
    },
    infoAction: {
      paddingHorizontal: Spacing.sm,
    },
    servicesGrid: {
      backgroundColor: colors.backgroundRoot,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    serviceItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    serviceName: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
      marginLeft: Spacing.md,
    },
    servicePrice: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.primary,
    },
    reviewCard: {
      backgroundColor: colors.backgroundRoot,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: Spacing.md,
    },
    reviewHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: Spacing.sm,
    },
    reviewAuthor: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    reviewRating: {
      flexDirection: "row",
      gap: 2,
    },
    reviewText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
      marginBottom: Spacing.sm,
    },
    reviewDate: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.md,
      backgroundColor: colors.backgroundRoot,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: Spacing.md,
    },
    callButton: {
      flex: 1,
    },
    bookButton: {
      flex: 2,
    },
  });
}

export default function ShopProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ShopProfileRouteProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { colors } = useTheme();

  const styles = createStyles(colors);
  const shop = shops.find((s) => s.id === route.params.shopId) || shops[0];

  const handleCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS !== "web") {
      Linking.openURL(`tel:${shop.phone}`);
    }
  };

  const handleBookNow = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.navigate("BookService", {});
  };

  const handleGetDirections = () => {
    const address = encodeURIComponent(`${shop.address}, ${shop.city}, ${shop.state}`);
    if (Platform.OS === "ios") {
      Linking.openURL(`maps://app?daddr=${address}`);
    } else {
      Linking.openURL(`https://maps.google.com/?daddr=${address}`);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: Spacing["4xl"] + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image source={shop.avatar} style={styles.avatar} />
          <ThemedText style={styles.name}>{shop.name}</ThemedText>
          <ThemedText style={styles.addressText}>
            {shop.address}, {shop.city}, {shop.state}
          </ThemedText>
          {shop.isVerified ? (
            <View style={styles.verifiedBadge}>
              <View style={styles.verifiedDot} />
              <ThemedText style={styles.verifiedText}>Verified Shop</ThemedText>
            </View>
          ) : null}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Feather name="star" size={20} color={colors.warning} />
            </View>
            <ThemedText style={styles.statValue}>{shop.rating}</ThemedText>
            <ThemedText style={styles.statLabel}>Rating</ThemedText>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Feather name="check-circle" size={20} color={colors.success} />
            </View>
            <ThemedText style={styles.statValue}>{shop.completedJobs.toLocaleString()}</ThemedText>
            <ThemedText style={styles.statLabel}>Jobs Done</ThemedText>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Feather name="map-pin" size={20} color={colors.accent} />
            </View>
            <ThemedText style={styles.statValue}>{shop.distance}</ThemedText>
            <ThemedText style={styles.statLabel}>Away</ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>About</ThemedText>
          <View style={styles.aboutCard}>
            <ThemedText style={styles.aboutText}>{shop.description}</ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Shop Info</ThemedText>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Feather name="map-pin" size={18} color={colors.accent} style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Address</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {shop.address}, {shop.city}, {shop.state}
                </ThemedText>
              </View>
              <Pressable onPress={handleGetDirections} style={styles.infoAction}>
                <Feather name="navigation" size={16} color={colors.primary} />
              </Pressable>
            </View>
            <View style={styles.infoRow}>
              <Feather name="clock" size={18} color={colors.accent} style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Hours</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {shop.daysOpen}: {shop.hoursOpen} - {shop.hoursClose}
                </ThemedText>
              </View>
            </View>
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Feather name="phone" size={18} color={colors.accent} style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Phone</ThemedText>
                <ThemedText style={styles.infoValue}>{shop.phone}</ThemedText>
              </View>
              <Pressable onPress={handleCall} style={styles.infoAction}>
                <Feather name="phone-call" size={16} color={colors.primary} />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Services Offered</ThemedText>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <View key={service.id} style={styles.serviceItem}>
                <Feather
                  name={service.icon as any}
                  size={18}
                  color={colors.accent}
                />
                <ThemedText style={styles.serviceName}>{service.name}</ThemedText>
                <ThemedText style={styles.servicePrice}>${service.price}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Reviews</ThemedText>
            <ThemedText style={styles.reviewCount}>
              {shop.reviewCount} reviews
            </ThemedText>
          </View>
          {shopReviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <ThemedText style={styles.reviewAuthor}>{review.author}</ThemedText>
                <View style={styles.reviewRating}>
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Feather key={i} name="star" size={14} color={colors.warning} />
                  ))}
                </View>
              </View>
              <ThemedText style={styles.reviewText}>{review.text}</ThemedText>
              <ThemedText style={styles.reviewDate}>{review.date}</ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Button
          onPress={handleCall}
          style={styles.callButton}
          variant="secondary"
        >
          Call Shop
        </Button>
        <Button onPress={handleBookNow} style={styles.bookButton}>
          Book Service
        </Button>
      </View>
    </View>
  );
}
