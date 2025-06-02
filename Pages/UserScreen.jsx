import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { TouchableWithoutFeedback } from "react-native";
import axios from "axios";

export default function UserScreen({ route }) {
  const { user } = route.params;

  const [userName, setUserName] = useState(
    user.userName.replace("Container", "")
  );
  const [userEmail, setUserEmail] = useState(user.userEmail);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleSalvar = async () => {
    setCarregando(true);
    let userDetailsUpdated = false;
    let passwordUpdated = false;

    try {
      if (
        userName !== user.userName.replace("Container", "") ||
        userEmail !== user.userEmail
      ) {
        await axios.put(
          `https://lockpassapi20250324144759.azurewebsites.net/api/user/updateuser?userId=${user.userId}`,
          {
            userName,
            userEmail,
          }
        );
        userDetailsUpdated = true;
      }

      if (senhaAtual || novaSenha || confirmacaoSenha) {
        if (!senhaAtual || !novaSenha || !confirmacaoSenha) {
          Alert.alert(
            "Erro",
            "Para alterar a senha, preencha todos os campos: senha atual, nova senha e confirmação da nova senha."
          );
          setCarregando(false);
          return false;
        }

        if (novaSenha !== confirmacaoSenha) {
          Alert.alert("Erro", "As novas senhas não coincidem.");
          setCarregando(false);
          return false;
        }

        await axios.put(
          `https://lockpassapi20250324144759.azurewebsites.net/api/user/updatepassword?userId=${user.userId}`,
          {
            currentPassword: senhaAtual,
            newPassword: novaSenha,
            newPasswordConfirmation: confirmacaoSenha,
          }
        );
        passwordUpdated = true;
      }

      if (userDetailsUpdated || passwordUpdated) {
        Alert.alert("Sucesso", "Dados atualizados com sucesso!");
      } else {
        Alert.alert("Nenhuma alteração", "Nenhum dado foi modificado.");
      }

      setSenhaAtual("");
      setNovaSenha("");
      setConfirmacaoSenha("");
      setCarregando(false);
      return true;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        "Não foi possível atualizar os dados. Verifique os campos e tente novamente.";
      Alert.alert("Erro na atualização", errorMessage);
      setCarregando(false);
      return false;
    }
  };

  const handleEditSaveToggle = async () => {
    if (isEditing) {
      const saveSuccessful = await handleSalvar();
      if (saveSuccessful) {
        setIsEditing(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.innerContainer}>
            <View style={styles.user}>
              <Image
                source={require("../assets/homem.png")}
                style={styles.avatar}
              />
              <View style={styles.nameBox}>
                <Text style={styles.userNameLabel}>Nome de usuário:</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={userName}
                  onChangeText={setUserName}
                  editable={isEditing}
                  placeholder="Nome de usuário"
                />
              </View>
            </View>

            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={userEmail}
                onChangeText={setUserEmail}
                editable={isEditing}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Seu email"
              />
            </View>

            {isEditing && (
              <>
                <Text style={styles.label}>Senha atual</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={senhaAtual}
                    onChangeText={setSenhaAtual}
                    secureTextEntry
                    placeholder="(deixe em branco para não alterar)"
                  />
                </View>

                <Text style={styles.label}>Nova senha</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={novaSenha}
                    onChangeText={setNovaSenha}
                    secureTextEntry
                    placeholder="(deixe em branco para não alterar)"
                  />
                </View>

                <Text style={styles.label}>Confirme a nova senha</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={confirmacaoSenha}
                    onChangeText={setConfirmacaoSenha}
                    secureTextEntry
                    placeholder="Confirme a nova senha"
                  />
                </View>
              </>
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={handleEditSaveToggle}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isEditing ? "Salvar Alterações" : "Editar Perfil"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  innerContainer: {
    padding: 20,
    backgroundColor: "#fff",
  },
  user: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 10,
  },
  nameBox: {
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  userNameLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    marginTop: 15,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    height: 50,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#14C234",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
