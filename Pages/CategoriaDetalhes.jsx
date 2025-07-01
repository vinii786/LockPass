import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import axios from "axios";
import * as Clipboard from "expo-clipboard";

const API_BASE_URL = "https://lockpassapi20250324144759.azurewebsites.net/api";

export default function CategoriaDetalhes({ route, navigation }) {
  const { categoryName, categoryId, userId } = route.params;

  const [passwordsList, setPasswordsList] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [passwordToReveal, setPasswordToReveal] = useState(null);

  const [isRevealModalVisible, setIsRevealModalVisible] = useState(false);
  const [appPassword, setAppPassword] = useState("");
  const [loadingReveal, setLoadingReveal] = useState(false);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addServiceName, setAddServiceName] = useState("");
  const [addPasswordValue, setAddPasswordValue] = useState("");
  const [loadingAddPassword, setLoadingAddPassword] = useState(false);
  const [isAddPasswordVisible, setIsAddPasswordVisible] = useState(false); 

  const [isEditAuthModalVisible, setIsEditAuthModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editServiceName, setEditServiceName] = useState("");
  const [editPasswordValue, setEditPasswordValue] = useState("");
  const [editAppPassword, setEditAppPassword] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);

  const fetchPasswordsList = async () => {
    setLoadingData(true);
    const listUrl = `${API_BASE_URL}/password/user/${userId}/category/${categoryId}`;

    try {
      const response = await axios.get(listUrl);
      if (response.status === 200) {
        setPasswordsList(response.data);
      }
    } catch (error) {
      Alert.alert(
        "Erro de Conexão",
        "Não foi possível buscar a lista de senhas."
      );
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchPasswordsList();
  }, []);

  const generateStrongPassword = () => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    const allChars = upper + lower + numbers + symbols;
    const length = 16;
    let password = "";

    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    const shuffledPassword = password
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");

    setAddPasswordValue(shuffledPassword);
    setIsAddPasswordVisible(true);
  };

  const handleAttemptReveal = (passwordId) => {
    if (revealedPasswords[passwordId]) {
      setVisiblePasswords((prev) => ({
        ...prev,
        [passwordId]: !prev[passwordId],
      }));
    } else {
      setPasswordToReveal(passwordId);
      setIsRevealModalVisible(true);
    }
  };

  const handleConfirmReveal = async () => {
    if (!appPassword.trim()) {
      Alert.alert("Atenção", "Por favor, insira a senha do aplicativo.");
      return;
    }
    setLoadingReveal(true);
    const revealUrl = `${API_BASE_URL}/password/${userId}/${passwordToReveal}/reveal`;

    try {
      const response = await axios.get(revealUrl, {
        params: { AppPassword: appPassword },
      });

      if (response.status === 200) {
        setRevealedPasswords((prev) => ({
          ...prev,
          [passwordToReveal]: response.data.decryptedPassword,
        }));
        setVisiblePasswords((prev) => ({ ...prev, [passwordToReveal]: true }));
        setIsRevealModalVisible(false);
        setAppPassword("");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        Alert.alert("Acesso Negado", "A senha do aplicativo está incorreta.");
      } else {
        Alert.alert("Erro", "Não foi possível revelar a senha.");
      }
    } finally {
      setLoadingReveal(false);
    }
  };

  const handleSaveNewPassword = async () => {
    if (!addServiceName.trim() || !addPasswordValue.trim()) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }
    setLoadingAddPassword(true);
    try {
      await axios.post(`${API_BASE_URL}/password/${userId}`, {
        serviceName: addServiceName.trim(),
        password: addPasswordValue.trim(),
        categoryId,
      });

      Alert.alert("Sucesso", "Senha adicionada!");
      setIsAddModalVisible(false);
      setAddServiceName("");
      setAddPasswordValue("");
      setIsAddPasswordVisible(false);
      fetchPasswordsList();
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar a nova senha.");
    } finally {
      setLoadingAddPassword(false);
    }
  };

  const handleInitiateEdit = (item) => {
    setEditingItem(item);
    setIsEditAuthModalVisible(true);
  };

  const handleConfirmEditAuth = async () => {
    if (!editAppPassword.trim()) {
      Alert.alert("Atenção", "Por favor, insira sua senha principal.");
      return;
    }
    setLoadingEdit(true);
    const validateUrl = `${API_BASE_URL}/password/${userId}/${editingItem.passwordId}/reveal`;
    try {
      await axios.get(validateUrl, {
        params: { AppPassword: editAppPassword },
      });
      setIsEditAuthModalVisible(false);
      setEditServiceName(editingItem.serviceName);
      setEditPasswordValue("");
      setIsEditModalVisible(true);
    } catch (error) {
      if (error.response?.status === 401) {
        Alert.alert("Acesso Negado", "A senha do aplicativo está incorreta.");
      } else {
        Alert.alert("Erro", "Não foi possível autorizar a edição.");
      }
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!editServiceName.trim() || !editPasswordValue.trim()) {
      Alert.alert("Atenção", "Nome do serviço e nova senha são obrigatórios.");
      return;
    }
    setLoadingEdit(true);

    const editUrl = `${API_BASE_URL}/password/${userId}/${editingItem.passwordId}`;
    const payload = {
      serviceName: editServiceName,
      password: editPasswordValue,
      categoryId: categoryId,
      appPassword: editAppPassword,
    };

    try {
      await axios.put(editUrl, payload);
      Alert.alert("Sucesso", "Senha atualizada com sucesso!");
      setIsEditModalVisible(false);
      setEditingItem(null);
      setEditAppPassword("");

      setRevealedPasswords({});
      setVisiblePasswords({});
      fetchPasswordsList();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar a senha.");
    } finally {
      setLoadingEdit(false);
    }
  };

  // --- NOVA FUNÇÃO PARA APAGAR SENHA ---
  const handleDelete = (passwordId, serviceName) => {
    Alert.alert(
        "Confirmar Exclusão",
        `Tem certeza que deseja apagar a senha de "${serviceName}"? Esta ação não pode ser desfeita.`,
        [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Apagar",
                style: "destructive",
                onPress: async () => {
                    try {
                        const deleteUrl = `${API_BASE_URL}/password/${userId}/${passwordId}`;
                        const response = await axios.delete(deleteUrl);

                        if (response.status === 200 || response.status === 204) {
                            Alert.alert("Sucesso", "Senha apagada com sucesso.");
                            fetchPasswordsList(); // Atualiza a lista
                        } else {
                            Alert.alert("Erro", "Ocorreu um problema ao apagar a senha.");
                        }
                    } catch (error) {
                        Alert.alert("Erro de Conexão", "Não foi possível apagar a senha.");
                    }
                },
            },
        ]
    );
  };

  const copyToClipboard = (passwordId, serviceName) => {
    const revealedPassword = revealedPasswords[passwordId];
    if (revealedPassword) {
      Clipboard.setString(revealedPassword);
      Alert.alert("Copiado!", `A senha para "${serviceName}" foi copiada.`);
    } else {
      Alert.alert("Atenção", "Revele a senha primeiro para poder copiá-la.");
    }
  };

  const renderPasswordItem = ({ item }) => {
    const isVisible = visiblePasswords[item.passwordId];
    const passwordToShow = isVisible
      ? revealedPasswords[item.passwordId]
      : "••••••••••";

    return (
      <View style={styles.passwordItem}>
        <View style={styles.passwordInfo}>
          <Text style={styles.serviceName}>{item.serviceName}</Text>
          <Text style={styles.passwordText}>{passwordToShow}</Text>
        </View>
        <View style={styles.passwordActions}>
          <TouchableOpacity onPress={() => handleInitiateEdit(item)}>
            <Feather name="edit" size={22} color="#007BFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginHorizontal: 20 }}
            onPress={() => handleAttemptReveal(item.passwordId)}
          >
            <Feather
              name={isVisible ? "eye-off" : "eye"}
              size={22}
              color="#555"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => copyToClipboard(item.passwordId, item.serviceName)}
          >
            <Feather name="copy" size={22} color="#14C234" />
          </TouchableOpacity>
          {/* --- NOVO ÍCONE DE LIXEIRA --- */}
          <TouchableOpacity style={{ marginLeft: 20 }} onPress={() => handleDelete(item.passwordId, item.serviceName)}>
            <Feather name="trash-2" size={22} color="#D9534F" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loadingData ? (
        <ActivityIndicator size="large" color="#14C234" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={passwordsList}
          renderItem={renderPasswordItem}
          keyExtractor={(item) =>
            item.passwordId
              ? item.passwordId.toString()
              : Math.random().toString()
          }
          ListHeaderComponent={
            <Text style={styles.headerTitle}>{categoryName}</Text>
          }
          contentContainerStyle={{ paddingBottom: 150 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Clique no botão '+' para adicionar sua primeira senha.
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsAddModalVisible(true)}
      >
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>

      <Modal transparent visible={isRevealModalVisible} animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Autenticação Necessária</Text>
            <Text style={styles.modalSubtitle}>
              Digite sua senha principal para revelar.
            </Text>
            <TextInput
              placeholder="Senha do Aplicativo"
              value={appPassword}
              onChangeText={setAppPassword}
              secureTextEntry
              style={styles.input}
              editable={!loadingReveal}
              onSubmitEditing={handleConfirmReveal}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#888" }]}
                onPress={() => setIsRevealModalVisible(false)}
                disabled={loadingReveal}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#14C234" }]}
                onPress={handleConfirmReveal}
                disabled={loadingReveal}
              >
                {loadingReveal ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Revelar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal transparent visible={isAddModalVisible} animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Nova Senha</Text>
            <TextInput
              placeholder="Login"
              value={addServiceName}
              onChangeText={setAddServiceName}
              style={styles.input}
            />
            <View style={styles.passwordInputContainer}>
              <TextInput
                placeholder="Senha"
                value={addPasswordValue}
                onChangeText={setAddPasswordValue}
                style={styles.passwordInput}
                secureTextEntry={!isAddPasswordVisible}
              />
              <TouchableOpacity
                style={styles.iconInInput}
                onPress={generateStrongPassword}
              >
                <Feather name="zap" size={20} color="#007BFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconInInput}
                onPress={() => setIsAddPasswordVisible(!isAddPasswordVisible)}
              >
                <Feather
                  name={isAddPasswordVisible ? "eye-off" : "eye"}
                  size={20}
                  color="#555"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#888" }]}
                onPress={() => setIsAddModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#14C234" }]}
                onPress={handleSaveNewPassword}
                disabled={loadingAddPassword}
              >
                {loadingAddPassword ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal transparent visible={isEditAuthModalVisible} animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Autorizar Edição</Text>
            <Text style={styles.modalSubtitle}>
              Digite sua senha principal para continuar.
            </Text>
            <TextInput
              placeholder="Sua Senha Principal"
              value={editAppPassword}
              onChangeText={setEditAppPassword}
              style={styles.input}
              secureTextEntry
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#888" }]}
                onPress={() => setIsEditAuthModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#007BFF" }]}
                onPress={handleConfirmEditAuth}
                disabled={loadingEdit}
              >
                {loadingEdit ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Autorizar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal transparent visible={isEditModalVisible} animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Senha</Text>
            <TextInput
              placeholder="Nome do serviço"
              value={editServiceName}
              onChangeText={setEditServiceName}
              style={styles.input}
            />
            <TextInput
              placeholder="Nova Senha"
              value={editPasswordValue}
              onChangeText={setEditPasswordValue}
              style={styles.input}
              secureTextEntry
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#888" }]}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#14C234" }]}
                onPress={handleSaveChanges}
                disabled={loadingEdit}
              >
                {loadingEdit ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Salvar Alterações</Text>
                )}
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
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  passwordItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  passwordInfo: {
    flex: 1,
    marginRight: 10,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  passwordText: {
    fontSize: 16,
    color: "#555",
    marginTop: 4,
  },
  passwordActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#14C234",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 15,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  iconInInput: {
    padding: 10,
  },
  authInput: {
    borderColor: "#14C234",
    marginTop: 5,
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
    justifyContent: "center",
    minHeight: 48,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});