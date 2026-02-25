
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ContractList } from './components/ContractList';
import { ImportTool } from './components/ImportTool';
import { Reports } from './components/Reports';
import { Naturezas } from './components/Naturezas';
import { Settings } from './components/Settings';
import { ArchitectureGuide } from './components/ArchitectureGuide';
import { Login } from './components/Login';
import { UserManagement } from './components/UserManagement';
import { Contract, ViewType, FilterState, ImportLog, AppParams, UserRole, AlertItem, ContractStatus } from './types';
import { MOCK_CONTRACTS, MOCK_IMPORT_LOGS, DEFAULT_PARAMS, MASTER_ADMIN_EMAIL } from './constants';
import { recalculateContractStatus, fetchContractsFromSupabase, saveContractsToSupabase, calculateDashboardStats } from './services/contractService';
import { checkSupabaseConnection, getSession, signOut, supabase } from './services/supabaseClient';
import { getCurrentProfile } from './services/userService';
import { AlertTriangle, Loader2, RefreshCw, Lock, DatabaseZap } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO DE DESENVOLVIMENTO ---
const DEV_MODE = true; 
// ---------------------------------------

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('gestor'); 
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [importHistory, setImportHistory] = useState<ImportLog[]>(MOCK_IMPORT_LOGS);
  const [appParams, setAppParams] = useState<AppParams>(DEFAULT_PARAMS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{message: string, type: 'connection' | 'table' | 'auth'} | null>(null);
  
  const [preloadedFilters, setPreloadedFilters] = useState<Partial<FilterState> | undefined>(undefined);

  useEffect(() => {
    const checkAuth = async () => {
        if (DEV_MODE) {
            setSession({ user: { email: MASTER_ADMIN_EMAIL, id: 'dev-user-id' } } as any);
            setUserRole('admin');
            setIsAuthLoading(false);
            loadData();
            return;
        }

        try {
            setIsAuthLoading(true);
            if (checkSupabaseConnection() && supabase) {
                const currentSession = await getSession();
                setSession(currentSession);
                
                if (currentSession) {
                    const profile = await getCurrentProfile(currentSession.user.id, currentSession.user.email);
                    if (profile) setUserRole(profile.role);
                }

                const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
                    setSession(session);
                    if (session) {
                         const profile = await getCurrentProfile(session.user.id, session.user.email);
                         if (profile) setUserRole(profile.role);
                    } else {
                        setUserRole('gestor');
                    }
                });
                
                return () => {
                    if (data && data.subscription) data.subscription.unsubscribe();
                };
            }
        } catch (e: any) {
            setError({ message: "Erro de autenticação.", type: 'auth' });
        } finally {
            setIsAuthLoading(false);
        }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (session && !DEV_MODE) {
        loadData();
    }
  }, [session]);

  const loadData = async () => {
        setLoading(true);
        setError(null);
        if (checkSupabaseConnection()) {
            try {
                const data = await fetchContractsFromSupabase();
                setContracts(data);
            } catch (e: any) {
                const msg = e.message || "Erro desconhecido";
                if (msg.includes('relation "contratos" does not exist')) {
                    setError({ message: "A tabela 'contratos' não foi encontrada.", type: 'table' });
                } else {
                    setError({ message: `Conexão falhou: ${msg}`, type: 'connection' });
                }
                if (contracts.length === 0) setContracts(MOCK_CONTRACTS);
            }
        } else {
            setContracts(MOCK_CONTRACTS);
        }
        setLoading(false);
    };

  const handleLogout = async () => {
      if (DEV_MODE) {
          setSession(null);
          return;
      }
      await signOut();
      setSession(null);
      setContracts([]);
  };

  const activeContracts = useMemo(() => {
     return contracts.map(c => recalculateContractStatus(c, appParams));
  }, [contracts, appParams]);

  const systemAlerts = useMemo<AlertItem[]>(() => {
      const stats = calculateDashboardStats(activeContracts, appParams);
      const alerts: AlertItem[] = [];

      const getTodayStr = () => new Date().toISOString().split('T')[0];
      const getFutureDateStr = (days: number) => {
          const d = new Date();
          d.setDate(d.getDate() + days);
          return d.toISOString().split('T')[0];
      };

      if (stats.expired > 0) {
          alerts.push({
              id: 'expired', type: 'critical', title: 'Contratos Vencidos',
              message: 'Existem contratos com vigência expirada.',
              count: stats.expired, filter: { situacao: [ContractStatus.VENCIDO] }
          });
      }

      if (stats.expiring30 > 0) {
          alerts.push({
              id: 'exp30', type: 'critical', title: 'Vencendo em 30 dias',
              message: 'Contratos críticos vencendo este mês.',
              count: stats.expiring30,
              filter: { vencimentoInicio: getTodayStr(), vencimentoFim: getFutureDateStr(30), situacao: [] }
          });
      }

      return alerts;
  }, [activeContracts, appParams]);

  const handleNavigate = (view: ViewType) => {
    const isAdmin = userRole && userRole.toLowerCase().trim() === 'admin';
    if (!isAdmin && [ViewType.IMPORT, ViewType.CONFIG, ViewType.USERS].includes(view)) {
        alert("Acesso restrito a administradores.");
        return;
    }
    setCurrentView(view);
    if (view !== ViewType.CONTRACTS) setPreloadedFilters(undefined);
  };

  const handleDashboardDrillDown = (filters?: Partial<FilterState>) => {
    setPreloadedFilters(filters);
    setCurrentView(ViewType.CONTRACTS);
  };

  const handleImport = async (newContracts: Contract[], log: ImportLog, strategy: 'mesclar' | 'sobrescrever') => {
    setLoading(true);
    
    const canSave = checkSupabaseConnection() && (session || DEV_MODE);

    if (canSave) {
        try {
            await saveContractsToSupabase(newContracts, strategy);
            await loadData();
            alert("Dados importados com sucesso!");
        } catch (e: any) {
            console.error(e);
            alert("Erro ao gravar no Banco de Dados: " + e.message);
            // Fallback para estado local para permitir visualização mesmo com erro de persistência
            if (strategy === 'sobrescrever') {
                setContracts(newContracts);
            } else {
                setContracts([...contracts, ...newContracts]);
            }
            setLoading(false);
        }
    } else {
        // MODO DEMO: Atualiza o estado local para visualização imediata
        if (strategy === 'sobrescrever') {
            setContracts(newContracts);
        } else {
            setContracts([...contracts, ...newContracts]);
        }
        alert("Modo Demonstração: Dados carregados localmente para esta sessão.");
        setLoading(false);
    }
    setImportHistory([log, ...importHistory]);
  };

  const renderContent = () => {
    if (loading) return (
        <div className="flex h-full items-center justify-center flex-col">
            <Loader2 className="w-10 h-10 text-sp-red animate-spin mb-4" />
            <span className="text-gray-600 font-medium">Sincronizando dados...</span>
        </div>
    );

    const isAdmin = userRole && userRole.toLowerCase().trim() === 'admin';
    if (!isAdmin && [ViewType.IMPORT, ViewType.CONFIG, ViewType.USERS].includes(currentView)) {
        return <div className="p-10 text-center"><Lock className="mx-auto w-12 h-12 mb-4 text-gray-300"/><h2 className="text-xl font-bold">Acesso Restrito</h2></div>;
    }

    switch (currentView) {
      case ViewType.DASHBOARD: return <Dashboard contracts={activeContracts} params={appParams} onNavigateToContracts={handleDashboardDrillDown} onNavigate={handleNavigate} />;
      case ViewType.CONTRACTS: return <ContractList contracts={activeContracts} initialFilters={preloadedFilters} />;
      case ViewType.NATUREZAS: return <Naturezas contracts={activeContracts} />;
      case ViewType.IMPORT: return <ImportTool onImport={handleImport} importHistory={importHistory} onNavigate={handleNavigate} />;
      case ViewType.REPORTS: return <Reports contracts={activeContracts} params={appParams} />;
      case ViewType.CONFIG: return <Settings params={appParams} onUpdate={setAppParams} onNavigate={handleNavigate} />;
      case ViewType.USERS: return <UserManagement />;
      case ViewType.ARCHITECTURE: return <ArchitectureGuide />;
      default: return <Dashboard contracts={activeContracts} params={appParams} onNavigateToContracts={handleDashboardDrillDown} onNavigate={handleNavigate} />;
    }
  };

  if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><Loader2 className="w-8 h-8 text-sp-red animate-spin" /></div>;
  if (checkSupabaseConnection() && !session && !DEV_MODE) return <Login onLoginSuccess={() => loadData()} />;

  return (
    <Layout 
        currentView={currentView} 
        onNavigate={handleNavigate} 
        onLogout={checkSupabaseConnection() ? handleLogout : undefined} 
        userEmail={session?.user.email}
        userRole={userRole}
        alerts={systemAlerts}
        onAlertClick={handleDashboardDrillDown}
    >
      {error && (
          <div className={`text-xs py-2 px-4 border-b flex justify-between items-center ${error.type === 'table' ? 'bg-orange-50 text-orange-800 border-orange-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
             <div className="flex items-center">
                <DatabaseZap className="w-4 h-4 mr-2" /> 
                <strong>Status de Dados:</strong> <span className="ml-1">{error.message}</span>
             </div>
             <div className="flex items-center gap-3">
                <button onClick={() => setCurrentView(ViewType.ARCHITECTURE)} className="underline font-bold hover:text-black">Abrir Ajuda SQL</button>
                <button onClick={loadData} className="bg-white border px-2 py-0.5 rounded shadow-sm hover:bg-gray-50 flex items-center">
                    <RefreshCw className="w-3 h-3 mr-1"/> Tentar novamente
                </button>
             </div>
          </div>
      )}
      {DEV_MODE && (
          <div className="bg-yellow-50 text-yellow-800 text-[10px] px-4 py-1 font-bold border-b border-yellow-100 flex items-center justify-center">
              ⚠️ MODO DE DESENVOLVIMENTO ATIVO (LOGIN DESABILITADO)
          </div>
      )}
      {renderContent()}
    </Layout>
  );
};

export default App;
