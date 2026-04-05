import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
// Importação dos Ícones do Expo
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppContext } from '../GlobalContext';

const { width, height } = Dimensions.get('window');

export default function AlbumScreen() {
  const { albumPosts, setAlbumPosts } = useAppContext();
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);

  // Contabilizador Real
  const FOTOS_TOTAIS = albumPosts.length; 

  const addPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      try {
        const uri = result.assets[0].uri;
        // Converter imagem para base64 para persistência
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: 'base64',
        });
        const dataUri = `data:image/jpeg;base64,${base64}`;
        setAlbumPosts([{ id: Math.random().toString(), uri: dataUri }, ...albumPosts]);
      } catch (error) {
        console.error('Erro ao processar foto:', error);
        // Fallback: salva URI original se converter falhar
        setAlbumPosts([{ id: Math.random().toString(), uri: result.assets[0].uri }, ...albumPosts]);
      }
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* HEADER GERAL SEM SETA */}
        <View style={styles.topNav}>
          <View style={styles.titleGroup}>
            <Text style={styles.headerTitle}>Álbum Geral</Text>
            <Text style={styles.headerSubtitle}>Resenha Score</Text>
          </View>

          <TouchableOpacity style={styles.addBtn} onPress={addPhoto}>
            <Text style={styles.plusIcon}>+</Text>
            <Text style={styles.addBtnText}>ADICIONAR{"\n"}FOTOS</Text>
          </TouchableOpacity>

          {/* CÍRCULO DE PERFIL ATUALIZADO */}
          <View style={styles.profileCircle}>
             {/* Ícone de Usuário Genérico no lugar dos olhos */}
             <FontAwesome5 name="user-alt" size={20} color="#666" />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollArea}>
          
          {/* CONTABILIZADOR EM ESCALA VISÍVEL */}
          <View style={styles.albumInfoRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>COMMUNITY ALBUM</Text>
            </View>
            <Text style={styles.photoCounter}>
              • {FOTOS_TOTAIS} {FOTOS_TOTAIS === 1 ? 'Foto Compartilhada' : 'Fotos Compartilhadas'}
            </Text>
          </View>

          <Text style={styles.mainTitle}>Capture o <Text style={styles.pulse}>Momento.</Text></Text>

          {/* GRID DE FOTOS */}
          <View style={styles.photoGrid}>
            {albumPosts.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.card} 
                onPress={() => {
                  setSelectedImg(item.uri);
                  setViewerVisible(true);
                }}
              >
                <Image source={{ uri: item.uri }} style={styles.img} />
              </TouchableOpacity>
            ))}
            
            {/* Mensagem visual se o álbum estiver vazio */}
            {albumPosts.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Toque no botão + para começar seu álbum!</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* MODAL PARA OLHAR DE PERTO */}
        <Modal visible={viewerVisible} transparent animationType="fade">
          <View style={styles.viewerContainer}>
            <Pressable style={styles.viewerOverlay} onPress={() => setViewerVisible(false)} />
            <TouchableOpacity style={styles.closeViewer} onPress={() => setViewerVisible(false)}>
              <Text style={styles.closeText}>✕ FECHAR</Text>
            </TouchableOpacity>
            {selectedImg && (
              <Image source={{ uri: selectedImg }} style={styles.fullImage} resizeMode="contain" />
            )}
          </View>
        </Modal>

      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  topNav: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 18, backgroundColor: '#0A0A0A' },
  titleGroup: { flex: 1 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { color: '#666', fontSize: 14 },
  addBtn: { flexDirection: 'row', backgroundColor: '#006437', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, alignItems: 'center', marginRight: 15 },
  plusIcon: { color: '#FFF', fontSize: 22, marginRight: 8, fontWeight: 'bold' },
  addBtnText: { color: '#FFF', fontSize: 11, fontWeight: '900', lineHeight: 12 },
  
  // ESTILO DO CÍRCULO DE PERFIL ATUALIZADO
  profileCircle: { 
    width: 45, 
    height: 45, 
    borderRadius: 22.5, 
    overflow: 'hidden', 
    borderWidth: 2, 
    borderColor: '#333', 
    backgroundColor: '#1A1A1A', // Fundo escuro para o ícone
    justifyContent: 'center', // Centraliza o ícone
    alignItems: 'center' 
  },
  profileImg: { width: '100%', height: '100%' },
  
  scrollArea: { paddingHorizontal: 20, paddingTop: 20 },
  albumInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  badge: { backgroundColor: '#143021', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  badgeText: { color: '#00D166', fontSize: 10, fontWeight: '900' },
  photoCounter: { color: '#999', fontSize: 16, marginLeft: 12, fontWeight: '600' },
  mainTitle: { color: '#FFF', fontSize: 38, fontWeight: '900', marginBottom: 30 },
  pulse: { color: '#00D166' },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: (width / 2) - 30, marginBottom: 20, height: 260, borderRadius: 22, overflow: 'hidden' },
  img: { width: '100%', height: '100%', backgroundColor: '#111' },
  emptyContainer: { width: '100%', padding: 40, alignItems: 'center' },
  emptyText: { color: '#444', textAlign: 'center', fontSize: 16 },
  viewerContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' },
  viewerOverlay: { ...StyleSheet.absoluteFillObject },
  fullImage: { width: width, height: height * 0.75 },
  closeViewer: { position: 'absolute', top: 60, right: 20, zIndex: 10, backgroundColor: '#222', padding: 12, borderRadius: 10 },
  closeText: { color: '#FFF', fontWeight: 'bold' }
});