import * as SecureStore from 'expo-secure-store';
import React, { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from 'react';

// --- DEFINIÇÃO DOS TIPOS ---
// Como é o formato de uma votação
export interface Voto {
  enqueteId: string;
  memberId: string;
  tipo: 'sim' | 'nao' | 'talvez';
  timestamp: number;
}

// Como é o formato de uma enquete?
export interface Enquete {
  id: string;
  dataCriacao: string;
  dataEncerramento?: string;
  titulo: string;
  presentes: number;
  fotos: number;
  cor: string;
  locais: string[];
  datas: string[];
  status: 'ativa' | 'encerrada';
  ponderada: boolean;
}

// Como é o formato de um membro do grupo?
export interface Member {
  id: string;
  name: string;
  points: number;
}

// Tudo o que nosso Contexto vai guardar e distribuir pelo app
interface AppContextProps {
  // Estado da Resenha Atual
  score: number;
  setScore: Dispatch<SetStateAction<number>>;
  tituloEnquete: string;
  setTituloEnquete: Dispatch<SetStateAction<string>>;
  confirmados: number;
  setConfirmados: Dispatch<SetStateAction<number>>;
  totalConvidados: number;
  setTotalConvidados: Dispatch<SetStateAction<number>>;
  locais: string[];
  setLocais: Dispatch<SetStateAction<string[]>>;
  datas: string[];
  setDatas: Dispatch<SetStateAction<string[]>>;
  ponderada: boolean;
  setPonderada: Dispatch<SetStateAction<boolean>>;

  // Estado do Álbum
  albumPosts: any[];
  setAlbumPosts: Dispatch<SetStateAction<any[]>>;

  // Estado de Votação
  votosRegistrados: Voto[];
  setVotosRegistrados: Dispatch<SetStateAction<Voto[]>>;

  // Estado do Histórico e Grupos
  enquetes: Enquete[];
  members: Member[];
  
  // Funções de Ação
  encerrarResenha: () => void;
  criarEnquete: (titulo: string, locais: string[], datas: string[], ponderada: boolean) => void;
  getTotalPoints: () => number;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // 1. ESTADOS DA RESENHA ATUAL
  const [score, setScore] = useState(0);
  const [tituloEnquete, setTituloEnquete] = useState('');
  const [confirmados, setConfirmados] = useState(0);
  const [totalConvidados, setTotalConvidados] = useState(0);
  const [locais, setLocais] = useState<string[]>([]);
  const [datas, setDatas] = useState<string[]>([]);
  const [ponderada, setPonderada] = useState(false);
  const [albumPosts, setAlbumPosts] = useState<any[]>([]);
  const [votosRegistrados, setVotosRegistrados] = useState<Voto[]>([]);
  // 2. ESTADOS DAS ENQUETES (Histórico completo)
  const [enquetes, setEnquetes] = useState<Enquete[]>([
    { 
      id: '1', 
      dataCriacao: '24 OUT, 2023', 
      dataEncerramento: '24 OUT, 2023',
      titulo: 'Resenha das Quartas', 
      presentes: 14, 
      fotos: 24, 
      cor: '#004643',
      locais: ['Campo de Futebol', 'Bar do Zé'],
      datas: ['qua, 25 out', 'qui, 26 out'],
      status: 'encerrada',
      ponderada: false
    },
    { 
      id: '2', 
      dataCriacao: '17 OUT, 2023', 
      dataEncerramento: '17 OUT, 2023',
      titulo: 'Churrasco Pós-Jogo', 
      presentes: 18, 
      fotos: 12, 
      cor: '#00D166',
      locais: ['Churrascaria do João'],
      datas: ['sáb, 21 out'],
      status: 'encerrada',
      ponderada: true
    }
  ]);

  // 3. ESTADOS DOS MEMBROS (Membros do seu grupo simulando um banco de dados)
  const [members, setMembers] = useState<Member[]>([
    { id: 'm1', name: 'Fernanda S.', points: 3400 },
    { id: 'm2', name: 'Ricardo M.', points: 2800 },
    { id: 'm3', name: 'Marcos L.', points: 2100 },
    { id: 'm4', name: 'João D.', points: 1500 }, // Você!
  ]);

  // FUNÇÕES DE PERSISTÊNCIA
  const loadData = async () => {
    try {
      const dataString = await SecureStore.getItemAsync('resenhaScoreData');
      if (dataString) {
        const data = JSON.parse(dataString);
        setScore(data.score || 0);
        setTituloEnquete(data.tituloEnquete || '');
        setConfirmados(data.confirmados || 0);
        setTotalConvidados(data.totalConvidados || 10);
        setLocais(data.locais || []);
        setDatas(data.datas || []);
        setPonderada(data.ponderada || false);
        setAlbumPosts(data.albumPosts || []);
        setVotosRegistrados(data.votosRegistrados || []);
        setEnquetes(data.enquetes || []);
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    loadData();
  }, []);

  // Salvar dados sempre que houver mudanças
  useEffect(() => {
    const save = async () => {
      try {
        const data = {
          score,
          tituloEnquete,
          confirmados,
          totalConvidados,
          locais,
          datas,
          ponderada,
          albumPosts,
          votosRegistrados,
          enquetes,
          members
        };
        await SecureStore.setItemAsync('resenhaScoreData', JSON.stringify(data));
      } catch (error) {
        console.error('Erro ao salvar dados:', error);
      }
    };
    save();
  }, [score, tituloEnquete, confirmados, totalConvidados, locais, datas, ponderada, albumPosts, votosRegistrados, enquetes, members]);

  // 4. FUNÇÕES DE AÇÃO
  const getTotalPoints = () => {
    return members.reduce((sum, member) => sum + member.points, 0);
  };

  const criarEnquete = (titulo: string, locais: string[], datas: string[], ponderada: boolean) => {
    const dataAtual = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toUpperCase().replace('.', '');

    const cores = ['#004643', '#00D166', '#333'];
    const corAleatoria = cores[Math.floor(Math.random() * cores.length)];

    const novaEnquete: Enquete = {
      id: Math.random().toString(),
      dataCriacao: dataAtual,
      titulo,
      presentes: 0,
      fotos: 0,
      cor: corAleatoria,
      locais,
      datas,
      status: 'ativa',
      ponderada
    };

    setEnquetes((prev) => [novaEnquete, ...prev]);
    setPonderada(ponderada);
    setTotalConvidados(10);
  };

  const encerrarResenha = () => {
    if (!tituloEnquete.trim()) return;

    const dataAtual = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toUpperCase().replace('.', '');

    setEnquetes((prev) =>
      prev.map((enq) =>
        enq.status === 'ativa' && enq.titulo === tituloEnquete
          ? { ...enq, status: 'encerrada', dataEncerramento: dataAtual, presentes: confirmados }
          : enq
      )
    );

    // Limpa a tela inicial (index.tsx)
    setTituloEnquete('');
    setConfirmados(0);
    setTotalConvidados(0);
    setLocais([]);
    setDatas([]);
    setPonderada(false);
  };

  return (
    <AppContext.Provider
      value={{
        score, setScore,
        tituloEnquete, setTituloEnquete,
        confirmados, setConfirmados,
        totalConvidados, setTotalConvidados,
        locais, setLocais,
        datas, setDatas,
        ponderada, setPonderada,
        albumPosts, setAlbumPosts,
        votosRegistrados, setVotosRegistrados,
        enquetes, members,
        encerrarResenha,
        criarEnquete,
        getTotalPoints
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de um AppProvider');
  }
  return context;
}