import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { Colors } from "@/constants/theme";

interface ScreenOptionsConfig {
  transparent?: boolean;
}

export function useScreenOptions(
  config: ScreenOptionsConfig = {}
): NativeStackNavigationOptions | BottomTabNavigationOptions {
  const { transparent = true } = config;

  return {
    headerStyle: {
      backgroundColor: transparent ? "transparent" : Colors.dark.backgroundRoot,
    },
    headerTintColor: Colors.dark.text,
    headerTitleStyle: {
      fontFamily: "Montserrat_600SemiBold",
      fontSize: 18,
      color: Colors.dark.text,
    },
    headerShadowVisible: !transparent,
    headerTransparent: transparent,
    headerBlurEffect: transparent ? "light" : undefined,
  };
}
