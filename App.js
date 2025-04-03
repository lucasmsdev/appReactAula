import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RealizarLogin from "./screens/realizarLogin";
import PaginaPrincipal from "./screens/paginaPrincipal";
import ListarJogadores from "./screens/listarJogadores";
import AdicionarJogador from "./screens/adicionarJogador";
import EditarPerfil from "./screens/editarPerfil";
import UploadFoto from "./screens/uploadFoto";
import ListarImagens from "./screens/listarImagens";
import UploadVideo from "./screens/uploadVideo";
import app from "./firebaseConfig";
import ListarCategoria from "./screens/listarCategoria";
import SobreNos from "./screens/sobreNos";
import Cadastro from "./screens/cadastro";

const Stack = createNativeStackNavigator();

export default function App() {
	return (
		<NavigationContainer>
			<Stack.Navigator
				initialRouteName="realizarLogin"
				screenOptions={{ headerShown: false }}
			>
				<Stack.Screen name="realizarLogin" component={RealizarLogin} />
				<Stack.Screen
					name="PaginaPrincipal"
					component={PaginaPrincipal}
				/>
				<Stack.Screen
					name="listarJogadores"
					component={ListarJogadores}
				/>
				<Stack.Screen
					name="adicionarJogador"
					component={AdicionarJogador}
				/>
				<Stack.Screen name="editarPerfil" component={EditarPerfil} />
				<Stack.Screen name="uploadFoto" component={UploadFoto} />
				<Stack.Screen name="ListarImagens" component={ListarImagens} />
				<Stack.Screen name="uploadVideo" component={UploadVideo} />
				<Stack.Screen name="sobreNos" component={SobreNos} />
				<Stack.Screen name="cadastro" component={Cadastro} />
				<Stack.Screen
					name="listarCategoria"
					component={ListarCategoria}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
}
