import React, { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { SearchBar } from "@/components/SearchBar";
import { ServiceCard } from "@/components/ServiceCard";
import { MechanicCard } from "@/components/MechanicCard";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { EmptyState } from "@/components/EmptyState";
import { Spacing } from "@/constants/theme";
import { services, mechanics } from "@/data/mockData";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useTheme } from "@/context/ThemeContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BrowseScreen() {
  const navigation = useNavigation<NavigationProp>();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMechanics = mechanics.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleServicePress = (serviceId: string) => {
    navigation.navigate("BookService", { serviceId });
  };

  const handleMechanicPress = (mechanicId: string) => {
    navigation.navigate("MechanicProfile", { mechanicId });
  };

  const handleBookNow = () => {
    navigation.navigate("BookService", {});
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.safeAreaTopOffset,
          paddingBottom: tabBarHeight + Spacing["5xl"],
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeContainer}>
          <ThemedText style={[styles.welcomeText, { color: colors.textSecondary }]}>
            Welcome back
          </ThemedText>
          <ThemedText style={[styles.headline, { color: colors.text }]}>
            Find a Mechanic
          </ThemedText>
        </View>

        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search mechanics or services..."
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              Popular Services
            </ThemedText>
            <View style={[styles.seeAllButton, { backgroundColor: `${colors.primary}10` }]}>
              <ThemedText style={[styles.seeAllText, { color: colors.primary }]}>
                See All
              </ThemedText>
              <Feather name="chevron-right" size={14} color={colors.primary} />
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicesRow}
          >
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onPress={() => handleServicePress(service.id)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              Nearby Mechanics
            </ThemedText>
            <ThemedText style={[styles.countText, { color: colors.textSecondary }]}>
              {filteredMechanics.length} available
            </ThemedText>
          </View>
          {filteredMechanics.length > 0 ? (
            <View style={styles.mechanicsGrid}>
              {filteredMechanics.map((mechanic) => (
                <MechanicCard
                  key={mechanic.id}
                  mechanic={mechanic}
                  onPress={() => handleMechanicPress(mechanic.id)}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              image={require("../../assets/images/empty-mechanics.png")}
              title="No Mechanics Found"
              message="We couldn't find any mechanics matching your search. Try adjusting your filters."
            />
          )}
        </View>
      </ScrollView>

      <FloatingActionButton
        onPress={handleBookNow}
        bottom={tabBarHeight + Spacing.lg}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  welcomeContainer: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  welcomeText: {
    fontSize: 15,
    marginBottom: 4,
  },
  headline: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
  },
  searchContainer: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing["2xl"],
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Montserrat_600SemiBold",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "600",
  },
  countText: {
    fontSize: 14,
  },
  servicesRow: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  mechanicsGrid: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
});
