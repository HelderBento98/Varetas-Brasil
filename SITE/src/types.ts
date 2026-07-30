export type StatusOS = 'PAGO' | 'PENDENTES' | 'AGUARDANDO INICIO';

export interface OrdemServico {
  id: string; // uuid gerado pelo banco
  numero: string; // código de exibição, ex "Nº08"
  cliente: string;
  servico: string;
  preco: number;
  formaPagamento: string;
  contato: string;
  dataOrcamento: string;
  validadeOrcamento?: string;
  status: StatusOS;
}

export interface Company {
  id: string;
  nomeEmpresa: string;
  telefone: string;
  dataCriacao: string;
  cnpj: string;
  email: string;
  logo?: string;
  planoAtivo?: 'mensal' | 'anual' | null;
  chavePix?: string;
  inviteCode: string;
}

// Mantido como alias para minimizar mudanças nas telas existentes,
// que já tratam esse objeto como "perfil da empresa atual".
export type UserProfile = Company;

export interface CompanyMember {
  id: string;
  userId: string;
  email: string | null;
  role: 'owner' | 'member';
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

export type ModuleType = 'VENDAS' | 'FINANCEIRO' | 'ESTOQUE' | 'NOTAS_FISCAIS' | 'CONFIGURACOES';
