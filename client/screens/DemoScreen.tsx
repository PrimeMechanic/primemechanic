import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTheme } from "@/context/ThemeContext";
import type { AuthStackParamList } from "@/navigation/RootStackNavigator";

type Props = NativeStackScreenProps<AuthStackParamList, "Demo"> & {
  onEnterDemo: () => void;
};

export default function DemoScreen({ onEnterDemo }: Props) {
  const { colors } = useTheme();

  useEffect(() => {
    onEnterDemo();
  }, [onEnterDemo]);

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundRoot }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
