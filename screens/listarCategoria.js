import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	ActivityIndicator,
	Pressable,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseConfig";
import { Video } from "expo-av";

export default function ListarVideosPorCategoria({ navigation }) {
	const [category, setCategory] = useState("matematica");
	const [videos, setVideos] = useState([]);
	const [loading, setLoading] = useState(false);

	// Função para buscar vídeos da categoria selecionada
	const fetchVideos = async () => {
		setLoading(true);
		const listRef = ref(storage, `videos/${category}/`);
		try {
			console.log(`Buscando vídeos em: ${category}/`);
			const res = await listAll(listRef);
			console.log("Arquivos encontrados:", res.items);

			const videoUrls = await Promise.all(
				res.items.map(async (itemRef) => {
					try {
						const url = await getDownloadURL(itemRef);
						console.log(`URL do vídeo ${itemRef.name}: ${url}`);
						return { name: itemRef.name, url };
					} catch (error) {
						console.error(
							`Erro ao obter URL do vídeo ${itemRef.name}: `,
							error
						);
					}
				})
			);
			setVideos(videoUrls.filter((video) => video)); // Remove possíveis URLs inválidas
		} catch (error) {
			console.error("Erro ao carregar vídeos: ", error);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchVideos(); // Carregar vídeos ao iniciar
	}, [category]);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Escolha a Categoria</Text>

			<Picker
				selectedValue={category}
				style={styles.picker}
				onValueChange={(itemValue) => setCategory(itemValue)}
			>
				<Picker.Item label="Geografia" value="geografia" />
				<Picker.Item label="Matemática" value="matematica" />
				<Picker.Item label="Português" value="portugues" />
			</Picker>

			<ScrollView contentContainerStyle={styles.scrollContainer}>
				{loading ? (
					<ActivityIndicator size="large" color="#0000ff" />
				) : (
					videos.map((video, index) => (
						<View key={index} style={styles.videoContainer}>
							<Text style={styles.videoTitle}>{video.name}</Text>
							<Video
								source={{ uri: video.url }}
								style={styles.video}
								resizeMode="contain"
								useNativeControls
								isLooping={false}
								shouldPlay={false} // Não inicia automaticamente
								onError={(error) =>
									console.error(
										`Erro ao carregar vídeo ${index + 1}: `,
										error
									)
								}
							/>
						</View>
					))
				)}
			</ScrollView>
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
	},
	title: {
		fontSize: 24,
		marginBottom: 20,
		textAlign: "center",
	},
	picker: {
		height: 50,
		width: 200,
		alignSelf: "center",
		marginBottom: 20,
	},
	scrollContainer: {
		alignItems: "center",
	},
	videoContainer: {
		marginBottom: 20,
		alignItems: "center",
		width: "100%",
	},
	video: {
		width: "100%",
		height: 200, // Ajuste conforme necessário
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
