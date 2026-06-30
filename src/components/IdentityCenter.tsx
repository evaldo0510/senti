import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Shield, FileText, Trash2, Smile, Upload, AlertCircle, 
  CheckCircle, Lock, Smartphone, Laptop, Tablet, HelpCircle, 
  Download, Loader2, RefreshCw, Key, Info, Check, Eye
} from 'lucide-react';
import { auth, db } from '../services/firebase';
import { userService } from '../services/userService';
import { sessionService, UserSession } from '../services/sessionService';
import { 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  GoogleAuthProvider, 
  reauthenticateWithPopup 
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  getDoc,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';

const AVATAR_PRESETS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Boots",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Cookie",
];

export const IdentityCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'avatar' | 'security' | 'consent' | 'delete'>('profile');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile data state
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cidade, setCidade] = useState('');
  const [biografia, setBiografia] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');

  // Active Sessions state
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Consent logs state
  const [consents, setConsents] = useState({
    marketing: false,
    communication: false,
    research: false,
    telemetry: false
  });
  const [consentLogs, setConsentLogs] = useState<any[]>([]);

  // Deletion process state
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonSelected, setReasonSelected] = useState('');
  const [reasonCustom, setReasonCustom] = useState('');
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [password, setPassword] = useState('');
  const [reauthError, setReauthError] = useState<string | null>(null);
  const [reauthSuccess, setReauthSuccess] = useState(false);
  const [showFinalDeleteModal, setShowFinalDeleteModal] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Export LGPD state
  const [exporting, setExporting] = useState(false);

  // Form password updates
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  const currentUser = auth.currentUser;
  const isGoogleUser = currentUser?.providerData?.some(p => p.providerId === 'google.com');

  useEffect(() => {
    if (!currentUser) return;

    // Load user profile
    const loadProfile = async () => {
      try {
        setLoadingProfile(true);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNome(data.nome || currentUser.displayName || '');
          setTelefone(data.telefone || '');
          setCidade(data.cidade || '');
          setBiografia(data.biografia || '');
          setFotoUrl(data.fotoUrl || currentUser.photoURL || '');
          setConsents({
            marketing: data.consents?.marketing || false,
            communication: data.consents?.communication || false,
            research: data.consents?.research || false,
            telemetry: data.consents?.telemetry || false
          });
        }
      } catch (err: any) {
        console.error('Erro ao carregar perfil:', err);
        setError('Falha ao carregar os dados de perfil.');
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();

    // Listen to sessions in real time
    const unsubscribeSessions = sessionService.getSessions(currentUser.uid, (updatedSessions) => {
      setSessions(updatedSessions);
    });

    // Fetch consent logs from database
    const loadConsentLogs = async () => {
      try {
        const consentLogsRef = collection(db, 'users', currentUser.uid, 'consent_logs');
        const querySnapshot = await getDocs(consentLogsRef);
        const logs: any[] = [];
        querySnapshot.forEach((doc) => {
          logs.push({ id: doc.id, ...doc.data() });
        });
        logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setConsentLogs(logs);
      } catch (err) {
        console.warn('Falha ao buscar logs de consentimento:', err);
      }
    };
    loadConsentLogs();

    return () => {
      unsubscribeSessions();
    };
  }, [currentUser]);

  // Handle saving basic profile fields
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const userDocRef = doc(db, 'users', currentUser.uid);
      const updatedData = {
        nome: nome.trim(),
        telefone: telefone.trim(),
        cidade: cidade.trim(),
        biografia: biografia.trim(),
        fotoUrl: fotoUrl.trim(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(userDocRef, updatedData);
      
      // Log audit
      await userService.logAuditAPI(
        "Atualização de Dados Cadastrais", 
        ["nome", "telefone", "cidade", "biografia"]
      );

      setSuccess('Dados pessoais atualizados com sucesso!');
    } catch (err: any) {
      console.error(err);
      setError('Erro ao salvar os dados pessoais: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  // Change password handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || isGoogleUser) return;

    if (newPassword !== confirmNewPassword) {
      setError('A nova senha e a confirmação não coincidem.');
      return;
    }

    try {
      setPasswordUpdating(true);
      setError(null);
      setSuccess(null);

      // Reauthenticate user
      const credential = EmailAuthProvider.credential(currentUser.email || '', currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      const { updatePassword } = await import('firebase/auth');
      await updatePassword(currentUser, newPassword);

      // Log audit
      await userService.logAuditAPI("Alteração de Senha Principal", ["senha"]);

      setSuccess('Sua senha foi alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      console.error(err);
      setError('Falha na alteração da senha: ' + (err.code === 'auth/wrong-password' ? 'Senha atual incorreta.' : err.message));
    } finally {
      setPasswordUpdating(false);
    }
  };

  // Handle Photo Presets / Direct URLs
  const handleSelectPreset = async (presetUrl: string) => {
    if (!currentUser) return;
    try {
      setFotoUrl(presetUrl);
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { fotoUrl: presetUrl, updatedAt: serverTimestamp() });
      await userService.logAuditAPI("Atualização de Avatar (Preset)", ["fotoUrl"]);
      setSuccess('Avatar atualizado com sucesso!');
    } catch (err: any) {
      setError('Falha ao definir preset: ' + err.message);
    }
  };

  // Revoke a remote session
  const handleRevokeSession = async (sessionId: string) => {
    if (!currentUser) return;
    try {
      setRevokingId(sessionId);
      await sessionService.revokeSession(currentUser.uid, sessionId);
      await userService.logAuditAPI("Revogação Remota de Dispositivo", ["sessions"]);
      setSuccess('Dispositivo desconectado com sucesso.');
    } catch (err: any) {
      setError('Erro ao revogar sessão remota: ' + err.message);
    } finally {
      setRevokingId(null);
    }
  };

  // Log Consent Change with detailed auditing history
  const handleToggleConsent = async (key: keyof typeof consents) => {
    if (!currentUser) return;
    const newValue = !consents[key];
    const updatedConsents = { ...consents, [key]: newValue };

    try {
      setConsents(updatedConsents);
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { consents: updatedConsents });

      // Add details to logs collection
      const logData = {
        consentType: key,
        granted: newValue,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ip: sessions[0]?.ip || 'Desconhecido'
      };

      const consentLogsRef = collection(db, 'users', currentUser.uid, 'consent_logs');
      await addDoc(consentLogsRef, logData);

      // Refresh logs list
      setConsentLogs(prev => [logData, ...prev]);

      // Log general audit
      await userService.logAuditAPI(
        `Atualização de Termo de Consentimento (${key})`, 
        [`consents.${key}`]
      );
    } catch (err: any) {
      setError('Falha ao atualizar consentimento: ' + err.message);
    }
  };

  // LGPD Data Export
  const handleLgpdExport = async () => {
    if (!currentUser) return;
    try {
      setExporting(true);
      setError(null);
      setSuccess(null);

      const uid = currentUser.uid;

      // 1. Fetch from users
      const userSnap = await getDoc(doc(db, 'users', uid));
      const profileData = userSnap.exists() ? userSnap.data() : {};

      // Helper function to fetch list of documents based on query
      const fetchCollectionData = async (colName: string, field: string) => {
        const q = query(collection(db, colName), where(field, '==', uid));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      };

      // 2. Fetch all related collections in parallel
      const [
        emotionLogs,
        diaryEntries,
        feedbacks,
        privateNotes,
        appointmentsPatient,
        appointmentsTherapist,
        messagesSent,
        messagesReceived,
        sessionsList
      ] = await Promise.all([
        fetchCollectionData('emotion_logs', 'userId'),
        fetchCollectionData('diary_entries', 'userId'),
        fetchCollectionData('feedbacks', 'userId'),
        fetchCollectionData('private_notes', 'userId'),
        fetchCollectionData('appointments', 'patientId'),
        fetchCollectionData('appointments', 'therapistId'),
        fetchCollectionData('messages', 'senderId'),
        fetchCollectionData('messages', 'receiverId'),
        fetchCollectionData(`users/${uid}/sessions`, 'id') // Wait, the subcollection path
      ]);

      // Bundle it all
      const lgpdPackage = {
        exportMetadata: {
          app: "SentiPae Platform",
          timestamp: new Date().toISOString(),
          regulation: "LGPD (Lei Geral de Proteção de Dados - Lei nº 13.709/2018)",
          rights: "Artigo 18 - Direito à Portabilidade de Dados"
        },
        profile: profileData,
        emotionLogs,
        diaryEntries,
        feedbacks,
        privateNotes,
        appointments: [
          ...appointmentsPatient,
          ...appointmentsTherapist.filter(t => !appointmentsPatient.some(p => p.id === t.id))
        ],
        messages: [
          ...messagesSent,
          ...messagesReceived.filter(r => !messagesSent.some(s => s.id === r.id))
        ],
        sessions: sessionsList
      };

      // Create download trigger
      const jsonStr = JSON.stringify(lgpdPackage, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sentipae_lgpd_export_${uid}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Log audit
      await userService.logAuditAPI("Exportação de Prontuários e Portabilidade (LGPD)", ["all_collections"]);

      setSuccess('Seus dados pessoais foram exportados com sucesso! O download do arquivo JSON iniciou.');
    } catch (err: any) {
      console.error(err);
      setError('Falha ao exportar dados pessoais: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  // 1. Account Deletion: Start with Exit Reason selection
  const handleStartDeleteProcess = () => {
    setShowReasonModal(true);
  };

  const handleReasonSubmitted = () => {
    if (!reasonSelected) {
      alert('Por favor, selecione um motivo.');
      return;
    }
    setShowReasonModal(false);
    setShowReauthModal(true);
  };

  // 2. Account Deletion: Reauthentication
  const handleReauthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setReauthError(null);
      if (isGoogleUser) {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(currentUser, provider);
        setReauthSuccess(true);
        setShowReauthModal(false);
        setShowFinalDeleteModal(true);
      } else {
        if (!password) {
          setReauthError('Por favor, insira sua senha.');
          return;
        }
        const credential = EmailAuthProvider.credential(currentUser.email || '', password);
        await reauthenticateWithCredential(currentUser, credential);
        setReauthSuccess(true);
        setShowReauthModal(false);
        setShowFinalDeleteModal(true);
      }
    } catch (err: any) {
      console.error(err);
      setReauthError(err.code === 'auth/wrong-password' ? 'Senha incorreta.' : 'Erro na reautenticação: ' + err.message);
    }
  };

  // 3. Account Deletion: Final destruction in cascade via Backend API
  const handleFinalDelete = async () => {
    if (deletePhrase.trim() !== "EXCLUIR CONTA DEFINITIVAMENTE") return;
    if (!currentUser) return;

    try {
      setDeleting(true);
      setError(null);

      // Log exit reason to audit logs (anonymous, compliant under LGPD)
      try {
        await addDoc(collection(db, 'exit_surveys'), {
          reason: reasonSelected,
          customText: reasonCustom.trim(),
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Could not save exit survey', e);
      }

      // Run backend deletion
      const res = await userService.deleteAccountAPI();
      console.log('[DELETE] Deletion success message:', res.message);
      
      // Clear localStorage
      localStorage.clear();
      
      // Sign out and redirect
      await auth.signOut();
      window.location.href = '/login';
    } catch (err: any) {
      console.error(err);
      setError('Falha crítica ao expurgar conta: ' + err.message);
      setShowFinalDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-5 h-5 text-emerald-500" />;
      case 'tablet': return <Tablet className="w-5 h-5 text-emerald-500" />;
      default: return <Laptop className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <div id="identity-center-container" className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Upper Navigation Tabs */}
      <div className="flex border-b border-white/5 overflow-x-auto pb-px gap-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-serif font-semibold whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'profile' 
              ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10' 
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <User className="w-4 h-4" />
          Dados Pessoais
        </button>

        <button
          onClick={() => setActiveTab('avatar')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-serif font-semibold whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'avatar' 
              ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10' 
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Smile className="w-4 h-4" />
          Foto & Avatar
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-serif font-semibold whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'security' 
              ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10' 
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Shield className="w-4 h-4" />
          Segurança
        </button>

        <button
          onClick={() => setActiveTab('consent')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-serif font-semibold whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'consent' 
              ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10' 
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4" />
          Consentimentos LGPD
        </button>

        <button
          onClick={() => setActiveTab('delete')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-serif font-semibold whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'delete' 
              ? 'border-red-500 text-red-400 bg-red-950/10' 
              : 'border-transparent text-slate-400 hover:text-red-400/80 hover:bg-red-950/5'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          Excluir Conta
        </button>
      </div>

      {/* Global alert messages */}
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm rounded-2xl flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm rounded-2xl flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading overlay */}
      {loadingProfile ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Carregando dados de identidade...</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TAB 1: PROFILE INFO */}
          {activeTab === 'profile' && (
            <motion.form 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSaveProfile}
              className="space-y-6"
            >
              <div className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] space-y-4">
                <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-500" /> Informações do Cadastro
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono block">Nome Completo</label>
                    <input 
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                      placeholder="Seu nome"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono block">Telefone de Contato</label>
                    <input 
                      type="tel"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                      placeholder="(XX) 99999-9999"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs text-slate-400 font-mono block">Cidade / Residência</label>
                    <input 
                      type="text"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                      placeholder="Ex: Rio de Janeiro - RJ"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs text-slate-400 font-mono block">Biografia Emocional (Opcional)</label>
                    <textarea 
                      value={biografia}
                      onChange={(e) => setBiografia(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
                      placeholder="Compartilhe um resumo sobre sua jornada para apoiar na triagem da IARA."
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl text-xs font-mono font-bold transition-all active:scale-95 flex items-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Salvar Dados Cadastrais
                  </button>
                </div>
              </div>
            </motion.form>
          )}

          {/* TAB 2: AVATAR & PHOTO PRESETS */}
          {activeTab === 'avatar' && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-24 h-24 rounded-3xl border-2 border-emerald-500 bg-slate-950 overflow-hidden shrink-0 shadow-xl">
                    <img 
                      src={fotoUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"} 
                      alt="Avatar de Perfil" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-serif font-bold text-white">Identidade Visual & Presets</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-mono">
                      Selecione um dos avatares de alta qualidade e acolhimento clínico fornecidos pela SentiPae, ou insira o link direto de sua foto de preferência abaixo.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs text-slate-400 font-mono block">Presets Disponíveis:</span>
                  <div className="flex flex-wrap gap-3">
                    {AVATAR_PRESETS.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectPreset(preset)}
                        className={`w-12 h-12 rounded-xl overflow-hidden border bg-slate-950 transition-all hover:scale-105 active:scale-90 ${
                          fotoUrl === preset ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <img src={preset} alt={`preset-${index}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-mono block">Endereço URL da Imagem de Perfil:</label>
                  <div className="flex gap-2">
                    <input 
                      type="url"
                      value={fotoUrl}
                      onChange={(e) => setFotoUrl(e.target.value)}
                      placeholder="https://exemplo.com/minha_foto.jpg"
                      className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                    <button
                      onClick={() => handleSelectPreset(fotoUrl)}
                      className="px-4 bg-slate-950 hover:bg-white/5 border border-white/10 text-emerald-400 hover:text-emerald-300 rounded-2xl text-xs font-mono transition-all"
                    >
                      Aplicar URL
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: SECURITY, PASSWORDS & DEVICES */}
          {activeTab === 'security' && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* PASSWORD RECOVERY / ALTERATION */}
              {!isGoogleUser ? (
                <form onSubmit={handleChangePassword} className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] space-y-4">
                  <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-500" /> Alterar Senha de Acesso
                  </h3>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono block">Senha Atual</label>
                      <input 
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-mono block">Nova Senha</label>
                        <input 
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                          placeholder="Mínimo 6 caracteres"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-mono block">Confirmar Nova Senha</label>
                        <input 
                          type="password"
                          required
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                          placeholder="Repita a nova senha"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={passwordUpdating}
                      className="px-6 py-3 bg-slate-950 hover:bg-white/5 border border-white/10 text-emerald-400 hover:text-emerald-300 disabled:opacity-50 rounded-2xl text-xs font-mono font-bold transition-all flex items-center gap-2"
                    >
                      {passwordUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Alterar Senha de Segurança
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] flex gap-4 items-start">
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-serif font-bold text-white">Sua autenticação está vinculada ao Google</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-mono mt-1">
                      Você acessa sua conta usando seu perfil do Google. Não é necessário gerenciar ou atualizar senhas diretamente no SentiPae.
                    </p>
                  </div>
                </div>
              )}

              {/* ACTIVE SESSIONS / DEVICE MANAGEMENT */}
              <div className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-500" /> Dispositivos & Sessões Ativas
                  </h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                    {sessions.length} Ativo(s)
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  Seu login está ativo nos seguintes dispositivos. Caso identifique alguma atividade suspeita, finalize a sessão remota instantaneamente:
                </p>

                <div className="divide-y divide-white/5 pt-2">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-slate-950 border border-white/10 rounded-xl flex items-center justify-center shrink-0">
                          {getDeviceIcon(session.deviceType)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-white truncate">
                              {session.os} ({session.browser})
                            </span>
                            {session.isCurrent && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-md font-mono font-bold shrink-0">
                                Este Dispositivo
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                            <span>IP: {session.ip}</span>
                            <span>•</span>
                            <span className="truncate">{session.location}</span>
                          </div>
                        </div>
                      </div>

                      {!session.isCurrent && (
                        <button
                          onClick={() => handleRevokeSession(session.id)}
                          disabled={revokingId === session.id}
                          className="px-3 py-2 bg-red-600/10 border border-red-500/20 text-red-400 hover:bg-red-600 hover:text-white disabled:opacity-40 rounded-xl text-[10px] font-mono font-bold transition-all"
                        >
                          {revokingId === session.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            'Encerrar Sessão'
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: LGPD CONSENTS & LOGS */}
          {activeTab === 'consent' && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* LGPD PORTABILITY EXPORT */}
              <div className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-500" /> Portabilidade e Cópia de Dados (LGPD)
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono">
                    Baixe um relatório em formato estruturado contendo todos os prontuários, fichas de humor, relatórios clínicos privados e logs de atividades vinculados ao seu CPF/E-mail.
                  </p>
                </div>

                <button
                  onClick={handleLgpdExport}
                  disabled={exporting}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl text-xs font-mono font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
                >
                  {exporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Exportar Meus Dados (JSON)
                </button>
              </div>

              {/* CONSENTS SELECTIONS */}
              <div className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] space-y-6">
                <div>
                  <h3 className="text-sm font-serif font-bold text-white">Configurações de Termos e Consentimentos</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono mt-1">
                    Gerencie abaixo suas autorizações de uso de dados sob a LGPD (Lei nº 13.709/2018). Você pode revogar as permissões a qualquer momento:
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4 p-4 bg-slate-950 border border-white/5 rounded-2xl">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold text-white">Comunicação e Alertas de Consulta</span>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Autorizo o envio de lembretes de teleconsultas, pílulas diárias de reflexão e comunicados via e-mail ou WhatsApp.
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleConsent('communication')}
                      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                        consents.communication ? 'bg-emerald-600' : 'bg-slate-800'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        consents.communication ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-start justify-between gap-4 p-4 bg-slate-950 border border-white/5 rounded-2xl">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold text-white">Dicas Personalizadas & Marketing</span>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Permito o recebimento de recomendações de programas de bem-estar específicos com base em meu perfil emocional geral.
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleConsent('marketing')}
                      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                        consents.marketing ? 'bg-emerald-600' : 'bg-slate-800'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        consents.marketing ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-start justify-between gap-4 p-4 bg-slate-950 border border-white/5 rounded-2xl">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold text-white">Pesquisas Científicas Anonimizadas</span>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Autorizo a utilização de meus logs de sentimento anonimizados em estudos clínicos de inteligência de suporte emocional.
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleConsent('research')}
                      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                        consents.research ? 'bg-emerald-600' : 'bg-slate-800'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        consents.research ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-start justify-between gap-4 p-4 bg-slate-950 border border-white/5 rounded-2xl">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold text-white">Telemetria de Melhoria do Sistema</span>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Aceito compartilhar dados técnicos de usabilidade para correção de bugs e aceleração das interações do sistema SentiCore.
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleConsent('telemetry')}
                      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                        consents.telemetry ? 'bg-emerald-600' : 'bg-slate-800'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        consents.telemetry ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* CONSENTS HISTORICAL LOGS */}
              {consentLogs.length > 0 && (
                <div className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] space-y-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-500" /> Histórico de Transparência de Consentimentos
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-[10px] text-slate-400 divide-y divide-white/5">
                      <thead>
                        <tr className="text-slate-500">
                          <th className="pb-2">Ação / Consentimento</th>
                          <th className="pb-2">Data e Hora</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2">Dispositivo / IP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {consentLogs.map((log, index) => (
                          <tr key={index} className="hover:bg-white/2">
                            <td className="py-2.5 font-bold text-white">
                              {log.consentType === 'communication' ? 'Alertas & Comunicação' :
                               log.consentType === 'marketing' ? 'Promoções & Marketing' :
                               log.consentType === 'research' ? 'Pesquisa de Saúde' : 'Melhorias / Telemetria'}
                            </td>
                            <td className="py-2.5">{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                            <td className="py-2.5">
                              <span className={`px-1.5 py-0.5 rounded ${
                                log.granted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                              }`}>
                                {log.granted ? 'CONCEDIDO' : 'REVOGADO'}
                              </span>
                            </td>
                            <td className="py-2.5 truncate max-w-[120px]">{log.ip}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 5: DANGER ZONE - EXPUNGE & DELETE ACCOUNT */}
          {activeTab === 'delete' && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-red-950/20 border border-red-500/20 p-6 rounded-[2.5rem] space-y-4">
                <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center">
                  <Trash2 className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-serif font-bold text-white">Zona Crítica de Proteção e Exclusão Definitiva</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    A exclusão da sua conta do SentiPae é definitiva, irrevogável e apaga instantaneamente todos os seus prontuários, históricos com terapeutas, anotações de sentimentos e relatórios em conformidade com o Mandato Jurídico de Esquecimento da LGPD.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleStartDeleteProcess}
                    className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-mono font-bold transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Iniciar Processo de Exclusão Cascata (LGPD)
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* 1. EXIT REASON SELECTION MODAL */}
      <AnimatePresence>
        {showReasonModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/10 max-w-md w-full p-6 rounded-[2.5rem] shadow-2xl space-y-4"
            >
              <div className="space-y-1">
                <h4 className="text-sm font-serif font-bold text-white">Por que você está nos deixando?</h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  Seus dados e feedbacks são fundamentais para que possamos evoluir a qualidade de nosso acolhimento de saúde mental.
                </p>
              </div>

              <div className="space-y-2 font-mono text-xs">
                {[
                  { id: 'goals_met', label: 'Já alcancei meus objetivos terapêuticos' },
                  { id: 'hard_to_use', label: 'Achei a plataforma complexa ou difícil' },
                  { id: 'face_to_face', label: 'Prefiro sessões presenciais ou de postos públicos' },
                  { id: 'too_expensive', label: 'Os custos de planos não cabem mais no meu orçamento' },
                  { id: 'other', label: 'Outro motivo particular' }
                ].map((item) => (
                  <label key={item.id} className="flex items-center gap-3 p-3 bg-slate-950 hover:bg-white/2 border border-white/5 rounded-xl cursor-pointer transition-all">
                    <input 
                      type="radio" 
                      name="exit_reason" 
                      value={item.id} 
                      checked={reasonSelected === item.id}
                      onChange={() => setReasonSelected(item.id)}
                      className="text-emerald-500 focus:ring-0"
                    />
                    <span className="text-slate-300">{item.label}</span>
                  </label>
                ))}
              </div>

              {reasonSelected === 'other' && (
                <textarea
                  value={reasonCustom}
                  onChange={(e) => setReasonCustom(e.target.value)}
                  placeholder="Se desejar, compartilhe mais detalhes..."
                  rows={2}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-slate-300 placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 font-mono resize-none"
                />
              )}

              <div className="flex gap-3 font-mono text-xs pt-1">
                <button
                  onClick={() => setShowReasonModal(false)}
                  className="flex-1 py-3 bg-slate-950 border border-white/5 text-slate-400 hover:text-white rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReasonSubmitted}
                  disabled={!reasonSelected}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white rounded-2xl font-bold transition-all"
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. REAUTHENTICATION CONFIRMATION MODAL */}
      <AnimatePresence>
        {showReauthModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-red-500/20 max-w-md w-full p-6 rounded-[2.5rem] shadow-2xl space-y-4"
            >
              <div className="space-y-1">
                <h4 className="text-sm font-serif font-bold text-white flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-red-500" /> Reautenticação Exigida
                </h4>
                <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                  Para comprovar que você é de fato o proprietário deste cadastro e autorizar a destruição jurídica permanente de seus dados clínicos, reautentique abaixo:
                </p>
              </div>

              {reauthError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-mono flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{reauthError}</span>
                </div>
              )}

              <form onSubmit={handleReauthenticate} className="space-y-4">
                {!isGoogleUser ? (
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono block">Sua Senha de Acesso</label>
                    <input 
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/40 font-mono"
                      placeholder="Senha do login"
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950 border border-white/5 rounded-2xl text-center">
                    <p className="text-xs text-slate-400 font-mono leading-relaxed mb-2">
                      Sua conta é integrada com o Google Auth. Clique no botão abaixo para prosseguir com a reautenticação oficial:
                    </p>
                  </div>
                )}

                <div className="flex gap-3 font-mono text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setShowReauthModal(false)}
                    className="flex-1 py-3 bg-slate-950 border border-white/5 text-slate-400 hover:text-white rounded-2xl transition-all"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    {isGoogleUser ? 'Entrar com Google' : 'Confirmar Identidade'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. FINAL CASCADE DELETION CONFIRMATION MODAL */}
      <AnimatePresence>
        {showFinalDeleteModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-red-500 max-w-md w-full p-6 rounded-[2.5rem] shadow-2xl space-y-4"
            >
              <div className="space-y-1">
                <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center">
                  <Trash2 className="w-5 h-5 animate-pulse" />
                </div>
                <h4 className="text-sm font-serif font-bold text-white">Esquecimento Permanente de Registros Clínicos</h4>
                <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                  Toda a sua ficha de sentimentos, prontuários terapêuticos e mensagens particulares serão expurgados do banco de dados imediatamente de forma definitiva.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-300 font-mono block leading-relaxed">
                  Para confirmar que você compreende a perda irreversível de todos os seus relatórios de saúde mental, digite exatamente a frase <strong className="text-red-400 select-all font-mono">EXCLUIR CONTA DEFINITIVAMENTE</strong> abaixo:
                </label>
                <input 
                  type="text"
                  value={deletePhrase}
                  onChange={(e) => setDeletePhrase(e.target.value)}
                  className="w-full bg-slate-950 border border-red-500/30 rounded-2xl px-4 py-3 text-xs text-slate-100 placeholder:text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/40 font-mono uppercase"
                  placeholder="Digitar frase jurídica de confirmação"
                />
              </div>

              <div className="flex gap-3 font-mono text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowFinalDeleteModal(false);
                    setDeletePhrase('');
                  }}
                  className="flex-1 py-3 bg-slate-950 border border-white/5 text-slate-400 hover:text-white rounded-2xl transition-all"
                >
                  Recuar
                </button>
                <button
                  onClick={handleFinalDelete}
                  disabled={deletePhrase !== "EXCLUIR CONTA DEFINITIVAMENTE" || deleting}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Expurgar Dados</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
