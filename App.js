import AppNavigator from "./navigation/AppNavigator";
import { useFonts } from "expo-font";
import { ActivityIndicator, View, Text } from "react-native";
import { useEffect } from "react";

export default function App() {
  const [fontsLoaded] = useFonts({
    "Fonte-Regular": require("./assets/fonts/Inconsolata-Regular.ttf"),
    "Fonte-Bold": require("./assets/fonts/Inconsolata-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      if (Text.defaultProps == null) Text.defaultProps = {};
      Text.defaultProps.style = { fontFamily: "Fonte-Regular" };
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return <AppNavigator />;
}
