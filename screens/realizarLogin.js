import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	Pressable,
	ImageBackground,
	Dimensions,
} from "react-native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import app from "../firebaseConfig";
import bgImage from "../assets/background.jpg";

const RealizarLogin = ({ navigation }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const tentarLogar = () => {
		const auth = getAuth(app);
		signInWithEmailAndPassword(auth, email, password)
			.then(() => {
				console.log("Autenticado com sucesso!");
				setEmail("");
				setPassword("");
				navigation.navigate("PaginaPrincipal");
			})
			.catch((error) => {
				console.log("Erro ao autenticar: ", error);
				alert(
					"Falha ao autenticar. Verifique os dados e tente novamente."
				);
			});
	};

	return (
		<ImageBackground source={bgImage} style={styles.background}>
			<View style={styles.container}>
				<Text style={styles.title}>Login</Text>
				<TextInput
					style={styles.input}
					onChangeText={setEmail}
					value={email}
					placeholder="Coloque seu e-mail"
					placholderTextColor="#fff"
				/>
				<TextInput
					style={styles.input}
					onChangeText={setPassword}
					value={password}
					placeholder="Senha"
					placholderTextColor="#fff"
					secureTextEntry
				/>
				<Pressable style={styles.button} onPress={tentarLogar}>
					<Text style={styles.buttonText}>Entrar</Text>
				</Pressable>
			</View>
		</ImageBackground>
	);
};

const styles = StyleSheet.create({
	background: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		resizeMode: "cover",
		overflow: "hidden",
	},
	container: {
		padding: 20,
		backgroundColor: "#rgba(0, 0, 0, 0.6)",
		borderRadius: 10,
		width: "80%",
		shadowColor: "#000",
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 5,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		color: "#fff",
		textAlign: "center",
	},
	input: {
		borderWidth: 1,
		borderColor: "#ddd",
		paddingHorizontal: 10,
		marginBottom: 10,
		borderRadius: 5,
		height: 50,
		color: "#fff",
	},
	button: {
		backgroundColor: "#333",
		paddingVertical: 10,
		borderRadius: 5,
		marginTop: 10,
	},
	buttonText: {
		color: "#fff",
		fontSize: 18,
		textAlign: "center",
		fontWeight: "bold",
	},
	errorText: {
		color: "red",
		fontSize: 16,
		marginBottom: 10,
		textAlign: "center",
		fontWeight: "bold",
	},
});

export default RealizarLogin;
