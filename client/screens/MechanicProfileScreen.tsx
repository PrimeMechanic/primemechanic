import React from "react";
import { StyleSheet, View, Image, ScrollView } from "react-native";
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
import { mechanics, services } from "@/data/mockData";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type MechanicProfileRouteProp = RouteProp<RootStackParamList, "MechanicProfile">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const reviews = [
  {
    id: "1",
    author: "John D.",
    rating: 5,
    date: "2 days ago",
    text: "Marcus was incredibly professional and fixed my brakes in no time. Highly recommend!",
  },
  {
    id: "2",
    author: "Sarah M.",
    rating: 5,
    date: "1 week ago",
    text: "Great communication and fair pricing. Will definitely use again.",
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
      width: 120,
      height: 120,
      borderRadius: 60,
      marginBottom: Spacing.md,
      borderWidth: 4,
      borderColor: colors.accent,
    },
    name: {
      fontSize: 24,
      fontWeight: "700",
      fontFamily: "Montserrat_700Bold",
      color: colors.text,
      marginBottom: 4,
    },
    specialty: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: Spacing.sm,
    },
    availableBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: `rgba(34, 197, 94, 0.1)`,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    availableDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.success,
      marginRight: 6,
    },
    availableText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.success,
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
    messageButton: {
      flex: 1,
    },
    bookButton: {
      flex: 2,
    },
  });
}

export default function MechanicProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<MechanicProfileRouteProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { colors } = useTheme();

  const styles = createStyles(colors);
  const mechanic = mechanics.find((m) => m.id === route.params.mechanicId) || mechanics[0];

  const handleBookNow = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.navigate("BookService", {});
  };

  const handleMessage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Chat", { conversationId: "new", mechanicId: mechanic.id });
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
          <Image source={mechanic.avatar} style={styles.avatar} />
          <ThemedText style={styles.name}>{mechanic.name}</ThemedText>
          <ThemedText style={styles.specialty}>{mechanic.specialty}</ThemedText>
          {mechanic.isAvailable ? (
            <View style={styles.availableBadge}>
              <View style={styles.availableDot} />
              <ThemedText style={styles.availableText}>Available Now</ThemedText>
            </View>
          ) : null}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Feather name="star" size={20} color={colors.warning} />
            </View>
            <ThemedText style={styles.statValue}>{mechanic.rating}</ThemedText>
            <ThemedText style={styles.statLabel}>Rating</ThemedText>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Feather name="check-circle" size={20} color={colors.success} />
            </View>
            <ThemedText style={styles.statValue}>{mechanic.completedJobs}</ThemedText>
            <ThemedText style={styles.statLabel}>Jobs Done</ThemedText>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Feather name="map-pin" size={20} color={colors.accent} />
            </View>
            <ThemedText style={styles.statValue}>{mechanic.distance}</ThemedText>
            <ThemedText style={styles.statLabel}>Away</ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>About</ThemedText>
          <View style={styles.aboutCard}>
            <ThemedText style={styles.aboutText}>
              Certified mechanic with over 10 years of experience specializing in{" "}
              {mechanic.specialty.toLowerCase()}. ASE certified and committed to
              providing top-quality mobile auto repair services.
            </ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Services Offered</ThemedText>
          <View style={styles.servicesGrid}>
            {services.slice(0, 4).map((service) => (
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
              {mechanic.reviewCount} reviews
            </ThemedText>
          </View>
          {reviews.map((review) => (
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
          onPress={handleMessage}
          style={styles.messageButton}
          variant="secondary"
        >
          Message
        </Button>
        <Button onPress={handleBookNow} style={styles.bookButton}>
          Book Now
        </Button>
      </View>
    </View>
  );
}
