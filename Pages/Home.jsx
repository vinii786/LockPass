import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Home({ route }) {
  const { user } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{user.userName}!</Text>
      <Text>ID do Usuário: {user.userId}</Text>
      <Text>Email: {user.userEmail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
