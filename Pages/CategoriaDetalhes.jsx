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
  FlatList,
  ActivityIndicator,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import axios from "axios";
import * as Clipboard from "expo-clipboard"; // Importar o expo-clipboard

export default function CategoriaDetalhes({ route }) {
  const { categoryName, categoryId, userId } = route.params;
  const translateY = useRef(new Animated.Value(200)).current;

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addServiceName, setAddServiceName] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [loadingAddPassword, setLoadingAddPassword] = useState(false);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingPasswordData, setEditingPasswordData] = useState(null);
  const [editServiceName, setEditServiceName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [loadingUpdatePassword, setLoadingUpdatePassword] = useState(false);
  const [loadingDeletePassword, setLoadingDeletePassword] = useState(false);

  const [passwordsList, setPasswordsList] = useState([]);
  const [loadingPasswords, setLoadingPasswords] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const fetchPasswords = async () => {
    if (!userId || !categoryId) return;
    setLoadingPasswords(true);
    try {
      const response = await axios.get(
        `https://lockpassapi20250324144759.azurewebsites.net/api/password/user/${userId}/category/${categoryId}`
      );
      if (response.status === 200 && response.data) {
        setPasswordsList(response.data);
      } else {
        Alert.alert("Erro", "Falha ao carregar senhas da categoria.");
        setPasswordsList([]);
      }
    } catch (error) {
      console.error(
        "Erro ao buscar senhas:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Erro de API",
        "Não foi possível buscar as senhas. Verifique sua conexão ou tente mais tarde."
      );
      setPasswordsList([]);
    } finally {
      setLoadingPasswords(false);
    }
  };

  useEffect(() => {
    fetchPasswords();
  }, [userId, categoryId]);

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleOpenAddModal = () => {
    setIsAddModalVisible(true);
  };

  const handleSaveNewPassword = async () => {
    if (!addServiceName.trim() || !addPassword.trim()) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }
    setLoadingAddPassword(true);
    try {
      const response = await axios.post(
        `https://lockpassapi20250324144759.azurewebsites.net/api/password/${userId}`,
        {
          serviceName: addServiceName.trim(),
          password: addPassword.trim(),
          categoryId,
        }
      );

      if (response.status === 200 || response.status === 201) {
        Alert.alert("Sucesso", "Senha adicionada com sucesso!");
        setIsAddModalVisible(false);
        setAddServiceName("");
        setAddPassword("");
        fetchPasswords();
      } else {
        Alert.alert("Erro", "Não foi possível adicionar a senha.");
      }
    } catch (error) {
      console.error(
        "Erro ao salvar senha:",
        error.response?.data || error.message
      );
      Alert.alert("Erro", "Falha na conexão com a API ao salvar senha.");
    } finally {
      setLoadingAddPassword(false);
    }
  };

  const handleOpenEditModal = (passwordItem) => {
    setEditingPasswordData(passwordItem);
    setEditServiceName(passwordItem.serviceName);
    setEditPassword("");
    setIsEditModalVisible(true);
  };

  const handleUpdatePassword = async () => {
    if (!editServiceName.trim() || !editPassword.trim()) {
      Alert.alert("Erro", "Nome do serviço e a nova senha são obrigatórios.");
      return;
    }
    if (!editingPasswordData) return;

    setLoadingUpdatePassword(true);
    try {
      await axios.put(
        `https://lockpassapi20250324144759.azurewebsites.net/api/password/${userId}/${editingPasswordData.passwordId}`,
        {
          serviceName: editServiceName.trim(),
          password: editPassword.trim(),
          categoryId: categoryId,
        }
      );
      Alert.alert("Sucesso", "Senha atualizada com sucesso!");
      setIsEditModalVisible(false);
      setEditingPasswordData(null);
      fetchPasswords();
    } catch (error) {
      console.error(
        "Erro ao atualizar senha:",
        error.response?.data || error.message
      );
      Alert.alert("Erro", "Não foi possível atualizar a senha.");
    } finally {
      setLoadingUpdatePassword(false);
    }
  };

  const handleDeletePassword = async () => {
    if (!editingPasswordData || !editingPasswordData.passwordId) return;

    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja apagar a senha para "${editingPasswordData.serviceName}"? Esta ação não pode ser desfeita.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => setLoadingDeletePassword(false),
        },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            setLoadingDeletePassword(true);
            try {
              await axios.delete(
                `https://lockpassapi20250324144759.azurewebsites.net/api/password/${userId}/${editingPasswordData.passwordId}`
              );
              Alert.alert("Sucesso", "Senha apagada com sucesso!");
              setIsEditModalVisible(false);
              setEditingPasswordData(null);
              fetchPasswords();
            } catch (error) {
              console.error(
                "Erro ao apagar senha:",
                error.response?.data || error.message
              );
              Alert.alert("Erro", "Não foi possível apagar a senha.");
            } finally {
              setLoadingDeletePassword(false);
            }
          },
        },
      ],
      { cancelable: true, onDismiss: () => setLoadingDeletePassword(false) }
    );
  };

  const togglePasswordVisibility = (passwordId) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [passwordId]: !prev[passwordId],
    }));
  };

  // Nova função para copiar a senha
  const handleCopyPassword = async (passwordToCopy, serviceNameStr) => {
    try {
      await Clipboard.setStringAsync(passwordToCopy);
      Alert.alert(
        "Senha Copiada",
        `A senha para "${serviceNameStr}" foi copiada para a área de transferência.`
      );
    } catch (e) {
      console.error("Erro ao copiar senha:", e);
      Alert.alert("Erro", "Não foi possível copiar a senha.");
    }
  };

  const renderPasswordItem = ({ item }) => {
    const isPasswordVisible = !!visiblePasswords[item.passwordId];
    return (
      <View style={styles.passwordItemContainer}>
        <TouchableOpacity
          style={styles.passwordInfoTouchable}
          onPress={() =>
            handleCopyPassword(item.encryptedPassword, item.serviceName)
          }
        >
          <Text style={styles.serviceNameText}>
            Serviço: {item.serviceName}
          </Text>
          <Text style={styles.passwordText}>
            Senha: {isPasswordVisible ? item.encryptedPassword : "••••••••••"}
          </Text>
        </TouchableOpacity>
        <View style={styles.passwordActions}>
          <TouchableOpacity
            onPress={() => togglePasswordVisibility(item.passwordId)}
            style={styles.actionIcon}
          >
            <Feather
              name={isPasswordVisible ? "eye-off" : "eye"}
              size={22}
              color="#2F2F31"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleOpenEditModal(item)}
            style={styles.actionIcon}
          >
            <Feather name="edit-2" size={20} color="#2F2F31" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.categoryTitleText}>Senhas em: {categoryName}</Text>

      {loadingPasswords ? (
        <ActivityIndicator size="large" color="#14C234" style={styles.loader} />
      ) : passwordsList.length > 0 ? (
        <FlatList
          data={passwordsList}
          renderItem={renderPasswordItem}
          keyExtractor={(item, index) =>
            item.passwordId ? item.passwordId.toString() : index.toString()
          }
          style={styles.list}
          contentContainerStyle={{ paddingBottom: 130 }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.noPasswordsText}>
            Nenhuma senha cadastrada nesta categoria.
          </Text>
        </View>
      )}

      <Animated.View
        style={[styles.addCategoryContainer, { transform: [{ translateY }] }]}
      >
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleOpenAddModal}
          disabled={loadingAddPassword}
        >
          <Feather name="plus" size={20} color="white" />
          <Text style={styles.addButtonText}>Adicionar Senha</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Modal para Adicionar Nova Senha */}
      <Modal transparent visible={isAddModalVisible} animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Nova Senha</Text>
            <TextInput
              placeholder="Nome do serviço"
              value={addServiceName}
              onChangeText={setAddServiceName}
              style={styles.input}
              editable={!loadingAddPassword}
            />
            <TextInput
              placeholder="Senha"
              value={addPassword}
              onChangeText={setAddPassword}
              style={styles.input}
              secureTextEntry
              editable={!loadingAddPassword}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#888" }]}
                onPress={() => setIsAddModalVisible(false)}
                disabled={loadingAddPassword}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#14C234" }]}
                onPress={handleSaveNewPassword}
                disabled={loadingAddPassword}
              >
                <Text style={styles.modalButtonText}>
                  {loadingAddPassword ? "Salvando..." : "Salvar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal para Editar Senha Existente */}
      {isEditModalVisible && editingPasswordData && (
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
                editable={!loadingUpdatePassword && !loadingDeletePassword}
              />
              <TextInput
                placeholder="Nova Senha"
                value={editPassword}
                onChangeText={setEditPassword}
                style={styles.input}
                secureTextEntry
                editable={!loadingUpdatePassword && !loadingDeletePassword}
              />
              <Text style={styles.categoryInfoText}>
                Categoria: {categoryName}
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#888" }]}
                  onPress={() => {
                    setIsEditModalVisible(false);
                    setEditingPasswordData(null);
                  }}
                  disabled={loadingUpdatePassword || loadingDeletePassword}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#14C234" }]}
                  onPress={handleUpdatePassword}
                  disabled={loadingUpdatePassword || loadingDeletePassword}
                >
                  {loadingUpdatePassword ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalButtonText}>Salvar</Text>
                  )}
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeletePassword}
                disabled={loadingDeletePassword || loadingUpdatePassword}
              >
                {loadingDeletePassword ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Apagar Senha</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  categoryTitleText: {
    marginVertical: 20,
    marginHorizontal: 20,
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  loader: {
    marginTop: 50,
  },
  list: {
    flex: 1,
    paddingHorizontal: 15,
  },
  // Renomeado de passwordItem para passwordItemContainer para clareza
  passwordItemContainer: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  // Novo estilo para a área clicável das informações da senha
  passwordInfoTouchable: {
    flex: 1, // Para ocupar o espaço disponível à esquerda dos ícones
    marginRight: 10, // Espaço entre as informações e os ícones de ação
  },
  serviceNameText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2F2F31",
    marginBottom: 5,
  },
  passwordText: {
    fontSize: 15,
    color: "#555",
    fontFamily: "Fonte-Regular",
  },
  passwordActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIcon: {
    padding: 5,
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  noPasswordsText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
  },
  addCategoryContainer: {
    position: "absolute",
    width: "100%",
    height: 120,
    backgroundColor: "#2d2d2d",
    paddingVertical: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#14C234",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: "center",
    gap: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
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
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  categoryInfoText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    minHeight: 48,
  },
  deleteButton: {
    backgroundColor: "#d9534f",
    marginTop: 15,
    width: "100%",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    elevation: 2,
    marginHorizontal: 0, // Garante que não haja margens laterais extras
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
