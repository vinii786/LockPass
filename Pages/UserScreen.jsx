import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function UserScreen({ route }) {
  const { user } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{user.userName}</Text>
      <Text style={styles.title}>{user.userEmail}</Text>
      <Text style={styles.title}>id {user.userId}</Text>
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
