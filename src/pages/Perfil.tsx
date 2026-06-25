import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { 
  User, 
  Mail, 
  MapPin, 
  Briefcase, 
  Calendar, 
  ArrowLeft, 
  LogOut, 
  Edit2, 
  Save, 
  Camera,
  ShieldCheck,
  Lock,
  Activity,
  HeartPulse,
  Bell,
  Zap,
  Sparkles,
  Play,
  Square,
  Crown,
  Star,
  MessageSquare,
  X,
  Phone,
  ShieldAlert,
  History,
  Trash2
} from "lucide-react";
import { auth, logout } from "../services/firebase";
import { userService } from "../services/userService";
import { UserProfile } from "../types";
import { cn } from "../lib/utils";
import { usePWA } from "../contexts/PWAContext";
import { NotificationService } from "../services/notificationService";
import { analysisService, TreatmentAnalysis } from "../services/analysisService";
import { getPillOfDay, Pill } from "../services/pillService";

export default function Perfil() {
  const navigate = useNavigate();
  const { requestNotificationPermission } = usePWA();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analysis, setAnalysis] = useState<TreatmentAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [moodHistory, setMoodHistory] = useState<any[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [dailyPill, setDailyPill] = useState<Pill | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [sosLogs, setSosLogs] = useState<any[]>([]);

  useEffect(() => {
    const loadLogs = () => {
      try {
        const logsStr = localStorage.getItem("sos_button_triggers") || "[]";
        const logs = JSON.parse(logsStr);
        setSosLogs(logs.reverse());
      } catch (e) {
        console.error("Error loading SOS logs:", e);
      }
    };
    loadLogs();
  }, []);

  const handleClearSosLogs = () => {
    try {
      localStorage.setItem("sos_button_triggers", "[]");
      setSosLogs([]);
    } catch (e) {
      console.error("Error clearing SOS logs:", e);
    }
  };

  // Form state
  const [nome, setNome] = useState("");
  const [biografia, setBiografia] = useState("");
  const [cidade, setCidade] = useState("");
  const [emergencyContacts, setEmergencyContacts] = useState<Array<{ name: string; phone: string }>>([
    { name: "", phone: "" },
    { name: "", phone: "" }
  ]);
  const [sosTemplateMessage, setSosTemplateMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const data = await userService.getUser(user.uid);
        setProfile(data);
        setNome(data.nome || "");
        setBiografia(data.biografia || "");
        setCidade(data.cidade || "");
        
        if (data.emergencyContacts && data.emergencyContacts.length > 0) {
          const padded = [...data.emergencyContacts];
          while (padded.length < 2) {
            padded.push({ name: "", phone: "" });
          }
          setEmergencyContacts(padded);
        } else {
          setEmergencyContacts([
            { name: "", phone: "" },
            { name: "", phone: "" }
          ]);
        }
        setSosTemplateMessage(data.sosTemplateMessage || "Olá, estou passando por uma crise de ansiedade/pânico agora e preciso de ajuda. Por favor, fale comigo assim que puder.");
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();

    // Load mood history for analysis
    const unsubMood = userService.getMoodHistory((history) => {
      setMoodHistory(history);
    });

    // Load diary entries for analysis
    const unsubDiary = userService.getDiaryEntries((entries) => {
      setDiaryEntries(entries);
    });

    // Load daily pill
    setDailyPill(getPillOfDay());

    return () => {
      unsubMood();
      unsubDiary();
    };
  }, [navigate]);

  const handleGenerateAnalysis = async () => {
    setAnalyzing(true);
    try {
      const result = await analysisService.generateAnalysis(moodHistory, diaryEntries);
      setAnalysis(result);
    } catch (error) {
      console.error("Error generating analysis:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const cleanContacts = emergencyContacts.filter(c => c.name.trim() !== "" || c.phone.trim() !== "");
      await userService.updateProfile(profile.uid, {
        nome,
        biografia,
        cidade,
        emergencyContacts: cleanContacts,
        sosTemplateMessage: sosTemplateMessage.trim()
      });
      setProfile({ 
        ...profile, 
        nome, 
        biografia, 
        cidade, 
        emergencyContacts: cleanContacts, 
        sosTemplateMessage: sosTemplateMessage.trim() 
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (feedbackRating === 0) return;
    setSubmittingFeedback(true);
    try {
      const success = await userService.saveFeedback(feedbackRating, feedbackComment);
      if (success) {
        setShowFeedbackModal(false);
        setFeedbackRating(0);
        setFeedbackComment("");
        // Could add a toast here
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const toggleAudio = () => {
    if (!dailyPill) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const textToRead = `${dailyPill.frase}. Reflexão: ${dailyPill.reflexao}. Ação: ${dailyPill.acao}.`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9; // Slightly slower for a more relaxing tone
      
      utterance.onend = () => {
        setIsPlaying(false);
      };
      
      utterance.onerror = () => {
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const testNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification("SENTI App", {
        body: "Esta é uma notificação de teste! Suas notificações estão funcionando corretamente.",
        icon: "/icons/icon-192x192.png"
      });
    } else {
      requestNotificationPermission();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 font-sans">
      {/* Header */}
      <header className="px-4 py-4 sm:p-6 flex justify-between items-center sticky top-0 bg-slate-950/80 backdrop-blur-md z-20 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-3 -ml-2 hover:bg-white/5 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-slate-400" />
        </button>
        <h1 className="text-base sm:text-lg font-medium text-slate-200">Meu Perfil</h1>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={saving}
          aria-label={isEditing ? "Salvar" : "Editar"}
          className={cn(
            "p-3 rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center",
            isEditing ? "bg-emerald-500 text-white" : "bg-slate-900 border border-white/5 text-slate-400"
          )}
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : isEditing ? (
            <Save className="w-4 h-4" />
          ) : (
            <Edit2 className="w-4 h-4" />
          )}
        </button>
      </header>

      <main className="p-6 max-w-2xl mx-auto space-y-8">
        {/* Profile Info */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <img 
              src={profile?.fotoUrl || `https://picsum.photos/seed/${profile?.uid}/200/200`} 
              alt={profile?.nome} 
              className="w-32 h-32 rounded-[2rem] object-cover border-4 border-slate-900 shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <button className="absolute -bottom-2 -right-2 p-3 bg-emerald-600 rounded-2xl border-4 border-slate-950 text-white shadow-xl">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center">
            {isEditing ? (
              <input 
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="bg-slate-900 border border-emerald-500/30 rounded-xl px-4 py-2 text-center text-2xl font-serif italic text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            ) : (
              <h2 className="text-3xl font-serif italic text-white">{profile?.nome}</h2>
            )}
            <p className="text-emerald-400 text-sm font-medium uppercase tracking-widest mt-1">
              {profile?.tipo === 'terapeuta' ? 'Terapeuta Especialista' : 'Paciente'}
            </p>
          </div>
        </div>

        {/* Stats / Badges */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-900/50 border border-white/5 p-4 rounded-3xl text-center space-y-1">
            <div className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Status</p>
            <p className="text-sm font-medium text-slate-200">Verificado</p>
          </div>
          <div className="bg-slate-900/50 border border-white/5 p-4 rounded-3xl text-center space-y-1">
            <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Nível</p>
            <p className="text-sm font-medium text-slate-200">Iniciante</p>
          </div>
          <div className="bg-slate-900/50 border border-white/5 p-4 rounded-3xl text-center space-y-1">
            <div className="w-8 h-8 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <HeartPulse className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Saúde</p>
            <p className="text-sm font-medium text-slate-200">Estável</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-2">Biografia</label>
            {isEditing ? (
              <textarea 
                value={biografia}
                onChange={(e) => setBiografia(e.target.value)}
                rows={4}
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none"
                placeholder="Conte um pouco sobre você..."
              />
            ) : (
              <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-4">
                <p className="text-slate-400 font-light leading-relaxed italic">
                  {profile?.biografia || "Nenhuma biografia adicionada."}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-2">E-mail</label>
              <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-600" />
                <span className="text-slate-300">{profile?.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-2">Cidade</label>
              {isEditing ? (
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input 
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    placeholder="Sua cidade"
                  />
                </div>
              ) : (
                <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-slate-600" />
                  <span className="text-slate-300">{profile?.cidade || "Não informada"}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-2">Membro desde</label>
            <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-600" />
              <span className="text-slate-300">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : "N/A"}
              </span>
            </div>
          </div>

          {/* Contatos de Emergência & Mensagem SOS */}
          <div id="sos-emergency-setup-card" className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">Contatos de Emergência & SOS</label>
            </div>
            <div className="bg-slate-900/30 border border-red-500/10 rounded-3xl p-6 space-y-6">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Adicione até 2 contatos para ajuda rápida:</p>
                    {emergencyContacts.map((contact, index) => (
                      <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Nome do Contato {index + 1}</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                            <input
                              type="text"
                              value={contact.name}
                              onChange={(e) => {
                                const newContacts = [...emergencyContacts];
                                newContacts[index].name = e.target.value;
                                setEmergencyContacts(newContacts);
                              }}
                              placeholder="Ex: Mãe, Amigo"
                              className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Telefone (com DDI e DDD)</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                            <input
                              type="text"
                              value={contact.phone}
                              onChange={(e) => {
                                const newContacts = [...emergencyContacts];
                                newContacts[index].phone = e.target.value;
                                setEmergencyContacts(newContacts);
                              }}
                              placeholder="Ex: 5511999999999"
                              className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mensagem pré-definida para WhatsApp</label>
                    <textarea
                      value={sosTemplateMessage}
                      onChange={(e) => setSosTemplateMessage(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all text-sm resize-none"
                      placeholder="Mensagem de socorro que será enviada..."
                    />
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Esta mensagem será pré-carregada no WhatsApp ao acionar o SOSButton para facilitar o envio rápido.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contatos Cadastrados</p>
                    {profile?.emergencyContacts && profile.emergencyContacts.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {profile.emergencyContacts.map((contact, index) => (
                          <div key={index} className="bg-slate-950/40 border border-red-500/10 p-4 rounded-2xl flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-sm font-bold text-slate-200">{contact.name}</p>
                              <p className="text-xs text-slate-400 flex items-center gap-1">
                                <Phone className="w-3 h-3 text-red-500/70" /> {contact.phone}
                              </p>
                            </div>
                            <span className="text-[9px] font-bold px-2 py-1 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">SOS</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-950/20 rounded-2xl text-center border border-dashed border-white/5">
                        <p className="text-xs text-slate-500">Nenhum contato cadastrado. Clique no botão de editar no topo para cadastrar.</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sua Mensagem SOS</p>
                    <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4">
                      <p className="text-xs text-slate-300 leading-relaxed italic">
                        "{profile?.sosTemplateMessage || sosTemplateMessage || "Nenhuma mensagem configurada."}"
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Histórico de Ativações SOS */}
          <div id="sos-regulation-logs" className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Histórico de Regulação Rápida (SOS)</label>
              </div>
              {sosLogs.length > 0 && (
                <button 
                  onClick={handleClearSosLogs}
                  className="text-[10px] font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Limpar
                </button>
              )}
            </div>

            <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-6 space-y-6">
              {sosLogs.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <HeartPulse className="w-8 h-8 text-indigo-500/40 mx-auto animate-pulse" />
                  <p className="text-sm font-medium text-slate-300">Nenhum SOS acionado recentemente</p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Excelente! Continue usando as pílulas diárias e os diários para manter o equilíbrio emocional.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary Bento Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 bg-slate-950/40 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ativações</p>
                      <p className="text-lg font-bold text-indigo-400 mt-1">
                        {sosLogs.filter(l => l.type === 'click').length}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-950/40 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ligações</p>
                      <p className="text-lg font-bold text-red-400 mt-1">
                        {sosLogs.filter(l => l.type === 'dial' || l.type === 'long_press').length}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-950/40 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Calmados</p>
                      <p className="text-lg font-bold text-emerald-400 mt-1">
                        {sosLogs.filter(l => l.type === 'grounding_complete').length}
                      </p>
                    </div>
                  </div>

                  {/* List of events */}
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {sosLogs.slice(0, 5).map((log, index) => {
                      let typeLabel = "Acionamento";
                      let typeColor = "text-slate-300 bg-slate-500/10 border-slate-500/20";
                      let LogIcon = ShieldAlert;

                      if (log.type === 'click') {
                        typeLabel = "Pronto-Socorro Rápido";
                        typeColor = "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
                        LogIcon = ShieldAlert;
                      } else if (log.type === 'long_press' || log.type === 'dial') {
                        typeLabel = "Chamada Iniciada";
                        typeColor = "text-red-400 bg-red-500/10 border-red-500/20";
                        LogIcon = Phone;
                      } else if (log.type === 'grounding_complete') {
                        typeLabel = "Grounding Concluído";
                        typeColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                        LogIcon = HeartPulse;
                      }

                      const date = new Date(log.timestamp);
                      const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                      const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

                      return (
                        <div key={log.id || index} className="p-3 bg-slate-950/40 border border-white/5 rounded-2xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl border ${typeColor.split(' ')[1]} ${typeColor.split(' ')[2]}`}>
                              <LogIcon className={`w-3.5 h-3.5 ${typeColor.split(' ')[0]}`} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-200">{typeLabel}</p>
                              <p className="text-[10px] text-slate-500">A partir de {log.page === '/' ? 'Início' : (log.page || 'Página Inicial')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-300">{formattedTime}</p>
                            <p className="text-[10px] text-slate-500">{formattedDate}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {sosLogs.length > 5 && (
                    <p className="text-[10px] text-center text-slate-500 italic mt-2">
                      Mostrando os últimos 5 acionamentos de regulação.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Pílula do Dia */}
          <div className="space-y-4 pt-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-2">Pílula Terapêutica do Dia</label>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Dica do Dia</p>
                  </div>
                  <button 
                    onClick={toggleAudio}
                    className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-full transition-colors flex items-center gap-2"
                    aria-label={isPlaying ? "Parar áudio" : "Ouvir pílula"}
                  >
                    {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>
                </div>
                {dailyPill ? (
                  <>
                    <p className="text-lg font-serif italic text-white leading-relaxed">
                      "{dailyPill.frase}"
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-300"><span className="font-bold text-emerald-400">Reflexão:</span> {dailyPill.reflexao}</p>
                      <p className="text-sm text-slate-300"><span className="font-bold text-emerald-400">Ação:</span> {dailyPill.acao}</p>
                    </div>
                    <button 
                      onClick={() => navigate('/diario')}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      Praticar no Diário
                    </button>
                  </>
                ) : (
                  <div className="h-20 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
            </div>
          </div>

          {/* Treatment Analysis Tool */}
          <div className="space-y-4 pt-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-2">Análise de Tratamento (IA)</label>
            <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-6 space-y-6">
              {!analysis ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                    <Activity className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-200">Análise Completa</p>
                    <p className="text-xs text-slate-500">Gere um relatório detalhado do seu progresso terapêutico baseado nos seus registros.</p>
                  </div>
                  <button 
                    onClick={handleGenerateAnalysis}
                    disabled={analyzing}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    {analyzing ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {analyzing ? "Analisando..." : "Gerar Análise Agora"}
                  </button>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Relatório Gerado</p>
                    </div>
                    <button 
                      onClick={() => setAnalysis(null)}
                      className="text-[10px] text-slate-500 hover:text-slate-300 underline"
                    >
                      Nova Análise
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/5">
                      <p className="text-sm text-slate-200 leading-relaxed italic">"{analysis.summary}"</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Índice de Progresso</p>
                        <p className="text-lg font-black text-emerald-400">{analysis.progressScore}%</p>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${analysis.progressScore}%` }}
                          className="h-full bg-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recomendações</p>
                      <ul className="space-y-2">
                        {analysis.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                            <div className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full mt-1.5 shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Próximo Passo</p>
                      <div className="bg-emerald-500/5 rounded-xl p-3 border border-emerald-500/10">
                        <p className="text-xs text-emerald-100 font-medium">{analysis.nextSteps}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Gerenciamento de Dados */}
          <div className="space-y-4 pt-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-2">Gerenciamento de Dados</label>
            <div 
              onClick={() => navigate("/gerenciar-dados")}
              className="bg-slate-900/30 border border-white/5 rounded-3xl p-6 hover:border-emerald-500/30 transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center animate-pulse">
                  <User className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">Dados Cadastrais & Perfil</p>
                  <p className="text-xs text-slate-500">
                    Edite nome, telefone, cidade, biografia e foto de perfil.
                  </p>
                </div>
              </div>
              <div className="text-slate-500 group-hover:text-emerald-400 transition-colors">
                <Sparkles className="w-4 h-4 text-emerald-500/80" />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="space-y-4 pt-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-2">Segurança da Conta</label>
            <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <Lock className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">Google Authenticator</p>
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
                      // Force refresh profile in context if needed, but AuthProvider should catch it if using onSnapshot
                    } catch (e) {
                      console.error("Error toggling authenticator", e);
                    }
                  }}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                    profile?.googleAuthenticatorEnabled 
                      ? "bg-slate-800 text-slate-400 border border-white/5" 
                      : "bg-blue-600 hover:bg-blue-50 text-white"
                  )}
                >
                  {profile?.googleAuthenticatorEnabled ? 'Desativar' : 'Ativar'}
                </button>
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                Adicione uma camada extra de segurança à sua conta utilizando o Google Authenticator para gerar códigos de verificação.
              </p>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-4 pt-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-2">Configurações de Notificação</label>
            <div className={cn(
              "rounded-3xl p-6 space-y-4 transition-all border",
              NotificationService.isPendingOrDenied() 
                ? "bg-emerald-500/10 border-emerald-500/20" 
                : "bg-slate-900/30 border-white/5"
            )}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    NotificationService.isPendingOrDenied() ? "bg-emerald-500 text-white" : "bg-emerald-500/10 text-emerald-400"
                  )}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">Notificações Push</p>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-[200px]">
                      Habilite para receber lembretes de sessões e dicas terapêuticas diárias.
                    </p>
                  </div>
                </div>
                {NotificationService.isPendingOrDenied() ? (
                  <button 
                    onClick={requestNotificationPermission}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                  >
                    Ativar
                  </button>
                ) : (
                  <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    Ativo
                  </div>
                )}
              </div>
              
              {!NotificationService.isPendingOrDenied() && (
                <button 
                  onClick={testNotification}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold transition-all border border-white/5 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-emerald-400" />
                  Testar Notificação
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Subscription / Premium */}
        <div className="space-y-4 pt-4">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-2">Assinatura</label>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/assinatura")}
            className={cn(
              "p-6 rounded-[2rem] border cursor-pointer transition-all relative overflow-hidden group",
              profile?.isPremium 
                ? "bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-amber-500/30" 
                : "bg-slate-900/30 border-white/5 hover:border-emerald-500/30"
            )}
          >
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                  profile?.isPremium ? "bg-amber-500 text-white" : "bg-slate-800 text-slate-400"
                )}>
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white">
                    {profile?.isPremium ? "Licença Completa Ativa" : "Obter Licença Completa"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {profile?.isPremium ? "Você tem acesso a todas as ferramentas." : "Acesse todas as ferramentas da sede."}
                  </p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
          </motion.div>
        </div>

        {/* Actions */}
        <div className="pt-8 space-y-4">
          <button 
            onClick={logout}
            className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-bold hover:bg-red-500/20 transition-all flex items-center justify-center gap-3"
          >
            <LogOut className="w-4 h-4" />
            Sair da Conta
          </button>

          <button 
            onClick={() => setShowFeedbackModal(true)}
            className="w-full py-4 bg-slate-900 border border-white/5 text-slate-300 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            Enviar Feedback
          </button>

          <p className="text-center text-[10px] text-slate-600 uppercase tracking-widest font-bold">
            Versão 1.0.0 (Beta)
          </p>
        </div>
      </main>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 w-full max-w-md space-y-6 relative"
          >
            <button 
              onClick={() => setShowFeedbackModal(false)}
              className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-serif italic text-white">Sua opinião importa</h3>
              <p className="text-sm text-slate-400">Como está sendo sua experiência com o SENTI?</p>
            </div>

            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFeedbackRating(star)}
                  className="p-2 transition-transform active:scale-90"
                >
                  <Star 
                    className={cn(
                      "w-8 h-8 transition-colors",
                      feedbackRating >= star ? "text-amber-400 fill-amber-400" : "text-slate-700"
                    )}
                  />
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Sugestões de melhoria</label>
              <textarea 
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none"
                placeholder="O que podemos fazer melhor?"
              />
            </div>

            <button 
              onClick={handleSubmitFeedback}
              disabled={submittingFeedback || feedbackRating === 0}
              className={cn(
                "w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2",
                feedbackRating > 0 
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20" 
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              )}
            >
              {submittingFeedback ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                "Enviar Avaliação"
              )}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
