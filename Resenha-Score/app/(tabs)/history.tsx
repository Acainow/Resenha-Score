import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppContext } from '../GlobalContext';

export default function HistoryScreen() {
  // Puxamos as enquetes (todas criadas) e o score do contexto
  const { score, enquetes, confirmados, totalConvidados, tituloEnquete } = useAppContext();

  return (
    <SafeAreaView style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meu Histórico</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* SEÇÃO DA SUA PONTUAÇÃO (Limpo de dados falsos) */}
        <View style={styles.podiumSection}>
          <Text style={styles.sectionTitle}>🏆 Sua Pontuação</Text>
          <View style={styles.podiumContainer}>
            
            {/* 1º LUGAR (VOCÊ) */}
            <View style={styles.podiumItem}>
              <Text style={styles.emoji}>👑</Text>
              <Text style={styles.name}>Você</Text>
              <View style={[styles.bar, { height: 110, backgroundColor: '#FACC15' }]}>
                <Text style={styles.rankNumber}>1</Text>
                <Text style={styles.pointsText}>{score} pts</Text>
              </View>
            </View>

          </View>
        </View>

        {/* SEÇÃO DAS RESENHAS CRIADAS (HISTÓRICO COMPLETO) */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>🕰️ Histórico de Resenhas</Text>

          {(!enquetes || enquetes.length === 0) ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={40} color="#9CA3AF" />
              <Text style={styles.emptyText}>Nenhuma resenha criada ainda.</Text>
            </View>
          ) : (
            
            // AQUI ESTÃO OS CARDS DE TODAS AS ENQUETES
            enquetes.map((enquete: any, index: number) => {
              
              // Se é a enquete ativa atual, usa os valores do contexto. Senão, usa os salvos
              const isEnqueteAtual = enquete.status === 'ativa' && enquete.titulo === tituloEnquete;
              const total = isEnqueteAtual ? totalConvidados : (enquete.status === 'ativa' ? 10 : enquete.presentes);
              const confirmadosValue = isEnqueteAtual ? confirmados : (enquete.status === 'ativa' ? 0 : enquete.presentes);
              const porcentagem = total > 0 ? Math.round((confirmadosValue / total) * 100) : 0;

              return (
                <View key={index} style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  padding: 20,
                  borderLeftWidth: 8,
                  borderLeftColor: enquete.status === 'ativa' ? '#55FF99' : '#9CA3AF', // Verde para ativa, cinza para encerrada
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 5,
                  elevation: 3,
                  marginBottom: 20
                }}>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: enquete.status === 'ativa' ? '#004643' : '#6B7280' }}>
                      {enquete.status === 'ativa' ? '📅 ATIVA' : '🏁 FINALIZADA'}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
                      Criada em {enquete.dataCriacao}
                    </Text>
                  </View>

                  {/* O TÍTULO REAL DA ENQUETE */}
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 15 }}>
                    {enquete.titulo}
                  </Text>

                  {/* LOCAIS SUGERIDOS */}
                  {enquete.locais && enquete.locais.length > 0 && (
                    <View style={{ marginBottom: 15 }}>
                      <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 5 }}>
                        📍 Locais Sugeridos:
                      </Text>
                      {enquete.locais.map((local: string, idx: number) => (
                        <Text key={idx} style={{ fontSize: 13, color: '#6B7280', marginLeft: 10 }}>
                          • {local}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* DATAS SUGERIDAS */}
                  {enquete.datas && enquete.datas.length > 0 && (
                    <View style={{ marginBottom: 15 }}>
                      <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 5 }}>
                        📅 Datas Sugeridas:
                      </Text>
                      {enquete.datas.map((data: string, idx: number) => (
                        <Text key={idx} style={{ fontSize: 13, color: '#6B7280', marginLeft: 10 }}>
                          • {data}
                        </Text>
                      ))}
                    </View>
                  )}

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    
                    {/* BOLINHA DE PORCENTAGEM */}
                    <View style={{ 
                      width: 60, 
                      height: 60, 
                      borderRadius: 30, 
                      backgroundColor: enquete.status === 'ativa' ? '#F0F5F5' : '#F3F4F6', 
                      overflow: 'hidden', 
                      justifyContent: 'flex-end', 
                      marginRight: 15,
                      borderWidth: 2,
                      borderColor: enquete.status === 'ativa' ? '#E0E5EC' : '#E5E7EB'
                    }}>
                      <View style={{ 
                        width: '100%', 
                        height: `${porcentagem}%`, 
                        backgroundColor: enquete.status === 'ativa' ? '#55FF99' : '#9CA3AF'
                      }} />
                      <View style={{ position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#1A1A1A' }}>
                          {porcentagem}%
                        </Text>
                      </View>
                    </View>

                    {/* TEXTOS AO LADO DA BOLINHA */}
                    <View>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' }}>
                        {enquete.status === 'ativa' ? 'Aguardando Votos' : 'Presença Final'}
                      </Text>
                      <Text style={{ fontSize: 14, color: '#666' }}>
                        {enquete.status === 'ativa' ? 'Enquete em andamento' : `${confirmados} confirmados`}
                      </Text>
                    </View>

                  </View>
                </View>
              );
            })
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { backgroundColor: '#FFF', paddingVertical: 20, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#1A1A1A' },
  scroll: { paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1A1A1A', marginBottom: 20 },
  
  // PÓDIO
  podiumSection: { marginTop: 25, paddingHorizontal: 20 },
  podiumContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', height: 160 },
  podiumItem: { alignItems: 'center', marginHorizontal: 10 },
  emoji: { fontSize: 24, marginBottom: 5 },
  name: { fontSize: 12, fontWeight: 'bold', color: '#4B5563', marginBottom: 5 },
  bar: { width: 75, borderTopLeftRadius: 10, borderTopRightRadius: 10, justifyContent: 'center', alignItems: 'center' },
  rankNumber: { color: '#FFF', fontWeight: '900', fontSize: 22 },
  pointsText: { color: '#1A1A1A', fontSize: 10, fontWeight: 'bold' },

  // LISTA DE HISTÓRICO
  historySection: { marginTop: 40, paddingHorizontal: 20 },
  emptyState: { alignItems: 'center', marginTop: 20, backgroundColor: '#F3F4F6', padding: 30, borderRadius: 20 },
  emptyText: { color: '#9CA3AF', marginTop: 10, fontSize: 14 }
});