// AppNavigator.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../Pages/Login";
import Cadastro from "../Pages/Cadastro";
import DrawerRoutes from "./DrawerRoutes";
import CategoriaDetalhes from "../Pages/CategoriaDetalhes";
import { View, Text, TouchableOpacity } from "react-native";
import Feather from "react-native-vector-icons/Feather";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="DrawerRoutes"
          component={DrawerRoutes}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Cadastro"
          component={Cadastro}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CategoriaDetalhes"
          component={CategoriaDetalhes}
          options={({ route, navigation }) => ({
            header: () => (
              <View
                style={{
                  paddingTop: 20,
                  height: 130,
                  borderBottomLeftRadius: 30,
                  borderBottomRightRadius: 30,
                  backgroundColor: "#2d2d2d",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    top: 65,
                    left: 20,
                  }}
                  onPress={() => navigation.goBack()}
                >
                  <Feather name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text
                  style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}
                >
                  {route.params?.categoryName || "Detalhes"}
                </Text>
              </View>
            ),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
