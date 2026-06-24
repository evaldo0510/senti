import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { db, auth } from '../services/firebase';
import { doc, getDoc, collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { 
  Activity, CheckCircle, AlertCircle, Trash2, Terminal, X, 
  ChevronDown, ChevronUp, RefreshCw, User, Database, ShieldAlert 
} from 'lucide-react';

interface LogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'error';
  message: string;
}

export const DiagnosticPanel: React.FC = () => {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState<string | null>(null);

  const addLog = (type: 'info' | 'success' | 'error', message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [{ timestamp, type, message }, ...prev]);
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('info', 'Logs limpos.');
  };

  const runTestOwnDocument = async () => {
    if (!user) {
      addLog('error', 'Erro: Usuário não autenticado.');
      console.error('[DIAGNOSTIC] Cannot test own document: User is not authenticated.');
      return;
    }

    setIsRunning('own_doc');
    addLog('info', `Iniciando Teste 1: Buscar documento específico 'users/${user.uid}'`);
    console.log(`%c[DIAGNOSTIC] === TEST 1: Fetching users/${user.uid} ===`, 'color: #3b82f6; font-weight: bold;');
    console.log('[DIAGNOSTIC] Current Auth UID:', user.uid);
    console.log('[DIAGNOSTIC] Current Auth Email:', user.email);

    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        addLog('success', `Sucesso! Documento de perfil encontrado. Tipo de usuário: '${data.tipo}'`);
        console.log('[DIAGNOSTIC] Success! Document found:', data);
      } else {
        addLog('info', 'Aviso: O documento de perfil não existe no Firestore ainda.');
        console.log('[DIAGNOSTIC] Document does not exist yet at path:', `users/${user.uid}`);
      }
    } catch (error: any) {
      addLog('error', `Falha na permissão: ${error.message || error}`);
      console.error('[DIAGNOSTIC] Failed to fetch own user document:', error);
    } finally {
      setIsRunning(null);
    }
  };

  const runTestQueryTherapists = async () => {
    if (!user) {
      addLog('error', 'Erro: Usuário não autenticado.');
      return;
    }

    setIsRunning('query_therapists');
    addLog('info', 'Iniciando Teste 2: Consultar terapeutas cadastrados (Query Filtrada)');
    console.log('%c[DIAGNOSTIC] === TEST 2: Querying Therapists (tipo == "terapeuta") ===', 'color: #10b981; font-weight: bold;');

    try {
      const q = query(collection(db, 'users'), where('tipo', '==', 'terapeuta'));
      const snapshot = await getDocs(q);
      
      addLog('success', `Sucesso! Encontrados ${snapshot.size} terapeutas.`);
      console.log(`[DIAGNOSTIC] Found ${snapshot.size} therapists:`);
      snapshot.forEach(doc => {
        console.log(` - ID: ${doc.id}, Nome: ${doc.data().nome}`);
      });
    } catch (error: any) {
      addLog('error', `Falha ao listar terapeutas: ${error.message || error}`);
      console.error('[DIAGNOSTIC] Failed to query therapists:', error);
    } finally {
      setIsRunning(null);
    }
  };

  const runTestListAllUsers = async () => {
    if (!user) {
      addLog('error', 'Erro: Usuário não autenticado.');
      return;
    }

    setIsRunning('list_all');
    addLog('info', 'Iniciando Teste 3: Listagem geral irrestrita de usuários (Sem Filtros)');
    console.log('%c[DIAGNOSTIC] === TEST 3: List All Users (collection-wide scan) ===', 'color: #f59e0b; font-weight: bold;');

    try {
      const colRef = collection(db, 'users');
      const snapshot = await getDocs(colRef);
      
      addLog('success', `Inesperado/Sucesso (Nível Admin): Listados todos os ${snapshot.size} usuários.`);
      console.log(`[DIAGNOSTIC] Success (Admin/Unrestricted Access)! Found ${snapshot.size} total user profiles:`);
      snapshot.forEach(doc => {
        console.log(` - ID: ${doc.id}, Tipo: ${doc.data().tipo}, Nome: ${doc.data().nome}`);
      });
    } catch (error: any) {
      addLog('error', `Esperado para Usuário Comum / Falha: ${error.message || error}`);
      console.warn('[DIAGNOSTIC] Denied (Expected for non-admins due to rules preventing raw scans):', error);
    } finally {
      setIsRunning(null);
    }
  };

  const runTestWriteProfile = async () => {
    if (!user) {
      addLog('error', 'Erro: Usuário não autenticado.');
      return;
    }

    setIsRunning('write_profile');
    addLog('info', 'Iniciando Teste 4: Gravar dados de teste no seu próprio documento');
    console.log('%c[DIAGNOSTIC] === TEST 4: Update Own Profile ===', 'color: #8b5cf6; font-weight: bold;');

    try {
      const docRef = doc(db, 'users', user.uid);
      const testTimestamp = new Date().toISOString();
      await updateDoc(docRef, {
        lastDiagnosticTest: testTimestamp
      });
      
      addLog('success', `Sucesso! Atualizado campo 'lastDiagnosticTest' em seu próprio perfil.`);
      console.log('[DIAGNOSTIC] Successfully updated own document in Firestore with timestamp:', testTimestamp);
    } catch (error: any) {
      addLog('error', `Falha ao gravar no seu perfil: ${error.message || error}`);
      console.error('[DIAGNOSTIC] Failed to update own document:', error);
    } finally {
      setIsRunning(null);
    }
  };

  const runAllDiagnostics = async () => {
    addLog('info', '=== Iniciando Diagnóstico Completo ===');
    console.log('%c[DIAGNOSTIC] ============= STARTING COMPREHENSIVE DIAGNOSTICS =============', 'background: #1e293b; color: #38bdf8; padding: 6px 12px; font-size: 14px; font-weight: bold; border-radius: 4px;');
    await runTestOwnDocument();
    await runTestQueryTherapists();
    await runTestListAllUsers();
    await runTestWriteProfile();
    console.log('%c[DIAGNOSTIC] ============= DIAGNOSTICS COMPLETED =============', 'background: #1e293b; color: #38bdf8; padding: 6px 12px; font-size: 14px; font-weight: bold; border-radius: 4px;');
  };

  const clearSimulatedSession = () => {
    localStorage.removeItem("simulatedUser");
    localStorage.removeItem("simulatedProfile");
    localStorage.removeItem("tipo");
    addLog('success', 'Sessão simulada removida. Recarregando a página...');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <div id="diagnostic-root" className="fixed bottom-4 left-4 z-50 font-sans">
      {/* Floating Toggle Button */}
      <button
        id="diagnostic-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-900 text-slate-100 px-4 py-2.5 rounded-full shadow-lg border border-slate-700 hover:bg-slate-800 transition-all duration-200"
      >
        <Activity className={`w-4 h-4 text-emerald-400 ${isOpen ? 'animate-pulse' : ''}`} />
        <span className="text-xs font-semibold">Painel de Diagnóstico</span>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>

      {/* Main Panel */}
      {isOpen && (
        <div 
          id="diagnostic-panel-body"
          className="absolute bottom-14 left-0 w-96 bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 flex flex-col max-h-[500px] overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-slate-200">Diagnóstico Firestore</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Info Block */}
          <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 text-xs flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-300">Sessão Autenticada:</span>
            </div>
            {user ? (
              <div className="pl-5 space-y-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">User ID:</span>
                  <code className="bg-slate-800 text-slate-300 px-1 rounded select-all font-mono">{user.uid}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-sky-300 font-medium truncate max-w-[200px]">{user.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Role (tipo):</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                    profile?.tipo === 'admin' ? 'bg-purple-900/40 text-purple-300 border border-purple-800' :
                    profile?.tipo === 'terapeuta' ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-800' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {profile?.tipo || 'Nenhum perfil carregado'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="pl-5 text-amber-400 text-[11px] flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                Usuário não autenticado
              </div>
            )}
          </div>

          {/* Diagnostic Controls */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/20 grid grid-cols-2 gap-2">
            <button
              onClick={runAllDiagnostics}
              disabled={!!isRunning}
              className="col-span-2 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-sky-950/50 transition-all duration-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              Executar Diagnóstico Geral
            </button>

            <button
              onClick={runTestOwnDocument}
              disabled={!!isRunning}
              className="p-2 text-[10px] font-medium bg-slate-800 hover:bg-slate-750 disabled:opacity-50 rounded-lg text-slate-200 border border-slate-700 hover:border-slate-600 transition-all text-left"
            >
              Testar: users/{`{uid}`}
            </button>

            <button
              onClick={runTestQueryTherapists}
              disabled={!!isRunning}
              className="p-2 text-[10px] font-medium bg-slate-800 hover:bg-slate-750 disabled:opacity-50 rounded-lg text-slate-200 border border-slate-700 hover:border-slate-600 transition-all text-left"
            >
              Testar: Query Terapeutas
            </button>

            <button
              onClick={runTestListAllUsers}
              disabled={!!isRunning}
              className="p-2 text-[10px] font-medium bg-slate-800 hover:bg-slate-750 disabled:opacity-50 rounded-lg text-slate-200 border border-slate-700 hover:border-slate-600 transition-all text-left"
            >
              Testar: Listar Coleção (Deny)
            </button>

            <button
              onClick={runTestWriteProfile}
              disabled={!!isRunning}
              className="p-2 text-[10px] font-medium bg-slate-800 hover:bg-slate-750 disabled:opacity-50 rounded-lg text-slate-200 border border-slate-700 hover:border-slate-600 transition-all text-left"
            >
              Testar: Escrita Própria
            </button>

            {localStorage.getItem("simulatedUser") && (
              <button
                onClick={clearSimulatedSession}
                className="col-span-2 mt-1 py-1 text-[10px] font-bold text-rose-300 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/60 rounded-lg flex items-center justify-center gap-1 transition-all"
              >
                <Trash2 className="w-3 h-3" />
                Limpar Sessão Simulada (Local)
              </button>
            )}
          </div>

          {/* Log Outputs */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 min-h-[160px]">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold border-b border-slate-800 pb-1.5">
              <span className="flex items-center gap-1 uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5 text-slate-400" /> Output do Console
              </span>
              <button 
                onClick={clearLogs}
                className="hover:text-slate-300 transition-all"
              >
                Limpar Logs
              </button>
            </div>
            
            {logs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-center text-xs italic">
                Nenhum teste executado ainda.<br />Clique acima para testar as permissões.
              </div>
            ) : (
              <div className="space-y-1.5 font-mono text-[10px]">
                {logs.map((log, idx) => (
                  <div key={idx} className="flex gap-1.5 items-start">
                    <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
                    {log.type === 'success' && <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />}
                    {log.type === 'error' && <AlertCircle className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />}
                    {log.type === 'info' && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 mt-1.5 ml-0.5 mr-0.5" />}
                    <span className={
                      log.type === 'success' ? 'text-emerald-300' :
                      log.type === 'error' ? 'text-rose-300' :
                      'text-slate-300'
                    }>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
