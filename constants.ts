
import { Contract, ContractStatus, ImportLog, AppParams } from './types';

export const APP_NAME = "Gestão de Contratos CSS";
export const ORG_NAME = "Coordenadoria de Serviços de Saúde - SES/SP";

// --- CONFIGURAÇÃO DE ACESSO ---
// E-mail que terá acesso ADMIN garantido (Bypass de banco de dados)
export const MASTER_ADMIN_EMAIL = "afernandes@saude.sp.gov.br";

// --- CONFIGURAÇÃO SUPABASE ---
// SUBSTITUA PELAS SUAS CREDENCIAIS DO SUPABASE
export const SUPABASE_URL = "https://nkhoozodfppzzghwdfeh.supabase.co"; 
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5raG9vem9kZnBwenpnaHdkZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1OTc2NzAsImV4cCI6MjA4NTE3MzY3MH0.5nNJ78tueyBn0X5ORVb7g9RaD71WUCKOKhHlBTjCO0k";
// -----------------------------

// Helper to generate dates relative to today for realism
const today = new Date();
const addDays = (days: number) => {
  const result = new Date(today);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
};

export const DEFAULT_PARAMS: AppParams = {
  alerta_30_dias: true,
  alerta_60_dias: true,
  alerta_90_dias: true,
  alerta_180_dias: false,
};

// Mock logs retained for fallback/initial state
export const MOCK_IMPORT_LOGS: ImportLog[] = [
  {
    id: 'IMP-001',
    data_hora: addDays(-30) + 'T10:00:00',
    usuario: 'Admin User',
    nome_arquivo: 'CONTRATOS-VIGENTES-JANEIRO.xlsx',
    tipo_importacao: 'sobrescrever',
    qt_inseridos: 150,
    qt_atualizados: 0,
    qt_ignorados: 0
  }
];

// Mock contracts retained for fallback if Supabase is not configured
export const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'CT-001',
    uge: '090118 - Promissão',
    codigo_uge: '090118',
    hospital_unidade: 'Promissão',
    servico: 'Limpeza Hospitalar',
    natureza: 'Mão de Obra',
    empresa: 'CLEAN SERVICE LTDA',
    cnpj: '12.345.678/0001-99',
    valor_mensal: 150000.00,
    situacao: ContractStatus.VIGENTE,
    data_inicio: addDays(-300),
    data_fim: addDays(65),
    processo_sei: 'SEI-123456/2024',
    data_cadastro: addDays(-300),
    origem_registro: 'Importação planilha 27/01/2026'
  },
  {
    id: 'CT-002',
    uge: '090141 - Guilherme Álvaro',
    codigo_uge: '090141',
    hospital_unidade: 'Guilherme Álvaro',
    servico: 'Vigilância Patrimonial',
    natureza: 'Mão de Obra',
    empresa: 'SEGURANÇA TOTAL SA',
    cnpj: '98.765.432/0001-10',
    valor_mensal: 210000.00,
    situacao: ContractStatus.A_VENCER,
    data_inicio: addDays(-360),
    data_fim: addDays(25),
    processo_sei: 'SEI-987654/2023',
    data_cadastro: addDays(-360),
    origem_registro: 'Importação planilha 27/01/2026'
  },
  {
    id: 'CT-008',
    uge: '090118 - Promissão',
    codigo_uge: '090118',
    hospital_unidade: 'Promissão',
    servico: 'Locação de Veículos',
    natureza: 'Transportes',
    empresa: 'LOCACAR SP',
    cnpj: '33.333.333/0001-33',
    valor_mensal: 12500.00,
    situacao: ContractStatus.A_VENCER,
    data_inicio: addDays(-350),
    data_fim: addDays(10),
    processo_sei: 'SEI-333444/2023',
    data_cadastro: addDays(-350),
    origem_registro: 'Importação planilha 27/01/2026'
  },
  {
    id: 'CT-003',
    uge: '090120 - Hospital Ipiranga',
    codigo_uge: '090120',
    hospital_unidade: 'Hospital Ipiranga',
    servico: 'Fornecimento de Medicamentos',
    natureza: 'Consumo',
    empresa: 'MED PHARMA DISTRIBUIDORA',
    cnpj: '44.444.444/0001-44',
    valor_mensal: 50000.00,
    situacao: ContractStatus.VIGENTE,
    data_inicio: addDays(-100),
    data_fim: addDays(200),
    processo_sei: 'SEI-555666/2024',
    data_cadastro: addDays(-100),
    origem_registro: 'Sistema'
  },
  {
    id: 'CT-004',
    uge: '090120 - Hospital Ipiranga',
    codigo_uge: '090120',
    hospital_unidade: 'Hospital Ipiranga',
    servico: 'Energia Elétrica',
    natureza: 'Utilidade Pública',
    empresa: 'ENEL DISTRIBUIÇÃO',
    cnpj: '60.444.444/0001-44',
    valor_mensal: 180000.00,
    situacao: ContractStatus.VIGENTE,
    data_inicio: addDays(-1000),
    data_fim: addDays(365), 
    processo_sei: 'SEI-000000/2020',
    data_cadastro: addDays(-1000),
    origem_registro: 'Sistema'
  },
  {
    id: 'CT-005',
    uge: '090118 - Promissão',
    codigo_uge: '090118',
    hospital_unidade: 'Promissão',
    servico: 'Licença de Software',
    natureza: 'Serviços de TI e Comunicação PJ',
    empresa: 'MICROSOFT BRASIL',
    cnpj: '99.999.999/0001-99',
    valor_mensal: 25000.00,
    situacao: ContractStatus.VIGENTE,
    data_inicio: addDays(-200),
    data_fim: addDays(165),
    processo_sei: 'SEI-111222/2024',
    data_cadastro: addDays(-200),
    origem_registro: 'Sistema'
  },
   {
    id: 'CT-006',
    uge: '090141 - Guilherme Álvaro',
    codigo_uge: '090141',
    hospital_unidade: 'Guilherme Álvaro',
    servico: 'Manutenção de Ar Condicionado',
    natureza: 'Serviços - PJ',
    empresa: 'CLIMA PRO',
    cnpj: '88.888.888/0001-88',
    valor_mensal: 15000.00,
    situacao: ContractStatus.VIGENTE,
    data_inicio: addDays(-150),
    data_fim: addDays(30),
    processo_sei: 'SEI-777888/2024',
    data_cadastro: addDays(-150),
    origem_registro: 'Sistema'
  },
  {
    id: 'CT-007',
    uge: '090141 - Guilherme Álvaro',
    codigo_uge: '090141',
    hospital_unidade: 'Guilherme Álvaro',
    servico: 'Plantão Médico Anestesia',
    natureza: 'Serviços - PF',
    empresa: 'DR. JOÃO SILVA',
    cnpj: '000.111.222-33',
    valor_mensal: 12000.00,
    situacao: ContractStatus.VIGENTE,
    data_inicio: addDays(-50),
    data_fim: addDays(130),
    processo_sei: 'SEI-999000/2024',
    data_cadastro: addDays(-50),
    origem_registro: 'Sistema'
  }
];

export const NATUREZAS_OPTIONS = Array.from(new Set(MOCK_CONTRACTS.map(c => c.natureza)));
export const UNIDADES_OPTIONS = Array.from(new Set(MOCK_CONTRACTS.map(c => c.uge)));
export const EMPRESAS_OPTIONS = Array.from(new Set(MOCK_CONTRACTS.map(c => c.empresa)));
export const SERVICOS_OPTIONS = Array.from(new Set(MOCK_CONTRACTS.map(c => c.servico)));
