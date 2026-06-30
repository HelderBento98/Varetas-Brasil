export type StatusOS = 'PAGO' | 'PENDENTES' | 'AGUARDANDO INICIO';

export interface OrdemServico {
  id: string;
  cliente: string;
  servico: string;
  preco: number;
  formaPagamento: string;
  contato: string;
  dataOrcamento: string;
  validadeOrcamento?: string;
  status: StatusOS;
}

export interface UserProfile {
  nomeEmpresa: string;
  telefone: string;
  dataCriacao: string;
  cnpj: string;
  email: string;
  logo?: string;
  planoAtivo?: 'mensal' | 'anual' | null;
  chavePix?: string;
}

export interface Lembrete {
  id: string;
  descricao: string;
  horario: string; // "HH:MM"
  data: string; // "DD/MM/YYYY"
  celular?: string; // Celular do cliente para visita
  notificado?: boolean;
}

export interface AppState {
  ordens: OrdemServico[];
  currentScreen: ScreenType;
  selectedOSId: string | null;
  selectedStatusFilter: StatusOS | null;
  userProfile: UserProfile;
  selectedMonth: number;
  selectedYear: number;
  lembretes: Lembrete[];
}

export type ScreenType = 
  | 'HOME' 
  | 'NOVA_OS' 
  | 'HISTORICO' 
  | 'LISTA_OS' 
  | 'DETALHES_OS' 
  | 'CALENDARIO' 
  | 'AJUSTES'
  | 'RESUMO_DETALHADO';
