import React from "react";
import { TouchableOpacity, Image, View, StyleSheet, Text } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import Ionicons from "react-native-vector-icons/Ionicons";
import Home from "../Pages/Home";
import UserScreen from "../Pages/UserScreen";
import { Alert } from "react-native";

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const { navigation } = props;

  const handleLogout = () => {
    Alert.alert(
      "Confirmar Logout",
      "Você deseja sair da conta?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sim",
          onPress: () => navigation.navigate("Login"),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <View>
          <DrawerItemList {...props} />
        </View>

        <View style={styles.footerIcons}>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#2F2F31" />
          </TouchableOpacity>
        </View>
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerRoutes({ route }) {
  const userData = route.params?.user;

  return (
    <Drawer.Navigator
      initialRouteName="Senhas"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        drawerType: "slide",
        drawerLabelStyle: {
          fontSize: 20,
          fontFamily: "Fonte-Bold",
        },
        drawerActiveTintColor: "black",
        drawerInactiveTintColor: "gray",
        headerStyle: {
          height: 130,
          backgroundColor: "transparent",
        },
        headerBackground: () => (
          <View
            style={{
              flex: 1,
              backgroundColor: "#262627",
              borderBottomLeftRadius: 30,
              borderBottomRightRadius: 30,
            }}
          />
        ),
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
            <Ionicons
              name="menu-outline"
              size={30}
              color="#FFFFFF"
              style={{ marginLeft: 15 }}
            />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <Image
            source={require("../assets/Logo.png")}
            style={{
              width: 40,
              height: 40,
              marginRight: 15,
            }}
            resizeMode="contain"
          />
        ),
      })}
    >
      <Drawer.Screen
        name="Senhas"
        component={Home}
        options={{
          drawerIcon: () => (
            <Ionicons name="lock-closed" color="#2F2F31" size={20} />
          ),
          headerTitle: "",
        }}
      />
      <Drawer.Screen
        name="Perfil"
        component={UserScreen}
        initialParams={{ user: userData }}
        options={{
          drawerIcon: () => (
            <Ionicons name="person-sharp" color="#2F2F31" size={20} />
          ),
          headerTitle: "",
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  footerIcons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
});
