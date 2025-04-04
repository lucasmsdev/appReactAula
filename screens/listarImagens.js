import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	View,
	ScrollView,
	Text,
	Image,
	ActivityIndicator,
	Pressable,
} from "react-native";
import s3 from '../awsConfig'



const BUCKET_NAME = "bucket-app-firestore";
const FOLDER = "imagens/"; // Caminho no S3 onde as imagens estão

export default function ListarImagens({ navigation }) {
	const [images, setImages] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchImages = async () => {
			try {
				const response = await s3
					.listObjectsV2({ Bucket: BUCKET_NAME, Prefix: FOLDER })
					.promise();

				// Filtra apenas arquivos de imagem (jpg, png, jpeg)
				const imageFiles = response.Contents.filter((file) =>
					file.Key.match(/\.(jpg|jpeg|png)$/i)
				);

				const imageURLs = imageFiles.map((file) => ({
					name: file.Key.split("/").pop(), // Nome do arquivo
					url: `https://${BUCKET_NAME}.s3.amazonaws.com/${file.Key}`, // URL pública
				}));

				setImages(imageURLs);
			} catch (error) {
				console.error("Erro ao listar imagens:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchImages();
	}, []);

	return (
		<ScrollView contentContainerStyle={styles.contentContainer}>
			<Text style={styles.title}>Imagens do S3</Text>

			{loading ? (
				<ActivityIndicator size="large" color="#0000ff" />
			) : (
				images.map((image, index) => (
					<View key={index} style={styles.imageContainer}>
						<Text style={styles.imageTitle}>{image.name}</Text>
						<Image source={{ uri: image.url }} style={styles.image} />
					</View>
				))
			)}

			<Pressable
				style={[styles.botao, styles.botaoVoltar]}
				onPress={() => navigation.goBack()}
			>
				<Text style={styles.textoBotao}>Voltar</Text>
			</Pressable>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	contentContainer: {
		padding: 20,
		alignItems: "center",
	},
	title: {
		fontSize: 24,
		marginBottom: 20,
		fontWeight: "bold",
		textAlign: "center",
	},
	imageContainer: {
		marginBottom: 20,
		alignItems: "center",
		width: "100%",
	},
	imageTitle: {
		marginBottom: 10,
		fontSize: 16,
		fontWeight: "bold",
	},
	image: {
		width: 300,
		height: 200,
		resizeMode: "cover",
		borderRadius: 10,
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
