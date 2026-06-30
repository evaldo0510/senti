import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { usePWA } from "../contexts/PWAContext";
import { NotificationService } from "../services/notificationService";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { 
  Users, 
  Calendar, 
  Clock, 
  LogOut, 
  Activity, 
  Settings, 
  Bell, 
  CheckCircle2, 
  XCircle, 
  Video,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Home,
  Share2,
  Lock,
  Cloud,
  MessageSquare,
  Send,
  RefreshCw,
  HeartPulse,
  Search
} from "lucide-react";
import { logout } from "../services/firebase";
import { useAuth } from "../components/AuthProvider";
import { userService } from "../services/userService";
import { updateUserProfile } from "../services/authService";
import { ShieldCheck, Sparkles, AlertCircle, Trash2, Plus } from "lucide-react";
import { googleWorkspaceService } from "../services/googleWorkspaceService";
import { Appointment } from "../types";
import { cn } from "../lib/utils";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function Terapeuta() {
  const navigate = useNavigate();
  const { handleInstall, isInstallable, requestNotificationPermission } = usePWA();
  const { profile, loading, isAuthReady } = useAuth();
  const { isSubscribed, permission: pushPermission, subscribe } = usePushNotifications(profile?.uid);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    revenue: 0,
    completionRate: 0,
    averageRating: 0
  });

  const [isGoogleConnected, setIsGoogleConnected] = useState(googleWorkspaceService.isAuthorized());
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [chatSpaces, setChatSpaces] = useState<any[]>([]);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<string>("");
  const [chatMessageText, setChatMessageText] = useState<string>("");
  const [isSendingChatMessage, setIsSendingChatMessage] = useState(false);
  const [syncStatus, setSyncStatus] = useState<Record<string, boolean>>({});
  const [selectedApptIdForAlert, setSelectedApptIdForAlert] = useState<string>("");

  // --- Estados de Gestão de Agenda & Manual Agendamento ---
  const [manualPatientName, setManualPatientName] = useState("");
  const [manualDate, setManualDate] = useState("");
  const [manualTime, setManualTime] = useState("");
  const [manualType, setManualType] = useState<"video" | "chat" | "presencial">("video");
  const [showManualForm, setShowManualForm] = useState(false);
  const [isCreatingManual, setIsCreatingManual] = useState(false);
  const [availabilityDays, setAvailabilityDays] = useState<string[]>([]);
  const [availabilityStart, setAvailabilityStart] = useState("08:00");
  const [availabilityEnd, setAvailabilityEnd] = useState("18:00");
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // --- Estados de Faturamento & Bancários ---
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankName, setBankName] = useState("");
  const [bankAgency, setBankAgency] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [pixKeyType, setPixKeyType] = useState("cpf");
  const [pixKey, setPixKey] = useState("");
  const [savingBank, setSavingBank] = useState(false);
  const [savingBankSuccess, setSavingBankSuccess] = useState(false);

  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [payoutError, setPayoutError] = useState("");

  // SPRINT 15 IARA Pro Assistente States
  const [iaraProMessages, setIaraProMessages] = useState<any[]>([
    {
      id: "init",
      role: "assistant",
      text: "Olá, Doutor(a)! Sou a IARA Pro, sua assistente estratégica de inteligência clínica. Posso apoiar você na estruturação de prontuários, resumos automáticos de pacientes com base na jornada e tarefas administrativas. Como posso te apoiar hoje?",
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [iaraProInput, setIaraProInput] = useState("");
  const [isIaraProTyping, setIsIaraProTyping] = useState(false);

  useEffect(() => {
    if (profile) {
      setIsGoogleConnected(!!profile.googleCalendarConnected);
      
      // Load saved availability settings if available
      if (profile.availability) {
        setAvailabilityDays(profile.availability.days || ["Seg", "Ter", "Qua", "Qui", "Sex"]);
        setAvailabilityStart(profile.availability.start || "08:00");
        setAvailabilityEnd(profile.availability.end || "18:00");
      } else {
        setAvailabilityDays(["Seg", "Ter", "Qua", "Qui", "Sex"]);
      }

      // Load saved bank settings if available
      if (profile.bankSettings) {
        setBankName(profile.bankSettings.bankName || "");
        setBankAgency(profile.bankSettings.bankAgency || "");
        setBankAccount(profile.bankSettings.bankAccount || "");
        setPixKeyType(profile.bankSettings.pixKeyType || "cpf");
        setPixKey(profile.bankSettings.pixKey || "");
      }
    }
  }, [profile]);

  const generateAlertMessage = (apptId: string) => {
    const appt = appointments.find(a => a.id === apptId);
    if (!appt) return;

    const dateStr = new Date(appt.date).toLocaleDateString('pt-BR');
    const timeStr = appt.time || "12:00";
    const statusMap: Record<string, string> = {
      pending: 'Pendente de Confirmação',
      confirmed: 'Confirmado',
      completed: 'Finalizado',
      cancelled: 'Cancelado'
    };
    const statusText = statusMap[appt.status] || appt.status;
    const typeLabel = appt.type === 'video' ? 'Vídeo Chamada' : appt.type === 'chat' ? 'Chat Criptografado' : 'Presencial';

    setChatMessageText(
      `🚨 *[Alerta de Consulta - Pronto-Socorro Emocional]*\n\n` +
      `Uma nova consulta foi registrada/atualizada no sistema:\n` +
      `👤 *Paciente:* ${appt.patientNome}\n` +
      `📅 *Data:* ${dateStr}\n` +
      `🕒 *Horário:* ${timeStr}\n` +
      `💻 *Tipo:* ${typeLabel}\n` +
      `📌 *Status:* ${statusText}\n\n` +
      `Acesse o painel para gerenciar o atendimento.`
    );
  };

  const fetchChatSpaces = async () => {
    setIsLoadingSpaces(true);
    try {
      const spaces = await googleWorkspaceService.listChatSpaces();
      setChatSpaces(spaces);
      if (spaces.length > 0) {
        setSelectedSpace(spaces[0].name);
      }
    } catch (err) {
      console.error("Erro ao carregar Google Chat Spaces:", err);
    } finally {
      setIsLoadingSpaces(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsConnectingGoogle(true);
    try {
      const token = await googleWorkspaceService.authorize();
      if (token) {
        setIsGoogleConnected(true);
        if (profile) {
          await userService.connectGoogleCalendar(profile.uid);
        }
        await fetchChatSpaces();
      }
    } catch (err: any) {
      console.error(err);
      alert("Erro ao conectar Google Workspace: " + err.message);
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    googleWorkspaceService.disconnect();
    setIsGoogleConnected(false);
    setChatSpaces([]);
    setSelectedSpace("");
    if (profile) {
      await userService.disconnectGoogleCalendar(profile.uid);
    }
  };

  const handleSyncToCalendar = async (appointment: Appointment) => {
    const confirmSync = window.confirm(
      `Deseja sincronizar e agendar esta consulta com ${appointment.patientNome} no seu Google Calendar?`
    );
    if (!confirmSync) return;

    try {
      await googleWorkspaceService.createCalendarEvent(appointment);
      setSyncStatus(prev => ({ ...prev, [appointment.id]: true }));
      await userService.updateAppointment(appointment.id, { googleSynced: true });
      alert("Sucesso! A consulta foi inserida com sucesso no Google Calendar.");
    } catch (err: any) {
      console.error(err);
      alert("Erro ao criar evento: " + err.message);
    }
  };

  const handleSendChatAlert = async () => {
    if (!selectedSpace) {
      alert("Por favor, selecione uma sala do Google Chat.");
      return;
    }
    if (!chatMessageText.trim()) {
      alert("Por favor, digite a mensagem de alerta.");
      return;
    }

    setIsSendingChatMessage(true);
    try {
      await googleWorkspaceService.sendChatMessage(selectedSpace, chatMessageText);
      alert("Alerta enviado com sucesso para o Google Chat!");
      setChatMessageText("");
    } catch (err: any) {
      console.error(err);
      alert("Erro ao enviar mensagem: " + err.message);
    } finally {
      setIsSendingChatMessage(false);
    }
  };

  useEffect(() => {
    if (isAuthReady && !loading) {
      // Auto-subscribe to push notifications if not already subscribed
      if (pushPermission === 'default' && !isSubscribed && profile) {
        subscribe();
      }

      const unsubscribe = userService.getMyAppointments((apps) => {
        setAppointments(apps);
        
        // Calculate stats
        const pending = apps.filter(a => a.status === 'pending').length;
        const completed = apps.filter(a => a.status === 'completed').length;
        const total = apps.length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        const basePrice = typeof profile.preco === 'number' ? profile.preco : parseInt(profile.preco || "150");
        const discountPercentage = profile.desconto || 0;
        const payoutPerSession = basePrice * (1 - discountPercentage / 100);
        
        const revenue = completed * payoutPerSession;
        
        setStats({
          total,
          pending,
          completed,
          revenue: Math.round(revenue),
          completionRate,
          averageRating: profile.rating || 0
        });
      }, 'terapeuta');

      return () => unsubscribe();
    }
  }, [profile, loading, isAuthReady, navigate]);

  const [activeTab, setActiveTab] = React.useState("dashboard");

  const tips = [
    "Mantenha seu perfil atualizado para atrair mais pacientes.",
    "Confirme seus agendamentos pendentes o quanto antes.",
    "A IARA pode ajudar na triagem inicial dos seus pacientes.",
    "Lembre-se de registrar as notas após cada sessão."
  ];

  const [currentTip, setCurrentTip] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("tipo");
    navigate("/");
  };

  const handleStatusUpdate = async (id: string, status: Appointment['status']) => {
    await userService.updateAppointmentStatus(id, status);
  };

  const toggleOnlineStatus = async () => {
    if (profile) {
      const newStatus = !profile.online;
      await userService.updateOnlineStatus(profile.uid, newStatus);
    }
  };

  const handleConnectCalendar = async () => {
    if (profile) {
      await userService.connectGoogleCalendar(profile.uid);
    }
  };

  const handleConnectEarnings = async () => {
    if (profile) {
      await userService.connectEarnings(profile.uid);
    }
  };

  const handleSaveAvailability = async () => {
    if (!profile) return;
    setSavingAvailability(true);
    setSaveSuccess(false);
    try {
      await updateUserProfile(profile.uid, {
        availability: {
          days: availabilityDays,
          start: availabilityStart,
          end: availabilityEnd
        }
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Erro ao salvar disponibilidade", err);
      alert("Erro ao salvar disponibilidade");
    } finally {
      setSavingAvailability(false);
    }
  };

  const handleSaveBankSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingBank(true);
    setSavingBankSuccess(false);
    try {
      await updateUserProfile(profile.uid, {
        bankSettings: {
          bankName,
          bankAgency,
          bankAccount,
          pixKeyType,
          pixKey
        }
      });
      setSavingBankSuccess(true);
      setTimeout(() => {
        setSavingBankSuccess(false);
        setShowBankModal(false);
      }, 1500);
    } catch (err) {
      console.error("Erro ao salvar dados bancários", err);
      alert("Erro ao salvar dados bancários");
    } finally {
      setSavingBank(false);
    }
  };

  const handleCreateManualAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!manualPatientName || !manualDate || !manualTime) {
      alert("Por favor, preencha todos os campos do agendamento.");
      return;
    }
    setIsCreatingManual(true);
    try {
      await userService.createAppointment({
        patientId: "manual-" + Date.now(),
        patientNome: manualPatientName,
        therapistId: profile.uid,
        therapistNome: profile.nome,
        date: new Date(`${manualDate}T${manualTime}`).toISOString(),
        status: 'confirmed',
        type: manualType,
        price: typeof profile.preco === 'number' ? profile.preco : parseInt(profile.preco || "150")
      });
      setManualPatientName("");
      setManualDate("");
      setManualTime("");
      setShowManualForm(false);
      alert("Agendamento manual criado com sucesso!");
    } catch (err: any) {
      console.error("Erro ao criar consulta manual", err);
      alert("Erro ao criar consulta manual: " + err.message);
    } finally {
      setIsCreatingManual(false);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const amount = parseFloat(payoutAmount);
    const balance = profile.totalEarnings || 0;
    
    if (isNaN(amount) || amount <= 0) {
      setPayoutError("Por favor, digite um valor válido para o saque.");
      return;
    }
    if (amount > balance) {
      setPayoutError(`Saldo insuficiente. Seu saldo disponível é R$ ${balance.toFixed(2)}.`);
      return;
    }

    setPayoutLoading(true);
    setPayoutError("");
    setPayoutSuccess(false);
    try {
      const newBalance = balance - amount;
      await updateUserProfile(profile.uid, {
        totalEarnings: newBalance
      });
      setPayoutSuccess(true);
      setPayoutAmount("");
      setTimeout(() => {
        setPayoutSuccess(false);
        setShowPayoutModal(false);
      }, 2000);
    } catch (err: any) {
      console.error("Erro ao solicitar saque", err);
      setPayoutError("Erro ao processar a transferência: " + err.message);
    } finally {
      setPayoutLoading(false);
    }
  };

  const handleShareProfile = async () => {
    if (!profile) return;
    const url = `${window.location.origin}/terapeuta/${profile.uid}`;
    const title = `Perfil Profissional - ${profile.nome}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Confira meu perfil profissional no SENTI.`,
          url,
        });
      } catch (error) {
        console.error("Erro ao compartilhar", error);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Link do seu perfil copiado para a área de transferência!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100 pb-24 lg:pb-0">
      {/* Sidebar - Desktop only */}
      <aside className="w-64 bg-slate-900 border-r border-white/5 flex flex-col hidden lg:flex sticky top-0 h-screen">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-emerald-400 flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <HeartPulse className="w-8 h-8 text-emerald-500" />
            Sentí <span className="text-slate-100 font-light">Pro</span>
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all",
              activeTab === 'dashboard' ? "bg-emerald-900/20 text-emerald-400" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <Home className="w-5 h-5" />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab("agenda")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all",
              activeTab === 'agenda' ? "bg-emerald-900/20 text-emerald-400" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <Calendar className="w-5 h-5" />
            Minha Agenda
          </button>
          <button 
            onClick={() => setActiveTab("pacientes")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all",
              activeTab === 'pacientes' ? "bg-emerald-900/20 text-emerald-400" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <Users className="w-5 h-5" />
            Gestão de Pacientes
          </button>
          <button 
            onClick={() => setActiveTab("historico")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all",
              activeTab === 'historico' ? "bg-emerald-900/20 text-emerald-400" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <Activity className="w-5 h-5" />
            Histórico
          </button>
          <button 
            onClick={() => setActiveTab("financeiro")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all",
              activeTab === 'financeiro' ? "bg-emerald-900/20 text-emerald-400" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <DollarSign className="w-5 h-5" />
            Financeiro
          </button>
          <button 
            onClick={() => setActiveTab("perfil")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all",
              activeTab === 'perfil' ? "bg-emerald-900/20 text-emerald-400" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <Settings className="w-5 h-5" />
            Meu Perfil
          </button>
          <button 
            onClick={() => setActiveTab("iara_assistente")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all",
              activeTab === 'iara_assistente' ? "bg-purple-900/20 text-purple-400" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <Sparkles className="w-5 h-5 text-purple-400" />
            Assistente IARA
          </button>
          <button 
            onClick={() => setActiveTab("google_workspace")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all",
              activeTab === 'google_workspace' ? "bg-blue-900/20 text-blue-400" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <Cloud className="w-5 h-5" />
            Visualização Google
          </button>
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <img 
              src={profile?.fotoUrl || `https://picsum.photos/seed/${profile?.uid}/100/100`} 
              className="w-10 h-10 rounded-full border border-white/10"
              alt="Profile"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-200 truncate">{profile?.nome}</p>
              <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Online</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-red-400 hover:bg-red-900/10 rounded-2xl transition-all">
            <LogOut className="w-5 h-5" />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-10">
          
          {/* Notification Prompt Banner */}
          {NotificationService.isPendingOrDenied() && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-600 rounded-2xl p-4 flex items-center justify-between gap-4 text-white shadow-lg shadow-emerald-900/20"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Ative as notificações</p>
                  <p className="text-xs text-emerald-100">Receba alertas de novos agendamentos e mensagens em tempo real.</p>
                </div>
              </div>
              <button 
                onClick={requestNotificationPermission}
                className="px-4 py-2 bg-white text-emerald-600 rounded-xl font-bold text-xs hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                Ativar notificações
              </button>
            </motion.div>
          )}

          {/* Validation Status Banner */}
          {profile?.validationStatus && profile.validationStatus !== 'active' && profile.validationStatus !== 'approved' && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-3xl p-6 border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl",
                profile.validationStatus === 'pending_approval' && "bg-amber-500/10 border-amber-500/20 text-amber-200 shadow-amber-950/5",
                profile.validationStatus === 'under_review' && "bg-blue-500/10 border-blue-500/20 text-blue-200 shadow-blue-950/5",
                profile.validationStatus === 'suspended' && "bg-red-500/10 border-red-500/20 text-red-200 shadow-red-950/5"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-3 rounded-2xl shrink-0 border",
                  profile.validationStatus === 'pending_approval' && "bg-amber-500/20 border-amber-500/30 text-amber-400",
                  profile.validationStatus === 'under_review' && "bg-blue-500/20 border-blue-500/30 text-blue-400",
                  profile.validationStatus === 'suspended' && "bg-red-500/20 border-red-500/30 text-red-400"
                )}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-base flex items-center gap-2">
                    Credenciamento: 
                    <span className="uppercase text-xs tracking-wider px-2.5 py-0.5 rounded-full font-black border bg-white/5 border-white/10">
                      {profile.validationStatus === 'pending_approval' && "Aguardando Aprovação"}
                      {profile.validationStatus === 'under_review' && "Em Análise"}
                      {profile.validationStatus === 'suspended' && "Cadastro Suspenso"}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    {profile.validationStatus === 'pending_approval' && "Seu perfil foi submetido com sucesso e está na fila para validação pela nossa equipe regulatória. Geralmente isso leva de 12 a 24 horas."}
                    {profile.validationStatus === 'under_review' && "Nossos analistas estão ativamente revisando seus documentos de registro (CRP/CRM) e o DNA terapêutico. Você receberá notificações em tempo real assim que concluído!"}
                    {profile.validationStatus === 'suspended' && "Seu perfil está temporariamente suspenso da rede pública de especialistas. Entre em contato com o suporte do SentiPae para mais detalhes ou correções cadastrais."}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => navigate("/terapeuta-setup")}
                className="px-5 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl font-bold text-xs whitespace-nowrap transition-colors shadow-sm cursor-pointer"
              >
                Revisar Meus Dados
              </button>
            </motion.div>
          )}

          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-100">
                {activeTab === 'dashboard' && `Olá, Dr(a). ${profile?.nome?.split(' ')[0]}`}
                {activeTab === 'agenda' && 'Minha Agenda'}
                {activeTab === 'pacientes' && 'Meus Pacientes'}
                {activeTab === 'financeiro' && 'Gestão Financeira'}
                {activeTab === 'perfil' && 'Meu Perfil'}
                {activeTab === 'iara_assistente' && 'IARA Assistente do Profissional'}
                {activeTab === 'google_workspace' && 'Google Workspace Hub'}
              </h2>
              <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-lg">
                {activeTab === 'dashboard' && `Você tem ${stats.pending} agendamentos pendentes.`}
                {activeTab === 'agenda' && 'Gerencie seus horários e sessões.'}
                {activeTab === 'pacientes' && 'Acompanhe o progresso de quem você cuida.'}
                {activeTab === 'financeiro' && 'Acompanhe seus ganhos e taxas.'}
                {activeTab === 'perfil' && 'Mantenha suas informações atualizadas.'}
                {activeTab === 'iara_assistente' && 'Sua assistente de IA para briefings de pacientes, resumos de prontuários, geração de relatórios e automação.'}
                {activeTab === 'google_workspace' && 'Conecte seus compromissos com o Google Calendar e notificações com o Google Chat.'}
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto justify-end items-center flex-wrap sm:flex-nowrap">
              {/* Google Calendar Sync Status Badge */}
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full font-bold text-[10px] sm:text-xs transition-all border",
                isGoogleConnected 
                  ? "bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-sm shadow-blue-500/5" 
                  : "bg-slate-900 border-white/5 text-slate-500/80"
              )}>
                <div className={cn(
                  "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full",
                  isGoogleConnected ? "bg-blue-400 animate-pulse" : "bg-slate-700"
                )} />
                <span>CALENDAR: {isGoogleConnected ? "SINC_ATIVO" : "DESCONECTADO"}</span>
              </div>

              {/* Uber-like Online Toggle */}
              <button 
                onClick={toggleOnlineStatus}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full font-bold text-[10px] sm:text-xs transition-all border",
                  profile?.online 
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                    : "bg-slate-800 border-white/10 text-slate-500"
                )}
              >
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  profile?.online ? "bg-emerald-500 animate-pulse" : "bg-slate-600"
                )} />
                {profile?.online ? "ONLINE" : "OFFLINE"}
              </button>

              <div className="hidden xl:block">
                <div className="bg-emerald-900/20 border border-emerald-500/20 px-4 py-2 rounded-full flex items-center gap-2 text-sm text-emerald-400">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Dica: {tips[currentTip]}
                </div>
              </div>
              <button 
                onClick={handleShareProfile}
                className="p-3 bg-slate-900 rounded-2xl border border-white/5 text-slate-400 hover:text-emerald-400 transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
                title="Compartilhar meu perfil"
              >
                <Share2 className="w-6 h-6" />
              </button>
              <button 
                aria-label="Notificações"
                className="p-3 bg-slate-900 rounded-2xl border border-white/5 relative min-w-[48px] min-h-[48px] flex items-center justify-center"
              >
                <Bell className="w-6 h-6 text-slate-400" />
                <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
              </button>
              <button 
                onClick={handleLogout} 
                aria-label="Sair"
                className="lg:hidden p-3 bg-slate-900 rounded-2xl border border-white/5 text-slate-400 hover:text-red-400 min-w-[48px] min-h-[48px] flex items-center justify-center"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </header>

          {activeTab === 'dashboard' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total de Sessões", value: stats.total, icon: Calendar, color: "text-blue-400", bg: "bg-blue-400/10" },
                  { label: "Taxa de Conclusão", value: `${stats.completionRate}%`, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                  { label: "Receita Total", value: `R$ ${stats.revenue}`, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10" },
                  { label: "Avaliação Média", value: stats.averageRating.toFixed(1), icon: Activity, color: "text-amber-400", bg: "bg-amber-400/10" }
                ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-3"
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg)}>
                      <stat.icon className={cn("w-5 h-5", stat.color)} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Appointments List */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex justify-between items-end px-2">
                    <h3 className="text-xl font-bold text-slate-200">Próximos Atendimentos</h3>
                    <button onClick={() => setActiveTab("agenda")} className="text-sm text-emerald-400 font-bold hover:underline">Ver agenda completa</button>
                  </div>

                  <div className="space-y-4">
                    {appointments.length > 0 ? appointments.map((app) => (
                      <motion.div 
                        key={app.id}
                        layout
                        className="bg-slate-900 border border-white/5 p-5 rounded-3xl flex flex-col sm:flex-row gap-4 items-center hover:border-emerald-500/30 transition-all group"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="relative">
                            <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-xl font-bold text-emerald-400 border border-white/5 group-hover:border-emerald-500/50 transition-colors">
                              {app.patientNome?.charAt(0) || "P"}
                            </div>
                            <div className={cn(
                              "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900",
                              app.status === 'pending' ? "bg-amber-500" :
                              app.status === 'confirmed' ? "bg-emerald-500" :
                              app.status === 'completed' ? "bg-blue-500" : "bg-red-500"
                            )} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-100 text-lg">{app.patientNome}</h4>
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                app.status === 'pending' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                app.status === 'confirmed' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                app.status === 'completed' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                "bg-red-500/10 text-red-400 border border-red-500/20"
                              )}>
                                {app.status === 'pending' ? 'Pendente' : 
                                 app.status === 'confirmed' ? 'Confirmada' : 
                                 app.status === 'completed' ? 'Concluída' : 'Cancelada'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {app.time || new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(app.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
                          {/* Sincronizar Lembrete no Google Calendar */}
                          <button
                            onClick={() => isGoogleConnected ? handleSyncToCalendar(app) : handleGoogleAuth()}
                            className={cn(
                              "flex-1 sm:flex-none px-4 py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 border whitespace-nowrap active:scale-95",
                              (app.googleSynced || syncStatus[app.id])
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-blue-600/10 text-blue-400 border-blue-500/20 hover:bg-blue-600/20 hover:text-blue-300"
                            )}
                            title="Sincronizar Lembrete no Google Agenda"
                          >
                            <Calendar className="w-4 h-4" />
                            {(app.googleSynced || syncStatus[app.id]) ? "Sincronizado" : "Sincronizar Lembrete"}
                          </button>

                          {app.status === 'pending' ? (
                            <>
                              <button 
                                onClick={() => handleStatusUpdate(app.id, 'confirmed')}
                                className="flex-1 sm:flex-none px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2 font-bold text-sm"
                                title="Confirmar"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Confirmar
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(app.id, 'cancelled')}
                                className="flex-1 sm:flex-none px-4 py-3 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-2xl border border-white/5 transition-all flex items-center gap-2 font-bold text-sm"
                                title="Recusar"
                              >
                                <XCircle className="w-4 h-4" />
                                Recusar
                              </button>
                            </>
                          ) : app.status === 'confirmed' ? (
                            <button 
                              onClick={() => navigate(`/atendimento/${app.id}`)}
                              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2"
                            >
                              <Video className="w-5 h-5" />
                              Entrar na Sala
                            </button>
                          ) : null}
                        </div>
                      </motion.div>
                    )) : (
                      <div className="bg-slate-900/50 border border-dashed border-white/10 p-12 rounded-3xl text-center">
                        <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-500">Nenhum agendamento para exibir.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Side Panel: Quick Actions & Tips */}
                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/20">
                    <h4 className="text-xl font-bold mb-2">Seu perfil está 80% completo</h4>
                    <p className="text-emerald-100 text-sm mb-6">Adicione um vídeo de apresentação para aumentar suas chances de agendamento em até 40%.</p>
                    <button 
                      onClick={() => setActiveTab("perfil")}
                      className="w-full py-3 bg-white text-emerald-700 rounded-2xl font-bold text-sm hover:bg-emerald-50 transition-colors"
                    >
                      Completar Perfil
                    </button>
                  </div>

                  <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 space-y-4">
                    <h4 className="font-bold text-slate-200">Distribuição de Sessões</h4>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={[
                              { name: 'Concluídas', value: stats.completed, color: '#34d399' },
                              { name: 'Pendentes', value: stats.pending, color: '#fbbf24' },
                              { name: 'Canceladas', value: stats.total - stats.completed - stats.pending, color: '#f87171' }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {[
                              { name: 'Concluídas', value: stats.completed, color: '#34d399' },
                              { name: 'Pendentes', value: stats.pending, color: '#fbbf24' },
                              { name: 'Canceladas', value: stats.total - stats.completed - stats.pending, color: '#f87171' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.5rem' }}
                            itemStyle={{ color: '#f1f5f9' }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 text-xs font-medium text-slate-400">
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Concluídas</div>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400" /> Pendentes</div>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400" /> Canceladas</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'agenda' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Google Calendar Integration Status */}
              <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl">
                    <Calendar className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-200">Integração Google Calendar</h3>
                    <p className="text-slate-400 text-xs">Sincronize sua agenda do SentiPae com seus compromissos pessoais automaticamente.</p>
                  </div>
                </div>
                <button 
                  onClick={handleConnectCalendar}
                  className={cn(
                    "px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                    profile?.googleCalendarConnected 
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" 
                      : "bg-white text-slate-950 hover:bg-slate-100"
                  )}
                >
                  {profile?.googleCalendarConnected ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Calendário Ativo
                    </>
                  ) : (
                    "Sincronizar Agenda"
                  )}
                </button>
              </div>

              {/* Grid: Disponibilidade e Novo Agendamento */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Painel de Disponibilidade Semanal */}
                <div className="lg:col-span-2 bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-6">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">Horários de Trabalho & Disponibilidade</h4>
                      <p className="text-[10px] text-slate-500">Configure os dias e faixas de horários onde você atende na Rede SentiPae.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Dias de Trabalho */}
                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-2">Dias Ativos</label>
                      <div className="flex flex-wrap gap-2">
                        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => {
                          const isActive = availabilityDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                if (isActive) {
                                  setAvailabilityDays(availabilityDays.filter(d => d !== day));
                                } else {
                                  setAvailabilityDays([...availabilityDays, day]);
                                }
                              }}
                              className={cn(
                                "px-3.5 py-2 rounded-xl text-xs font-bold border transition-all",
                                isActive
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                  : "bg-slate-950 text-slate-500 border-white/5 hover:border-white/10"
                              )}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Janela Horária */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-400 font-bold block mb-1">Início do Turno</label>
                        <input
                          type="time"
                          value={availabilityStart}
                          onChange={(e) => setAvailabilityStart(e.target.value)}
                          className="w-full bg-slate-950 text-slate-200 text-xs px-4 py-3 rounded-xl border border-white/5 focus:border-emerald-500/50 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 font-bold block mb-1">Término do Turno</label>
                        <input
                          type="time"
                          value={availabilityEnd}
                          onChange={(e) => setAvailabilityEnd(e.target.value)}
                          className="w-full bg-slate-950 text-slate-200 text-xs px-4 py-3 rounded-xl border border-white/5 focus:border-emerald-500/50 outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSaveAvailability}
                      disabled={savingAvailability}
                      className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {savingAvailability ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : saveSuccess ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Configurações Salvas!
                        </>
                      ) : (
                        "Salvar Disponibilidade de Agenda"
                      )}
                    </button>
                  </div>
                </div>

                {/* Card de Ação Rápida: Novo Agendamento */}
                <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 border border-indigo-500/20 p-6 rounded-3xl flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="p-3 bg-white/10 rounded-2xl w-fit text-indigo-300">
                      <Plus className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">Agendamento Manual</h4>
                    <p className="text-indigo-200/70 text-[11px] leading-relaxed">
                      Adicione sessões diretamente na sua agenda para pacientes recorrentes ou consultas combinadas fora da plataforma de forma offline.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowManualForm(true)}
                    className="w-full py-3.5 bg-white text-indigo-950 hover:bg-indigo-50 rounded-xl text-xs font-black transition-all"
                  >
                    Agendar Nova Sessão
                  </button>
                </div>
              </div>

              {/* Lista Completa de Sessões na Agenda */}
              <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">Minhas Consultas e Horários</h4>
                    <p className="text-[10px] text-slate-500">Acompanhe e responda a todas as suas solicitações de atendimento.</p>
                  </div>
                </div>

                {/* Filtro de Status das Consultas */}
                <div className="space-y-4">
                  {appointments.length === 0 ? (
                    <div className="text-center py-12 bg-slate-950 rounded-2xl border border-white/5">
                      <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-3 animate-pulse" />
                      <p className="text-xs text-slate-450">Nenhuma consulta agendada no momento.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {appointments.map((appt) => {
                        const isManual = appt.patientId?.startsWith("manual-");
                        return (
                          <div 
                            key={appt.id} 
                            className={cn(
                              "p-5 rounded-2xl border flex flex-col justify-between transition gap-4",
                              appt.status === "pending" 
                                ? "bg-amber-500/5 border-amber-500/10 hover:border-amber-500/25" 
                                : appt.status === "confirmed" 
                                  ? "bg-indigo-500/5 border-indigo-500/10 hover:border-indigo-500/25"
                                  : "bg-slate-950 border-white/5"
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-black text-slate-200">{appt.patientNome}</span>
                                  {isManual && (
                                    <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 text-[8px] font-mono rounded font-bold uppercase">
                                      Manual
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                                  <span>{new Date(appt.date).toLocaleDateString("pt-BR")}</span>
                                  <span>•</span>
                                  <span>{appt.time || new Date(appt.date).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              </div>

                              {/* Badges de Status */}
                              <span className={cn(
                                "px-2 py-0.5 text-[8px] font-mono font-bold rounded uppercase",
                                appt.status === "confirmed" 
                                  ? "bg-indigo-500/20 text-indigo-400" 
                                  : appt.status === "pending" 
                                    ? "bg-amber-500/20 text-amber-400 animate-pulse" 
                                    : appt.status === "completed" 
                                      ? "bg-emerald-500/20 text-emerald-400" 
                                      : "bg-red-500/20 text-red-450"
                              )}>
                                {appt.status === "confirmed" ? "confirmada" : appt.status === "pending" ? "pendente" : appt.status === "completed" ? "concluída" : "cancelada"}
                              </span>
                            </div>

                            <div className="flex items-center justify-between border-t border-white/5 pt-4">
                              <span className="text-xs font-bold text-slate-400">
                                R$ {appt.price?.toFixed(2) || "0.00"}
                              </span>

                              {/* Ações */}
                              <div className="flex gap-2">
                                {appt.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() => handleStatusUpdate(appt.id, "cancelled")}
                                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold rounded-lg transition"
                                    >
                                      Recusar
                                    </button>
                                    <button
                                      onClick={() => handleStatusUpdate(appt.id, "confirmed")}
                                      className="px-3 py-1.5 bg-emerald-500 text-slate-950 hover:bg-emerald-450 text-[10px] font-extrabold rounded-lg transition"
                                    >
                                      Confirmar
                                    </button>
                                  </>
                                )}
                                {appt.status === "confirmed" && (
                                  <>
                                    <button
                                      onClick={() => handleStatusUpdate(appt.id, "cancelled")}
                                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 text-[10px] font-bold rounded-lg transition"
                                    >
                                      Cancelar
                                    </button>
                                    <button
                                      onClick={() => handleStatusUpdate(appt.id, "completed")}
                                      className="px-3 py-1.5 bg-emerald-500 text-slate-950 hover:bg-emerald-450 text-[10px] font-extrabold rounded-lg transition"
                                    >
                                      Concluir Sessão
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal de Agendamento Manual */}
              {showManualForm && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-6">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-200 uppercase tracking-wider">Agendar Consulta Manual</h3>
                      <p className="text-[10px] text-slate-400">Insira as informações do paciente para registrar o agendamento.</p>
                    </div>

                    <form onSubmit={handleCreateManualAppointment} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Nome do Paciente</label>
                        <input
                          type="text"
                          required
                          value={manualPatientName}
                          onChange={(e) => setManualPatientName(e.target.value)}
                          placeholder="Digite o nome completo"
                          className="w-full bg-slate-950 text-slate-200 text-xs px-4 py-3 rounded-xl border border-white/5 focus:border-emerald-500 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Data</label>
                          <input
                            type="date"
                            required
                            value={manualDate}
                            onChange={(e) => setManualDate(e.target.value)}
                            className="w-full bg-slate-950 text-slate-200 text-xs px-4 py-3 rounded-xl border border-white/5 focus:border-emerald-500 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Horário</label>
                          <input
                            type="time"
                            required
                            value={manualTime}
                            onChange={(e) => setManualTime(e.target.value)}
                            className="w-full bg-slate-950 text-slate-200 text-xs px-4 py-3 rounded-xl border border-white/5 focus:border-emerald-500 outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Tipo de Atendimento</label>
                        <div className="grid grid-cols-3 gap-2">
                          {["video", "chat", "presencial"].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setManualType(type as any)}
                              className={cn(
                                "py-2.5 rounded-lg text-[10px] font-black uppercase border transition",
                                manualType === type 
                                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                                  : "bg-slate-950 text-slate-500 border-white/5 hover:border-white/10"
                              )}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setShowManualForm(false)}
                          className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-slate-400 transition"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isCreatingManual}
                          className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-450 text-slate-950 rounded-xl text-xs font-black transition"
                        >
                          {isCreatingManual ? (
                            <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
                          ) : (
                            "Agendar Sessão"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pacientes' && (() => {
            const uniquePatientIds = Array.from(new Set(appointments.map(a => a.patientId)));
            const patientsData = uniquePatientIds.map(patientId => {
              const patientApps = appointments.filter(a => a.patientId === patientId);
              const sortedApps = [...patientApps].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              const lastApp = sortedApps[0] || patientApps[0];
              const lastConsultationDate = lastApp ? new Date(lastApp.date) : null;
              const completedCount = patientApps.filter(a => a.status === 'completed').length;
              
              return {
                patientId,
                name: lastApp?.patientNome || "",
                email: lastApp?.patientEmail || "",
                lastApp,
                lastConsultationDate,
                completedCount,
                patientApps
              };
            });

            const filteredPatients = patientsData.filter(p => {
              if (!patientSearchQuery.trim()) return true;
              const q = patientSearchQuery.toLowerCase();
              const nameMatch = p.name.toLowerCase().includes(q);
              const emailMatch = p.email.toLowerCase().includes(q);
              
              let dateMatch = false;
              if (p.lastConsultationDate) {
                const formattedDate = p.lastConsultationDate.toLocaleDateString('pt-BR');
                dateMatch = formattedDate.includes(q);
              }
              return nameMatch || emailMatch || dateMatch;
            });

            return (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-200">Seus Pacientes Ativos</h3>
                    <p className="text-xs text-slate-500">Filtrando {filteredPatients.length} de {patientsData.length} pacientes</p>
                  </div>
                  <div className="text-sm text-slate-500 font-bold bg-slate-900 border border-white/5 py-1 px-3 rounded-full">
                    Total: {patientsData.length}
                  </div>
                </div>

                {/* Patient filter search bar */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Search className="w-5 h-5 text-slate-500" />
                  </span>
                  <input
                    type="text"
                    placeholder="Filtrar por nome, email ou data de consulta (ex: 20/05/2026)..."
                    value={patientSearchQuery}
                    onChange={(e) => setPatientSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 pl-11 pr-4 py-3.5 rounded-2xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPatients.map(p => {
                    const { patientId, name, lastApp, completedCount, lastConsultationDate } = p;
                    if (!lastApp) return null;
                    
                    return (
                      <motion.div 
                        key={patientId}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-4 hover:border-emerald-500/30 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-xl font-bold text-emerald-400 border border-white/5">
                            {name?.charAt(0) || "P"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-100 truncate">{name}</h4>
                            <p className="text-xs text-slate-500 truncate">{p.email || "Sem email registrado"}</p>
                            <p className="text-xs text-slate-500">{completedCount} sessões realizadas</p>
                          </div>
                          <button className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                            <MessageCircle className="w-5 h-5 text-slate-400" />
                          </button>
                        </div>
                        
                        <div className="pt-4 border-t border-white/5 flex flex-col gap-1.5 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Status:</span>
                            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold rounded-full uppercase">Em Tratamento</span>
                          </div>
                          {lastConsultationDate && (
                            <div className="flex justify-between items-center text-slate-400">
                              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Última Consulta:</span>
                              <span className="font-mono text-[11px]">{lastConsultationDate.toLocaleDateString('pt-BR')}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => navigate(`/terapeuta/paciente/${patientId}`)}
                            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            Ver Prontuário
                          </button>
                          <button 
                            onClick={async () => {
                              if (profile) {
                                const success = await userService.notifyTherapist(profile.uid, name || "Novo Paciente");
                                if (success) {
                                  alert("Notificação enviada com sucesso!");
                                }
                              }
                            }}
                            className="px-4 py-3 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 rounded-xl text-xs font-bold transition-all border border-emerald-500/20 flex items-center gap-2 cursor-pointer"
                          >
                            <Bell className="w-4 h-4" />
                            Notificar
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                  {filteredPatients.length === 0 && (
                    <div className="col-span-full bg-slate-900/50 border border-dashed border-white/10 p-12 rounded-3xl text-center">
                      <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-500">Nenhum paciente atende aos critérios de busca.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {activeTab === 'historico' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-200">Histórico de Sessões</h3>
              <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-800/50 text-xs uppercase font-bold text-slate-500">
                      <tr>
                        <th className="px-6 py-4">Paciente</th>
                        <th className="px-6 py-4">Data e Hora</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {appointments.map((app) => (
                        <tr key={app.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold border border-white/5">
                                {app.patientNome?.charAt(0) || "P"}
                              </div>
                              <span className="font-medium text-slate-200">{app.patientNome}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {new Date(app.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })} às {new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                              app.status === 'completed' ? "bg-emerald-500/10 text-emerald-400" : 
                              app.status === 'pending' ? "bg-amber-500/10 text-amber-400" : 
                              app.status === 'confirmed' ? "bg-blue-500/10 text-blue-400" :
                              "bg-red-500/10 text-red-400"
                            )}>
                              {app.status === 'completed' ? 'Concluída' : 
                               app.status === 'pending' ? 'Pendente' : 
                               app.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {app.status === 'confirmed' && (
                              <button 
                                onClick={() => navigate(`/atendimento/${app.id}`)}
                                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                              >
                                Acessar Sala
                              </button>
                            )}
                            {app.status === 'pending' && (
                              <div className="flex gap-2">
                                <button onClick={() => handleStatusUpdate(app.id, 'confirmed')} className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">Confirmar</button>
                                <span className="text-slate-600">|</span>
                                <button onClick={() => handleStatusUpdate(app.id, 'cancelled')} className="text-red-400 hover:text-red-300 font-medium transition-colors">Recusar</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {appointments.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                            Nenhum histórico de sessões encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financeiro' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Saldo Disponível</p>
                  <p className="text-2xl font-bold text-emerald-400">R$ {profile?.totalEarnings?.toFixed(2) || "0.00"}</p>
                  <p className="text-[10px] text-slate-500">Pronto para transferência</p>
                </div>
                <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">A Receber</p>
                  <p className="text-2xl font-bold text-amber-400">R$ {profile?.pendingEarnings?.toFixed(2) || "0.00"}</p>
                  <p className="text-[10px] text-slate-500">Sessões em processamento</p>
                </div>
                <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Seu Payout</p>
                  <p className="text-2xl font-bold text-emerald-400">R$ {((profile?.preco || 0) * (1 - (profile?.desconto || 0) / 100)).toFixed(2)}</p>
                  <p className="text-[10px] text-slate-500">Líquido por sessão realizada</p>
                </div>
                <button
                  onClick={() => {
                    setPayoutError("");
                    setPayoutSuccess(false);
                    setShowPayoutModal(true);
                  }}
                  className="bg-emerald-600 rounded-3xl p-6 flex flex-col justify-center items-center text-center shadow-lg shadow-emerald-900/20 cursor-pointer hover:bg-emerald-500 transition-all border-none outline-none text-slate-950"
                >
                  <DollarSign className="w-6 h-6 text-slate-950 mb-1" />
                  <p className="text-xs font-black uppercase tracking-widest">Solicitar Saque</p>
                </button>
              </div>

              {/* Conexão Bancária */}
              {profile?.bankSettings?.bankName ? (
                <div className="bg-slate-900 border border-white/5 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 text-left">
                      <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">Conta de Recebimento Ativa</h3>
                      <p className="text-xs text-slate-300">
                        {profile.bankSettings.bankName} • Agência {profile.bankSettings.bankAgency} • Conta {profile.bankSettings.bankAccount}
                      </p>
                      <p className="text-[10px] text-slate-450">
                        Chave PIX cadastrada ({profile.bankSettings.pixKeyType?.toUpperCase()}): <span className="font-mono text-slate-300">{profile.bankSettings.pixKey}</span>
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowBankModal(true)}
                    className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl text-xs font-bold border border-white/5 transition-all w-full md:w-auto"
                  >
                    Alterar Dados Bancários
                  </button>
                </div>
              ) : (
                <div className="bg-slate-900 border border-white/5 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-purple-500/10 rounded-2xl">
                      <TrendingUp className="w-8 h-8 text-purple-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-slate-200">Conexão Bancária</h3>
                      <p className="text-slate-400 text-sm">Receba seus ganhos diretamente em sua conta via PIX ou TED.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowBankModal(true)}
                    className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-all"
                  >
                    Configurar Recebimento
                  </button>
                </div>
              )}

              {/* Histórico de Ganhos */}
              <div className="bg-slate-900 border border-white/5 p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-slate-200">Histórico de Ganhos</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <PieChart className="w-4 h-4" />
                    Balanço Mensal
                  </div>
                </div>

                <div className="space-y-4">
                  {appointments.filter(a => a.status === 'completed').length > 0 ? (
                    appointments.filter(a => a.status === 'completed').map((app) => {
                      const payout = app.price * (1 - (profile?.desconto || 0) / 100);
                      const fee = payout * 0.10;
                      return (
                        <div key={app.id} className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-white/5 text-left">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-900/20 rounded-full flex items-center justify-center">
                              <DollarSign className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-200">Sessão: {app.patientNome}</p>
                              <p className="text-xs text-slate-500">{new Date(app.date).toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-400">+ R$ {payout.toFixed(2)}</p>
                            <p className="text-[10px] text-slate-500">Taxa SentiPae (10%): R$ {fee.toFixed(2)}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-slate-500">
                      Nenhum ganho registrado ainda. Realize consultas na plataforma para gerar receita.
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-900/10 border border-blue-500/20 p-6 rounded-3xl flex items-start gap-4 text-left">
                <div className="p-3 bg-blue-500/20 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-200">Descontos para Empresas & Prefeituras</h4>
                  <p className="text-sm text-blue-400/80 mt-1 leading-relaxed">
                    Sua conta está devidamente habilitada para os programas SENTI Corporativo e SentiPae Saúde Pública. 
                    Terapeutas parceiros recebem subsídios de prefeituras ou corporações de forma integral, faturados no primeiro dia útil de cada mês útil.
                  </p>
                </div>
              </div>

              {/* Modal de Configuração de Conta Bancária */}
              {showBankModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-6 text-left">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-200 uppercase tracking-wider">Configurar Conta de Recebimento</h3>
                      <p className="text-[10px] text-slate-400">Informe os seus dados bancários e chave PIX para saques automáticos.</p>
                    </div>

                    <form onSubmit={handleSaveBankSettings} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Instituição Bancária</label>
                        <select
                          required
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full bg-slate-950 text-slate-200 text-xs px-4 py-3 rounded-xl border border-white/5 outline-none focus:border-emerald-500"
                        >
                          <option value="">Selecione o banco</option>
                          <option value="Banco do Brasil">Banco do Brasil</option>
                          <option value="Itaú Unibanco">Itaú Unibanco</option>
                          <option value="Bradesco">Bradesco</option>
                          <option value="Santander">Santander</option>
                          <option value="Nubank">Nubank</option>
                          <option value="Inter">Banco Inter</option>
                          <option value="C6 Bank">C6 Bank</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Agência</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: 0001"
                            value={bankAgency}
                            onChange={(e) => setBankAgency(e.target.value)}
                            className="w-full bg-slate-950 text-slate-200 text-xs px-4 py-3 rounded-xl border border-white/5 outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Conta Corrente</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: 12345-6"
                            value={bankAccount}
                            onChange={(e) => setBankAccount(e.target.value)}
                            className="w-full bg-slate-950 text-slate-200 text-xs px-4 py-3 rounded-xl border border-white/5 outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Tipo de Chave PIX</label>
                        <div className="grid grid-cols-3 gap-2">
                          {["cpf", "email", "telefone"].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setPixKeyType(type)}
                              className={cn(
                                "py-2.5 rounded-lg text-[10px] font-black uppercase border transition",
                                pixKeyType === type 
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                  : "bg-slate-950 text-slate-500 border-white/5 hover:border-white/10"
                              )}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Chave PIX</label>
                        <input
                          type="text"
                          required
                          placeholder="Digite sua chave PIX"
                          value={pixKey}
                          onChange={(e) => setPixKey(e.target.value)}
                          className="w-full bg-slate-950 text-slate-200 text-xs px-4 py-3 rounded-xl border border-white/5 outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setShowBankModal(false)}
                          className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-slate-400 transition"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={savingBank}
                          className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-450 text-slate-950 rounded-xl text-xs font-black transition"
                        >
                          {savingBank ? (
                            <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
                          ) : savingBankSuccess ? (
                            "Salvo!"
                          ) : (
                            "Salvar Dados"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Modal de Solicitação de Saque (Payout) */}
              {showPayoutModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-6 text-left">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-200 uppercase tracking-wider">Solicitar Saque (TED/PIX)</h3>
                      <p className="text-[10px] text-slate-400">Insira o valor que deseja transferir para sua conta de recebimento ativa.</p>
                    </div>

                    <form onSubmit={handleRequestPayout} className="space-y-4">
                      <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-bold uppercase">Saldo Disponível</span>
                        <span className="text-base font-extrabold text-emerald-400">R$ {profile?.totalEarnings?.toFixed(2) || "0.00"}</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Valor de Transferência (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="0,00"
                          value={payoutAmount}
                          onChange={(e) => setPayoutAmount(e.target.value)}
                          className="w-full bg-slate-950 text-slate-200 text-sm px-4 py-3 rounded-xl border border-white/5 outline-none focus:border-emerald-500 font-bold"
                        />
                      </div>

                      {payoutError && (
                        <div className="p-3.5 bg-red-500/10 border border-red-500/15 rounded-xl flex items-center gap-2.5 text-[10px] text-red-400">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{payoutError}</span>
                        </div>
                      )}

                      {payoutSuccess && (
                        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/15 rounded-xl flex items-center gap-2.5 text-[10px] text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>Sucesso! Saque aprovado e enviado para transferência via PIX.</span>
                        </div>
                      )}

                      <div className="flex gap-3 pt-4 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setShowPayoutModal(false)}
                          className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-slate-400 transition"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={payoutLoading || payoutSuccess}
                          className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-450 text-slate-950 rounded-xl text-xs font-black transition"
                        >
                          {payoutLoading ? (
                            <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
                          ) : payoutSuccess ? (
                            "Sucesso!"
                          ) : (
                            "Confirmar Saque"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'perfil' && (
            <div className="bg-slate-900 border border-white/5 p-8 rounded-3xl space-y-8">
              <div className="flex items-center gap-8">
                <div className="relative group">
                  <img 
                    src={profile?.fotoUrl || `https://picsum.photos/seed/${profile?.uid}/200`} 
                    alt={profile?.nome} 
                    className="w-32 h-32 rounded-3xl object-cover border-2 border-emerald-500/20 group-hover:opacity-75 transition-opacity"
                  />
                  <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Settings className="w-8 h-8 text-white" />
                  </button>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-200">{profile?.nome}</h3>
                  <p className="text-slate-400 text-lg">{profile?.especialidades?.join(', ')}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full uppercase tracking-widest">Ativo</span>
                    <span className="text-slate-500 text-sm">Membro desde {new Date(profile?.createdAt || Date.now()).getFullYear()}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">DNA Terapêutico</label>
                  <div className="p-6 bg-slate-950 rounded-3xl border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Intensidade</span>
                      <span className="text-xs font-bold text-emerald-400">{profile?.intensidade || 50}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${profile?.intensidade || 50}%` }} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Estilo</p>
                        <p className="text-sm text-slate-200 capitalize">{profile?.estilo || "Acolhedor"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Abordagem</p>
                        <p className="text-sm text-slate-200">{profile?.abordagem || "TCC"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Valor da Sessão</label>
                  <div className="p-6 bg-slate-950 rounded-3xl border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-200">R$ {profile?.preco}</p>
                      <p className="text-xs text-slate-500">Taxa de desconto: {profile?.desconto || 0}%</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-2xl">
                      <DollarSign className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Segurança da Conta</label>
                  <div className="p-6 bg-slate-950 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-2xl">
                        <Lock className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-200">Google Authenticator</h4>
                        <p className="text-xs text-slate-500">
                          Status: {profile?.googleAuthenticatorEnabled ? 'Ativado' : 'Desativado'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={async () => {
                        if (!profile) return;
                        try {
                          await userService.updateProfile(profile.uid, { 
                            googleAuthenticatorEnabled: !profile.googleAuthenticatorEnabled 
                          });
                        } catch (e) {
                          console.error("Error toggling authenticator", e);
                        }
                      }}
                      className={cn(
                        "px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap",
                        profile?.googleAuthenticatorEnabled 
                          ? "bg-slate-800 text-slate-400 border border-white/5" 
                          : "bg-blue-600 hover:bg-blue-500 text-white"
                      )}
                    >
                      {profile?.googleAuthenticatorEnabled ? 'Desativar' : 'Ativar'}
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Biografia Profissional</label>
                  <div className="p-6 bg-slate-950 rounded-3xl border border-white/5 text-slate-300 leading-relaxed italic">
                    "{profile?.biografia || "Nenhuma biografia cadastrada. Adicione uma para que os pacientes conheçam melhor seu trabalho."}"
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => navigate("/terapeuta-setup")}
                  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/20"
                >
                  Editar Perfil Completo
                </button>
                <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-bold transition-all border border-white/5">
                  Visualizar como Paciente
                </button>
              </div>
            </div>
          )}

          {activeTab === 'iara_assistente' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Painel Esquerdo: Briefing de Pacientes & Lembretes */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Briefing Card */}
                  <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 space-y-4">
                    <h3 className="font-extrabold text-sm text-purple-300 uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Briefings Autorizados (LGPD)
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Os pacientes abaixo concederam consentimento para compartilhar um resumo inteligente de sua jornada com você:
                    </p>

                    <div className="space-y-3 pt-2">
                      <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs font-bold text-slate-200">João Paulo Mendonça</p>
                            <p className="text-[10px] text-slate-500">Próxima sessão: Hoje, 14:00</p>
                          </div>
                          <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">Autorizado</span>
                        </div>
                        <div className="p-3 bg-purple-950/20 rounded-xl border border-purple-500/10 space-y-2">
                          <p className="text-[10px] font-bold text-purple-300 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> Insight da IARA:
                          </p>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            "João apresentou picos de ansiedade na terça-feira relatando estresse corporativo. Realizou 2 exercícios de respiração guiada e anotou que a meditação de Poesia Hipnótica ajudou a reestabelecer o foco antes de dormir."
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs font-bold text-slate-200">Maria Eduarda Santos</p>
                            <p className="text-[10px] text-slate-500">Próxima sessão: Amanhã, 10:30</p>
                          </div>
                          <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">Autorizado</span>
                        </div>
                        <div className="p-3 bg-purple-950/20 rounded-xl border border-purple-500/10 space-y-2">
                          <p className="text-[10px] font-bold text-purple-300 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> Insight da IARA:
                          </p>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            "Maria manteve um humor estável durante a semana. Registrou conquistas pessoais em relação ao autocuidado e prática consistente de atividade física recomendada."
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lembretes / Agenda Proativa */}
                  <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-300 uppercase tracking-widest">
                      Tarefas & Lembretes
                    </h3>
                    <div className="space-y-3">
                      {[
                        { title: "Enviar evolução clínica do João para faturamento", done: false },
                        { title: "Revisar notas da sessão da Maria Eduarda", done: true },
                        { title: "Atualizar cronograma de workshops corporativos", done: false }
                      ].map((task, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-950/40 rounded-xl border border-white/5">
                          <input type="checkbox" checked={task.done} readOnly className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900" />
                          <span className={`text-xs ${task.done ? 'line-through text-slate-500' : 'text-slate-300'}`}>{task.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Painel Direito: Workspace Interativo da IARA Pro */}
                <div className="lg:col-span-7 bg-slate-900 border border-white/5 rounded-3xl p-6 flex flex-col h-[650px]">
                  <div className="border-b border-white/5 pb-4 mb-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/10 rounded-xl border border-purple-500/20 flex items-center justify-center text-purple-400">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-200">IARA Pro Workspace</h4>
                        <p className="text-[10px] text-slate-500">Seu assistente cognitivo administrativo</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Area */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {iaraProMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-4 space-y-1.5 ${
                          msg.role === 'user' 
                            ? 'bg-purple-600 text-white rounded-tr-none' 
                            : 'bg-slate-950 text-slate-300 border border-white/5 rounded-tl-none'
                        }`}>
                          <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          <span className="text-[9px] text-slate-400/80 block text-right">{msg.time}</span>
                        </div>
                      </div>
                    ))}
                    {isIaraProTyping && (
                      <div className="flex justify-start">
                        <div className="bg-slate-950 text-slate-300 border border-white/5 rounded-2xl rounded-tl-none p-4 flex gap-1.5">
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Action Tags */}
                  <div className="py-3 border-t border-white/5 mt-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Ações Rápidas de IA:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "Gerar Relatório de Evolução (João)",
                        "Preparar Pauta de Sessão (Maria)",
                        "Sugestões para Manejo de Ansiedade",
                        "Resumir Atendimentos da Semana"
                      ].map((action, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setIaraProInput(action);
                          }}
                          className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-white/5 hover:border-purple-500/30 rounded-lg text-slate-300 text-[10px] font-bold transition-all"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Form */}
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!iaraProInput.trim()) return;
                      const userMsg = iaraProInput;
                      setIaraProInput("");
                      setIaraProMessages(prev => [...prev, {
                        role: "user",
                        text: userMsg,
                        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                      }]);
                      setIsIaraProTyping(true);

                      // Simulate intelligent responses
                      setTimeout(() => {
                        let replyText = "";
                        if (userMsg.includes("Relatório")) {
                          replyText = "Aqui está a minuta do Relatório de Evolução Clínica para João Paulo Mendonça:\n\n**RELATÓRIO DE EVOLUÇÃO CLÍNICA**\n**Paciente:** João Paulo Mendonça\n**Período:** Últimas 4 semanas\n**Abordagem:** TCC\n\n1. **Sintomas Apresentados:** Flutuações de ansiedade com gatilho laboral (estresse corporativo).\n2. **Engajamento:** Excelente. Utilizou diários emocionais e exercícios de respiração propostos.\n3. **Direcionamento:** Continuar trabalhando reestruturação cognitiva e limites saudáveis no ambiente de trabalho.\n\nDeseja que eu envie esta minuta diretamente para o prontuário eletrônico do paciente?";
                        } else if (userMsg.includes("Pauta")) {
                          replyText = "Para a sessão de amanhã com Maria Eduarda Santos, sugiro focar nos seguintes tópicos com base em sua jornada de autocuidado:\n\n1. **Celebração de Conquistas:** Discutir a consistência dela nas atividades físicas e o reflexo positivo no humor estável dela.\n2. **Autoestima:** Explorar como os pequenos sucessos diários alteraram a percepção dela sobre o autocuidado.\n3. **Manutenção de Hábitos:** Planejar estratégias para os dias em que a motivação estiver menor.";
                        } else if (userMsg.includes("Ansiedade")) {
                          replyText = "Como psicólogo(a) na plataforma, você pode indicar à IARA do paciente que recomende os seguintes conteúdos da biblioteca:\n\n1. **Respiração Diafragmática Pro:** Ajuda a controlar sintomas agudos de pânico.\n2. **Meditação de Poesia Cognitiva Hipnótica (PCH):** Excelente para relaxamento profundo antes do sono.\n3. **Diário de Gratidão:** Para diminuir o foco em pensamentos automáticos negativos.";
                        } else {
                          replyText = "Perfeito, Doutor(a). Entendi seu pedido e estou processando suas instruções de faturamento e agenda corporativa. Deseja que eu gere uma minuta oficial ou agende um lembrete no Google Calendar?";
                        }

                        setIaraProMessages(prev => [...prev, {
                          role: "assistant",
                          text: replyText,
                          time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                        }]);
                        setIsIaraProTyping(false);
                      }, 1500);
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={iaraProInput}
                      onChange={(e) => setIaraProInput(e.target.value)}
                      placeholder="Fale com a IARA Pro..."
                      className="flex-1 bg-slate-950 border border-white/5 focus:border-purple-500 rounded-2xl px-4 py-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold text-xs transition-colors shadow-lg shadow-purple-900/20 shrink-0"
                    >
                      Enviar
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'google_workspace' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Google Workspace Connection Status Card */}
              <div className="bg-slate-900 border border-white/5 p-8 rounded-3xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-500/10 rounded-2xl">
                      <Cloud className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-100">Google Workspace Cloud Account</h3>
                      <p className="text-slate-400 text-sm mt-1">
                        Sincronize sua agenda no Google Calendar e integre notificações instantâneas no Google Chat.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={isGoogleConnected ? handleDisconnectGoogle : handleGoogleAuth}
                    disabled={isConnectingGoogle}
                    className={cn(
                      "group relative px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 overflow-hidden",
                      isGoogleConnected
                        ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 active:scale-95"
                    )}
                  >
                    {isConnectingGoogle ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : isGoogleConnected ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        Desconectar Google
                      </>
                    ) : (
                      <>
                        <Cloud className="w-5 h-5" />
                        Conectar Conta Google
                      </>
                    )}
                  </button>
                </div>

                {isGoogleConnected && (
                  <div className="mt-6 pt-6 border-t border-white/5 text-xs text-emerald-400 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    Autenticado com sucesso. Agenda Google Calendar e Google Chat ativos.
                  </div>
                )}
              </div>

              {/* Grid for Calendar Sync and Chat Rooms */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. Google Calendar Segment */}
                <div className="bg-slate-900 border border-white/5 p-8 rounded-3xl space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-blue-400" />
                      <h4 className="text-lg font-bold text-slate-200">Google Calendar Sync</h4>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-blue-500/10 text-blue-400 font-medium rounded-full">
                      API Ativa
                    </span>
                  </div>

                  <p className="text-slate-400 text-sm leading-relaxed">
                    Sincronize as consultas com o Google Agenda do terapeuta ou paciente com um único clique.
                  </p>

                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {appointments.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-sm">
                        Nenhum atendimento agendado para sincronizar.
                      </div>
                    ) : (
                      appointments.map((appt) => {
                        const dateStr = new Date(appt.date).toLocaleDateString('pt-BR');
                        const isSynced = appt.googleSynced || syncStatus[appt.id];

                        return (
                          <div 
                            key={appt.id} 
                            className="bg-slate-950/70 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4 hover:border-white/10 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-200 truncate">{appt.patientNome}</p>
                              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-600" />
                                {dateStr} às {appt.time || "12:00"} ({appt.type})
                              </p>
                            </div>

                            <button
                              onClick={() => isGoogleConnected ? handleSyncToCalendar(appt) : handleGoogleAuth()}
                              className={cn(
                                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 active:scale-95",
                                isSynced
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600/20"
                              )}
                            >
                              {isSynced ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Sincronizado
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  Sync
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 2. Google Chat Space / News Dispatcher */}
                <div className="bg-slate-900 border border-white/5 p-8 rounded-3xl space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-6 h-6 text-blue-400" />
                      <h4 className="text-lg font-bold text-slate-200">Google Chat Notification Engine</h4>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 font-medium rounded-full">
                      Google Chat
                    </span>
                  </div>

                  <p className="text-slate-400 text-sm leading-relaxed">
                    Envie alertas imediatos, relatórios de suporte clínico ou notas de sessões diretamente para os seus canais do Google Chat.
                  </p>

                  {!isGoogleConnected ? (
                    <div className="bg-slate-950 border border-white/5 rounded-2xl p-6 text-center text-slate-500 space-y-3">
                      <Lock className="w-8 h-8 mx-auto text-slate-700" />
                      <p className="text-xs">Faça login com sua conta do Google para carregar e listar suas salas do Google Chat Spaces ativos.</p>
                      <button
                        onClick={handleGoogleAuth}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all active:scale-95"
                      >
                        Autorizar Acesso
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Space Selector */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Salas do Google Chat Disponíveis</label>
                        {isLoadingSpaces ? (
                          <div className="p-4 flex justify-center">
                            <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                          </div>
                        ) : chatSpaces.length === 0 ? (
                          <div className="bg-slate-950 p-4 border border-white/5 rounded-2xl flex justify-between items-center text-sm text-slate-400">
                            <span>Nenhuma sala do Chat encontrada.</span>
                            <button
                              onClick={fetchChatSpaces}
                              className="p-1 hover:text-white transition-colors"
                              title="Recarregar"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <select
                              value={selectedSpace}
                              onChange={(e) => setSelectedSpace(e.target.value)}
                              className="flex-1 bg-slate-950 p-3 rounded-2xl border border-white/5 text-slate-200 text-sm focus:outline-none focus:border-blue-500/50"
                            >
                              {chatSpaces.map((space) => (
                                <option key={space.name} value={space.name}>
                                  {space.displayName || space.name}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={fetchChatSpaces}
                              className="p-3 bg-slate-950 hover:bg-slate-800 rounded-2xl border border-white/5 text-slate-400 hover:text-white transition-colors"
                              title="Recarregar salas"
                            >
                              <RefreshCw className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Appointment Selector for Alerts */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selecionar Consulta para Alerta</label>
                        {appointments.length === 0 ? (
                          <div className="bg-slate-950 p-3 rounded-2xl border border-white/5 text-xs text-slate-500">
                            Nenhuma consulta cadastrada no sistema.
                          </div>
                        ) : (
                          <select
                            value={selectedApptIdForAlert}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedApptIdForAlert(val);
                              if (val) {
                                generateAlertMessage(val);
                              }
                            }}
                            className="w-full bg-slate-950 p-3 rounded-2xl border border-white/5 text-slate-200 text-sm focus:outline-none focus:border-blue-500/50"
                          >
                            <option value="">-- Escolha uma consulta para notificar --</option>
                            {appointments.map((appt) => {
                              const dateStr = new Date(appt.date).toLocaleDateString('pt-BR');
                              return (
                                <option key={appt.id} value={appt.id}>
                                  {appt.patientNome} - {dateStr} às {appt.time || "12:00"} ({appt.status === 'pending' ? 'Pendente' : appt.status === 'confirmed' ? 'Confirmado' : appt.status})
                                </option>
                              );
                            })}
                          </select>
                        )}
                      </div>

                      {/* Message Dispatcher Form */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Conteúdo da Mensagem / Alerta</label>
                        <textarea
                          rows={4}
                          value={chatMessageText}
                          onChange={(e) => setChatMessageText(e.target.value)}
                          placeholder="Ex: [Alerta de Atendimento] Novo paciente incluído no prontuário ou SOS acionado..."
                          className="w-full bg-slate-950 p-4 rounded-2xl border border-white/5 text-slate-200 text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-slate-600 resize-none font-sans"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (selectedApptIdForAlert) {
                              generateAlertMessage(selectedApptIdForAlert);
                            } else if (appointments.length > 0) {
                              const recent = appointments[0];
                              setSelectedApptIdForAlert(recent.id);
                              generateAlertMessage(recent.id);
                            } else {
                              setChatMessageText("📋 [Relatório Diário] Nenhum atendimento pendente para hoje.");
                            }
                          }}
                          className="px-4 py-3 bg-slate-950 hover:bg-slate-800 text-xs font-bold text-slate-400 hover:text-white rounded-2xl border border-white/5 transition-all text-center flex items-center justify-center whitespace-nowrap"
                        >
                          Gerar Template
                        </button>

                        <button
                          onClick={handleSendChatAlert}
                          disabled={isSendingChatMessage || !selectedSpace}
                          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/50 disabled:text-slate-500 disabled:opacity-50 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                          {isSendingChatMessage ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Enviar Google Chat
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-white/5 px-1 pb-safe pt-2 flex justify-around items-center z-30 lg:hidden">
        <button 
          onClick={() => setActiveTab("dashboard")}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-2 transition-colors min-w-[56px]",
            activeTab === 'dashboard' ? "text-emerald-400" : "text-slate-500"
          )}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Dash</span>
        </button>
        <button 
          onClick={() => setActiveTab("agenda")}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-2 transition-colors min-w-[56px]",
            activeTab === 'agenda' ? "text-emerald-400" : "text-slate-500"
          )}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Agenda</span>
        </button>
        <button 
          onClick={() => setActiveTab("pacientes")}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-2 transition-colors min-w-[56px]",
            activeTab === 'pacientes' ? "text-emerald-400" : "text-slate-500"
          )}
        >
          <Users className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Pacientes</span>
        </button>
        <button 
          onClick={() => setActiveTab("historico")}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-2 transition-colors min-w-[56px]",
            activeTab === 'historico' ? "text-emerald-400" : "text-slate-500"
          )}
        >
          <Activity className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Histórico</span>
        </button>
        <button 
          onClick={() => setActiveTab("financeiro")}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-2 transition-colors min-w-[56px]",
            activeTab === 'financeiro' ? "text-emerald-400" : "text-slate-500"
          )}
        >
          <DollarSign className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Ganhos</span>
        </button>
        <button 
          onClick={() => setActiveTab("perfil")}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-2 transition-colors min-w-[56px]",
            activeTab === 'perfil' ? "text-emerald-400" : "text-slate-500"
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Perfil</span>
        </button>
      </nav>
    </div>
  );
}
