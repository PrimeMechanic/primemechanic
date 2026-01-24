import React, { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

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
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
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
    <View style={[styles.container, { backgroundColor: colors.backgroundDefault }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: tabBarHeight + Spacing["4xl"],
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search mechanics or services..."
          />
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Services</ThemedText>
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
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Nearby Mechanics</ThemedText>
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
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Montserrat_600SemiBold",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  servicesRow: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  mechanicsGrid: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
});
