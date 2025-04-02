// import React, { useState } from "react";
// import { View, Button, Image, Platform, Alert, StyleSheet } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import * as FileSystem from "expo-file-system";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { storage } from "../firebaseConfig"; // Certifique-se de configurar o Firebase corretamente

// const ListarVideo = () => {
// 	return (
// 		<View style={styles.container}>
// 			<Text>Listar Videos</Text>
// 		</View>
// 	);
// };

// const styles = StyleSheet.create({
// 	container: {
// 		flex: 1,
// 		justifyContent: "center",
// 		padding: 16,
// 	},
// 	image: {
// 		width: 200,
// 		height: 200,
// 		marginTop: 20,
// 	},
// });

// export default ListarVideo;

// import React, { useState, useRef } from "react";
// import { StyleSheet, View, Button } from "react-native";
// import { Video } from "expo-av";

// const videoSource = {
// 	uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
// };

// export default function ListarVideo() {
// 	const videoRef = useRef(null);
// 	const [isPlaying, setIsPlaying] = useState(true);

// 	const handlePlayPause = () => {
// 		if (isPlaying) {
// 			videoRef.current.pauseAsync();
// 		} else {
// 			videoRef.current.playAsync();
// 		}
// 		setIsPlaying(!isPlaying);
// 	};

// 	return (
// 		<View style={styles.contentContainer}>
// 			<Video
// 				ref={videoRef}
// 				style={styles.video}
// 				source={videoSource}
// 				useNativeControls
// 				resizeMode="contain"
// 				isLooping
// 				shouldPlay={isPlaying}
// 			/>
// 			<View style={styles.controlsContainer}>
// 				<Button
// 					title={isPlaying ? "Pause" : "Play"}
// 					onPress={handlePlayPause}
// 				/>
// 			</View>
// 		</View>
// 	);
// }

// const styles = StyleSheet.create({
// 	contentContainer: {
// 		flex: 1,
// 		padding: 10,
// 		alignItems: "center",
// 		justifyContent: "center",
// 		paddingHorizontal: 50,
// 	},
// 	video: {
// 		width: 350,
// 		height: 275,
// 	},
// 	controlsContainer: {
// 		padding: 10,
// 	},
// });
import React, { useState, useEffect, useRef } from "react";
import {
	StyleSheet,
	View,
	ScrollView,
	Button,
	Text,
	Platform,
	Pressable,
} from "react-native";
import { Video } from "expo-av";
import { storage, ref, getDownloadURL } from "../firebaseConfig"; // Certifique-se de ter configurado isso corretamente

export default function ListarVideos({ navigation }) {
	const [videos, setVideos] = useState([]);
	const [loading, setLoading] = useState(true);
	const videoRefs = useRef([]);

	useEffect(() => {
		const fetchVideos = async () => {
			const videoNames = [
				"Captura de tela.mp4",
				"Tela HTML e CSS.mp4",
				"Tela HTML.mp4",
				"gincana.mp4",
			]; // Adicione os nomes dos seus vídeos corretamente
			try {
				const videoURLs = await Promise.all(
					videoNames.map(async (name) => {
						const videoRef = ref(storage, `videos/${name}`); // Caminho relativo dentro do bucket
						const url = await getDownloadURL(videoRef); // Obtém a URL pública
						return { name, url };
					})
				);
				setVideos(videoURLs);
				setLoading(false); // Definindo o estado de carregamento como falso após carregar os vídeos
			} catch (error) {
				console.error("Erro ao carregar vídeos:", error);
			}
		};

		fetchVideos();
	}, []);

	const playVideo = (index) => {
		videoRefs.current.forEach((videoRef, idx) => {
			if (videoRef && idx !== index) {
				videoRef.pauseAsync();
			}
		});
		videoRefs.current[index]?.playAsync();
	};

	return (
		<ScrollView contentContainerStyle={styles.contentContainer}>
			{loading ? (
				<Text>Carregando vídeos...</Text>
			) : (
				videos.map((video, index) => (
					<View key={index} style={styles.videoContainer}>
						<Text style={styles.videoTitle}>Vídeo {index + 1}</Text>
						<Video
							ref={(el) => (videoRefs.current[index] = el)}
							source={{ uri: video.url }}
							style={styles.video}
							resizeMode="contain"
							useNativeControls
							isLooping={false}
							shouldPlay={false} // Não toca automaticamente
							onError={(error) => {
								console.error(
									`Erro ao carregar vídeo ${index + 1}: `,
									error
								);
							}}
							// onPlaybackStatusUpdate={(status) => {
							// 	if (
							// 		Platform.OS === "android" &&
							// 		!status.isPlaying
							// 	) {
							// 		// Pode ajustar para diferentes comportamentos no Android
							// 		// console.log(
							// 		// 	`Status do vídeo ${index + 1}:`,
							// 		// 	status
							// 		// );
							// 	}
							// }}
						/>
						<Button title="Play" onPress={() => playVideo(index)} />
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
	videoContainer: {
		marginBottom: 20,
		alignItems: "center",
	},
	videoTitle: {
		marginBottom: 10,
		fontSize: 16,
	},
	video: {
		width: 350,
		height: 200,
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
