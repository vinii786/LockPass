import React, { useState } from "react";
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
import axios from "axios";
import { useNavigation } from "@react-navigation/native"; // Importando o hook de navegação

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [dados, setDados] = useState(null);

  const navigation = useNavigation(); // Hook para navegação

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
        alert("Cadastro realizado com sucesso!");

        // Navegar para a tela de Login após o cadastro
        navigation.replace("Login"); // Substituir "Login" pelo nome da sua tela de login
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
          setErro("Erro ao realizar cadastro.");
        }
      } else if (error.request) {
        setErro("Sem conexão com o servidor.");
      } else {
        setErro("Erro desconhecido.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerTop}>
        <Image
          source={require("../assets/LockPassIcon.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <KeyboardAvoidingView style={styles.formContainer}>
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
          <TouchableOpacity style={styles.button} onPress={handleCadastro}>
            <Text style={styles.buttonText}>Cadastrar</Text>
          </TouchableOpacity>
        )}

        {dados && (
          <View style={styles.responseContainer}>
            <Text style={styles.responseText}>
              {JSON.stringify(dados, null, 2)}
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

// Definição dos estilos logo após o componente
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  image: {
    width: 100,
    height: 100,
  },
  containerTop: {
    marginTop: 50,
    marginBottom: 50,
    alignItems: "center",
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#2F2F31",
    width: "100%",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
    fontFamily: "Fonte-Bold",
    fontSize: 30,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 15,
    paddingLeft: 10,
    color: "black",
    fontFamily: "Fonte-Regular",
  },
  button: {
    backgroundColor: "#14C234",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    width: "100%",
    height: 60,
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
  },
  responseContainer: {
    marginTop: 20,
    backgroundColor: "#444",
    padding: 15,
    borderRadius: 10,
    width: "100%",
  },
  responseText: {
    color: "white",
    fontFamily: "Fonte-Regular",
    fontSize: 14,
  },
});
