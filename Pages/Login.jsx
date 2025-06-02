import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableOpacity,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Logo from "../assets/LockPassIcon.png";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

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

  const handleLogin = async () => {
    setErro("");
    setCarregando(true);

    try {
      const response = await axios.post(
        "https://lockpassapi20250324144759.azurewebsites.net/api/user/login",
        {
          UserEmail: email,
          password: senha,
        }
      );

      setCarregando(false);

      if (response.status === 200) {
        const userData = {
          userId: response.data.userId,
          userName: response.data.userName,
          userEmail: response.data.userEmail,
          userPassword: response.data.userPassword,
        };

        await AsyncStorage.setItem("userID", String(response.data.userId));
        navigation.navigate("DrawerRoutes", { user: userData });
      } else {
        setErro("Erro ao tentar fazer login");
      }
    } catch (error) {
      setCarregando(false);
      if (error.response) {
        setErro("Usuário ou senha incorretos.");
      } else if (error.request) {
        setErro("Erro de conexão com o servidor.");
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
              <View style={styles.containerLogo}>
                <Image
                  source={Logo}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>
            )}

            <View style={styles.containerLogin}>
              <Text style={styles.title}>Login</Text>

              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#aaa"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Senha"
                secureTextEntry
                value={senha}
                onChangeText={setSenha}
                placeholderTextColor="#aaa"
              />

              {erro ? <Text style={styles.error}>{erro}</Text> : null}

              {carregando ? (
                <ActivityIndicator size="large" color="#0000ff" />
              ) : (
                <TouchableOpacity onPress={handleLogin} style={styles.button}>
                  <Text style={styles.buttonText}>Entrar</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => navigation.navigate("Cadastro")}>
                <Text style={styles.buttonText}>Cadastrar-se</Text>
              </TouchableOpacity>
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
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#ffffff",
    paddingHorizontal: 0,
  },
  containerKeyboardVisible: {
    justifyContent: "flex-start",
    paddingTop: Platform.OS === "ios" ? 20 : 40,
  },
  containerLogo: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  containerLogin: {
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
    backgroundColor: "#2F2F31",
    paddingHorizontal: 20,
    borderRadius: 20,
    paddingVertical: 30,
  },
  title: {
    fontSize: 30,
    marginBottom: 15,
    textAlign: "left",
    color: "#fff",
    width: "100%",
    fontFamily: "Fonte-Bold",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginBottom: 15,
    paddingLeft: 10,
    color: "black",
    fontFamily: "Fonte-Regular",
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "Fonte-Regular",
  },
  button: {
    backgroundColor: "#14C234",
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    width: "100%",
    height: 60,
    borderRadius: 9,
    marginTop: 40,
    marginBottom: 6,
  },
  buttonText: {
    color: "white",
    fontFamily: "Fonte-Bold",
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
});
