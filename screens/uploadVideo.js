import React, { useState } from "react";
import { View, Button, Text, StyleSheet, Alert, Pressable } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Picker } from "@react-native-picker/picker";
import { ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebaseConfig";

export default function UploadVideo({ navigation }) {
	const [video, setVideo] = useState(null);
	const [category, setCategory] = useState("matematica");
	const [uploading, setUploading] = useState(false);

	const pickVideo = async () => {
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: ["video/*"],
				copyToCacheDirectory: true,
			});

			console.log("Resultado do DocumentPicker:", result);

			// Verifique a estrutura correta do resultado
			const asset =
				result.assets && result.assets.length > 0
					? result.assets[0]
					: result;

			if (asset && asset.uri) {
				const selectedVideo = {
					uri: asset.uri,
					name: asset.name,
					type: asset.mimeType || "video/mp4",
				};
				setVideo(selectedVideo);
			} else {
				Alert.alert("Erro", "Nenhum vídeo selecionado.");
			}
		} catch (error) {
			console.error("Erro ao selecionar vídeo: ", error);
			Alert.alert("Erro", "Não foi possível selecionar o vídeo.");
		}
	};

	const uploadVideo = async () => {
		if (!video || !category) {
			Alert.alert(
				"Erro",
				"Por favor, selecione um vídeo e uma categoria"
			);
			return;
		}

		try {
			console.log("Iniciando upload de vídeo...", video);
			console.log("Categoria selecionada:", category);

			const videoRef = ref(storage, `videos/${category}/${video.name}`);

			const response = await fetch(video.uri);
			const blob = await response.blob();

			console.log("Arquivo Blob:", blob);

			setUploading(true);
			await uploadBytes(videoRef, blob);
			Alert.alert("Sucesso", "Vídeo enviado com sucesso!");
			setVideo(null);
		} catch (error) {
			console.error("Erro no upload: ", error);
			Alert.alert("Erro", "Falha no envio do vídeo");
		} finally {
			setUploading(false);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Upload de Vídeo</Text>
			<Button title="Escolher Vídeo" onPress={pickVideo} />
			{video ? (
				<Text style={styles.videoName}>Selecionado: {video.name}</Text>
			) : (
				<Text style={styles.videoName}>Nenhum vídeo selecionado</Text>
			)}

			<Picker
				selectedValue={category}
				style={styles.picker}
				onValueChange={(itemValue) => setCategory(itemValue)}
			>
				<Picker.Item label="Geografia" value="geografia" />
				<Picker.Item label="Matemática" value="matematica" />
				<Picker.Item label="Português" value="portugues" />
			</Picker>

			<Button
				title={uploading ? "Enviando..." : "Enviar Vídeo"}
				onPress={uploadVideo}
				disabled={uploading || !video}
			/>
			<Pressable
				style={[styles.botao, styles.botaoVoltar]}
				onPress={() => navigation.goBack()}
			>
				<Text style={styles.textoBotao}>Voltar</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		justifyContent: "center",
	},
	title: {
		fontSize: 24,
		marginBottom: 20,
		textAlign: "center",
	},
	videoName: {
		marginTop: 10,
		textAlign: "center",
	},
	picker: {
		height: 50,
		width: 200,
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
