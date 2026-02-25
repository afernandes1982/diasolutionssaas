
export enum ContractStatus {
  VIGENTE = 'Vigente',
  A_VENCER = 'A vencer',
  VENCIDO = 'Vencido',
  RESCINDIDO = 'Rescindido',
}

export interface Contract {
  id: string;
  uge: string; // "090118 - Promissão"
  codigo_uge: string; // "090118"
  hospital_unidade: string; // "Promissão"
  servico: string;
  natureza: string;
  empresa: string;
  cnpj: string;
  valor_mensal: number;
  situacao: ContractStatus;
  data_inicio: string | null; // ISO Date string YYYY-MM-DD
  data_fim: string | null; // ISO Date string YYYY-MM-DD
  processo_sei?: string; // New field
  data_cadastro: string;
  origem_registro: string;
  observacoes?: string;
}

export interface ImportLog {
  id: string;
  data_hora: string;
  usuario: string;
  nome_arquivo: string;
  tipo_importacao: 'mesclar' | 'sobrescrever';
  qt_inseridos: number;
  qt_atualizados: number;
  qt_ignorados: number;
  log_erros?: string[];
}

export type UserRole = 'admin' | 'gestor';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface AppParams {
  alerta_30_dias: boolean;
  alerta_60_dias: boolean;
  alerta_90_dias: boolean;
  alerta_180_dias: boolean;
}

export interface FilterState {
  search: string;
  uge: string[];
  natureza: string[];
  servico: string[];
  empresa: string[];
  situacao: ContractStatus[];
  valorMin: number | '';
  valorMax: number | '';
  dataInicio: string; // YYYY-MM-DD
  dataFim: string;   // YYYY-MM-DD
  vencimentoInicio?: string; // YYYY-MM-DD
  vencimentoFim?: string;    // YYYY-MM-DD
}

export interface DashboardStats {
  totalVigentes: number;
  totalValorMensal: number;
  totalUnidades: number;
  byStatus: Record<string, number>;
  topUnits: { name: string; value: number }[];
  topNatures: { name: string; value: number }[];
  expiring30: number;
  expiring60: number;
  expiring90: number;
  expired: number;
}

export interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  count: number;
  filter: Partial<FilterState>;
}

export enum ViewType {
  DASHBOARD = 'DASHBOARD',
  CONTRACTS = 'CONTRACTS',
  NATUREZAS = 'NATUREZAS',
  IMPORT = 'IMPORT',
  REPORTS = 'REPORTS',
  CONFIG = 'CONFIG',
  ARCHITECTURE = 'ARCHITECTURE',
  USERS = 'USERS'
}
