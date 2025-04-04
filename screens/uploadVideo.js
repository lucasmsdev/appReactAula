import React, { useState } from "react";
import {
  View,
  Button,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  TextInput,
  Modal,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import AWS from "aws-sdk";
import s3 from '../awsConfig'


const S3_BUCKET = "bucket-app-firestore"; // Nome do bucket S3


export default function UploadVideo({ navigation }) {
  const [video, setVideo] = useState(null);
  const [category, setCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["video/*"],
        copyToCacheDirectory: true,
      });

      const asset =
        result.assets && result.assets.length > 0 ? result.assets[0] : result;

      if (asset && asset.uri) {
        setVideo({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || "video/mp4",
        });
        setModalVisible(true); // Abrir modal para inserir categoria
      } else {
        Alert.alert("Erro", "Nenhum vídeo selecionado.");
      }
    } catch (error) {
      console.error("Erro ao selecionar vídeo: ", error);
      Alert.alert("Erro", "Não foi possível selecionar o vídeo.");
    }
  };

  const uploadVideo = async () => {
    if (!video) {
      Alert.alert("Erro", "Por favor, selecione um vídeo.");
      return;
    }

    if (!category.trim()) {
      Alert.alert("Erro", "Por favor, insira um nome de categoria.");
      return;
    }

    try {
      setUploading(true);
      console.log("Iniciando upload do vídeo...", video);

      // Buscar o arquivo como blob
      const response = await fetch(video.uri);
      const blob = await response.blob();

      // Nome do arquivo no bucket, dentro da categoria escolhida
      const filePath = `videos/${category}/${Date.now()}_${video.name}`;

      // Parâmetros de upload
      const uploadParams = {
        Bucket: S3_BUCKET,
        Key: filePath,
        Body: blob,
        ContentType: video.type,
      };

      // Realizar upload
      s3.upload(uploadParams, (err, data) => {
        setUploading(false);
        if (err) {
          console.error("Erro no upload: ", err);
          Alert.alert("Erro", "Falha no envio do vídeo");
        } else {
          console.log("Vídeo enviado! URL: ", data.Location);
          Alert.alert("Sucesso", "Vídeo enviado com sucesso!");
          setVideo(null);
          setCategory("");
        }
      });
    } catch (error) {
      console.error("Erro no upload: ", error);
      Alert.alert("Erro", "Falha no envio do vídeo");
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

      {/* Modal para inserir categoria */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Digite o nome da categoria</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: matemática, geografia..."
              value={category}
              onChangeText={setCategory}
            />
            <Button
              title="Confirmar"
              onPress={() => setModalVisible(false)}
            />
          </View>
        </View>
      </Modal>

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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
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

