import React, { useState } from "react";
import {
	View,
	TextInput,
	Button,
	Image,
	Alert,
	StyleSheet,
	Text,
	Pressable,
} from "react-native";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getApp } from "firebase/app";
import * as ImagePicker from "expo-image-picker";
import AWS from "aws-sdk";

// Configurar credenciais da AWS
AWS.config.update({
  accessKeyId: "ASIA6ODU7GZ6P6GRRQFF",
  secretAccessKey: "PgKjKaaJJi7wxy1OWaFZgY+P/8MNFkQjMAaJ1zs+",
  sessionToken: "IQoJb3JpZ2luX2VjEIb//////////wEaCXVzLXdlc3QtMiJHMEUCIQC62I3JeQnPY64MYPj3fdP8NmR9cYdCeZU7Sdm09DhE8gIgDzG0JDBh7DcpIDGo7ZP8L9WMg/f0kisFIUufxVHL31MquAII7///////////ARAAGgw5OTIzODI3NjA1NzIiDEgNKXe5J2o96qd6PSqMAmzXFxm0KmpqphsB7wVNHTqhoW+7JwvwxNDl4gqvldeh4g5x1boi4NuPWWoIsC/jd9jLKyWxMppd1hUkXe6uqh+pxwpjpCP3PLsdBfuxCb8W3ZNHshDbFcdH4/yG5my3ZfIIBZL+I0csZL9RM3J7CoZmXQsS96Q1t+ciIOMxEBRDM/Qk33ZUBFNqXyayitdKGnWaY8B4/NB9nZWiWrhD9nBtYnvR6g7a5nmPG9CuA2zkLDRikdvywBHjkaFfN8HwbsfHb3RjZLZeAvBzxPQ6YnDRmTY2G+AX/ouy2JaAF9+Mei3uihXQmVgXK9/UG4YUNx9y+Sxd2j7lgaMJZd+tKMTGmLJSM1+LjD8jVtcw9LC6vwY6nQEQuR6Efm2mmAkhDks0i0ScIoPWRnGiQonb9zARIXhY1N9MbwlKJdKoOoM0DdiYfI+vRvWzPM6HXBCz0qHueRvLeRpSBf1j77or23FHYEDAFrKlyyKdlNoOn/Y0qMamK4hNlbnLtv2glWL8bP+bYbbjMi+C/EQADylcY2PJ6rrGHnf5iPfSRSGmSqhUzRwtxcqN9U32vfyUUSI+hEHr",
  region: "us-east-1",
});

const S3_BUCKET = "bucket-app-firestore";
const s3 = new AWS.S3();

// Função para registrar o usuário
const registerUser = async (email, password, nome, imageUri) => {
	const auth = getAuth(getApp());
	const firestore = getFirestore(getApp());

	try {
		// Criar usuário no Firebase Authentication
		const userCredential = await createUserWithEmailAndPassword(
			auth,
			email,
			password
		);
		const user = userCredential.user;

		// Upload da imagem no AWS S3
		const filename = imageUri.substring(imageUri.lastIndexOf("/") + 1);
		const filePath = `profile_images/${user.uid}/${filename}`;

		const response = await fetch(imageUri);
		const blob = await response.blob();

		const uploadParams = {
			Bucket: S3_BUCKET,
			Key: filePath,
			Body: blob,
			ContentType: "image/jpeg",
		};

		const uploadResult = await s3.upload(uploadParams).promise();
		const photoURL = uploadResult.Location;

		// Salvar dados do usuário no Firestore
		await setDoc(doc(firestore, "users", user.uid), {
			uid: user.uid,
			email: email,
			nome: nome,
			photoURL: photoURL,
		});

		console.log("Usuário registrado e imagem salva no S3");
		return user;
	} catch (error) {
		console.error("Erro ao registrar usuário: ", error);
		Alert.alert("Erro", "Não foi possível registrar o usuário.");
	}
};

export default function Cadastro({ navigation }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [nome, setNome] = useState("");
	const [imageUri, setImageUri] = useState(null);

	// Função para escolher a imagem de perfil
	const pickImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			quality: 1,
		});

		if (!result.canceled) {
			setImageUri(result.assets[0].uri);
		}
	};

	// Função para lidar com o cadastro
	const handleRegister = async () => {
		if (email && password && nome && imageUri) {
			await registerUser(email, password, nome, imageUri);
			Alert.alert("Sucesso", "Usuário registrado com sucesso!");
		} else {
			Alert.alert("Erro", "Por favor, preencha todos os campos.");
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Cadastro de Usuário</Text>

			<TextInput
				placeholder="Nome"
				value={nome}
				onChangeText={setNome}
				style={styles.input}
			/>

			<TextInput
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
				keyboardType="email-address"
				style={styles.input}
			/>

			<TextInput
				placeholder="Senha"
				value={password}
				secureTextEntry
				onChangeText={setPassword}
				style={styles.input}
			/>

			<Button title="Escolher Foto de Perfil" onPress={pickImage} />
			{imageUri && (
				<Image source={{ uri: imageUri }} style={styles.image} />
			)}

			<Button title="Registrar" onPress={handleRegister} />
			<Pressable
				style={[styles.botao, styles.botaoVoltar]}
				onPress={() => navigation.goBack()}
			>
				<Text style={styles.textoBotao}>Voltar</Text>
			</Pressable>
		</View>
	);
}

// Estilos para a tela
const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		padding: 20,
		backgroundColor: "#f5f5f5",
	},
	title: {
		fontSize: 24,
		marginBottom: 20,
		textAlign: "center",
	},
	input: {
		height: 40,
		borderColor: "#ddd",
		borderWidth: 1,
		marginBottom: 10,
		paddingLeft: 8,
		backgroundColor: "#fff",
		borderRadius: 5,
	},
	image: {
		width: 100,
		height: 100,
		borderRadius: 50,
		alignSelf: "center",
		marginVertical: 20,
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
	botaoVoltar: {
		backgroundColor: "#333",
	},
});
