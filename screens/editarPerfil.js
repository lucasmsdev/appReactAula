import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	Button,
	Alert,
	StyleSheet,
	ImageBackground,
	Pressable,
	Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
	getAuth,
	updateEmail,
	updatePassword,
	reauthenticateWithCredential,
	EmailAuthProvider,
} from "firebase/auth";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import {
	getStorage,
	ref,
	uploadBytesResumable,
	getDownloadURL,
} from "firebase/storage";
import app from "../firebaseConfig";
import bgImage from "../assets/estadio.jpg";

const EditarPerfil = ({ navigation }) => {
	const auth = getAuth();
	const db = getFirestore(app);
	const storage = getStorage(app);
	const user = auth.currentUser;
	const userDocRef = doc(db, "users", user.uid);

	const [nome, setNome] = useState("");
	const [novoEmail, setNovoEmail] = useState("");
	const [novaSenha, setNovaSenha] = useState("");
	const [senhaAtual, setSenhaAtual] = useState("");
	const [fotoAtual, setFotoAtual] = useState("");

	useEffect(() => {
		const fetchUserData = async () => {
			const userDoc = await getDoc(userDocRef);
			if (userDoc.exists()) {
				setNome(userDoc.data().nome);
				setNovoEmail(user.email);
				setFotoAtual(userDoc.data().photoURL);
			}
		};

		fetchUserData();
	}, []);

	// Função para selecionar uma nova imagem
	const handlePickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
		});

		if (!result.canceled) {
			uploadImage(result.assets[0].uri);
		}
	};

	// Função para fazer upload da imagem para o Firebase Storage
	const uploadImage = async (uri) => {
		try {
			const response = await fetch(uri);
			const blob = await response.blob();
			const storageRef = ref(
				storage,
				`profile_images/${user.uid}/${Date.now()}`
			);

			const uploadTask = uploadBytesResumable(storageRef, blob);

			uploadTask.on(
				"state_changed",
				null,
				(error) => console.error("Erro ao fazer upload:", error),
				async () => {
					const downloadURL = await getDownloadURL(
						uploadTask.snapshot.ref
					);
					await updateDoc(userDocRef, { photoURL: downloadURL });
					setFotoAtual(downloadURL);
					Alert.alert("Sucesso", "Foto de perfil atualizada!");
				}
			);
		} catch (error) {
			console.error("Erro ao enviar imagem:", error);
		}
	};

	const handleUpdateProfile = async () => {
		const credential = EmailAuthProvider.credential(user.email, senhaAtual);

		try {
			await reauthenticateWithCredential(user, credential);

			await updateDoc(userDocRef, { nome });

			if (novoEmail !== user.email) {
				await updateEmail(user, novoEmail);
			}

			if (novaSenha) {
				await updatePassword(user, novaSenha);
			}

			Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
			navigation.goBack();
		} catch (error) {
			console.error("Erro ao atualizar perfil: ", error);
			Alert.alert("Erro", "Ocorreu um erro ao atualizar o perfil.");
		}
	};

	return (
		<ImageBackground
			source={bgImage}
			style={styles.background}
			resizeMode="cover"
		>
			<View style={styles.container}>
				<Text style={styles.titulo}>Editar Perfil</Text>

				{fotoAtual ? (
					<Image
						source={{ uri: fotoAtual }}
						style={styles.fotoPerfil}
					/>
				) : (
					<Text style={styles.placeholderFoto}>Sem foto</Text>
				)}

				<Pressable style={styles.botao} onPress={handlePickImage}>
					<Text style={styles.textoBotao}>Trocar Foto</Text>
				</Pressable>

				<TextInput
					style={styles.input}
					placeholder="Nome"
					value={nome}
					onChangeText={setNome}
				/>
				<TextInput
					style={styles.input}
					placeholder="Novo E-mail"
					value={novoEmail}
					onChangeText={setNovoEmail}
				/>
				<TextInput
					style={styles.input}
					placeholder="Nova Senha"
					value={novaSenha}
					secureTextEntry
					onChangeText={setNovaSenha}
				/>
				<TextInput
					style={styles.input}
					placeholder="Senha Atual (necessária para alterações)"
					value={senhaAtual}
					secureTextEntry
					onChangeText={setSenhaAtual}
				/>

				<Button
					title="Atualizar Perfil"
					onPress={handleUpdateProfile}
				/>

				<Pressable
					style={[styles.botao, styles.botaoVoltar]}
					onPress={() => navigation.goBack()}
				>
					<Text style={styles.textoBotao}>Voltar</Text>
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
		flex: 1,
		padding: 20,
		justifyContent: "center",
		alignItems: "center",
	},
	titulo: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		color: "#fff",
	},
	input: {
		width: "100%",
		padding: 15,
		marginVertical: 10,
		backgroundColor: "#fff",
		borderRadius: 10,
		fontSize: 16,
	},
	fotoPerfil: {
		width: 120,
		height: 120,
		borderRadius: 60,
		marginBottom: 20,
		borderWidth: 2,
		borderColor: "#fff",
	},
	placeholderFoto: {
		color: "#fff",
		marginBottom: 20,
	},
	botao: {
		padding: 10,
		backgroundColor: "rgb(0, 0, 120)",
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 10,
		marginTop: 10,
	},
	textoBotao: {
		color: "white",
		fontSize: 16,
	},
	botaoVoltar: {
		backgroundColor: "#333",
		marginTop: 20,
	},
});

export default EditarPerfil;
