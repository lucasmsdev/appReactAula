import React from "react";
import {
	View,
	Text,
	StyleSheet,
	Pressable,
	ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import bgImage from "../assets/estadio.jpg";
import { getAuth, signOut } from "firebase/auth"; // Importe as funções do Firebase Auth
import { firebase } from '../firebaseConfig.js'

const PaginaPrincipal = ({ navigation }) => {
		const sair = async () => {
		    try {
		        const auth = getAuth();
		        
		        // 1. Faz logout do Firebase
		        await signOut(auth);
		        
		        // 2. Limpa o AsyncStorage de forma segura
		        try {
		            // Método mais seguro para limpar storage
		            const allKeys = await AsyncStorage.getAllKeys();
		            await AsyncStorage.multiRemove(allKeys);
		        } catch (storageError) {
		            console.warn("Erro ao limpar storage (pode ser ignorado):", storageError);
		        }
		        
		        // 3. Redireciona usando reset para limpar a pilha de navegação
		        navigation.reset({
		            index: 0,
		            routes: [{ name: "realizarLogin" }]
		        });
		        
		    } catch (error) {
		        console.error("Erro completo no logout:", error);
		        // Mostra mensagem mais informativa
		        Alert.alert("Erro", "Ocorreu um problema ao sair. Por favor, tente novamente.");
		    }
	};
	return (
		<ImageBackground
			source={bgImage}
			style={styles.background}
			resizeMode="cover"
		>
			<View style={styles.container}>
				<Text style={styles.titulo}>Página Inicial</Text>
				<Pressable
					style={styles.botao}
					onPress={() => navigation.navigate("sobreNos")}
				>
					<Text style={styles.textoBotao}>Sobre Nós</Text>
				</Pressable>
				<Pressable
					style={styles.botao}
					onPress={() => navigation.navigate("adicionarJogador")}
				>
					<Text style={styles.textoBotao}>Adicionar Jogador</Text>
				</Pressable>
					<Pressable
					style={styles.botao}
					onPress={() => navigation.navigate("ListarJogadores")}
				>
					<Text style={styles.textoBotao}>Listar</Text>
				</Pressable>
				<Pressable
					style={styles.botao}
					onPress={() => navigation.navigate("cadastro")}
				>
					<Text style={styles.textoBotao}>Cadastro Ususário</Text>
				</Pressable>
				<Pressable
					style={styles.botao}
					onPress={() => navigation.navigate("editarPerfil")}
				>
					<Text style={styles.textoBotao}>Editar Perfil</Text>
				</Pressable>
				<Pressable
					style={styles.botao}
					onPress={() => navigation.navigate("uploadFoto")}
				>
					<Text style={styles.textoBotao}>Upload Foto</Text>
				</Pressable>
				<Pressable
					style={styles.botao}
					onPress={() => navigation.navigate("listarCategoria")}
				>
					<Text style={styles.textoBotao}>Listar Video</Text>
				</Pressable>
				<Pressable
					style={styles.botao}
					onPress={() => navigation.navigate("uploadVideo")}
				>
					<Text style={styles.textoBotao}>Upload Video</Text>
				</Pressable>
				<Pressable
					style={[styles.botao, styles.botaoSair]}
					title="Logout"
					onPress={sair}
				>
					<Text style={styles.textoBotao}>Sair</Text>
				</Pressable>
			</View>
		</ImageBackground>
	);
};

const styles = StyleSheet.create({
	titulo: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		color: "#fff",
		textAlign: "center",
	},
	background: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		resizeMode: "cover",
		overflow: "hidden",
	},
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	botao: {
		padding: 20,
		width: 300,
		backgroundColor: "rgb(0, 0, 120)",
		justifyContent: "center",
		alignItems: "center",
		marginTop: 30,
		borderRadius: 10,
		borderBottomWidth: 2,
		borderBottomColor: "#000",
		borderRightWidth: 2,
		borderRightColor: "#000",
		shadowColor: "#000",
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 5,
	},
	textoBotao: {
		color: "white",
		fontSize: 20,
	},
	botaoSair: {
		backgroundColor: "#333",
	},
});

export default PaginaPrincipal;
