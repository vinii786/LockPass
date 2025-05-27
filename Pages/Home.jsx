import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";

export default function Home() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Senhas salvas</Text>
          <Feather name="edit" size={24} />
        </View>

        <View style={styles.categoryContainer}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((_, index) => (
            <View key={index} style={styles.card}>
              <Feather name="edit" size={24} />
              <View style={styles.footer}>
                <Text style={styles.texto}>
                  {index === 0
                    ? "Redes Sociais"
                    : index === 1
                    ? "Jogos"
                    : index === 2
                    ? "E-mails"
                    : "Outros"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },
  card: {
    width: "48%",
    height: 120,
    borderRadius: 20,
    backgroundColor: "#e5e5e0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    overflow: "hidden",
    position: "relative",
  },
  icone: {},
  footer: {
    width: "100%",
    backgroundColor: "#d1d1cd",
    paddingVertical: 6,
    alignItems: "center",
  },
  texto: {
    fontSize: 12,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#d1d1cd",
    paddingVertical: 6,
    alignItems: "center",
  },
});
