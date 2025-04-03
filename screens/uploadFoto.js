import React, { useState } from "react";
import { Pressable, Image, View, Text, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AWS from "aws-sdk";


AWS.config.update({
  accessKeyId: "ASIA6ODU7GZ6P6GRRQFF",
  secretAccessKey: "PgKjKaaJJi7wxy1OWaFZgY+P/8MNFkQjMAaJ1zs+",
  sessionToken: "IQoJb3JpZ2luX2VjEIb//////////wEaCXVzLXdlc3QtMiJHMEUCIQC62I3JeQnPY64MYPj3fdP8NmR9cYdCeZU7Sdm09DhE8gIgDzG0JDBh7DcpIDGo7ZP8L9WMg/f0kisFIUufxVHL31MquAII7///////////ARAAGgw5OTIzODI3NjA1NzIiDEgNKXe5J2o96qd6PSqMAmzXFxm0KmpqphsB7wVNHTqhoW+7JwvwxNDl4gqvldeh4g5x1boi4NuPWWoIsC/jd9jLKyWxMppd1hUkXe6uqh+pxwpjpCP3PLsdBfuxCb8W3ZNHshDbFcdH4/yG5my3ZfIIBZL+I0csZL9RM3J7CoZmXQsS96Q1t+ciIOMxEBRDM/Qk33ZUBFNqXyayitdKGnWaY8B4/NB9nZWiWrhD9nBtYnvR6g7a5nmPG9CuA2zkLDRikdvywBHjkaFfN8HwbsfHb3RjZLZeAvBzxPQ6YnDRmTY2G+AX/ouy2JaAF9+Mei3uihXQmVgXK9/UG4YUNx9y+Sxd2j7lgaMJZd+tKMTGmLJSM1+LjD8jVtcw9LC6vwY6nQEQuR6Efm2mmAkhDks0i0ScIoPWRnGiQonb9zARIXhY1N9MbwlKJdKoOoM0DdiYfI+vRvWzPM6HXBCz0qHueRvLeRpSBf1j77or23FHYEDAFrKlyyKdlNoOn/Y0qMamK4hNlbnLtv2glWL8bP+bYbbjMi+C/EQADylcY2PJ6rrGHnf5iPfSRSGmSqhUzRwtxcqN9U32vfyUUSI+hEHr",
  region: "us-east-1",
});


const S3_BUCKET = "bucket-app-firestore";
const s3 = new AWS.S3();

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
					navigation.navigate("ListarImagens"); // Certifique-se de que está navegando corretamente para a tela
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