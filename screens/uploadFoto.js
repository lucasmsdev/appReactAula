import React, { useState } from "react";
import { Pressable, Image, View, Text, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import s3 from "../awsConfig"; // Importa corretamente o S3

const S3_BUCKET = "bucket-app-firestore";

const UploadFoto = ({ navigation }) => {
  const [imageUri, setImageUri] = useState(null);

  const escolherImagem = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos da permissão para acessar suas fotos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!imageUri) {
      Alert.alert("Erro", "Nenhuma imagem selecionada.");
      return;
    }

    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const filename = `imagens/${Date.now()}.jpg`;

      const params = {
        Bucket: S3_BUCKET,
        Key: filename,
        Body: blob,
        ContentType: "image/jpeg",
      };

      s3.upload(params, (err, data) => {
        if (err) {
          console.error("Erro no upload:", err);
          Alert.alert("Erro", "Falha no envio da imagem.");
        } else {
          console.log("Imagem disponível em:", data.Location);
          Alert.alert("Sucesso", "Imagem salva com sucesso!");
          setImageUri(null);
        }
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      Alert.alert("Erro", "Falha no envio da imagem.");
    }
  };

  return (
    <View style={styles.container}>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.background} />}
      <Pressable style={styles.botao} onPress={escolherImagem}>
        <Text style={styles.textoBotao}>Escolher Imagem</Text>
      </Pressable>
      <Pressable style={styles.botao} onPress={uploadImage}>
        <Text style={styles.textoBotao}>Salvar Imagem</Text>
      </Pressable>
      <Pressable
				style={styles.botao}
				onPress={() => {
					navigation.navigate("ListarImagens");
				}}
			>
				<Text style={styles.textoBotao}>Listar Imagens</Text>
			</Pressable>
      <Pressable style={[styles.botao, styles.botaoVoltar]} onPress={() => navigation.goBack()}>
        <Text style={styles.textoBotao}>Voltar</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    width: 300,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    resizeMode: "cover",
    borderRadius: 10,
    marginBottom: 20,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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

export default UploadFoto;
