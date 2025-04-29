import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import axios from "axios";

import Logo from "../assets/LockPassIcon.png";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

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
        };

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
    <View style={styles.container}>
      <View style={styles.containerLogo}>
        <Image source={Logo} style={styles.image} resizeMode="contain" />
      </View>

      <KeyboardAvoidingView style={styles.containerLogin}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#aaa"
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
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    width: "100%",
    padding: 0,
    margin: 0,
  },
  containerLogo: {
    width: "100%",
    height: "auto",
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 70,
  },
  containerLogin: {
    justifyContent: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    backgroundColor: "#2F2F31",
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
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
    borderColor: "#ccc",
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
  },
  image: {
    width: 160,
  },
});
