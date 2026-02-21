import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/context/ThemeContext";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  items: FAQItem[];
}

const FAQ_DATA: FAQSection[] = [
  {
    title: "Booking & Services",
    icon: "calendar",
    items: [
      {
        question: "How do I book a service?",
        answer:
          "Tap the green button on the Browse screen or select a specific service from the categories. Choose your preferred mechanic or shop, pick a date and time, enter your location, and confirm your booking.",
      },
      {
        question: "Can I schedule a service in advance?",
        answer:
          "Yes, you can schedule services up to 30 days in advance. Simply select your preferred date and time during the booking process.",
      },
      {
        question: "What services are available?",
        answer:
          "We offer oil changes, brake repair, tire services, engine diagnostics, battery replacement, AC repair, and dent, scratch & paint repair. More services are being added regularly.",
      },
      {
        question: "Can I book a service at a shop instead of a mobile mechanic?",
        answer:
          "Absolutely. On the Browse screen, scroll down to the Nearby Shops section to find physical auto repair locations near you. You can view their hours, services, and book directly.",
      },
    ],
  },
  {
    title: "Payments & Pricing",
    icon: "credit-card",
    items: [
      {
        question: "How do I pay for a service?",
        answer:
          "Payment is handled securely through the app using your saved payment method. You will be charged after the service is completed and confirmed.",
      },
      {
        question: "Can I add multiple payment methods?",
        answer:
          "Yes, go to Profile > Payment Methods to add or manage your credit and debit cards. You can set a default payment method for faster checkout.",
      },
      {
        question: "How is pricing determined?",
        answer:
          "Each mechanic and shop sets their own pricing for services. You can see the estimated cost before confirming your booking. The final price may vary based on parts needed or additional work required.",
      },
      {
        question: "Is there a cancellation fee?",
        answer:
          "You can cancel a booking free of charge up to 2 hours before the scheduled time. Cancellations within 2 hours may be subject to a small fee.",
      },
    ],
  },
  {
    title: "Mechanics & Shops",
    icon: "tool",
    items: [
      {
        question: "How are mechanics verified?",
        answer:
          "All mechanics on PrimeMechanic undergo a background check and must provide proof of certifications and insurance. Verified mechanics display a green checkmark on their profile.",
      },
      {
        question: "Can I choose my own mechanic?",
        answer:
          "Yes, you can browse all available mechanics, view their profiles, ratings, reviews, and specialties, then book directly with the one you prefer.",
      },
      {
        question: "What if I'm not satisfied with the service?",
        answer:
          "Your satisfaction is our priority. If you're not happy with the service, please leave a review and contact us through the app. We will work with you and the mechanic to resolve any issues.",
      },
    ],
  },
  {
    title: "Account & Profile",
    icon: "user",
    items: [
      {
        question: "How do I update my profile information?",
        answer:
          "Go to your Profile tab and tap on your name or the edit icon to update your personal details, phone number, and profile photo.",
      },
      {
        question: "How do I add or manage my vehicles?",
        answer:
          "From your Profile screen, scroll to the My Vehicles section. Tap Add Vehicle to enter your car details including make, model, year, and license plate.",
      },
      {
        question: "How do I save my addresses?",
        answer:
          "Go to Profile > Saved Addresses to add your home or other frequently used locations. This makes booking services faster since you won't need to enter your address each time.",
      },
    ],
  },
  {
    title: "Safety & Trust",
    icon: "shield",
    items: [
      {
        question: "Is my payment information secure?",
        answer:
          "Yes, all payment processing is handled through Stripe, an industry-leading payment platform. We never store your full card details on our servers.",
      },
      {
        question: "What if something goes wrong during a service?",
        answer:
          "All mechanics on our platform carry liability insurance. If any issue arises during a service, contact us immediately and we will help resolve it.",
      },
      {
        question: "How can I contact support?",
        answer:
          "You can reach our support team by emailing support@primemechanic.com. We aim to respond to all inquiries within 24 hours.",
      },
    ],
  },
];

function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
  colors,
  isLast,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  colors: typeof Colors.light;
  isLast: boolean;
}) {
  return (
    <View
      style={[
        accordionStyles.item,
        isLast ? null : { borderBottomWidth: 1, borderBottomColor: colors.border },
      ]}
    >
      <Pressable
        onPress={onToggle}
        style={accordionStyles.questionRow}
        testID={`faq-question-${item.question.slice(0, 20).replace(/\s/g, "-")}`}
      >
        <ThemedText style={[accordionStyles.question, { color: colors.text }]}>
          {item.question}
        </ThemedText>
        <Feather
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.textSecondary}
        />
      </Pressable>
      {isOpen ? (
        <View style={accordionStyles.answerContainer}>
          <ThemedText style={[accordionStyles.answer, { color: colors.textSecondary }]}>
            {item.answer}
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
}

function FAQSectionCard({
  section,
  colors,
}: {
  section: FAQSection;
  colors: typeof Colors.light;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <View style={sectionStyles.container}>
      <View style={sectionStyles.header}>
        <View style={[sectionStyles.iconContainer, { backgroundColor: `${colors.primary}12` }]}>
          <Feather name={section.icon} size={18} color={colors.primary} />
        </View>
        <ThemedText style={[sectionStyles.title, { color: colors.text }]}>
          {section.title}
        </ThemedText>
      </View>
      <View
        style={[
          sectionStyles.card,
          { backgroundColor: colors.backgroundDefault, borderColor: colors.border },
          Shadows.small,
        ]}
      >
        {section.items.map((item, index) => (
          <FAQAccordionItem
            key={index}
            item={item}
            isOpen={openIndex === index}
            onToggle={() => handleToggle(index)}
            colors={colors}
            isLast={index === section.items.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

export default function HelpSupportScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

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
        <View style={styles.intro}>
          <View style={[styles.introIcon, { backgroundColor: `${colors.primary}15` }]}>
            <Feather name="help-circle" size={28} color={colors.primary} />
          </View>
          <ThemedText style={[styles.introTitle, { color: colors.text }]}>
            How can we help?
          </ThemedText>
          <ThemedText style={[styles.introSubtitle, { color: colors.textSecondary }]}>
            Find answers to frequently asked questions below
          </ThemedText>
        </View>

        {FAQ_DATA.map((section, index) => (
          <FAQSectionCard key={index} section={section} colors={colors} />
        ))}

        <View style={[styles.contactCard, { backgroundColor: colors.backgroundDefault, borderColor: colors.border }, Shadows.small]}>
          <Feather name="mail" size={20} color={colors.primary} />
          <View style={styles.contactContent}>
            <ThemedText style={[styles.contactTitle, { color: colors.text }]}>
              Still need help?
            </ThemedText>
            <ThemedText style={[styles.contactText, { color: colors.textSecondary }]}>
              Email us at support@primemechanic.com
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  intro: {
    alignItems: "center",
    marginBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  introIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    marginBottom: 6,
  },
  introSubtitle: {
    fontSize: 15,
    textAlign: "center",
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  contactText: {
    fontSize: 13,
  },
});

const sectionStyles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    fontFamily: "Montserrat_600SemiBold",
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
});

const accordionStyles = StyleSheet.create({
  item: {
    overflow: "hidden",
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  question: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  answerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingTop: 0,
  },
  answer: {
    fontSize: 14,
    lineHeight: 21,
  },
});
