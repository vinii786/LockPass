import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import axios from "axios";

export default function CategoriaDetalhes({ route }) {
  const { categoryName, categoryId, userId } = route.params;
  const translateY = useRef(new Animated.Value(200)).current;

  const [modalVisible, setModalVisible] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleAdd = () => {
    setModalVisible(true);
  };

  const handleSavePassword = async () => {
    if (!serviceName.trim() || !password.trim()) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `https://lockpassapi20250324144759.azurewebsites.net/api/password/${userId}`,
        {
          serviceName: serviceName.trim(),
          password: password.trim(),
          categoryId,
        }
      );

      if (response.status === 200 || response.status === 201) {
        Alert.alert("Sucesso", "Senha adicionada com sucesso!");
        setModalVisible(false);
        setServiceName("");
        setPassword("");
      } else {
        Alert.alert("Erro", "Não foi possível adicionar a senha.");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha na conexão com a API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Categoria selecionada: {categoryName}</Text>

      <Animated.View
        style={[styles.addCategoryContainer, { transform: [{ translateY }] }]}
      >
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Feather name="plus" size={20} color="white" />
          <Text style={styles.addButtonText}>Adicionar Senha</Text>
        </TouchableOpacity>
      </Animated.View>

      <Modal transparent visible={modalVisible} animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Senha</Text>

            <TextInput
              placeholder="Nome do serviço"
              value={serviceName}
              onChangeText={setServiceName}
              style={styles.input}
              editable={!loading}
            />
            <TextInput
              placeholder="Senha"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
              editable={!loading}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#888" }]}
                onPress={() => setModalVisible(false)}
                disabled={loading}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#14C234" }]}
                onPress={handleSavePassword}
                disabled={loading}
              >
                <Text style={styles.modalButtonText}>
                  {loading ? "Salvando..." : "Salvar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 200,
  },
  text: {
    margin: 20,
    fontSize: 18,
    fontWeight: "bold",
  },
  addCategoryContainer: {
    position: "absolute",
    width: "100%",
    height: 200,
    backgroundColor: "#2d2d2d",
    paddingVertical: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    bottom: 0,
    left: 0,
    right: 0,
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#464646",
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: "center",
    gap: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
