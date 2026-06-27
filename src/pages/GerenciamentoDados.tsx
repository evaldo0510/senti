import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Save, 
  Check, 
  AlertCircle, 
  Sparkles,
  Smile,
  ShieldCheck,
  Download,
  Upload,
  Clock,
  FileJson,
  FileSpreadsheet,
  ShieldAlert,
  Loader2,
  Trash2,
  Server,
  RefreshCw,
  Activity,
  Shield,
  Database,
  Lock,
  Globe,
  Wifi,
  Crown,
  Search,
  DollarSign
} from "lucide-react";
import { auth, storage, db } from "../services/firebase";
import { collection, getDocs, doc, updateDoc, query, where, orderBy, limit } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { userService } from "../services/userService";
import { useSecurityAudit } from "../hooks/useSecurityAudit";
import { usePWA } from "../contexts/PWAContext";
import { offlineStorage } from "../services/offlineStorage";
import { UserProfile } from "../types";
import { cn } from "../lib/utils";
import { z } from "zod";

const AVATAR_PRESETS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Boots",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Cookie",
];

// Zod Validation Schema for Profile Data
const profileValidationSchema = z.object({
  nome: z.string()
    .min(3, { message: "O nome completo precisa de pelo menos 3 caracteres." })
    .max(80, { message: "O nome não pode passar de 80 caracteres." })
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { message: "O nome deve conter apenas letras." }),
  telefone: z.string()
    .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$|^$/, { message: "Telefone inválido. Use o formato: (XX) 99999-9999" })
    .optional()
    .or(z.literal("")),
  cidade: z.string()
    .max(60, { message: "A cidade não pode passar de 60 caracteres." })
    .optional()
    .or(z.literal("")),
  biografia: z.string()
    .max(400, { message: "Sua biografia deve possuir no máximo 400 caracteres." })
    .optional()
    .or(z.literal("")),
  fotoUrl: z.string()
    .url({ message: "Insira um endereço URL válido." })
    .or(z.literal(""))
    .optional(),
  abordagem: z.string()
    .max(80, { message: "A abordagem terapêutica deve ter no máximo 80 caracteres." })
    .optional()
    .or(z.literal("")),
});

interface AuditLog {
  id: string;
  timestamp: string;
  description: string;
  fieldsChanged?: string[];
  status: "sucesso" | "erro" | "alerta" | "suspeito";
  userId?: string;
}

interface BackupSnapshot {
  id: string;
  timestamp: string;
  backupType: "automatic_daily" | "manual_trigger";
  stats: {
    usersCount: number;
    diaryEntriesCount: number;
    emotionLogsCount: number;
    appointmentsCount: number;
  };
}

