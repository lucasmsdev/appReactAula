import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	Pressable,
	ImageBackground,
	Modal,
	TextInput,
	Button,
	Alert,
} from "react-native";
import {
	collection,
	getDocs,
	getFirestore,
	doc,
	updateDoc,
	deleteDoc,
	Timestamp,
} from "@firebase/firestore";
import app from "../firebaseConfig";
import { format } from "date-fns";
import Icon from "react-native-vector-icons/MaterialIcons";

const ListarJogadores = ({ navigation }) => {
	const [jogadores, setJogadores] = useState([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [jogadorAtual, setJogadorAtual] = useState(null);
	const [nome, setNome] = useState("");
	const [altura, setAltura] = useState("");
	const [camisa, setCamisa] = useState("");
	const [nascimento, setNascimento] = useState("");

	useEffect(() => {
		const fetchJogadores = async () => {
			const db = getFirestore(app);
			const jogadoresCollection = collection(db, "real-madrid");
			const jogadoresSnapshot = await getDocs(jogadoresCollection);
			const jogadoresList = jogadoresSnapshot.docs.map((doc) => {
				const data = doc.data();
				const nascimentoDate = data.nasciment?.toDate(); // Converte o Timestamp do Firestore para um objeto Date
				const formattedDate = nascimentoDate
					? format(nascimentoDate, "dd/MM/yyyy")
					: "Data não disponível"; // Formata a data
				// const formattedDate = nascimento ? nascimento.toLocaleDateString() : 'Data não disponível';
				return {
					id: doc.id,
					nome: data.nome,
					altura: data.altura,
					camisa: data.camisa,
					nasciment: formattedDate,
				};
			});
			setJogadores(jogadoresList);
		};

		fetchJogadores();
	}, []);

	const editarJogador = (jogador) => {
		setJogadorAtual(jogador);
		setNome(jogador.nome);
		setAltura(jogador.altura);
		setCamisa(jogador.camisa);
		setModalVisible(true);
	};

	const salvarJogador = async () => {
		const db = getFirestore(app);
		const jogadorRef = doc(db, "real-madrid", jogadorAtual.id);

		// Converter a data de nascimento de string para Timestamp
		const [day, month, year] = nascimento.split("/");
		const nascimentoDate = new Date(`${year}-${month}-${day}T00:00:00`);
		const nascimentoTimestamp = Timestamp.fromDate(nascimentoDate);

		await updateDoc(jogadorRef, {
			nome,
			altura: parseFloat(altura),
			camisa,
			nasciment: nascimentoTimestamp,
		});

		const atualizarJogadores = jogadores.map((jogador) =>
			jogador.id === jogadorAtual.id
				? { ...jogador, nome, altura, camisa, nasciment: nascimento }
				: jogador
		);

		setJogadores(atualizarJogadores);
		setModalVisible(false);
	};

	const deletarJogador = async (id) => {
		const db = getFirestore(app);
		const jogadorRef = doc(db, "real-madrid", id);

		Alert.alert(
			"Confirmação",
			"Você tem certeza que deseja excluir este jogador?",
			[
				{
					text: "Cancelar",
					style: "cancel",
				},
				{
					text: "Excluir",
					onPress: async () => {
						await deleteDoc(jogadorRef);
						setJogadores(
							jogadores.filter((jogador) => jogador.id !== id)
						);
					},
					style: "destructive",
				},
			]
		);
	};

	const renderItem = ({ item }) => (
		<View style={styles.itemContainer}>
			<View style={styles.infoContainer}>
				<Text style={styles.nome}>{item.nome}</Text>
				<Text>Altura: {item.altura}m</Text>
				<Text>Número da camisa: {item.camisa}</Text>
				<Text>Nascimento: {item.nasciment}</Text>
			</View>
			<Pressable
				onPress={() => editarJogador(item)}
				style={styles.editButton}
			>
				<Icon name="edit" size={24} color="rgb(0, 0, 120)" />
			</Pressable>
			<Pressable
				onPress={() => deletarJogador(item.id)}
				style={styles.deleteButton}
			>
				<Icon name="delete" size={24} color="rgb(0, 0, 120)" />
			</Pressable>
		</View>
	);

	return (
		<ImageBackground
			source={require("../assets/estadio.jpg")}
			style={styles.background}
			resizeMode="cover"
		>
			<View style={styles.container}>
				<Text style={styles.titulo}>Jogadores do Real Madrid</Text>
				<FlatList
					showsVerticalScrollIndicator={false}
					showsHorizontalScrollIndicator={false}
					data={jogadores}
					renderItem={renderItem}
					keyExtractor={(item) => item.id}
				/>
				<Pressable
					style={styles.botao}
					onPress={() => navigation.goBack()}
				>
					<Text style={styles.textoBotao}>Voltar</Text>
				</Pressable>

				<Modal
					animationType="slide"
					transparent={true}
					visible={modalVisible}
					onRequestClose={() => setModalVisible(false)}
				>
					<View style={styles.modalContainer}>
						<View style={styles.modalView}>
							<Text style={styles.modalTitle}>
								Editar Jogador
							</Text>

							<TextInput
								style={styles.input}
								placeholder="Nome"
								value={nome}
								onChangeText={setNome}
							/>
							<TextInput
								style={styles.input}
								placeholder="Altura"
								value={altura}
								onChangeText={setAltura}
								keyboardType="numeric"
							/>
							<TextInput
								style={styles.input}
								placeholder="Número da Camisa"
								value={camisa}
								onChangeText={setCamisa}
							/>
							<TextInput
								style={styles.input}
								placeholder="Data de Nascimento (dd/mm/yyyy)"
								value={nascimento}
								onChangeText={setNascimento}
							/>

							<Button title="Salvar" onPress={salvarJogador} />
							<Button
								title="Cancelar"
								onPress={() => setModalVisible(false)}
								color="red"
							/>
						</View>
					</View>
				</Modal>
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
	},
	titulo: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		color: "#fff",
	},
	itemContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "#f9f9f9",
		padding: 15,
		borderBottomWidth: 1,
		borderBottomColor: "#ddd",
		marginBottom: 10,
		borderRadius: 10,
		shadowColor: "#000",
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 5,
	},
	infoContainer: {
		flex: 1,
	},
	nome: {
		fontSize: 20,
		fontWeight: "bold",
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
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.5)",
	},
	modalView: {
		width: 300,
		backgroundColor: "white",
		borderRadius: 10,
		padding: 20,
		shadowColor: "#000",
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 15,
	},
	editButton: {
		marginBottom: 10, // Adicionado para separar o botão de editar do botão de deletar
	},
	deleteButton: {},
	input: {
		width: "100%",
		padding: 10,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 5,
		marginBottom: 10,
	},
});

export default ListarJogadores;
