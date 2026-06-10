import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/ui/app-header';
import LoadingOverlay from '../components/ui/loading-overlay';
import { useAppContext } from './_GlobalContext';

function Calendar({ selectedDates, onToggleDate }: { selectedDates: string[]; onToggleDate: (d: string) => void }) {
  const [current, setCurrent] = useState(new Date());
  const { colors } = useAppContext();

  const startOfMonth = new Date(current.getFullYear(), current.getMonth(), 1);
  const endOfMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0);
  const startWeekDay = startOfMonth.getDay();

  const days: Array<(number | null)> = [];
  for (let i = 0; i < startWeekDay; i++) days.push(null);
  for (let d = 1; d <= endOfMonth.getDate(); d++) days.push(d);

  const monthLabel = current.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  const prev = () => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  const next = () => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1));

  const weekdayLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  return (
    <View style={{ padding: 12 }}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={prev} style={styles.calendarNav}>
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.calendarMonth, { color: colors.text }]}>{monthLabel}</Text>
        <TouchableOpacity onPress={next} style={styles.calendarNav}>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {weekdayLabels.map((w, index) => (
          <Text key={`${w}-${index}`} style={[styles.weekday, { color: colors.subtitle }]}> 
            {w}
          </Text>
        ))}
      </View>

      <View style={styles.dayGrid}>
        {days.map((d, i) => {
          if (d === null) return <View key={i} style={styles.dayCell} />;
          const date = new Date(current.getFullYear(), current.getMonth(), d);
          const iso = date.toISOString().slice(0, 10);
          const selected = selectedDates.includes(iso);
          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.dayCell,
                selected ? { backgroundColor: colors.primary, borderRadius: 18 } : {},
              ]}
              onPress={() => onToggleDate(iso)}
            >
              <Text style={[styles.dayText, { color: selected ? colors.avatarText : colors.text }]}>{d}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function CreateScreen() {
  const router = useRouter();
  const { user, colors, criarEnquete, groups } = useAppContext();

  const [title, setTitle] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>(['Churrasco do Rafa', 'Bar da Esquina']);
  const [newLocation, setNewLocation] = useState('');
  const [weighted, setWeighted] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(groups[0]?.id || null);
  const [isCreating, setIsCreating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedGroupId && groups.length > 0) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  const selectedGroup = groups.find((group) => group.id === selectedGroupId) || null;

  const toggleDate = (iso: string) => {
    setSelectedDates((prev) => (prev.includes(iso) ? prev.filter((d) => d !== iso) : [...prev, iso]));
  };

  const addLocation = () => {
    const v = newLocation.trim();
    if (!v) return;
    setLocations((p) => [...p, v]);
    setNewLocation('');
  };

  const removeLocation = (idx: number) => setLocations((p) => p.filter((_, i) => i !== idx));

  const handleCreate = async () => {
    if (!title.trim()) {
      setValidationError('Informe o tema da enquete.');
      return;
    }

    if (selectedDates.length === 0) {
      setValidationError('Selecione ao menos uma data sugerida.');
      return;
    }

    if (locations.length === 0) {
      setValidationError('Adicione ao menos um local para a resenha.');
      return;
    }

    if (!selectedGroupId) {
      setValidationError('Escolha um grupo para enviar a enquete.');
      return;
    }

    setValidationError(null);
    setIsCreating(true);
    try {
      await criarEnquete(title, locations, selectedDates, weighted, selectedGroupId);
      router.replace('/');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <AppHeader title="Nova Enquete" showBack />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.label, { color: colors.subtitle }]}>TEMA DA RESENHA</Text>
        <TextInput
          placeholder="Ex: Churrasco de Fim de Ano"
          placeholderTextColor={colors.subtitle}
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.menuButtonBg, color: colors.text }]}
          value={title}
          onChangeText={(value) => {
            setValidationError(null);
            setTitle(value);
          }}
        />

        {validationError ? (
          <Text style={[styles.validationText, { color: '#DC2626' }]}>{validationError}</Text>
        ) : null}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>DATAS SUGERIDAS <Text style={{ fontSize: 12, color: colors.subtitle }}>  Selecione Múltiplas</Text></Text>

        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.menuButtonBg }]}>
          <Calendar selectedDates={selectedDates} onToggleDate={toggleDate} />

          <View style={styles.selectedRow}>
            {selectedDates.map((iso) => {
              const d = new Date(iso);
              const label = `${d.getDate()} ${d.toLocaleString('pt-BR', { month: 'short' })}`;
              return (
                <View key={iso} style={[styles.chip, { backgroundColor: colors.menuButtonBg }]}> 
                  <Text style={{ color: colors.text }}>{label}</Text>
                  <TouchableOpacity onPress={() => toggleDate(iso)} style={{ marginLeft: 8 }}>
                    <Ionicons name="close-circle" size={16} color={colors.subtitle} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={[styles.label, { color: colors.subtitle }]}>LOCAIS SUGERIDOS</Text>
        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.menuButtonBg }]}>
          {locations.map((loc, i) => (
            <View key={i} style={[styles.locationRow, { borderBottomColor: colors.menuButtonBg }]}> 
              <View style={styles.locationLeft}>
                <Ionicons name="location-outline" size={18} color={colors.text} />
                <Text style={[styles.locationText, { color: colors.text }]}>{loc}</Text>
              </View>
              <TouchableOpacity onPress={() => removeLocation(i)}>
                <Ionicons name="close" size={18} color={colors.subtitle} />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={[styles.addLocationBox, { borderColor: colors.menuButtonBg }]} onPress={addLocation}>
            <Text style={[styles.addLocationText, { color: colors.primary }]}>+ ADICIONAR LOCAL</Text>
          </TouchableOpacity>

          <TextInput
            placeholder="Novo local"
            placeholderTextColor={colors.subtitle}
            value={newLocation}
            onChangeText={setNewLocation}
            style={[styles.input, { marginTop: 12, backgroundColor: colors.background, borderColor: colors.menuButtonBg, color: colors.text }]}
          />
        </View>

        <Text style={[styles.label, { color: colors.subtitle }]}>CONFIGURAÇÕES AVANÇADAS</Text>
        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.menuButtonBg }]}> 
          <View style={styles.advRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.advTitle, { color: colors.text }]}>Votação Ponderada</Text>
              <Text style={[styles.advSubtitle, { color: colors.subtitle }]}>Usar o score dos membros como peso no voto.</Text>
            </View>
            <Switch value={weighted} onValueChange={setWeighted} thumbColor={weighted ? colors.primary : undefined} />
          </View>
        </View>

        <Text style={[styles.label, { color: colors.subtitle }]}>GRUPO DESTINO</Text>
        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.menuButtonBg }]}> 
          {groups.length === 0 ? (
            <Text style={[styles.groupHint, { color: colors.subtitle }]}>Crie um grupo primeiro para escolher onde enviar a enquete.</Text>
          ) : (
            groups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.groupOption,
                  selectedGroupId === group.id
                    ? { borderColor: colors.primary, backgroundColor: colors.menuButtonBg }
                    : { borderColor: colors.menuButtonBg, backgroundColor: colors.card },
                ]}
                onPress={() => setSelectedGroupId(group.id)}
              >
                <View>
                  <Text style={[styles.groupOptionTitle, { color: colors.text }]}>{group.name}</Text>
                  <Text style={[styles.groupOptionSubtitle, { color: colors.subtitle }]}>{group.members.length} membros</Text>
                </View>
                {selectedGroupId === group.id && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {selectedGroup && (
          <Text style={[styles.groupHint, { color: colors.subtitle, marginBottom: 18 }]}>Enquete será enviada para o grupo “{selectedGroup.name}”.</Text>
        )}

        <TouchableOpacity style={[styles.createButton, { backgroundColor: colors.primary }]} onPress={handleCreate}>
          <Text style={[styles.createButtonText, { color: colors.avatarText }]}>CRIAR ENQUETE</Text>
        </TouchableOpacity>
      </ScrollView>
      <LoadingOverlay visible={isCreating} message="Carregando..." />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' },
  input: { height: 48, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '900', marginBottom: 12 },
  panel: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 18 },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  calendarNav: { padding: 8 },
  calendarMonth: { fontWeight: '800' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 6, marginBottom: 8 },
  weekday: { width: 32, textAlign: 'center', fontSize: 12, fontWeight: '700' },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: `${100 / 7}%`, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: 14, fontWeight: '700' },
  selectedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  validationText: { marginBottom: 10, fontSize: 13, fontWeight: '700' },
  groupHint: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  groupOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
  groupOptionTitle: { fontSize: 15, fontWeight: '900', marginBottom: 4 },
  groupOptionSubtitle: { fontSize: 13, fontWeight: '600' },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  locationLeft: { flexDirection: 'row', alignItems: 'center' },
  locationText: { marginLeft: 10, fontWeight: '700' },
  addLocationBox: { borderWidth: 1, padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  addLocationText: { fontWeight: '800' },
  advRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  advTitle: { fontWeight: '900' },
  advSubtitle: { marginTop: 6 },
  createButton: { paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  createButtonText: { fontWeight: '900' },
});
