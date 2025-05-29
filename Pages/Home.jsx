import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import axios from "axios";

export default function Home({ route, navigation }) {
  const translateY = useRef(new Animated.Value(0)).current;

  const user = route.params?.user;
  const userId = user?.userId;

  const [modalVisible, setModalVisible] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDeleteIcons, setShowDeleteIcons] = useState(false);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 100) {
      Animated.timing(translateY, {
        toValue: 200,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleAddCategoryPress = () => {
    setModalVisible(true);
  };
  //busca
  const fetchCategories = async () => {
    if (!userId) return;

    setLoadingCategories(true);
    try {
      const response = await axios.get(
        `https://lockpassapi20250324144759.azurewebsites.net/api/category/user/${userId}`
      );
      if (response.status === 200) {
        setCategories(response.data);
      } else {
        Alert.alert("Erro", "Falha ao carregar categorias");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível conectar à API.");
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [userId]);

  //adiciona
  const handleSubmitCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert("Erro", "Por favor, insira o nome da categoria.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `https://lockpassapi20250324144759.azurewebsites.net/api/category/${userId}`,
        {
          categoryName: categoryName.trim(),
          userId: userId,
        }
      );
      if (response.status === 200 || response.status === 201) {
        Alert.alert("Sucesso", "Categoria adicionada com sucesso!");
        setCategoryName("");
        setModalVisible(false);
        fetchCategories();
      } else {
        Alert.alert("Erro", "Falha ao adicionar a categoria.");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível conectar à API.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    console.log("Tentando excluir categoria com ID:", categoryId);

    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja excluir esta categoria?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await axios.delete(
                `https://lockpassapi20250324144759.azurewebsites.net/api/category/${categoryId}`
              );

              if (response.status === 200 || response.status === 204) {
                Alert.alert("Sucesso", "Categoria excluída com sucesso.");
                fetchCategories();
              } else {
                Alert.alert("Erro", "Erro ao excluir categoria.");
                console.error("Erro na resposta da exclusão:", response);
              }
            } catch (error) {
              Alert.alert("Erro", "Erro de conexão ao excluir categoria.");
              console.error("Erro ao tentar excluir categoria:", error);
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Suas senhas</Text>
          <TouchableOpacity
            onPress={() => setShowDeleteIcons(!showDeleteIcons)}
          >
            <Feather
              name="edit"
              size={24}
              color={showDeleteIcons ? "red" : "black"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.categoryContainer}>
          {loadingCategories ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : categories.length > 0 ? (
            categories.map((cat, index) => (
              <TouchableOpacity
                key={cat.id || index}
                style={styles.card}
                onPress={() =>
                  navigation.navigate("CategoriaDetalhes", {
                    categoryName: cat.categoryName,
                  })
                }
              >
                {showDeleteIcons && (
                  <TouchableOpacity
                    onPress={() => handleDeleteCategory(cat.categoryId)}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      zIndex: 1,
                    }}
                  >
                    <Feather name="trash" size={20} color="#900" />
                  </TouchableOpacity>
                )}
                <Feather name="edit" size={24} />
                <View style={styles.footer}>
                  <Text style={styles.texto}>{cat.categoryName}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{ textAlign: "center", width: "100%", marginTop: 20 }}>
              Nenhuma categoria encontrada.
            </Text>
          )}
        </View>

        {user && (
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 14, color: "#555" }}>
              Seu ID de usuário é: {user.userId}
            </Text>
          </View>
        )}
      </ScrollView>

      <Animated.View
        style={[styles.addCategoryContainer, { transform: [{ translateY }] }]}
      >
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddCategoryPress}
          disabled={loading}
        >
          <Feather name="plus" size={20} color="white" />
          <Text style={styles.addButtonText}>Adicionar Categoria</Text>
        </TouchableOpacity>
      </Animated.View>

      {modalVisible && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
          keyboardVerticalOffset={100}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Categoria</Text>
            <TextInput
              placeholder="Nome da categoria"
              value={categoryName}
              onChangeText={setCategoryName}
              style={styles.modalInput}
              editable={!loading}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalButton, { backgroundColor: "#888" }]}
                disabled={loading}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmitCategory}
                style={[styles.modalButton, { backgroundColor: "#14C234" }]}
                disabled={loading}
              >
                <Text style={styles.modalButtonText}>
                  {loading ? "Salvando..." : "Salvar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 120,
  },
  header: {
    margin: 20,
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
    marginHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },
  card: {
    width: "48%",
    height: 190,
    borderRadius: 20,
    backgroundColor: "#D8D8D8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    overflow: "hidden",
    position: "relative",
    elevation: 2,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#B9B9B9",
    paddingVertical: 6,
    alignItems: "center",
  },
  texto: {
    fontSize: 12,
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
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