export default function GerenciamentoDados() {
  const navigate = useNavigate();
  const { logSecurityEvent } = useSecurityAudit();
  const pwa = usePWA();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // User Synchronization & Backup States
  const [lastUserSync, setLastUserSync] = useState<string | null>(null);
  const [unsyncedCount, setUnsyncedCount] = useState<number>(0);
  const [syncingUser, setSyncingUser] = useState<boolean>(false);

  // Load User Sync Info from local persistence and localStorage
  const loadUserSyncInfo = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // Read last sync timestamp
    const savedSync = localStorage.getItem(`last_firestore_sync_${user.uid}`);
    setLastUserSync(savedSync);

    // Fetch unsynced count from IndexedDB
    try {
      const unsynced = await offlineStorage.getUnsyncedMoods();
      setUnsyncedCount(unsynced ? unsynced.length : 0);
    } catch (e) {
      console.warn("Failed to read unsynced moods count:", e);
    }
  };
  
  // Tabs Navigation State
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'audits' | 'backups' | 'monitoring' | 'subscriptions'>('profile');
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const handleGenerateClinicalPDF = async () => {
    setGeneratingPDF(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      
      const user = auth.currentUser;
      const uid = user?.uid || "guest_demo_user";
      
      // 1. Fetch Diary Entries (from Firestore emotion_logs or IndexedDB or mock data fallback)
      let moods: any[] = [];
      if (uid === "guest_demo_user") {
        moods = [
          { value: 8, intensity: 6, note: "Sentindo-me muito focado e em paz hoje.", timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), triggers: ["Trabalho", "Meditação"] },
          { value: 4, intensity: 5, note: "Um pouco cansado devido à noite de sono curta.", timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), triggers: ["Sono"] },
          { value: 6, intensity: 7, note: "Pratiquei respiração guiada e me senti muito melhor.", timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), triggers: ["Saúde", "Exercício"] },
          { value: 2, intensity: 8, note: "Crise de ansiedade antes da apresentação comercial.", timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), triggers: ["Trabalho", "Ansiedade"] }
        ];
      } else {
        try {
          const q = query(
            collection(db, "emotion_logs"),
            where("userId", "==", uid),
            orderBy("timestamp", "desc"),
            limit(30)
          );
          const snap = await getDocs(q);
          moods = snap.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              value: data.value,
              intensity: data.intensity,
              note: data.emotion || data.note || 'Sem anotação',
              timestamp: data.timestamp,
              triggers: data.triggers || []
            };
          });
        } catch (err) {
          console.warn("Failed Firestore fetch, falling back to offline", err);
          const offlineList = await offlineStorage.getMoodsOffline(uid);
          if (offlineList && offlineList.length > 0) {
            moods = offlineList.map(entry => ({
              value: entry.value,
              intensity: entry.intensity,
              note: entry.emotion || 'Sem anotação',
              timestamp: entry.timestamp,
              triggers: entry.triggers || [],
            }));
          }
        }
      }

      // 2. Fetch IARA Memory (memoria_iara)
      let iaraMemory: any = null;
      if (uid === "guest_demo_user") {
        iaraMemory = {
          perfil: {
            nome: profile?.nome || "Paciente de Demonstração",
            emocaoAtual: "Tranquilo",
            padrao: "Ansiedade recorrente",
            intensidade: "baixa",
            preferencia: "voz suave"
          },
          historico: [
            { dia: 1, emocao: "Ansiedade leve", data: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
            { dia: 2, emocao: "Concentrado", data: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
            { dia: 3, emocao: "Calmo", data: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() }
          ]
        };
      } else {
        try {
          const { memoriaService } = await import("../services/memoriaService");
          iaraMemory = await memoriaService.buscarMemoria(uid);
        } catch (err) {
          console.warn("Failed fetching IARA memory:", err);
        }
      }

      // 3. Build beautiful PDF
      const primaryColor = [16, 185, 129]; // emerald-500
      const secondaryColor = [99, 102, 241]; // indigo-500
      const textColor = [30, 41, 59]; // slate-800
      const lightGray = [100, 116, 139]; // slate-500
      
      // Header Page 1
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("SENTÍ", 20, 20);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text("Pronto Socorro Emocional - Relatório de Compartilhamento Clínico", 20, 26);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 130, 20);
      
      // Divider
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 32, 190, 32);
      
      // Patient Info Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text("Identificação do Paciente", 20, 42);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Nome: ${profile?.nome || "Não informado"}`, 20, 50);
      doc.text(`E-mail: ${profile?.email || user?.email || "Não informado"}`, 20, 56);
      doc.text(`Telefone: ${profile?.telefone || "Não informado"}`, 20, 62);
      doc.text(`Cidade/Estado: ${profile?.cidade || "Não informado"}`, 20, 68);
      
      if (profile?.biografia) {
        doc.text("Biografia/Notas Adicionais:", 20, 74);
        const splitBio = doc.splitTextToSize(profile.biografia, 170);
        doc.text(splitBio, 20, 80);
      }
      
      const startY = profile?.biografia ? 95 : 78;
      
      // Divider
      doc.line(20, startY, 190, startY);
      
      // Section IARA Memory
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text("Dossiê de Interações & Perfil Clínico da IARA", 20, startY + 10);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      
      if (iaraMemory && iaraMemory.perfil) {
        doc.text(`Humor Recente Mapeado pela IA: ${iaraMemory.perfil.emocaoAtual || "Estável"}`, 20, startY + 18);
        doc.text(`Padrão Emocional Detectado: ${iaraMemory.perfil.padrao || "Não há padrões atípicos recorrentes."}`, 20, startY + 24);
        doc.text(`Intensidade Média dos Surtos: ${iaraMemory.perfil.intensidade || "Baixa"}`, 20, startY + 30);
        doc.text(`Preferência de Acolhimento: ${iaraMemory.perfil.preferencia || "Não definida"}`, 20, startY + 36);
      } else {
        doc.text("Histórico de perfil clínico com a IARA: Atividades iniciais de triagem em andamento.", 20, startY + 18);
      }
      
      // History Timeline with IARA
      let nextY = startY + 46;
      if (iaraMemory && iaraMemory.historico && iaraMemory.historico.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("Histórico Recente de Acolhimentos pela IARA:", 20, nextY);
        nextY += 8;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        iaraMemory.historico.slice(-5).forEach((h: any) => {
          const dateStr = h.data ? new Date(h.data).toLocaleDateString('pt-BR') : `Dia ${h.dia}`;
          doc.text(`• [${dateStr}] Estado de Triagem: ${h.emocao}`, 22, nextY);
          nextY += 6;
        });
      }
      
      nextY += 4;
      // Divider
      doc.setDrawColor(226, 232, 240);
      doc.line(20, nextY, 190, nextY);
      nextY += 10;
      
      // Section Diary entries
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("Histórico Detalhado do Diário de Sentimentos (Últimos Registros)", 20, nextY);
      nextY += 10;
      
      doc.setFontSize(9.5);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      
      if (moods.length === 0) {
        doc.setFont("helvetica", "normal");
        doc.text("Nenhum registro no diário localizado nos últimos 30 dias.", 20, nextY);
      } else {
        moods.forEach((m) => {
          if (nextY > 260) {
            doc.addPage();
            nextY = 25;
          }
          
          doc.setFont("helvetica", "bold");
          const mDate = m.timestamp ? new Date(m.timestamp).toLocaleDateString('pt-BR') + ' ' + new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : "Sem data";
          doc.text(`[${mDate}] Sintonia: ${m.value}/10 | Intensidade: ${m.intensity}/10`, 20, nextY);
          nextY += 5;
          
          doc.setFont("helvetica", "normal");
          if (m.triggers && m.triggers.length > 0) {
            doc.setFontSize(8.5);
            doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
            doc.text(`Gatilhos: ${m.triggers.join(", ")}`, 20, nextY);
            nextY += 4.5;
          }
          
          doc.setFontSize(9.5);
          doc.setTextColor(textColor[0], textColor[1], textColor[2]);
          const reflection = m.note ? `Reflexão: "${m.note}"` : "Sem notas adicionais.";
          const splitRef = doc.splitTextToSize(reflection, 170);
          doc.text(splitRef, 20, nextY);
          
          nextY += 6 + (splitRef.length * 4.5);
          
          doc.setDrawColor(241, 245, 249);
          doc.line(20, nextY - 2, 190, nextY - 2);
          nextY += 4;
        });
      }
      
      // Footer text (Compliance with LGPD / Medical advisory)
      if (nextY > 265) {
        doc.addPage();
        nextY = 25;
      }
      doc.setDrawColor(16, 185, 129);
      doc.line(20, nextY + 5, 190, nextY + 5);
      nextY += 12;
      
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text("Este documento unifica dados de autoavaliação emocional fornecidos de livre escolha pelo paciente.", 20, nextY);
      doc.text("Não constitui laudo clínico isolado e deve ser apresentado a um terapeuta, psicólogo ou médico de confiança.", 20, nextY + 4.5);
      doc.text("Senti S.A. • Privacidade garantida de acordo com as normas da LGPD e criptografia de ponta a ponta.", 20, nextY + 9);
      
      // Download PDF
      doc.save(`senti_relatorio_clinico_${profile?.nome?.toLowerCase().replace(/\s+/g, '_') || 'usuario'}.pdf`);
      
      logSecurityEvent("exportacao_dados", "Exportação de dossiê clínico e diário de interações IARA em PDF realizada pelo usuário.", ["clinical_pdf"], "sucesso");
      
      setMessage({ type: 'success', text: 'Dossiê Clínico em PDF gerado com sucesso! Pronto para compartilhamento.' });
    } catch (err: any) {
      console.error("Failed to generate PDF:", err);
      setMessage({ type: 'error', text: `Ocorreu um erro ao gerar o PDF: ${err.message || err}` });
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Subscriptions management states
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchUserQuery, setSearchUserQuery] = useState("");

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const list: UserProfile[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ uid: docSnap.id, ...docSnap.data() } as UserProfile);
      });
      setUsersList(list);
    } catch (err) {
      console.error("Failed to load users for subscription panel:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUpdateUserSubscription = async (userId: string, newPlan: string, newStatus: string) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        subscriptionPlan: newPlan,
        subscriptionStatus: newStatus,
        isPremium: newStatus === "active" || newStatus === "trial"
      });
      setMessage({ type: 'success', text: "Inscrição do usuário atualizada com sucesso no Firestore!" });
      setTimeout(() => setMessage(null), 5000);
      setUsersList(prev => prev.map(u => u.uid === userId ? { 
        ...u, 
        subscriptionPlan: newPlan as any, 
        subscriptionStatus: newStatus as any, 
        isPremium: newStatus === "active" || newStatus === "trial" 
      } : u));
    } catch (err) {
      console.error("Failed to update user subscription:", err);
      setMessage({ type: 'error', text: "Erro ao atualizar inscrição do usuário." });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  useEffect(() => {
    if (activeTab === 'subscriptions') {
      fetchUsers();
    }
  }, [activeTab]);

  // LGPD Permanent Deletion State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Secure Auditing States
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAudits, setLoadingAudits] = useState(false);

  // Backup States
  const [backups, setBackups] = useState<BackupSnapshot[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [triggeringBackup, setTriggeringBackup] = useState(false);

  // Target logs_auditoria / suspicious detection lists
  const [logsAuditoria, setLogsAuditoria] = useState<any[]>([]);
  const [loadingLogsAuditoria, setLoadingLogsAuditoria] = useState(false);
  const [simEmail, setSimEmail] = useState("terapeuta.privado@senti.app");
  const [simSuccess, setSimSuccess] = useState(false);
  const [simAtypical, setSimAtypical] = useState(false);
  const [simulating, setSimulating] = useState(false);

  // Security Filters States
  const [filterEmail, setFilterEmail] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterDate, setFilterDate] = useState("");

  // Password & Security Key states
  const [newPassword, setNewPassword] = useState("");
  const [loadingPass, setLoadingPass] = useState(false);
  const [passMessage, setPassMessage] = useState("");

  // Zod Form Errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Input states
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [biografia, setBiografia] = useState("");
  const [cidade, setCidade] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [estilo, setEstilo] = useState<'acolhedor' | 'provocador' | 'analitico' | 'pratico' | undefined>(undefined);
  const [abordagem, setAbordagem] = useState("");

  // Load User Data
  const loadProfile = async () => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const data = await userService.getUser(user.uid);
      if (data) {
        setProfile(data);
        setNome(data.nome || "");
        setTelefone(data.telefone || "");
        setBiografia(data.biografia || "");
        setCidade(data.cidade || "");
        setFotoUrl(data.fotoUrl || "");
        if (data.tipo === 'terapeuta') {
          setEstilo(data.estilo);
          setAbordagem(data.abordagem || "");
        }
      }
      await loadUserSyncInfo();
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [navigate]);

  // Load Secure Audit Logs from Server-side Cloud Functions simulation
  const fetchCloudAuditLogs = async () => {
    setLoadingAudits(true);
    try {
      const logs = await userService.getAuditLogsAPI();
      setAuditLogs(logs);
    } catch (err) {
      console.error("Failed to load secure audits:", err);
    } finally {
      setLoadingAudits(false);
    }
  };

  // Load Cloud-stored Backups
  const fetchBackupsList = async () => {
    setLoadingBackups(true);
    try {
      const list = await userService.getBackupsAPI();
      setBackups(list);
    } catch (err) {
      console.error("Failed to load backup list:", err);
    } finally {
      setLoadingBackups(false);
    }
  };

  // Load secure logs from log_auditoria
  const fetchLogsAuditoria = async () => {
    setLoadingLogsAuditoria(true);
    try {
      const logs = await userService.getLogsAuditoriaAPI();
      setLogsAuditoria(logs);
    } catch (err) {
      console.error("Failed to load logs_auditoria:", err);
    } finally {
      setLoadingLogsAuditoria(false);
    }
  };

  // Run security threat monitoring simulation for admin compliance auditing
  const handleSimulateLogin = async () => {
    setSimulating(true);
    setMessage(null);
    try {
      // Outlier IP from Europe/Asia or normal Brazilian IP
      const simulatedIp = simAtypical ? "109.112.56.241" : "189.120.14.77";
      const simulatedLocation = simAtypical 
        ? { country: "RU", city: "Moscow" } 
        : { country: "BR", city: "Rio de Janeiro" };

      const res = await userService.monitorLoginAPI(
        simEmail.trim(),
        simSuccess,
        simulatedIp,
        simulatedLocation,
        navigator.userAgent || "Mozilla/5.0 Compliance Simulator"
      );

      if (res.isSuspicious) {
        setMessage({
          type: "error",
          text: `🚨 [AMEAÇA CIBERNÉTICA DETECTADA] ${res.reason} Notificação enviada para o console do admin e evento registrado na coleção 'logs_auditoria' com status 'suspeito'!`
        });
      } else {
        setMessage({
          type: "success",
          text: `✓ Atividade de login normal processada. Evento de login (sucesso: ${simSuccess}) adicionado ao rastreador de segurança.`
        });
      }
      
      // Auto refresh the list
      await fetchLogsAuditoria();
    } catch (error: any) {
      console.error("Simulation error:", error);
      setMessage({ type: "error", text: `Falha no simulador de ameaças: ${error.message}` });
    } finally {
      setSimulating(false);
    }
  };

  // Load appropriate resources depending on selected tab
  useEffect(() => {
    if (activeTab === 'audits') {
      fetchCloudAuditLogs();
    } else if (activeTab === 'backups') {
      loadUserSyncInfo();
      fetchBackupsList();
    } else if (activeTab === 'monitoring') {
      fetchLogsAuditoria();
    }
  }, [activeTab]);

  // Handles Photo Upload securely via Firebase
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ type: 'error', text: 'Por favor, carregue somente arquivos de imagem.' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'A imagem de perfil deve conter no máximo 2MB.' });
      return;
    }

    setUploading(true);
    setFormErrors((prev) => ({ ...prev, fotoUrl: "" }));

    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("Usuário não autenticado");

      const storageRef = ref(storage, `users/${uid}/avatar_${Date.now()}_${file.name}`);
      const uploadResult = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(uploadResult.ref);

      setFotoUrl(url);
      setMessage({
        type: 'success',
        text: 'Imagem carregada com sucesso para o Firebase Storage!'
      });
      await userService.logAuditAPI("Carregamento de foto de perfil efetuado com sucesso via Storage.", ["Foto de Perfil"]);
    } catch (storageError) {
      console.warn("Storage upload failed, fallback to local Base64 string:", storageError);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        setFotoUrl(base64Url);
        setMessage({
          type: 'success',
          text: 'Imagem processada localmente. Ela será gravada diretamente em seu documento do Firestore.'
        });
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  // Save profile updates to current authenticated node
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !profile) return;

    setSaving(true);
    setMessage(null);
    setFormErrors({});

    const validationResult = profileValidationSchema.safeParse({
      nome: nome.trim(),
      telefone: telefone.trim(),
      cidade: cidade.trim(),
      biografia: biografia.trim(),
      fotoUrl: fotoUrl.trim(),
      abordagem: profile.tipo === 'terapeuta' ? abordagem.trim() : undefined
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setFormErrors(fieldErrors);
      setMessage({
        type: 'error',
        text: 'Falha na validação dos campos. Verifique as indicações em vermelho.'
      });
      setSaving(false);
      return;
    }

    const fieldsChanged: string[] = [];
    if (nome.trim() !== (profile.nome || "")) fieldsChanged.push("Nome");
    if (telefone.trim() !== (profile.telefone || "")) fieldsChanged.push("Telefone");
    if (biografia.trim() !== (profile.biografia || "")) fieldsChanged.push("Biografia");
    if (cidade.trim() !== (profile.cidade || "")) fieldsChanged.push("Cidade");
    if (fotoUrl.trim() !== (profile.fotoUrl || "")) fieldsChanged.push("Foto de Perfil");
    
    if (profile.tipo === 'terapeuta') {
      if (estilo !== profile.estilo) fieldsChanged.push("Estilo de Atendimento");
      if (abordagem.trim() !== (profile.abordagem || "")) fieldsChanged.push("Abordagem");
    }

    const updatedData: Partial<UserProfile> = {
      nome: nome.trim(),
      telefone: telefone.trim(),
      biografia: biografia.trim(),
      cidade: cidade.trim(),
      fotoUrl: fotoUrl.trim(),
    };

    if (profile.tipo === 'terapeuta') {
      updatedData.estilo = estilo;
      updatedData.abordagem = abordagem.trim();
    }

    try {
      await userService.updateProfile(user.uid, updatedData);
      
      // Notify secure server auditing endpoint of change
      if (fieldsChanged.length > 0) {
        await userService.logAuditAPI(`Alteração de dados cadastrais: modificados os campos [${fieldsChanged.join(", ")}]`, fieldsChanged, "sucesso");
      }

      setProfile((prev) => prev ? ({ ...prev, ...updatedData }) : null);
      setMessage({
        type: 'success',
        text: fieldsChanged.length > 0 
          ? 'Atualizações gravadas no Firestore com sucesso e registradas na auditoria imutável!'
          : 'Nenhum dado alterado. Seu perfil já está sincronizado.'
      });
      
      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      await userService.logAuditAPI(`Falha na atualização cadastral: ${error.message || error}`, fieldsChanged, "erro");
      setMessage({
        type: 'error',
        text: `Falha ao salvar atualizações no banco de dados: ${error.message}`
      });
    } finally {
      setSaving(false);
    }
  };

  // Forces manual synchronization of user's local database to Firestore
  const handleForceUserSync = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setSyncingUser(true);
    try {
      // Force PWA Context to sync offline data to Firestore
      await pwa.syncOfflineData();

      // Store sync timestamp in localStorage
      localStorage.setItem(`last_firestore_sync_${user.uid}`, new Date().toISOString());

      // Log secure audit event
      await logSecurityEvent("sincronizacao_dados", "Sincronização manual do diário e humores forçada para o Firestore com sucesso.", ["offline_sync"], "sucesso");

      setMessage({
        type: "success",
        text: "✓ Sincronização manual concluída! Seus registros locais foram salvos e sincronizados de forma segura no Firestore."
      });

      // Update sync info
      await loadUserSyncInfo();
    } catch (err: any) {
      console.error("Manual sync failed:", err);
      setMessage({
        type: "error",
        text: `Erro ao forçar sincronização: ${err.message || err}`
      });
    } finally {
      setSyncingUser(false);
    }
  };

  // Triggers manual backup creation via server API
  const handleTriggerBackup = async () => {
    setTriggeringBackup(true);
    try {
      const res = await userService.triggerBackupAPI();
      setMessage({
        type: 'success',
        text: `Backup MANUAL gerado com sucesso! Consolidado em ${new Date(res.timestamp).toLocaleTimeString()}`
      });
      fetchBackupsList();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Erro de permissão ao gerar backup" });
    } finally {
      setTriggeringBackup(false);
    }
  };

  // Execute LGPD Decisve Cascade Account Deletion
  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await userService.deleteAccountAPI();
      setShowDeleteModal(false);
      // Logged out & Purged completely! Clean local credentials and reload to sign out
      await auth.signOut();
      alert(res.message);
      navigate("/login");
    } catch (err: any) {
      console.error("Error deleting user account cascades:", err);
      alert(`Falha ao excluir conta: ${err.message || err}`);
    } finally {
      setDeleting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoadingPass(true);
    setPassMessage("");
    try {
      // For this app, update the secure E2EE / Clinic security passphrase
      await userService.updateProfile(profile.uid, {
        customKey: newPassword
      });
      
      // Log the security event: alteracao_senha
      await logSecurityEvent("alteracao_senha", "Chave ou senha de segurança clínica alterada com sucesso pelo usuário.", ["customKey"], "sucesso");
      
      setPassMessage("Senha / Chave clínica de segurança redefinida com sucesso!");
      setNewPassword("");
    } catch (err: any) {
      console.error("Erro ao alterar senha:", err);
      await logSecurityEvent("alteracao_senha", `Falha ao tentar alterar senha de segurança: ${err.message || err}`, ["customKey"], "erro");
      setPassMessage("Erro ao redefinir sua senha de segurança. Tente novamente.");
    } finally {
      setLoadingPass(false);
    }
  };

  // Human Portability Download (JSON)
  const downloadJSON = () => {
    if (!profile) return;
    const cleanProfile = { ...profile };
    const jsonStr = JSON.stringify(cleanProfile, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `meus_dados_estruturados_${profile.nome.toLowerCase().replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    userService.logAuditAPI("Download de cópia cadastral portátil efetuado em JSON pelo usuário.", [], "sucesso");
    logSecurityEvent("exportacao_dados", "Download de cópia cadastral portátil efetuado em JSON pelo usuário.", ["perfil_completo"], "sucesso");
  };

  // Human Portability Download (CSV Table)
  const downloadCSV = () => {
    if (!profile) return;
    const dataRows = [
      ["Campo", "Valor"],
      ["Identificador Primário", profile.uid],
      ["Nome de Registro", profile.nome],
      ["E-mail", profile.email],
      ["Telefone de Contato", profile.telefone || "Não fornecido"],
      ["Cidade/Estado", profile.cidade || "Não fornecido"],
      ["Função", profile.tipo],
      ["Histórico Biográfico", profile.biografia || "Nenhuma"]
    ];

    const csvContent = "\uFEFF" + dataRows.map(row => 
      row.map(value => `"${value.replace(/"/g, '""')}"`).join(",")
    ).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `prontuario_dados_${profile.nome.toLowerCase().replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    userService.logAuditAPI("Download de cópia cadastral portátil efetuado em CSV pelo usuário.", [], "sucesso");
    logSecurityEvent("exportacao_dados", "Download de cópia cadastral portátil efetuado em CSV pelo usuário.", ["perfil_completo"], "sucesso");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-slate-500 text-xs font-mono">Processando credenciais seguras...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Visual Identity Professional Shielding Header */}
      <header className="px-6 py-5 sticky top-0 bg-slate-950/95 backdrop-blur-md z-30 border-b border-emerald-500/10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 hover:bg-slate-900 border border-white/5 rounded-2xl transition-all active:scale-95"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              <h1 className="text-lg font-serif font-semibold text-white tracking-wide">
                Blindagem Profissional
              </h1>
              <span className="text-[9px] font-mono tracking-wider bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold uppercase py-0.5 px-2 rounded">
                Fase 1 Ativa
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono tracking-tight mt-0.5">
              Protocolos de Segurança Avançada & Compliance LGPD • Pronto Socorro Emocional
            </p>
          </div>
        </div>

        {/* Realtime Threat Indicators */}
        <div className="hidden md:flex items-center gap-4 bg-slate-900 px-4 py-2 border border-white/5 rounded-2xl">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 text-right">
            <div>
              <p className="font-bold text-slate-300">WAF & Rate Limiting</p>
              <p className="text-[10px] text-emerald-500">Monitoramento Ativo</p>
            </div>
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div className="border-l border-white/10 h-8" />
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="font-bold text-slate-300">SSL 256-bit</p>
              <p className="text-[10px] text-slate-500">Imutabilidade Ativa</p>
            </div>
          </div>
        </div>
      </header>

      {/* Internal Navigation Sub-tabs */}
      <div className="border-b border-white/5 bg-slate-900/40 sticky top-[73px] z-20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 overflow-x-auto flex gap-1 py-3 text-sm">
          <button
            onClick={() => setActiveTab('profile')}
            className={cn(
              "px-5 py-2.5 rounded-xl font-medium tracking-tight transition-all shrink-0 flex items-center gap-2 border active:scale-95",
              activeTab === 'profile'
                ? "bg-slate-800 text-white border-white/10 shadow-sm font-semibold"
                : "text-slate-400 hover:text-white border-transparent hover:bg-slate-900/60"
            )}
          >
            <User className="w-4 h-4 text-emerald-400" />
            Meus Dados Básicos
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={cn(
              "px-5 py-2.5 rounded-xl font-medium tracking-tight transition-all shrink-0 flex items-center gap-2 border active:scale-95",
              activeTab === 'security'
                ? "bg-slate-800 text-white border-white/10 shadow-sm font-semibold"
                : "text-slate-400 hover:text-white border-transparent hover:bg-slate-900/60"
            )}
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            Segurança & LGPD
          </button>

          <button
            onClick={() => setActiveTab('audits')}
            className={cn(
              "px-5 py-2.5 rounded-xl font-medium tracking-tight transition-all shrink-0 flex items-center gap-2 border active:scale-95",
              activeTab === 'audits'
                ? "bg-slate-800 text-white border-white/10 shadow-sm font-semibold"
                : "text-slate-400 hover:text-white border-transparent hover:bg-slate-900/60"
            )}
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            Auditoria Server (Imutável)
          </button>

          <button
            onClick={() => setActiveTab('backups')}
            className={cn(
              "px-5 py-2.5 rounded-xl font-medium tracking-tight transition-all shrink-0 flex items-center gap-2 border active:scale-95",
              activeTab === 'backups'
                ? "bg-slate-800 text-white border-white/10 shadow-sm font-semibold"
                : "text-slate-400 hover:text-white border-transparent hover:bg-slate-900/60"
            )}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            Resiliência & Backups
          </button>

          <button
            onClick={() => setActiveTab('monitoring')}
            className={cn(
              "px-5 py-2.5 rounded-xl font-medium tracking-tight transition-all shrink-0 flex items-center gap-2 border active:scale-95",
              activeTab === 'monitoring'
                ? "bg-slate-800 text-white border-white/10 shadow-sm font-semibold"
                : "text-slate-400 hover:text-white border-transparent hover:bg-slate-900/60"
            )}
          >
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            Detector de Ameaças & Login
          </button>

          {(profile?.tipo === 'admin' || profile?.tipo === 'super_admin') && (
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={cn(
                "px-5 py-2.5 rounded-xl font-medium tracking-tight transition-all shrink-0 flex items-center gap-2 border active:scale-95",
                activeTab === 'subscriptions'
                  ? "bg-slate-800 text-white border-white/10 shadow-sm font-semibold"
                  : "text-slate-400 hover:text-white border-transparent hover:bg-slate-900/60"
              )}
            >
              <Crown className="w-4 h-4 text-emerald-400" />
              Gestão de Assinaturas (Admin)
            </button>
          )}
        </div>
      </div>

      <main className="p-6 max-w-6xl mx-auto mt-6">
        
        {/* Error/Success Feedbacks */}
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-4 rounded-3xl flex items-start gap-3 border text-xs sm:text-sm max-w-3xl mx-auto mb-6",
              message.type === 'success' 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                : "bg-red-500/10 border-red-500/20 text-red-300"
            )}
          >
            {message.type === 'success' ? (
              <Check className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
            )}
            <div>
              <p className="font-bold">{message.type === 'success' ? 'Verificação de Segurança' : 'Eventualidade Detectada'}</p>
              <p className="mt-1 font-mono text-xs">{message.text}</p>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* TAB 1: Profile Editing */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <section className="lg:col-span-7 space-y-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-serif text-white italic flex items-center gap-2">
                    Edição Cadastral Protegida <Sparkles className="w-5 h-5 text-emerald-400" />
                  </h2>
                  <p className="text-xs text-slate-400">
                    Sua gravação é amparada pelas regras restritas do Firestore, garantindo isolamento total do documento do usuário contra vazamento cruzado.
                  </p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  {/* Photo Upload Card */}
                  <div className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] space-y-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Smile className="w-4 h-4 text-emerald-500" /> Identidade Visual & Avatar
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="relative group overflow-hidden w-24 h-24 rounded-3xl border-2 border-emerald-500/30 bg-slate-950 shrink-0">
                        {uploading ? (
                          <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center z-10">
                            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                          </div>
                        ) : null}
                        <img 
                          src={fotoUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"} 
                          alt="Foto de perfil" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <label 
                          htmlFor="avatar-uploader" 
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white text-[10px] font-mono"
                        >
                          <Upload className="w-5 h-5 mb-1 text-emerald-400" />
                          Upload
                        </label>
                        <input 
                          type="file" 
                          id="avatar-uploader" 
                          accept="image/*" 
                          onChange={handlePhotoUpload} 
                          className="hidden" 
                        />
                      </div>

                      <div className="flex-1 w-full space-y-3">
                        <label className="text-[11px] text-slate-500 font-mono block">
                          Clínicos e terapeutas recomendam usar fotos originais para gerar vínculo. Ou selecione um preset:
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {AVATAR_PRESETS.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setFotoUrl(preset);
                                setFormErrors((prev) => ({ ...prev, fotoUrl: "" }));
                              }}
                              className={cn(
                                "w-10 h-10 rounded-xl overflow-hidden border bg-slate-950 transition-all active:scale-90",
                                fotoUrl === preset ? "border-emerald-500 scale-105 shadow-md shadow-emerald-500/20" : "border-white/5 hover:border-white/20"
                              )}
                              aria-label={`Selecionar preset ${idx + 1}`}
                            >
                              <img src={preset} alt="preset" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">Endereço URL Direto da Imagem:</label>
                      <input 
                        type="url"
                        value={fotoUrl}
                        onChange={(e) => {
                          setFotoUrl(e.target.value);
                          if (formErrors.fotoUrl) setFormErrors((prev) => ({ ...prev, fotoUrl: "" }));
                        }}
                        className={cn(
                          "w-full bg-slate-950 border rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all font-mono",
                          formErrors.fotoUrl ? "border-red-500/50" : "border-white/5"
                        )}
                        placeholder="https://exemplo.com/foto.jpg"
                      />
                      {formErrors.fotoUrl && (
                        <p className="text-xs text-red-400 flex items-center gap-1 mt-1 font-mono">
                          <AlertCircle className="w-3.5 h-3.5" /> {formErrors.fotoUrl}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Personal Fields Card */}
                  <div className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Informações Primárias</h3>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                        <User className="w-3.5 h-3.5 text-slate-500" /> Nome Completo
                      </label>
                      <input 
                        type="text"
                        required
                        value={nome}
                        onChange={(e) => {
                          setNome(e.target.value);
                          if (formErrors.nome) setFormErrors((prev) => ({ ...prev, nome: "" }));
                        }}
                        className={cn(
                          "w-full bg-slate-950 border rounded-2xl px-4 py-3.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all",
                          formErrors.nome ? "border-red-500/50" : "border-white/5"
                        )}
                        placeholder="Seu nome completo"
                      />
                      {formErrors.nome && (
                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-mono">
                          <AlertCircle className="w-3.5 h-3.5" /> {formErrors.nome}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-500" /> WhatsApp
                        </label>
                        <input 
                          type="tel"
                          value={telefone}
                          onChange={(e) => {
                            setTelefone(e.target.value);
                            if (formErrors.telefone) setFormErrors((prev) => ({ ...prev, telefone: "" }));
                          }}
                          className={cn(
                            "w-full bg-slate-950 border rounded-2xl px-4 py-3.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all font-mono",
                            formErrors.telefone ? "border-red-500/50" : "border-white/5"
                          )}
                          placeholder="(11) 99999-9999"
                        />
                        {formErrors.telefone && (
                          <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-mono">
                            <AlertCircle className="w-3.5 h-3.5" /> {formErrors.telefone}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" /> Cidade / UF
                        </label>
                        <input 
                          type="text"
                          value={cidade}
                          onChange={(e) => {
                            setCidade(e.target.value);
                            if (formErrors.cidade) setFormErrors((prev) => ({ ...prev, cidade: "" }));
                          }}
                          className={cn(
                            "w-full bg-slate-950 border rounded-2xl px-4 py-3.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all",
                            formErrors.cidade ? "border-red-500/50" : "border-white/5"
                          )}
                          placeholder="Cidade - UF"
                        />
                        {formErrors.cidade && (
                          <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-mono">
                            <AlertCircle className="w-3.5 h-3.5" /> {formErrors.cidade}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 pt-2">
                      <label className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
                        <Mail className="w-3.5 h-3.5 text-slate-600" /> E-mail (Verificado por Autenticação)
                      </label>
                      <div className="bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 flex items-center justify-between text-xs sm:text-sm text-slate-400 font-mono">
                        <span>{profile?.email}</span>
                        <span className="text-[9px] bg-slate-900 border border-white/10 px-2 py-0.5 rounded text-emerald-500 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-emerald-500" /> Criptografado
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Biography Card */}
                  <div className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Minha Jornada / Biografia</h3>
                    <textarea 
                      value={biografia}
                      onChange={(e) => {
                        setBiografia(e.target.value);
                        if (formErrors.biografia) setFormErrors((prev) => ({ ...prev, biografia: "" }));
                      }}
                      rows={4}
                      className={cn(
                        "w-full bg-slate-950 border rounded-2xl p-4 text-xs sm:text-sm text-slate-100 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all resize-none",
                        formErrors.biografia ? "border-red-500/50" : "border-white/5"
                      )}
                      placeholder="Fale um pouco sobre você, seu foco de autoconhecimento ou histórico psicoterápico..."
                    />
                    {formErrors.biografia && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-mono">
                        <AlertCircle className="w-3.5 h-3.5" /> {formErrors.biografia}
                      </p>
                    )}
                  </div>

                  {/* Clinical Settings */}
                  {profile?.tipo === 'terapeuta' && (
                    <div className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] space-y-4">
                      <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" /> Configurações de Atendimento Clínico (Terapeuta)
                      </h3>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-mono">Estilo Terapêutico Dominante:</label>
                        <select
                          value={estilo || ""}
                          onChange={(e) => setEstilo(e.target.value as any)}
                          className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        >
                          <option value="" disabled>Selecione um estilo...</option>
                          <option value="acolhedor">Acolhedor (Foco empático e acolhimento caloroso)</option>
                          <option value="analitico">Analítico (Abordagem de investigação do inconsciente)</option>
                          <option value="provocador">Provocador (Desafia de forma técnica os pensamentos automáticos)</option>
                          <option value="pratico">Prático (Abordagem focada em métodos e planos pragmáticos)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-mono">Abordagem Psicológica de Trabalho:</label>
                        <input 
                          type="text"
                          value={abordagem}
                          onChange={(e) => setAbordagem(e.target.value)}
                          className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                          placeholder="Ex: TCC (Cognitivo Comportamental), Psicanálise Lacaniana, Gestalt..."
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-700/20 active:scale-95 flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Gravando nos servidores do Firestore...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Persistir Alterações Básicas</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </section>

              {/* Sidebar with Portability features */}
              <section className="lg:col-span-5 space-y-6">
                
                {/* Data Portability Card */}
                <div className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                      <Download className="w-4 h-4 text-emerald-400" /> Cópia Portátil de Dados (LGPD)
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-mono">
                      Em estrita observância ao Artigo 18 da Lei Geral de Proteção de Dados (LGPD), você pode baixar um arquivo estruturado de suas informações a qualquer momento.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={downloadJSON}
                      className="p-4 bg-slate-950 hover:bg-slate-800 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <FileJson className="w-5 h-5 text-emerald-400" />
                      <span className="text-[10px] font-bold">Portabilidade JSON</span>
                    </button>

                    <button
                      onClick={downloadCSV}
                      className="p-4 bg-slate-950 hover:bg-slate-800 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                      <span className="text-[10px] font-bold">Baixar Tabela CSV</span>
                    </button>
                  </div>
                </div>

                {/* Cloud security facts */}
                <div className="bg-slate-900/60 border border-white/5 p-6 rounded-[2.5rem] space-y-3 font-mono text-xs text-slate-500">
                  <h4 className="font-bold text-slate-300 uppercase tracking-widest text-[10px] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Diretrizes de Blindagem
                  </h4>
                  <ul className="space-y-2 list-disc pl-4 leading-relaxed text-[11px]">
                    <li>Seus prontuários, diários de sentimentos e comunicações via chat são cifrados localmente e na nuvem.</li>
                    <li>Nenhuma modificação pode ser efetuada no Firestore sem as credenciais criptográficas de ID token ativas do próprio usuário.</li>
                  </ul>
                </div>
              </section>
            </motion.div>
          )}

          {/* TAB 2: Advanced Security & LGPD */}
          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] space-y-6">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-serif text-white font-bold">
                    Exclusão Definitiva de Conta (Lei Geral de Proteção de Dados)
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono">
                    Conforme o direito de eliminação e esquecimento do titular dos dados, ao solicitar a exclusão de conta, nosso servidor iniciará uma rotina destrutiva em cascata nas tabelas do Firestore (incluindo anamneses, prontuários privados, mensagens de socorro, registros de humor e faturas de Stripe) e eliminará seu registro criptográfico final no Firebase Authentication.
                  </p>
                </div>

                <div className="border border-red-500/20 bg-red-500/5 p-4 rounded-3xl text-xs leading-relaxed text-red-300 font-mono">
                  <p className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-500" /> Ação Irreversível e Imediata
                  </p>
                  <p className="mt-1">
                    Esta exclusão é executada do lado do servidor via Admin SDK de alta segurança. Seus dados clínicos e de contatos profissionais serão perdidos definitivamente, impossibilitando qualquer posterior recuperação por nossa equipe de contingência técnica.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="py-3 px-6 bg-red-950/40 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/20 rounded-2xl font-bold font-mono text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Iniciar Processo de Exclusão Cascata</span>
                  </button>
                </div>
              </div>

              {/* Immutable Security Log Form (Redefinição de Senha de Segurança) */}
              <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] space-y-6">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-serif text-white font-bold">
                    Redefinição de Senha e Chaves de Segurança Clínica
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono">
                    Atualize sua senha ou código secreto para a cifragem de prontuários médicos. Em concordância com os princípios de <strong>Auditoria Imutável</strong>, cada redefinição de credenciais de segurança é gravada instantaneamente no Firestore para rastreabilidade perpétua.
                  </p>
                </div>

                {passMessage && (
                  <div className={`p-4 rounded-2xl text-xs font-mono border ${passMessage.includes("Erro") ? "bg-red-500/5 text-red-300 border-red-500/20" : "bg-emerald-500/5 text-emerald-300 border-emerald-500/20"}`}>
                    {passMessage}
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nova Senha ou Código Clínico</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite seu novo código/senha clínica secreto"
                      className="w-full bg-slate-950 px-4 py-3 rounded-2xl border border-white/5 text-slate-200 text-sm focus:outline-none focus:border-blue-500/50"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loadingPass || !newPassword.trim()}
                    className="py-3 px-6 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-mono text-xs font-bold rounded-2xl transition-all"
                  >
                    {loadingPass ? "Processando..." : "Confirmar Alteração de Senha"}
                  </button>
                </form>
              </div>

              {/* Dynamic Rate Limiting & Firewall Status Indicator */}
              <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] space-y-6">
                <div>
                  <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" /> Limitador Dinâmico de Tráfego (Rate Limiting)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Proteção ativa contra ataques DDoS, abuso de chamadas de API de prontuário, tentativas de força bruta na autenticação e raspagem de dados clínicos de terapeutas.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950 border border-white/5 rounded-2xl flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 font-mono uppercase font-bold">API Geral</p>
                      <p className="text-xs text-slate-300 font-mono font-bold">Máx 150 req / 15 min</p>
                    </div>
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                      Seguro
                    </span>
                  </div>

                  <div className="p-4 bg-slate-950 border border-white/5 rounded-2xl flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 font-mono uppercase font-bold">API Segurança / LGPD</p>
                      <p className="text-xs text-slate-300 font-mono font-bold">Máx 12 req / 15 min</p>
                    </div>
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                      Seguro
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 border border-white/5 rounded-2xl flex items-center gap-3 text-xs text-slate-500 font-mono">
                  <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Seu endereço IP de acesso atual é monitorado pelo filtro de rede em nosso container Cloud Run.</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: Immutable System Audit timeline */}
          {activeTab === 'audits' && (
            <motion.div
              key="audits"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h2 className="text-xl font-serif text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-400" /> Trilha de Auditoria Imutável do Servidor
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Registros capturados em tempo real por nossas barreiras Express API. Atualizações e exclusões nesta coleção são negadas terminantemente pelas regras de segurança de nível de banco de dados.
                  </p>
                </div>

                <button
                  onClick={fetchCloudAuditLogs}
                  disabled={loadingAudits}
                  className="p-3 hover:bg-slate-900 border border-white/5 rounded-2xl text-slate-400 hover:text-white transition-all disabled:opacity-50"
                  aria-label="Atualizar Logs"
                >
                  <RefreshCw className={cn("w-4 h-4", loadingAudits && "animate-spin")} />
                </button>
              </div>

              {loadingAudits ? (
                <div className="p-12 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                  <p className="text-slate-500 text-xs font-mono">Sincronizando logs de banco de dados...</p>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="p-12 bg-slate-900/60 border border-dashed border-white/5 rounded-[2.5rem] text-center space-y-4">
                  <ShieldCheck className="w-12 h-12 text-emerald-500/20 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-300">Nenhum Log de Servidor Encontrado</p>
                    <p className="text-xs text-slate-500 font-mono">Ações que modificam seus dados cadastrais ou solicitam portabilidade registrarão eventos aqui permanentemente.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="p-4 bg-slate-900 border border-white/5 rounded-3xl flex items-start gap-4 text-xs font-mono leading-relaxed"
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                        log.status === "sucesso" ? "bg-emerald-500/10 text-emerald-400" :
                        log.status === "erro" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
                      )}>
                        {log.status === "sucesso" ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                      </div>

                      <div className="space-y-2 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-500 text-[10px]">
                          <span>ID de Registro: {log.id || "LGD_SVC"}</span>
                          <span>{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                        </div>
                        <p className="text-slate-200 font-semibold text-xs">{log.description}</p>
                        {log.fieldsChanged && log.fieldsChanged.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {log.fieldsChanged.map((f, i) => (
                              <span key={i} className="text-[9px] bg-slate-950 border border-white/10 px-2 py-0.5 rounded text-slate-400">
                                {f}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: Disaster Recovery Backups panel */}
          {activeTab === 'backups' && (
            <motion.div
              key="backups"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              {/* Part 1: Personal User Data Sync & Backup Status (For all users) */}
              <div className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-serif text-white flex items-center gap-2">
                      <Database className="w-5 h-5 text-emerald-400" /> Sincronização e Backup no Firestore
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">
                      Gerencie as cópias de segurança de seus sentimentos e relatórios clínicos na nuvem segura do Firebase.
                    </p>
                  </div>

                  <button
                    onClick={handleForceUserSync}
                    disabled={syncingUser}
                    className="py-3 px-5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl font-bold font-mono text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 active:scale-95 shrink-0"
                  >
                    {syncingUser ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    <span>Sincronizar Agora</span>
                  </button>
                </div>

                {/* Grid stats for user backup info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Last Sync Info */}
                  <div className="p-5 bg-slate-950 border border-white/5 rounded-3xl flex items-start gap-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Última Sincronização</span>
                      <p className="text-sm font-bold text-slate-100 font-mono">
                        {lastUserSync ? new Date(lastUserSync).toLocaleString('pt-BR') : "Nenhum backup sincronizado ainda"}
                      </p>
                      <p className="text-[10.5px] text-slate-500 font-mono leading-relaxed">
                        Data e hora do último upload bem-sucedido de seus dados para o Firestore.
                      </p>
                    </div>
                  </div>

                  {/* Unsynced offline data count */}
                  <div className="p-5 bg-slate-950 border border-white/5 rounded-3xl flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-2xl border shrink-0",
                      unsyncedCount > 0 
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    )}>
                      <Wifi className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Registros Offline Pendentes</span>
                      <p className={cn(
                        "text-lg font-black font-mono",
                        unsyncedCount > 0 ? "text-amber-400" : "text-emerald-400"
                      )}>
                        {unsyncedCount}
                      </p>
                      <p className="text-[10.5px] text-slate-500 font-mono leading-relaxed">
                        Registros guardados em cache local (IndexedDB) aguardando conexão com o Firestore.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional disclaimer info */}
                <div className="p-4 bg-slate-950/60 border border-white/5 rounded-2xl flex items-start gap-3 text-slate-500 font-mono text-[11px] leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-400">Preservação de Dados de Extrema Privacidade</p>
                    <p className="mt-1 text-[10px]">
                      Sempre que você estiver offline ou com redes instáveis, seu progresso emocional é guardado localmente e criptografado de forma segura no dispositivo. Ao restabelecer conexão de rede ou forçar manualmente a sincronização acima, nosso motor atualiza e consolida as novidades na sua conta dedicada em nuvem (Google Cloud Firestore).
                    </p>
                  </div>
                </div>
              </div>

              {/* Part 1.5: PDF Summary and Clinical Dossier Export (For all users to share with specialists) */}
              <div className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-serif text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-400" /> Exportar Dossiê Clínico (PDF)
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">
                      Compartilhe suas anotações do diário emocional e histórico de triagens da IARA com seus médicos e psicólogos.
                    </p>
                  </div>

                  <button
                    onClick={handleGenerateClinicalPDF}
                    disabled={generatingPDF}
                    className="py-3 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-bold font-mono text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-700/20 active:scale-95 shrink-0 cursor-pointer"
                  >
                    {generatingPDF ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>Gerar PDF Completo</span>
                  </button>
                </div>

                <div className="p-5 bg-slate-950 border border-white/5 rounded-3xl flex items-start gap-4">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20 shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Conteúdo do Dossiê Clínico</span>
                    <ul className="text-xs text-slate-300 font-mono space-y-1 list-disc list-inside">
                      <li>Dados de Identificação do Paciente</li>
                      <li>Histórico consolidado do Diário de Sentimentos (últimos 30 check-ins)</li>
                      <li>Avaliação emocional recente mapeada pela IA</li>
                      <li>Padrões de surtos/sintomas detectados pela IARA</li>
                      <li>Linha do tempo de triagens e encaminhamentos</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 border border-white/5 rounded-2xl flex items-start gap-3 text-slate-500 font-mono text-[11px] leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-400">Proteção de Dados Sensíveis e LGPD</p>
                    <p className="mt-1 text-[10px]">
                      Este arquivo PDF é gerado inteiramente no lado do cliente com criptografia em trânsito, garantindo que suas notas mais íntimas não sejam expostas a terceiros sem seu consentimento expresso.
                    </p>
                  </div>
                </div>
              </div>

              {/* Part 2: Disaster Recovery / Administrative System Backups (Admin only) */}
              <div className="border-t border-white/5 pt-6 space-y-6">
                {profile?.tipo !== 'admin' && profile?.tipo !== 'super_admin' ? (
                  <div className="p-6 bg-slate-900/60 border border-dashed border-white/5 rounded-[2.5rem] flex items-center gap-4">
                    <Lock className="w-10 h-10 text-slate-600 shrink-0" />
                    <div className="space-y-1 text-slate-500 font-mono text-xs">
                      <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Rotinas de Contingência do Servidor</p>
                      <p className="text-[10.5px]">
                        Backups diários automatizados e snapshots de resiliência sistêmica na nuvem são geridos de forma independente por administradores. Seu prontuário individual já está resguardado no painel acima.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-lg font-serif text-white flex items-center gap-2">
                          <Server className="w-5 h-5 text-emerald-400" /> Resiliência Sistêmica & Backups Gerais (Administrativo)
                        </h3>
                        <p className="text-xs text-slate-400 font-mono">
                          Painel exclusivo para controle e criação de snapshots redundantes diários para recuperação de desastres do sistema.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={fetchBackupsList}
                          disabled={loadingBackups}
                          className="p-3 hover:bg-slate-900 border border-white/5 rounded-2xl text-slate-400 hover:text-white transition-all disabled:opacity-50"
                          aria-label="Atualizar Backups"
                        >
                          <RefreshCw className={cn("w-4 h-4", loadingBackups && "animate-spin")} />
                        </button>

                        <button
                          onClick={handleTriggerBackup}
                          disabled={triggeringBackup}
                          className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl font-bold font-mono text-xs transition-all flex items-center gap-1.5"
                        >
                          {triggeringBackup ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Database className="w-4 h-4" />
                          )}
                          <span>Gerar Snapshot Manual</span>
                        </button>
                      </div>
                    </div>

                    {loadingBackups ? (
                      <div className="p-12 text-center space-y-3">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                        <p className="text-slate-500 text-xs font-mono">Recuperando registros de cópia de segurança...</p>
                      </div>
                    ) : backups.length === 0 ? (
                      <div className="p-12 bg-slate-900/60 border border-dashed border-white/5 rounded-[2.5rem] text-center space-y-4">
                        <Database className="w-12 h-12 text-emerald-500/25 mx-auto" />
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-300 font-serif">Banco de Backups Vazio</p>
                          <p className="text-xs text-slate-500 font-mono">O servidor inicializará a primeira rotina de backup de contingência nas próximas horas. Crie uma cópia manual instantânea acima para demonstrar conformidade.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {backups.map((b) => (
                          <div 
                            key={b.id} 
                            className="p-5 bg-slate-900 border border-white/5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs leading-relaxed"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "text-[9px] font-bold py-0.5 px-2 rounded uppercase",
                                  b.backupType === "automatic_daily" ? "bg-blue-950 border border-blue-900 text-blue-400" : "bg-emerald-950 border border-emerald-900 text-emerald-400"
                                )}>
                                  {b.backupType === "automatic_daily" ? "Automático Diário" : "Consolidação Manual"}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  Snap_ID: {b.id.substring(0, 10)}...
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 font-bold">
                                Efetuado em: {new Date(b.timestamp).toLocaleString('pt-BR')}
                              </p>
                            </div>

                            <div className="border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-4 space-y-1 text-slate-400">
                              <p className="text-[10px] uppercase font-bold text-slate-500">Objetos Persistidos:</p>
                              <p className="text-[11px]">
                                👥 Usuários: {b.stats?.usersCount || 0} • 📖 Diários: {b.stats?.diaryEntriesCount || 0}
                              </p>
                              <p className="text-[11px]">
                                ❤️ Humores: {b.stats?.emotionLogsCount || 0} • 📅 Sessões: {b.stats?.appointmentsCount || 0}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 5: Live Suspicious Login Activity Tracker & Threat Simulator */}
          {activeTab === 'monitoring' && (
            profile?.tipo !== 'admin' && profile?.tipo !== 'super_admin' ? (
              <motion.div
                key="monitoring-locked"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-md mx-auto text-center p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] space-y-6"
              >
                <div className="w-16 h-16 bg-red-400/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto border border-red-500/20">
                  <Lock className="w-8 h-8 text-red-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-serif text-white font-bold">Monitor Administrativo Restrito</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono">
                    O detector de ameaças e monitor de login (logs_auditoria) é exclusivo para usuários com perfil de administrador.
                  </p>
                </div>
                <div className="p-4 bg-slate-950 border border-white/5 rounded-2xl text-left font-mono text-[11px] text-slate-500 space-y-1">
                  <p>ID do Usuário: <span className="text-slate-400">{profile?.uid || "não identificado"}</span></p>
                  <p>Email: <span className="text-slate-400">{profile?.email || "não identificado"}</span></p>
                  <p>Tipo de Perfil: <span className="text-red-400 font-bold uppercase">{profile?.tipo || "indefinido"}</span></p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="monitoring"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full"
              >
                {/* Stats Metrics Row */}
                <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-900 border border-white/5 p-5 rounded-[2rem] flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500/10 text-red-400 border border-red-500/25 rounded-2xl flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Alertas Suspeitos</h4>
                      <p className="text-xl font-bold text-red-400 mt-1">
                        {logsAuditoria.filter(log => log.operationType === "ALERTA_LOGIN_SUSPEITO").length}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-white/5 p-5 rounded-[2rem] flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500/10 text-amber-400 border border-amber-500/25 rounded-2xl flex items-center justify-center shrink-0">
                      <AlertCircle className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Tentativas Falhas</h4>
                      <p className="text-xl font-bold text-amber-400 mt-1">
                        {logsAuditoria.filter(log => log.operationType === "TENTATIVA_LOGIN_FALHADA").length}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-white/5 p-5 rounded-[2rem] flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 text-blue-400 border border-blue-500/25 rounded-2xl flex items-center justify-center shrink-0">
                      <Globe className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Acessos Estrangeiros</h4>
                      <p className="text-xl font-bold text-blue-400 mt-1">
                        {logsAuditoria.filter(log => log.location?.country !== "BR" && log.location).length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simulator Column */}
                <section className="lg:col-span-4 space-y-6">
                  <div className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-sm font-serif font-semibold text-white flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-emerald-400" />
                        Simulador de Ameaças
                      </h3>
                      <p className="text-[10.5px] text-slate-400 font-mono">
                        Desencadeie testes funcionais para verificar a blindagem ativa de mitigação contra invasões em tempo real.
                      </p>
                    </div>

                    <div className="space-y-4 font-mono text-xs">
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-bold">Email de Tentativa:</label>
                        <input 
                          type="email" 
                          value={simEmail}
                          onChange={(e) => setSimEmail(e.target.value)}
                          className="w-full bg-slate-950 border border-white/5 rounded-2xl p-3 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          placeholder="Nome da conta a simular"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-950 border border-white/5 rounded-2xl">
                        <span className="text-slate-300">Autenticação com Sucesso:</span>
                        <button
                          type="button"
                          onClick={() => setSimSuccess(!simSuccess)}
                          className={cn(
                            "px-3 py-1 rounded-xl text-[10px] font-bold transition-all",
                            simSuccess ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                          )}
                        >
                          {simSuccess ? "SUCESSO" : "FALHA"}
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-950 border border-white/5 rounded-2xl">
                        <div>
                          <p className="text-slate-300">Geolocalização Atípica:</p>
                          <p className="text-[9px] text-slate-500">Simular IP estrangeiro de risco</p>
                        </div>
                        <input 
                          type="checkbox"
                          checked={simAtypical}
                          onChange={(e) => setSimAtypical(e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-white/10 bg-slate-950"
                        />
                      </div>

                      <button
                        onClick={handleSimulateLogin}
                        disabled={simulating}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-950"
                      >
                        {simulating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Activity className="w-4 h-4" />
                        )}
                        <span>Lançar Vetor de Login</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-3xl space-y-3 font-mono text-[10.5px] leading-relaxed text-slate-400">
                    <p className="text-white font-bold flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      Critérios de Classificação:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>3 ou mais falhas na mesma conta num periodo de 10 min.</li>
                      <li>Qualquer acesso proveniente de país fora do Brasil (atípico).</li>
                    </ul>
                    <p className="text-slate-500 text-[10px] mt-2">
                      *Toda infração gera um registro do tipo <strong className="text-red-400">ALERTA_LOGIN_SUSPEITO</strong> na coleção de auditoria e printa um aviso com trace no console do servidor.
                    </p>
                  </div>
                </section>

                {/* Log List Column */}
                <section className="lg:col-span-8 space-y-6">
                  {/* Filters Bar Card */}
                  <div className="bg-slate-900 border border-white/5 p-5 rounded-[2rem] space-y-4">
                    <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Filtros de Auditoria Especializados</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* filter by dynamic text search (user email, etc) */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-500">Usuário / Email ID</label>
                        <input
                          type="text"
                          value={filterEmail}
                          onChange={(e) => setFilterEmail(e.target.value)}
                          placeholder="Ex: terapeuta.privado..."
                          className="w-full bg-slate-950 border border-white/5 rounded-xl p-2 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      {/* filter by event type enum */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-500">Tipo de Evento</label>
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="w-full bg-slate-950 border border-white/5 rounded-xl p-2 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 selection:bg-slate-800"
                        >
                          <option value="ALL">TODOS OS REQUISITOS</option>
                          <option value="ALERTA_LOGIN_SUSPEITO">APENAS SUSPEITOS</option>
                          <option value="LOGIN_BEM_SUCEDIDO">APENAS LOGIN RECONHECIDO</option>
                          <option value="TENTATIVA_LOGIN_FALHADA">APENAS TENTATIVAS FALHADAS</option>
                        </select>
                      </div>

                      {/* filter by date picker */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-500">Filtrar por Data</label>
                        <input
                          type="date"
                          value={filterDate}
                          onChange={(e) => setFilterDate(e.target.value)}
                          className="w-full bg-slate-950 border border-white/5 rounded-xl p-2 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-serif italic text-white flex items-center gap-2">
                        Logs de Acesso Ativos (logs_auditoria)
                      </h3>
                      <p className="text-xs text-slate-400">
                        Monitor em tempo real de acessos críticos e comportamentos suspeitos.
                      </p>
                    </div>

                    <button
                      onClick={fetchLogsAuditoria}
                      disabled={loadingLogsAuditoria}
                      className="p-3 hover:bg-slate-900 border border-white/5 rounded-2xl text-slate-400 hover:text-white transition-all disabled:opacity-50"
                      aria-label="Recarregar"
                    >
                      <RefreshCw className={cn("w-4 h-4", loadingLogsAuditoria && "animate-spin")} />
                    </button>
                  </div>

                  {loadingLogsAuditoria ? (
                    <div className="p-16 text-center space-y-3">
                      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                      <p className="text-slate-500 text-xs font-mono">Lendo registros de auditoria...</p>
                    </div>
                  ) : logsAuditoria.length === 0 ? (
                    <div className="p-16 bg-slate-900/60 border border-dashed border-white/5 rounded-[2.5rem] text-center space-y-4">
                      <ShieldCheck className="w-12 h-12 text-emerald-500/25 mx-auto" />
                      <div>
                        <p className="text-sm font-semibold text-slate-300 font-serif">Nenhum evento registrado</p>
                        <p className="text-xs text-slate-500 font-mono mt-1">Interaja com o simulador à esquerda para preencher a fila em tempo real.</p>
                      </div>
                    </div>
                  ) : (
                    (() => {
                      const filtered = logsAuditoria.filter((log: any) => {
                        if (filterEmail) {
                          const query = filterEmail.toLowerCase().trim();
                          const matchesId = log.userId?.toLowerCase().includes(query) || false;
                          const matchesDesc = log.description?.toLowerCase().includes(query) || false;
                          if (!matchesId && !matchesDesc) return false;
                        }
                        if (filterType !== "ALL") {
                          if (log.operationType !== filterType) return false;
                        }
                        if (filterDate) {
                          const logDate = new Date(log.timestamp).toISOString().split("T")[0];
                          if (logDate !== filterDate) return false;
                        }
                        return true;
                      });

                      return filtered.length === 0 ? (
                        <div className="p-16 bg-slate-900/60 border border-dashed border-white/5 rounded-[2.5rem] text-center space-y-2">
                          <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
                          <p className="text-sm font-semibold text-slate-300 font-serif">Sem ocorrências correspondentes</p>
                          <p className="text-xs text-slate-500 font-mono">Modifique os valores dos filtros especializados acima para refinar a busca.</p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                          {filtered.map((log: any) => {
                            const isAlert = log.operationType === "ALERTA_LOGIN_SUSPEITO";
                            return (
                              <div 
                                key={log.id}
                                className={cn(
                                  "p-5 bg-slate-900 border rounded-3xl font-mono text-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all leading-relaxed",
                                  isAlert ? "border-red-500/20 bg-red-950/5" : "border-white/5"
                                )}
                              >
                                <div className="space-y-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    {isAlert ? (
                                      <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-bold py-0.5 px-2 rounded uppercase animate-pulse">
                                        SUSPEITO
                                      </span>
                                    ) : (
                                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-[9px] font-bold py-0.5 px-2 rounded uppercase">
                                        NORMAL
                                      </span>
                                    )}
                                    <span className="text-[10px] text-slate-500 font-bold">{log.operationType}</span>
                                    <span className="text-[10px] text-slate-500">• {new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                                  </div>

                                  <p className={cn("text-xs leading-relaxed", isAlert ? "text-red-300" : "text-slate-300")}>
                                    {log.description}
                                  </p>

                                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
                                    <span>IP: <strong className="text-slate-400 font-normal">{log.ip || "127.0.0.1"}</strong></span>
                                    <span>Localidade: <strong className="text-slate-400 font-normal">{(log.location?.country === "RU" ? "🇷🇺 Rússia" : "🇧🇷 Brasil") + ` - ${log.location?.city || "São Paulo"}`}</strong></span>
                                    <span>User: <strong className="text-slate-340 font-normal">{log.userId}</strong></span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  )}
                </section>
              </motion.div>
            )
          )}

          {/* TAB 6: Admin Subscription & Plan Override Panel */}
          {activeTab === 'subscriptions' && (
            <motion.div
              key="subscriptions"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-6xl mx-auto space-y-8"
            >
              {/* Header block */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-serif text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-emerald-400" /> Painel de Controle de Faturamento & Assinaturas
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Monitore receitas recorrentes estimadas, gerencie planos de usuários em tempo real e realize overrides administrativos diretamente no Firestore.
                  </p>
                </div>

                <button
                  onClick={fetchUsers}
                  disabled={loadingUsers}
                  className="py-2.5 px-4 bg-slate-900 border border-white/5 text-slate-300 rounded-xl font-bold font-mono text-xs hover:text-white hover:border-white/10 transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", loadingUsers && "animate-spin")} />
                  <span>Sincronizar Lista</span>
                </button>
              </div>

              {/* Financial Metrics Cards */}
              {(() => {
                const totalUsers = usersList.length;
                const premiumCount = usersList.filter(u => u.subscriptionStatus === 'active' && u.subscriptionPlan === 'premium').length;
                const professionalCount = usersList.filter(u => u.subscriptionStatus === 'active' && u.subscriptionPlan === 'professional').length;
                const enterpriseCount = usersList.filter(u => u.subscriptionStatus === 'active' && u.subscriptionPlan === 'enterprise').length;
                const trialCount = usersList.filter(u => u.subscriptionStatus === 'trial').length;
                
                const estimatedMRR = (premiumCount * 39.90) + (professionalCount * 99.90) + (enterpriseCount * 499.90);

                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900 border border-white/5 p-5 rounded-3xl space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Receita Estimada (MRR)</span>
                      <p className="text-2xl font-black text-emerald-400 font-mono">
                        R$ {estimatedMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <span className="text-[10px] text-slate-400 leading-none">Previsão recorrente ativa</span>
                    </div>

                    <div className="bg-slate-900 border border-white/5 p-5 rounded-3xl space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Assinantes Ativos</span>
                      <p className="text-2xl font-black text-white font-mono">
                        {premiumCount + professionalCount + enterpriseCount}
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {premiumCount} Premium • {professionalCount} Pro • {enterpriseCount} Inst
                      </span>
                    </div>

                    <div className="bg-slate-900 border border-white/5 p-5 rounded-3xl space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Período de Teste (Trial)</span>
                      <p className="text-2xl font-black text-indigo-400 font-mono">
                        {trialCount}
                      </p>
                      <span className="text-[10px] text-slate-400 leading-none">Em experimentação de 7 dias</span>
                    </div>

                    <div className="bg-slate-900 border border-white/5 p-5 rounded-3xl space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Total de Usuários</span>
                      <p className="text-2xl font-black text-slate-300 font-mono">
                        {totalUsers}
                      </p>
                      <span className="text-[10px] text-slate-400 leading-none">Sincronizados com o ecossistema</span>
                    </div>
                  </div>
                );
              })()}

              {/* Users Search Bar */}
              <div className="bg-slate-900 border border-white/5 rounded-3xl p-4 flex gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchUserQuery}
                    onChange={(e) => setSearchUserQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
                    placeholder="Filtrar usuários por nome, email ou ID do documento..."
                  />
                </div>
              </div>

              {/* Users Table / Overrides List */}
              <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden">
                {loadingUsers ? (
                  <div className="p-16 text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                    <p className="text-slate-500 text-xs font-mono">Buscando perfis na coleção 'users'...</p>
                  </div>
                ) : (
                  (() => {
                    const query = searchUserQuery.toLowerCase().trim();
                    const filteredUsers = usersList.filter(u => 
                      !query || 
                      u.nome?.toLowerCase().includes(query) || 
                      u.email?.toLowerCase().includes(query) || 
                      u.uid?.toLowerCase().includes(query)
                    );

                    if (filteredUsers.length === 0) {
                      return (
                        <div className="p-16 text-center space-y-4">
                          <User className="w-12 h-12 text-slate-600/35 mx-auto" />
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-300">Nenhum usuário localizado</p>
                            <p className="text-xs text-slate-500 font-mono">Tente refinar sua busca por outro termo.</p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs font-mono">
                          <thead>
                            <tr className="border-b border-white/5 bg-slate-950/40 text-slate-400">
                              <th className="p-4 font-bold uppercase tracking-wider">Identificação</th>
                              <th className="p-4 font-bold uppercase tracking-wider">Perfil</th>
                              <th className="p-4 font-bold uppercase tracking-wider">Status Assinatura</th>
                              <th className="p-4 font-bold uppercase tracking-wider">Plano Ativo</th>
                              <th className="p-4 font-bold uppercase tracking-wider text-right">Ações de Override</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((u) => {
                              const plan = u.subscriptionPlan || "trial";
                              const status = u.subscriptionStatus || "trial";

                              return (
                                <tr key={u.uid} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="p-4">
                                    <p className="font-bold text-white text-xs">{u.nome || "Não preenchido"}</p>
                                    <p className="text-[10px] text-slate-400">{u.email}</p>
                                    <p className="text-[9px] text-slate-600">UID: {u.uid}</p>
                                  </td>
                                  <td className="p-4">
                                    <span className={cn(
                                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                                      u.tipo === 'admin' || u.tipo === 'super_admin' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                                      u.tipo === 'terapeuta' ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-slate-800 border-white/10 text-slate-300"
                                    )}>
                                      {u.tipo}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <span className={cn(
                                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border block w-fit",
                                      status === 'active' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                      status === 'trial' ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" :
                                      status === 'expired' ? "bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse" :
                                      "bg-slate-950 border-white/5 text-slate-500"
                                    )}>
                                      {status === 'active' ? "Ativo" : status === 'trial' ? "Teste (Trial)" : status === 'expired' ? "Expirado" : "Cancelado"}
                                    </span>
                                  </td>
                                  <td className="p-4 text-slate-300 font-bold uppercase">
                                    {plan}
                                  </td>
                                  <td className="p-4 text-right">
                                    <div className="inline-flex items-center gap-2">
                                      <select
                                        defaultValue={plan}
                                        onChange={(e) => {
                                          u.subscriptionPlan = e.target.value as any;
                                        }}
                                        className="bg-slate-950 border border-white/10 rounded-lg text-[10px] font-bold p-1 focus:outline-none uppercase"
                                      >
                                        <option value="trial">Trial (Teste)</option>
                                        <option value="premium">Premium</option>
                                        <option value="professional">Profissional</option>
                                        <option value="enterprise">Corporativo</option>
                                      </select>

                                      <select
                                        defaultValue={status}
                                        onChange={(e) => {
                                          u.subscriptionStatus = e.target.value as any;
                                        }}
                                        className="bg-slate-950 border border-white/10 rounded-lg text-[10px] font-bold p-1 focus:outline-none uppercase"
                                      >
                                        <option value="trial">Trial</option>
                                        <option value="active">Active</option>
                                        <option value="expired">Expired</option>
                                        <option value="cancelled">Cancelled</option>
                                      </select>

                                      <button
                                        onClick={() => handleUpdateUserSubscription(u.uid, u.subscriptionPlan || 'premium', u.subscriptionStatus || 'active')}
                                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold uppercase active:scale-95 transition-colors"
                                      >
                                        Salvar
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* LGPD Double Confirm Delete User Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-red-500/20 max-w-md w-full p-6 rounded-[2.5rem] shadow-2xl shadow-red-950/20 space-y-6"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white">
                Confirmar Mandato de Exclusão Cascata (LGPD)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                Por questões de extrema segurança do paciente, este processo é definitivo. Toda a ficha de sentimentos, agendas e prontuários privados integrados neste cadastro serão expurgados do banco de dados imediatamente.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] text-slate-400 font-mono block">
                Para prosseguir com o esquecimento permanente, digite a frase <strong className="text-red-400 select-all">EXCLUIR CONTA DEFINITIVAMENTE</strong> no campo abaixo:
              </label>
              <input 
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/40 font-mono uppercase tracking-wide"
                placeholder="Digitar frase jurídica de confirmação"
              />
            </div>

            <div className="flex gap-3 font-mono text-xs pt-1">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                className="flex-1 py-3 bg-slate-950 border border-white/5 text-slate-400 hover:text-white rounded-2xl font-bold transition-all"
              >
                Cancelar Recuo
              </button>
              
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText.trim() !== "EXCLUIR CONTA DEFINITIVAMENTE" || deleting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
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
    </div>
  );
}
