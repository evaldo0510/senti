import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  Star, 
  Video, 
  MapPin, 
  MessageCircle, 
  Calendar, 
  Shield, 
  Award,
  Clock,
  CheckCircle2,
  Share2,
  PlayCircle,
  Sparkles,
  X,
  Send,
  Loader2,
  Instagram,
  Globe,
  Mail,
  Phone,
  HeartPulse
} from "lucide-react";
import { userService } from "../services/userService";
import { auth } from "../services/firebase";
import { UserProfile, Avaliacao } from "../types";
import { cn } from "../lib/utils";
import CalendarAvailability from "../components/CalendarAvailability";
import IARASchedulingAssistant from "../components/IARASchedulingAssistant";
import { AnimatePresence } from "motion/react";
import { getEmbedUrl } from "../lib/videoUtils";

export default function TerapeutaPerfil() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [terapeuta, setTerapeuta] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showContact, setShowContact] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('sobre');

  const tabs = [
    { id: 'sobre', label: 'Sobre', icon: Shield },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'especialidades', label: 'Especialidades', icon: Sparkles },
    { id: 'avaliacoes', label: 'Avaliações', icon: Star },
  ];

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-150px 0px -70% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    tabs.forEach(tab => {
      const element = document.getElementById(tab.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Offset for sticky header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleSelect = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    // Small delay to allow user to see the selection highlight
    setTimeout(() => {
      navigate(`/agendamento/${id}?date=${date.toISOString()}&time=${time}`);
    }, 300);
  };

  const handleMensagemRapida = async () => {
    if (!terapeuta || !auth.currentUser) return;
    
    try {
      const patientProfile = await userService.getUser(auth.currentUser.uid);
      if (!patientProfile) return;

      const appointment = await userService.createAppointment({
        patientId: auth.currentUser.uid,
        patientNome: patientProfile.nome,
        therapistId: terapeuta.uid,
        therapistNome: terapeuta.nome,
        date: new Date().toISOString(),
        status: 'confirmed',
        type: 'chat',
        price: 0,
      });

      if (appointment?.id) {
        navigate(`/atendimento/${appointment.id}`);
      }
    } catch (error) {
      console.error("Erro ao iniciar chat", error);
    }
  };

  const handleShare = async () => {
    if (!terapeuta) return;
    const url = window.location.href;
    const title = `Perfil de ${terapeuta.nome} no SENTI`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Confira o perfil do terapeuta ${terapeuta.nome} no SENTI.`,
          url,
        });
      } catch (error) {
        console.error("Erro ao compartilhar", error);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copiado para a área de transferência!");
    }
  };

  const sortedReviews = terapeuta?.avaliacoes?.slice().sort((a, b) => {
    const dateA = new Date(a.data).getTime();
    const dateB = new Date(b.data).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  }) || [];

  useEffect(() => {
    const loadTerapeuta = async () => {
      if (!id) return;
      try {
        const data = await userService.getUser(id);
        setTerapeuta(data);
      } catch (error) {
        console.error("Erro ao carregar terapeuta:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTerapeuta();
  }, [id]);

  const falarWhatsApp = () => {
    if (!terapeuta) return;
    const numero = "5511999999999"; // Exemplo
    const mensagem = encodeURIComponent(`Olá, gostaria de falar com o terapeuta ${terapeuta.nome}`);
    window.open(`https://wa.me/${numero}?text=${mensagem}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!terapeuta) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-medium text-slate-200 mb-4">Terapeuta não encontrado</h2>
        <button onClick={() => navigate("/profissionais")} className="text-emerald-400 hover:underline">
          Voltar para a lista
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <div className="relative h-48 md:h-64 bg-gradient-to-b from-brand-indigo/20 to-slate-950 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 pt-8 flex justify-between items-center">
          <button 
            onClick={() => navigate("/profissionais")} 
            className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 hover:bg-slate-800 rounded-full transition-colors backdrop-blur-md text-slate-200 text-sm font-medium border border-white/5"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div className="flex gap-2">
            <button 
              onClick={handleShare}
              className="p-2.5 bg-slate-900/50 hover:bg-slate-800 rounded-full transition-colors backdrop-blur-md border border-white/5"
              title="Compartilhar perfil"
            >
              <Share2 className="w-5 h-5 text-slate-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Navigation Tabs */}
      <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 hidden md:block">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-8 h-16">
            <div className="flex items-center gap-2 mr-8">
              <HeartPulse className="w-6 h-6 text-brand-indigo" />
              <span className="font-bold text-brand-text tracking-tight">Sentí</span>
            </div>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={cn(
                  "h-full px-2 flex items-center gap-2 text-sm font-medium transition-all relative",
                  activeTab === tab.id ? "text-brand-indigo" : "text-slate-400 hover:text-slate-200"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-indigo"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-24 md:-mt-32 pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Profile Info */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-indigo to-brand-purple" />
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-brand-indigo/20 blur-2xl rounded-full" />
                <img 
                  src={terapeuta.fotoUrl || `https://picsum.photos/seed/${terapeuta.uid}/400/400`} 
                  alt={terapeuta.nome} 
                  className="w-36 h-36 rounded-[2rem] object-cover border-4 border-slate-800 shadow-2xl relative z-10"
                  referrerPolicy="no-referrer"
                />
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-4 border-slate-900 z-20",
                  terapeuta.online ? "bg-emerald-500" : "bg-slate-600"
                )} />
              </div>
              
              <div className="space-y-1 mb-6">
                <h1 className="text-2xl font-bold text-slate-100 flex items-center justify-center gap-2">
                  {terapeuta.nome}
                  {terapeuta.online && (
                    <HeartPulse className="w-5 h-5 text-emerald-500 animate-pulse" />
                  )}
                </h1>
                <p className="text-brand-indigo font-semibold tracking-wide uppercase text-[10px]">{terapeuta.especialidades?.join(" • ") || "Psicólogo"}</p>
              </div>
              
              <div className="flex items-center justify-center gap-1.5 mb-8 bg-slate-800/30 py-2 px-4 rounded-2xl w-fit mx-auto border border-white/5">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold text-slate-200">{terapeuta.rating?.toFixed(1) || "5.0"}</span>
                <span className="text-slate-500 text-xs ml-1">({terapeuta.reviewCount || 0} avaliações)</span>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => scrollToSection('agenda')}
                  className="w-full py-4 bg-brand-indigo hover:bg-brand-indigo/90 text-white rounded-2xl font-bold transition-all shadow-lg shadow-brand-indigo/20 flex items-center justify-center gap-2 group"
                >
                  <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Agendar Sessão
                </button>
                {terapeuta.online && (
                  <button 
                    onClick={() => navigate(`/agendamento/${terapeuta.uid}?instant=true`)}
                    className="w-full py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-2xl font-bold transition-all border border-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <Video className="w-5 h-5" />
                    Atender Agora
                  </button>
                )}
                
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button 
                    onClick={handleMensagemRapida}
                    className="py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-2xl text-xs font-semibold transition-all border border-white/5 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 text-brand-indigo" />
                    Chat
                  </button>
                  <button 
                    onClick={falarWhatsApp}
                    className="py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-2xl text-xs font-semibold transition-all border border-white/5 flex items-center justify-center gap-2"
                  >
                    <Instagram className="w-4 h-4 text-pink-500/70" />
                    Social
                  </button>
                </div>
              </div>
            </motion.div>

            <div className="bg-slate-900/50 backdrop-blur-md border border-white/5 p-8 rounded-[2.5rem] space-y-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Informações da Sessão</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-indigo/10 rounded-xl">
                      <Sparkles className="w-4 h-4 text-brand-indigo" />
                    </div>
                    <span className="text-sm text-slate-400">Investimento</span>
                  </div>
                  <span className="text-slate-100 font-bold text-lg">R$ {terapeuta.preco || "120"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-xl">
                      <Clock className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-sm text-slate-400">Duração</span>
                  </div>
                  <span className="text-slate-100 font-medium">50 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-xl">
                      <Video className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-sm text-slate-400">Modalidade</span>
                  </div>
                  <span className="text-emerald-400 font-medium text-sm">Online</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                {!showContact ? (
                  <button 
                    onClick={() => setShowContact(true)}
                    className="w-full py-3 text-slate-400 hover:text-slate-200 text-xs font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Ver informações de contato
                  </button>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="p-4 bg-slate-800/30 rounded-2xl border border-white/5 flex items-center gap-3">
                      <Mail className="w-4 h-4 text-brand-indigo" />
                      <span className="text-xs text-slate-300 truncate">{terapeuta.email}</span>
                    </div>
                    {terapeuta.telefone && (
                      <div className="p-4 bg-slate-800/30 rounded-2xl border border-white/5 flex items-center gap-3">
                        <Phone className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs text-slate-300">{terapeuta.telefone}</span>
                      </div>
                    )}
                    <button 
                      onClick={() => setShowContact(false)}
                      className="w-full text-center text-[10px] text-slate-500 hover:text-slate-400 transition-colors pt-2"
                    >
                      Ocultar detalhes
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Bio & Details */}
          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-12">
              {/* Section: Sobre */}
              <section id="sobre" className="scroll-mt-24 space-y-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-brand-indigo/10 rounded-2xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-brand-indigo" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-100">Sobre o Profissional</h2>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Biografia e Abordagem</p>
                  </div>
                </div>
                
                <div className="bg-slate-900/30 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                    <HeartPulse className="w-32 h-32" />
                  </div>
                  <p className="text-slate-300 leading-relaxed text-lg font-serif italic relative z-10">
                    {terapeuta.biografia || "Profissional dedicado ao bem-estar emocional, com vasta experiência em ajudar pessoas a superarem desafios e encontrarem equilíbrio em suas vidas."}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 pt-8 border-t border-white/5">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-200 text-sm">Qualificação</h4>
                        <p className="text-xs text-slate-500">CRP Ativo e Verificado</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-200 text-sm">Experiência</h4>
                        <p className="text-xs text-slate-500">+5 anos de atendimento clínico</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section: Video Presentation */}
              {terapeuta.videoUrl && (
                <section className="space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                      <PlayCircle className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-100">Apresentação em Vídeo</h3>
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Conheça o terapeuta</p>
                    </div>
                  </div>
                  <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-900 shadow-2xl">
                    <iframe 
                      src={getEmbedUrl(terapeuta.videoUrl)} 
                      title={`Apresentação de ${terapeuta.nome}`}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </section>
              )}

              {/* Section: Agenda */}
              <section id="agenda" className="scroll-mt-24 space-y-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-brand-purple/10 rounded-2xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-brand-purple" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-100">Horários Disponíveis</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Agende sua próxima sessão</p>
                  </div>
                </div>
                <div className="bg-slate-900/30 border border-white/5 p-4 md:p-8 rounded-[2.5rem]">
                  <CalendarAvailability 
                    therapist={terapeuta} 
                    onSelect={handleSelect}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                  />
                </div>
              </section>

              {/* Section: Especialidades */}
              <section id="especialidades" className="scroll-mt-24 space-y-8">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-brand-indigo/10 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-brand-indigo" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-100">Especialidades e Foco</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Áreas de atuação</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Principais Áreas</h4>
                    <div className="flex flex-wrap gap-2">
                      {terapeuta.especialidades?.map((esp, i) => (
                        <span key={i} className="px-5 py-3 bg-slate-900 border border-white/10 rounded-2xl text-sm text-slate-200 font-medium hover:border-brand-indigo/30 transition-colors">
                          {esp}
                        </span>
                      )) || (
                        <span className="px-5 py-3 bg-slate-900 border border-white/10 rounded-2xl text-sm text-slate-200 font-medium">
                          Psicologia Clínica
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">O que esperar</h4>
                    <ul className="space-y-4">
                      {[
                        "Ambiente seguro e acolhedor",
                        "Escuta ativa e sem julgamentos",
                        "Foco no seu desenvolvimento pessoal",
                        "Ferramentas práticas para o dia a dia"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          </div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section: Avaliações */}
              <section id="avaliacoes" className="scroll-mt-24 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-100">Avaliações</h3>
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Depoimentos de pacientes</p>
                    </div>
                  </div>
                  
                  {sortedReviews.length > 0 && (
                    <select 
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                      className="bg-slate-900 border border-white/10 text-slate-300 text-xs font-bold rounded-xl px-4 py-2 focus:outline-none focus:border-brand-indigo transition-all"
                    >
                      <option value="desc">Mais recentes</option>
                      <option value="asc">Mais antigas</option>
                    </select>
                  )}
                </div>

                {sortedReviews.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {sortedReviews.map((review, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        key={i} 
                        className="bg-slate-900/50 border border-white/5 rounded-[2rem] p-6 space-y-4 hover:border-white/10 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-slate-400 font-bold border border-white/5">
                              {review.userName?.charAt(0).toUpperCase() || "P"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-100">{review.userName || "Paciente Anônimo"}</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date(review.data).toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1.5 rounded-xl border border-yellow-500/20">
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-yellow-500 text-xs">{review.nota.toFixed(1)}</span>
                          </div>
                        </div>
                        {review.comentario && (
                          <p className="text-slate-400 text-sm leading-relaxed italic">"{review.comentario}"</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-900/30 border border-white/5 rounded-[2.5rem] p-12 text-center">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-slate-500 font-medium">Ainda não há avaliações para este profissional.</p>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>

      <IARASchedulingAssistant therapist={terapeuta} />
    </div>
  );
}
