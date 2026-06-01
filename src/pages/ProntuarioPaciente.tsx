import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  MessageCircle,
  Plus,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Save,
  Check,
  Shield,
  Download
} from "lucide-react";
import CryptoJS from "crypto-js";
import { jsPDF } from "jspdf";
import { userService } from "../services/userService";
import { auth } from "../services/firebase";
import { UserProfile, Appointment, MoodEntry, PrivateNote } from "../types";
import { cn } from "../lib/utils";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function ProntuarioPaciente() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Private Clinical Notes State
  const [activeTab, setActiveTab] = useState<'evolution' | 'private_notes'>('evolution');
  const [privateNotes, setPrivateNotes] = useState<PrivateNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [useCustomKey, setUseCustomKey] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const getCipherKey = () => {
    if (useCustomKey) {
      return customKey || "default_fallback_key_123_abc";
    }
    return auth.currentUser?.uid || "default_therapist_fallback_uid_key";
  };

  const decryptNote = (encryptedText: string) => {
    if (!encryptedText) return "";
    const key = getCipherKey();
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedText, key);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted && encryptedText) {
        return "[🔒 Nota Protegida. Insira a chave/passphrase correta para visualizar]";
      }
      return decrypted || "[Sem conteúdo]";
    } catch (error) {
      return "[🔒 Nota Protegida. Chave de criptografia inválida ou ausente]";
    }
  };

  const loadNotes = async () => {
    if (!id || !auth.currentUser) return;
    setLoadingNotes(true);
    try {
      const notes = await userService.getPrivateNotes(id, auth.currentUser.uid);
      setPrivateNotes(notes);
    } catch (e) {
      console.error("Error loading secure notes:", e);
    } finally {
      setLoadingNotes(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        const profile = await userService.getUser(id);
        setPaciente(profile);

        // Get appointments for this patient with the current therapist
        userService.getMyAppointments((apps) => {
          const patientApps = apps.filter(a => a.patientId === id);
          setAppointments(patientApps);
        }, 'terapeuta');

        const history = await userService.getPatientMoodHistory(id);
        setMoodHistory(history);

        // Load private notes if therapist is logged in
        if (auth.currentUser) {
          await loadNotes();
        }

      } catch (error) {
        console.error("Error loading patient record:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Listen to authentication state to retry loading secure notes if needed
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && id) {
        loadNotes();
      }
    });

    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-white">Paciente não encontrado</h2>
        <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-xl">Voltar</button>
      </div>
    );
  }

  const handleSavePrivateNote = async () => {
    if (!noteText.trim()) return;
    if (!id || !auth.currentUser) return;
    setSavingNote(true);
    try {
      const ciphertext = CryptoJS.AES.encrypt(noteText, getCipherKey()).toString();
      await userService.savePrivateNote(id, auth.currentUser.uid, ciphertext, editingNoteId || undefined);
      setNoteText("");
      setEditingNoteId(null);
      await loadNotes();
    } catch (e) {
      console.error("Error saving note:", e);
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeletePrivateNote = async (noteId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta nota clínica? Esta operação é irreversível.")) return;
    try {
      await userService.deletePrivateNote(noteId);
      await loadNotes();
    } catch (e) {
      console.error("Error deleting note:", e);
    }
  };

  const handleEditNote = (note: PrivateNote) => {
    setEditingNoteId(note.id);
    const decrypted = decryptNote(note.encryptedContent);
    if (decrypted.startsWith("[🔒")) {
      setNoteText("");
    } else {
      setNoteText(decrypted);
    }
    const element = document.getElementById("private-notes-editor");
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const exportToPDF = () => {
    if (!paciente) return;
    const doc = new jsPDF();
    
    // Header Banner
    doc.setFillColor(15, 23, 42); // slate-900 background
    doc.rect(0, 0, 210, 40, "F");
    
    // Brand Logo in PDF
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Sentí", 15, 20);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text("PRONTUÁRIO E EVOLUÇÃO CLÍNICA", 15, 30);
    
    // Patient Metadata Section
    doc.setTextColor(51, 65, 85); // slate-700
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DADOS DO PACIENTE", 15, 52);
    
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(15, 55, 195, 55);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(`Nome: ${paciente.nome || ""}`, 15, 63);
    doc.text(`Email: ${paciente.email || "Não informado"}`, 15, 69);
    doc.text(`Início do Tratamento: ${paciente.createdAt ? new Date(paciente.createdAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')}`, 15, 75);
    doc.text(`Sessões Realizadas: ${appointments.filter(a => a.status === 'completed').length}`, 15, 81);
    
    // Session History Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    doc.text("HISTÓRICO DE EVOLUÇÕES CLÍNICAS", 15, 95);
    doc.line(15, 98, 195, 98);
    
    let y = 106;
    const completedApps = appointments.filter(a => a.status === 'completed');
    
    if (completedApps.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text("Nenhuma evolução clínica registrada até o momento.", 15, y);
    } else {
      completedApps.forEach((app, i) => {
        // Page break if y exceeds capacity
        if (y > 240) {
          doc.addPage();
          y = 20;
        }
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42); // slate-900
        const dateStr = new Date(app.date).toLocaleDateString('pt-BR') + ' às ' + new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        doc.text(`Sessão #${completedApps.length - i} - ${dateStr}`, 15, y);
        
        // Risk level label
        const rLevel = app.riskLevel ? app.riskLevel.toUpperCase() : "BAIXO";
        doc.setFontSize(8);
        doc.setTextColor(16, 185, 129); // emerald-500 default
        if (app.riskLevel === 'alto') {
          doc.setTextColor(239, 68, 68); // red
        } else if (app.riskLevel === 'moderado') {
          doc.setTextColor(245, 158, 11); // amber
        }
        doc.text(`RISCO: ${rLevel}`, 155, y);
        
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        
        // Word wrap for notes
        const notesStr = app.notes || "Nenhuma nota registrada.";
        const splitNotes = doc.splitTextToSize(notesStr, 180);
        
        splitNotes.forEach((line: string) => {
          if (y > 275) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, 15, y);
          y += 5;
        });
        
        // Structured extra info if available (Compliance, Mood Stability, Crisis Risk)
        if (app.compliance !== undefined || app.moodStability !== undefined || app.crisisRisk !== undefined || app.structuredSummary) {
          y += 2;
          if (y > 270) { doc.addPage(); y = 20; }
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(15, 23, 42);
          doc.text("Adesão:", 15, y);
          doc.setFont("helvetica", "normal");
          doc.text(app.compliance ? "Sim" : "Não", 35, y);
          
          doc.setFont("helvetica", "bold");
          doc.text("Estabilidade:", 55, y);
          doc.setFont("helvetica", "normal");
          doc.text(app.moodStability ? "Sim" : "Não", 80, y);
          
          doc.setFont("helvetica", "bold");
          doc.text("Risco de Crise:", 100, y);
          doc.setFont("helvetica", "normal");
          doc.text(app.crisisRisk ? "Sim" : "Não", 128, y);
          y += 5;
          
          if (app.structuredSummary) {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.setFont("helvetica", "bold");
            doc.text("Sumário Clínico e Observações Adicionais:", 15, y);
            y += 4;
            doc.setFont("helvetica", "normal");
            const splitSummary = doc.splitTextToSize(app.structuredSummary, 180);
            splitSummary.forEach((line: string) => {
              if (y > 275) {
                doc.addPage();
                y = 20;
              }
              doc.text(line, 15, y);
              y += 5;
            });
          }
        }
        
        y += 3; // spacing between sessions
        // Draw separation line
        doc.setDrawColor(241, 245, 249); // slate-100
        doc.line(15, y, 195, y);
        y += 8;
      });
    }
    
    // Add professional disclaimer in footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("Documento confidencial gerado eletronicamente em conformidade com as normas profissionais vigentes de sigilo clínico.", 15, 292);
      doc.text(`Página ${i} de ${totalPages}`, 180, 292);
    }
    
    doc.save(`prontuario_${paciente.nome?.replace(/\s+/g, '_').toLowerCase()}.pdf`);
  };

  const chartData = moodHistory.map(m => ({
    date: new Date(m.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    value: m.value,
    intensity: m.intensity
  })).reverse();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Prontuário do Paciente</h1>
              <p className="text-slate-500">Acompanhamento clínico e evolução terapêutica</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={exportToPDF}
              className="px-5 py-3 bg-slate-900 border border-white/5 hover:bg-slate-800 text-slate-300 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-md shadow-black/30 cursor-pointer text-sm"
              title="Gerar PDF do histórico de evoluções deste paciente"
            >
              <Download className="w-5 h-5 text-emerald-400" />
              Exportar PDF
            </button>
            <button 
              onClick={() => navigate(`/registro/new?patientId=${id}`)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20 cursor-pointer text-sm"
            >
              <Plus className="w-5 h-5" />
              Nova Evolução
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Info Card */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center text-4xl font-bold text-emerald-400 border border-white/5">
                  {paciente.nome?.charAt(0) || "P"}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{paciente.nome}</h2>
                  <p className="text-sm text-slate-500">{paciente.email}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-emerald-400 font-bold uppercase tracking-widest text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full">Em Tratamento</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Sessões Realizadas:</span>
                  <span className="font-bold">{appointments.filter(a => a.status === 'completed').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Início do Tratamento:</span>
                  <span className="font-bold">{new Date(paciente.createdAt || Date.now()).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Enviar Mensagem
                </button>
              </div>
            </div>

            {/* Risk Indicator */}
            <div className={cn(
              "p-6 rounded-3xl border flex items-start gap-4",
              appointments[0]?.riskLevel === 'alto' ? "bg-red-900/20 border-red-500/30 text-red-200" :
              appointments[0]?.riskLevel === 'moderado' ? "bg-amber-900/20 border-amber-500/30 text-amber-200" :
              "bg-emerald-900/20 border-emerald-500/30 text-emerald-200"
            )}>
              <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold uppercase tracking-widest text-[10px] mb-1">Nível de Risco Atual</h4>
                <p className="text-lg font-bold">
                  {appointments[0]?.riskLevel === 'alto' ? "Alto Risco" :
                   appointments[0]?.riskLevel === 'moderado' ? "Risco Moderado" :
                   "Baixo Risco / Estável"}
                </p>
                <p className="text-xs opacity-70 mt-1">Baseado na última sessão realizada em {new Date(appointments[0]?.date || Date.now()).toLocaleDateString('pt-BR')}.</p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Custom Tabs */}
            <div className="flex border border-white/5 bg-slate-900/60 p-1.5 rounded-2xl gap-2">
              <button
                onClick={() => setActiveTab('evolution')}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer",
                  activeTab === 'evolution' 
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Activity className="w-4 h-4" />
                Evolução e Prontuário
              </button>
              <button
                onClick={() => setActiveTab('private_notes')}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer",
                  activeTab === 'private_notes' 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-950/40" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Lock className="w-4 h-4" />
                Notas Secundárias (Privadas)
              </button>
            </div>

            {activeTab === 'evolution' ? (
              <div className="space-y-8">
                {/* Mood Chart */}
                <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-400" />
                      Evolução do Humor
                    </h3>
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Humor</div>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Intensidade</div>
                    </div>
                  </div>
                  
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="#475569" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                        />
                        <YAxis 
                          stroke="#475569" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                          domain={[0, 10]}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                          itemStyle={{ fontSize: '12px' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#10b981" 
                          strokeWidth={3} 
                          dot={{ r: 4, fill: '#10b981' }} 
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="intensity" 
                          stroke="#3b82f6" 
                          strokeWidth={2} 
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Session History */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 px-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    Histórico de Evoluções
                  </h3>
                  
                  <div className="space-y-4">
                    {appointments.filter(a => a.status === 'completed').map((app) => (
                      <motion.div 
                        key={app.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-4"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-800 rounded-xl">
                              <Calendar className="w-4 h-4 text-slate-400" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-200">Sessão de Acompanhamento</p>
                              <p className="text-xs text-slate-500">{new Date(app.date).toLocaleDateString('pt-BR')} às {new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                          <span className={cn(
                            "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest",
                            app.riskLevel === 'alto' ? "bg-red-500/10 text-red-400" :
                            app.riskLevel === 'moderado' ? "bg-amber-500/10 text-amber-400" :
                            "bg-emerald-500/10 text-emerald-400"
                          )}>
                            Risco: {app.riskLevel || "N/A"}
                          </span>
                        </div>
                        
                        <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 space-y-4">
                          <p className="text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                            {app.notes || "Nenhuma nota registrada para esta sessão."}
                          </p>
                          
                          {(app.compliance !== undefined || app.moodStability !== undefined || app.crisisRisk !== undefined || app.structuredSummary) && (
                            <div className="pt-3 border-t border-white/5 space-y-3">
                              {/* Clinical metrics */}
                              <div className="flex flex-wrap gap-2 text-[10px]">
                                {app.compliance !== undefined && (
                                  <span className={cn(
                                    "px-2.5 py-1 rounded-full font-bold",
                                    app.compliance ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red- 400"
                                  )}>
                                    Compliance: {app.compliance ? "Sim" : "Não"}
                                  </span>
                                )}
                                {app.moodStability !== undefined && (
                                  <span className={cn(
                                    "px-2.5 py-1 rounded-full font-bold",
                                    app.moodStability ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-500"
                                  )}>
                                    Estabilidade de Humor: {app.moodStability ? "Sim" : "Não"}
                                  </span>
                                )}
                                {app.crisisRisk !== undefined && (
                                  <span className={cn(
                                    "px-2.5 py-1 rounded-full font-bold",
                                    app.crisisRisk ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
                                  )}>
                                    Risco de Crise: {app.crisisRisk ? "Sim" : "Não"}
                                  </span>
                                )}
                              </div>
                              
                              {app.structuredSummary && (
                                <div className="space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sumário Estruturado</p>
                                  <p className="text-xs text-slate-350 font-sans whitespace-pre-line leading-relaxed">{app.structuredSummary}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end">
                          <button 
                            onClick={() => navigate(`/registro/${app.id}`)}
                            className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest hover:underline cursor-pointer"
                          >
                            Editar Evolução
                          </button>
                        </div>
                      </motion.div>
                    ))}

                    {appointments.filter(a => a.status === 'completed').length === 0 && (
                      <div className="bg-slate-900/50 border border-dashed border-white/10 p-12 rounded-3xl text-center">
                        <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-500">Nenhuma evolução registrada ainda.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Security Header Banner */}
                <div className="bg-gradient-to-r from-blue-950/30 to-slate-900 border border-blue-500/15 p-6 rounded-3xl space-y-3 flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/15 flex-shrink-0">
                    <Lock className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-blue-300 flex items-center gap-2">
                      Sessão com Criptografia de Ponta a Ponta (E2EE) Ativa
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                      Para conformidade ética e sigilo odontológico/psicológico, estas anotações são salvas de forma cifrada com <strong>AES-256</strong>. Nem mesmo os administradores podem visualizar sem a chave correspondente.
                    </p>
                  </div>
                </div>

                {/* Encryption Configuration Panel */}
                <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-3">
                    <div>
                      <h4 className="font-bold text-sm">Chave de Criptografia Clínica</h4>
                      <p className="text-xs text-slate-500">Selecione o método de geração da chave de sigilo profissional</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs bg-slate-950 p-1.5 rounded-xl border border-white/5 w-fit">
                      <button
                        onClick={() => setUseCustomKey(false)}
                        className={cn("px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer", !useCustomKey ? "bg-slate-800 text-blue-400" : "text-slate-500 hover:text-slate-300")}
                      >
                        Automático (Seguro)
                      </button>
                      <button
                        onClick={() => setUseCustomKey(true)}
                        className={cn("px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer", useCustomKey ? "bg-slate-800 text-blue-400" : "text-slate-500 hover:text-slate-300")}
                      >
                        Senha Personalizada
                      </button>
                    </div>
                  </div>

                  {!useCustomKey ? (
                    <div className="text-xs text-slate-400 bg-slate-950 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>
                        <strong>Assinatura do Dispositivo Ativa</strong>: Sua chave criptográfica de terapeuta autenticado está sendo aplicada em segundo plano silenciosamente.
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Código / Frase de Acesso Clínica</label>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type={showKey ? "text" : "password"}
                          value={customKey}
                          onChange={(e) => setCustomKey(e.target.value)}
                          placeholder="Digite seu código de clínica de segurança privada"
                          className="w-full bg-slate-950 px-11 py-3.5 rounded-2xl border border-white/5 text-slate-200 text-sm focus:outline-none focus:border-blue-500/50 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey(!showKey)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                        >
                          {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        ⚠️ <strong>Aviso:</strong> Guarde esta senha. Se você resetá-la ou esquecê-la, o sistema não poderá decifrar as anotações feitas sob esse código.
                      </p>
                    </div>
                  )}
                </div>

                {/* Editor Workspace */}
                <div id="private-notes-editor" className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Edit className="w-4 h-4 text-blue-400" />
                      {editingNoteId ? "Editar Nota Privada" : "Nova Nota Clínica Adicional (Privada)"}
                    </h3>
                    {editingNoteId && (
                      <button
                        onClick={() => {
                          setEditingNoteId(null);
                          setNoteText("");
                        }}
                        className="text-xs text-red-400 hover:underline cursor-pointer"
                      >
                        Cancelar Edição
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <textarea
                      rows={5}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Adicione observações particulares da terapia de acompanhamento, diagnósticos provisórios ou termos confidenciais com total segurança de criptografia..."
                      className="w-full bg-slate-950 p-4 rounded-2xl border border-white/5 text-slate-200 text-sm focus:outline-none focus:border-blue-500/50 resize-none placeholder:text-slate-600 line-clamp-none font-sans"
                    />

                    <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {noteText.length} caracteres | Protocolo AES-256 local
                      </span>

                      <button
                        onClick={handleSavePrivateNote}
                        disabled={savingNote || !noteText.trim()}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/40 disabled:text-slate-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer active:scale-95"
                      >
                        {savingNote ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {editingNoteId ? "Atualizar Nota" : "Salvar Nota Criptografada"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes History / Archive Feed */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 px-2">
                    <Lock className="w-5 h-5 text-blue-400" />
                    Histórico de Notas Criptografadas ({privateNotes.length})
                  </h3>

                  <div className="space-y-4">
                    {privateNotes.map((note) => {
                      const decrypted = decryptNote(note.encryptedContent);
                      const isLocked = decrypted.startsWith("[🔒");

                      return (
                        <motion.div
                          key={note.id}
                          initial={{ opacity: 0, x: -25 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-800 rounded-xl flex-shrink-0">
                                <Clock className="w-4 h-4 text-blue-400" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-200 text-sm">Nota Clínica Confidencial</p>
                                <p className="text-xs text-slate-500">
                                  Criado em {new Date(note.createdAt).toLocaleDateString('pt-BR')} às {new Date(note.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                  {note.updatedAt !== note.createdAt && ` (Atualizada: ${new Date(note.updatedAt).toLocaleDateString('pt-BR')})`}
                                </p>
                              </div>
                            </div>
                            <span className={cn(
                              "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 w-fit",
                              isLocked ? "bg-red-500/10 text-red-400 border border-red-500/10" : "bg-blue-500/10 text-blue-400 border border-blue-500/10"
                            )}>
                              {isLocked ? <Lock className="w-3 h-3 text-red-400" /> : <Unlock className="w-3 h-3 text-blue-400" />}
                              {isLocked ? "Cifrado" : "Decifrado"}
                            </span>
                          </div>

                          <div className={cn(
                            "p-4 rounded-2xl border text-sm leading-relaxed",
                            isLocked 
                              ? "bg-slate-950/70 border-red-500/10 text-slate-500 border-dashed" 
                              : "bg-slate-950 border-white/5 text-slate-300 whitespace-pre-wrap font-sans"
                          )}>
                            {decrypted}
                          </div>

                          {!isLocked && (
                            <div className="flex justify-end gap-3 pt-2">
                              <button
                                onClick={() => handleEditNote(note)}
                                className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Edit className="w-3 h-3" />
                                Editar Nota
                              </button>
                              <button
                                onClick={() => handleDeletePrivateNote(note.id)}
                                className="text-[10px] font-bold text-red-400 uppercase tracking-widest hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                Excluir
                              </button>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}

                    {privateNotes.length === 0 && !loadingNotes && (
                      <div className="bg-slate-900/50 border border-dashed border-white/10 p-12 rounded-3xl text-center">
                        <Lock className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-500">Nenhuma anotação privada registrada ainda.</p>
                      </div>
                    )}

                    {loadingNotes && (
                      <div className="bg-slate-900/50 border border-white/5 p-12 rounded-3xl text-center flex flex-col justify-center items-center gap-3">
                        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                        <p className="text-sm text-slate-500">Carregando notas seguras...</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
