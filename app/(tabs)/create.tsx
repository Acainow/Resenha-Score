import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LoadingOverlay from '../../components/ui/loading-overlay';
import { useAppContext } from '../GlobalContext';

export default function CreateScreen() {
  const router = useRouter();
  const { setTituloEnquete, setConfirmados, setTotalConvidados, setLocais: setContextLocais, setDatas: setContextDatas, criarEnquete, members } = useAppContext(); 

  // Estados para as informações que você quer escolher
  const [nomeEvento, setNomeEvento] = useState('');
  const [locais, setLocais] = useState<string[]>([]);
  const [novoLocal, setNovoLocal] = useState('');
  const [datas, setDatas] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [ponderada, setPonderada] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 550,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Sistema de Calendário
  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dataFormatada = selectedDate.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
      if (!datas.includes(dataFormatada)) {
        setDatas([...datas, dataFormatada]);
      }
    }
  };

  const adicionarLocal = () => {
    if (novoLocal.trim()) {
      setLocais([...locais, novoLocal]);
      setNovoLocal('');
    }
  };

  const removerLocal = (index: number) => {
    setLocais(locais.filter((_, i) => i !== index));
  };

  const removerData = (index: number) => {
    setDatas(datas.filter((_, i) => i !== index));
  };

  const lancarEnquete = () => {
    if (!nomeEvento) return;

    setIsLoading(true);
    setTimeout(() => {
      criarEnquete(nomeEvento, locais, datas, ponderada);
      setTituloEnquete(nomeEvento);
      setConfirmados(0);
      setTotalConvidados(10);
      setContextLocais(locais);
      setContextDatas(datas);
      setIsLoading(false);
      router.replace('/');
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#004643" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Resenha</Text>
        <View style={{ width: 32 }} />
      </View>

      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}> 
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          
          <View style={styles.progressRow}>
          <View style={styles.stepActive}><Text style={styles.stepTextActive}>1</Text></View>
          <Text style={styles.stepLabelActive}>DETALHES</Text>
          <View style={styles.line} />
          <View style={styles.stepInactive}><Text style={styles.stepTextInactive}>2</Text></View>
          <Text style={styles.stepLabelInactive}>REVISÃO</Text>
        </View>

        <Text style={styles.inputLabel}>NOME DO EVENTO</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: Churrasco de Domingo e Futebol"
          placeholderTextColor="#9CA3AF"
          value={nomeEvento}
          onChangeText={setNomeEvento}
        />

        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Opções de Votação</Text>
          <View style={styles.tagMultipla}><Text style={styles.tagText}>MÚLTIPLA ESCOLHA</Text></View>
        </View>

        {/* LOCAIS - Agora dinâmicos */}
        <View style={styles.cardBox}>
          <Text style={styles.cardBoxTitle}><Ionicons name="location" size={16} color="#B45309"/> Locais Sugeridos</Text>
          {locais.map((local, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemBg}><Text style={styles.itemText}>{local}</Text></View>
              <TouchableOpacity onPress={() => removerLocal(index)}>
                <Ionicons name="trash" size={20} color="#DC2626" style={{marginLeft: 10}}/>
              </TouchableOpacity>
            </View>
          ))}
          <TextInput 
            style={[styles.input, styles.inputLight]} 
            placeholder="Adicionar local..." 
            placeholderTextColor="#9CA3AF"
            value={novoLocal}
            onChangeText={setNovoLocal}
          />
          <TouchableOpacity style={styles.btnAddOutline} onPress={adicionarLocal}>
            <Text style={styles.btnAddOutlineText}>⊕ ADICIONAR LOCAL</Text>
          </TouchableOpacity>
        </View>

        {/* DATAS - Com Sistema de Calendário */}
        <View style={styles.cardBox}>
          <Text style={styles.cardBoxTitle}><Ionicons name="calendar" size={16} color="#047857"/> Datas Preferidas</Text>
          <View style={styles.datesRow}>
            {datas.map((data, index) => (
              <TouchableOpacity key={index} style={styles.dateChip} onPress={() => removerData(index)}>
                <Text style={styles.dateChipText}>{data}   ×</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.btnAddOutline} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.btnAddOutlineText}>⊕ ABRIR CALENDÁRIO</Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={onChangeDate}
              minimumDate={new Date()}
            />
          )}
        </View>

        <Text style={styles.inputLabel}>CONVIDAR GRUPO</Text>
        <View style={[styles.input, {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}]}>
          <Text style={{fontSize: 16, color: '#1F2937'}}>Futebol de Sexta</Text>
          <Ionicons name="chevron-down" size={20} color="#6B7280" />
        </View>

        <View style={styles.bottomBox}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleTitle}>Votação Ponderada</Text>
              <Text style={styles.toggleSub}>Membros frequentes têm peso 2x</Text>
            </View>
            <Switch 
              trackColor={{ false: '#D1D5DB', true: '#6EFFA8' }} 
              thumbColor={ponderada ? '#004643' : '#f4f3f4'} 
              onValueChange={setPonderada} 
              value={ponderada} 
            />
          </View>
          
          <TouchableOpacity style={styles.btnLaunch} onPress={lancarEnquete}>
            <Text style={styles.btnLaunchText}>Lançar Enquete 🚀</Text>
          </TouchableOpacity>
        </View>

        <LoadingOverlay
          visible={isLoading}
          message="Carregando"
        />
          </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF' },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#004643' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#D97706', justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20, paddingBottom: 50 },
  animatedContainer: { flex: 1 },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  stepActive: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#004643', justifyContent: 'center', alignItems: 'center' },
  stepTextActive: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  stepLabelActive: { fontSize: 12, fontWeight: '800', color: '#004643', marginLeft: 8 },
  line: { width: 40, height: 2, backgroundColor: '#D1D5DB', marginHorizontal: 10 },
  stepInactive: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  stepTextInactive: { color: '#9CA3AF', fontSize: 12, fontWeight: 'bold' },
  stepLabelInactive: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', marginLeft: 8 },
  inputLabel: { fontSize: 12, fontWeight: '800', color: '#4B5563', letterSpacing: 1, marginBottom: 10, marginTop: 10 },
  input: { backgroundColor: '#E5E7EB', borderRadius: 12, padding: 18, fontSize: 16, color: '#1A1A1A', marginBottom: 25 },
  inputLight: { backgroundColor: '#F3F4F6', marginBottom: 15 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  tagMultipla: { backgroundColor: '#6EFFA8', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 15 },
  tagText: { fontSize: 10, fontWeight: '900', color: '#004643' },
  cardBox: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 25, elevation: 1 },
  cardBoxTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 15 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  itemBg: { flex: 1, backgroundColor: '#F3F4F6', padding: 15, borderRadius: 12 },
  itemText: { fontSize: 15, color: '#1A1A1A' },
  btnAddOutline: { borderWidth: 1, borderColor: '#10B981', borderStyle: 'dashed', borderRadius: 12, padding: 15, alignItems: 'center' },
  btnAddOutlineText: { color: '#10B981', fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  datesRow: { flexDirection: 'row', marginBottom: 15, flexWrap: 'wrap' },
  dateChip: { backgroundColor: '#E5E7EB', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10, marginRight: 10, marginBottom: 10 },
  dateChipText: { color: '#4B5563', fontWeight: '600', fontSize: 14 },
  bottomBox: { backgroundColor: '#F1F5F9', padding: 20, borderRadius: 20, marginTop: 10 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  toggleTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  toggleSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  btnLaunch: { backgroundColor: '#004643', padding: 20, borderRadius: 15, alignItems: 'center' },
  btnLaunchText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});