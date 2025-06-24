import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  Image,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import axios from "axios";

export default function Home({ route, navigation }) {
  const user = route.params?.user;
  const userId = user?.userId;

  const [isAddCategoryModalVisible, setIsAddCategoryModalVisible] =
    useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedIconUrl, setSelectedIconUrl] = useState(null);
  const [loadingAddCategory, setLoadingAddCategory] = useState(false);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [iconOptions, setIconOptions] = useState([]);
  const [loadingIcons, setLoadingIcons] = useState(false);

  const [isCategoryOptionsMenuVisible, setIsCategoryOptionsMenuVisible] =
    useState(false);
  const [selectedCategoryForMenu, setSelectedCategoryForMenu] = useState(null);
  const [isEditCategoryNameModalVisible, setIsEditCategoryNameModalVisible] =
    useState(false);
  const [editingCategoryNewName, setEditingCategoryNewName] = useState("");
  const [loadingUpdateCategory, setLoadingUpdateCategory] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const ADD_BUTTON_CONTAINER_HEIGHT = 120;
  const addButtonTranslateY = scrollY.interpolate({
    inputRange: [0, ADD_BUTTON_CONTAINER_HEIGHT / 2],
    outputRange: [0, ADD_BUTTON_CONTAINER_HEIGHT + 30],
    extrapolate: "clamp",
  });

  const fetchIcons = async () => {
    setLoadingIcons(true);
    try {
      const response = await axios.get(
        "https://lockpassapi20250324144759.azurewebsites.net/api/category/icons"
      );
      if (response.status === 200 && Array.isArray(response.data)) {
        setIconOptions(response.data);
        if (response.data.length > 0) {
          setSelectedIconUrl(response.data[0]);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar ícones:", error);
      Alert.alert(
        "Erro de API",
        "Não foi possível carregar os ícones para seleção."
      );
    } finally {
      setLoadingIcons(false);
    }
  };

  const fetchCategories = async () => {
    if (!userId) {
      return;
    }
    setLoadingCategories(true);
    try {
      const response = await axios.get(
        `https://lockpassapi20250324144759.azurewebsites.net/api/category/user/${userId}`
      );
      if (response.status === 200) {
        setCategories(response.data);
      } else {
        Alert.alert("Erro", "Falha ao carregar categorias");
        setCategories([]);
      }
    } catch (error) {
      Alert.alert(
        "Erro",
        "Não foi possível conectar à API para buscar categorias."
      );
      console.error("Erro fetchCategories:", error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCategories();
    }
    fetchIcons();
  }, [userId]);

  const handleOpenAddCategoryModal = () => {
    if (iconOptions.length > 0) {
      setSelectedIconUrl(iconOptions[0]);
    }
    setIsAddCategoryModalVisible(true);
  };

  const handleSubmitNewCategory = async () => {
    if (!newCategoryName.trim() || !selectedIconUrl) {
      Alert.alert(
        "Erro",
        "Por favor, insira o nome da categoria e selecione um ícone."
      );
      return;
    }
    setLoadingAddCategory(true);
    try {
      const response = await axios.post(
        `https://lockpassapi20250324144759.azurewebsites.net/api/category/${userId}`,
        {
          categoryName: newCategoryName.trim(),
          iconUrl: selectedIconUrl,
        }
      );
      if (response.status === 200 || response.status === 201) {
        Alert.alert("Sucesso", "Categoria adicionada com sucesso!");
        setNewCategoryName("");
        setIsAddCategoryModalVisible(false);
        fetchCategories();
      } else {
        Alert.alert("Erro", "Falha ao adicionar a categoria.");
      }
    } catch (error) {
      Alert.alert(
        "Erro",
        "Não foi possível conectar à API ao adicionar categoria."
      );
      console.error("Erro handleSubmitNewCategory:", error);
    } finally {
      setLoadingAddCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryIdToDelete) => {
    if (!categoryIdToDelete) return;
    setIsCategoryOptionsMenuVisible(false);
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja excluir esta categoria e todas as senhas associadas a ela?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await axios.delete(
                `https://lockpassapi20250324144759.azurewebsites.net/api/category/${categoryIdToDelete}`
              );
              if (response.status === 200 || response.status === 204) {
                Alert.alert("Sucesso", "Categoria excluída com sucesso.");
                fetchCategories();
                setSelectedCategoryForMenu(null);
              } else {
                Alert.alert("Erro", "Erro ao excluir categoria.");
              }
            } catch (error) {
              Alert.alert("Erro", "Erro de conexão ao excluir categoria.");
              console.error("Erro handleDeleteCategory:", error);
            }
          },
        },
      ]
    );
  };

  const handleLongPressCategory = (category) => {
    setSelectedCategoryForMenu(category);
    setIsCategoryOptionsMenuVisible(true);
  };

  const handleOpenEditCategoryNameModal = () => {
    if (!selectedCategoryForMenu) return;
    setEditingCategoryNewName(selectedCategoryForMenu.categoryName);
    setIsCategoryOptionsMenuVisible(false);
    setIsEditCategoryNameModalVisible(true);
  };

  const handleUpdateCategoryName = async () => {
    if (!selectedCategoryForMenu || !editingCategoryNewName.trim()) {
      Alert.alert("Erro", "O novo nome da categoria não pode estar vazio.");
      return;
    }
    setLoadingUpdateCategory(true);
    try {
      const response = await axios.put(
        `https://lockpassapi20250324144759.azurewebsites.net/api/category/${selectedCategoryForMenu.categoryId}`,
        {
          categoryName: editingCategoryNewName.trim(),
          userId: userId,
          iconUrl: selectedCategoryForMenu.iconUrl,
        }
      );
      if (response.status === 200 || response.status === 204) {
        Alert.alert("Sucesso", "Nome da categoria atualizado!");
        setIsEditCategoryNameModalVisible(false);
        setSelectedCategoryForMenu(null);
        fetchCategories();
      } else {
        Alert.alert(
          "Erro",
          "Não foi possível atualizar o nome (resposta da API)."
        );
      }
    } catch (error) {
      console.error(
        "Erro ao atualizar nome da categoria:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Erro",
        "Não foi possível atualizar o nome da categoria (conexão/erro)."
      );
    } finally {
      setLoadingUpdateCategory(false);
    }
  };

  const renderCategoryCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("CategoriaDetalhes", {
          categoryName: item.categoryName,
          categoryId: item.categoryId,
          userId: userId,
        })
      }
      onLongPress={() => handleLongPressCategory(item)}
    >
      {item.iconUrl &&
      (item.iconUrl.startsWith("http") || item.iconUrl.startsWith("https")) ? (
        <Image source={{ uri: item.iconUrl }} style={styles.cardIconImage} />
      ) : (
        <Feather name={"folder"} size={30} color="#555" />
      )}
      <View style={styles.footer}>
        <Text style={styles.texto} numberOfLines={2} ellipsizeMode="tail">
          {item.categoryName}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        {loadingCategories ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#14C234" />
          </View>
        ) : (
          <Animated.FlatList
            data={categories}
            renderItem={renderCategoryCard}
            keyExtractor={(item) => item.categoryId.toString()}
            numColumns={2}
            style={styles.listStyle}
            contentContainerStyle={styles.listContentContainer}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
            ListHeaderComponent={
              <View style={styles.header}>
                <Text style={styles.title}>Suas categorias</Text>
              </View>
            }
            ListEmptyComponent={
              !loadingCategories && categories.length === 0 ? (
                <View style={styles.emptyListContainer}>
                  <Text style={styles.emptyListText}>
                    Nenhuma categoria encontrada.
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </View>

      <Animated.View
        style={[
          styles.addCategoryContainer,
          { transform: [{ translateY: addButtonTranslateY }] },
        ]}
      >
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleOpenAddCategoryModal}
          disabled={loadingAddCategory}
        >
          <Feather name="plus" size={20} color="white" />
          <Text style={styles.addButtonText}>Adicionar Categoria</Text>
        </TouchableOpacity>
      </Animated.View>

      {isAddCategoryModalVisible && (
        <Modal
          transparent
          visible={isAddCategoryModalVisible}
          animationType="fade"
          onRequestClose={() => setIsAddCategoryModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Nova Categoria</Text>
              <TextInput
                placeholder="Nome da categoria"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                style={styles.modalInput}
                editable={!loadingAddCategory}
              />
              <Text style={styles.iconSelectorTitle}>Escolha um Ícone</Text>
              {loadingIcons ? (
                <ActivityIndicator color="#14C234" />
              ) : (
                <View style={styles.iconSelectorContainer}>
                  {iconOptions.map((iconUrl) => (
                    <TouchableOpacity
                      key={iconUrl}
                      style={[
                        styles.iconWrapper,
                        selectedIconUrl === iconUrl &&
                          styles.iconWrapperSelected,
                      ]}
                      onPress={() => setSelectedIconUrl(iconUrl)}
                    >
                      <Image
                        source={{ uri: iconUrl }}
                        style={styles.iconImage}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  onPress={() => setIsAddCategoryModalVisible(false)}
                  style={[
                    styles.modalButtonAction,
                    { backgroundColor: "#888" },
                  ]}
                  disabled={loadingAddCategory}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmitNewCategory}
                  style={[
                    styles.modalButtonAction,
                    { backgroundColor: "#14C234" },
                  ]}
                  disabled={loadingAddCategory}
                >
                  <Text style={styles.modalButtonText}>
                    {loadingAddCategory ? "Salvando..." : "Salvar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}

      {selectedCategoryForMenu && (
        <Modal
          transparent={true}
          visible={isCategoryOptionsMenuVisible}
          onRequestClose={() => {
            setIsCategoryOptionsMenuVisible(false);
            setSelectedCategoryForMenu(null);
          }}
          animationType="fade"
        >
          <TouchableWithoutFeedback
            onPress={() => {
              setIsCategoryOptionsMenuVisible(false);
              setSelectedCategoryForMenu(null);
            }}
          >
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.menuOptionContainer}>
                  <Text style={styles.menuOptionTitle}>
                    Opções para "{selectedCategoryForMenu.categoryName}"
                  </Text>
                  <TouchableOpacity
                    style={styles.menuOptionItem}
                    onPress={handleOpenEditCategoryNameModal}
                  >
                    <Feather name="edit-2" size={20} color="#333" />
                    <Text style={styles.menuOptionItemText}>Editar Nome</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.menuOptionItem}
                    onPress={() =>
                      handleDeleteCategory(selectedCategoryForMenu.categoryId)
                    }
                  >
                    <Feather name="trash" size={20} color="#D9534F" />
                    <Text
                      style={[styles.menuOptionItemText, { color: "#D9534F" }]}
                    >
                      Excluir Categoria
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.menuOptionItem, styles.menuOptionCancel]}
                    onPress={() => {
                      setIsCategoryOptionsMenuVisible(false);
                      setSelectedCategoryForMenu(null);
                    }}
                  >
                    <Feather name="x-circle" size={20} color="#555" />
                    <Text style={styles.menuOptionItemText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {isEditCategoryNameModalVisible && selectedCategoryForMenu && (
        <Modal
          transparent={true}
          visible={isEditCategoryNameModalVisible}
          onRequestClose={() => setIsEditCategoryNameModalVisible(false)}
          animationType="fade"
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Editar Nome da Categoria</Text>
              <Text style={styles.currentCategoryNameText}>
                Nome atual: {selectedCategoryForMenu.categoryName}
              </Text>
              <TextInput
                placeholder="Novo nome da categoria"
                value={editingCategoryNewName}
                onChangeText={setEditingCategoryNewName}
                style={styles.modalInput}
                editable={!loadingUpdateCategory}
              />
              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={[
                    styles.modalButtonAction,
                    { backgroundColor: "#888" },
                  ]}
                  onPress={() => setIsEditCategoryNameModalVisible(false)}
                  disabled={loadingUpdateCategory}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButtonAction,
                    { backgroundColor: "#14C234" },
                  ]}
                  onPress={handleUpdateCategoryName}
                  disabled={loadingUpdateCategory}
                >
                  {loadingUpdateCategory ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalButtonText}>Salvar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listStyle: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: 10,
    paddingBottom: 150,
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: "flex-start",
    width: "100%",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  card: {
    flex: 1,
    margin: 8,
    height: 150,
    borderRadius: 15,
    backgroundColor: "#D8D8D8",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    minWidth: "40%",
  },
  cardIconImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginBottom: 10,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(185, 185, 185, 0.8)",
    paddingVertical: 8,
    paddingHorizontal: 5,
    alignItems: "center",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  texto: {
    fontSize: 14,
    color: "#464646",
    fontWeight: "bold",
    textAlign: "center",
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
    minHeight: 200,
  },
  emptyListText: {
    fontSize: 16,
    color: "#666",
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
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
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
    padding: 20,
  },
  modalView: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 25,
    width: "100%",
    maxWidth: 380,
    alignItems: "stretch",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    color: "#000",
  },
  iconSelectorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  iconSelectorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  iconWrapper: {
    margin: 5,
    padding: 10,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  iconWrapperSelected: {
    borderColor: "#14C234",
    backgroundColor: "#e8f5e9",
  },
  iconImage: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButtonAction: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
    minHeight: 48,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  menuOptionContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 0,
    width: "90%",
    maxWidth: 320,
    elevation: 5,
    overflow: "hidden",
  },
  menuOptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  menuOptionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  menuOptionItemText: {
    fontSize: 16,
    marginLeft: 15,
    color: "#333",
  },
  menuOptionCancel: {},
  currentCategoryNameText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
    textAlign: "center",
  },
});
