import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import axios from "axios";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from "react-native";
import { TouchableWithoutFeedback } from "react-native";

export default function UserScreen({ route }) {
  const { user } = route.params;

  const [userName, setUserName] = useState(
    user.userName.replace("Container", "")
  );
  const [userEmail, setUserEmail] = useState(user.userEmail);

  const [editandoNome, setEditandoNome] = useState(false);
  const [editandoEmail, setEditandoEmail] = useState(false);
  const [editandoSenha, setEditandoSenha] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSalvar = async () => {
    if (!editandoEmail && !editandoSenha && !editandoNome) {
      Alert.alert("Nada para salvar", "Ative a edição para alterar os dados.");
      return;
    }

    try {
      setCarregando(true);

      if (editandoEmail || editandoNome) {
        await axios.put(
          `https://lockpassapi20250324144759.azurewebsites.net/api/user/updateuser?userId=${user.userId}`,
          {
            userName,
            userEmail,
          }
        );
      }

      if (editandoSenha) {
        if (!senhaAtual || !novaSenha || !confirmacaoSenha) {
          Alert.alert("Erro", "Preencha todos os campos de senha.");
          setCarregando(false);
          return;
        }

        if (novaSenha !== confirmacaoSenha) {
          Alert.alert("Erro", "As novas senhas não coincidem.");
          setCarregando(false);
          return;
        }

        await axios.put(
          `https://lockpassapi20250324144759.azurewebsites.net/api/user/updatepassword?userId=${user.userId}`,
          {
            currentPassword: senhaAtual,
            newPassword: novaSenha,
            newPasswordConfirmation: confirmacaoSenha,
          }
        );
      }

      Alert.alert("Sucesso", "Dados atualizados com sucesso!");
      setEditandoNome(false);
      setEditandoEmail(false);
      setEditandoSenha(false);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmacaoSenha("");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar os dados.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <View style={styles.user}>
              <Image
                source={require("../assets/homem.png")}
                style={styles.avatar}
              />
              <View style={styles.nameBox}>
                <Text style={styles.userName}>Nome de usuario:</Text>
              </View>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  value={userName}
                  onChangeText={setUserName}
                  editable={editandoNome}
                />
                <Feather
                  name="edit"
                  size={24}
                  onPress={() => setEditandoNome(!editandoNome)}
                  color={editandoNome ? "green" : "black"}
                />
              </View>
            </View>

            <Text style={styles.label}>Email</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                value={userEmail}
                onChangeText={setUserEmail}
                editable={editandoEmail}
              />
              <Feather
                name="edit"
                size={24}
                onPress={() => setEditandoEmail(!editandoEmail)}
                color={editandoEmail ? "green" : "black"}
              />
            </View>

            <TouchableOpacity
              onPress={() => setEditandoSenha(!editandoSenha)}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                {editandoSenha ? "Cancelar" : "Editar senha"}
              </Text>
            </TouchableOpacity>

            {editandoSenha && (
              <>
                <Text style={styles.label}>Senha atual</Text>
                <TextInput
                  style={styles.inputBox}
                  value={senhaAtual}
                  onChangeText={setSenhaAtual}
                  secureTextEntry
                />

                <Text style={styles.label}>Nova senha</Text>
                <TextInput
                  style={styles.inputBox}
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                  secureTextEntry
                />

                <Text style={styles.label}>Confirme a nova senha</Text>
                <TextInput
                  style={styles.inputBox}
                  value={confirmacaoSenha}
                  onChangeText={setConfirmacaoSenha}
                  secureTextEntry
                />
              </>
            )}

            {(editandoNome || editandoEmail || editandoSenha) && (
              <TouchableOpacity style={styles.button} onPress={handleSalvar}>
                <Text style={styles.buttonText}>
                  {carregando ? "Salvando..." : "Salvar Alterações"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    marginTop: 15,
  },
  inputBox: {
    flexDirection: "row",
    height: 60,
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: "100%",
    marginBottom: 10,
  },
  nameBox: {
    alignSelf: "flex-start",
    marginBottom: 5,
  },

  userName: {
    fontSize: 16,
    fontWeight: "bold",
    paddingBottom: 0,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginRight: 10,
    color: "#000",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#14C234",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
