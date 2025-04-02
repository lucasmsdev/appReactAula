import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	Pressable,
	ImageBackground,
	Alert,
} from "react-native";
import {
	collection,
	addDoc,
	getFirestore,
	Timestamp,
} from "@firebase/firestore";
import app from "../firebaseConfig";
import bgImage from "../assets/estadio.jpg";

const AdicionarJogador = ({ navigation }) => {
	const [nome, setNome] = useState("");
	const [altura, setAltura] = useState("");
	const [camisa, setCamisa] = useState("");
	const [nascimento, setNascimento] = useState("");

	const addJogador = async () => {
		if (!nome || !altura || !camisa || !nascimento) {
			Alert.alert("Erro", "Por favor, preencha todos os campos.");
			return;
		}

		try {
			const db = getFirestore(app);
			const jogadoresCollection = collection(db, "real-madrid");

			// Converter a data de nascimento de string para Timestamp
			const [day, month, year] = nascimento.split("/");
			const nascimentoDate = new Date(`${year}-${month}-${day}T00:00:00`);
			const nascimentoTimestamp = Timestamp.fromDate(nascimentoDate);

			await addDoc(jogadoresCollection, {
				nome: nome,
				altura: parseFloat(altura), // Convertendo altura para float
				camisa: camisa, // Convertendo camisa para inteiro
				nasciment: nascimentoTimestamp, // Armazenando como Timestamp
			});

			Alert.alert("Sucesso", "Jogador adicionado com sucesso!");
			navigation.goBack();
		} catch (error) {
			console.error("Erro ao adicionar jogador: ", error);
			Alert.alert("Erro", "Ocorreu um erro ao adicionar o jogador.");
		}
	};

	return (
		<ImageBackground
			source={bgImage}
			style={styles.background}
			resizeMode="cover"
		>
			<View style={styles.container}>
				<Text style={styles.titulo}>Adicionar Novo Jogador</Text>

				<TextInput
					style={styles.input}
					placeholder="Nome"
					value={nome}
					onChangeText={setNome}
				/>
				<TextInput
					style={styles.input}
					placeholder="Altura (em metros)"
					value={altura}
					keyboardType="numeric"
					onChangeText={setAltura}
				/>
				<TextInput
					style={styles.input}
					placeholder="Número da Camisa"
					value={camisa}
					keyboardType="numeric"
					onChangeText={setCamisa}
				/>
				<TextInput
					style={styles.input}
					placeholder="Data de Nascimento (dd/mm/yyyy)"
					value={nascimento}
					onChangeText={setNascimento}
				/>

				<Pressable style={styles.botao} onPress={addJogador}>
					<Text style={styles.textoBotao}>Adicionar Jogador</Text>
				</Pressable>

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
		minWidth: "100%",
		padding: 15,
		marginVertical: 10,
		backgroundColor: "#fff",
		borderRadius: 10,
		fontSize: 16,
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

export default AdicionarJogador;
