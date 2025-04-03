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
import AWS from "aws-sdk";
import { Video } from "expo-av";

// Configuração do AWS S3
AWS.config.update({
  accessKeyId: "ASIA6ODU7GZ6P6GRRQFF",
  secretAccessKey: "PgKjKaaJJi7wxy1OWaFZgY+P/8MNFkQjMAaJ1zs+",
  sessionToken: "IQoJb3JpZ2luX2VjEIb//////////wEaCXVzLXdlc3QtMiJHMEUCIQC62I3JeQnPY64MYPj3fdP8NmR9cYdCeZU7Sdm09DhE8gIgDzG0JDBh7DcpIDGo7ZP8L9WMg/f0kisFIUufxVHL31MquAII7///////////ARAAGgw5OTIzODI3NjA1NzIiDEgNKXe5J2o96qd6PSqMAmzXFxm0KmpqphsB7wVNHTqhoW+7JwvwxNDl4gqvldeh4g5x1boi4NuPWWoIsC/jd9jLKyWxMppd1hUkXe6uqh+pxwpjpCP3PLsdBfuxCb8W3ZNHshDbFcdH4/yG5my3ZfIIBZL+I0csZL9RM3J7CoZmXQsS96Q1t+ciIOMxEBRDM/Qk33ZUBFNqXyayitdKGnWaY8B4/NB9nZWiWrhD9nBtYnvR6g7a5nmPG9CuA2zkLDRikdvywBHjkaFfN8HwbsfHb3RjZLZeAvBzxPQ6YnDRmTY2G+AX/ouy2JaAF9+Mei3uihXQmVgXK9/UG4YUNx9y+Sxd2j7lgaMJZd+tKMTGmLJSM1+LjD8jVtcw9LC6vwY6nQEQuR6Efm2mmAkhDks0i0ScIoPWRnGiQonb9zARIXhY1N9MbwlKJdKoOoM0DdiYfI+vRvWzPM6HXBCz0qHueRvLeRpSBf1j77or23FHYEDAFrKlyyKdlNoOn/Y0qMamK4hNlbnLtv2glWL8bP+bYbbjMi+C/EQADylcY2PJ6rrGHnf5iPfSRSGmSqhUzRwtxcqN9U32vfyUUSI+hEHr",
  region: "us-east-1",
});

const s3 = new AWS.S3();
const bucketName = "bucket-app-firestore";

export default function ListarVideosPorCategoria({ navigation }) {
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Função para buscar todas as categorias (pastas) do S3
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await s3
        .listObjectsV2({
          Bucket: bucketName,
          Prefix: "videos/",
          Delimiter: "/",
        })
        .promise();

      // Extrai os nomes das pastas (categorias)
      const folders = response.CommonPrefixes.map((prefix) => {
        const folderPath = prefix.Prefix;
        return folderPath.replace("videos/", "").replace("/", "");
      });

      setCategories(folders);
      
      // Seleciona a primeira categoria por padrão, se existir
      if (folders.length > 0) {
        setCategory(folders[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias: ", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Função para buscar vídeos da categoria selecionada
  const fetchVideos = async () => {
    if (!category) return;
    
    setLoading(true);
    const prefix = `videos/${category}/`;

    try {
      const response = await s3
        .listObjectsV2({ 
          Bucket: bucketName, 
          Prefix: prefix 
        })
        .promise();

      // Filtra apenas arquivos (ignora pastas e arquivos vazios)
      const videoFiles = response.Contents?.filter(
        (file) => file.Size > 0 && !file.Key.endsWith("/")
      );

      const videoUrls = videoFiles?.map((file) => ({
        key: file.Key,
        name: file.Key.split("/").pop(),
        url: `https://${bucketName}.s3.amazonaws.com/${encodeURI(file.Key)}`,
      })) || [];

      setVideos(videoUrls);
    } catch (error) {
      console.error("Erro ao carregar vídeos: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (category) {
      fetchVideos();
    }
  }, [category]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolha a Categoria</Text>

      {loadingCategories ? (
        <ActivityIndicator size="small" color="#0000ff" />
      ) : (
        <Picker
          selectedValue={category}
          style={styles.picker}
          onValueChange={(itemValue) => setCategory(itemValue)}
        >
          {categories.map((cat) => (
            <Picker.Item 
              key={cat} 
              label={cat.charAt(0).toUpperCase() + cat.slice(1)} 
              value={cat} 
            />
          ))}
        </Picker>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : videos.length === 0 ? (
          <Text style={styles.noVideosText}>
            Nenhum vídeo encontrado nesta categoria
          </Text>
        ) : (
          videos.map((video) => (
            <View key={video.key} style={styles.videoContainer}>
              <Text style={styles.videoTitle}>
                {video.name.replace(/\.[^/.]+$/, "")}
              </Text>
              <Video
                source={{ uri: video.url }}
                style={styles.video}
                resizeMode="contain"
                useNativeControls
                isLooping={false}
                shouldPlay={false}
                onError={(error) =>
                  console.error(`Erro ao carregar vídeo ${video.name}:`, error)
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
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: 'bold',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
    backgroundColor: 'white',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  videoContainer: {
    marginBottom: 25,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  video: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  noVideosText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  botao: {
    padding: 15,
    backgroundColor: "rgb(0, 0, 120)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    borderRadius: 8,
    width: '100%',
  },
  textoBotao: {
    color: "white",
    fontSize: 18,
    fontWeight: '600',
  },
  botaoVoltar: {
    backgroundColor: "#333",
  },
});