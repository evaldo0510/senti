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
  PlayCircle
} from "lucide-react";
import { userService } from "../services/userService";
import { auth } from "../services/firebase";
import { UserProfile, Avaliacao } from "../types";
import { cn } from "../lib/utils";
import CalendarAvailability from "../components/CalendarAvailability";

export default function TerapeutaPerfil() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [terapeuta, setTerapeuta] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const handleSelect = (date: Date, time: string) => {
    navigate(`/agendamento/${id}?date=${date.toISOString()}&time=${time}`);
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
      <div className="relative h-64 bg-gradient-to-b from-emerald-900/20 to-slate-950 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 pt-8 flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 bg-slate-900/50 hover:bg-slate-800 rounded-full transition-colors backdrop-blur-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={handleShare}
            className="p-2 bg-slate-900/50 hover:bg-slate-800 rounded-full transition-colors backdrop-blur-md"
            title="Compartilhar perfil"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-32 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Profile Info */}
          <div className="md:col-span-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 border border-white/10 p-6 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
              <div className="relative inline-block mb-4">
                <img 
                  src={terapeuta.fotoUrl || `https://picsum.photos/seed/${terapeuta.uid}/400/400`} 
                  alt={terapeuta.nome} 
                  className="w-32 h-32 rounded-3xl object-cover border-4 border-slate-800 shadow-xl"
                  referrerPolicy="no-referrer"
                />
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-slate-900",
                  terapeuta.online ? "bg-emerald-500" : "bg-slate-600"
                )} />
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-slate-100">{terapeuta.nome}</h1>
                {terapeuta.online && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider">Online agora</span>
                  </div>
                )}
              </div>
              <p className="text-emerald-400 text-sm font-medium mb-4">{terapeuta.especialidades?.join(", ") || "Psicólogo"}</p>
              
              <div className="flex items-center justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={cn(
                      "w-4 h-4", 
                      i < Math.round(terapeuta.rating || 5) ? "text-yellow-500 fill-yellow-500" : "text-slate-700"
                    )} 
                  />
                ))}
                <span className="text-sm font-bold text-slate-300 ml-2">{terapeuta.rating?.toFixed(1) || "5.0"}</span>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => navigate(`/agendamento/${terapeuta.uid}`)}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Agendar Horário
                </button>
                <button 
                  onClick={() => navigate(`/agendamento/${terapeuta.uid}?instant=true`)}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-bold transition-all border border-white/5 flex items-center justify-center gap-2"
                >
                  <Video className="w-5 h-5 text-emerald-500" />
                  Atender Agora
                </button>
                <button 
                  onClick={falarWhatsApp}
                  className="w-full py-3 bg-slate-900/50 hover:bg-slate-800 text-slate-400 rounded-2xl text-xs font-medium transition-all border border-white/5 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-500/50" />
                  Falar no WhatsApp
                </button>
              </div>
            </motion.div>

            <div className="bg-slate-900/50 border border-white/5 p-6 rounded-[2rem] space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Valor da sessão</span>
                <span className="text-slate-100 font-bold text-lg">R$ {terapeuta.preco || "150"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Duração</span>
                <span className="text-slate-100 font-medium">50 minutos</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Modalidade</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <Video className="w-4 h-4" /> Online
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Bio & Details */}
          <div className="md:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-emerald-500" />
                  Sobre o Profissional
                </h2>
                <p className="text-slate-400 leading-relaxed text-lg italic font-serif">
                  {terapeuta.biografia || "Profissional dedicado ao bem-estar emocional, com vasta experiência em ajudar pessoas a superarem desafios e encontrarem equilíbrio em suas vidas."}
                </p>
                <div className="pt-2">
                  <button 
                    onClick={() => navigate(`/atendimento/${terapeuta.uid}?type=chat`)}
                    className="px-6 py-3 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-2xl font-bold transition-all flex items-center gap-2 group"
                  >
                    <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Chat Rápido
                  </button>
                </div>
              </section>

              {terapeuta.videoUrl && (
                <section className="space-y-4 pt-4">
                  <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-emerald-500" />
                    Apresentação
                  </h3>
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-slate-900">
                    <iframe 
                      src={terapeuta.videoUrl} 
                      title={`Apresentação de ${terapeuta.nome}`}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </section>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/30 border border-white/5 rounded-2xl flex items-start gap-4">
                  <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">Especialista</h4>
                    <p className="text-xs text-slate-500">CRP Ativo e Verificado</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-900/30 border border-white/5 rounded-2xl flex items-start gap-4">
                  <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">Experiência</h4>
                    <p className="text-xs text-slate-500">+5 anos de atendimento</p>
                  </div>
                </div>
              </div>

              <section className="space-y-4 pt-4">
                <h3 className="text-xl font-bold text-slate-100">Especialidades</h3>
                <div className="flex flex-wrap gap-2">
                  {terapeuta.especialidades?.map((esp, i) => (
                    <span key={i} className="px-4 py-2 bg-slate-900 border border-white/10 rounded-full text-sm text-slate-300">
                      {esp}
                    </span>
                  )) || (
                    <span className="px-4 py-2 bg-slate-900 border border-white/10 rounded-full text-sm text-slate-300">
                      Psicologia Clínica
                    </span>
                  )}
                </div>
              </section>

              <section className="space-y-4 pt-4">
                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-500" />
                  Disponibilidade
                </h3>
                <CalendarAvailability 
                  therapist={terapeuta} 
                  onSelect={handleSelect}
                />
              </section>

              <section className="space-y-4 pt-4">
                <h3 className="text-xl font-bold text-slate-100">O que esperar das sessões</h3>
                <ul className="space-y-3">
                  {[
                    "Ambiente seguro e acolhedor",
                    "Escuta ativa e sem julgamentos",
                    "Foco no seu desenvolvimento pessoal",
                    "Ferramentas práticas para o dia a dia"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-400">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {terapeuta.cidade && (
                <section className="space-y-4 pt-4">
                  <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-slate-500" />
                    Localização
                  </h3>
                  <p className="text-slate-400">{terapeuta.cidade}</p>
                </section>
              )}

              {/* Avaliações Section */}
              <section className="space-y-4 pt-8 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Avaliações dos Pacientes
                  </h3>
                  {sortedReviews.length > 0 && (
                    <select 
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                      className="bg-slate-900 border border-white/10 text-slate-300 text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="desc">Mais recentes</option>
                      <option value="asc">Mais antigas</option>
                    </select>
                  )}
                </div>

                {sortedReviews.length > 0 ? (
                  <div className="space-y-4">
                    {sortedReviews.map((review, i) => (
                      <div key={i} className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                              {review.userName?.charAt(0).toUpperCase() || "P"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-200 text-sm">{review.userName || "Paciente Anônimo"}</p>
                              <p className="text-xs text-slate-500">{new Date(review.data).toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-slate-300 text-sm">{review.nota.toFixed(1)}</span>
                          </div>
                        </div>
                        {review.comentario && (
                          <p className="text-slate-400 text-sm italic">"{review.comentario}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-8 text-center">
                    <p className="text-slate-500">Ainda não há avaliações para este profissional.</p>
                  </div>
                )}
              </section>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
