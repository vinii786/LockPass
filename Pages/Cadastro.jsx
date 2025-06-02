import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [dados, setDados] = useState(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleCadastro = async () => {
    setErro("");
    setDados(null);

    if (!nome || !email || !senha || !confirmarSenha) {
      setErro("Todos os campos são obrigatórios.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);

    try {
      const response = await axios.post(
        "https://lockpassapi20250324144759.azurewebsites.net/api/user",
        {
          userName: nome,
          userEmail: email,
          password: senha,
          passwordConfirmation: confirmarSenha,
        }
      );

      setCarregando(false);

      if (response.status === 201 || response.status === 200) {
        setDados(response.data);
        navigation.replace("Login");
      } else {
        setErro("Erro ao realizar cadastro.");
      }
    } catch (error) {
      setCarregando(false);

      if (error.response) {
        if (
          error.response.status === 409 &&
          error.response.data === "Email já cadastrado"
        ) {
          setErro("Email já cadastrado.");
        } else {
          const apiError =
            error.response.data?.message ||
            error.response.data?.title ||
            "Erro ao realizar cadastro.";
          setErro(apiError);
        }
      } else if (error.request) {
        setErro("Sem conexão com o servidor.");
      } else {
        setErro("Erro desconhecido.");
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.kav}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          style={styles.scrollViewStyle}
        >
          <View
            style={[
              styles.container,
              isKeyboardVisible ? styles.containerKeyboardVisible : {},
            ]}
          >
            {!isKeyboardVisible && (
              <View style={styles.containerTop}>
                <Image
                  source={require("../assets/LockPassIcon.png")}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>
            )}

            <View style={styles.formContainer}>
              <Text style={styles.text}>Cadastro</Text>

              <TextInput
                style={styles.input}
                placeholder="Nome"
                placeholderTextColor="#aaa"
                value={nome}
                onChangeText={setNome}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#aaa"
                secureTextEntry
                value={senha}
                onChangeText={setSenha}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirmar Senha"
                placeholderTextColor="#aaa"
                secureTextEntry
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
              />

              {erro ? <Text style={styles.error}>{erro}</Text> : null}

              {carregando ? (
                <ActivityIndicator size="large" color="#14C234" />
              ) : (
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleCadastro}
                >
                  <Text style={styles.buttonText}>Cadastrar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kav: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollViewStyle: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 0,
  },
  containerKeyboardVisible: {
    justifyContent: "flex-start",
    paddingTop: Platform.OS === "ios" ? 20 : 30,
  },
  image: {
    width: 100,
    height: 100,
  },
  containerTop: {
    marginBottom: 30,
    alignItems: "center",
  },
  formContainer: {
    backgroundColor: "#2F2F31",
    width: "90%",
    maxWidth: 400,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
  },
  text: {
    color: "white",
    fontFamily: "Fonte-Bold",
    fontSize: 28,
    alignSelf: "flex-start",
    marginBottom: 25,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 15,
    paddingLeft: 15,
    color: "black",
    fontFamily: "Fonte-Regular",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#14C234",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 55,
    borderRadius: 9,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontFamily: "Fonte-Bold",
    fontSize: 18,
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "Fonte-Regular",
    fontSize: 14,
  },
});
