import React from "react";
import { StyleSheet, View, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";

import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = "Search..." }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Feather name="search" size={20} color={Colors.dark.textSecondary} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.dark.textSecondary}
        selectionColor={Colors.dark.accent}
      />
      {value.length > 0 ? (
        <Feather
          name="x"
          size={18}
          color={Colors.dark.textSecondary}
          onPress={() => onChangeText("")}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark.text,
    paddingVertical: 4,
  },
});
