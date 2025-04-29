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
    // Definindo a fonte padrão apenas quando as fontes estiverem carregadas
    if (fontsLoaded) {
      if (Text.defaultProps == null) Text.defaultProps = {};
      Text.defaultProps.style = { fontFamily: "Fonte-Regular" };
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    // Retornar um loading enquanto as fontes não são carregadas
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // Se as fontes não estiverem carregadas, o app funciona normalmente, mas sem a fonte customizada.
  return <AppNavigator />;
}
