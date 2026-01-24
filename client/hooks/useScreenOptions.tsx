import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useTheme } from "../context/ThemeContext";

interface ScreenOptionsConfig {
  transparent?: boolean;
}

export function useScreenOptions(
  config: ScreenOptionsConfig = {}
): NativeStackNavigationOptions {
  const { transparent = true } = config;
  const { colors } = useTheme();

  return {
    headerStyle: {
      backgroundColor: transparent ? "transparent" : colors.backgroundRoot,
    },
    headerTintColor: colors.text,
    headerTitleStyle: {
      fontFamily: "Montserrat_600SemiBold",
      fontSize: 18,
      color: colors.text,
    },
    headerShadowVisible: !transparent,
    headerTransparent: transparent,
    headerBlurEffect: transparent ? "light" : undefined,
  };
}
