import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Dimensions, Image, Modal, Pressable, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/ui/app-header';
import { useAppContext } from '../_GlobalContext';

const { width, height } = Dimensions.get('window');

export default function AlbumScreen() {
  const { albumPosts, setAlbumPosts, colors } = useAppContext();
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);

  const addPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      try {
        const uri = result.assets[0].uri;
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
        const dataUri = `data:image/jpeg;base64,${base64}`;
        setAlbumPosts([{ id: Math.random().toString(), uri: dataUri }, ...albumPosts]);
      } catch (error) {
        console.error('Erro ao processar foto:', error);
        setAlbumPosts([{ id: Math.random().toString(), uri: result.assets[0].uri }, ...albumPosts]);
      }
    }
  };

  const totalFotos = albumPosts.length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingBottom: 18 }]}> 
      <StatusBar barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <AppHeader title="Álbum Geral" showBack />

      <View style={[styles.topNav, { backgroundColor: colors.card, borderBottomColor: colors.menuButtonBg }]}> 
        <View style={styles.titleGroup}>
          <Text style={styles.headerTitle}>Resenha Score</Text>
          <Text style={styles.headerSubtitle}>Colecione momentos com seu grupo</Text>
        </View>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={addPhoto}>
          <Text style={[styles.plusIcon, { color: colors.avatarText }]}>+</Text>
          <Text style={[styles.addBtnText, { color: colors.avatarText }]}>ADICIONAR{`\n`}FOTOS</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
        <View style={styles.albumInfoRow}>
          <View style={[styles.badge, { backgroundColor: colors.menuButtonBg }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>COMMUNITY ALBUM</Text>
          </View>
          <Text style={[styles.photoCounter, { color: colors.subtitle }]}>• {totalFotos} {totalFotos === 1 ? 'Foto Compartilhada' : 'Fotos Compartilhadas'}</Text>
        </View>

        <Text style={[styles.mainTitle, { color: colors.text }]}>Capture o <Text style={[styles.pulse, { color: colors.primary }]}>Momento.</Text></Text>

        <View style={styles.photoGrid}>
          {albumPosts.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderColor: colors.menuButtonBg }]}>
              <Text style={[styles.emptyText, { color: colors.subtitle }]}>Toque no botão + para começar seu álbum!</Text>
            </View>
          ) : (
            albumPosts.map((item) => (
              <TouchableOpacity key={item.id} style={styles.card} onPress={() => { setSelectedImg(item.uri); setViewerVisible(true); }}>
                <Image source={{ uri: item.uri }} style={styles.img} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <Modal visible={viewerVisible} transparent animationType="fade">
        <View style={styles.viewerContainer}>
          <Pressable style={styles.viewerOverlay} onPress={() => setViewerVisible(false)} />
          <TouchableOpacity style={[styles.closeViewer, { backgroundColor: colors.card }]} onPress={() => setViewerVisible(false)}>
            <Text style={[styles.closeText, { color: colors.text }]}>✕ FECHAR</Text>
          </TouchableOpacity>
          {selectedImg && <Image source={{ uri: selectedImg }} style={styles.fullImage} resizeMode="contain" />}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  topNav: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 18, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  titleGroup: { flex: 1 },
  headerTitle: { color: '#0F1724', fontSize: 20, fontWeight: '900' },
  headerSubtitle: { color: '#64748B', fontSize: 14, marginTop: 4 },
  addBtn: { flexDirection: 'row', backgroundColor: '#0F41D4', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, alignItems: 'center', elevation: 3 },
  plusIcon: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', marginRight: 10 },
  addBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', textAlign: 'center', lineHeight: 14 },
  scrollArea: { padding: 20, paddingBottom: 40 },
  albumInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  badge: { backgroundColor: '#E7F0FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { color: '#0F41D4', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  photoCounter: { color: '#64748B', fontSize: 14, marginLeft: 12 },
  mainTitle: { color: '#0F1724', fontSize: 38, fontWeight: '900', marginBottom: 30 },
  pulse: { color: '#0F41D4' },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: (width / 2) - 30, marginBottom: 20, height: 220, borderRadius: 22, overflow: 'hidden', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  img: { width: '100%', height: '100%', backgroundColor: '#E2E8F0' },
  emptyContainer: { width: '100%', padding: 40, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#E2E8F0' },
  emptyText: { color: '#64748B', fontSize: 16, textAlign: 'center' },
  viewerContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  viewerOverlay: { ...StyleSheet.absoluteFillObject },
  fullImage: { width: width * 0.95, height: height * 0.75, borderRadius: 22 },
  closeViewer: { position: 'absolute', top: 40, right: 20, zIndex: 10, backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, elevation: 6 },
  closeText: { color: '#0F1724', fontWeight: '900' },
});
