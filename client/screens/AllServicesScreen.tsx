import React from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/context/ThemeContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { services } from "@/data/mockData";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Service } from "@/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ServiceListItem({ service, onPress }: { service: Service; onPress: () => void }) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 20, stiffness: 200 });
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
      testID={`service-item-${service.id}`}
      style={[
        styles.serviceItem,
        animatedStyle,
        { backgroundColor: colors.backgroundDefault },
        Shadows.small,
      ]}
    >
      <LinearGradient
        colors={[`${colors.primary}15`, `${colors.primary}05`]}
        style={styles.iconContainer}
      >
        <Feather name={service.icon as any} size={22} color={colors.primary} />
      </LinearGradient>
      <View style={styles.serviceContent}>
        <ThemedText style={[styles.serviceName, { color: colors.text }]}>
          {service.name}
        </ThemedText>
        <ThemedText style={[styles.serviceDescription, { color: colors.textSecondary }]} numberOfLines={1}>
          {service.description}
        </ThemedText>
      </View>
      <View style={styles.priceContainer}>
        <ThemedText style={[styles.priceLabel, { color: colors.textSecondary }]}>from</ThemedText>
        <ThemedText style={[styles.priceValue, { color: colors.primary }]}>${service.price}</ThemedText>
      </View>
      <View style={[styles.chevronContainer, { backgroundColor: `${colors.primary}10` }]}>
        <Feather name="chevron-right" size={18} color={colors.primary} />
      </View>
    </AnimatedPressable>
  );
}

export default function AllServicesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const handleServicePress = (serviceId: string) => {
    navigation.navigate("BookService", { serviceId });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.md,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
          {services.length} services available
        </ThemedText>
        <View style={styles.grid}>
          {services.map((service) => (
            <ServiceListItem
              key={service.id}
              service={service}
              onPress={() => handleServicePress(service.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  grid: {
    gap: Spacing.md,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  serviceContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Montserrat_600SemiBold",
    marginBottom: 3,
  },
  serviceDescription: {
    fontSize: 13,
  },
  priceContainer: {
    alignItems: "flex-end",
    marginRight: Spacing.sm,
  },
  priceLabel: {
    fontSize: 11,
    marginBottom: 1,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
