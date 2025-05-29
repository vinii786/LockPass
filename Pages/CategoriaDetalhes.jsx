import React from "react";
import { View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function CategoriaDetalhes({ route }) {
  const { categoryName } = route.params;

  return (
    <View>
      <Text>Categoria selecionada: {categoryName}</Text>
    </View>
  );
}
