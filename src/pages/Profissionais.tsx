import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Search, MapPin, Star, Video, MessageCircle, User, List, Map as MapIcon, Zap, Calendar as CalendarIcon, ChevronDown, ChevronUp, Tag } from "lucide-react";
import { userService } from "../services/userService";
import { UserProfile } from "../types";
import { cn } from "../lib/utils";
import { useAuth } from "../components/AuthProvider";
import Especialidades from "../components/Especialidades";
import CalendarAvailability from "../components/CalendarAvailability";
import StarRating from "../components/StarRating";
import TherapistMap from "../components/TherapistMap";

export default function Profissionais() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile: userProfile } = useAuth();
  const [busca, setBusca] = useState("");
  const [cidadeFiltro, setCidadeFiltro] = useState("");
  const [view, setView] = useState<"list" | "map">("list");
  const [ordenacao, setOrdenacao] = useState<"recomendado" | "preco_menor" | "preco_maior" | "avaliacao">("recomendado");
  const [listaProfissionais, setListaProfissionais] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAvailability, setExpandedAvailability] = useState<string | null>(null);

  const falarWhatsApp = (nome: string) => {
    const numero = "5511999999999"; // Número de exemplo
    const mensagem = encodeURIComponent(`Olá, gostaria de falar com o terapeuta ${nome}`);
    window.open(`https://wa.me/${numero}?text=${mensagem}`, "_blank");
  };

  const renderEstrelas = (nota: number = 5) => {
    const estrelas = Math.round(nota);
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={cn(
              "w-3.5 h-3.5", 
              i < estrelas ? "text-yellow-500 fill-yellow-500" : "text-slate-700"
            )} 
          />
        ))}
      </div>
    );
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tipo = params.get("tipo");
    if (tipo) {
      setBusca(tipo);
    }

    const loadTherapists = async () => {
      try {
        const data = await userService.getTherapists();
        setListaProfissionais(data);
      } catch (error) {
        console.error("Erro ao carregar terapeutas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTherapists();
  }, [location]);

  const cidadesDisponiveis = Array.from(new Set(listaProfissionais.map(p => p.cidade).filter(Boolean))) as string[];

  const profissionaisFiltrados = listaProfissionais.filter(prof => {
    const nomeMatch = prof.nome?.toLowerCase().includes(busca.toLowerCase());
    const especialidadeMatch = prof.especialidades?.some(e => e.toLowerCase().includes(busca.toLowerCase()));
    const buscaCidadeMatch = prof.cidade?.toLowerCase().includes(busca.toLowerCase());
    const estiloMatch = prof.estilo?.toLowerCase().includes(busca.toLowerCase());
    const abordagemMatch = prof.abordagem?.toLowerCase().includes(busca.toLowerCase());
    
    const matchesBusca = !busca || nomeMatch || especialidadeMatch || buscaCidadeMatch || estiloMatch || abordagemMatch;
    const matchesCidade = !cidadeFiltro || prof.cidade === cidadeFiltro;

    return matchesBusca && matchesCidade;
  });

  const profissionaisOrdenados = [...profissionaisFiltrados].sort((a, b) => {
    // If a specialty is selected, prioritize those who have it as their main specialty
    if (busca) {
      const aMatch = a.especialidades?.some(e => e.toLowerCase() === busca.toLowerCase());
      const bMatch = b.especialidades?.some(e => e.toLowerCase() === busca.toLowerCase());
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
    }

    if (ordenacao === "preco_menor") {
      return (a.preco || 0) - (b.preco || 0);
    }
    if (ordenacao === "preco_maior") {
      return (b.preco || 0) - (a.preco || 0);
    }
    if (ordenacao === "avaliacao") {
      return (b.rating || 0) - (a.rating || 0);
    }
    
    // Default: recomendado (online first, then rating)
    if (a.online && !b.online) return -1;
    if (!a.online && b.online) return 1;
    return (b.rating || 0) - (a.rating || 0);
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-950 text-slate-100 p-6"
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-medium text-slate-200">Direcionamento Guiado</h1>
              <p className="text-sm text-slate-400">Encontre o apoio certo para você</p>
            </div>
          </div>
          
          <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setView("list")}
              className={cn(
                "p-2 rounded-lg transition-all",
                view === "list" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setView("map")}
              className={cn(
                "p-2 rounded-lg transition-all",
                view === "map" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Como você está se sentindo hoje?"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div className="relative sm:w-1/3">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select
                value={cidadeFiltro}
                onChange={(e) => setCidadeFiltro(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-12 pr-10 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
              >
                <option value="">Todas as cidades</option>
                {cidadesDisponiveis.map(cidade => (
                  <option key={cidade} value={cidade}>{cidade}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Filtro Rápido</p>
            <Especialidades selecionada={busca} onSelecionar={setBusca} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {view === "list" ? (
            <motion.div 
              key="list-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center px-1">
                <p className="text-sm text-slate-400">
                  {profissionaisOrdenados.length} profissionais encontrados
                  {busca && <span> para <span className="text-emerald-400 font-bold">"{busca}"</span></span>}
                </p>
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4 text-slate-500" />
                  <select 
                    value={ordenacao}
                    onChange={(e) => setOrdenacao(e.target.value as any)}
                    className="bg-transparent text-sm text-slate-300 focus:outline-none cursor-pointer hover:text-emerald-400 transition-colors"
                  >
                    <option value="recomendado">Recomendados</option>
                    <option value="avaliacao">Melhor Avaliação</option>
                    <option value="preco_menor">Menor Preço</option>
                    <option value="preco_maior">Maior Preço</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400">Carregando profissionais...</p>
                  </div>
                ) : profissionaisOrdenados.length > 0 ? profissionaisOrdenados.map(prof => (
                  <React.Fragment key={prof.uid}>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-900 border border-white/5 rounded-3xl p-5 flex flex-col sm:flex-row gap-5 hover:border-emerald-500/30 transition-all group relative overflow-hidden"
                    >
                      {/* Match Inteligente Badge */}
                      {busca && prof.especialidades?.some(e => e.toLowerCase() === busca.toLowerCase()) && (
                        <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-tighter">
                          Match Inteligente
                        </div>
                      )}

                      <div className="relative">
                        <img 
                          src={prof.fotoUrl || `https://picsum.photos/seed/${prof.uid}/200/200`} 
                          alt={prof.nome} 
                          className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-800"
                          referrerPolicy="no-referrer"
                        />
                        {prof.online && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-slate-900 animate-pulse" />
                        )}
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">{prof.nome}</h3>
                            <p className="text-emerald-400/80 text-sm font-medium mb-2">{prof.especialidades?.join(", ") || "Psicólogo"}</p>
                            <button 
                              onClick={() => navigate(`/agendamento/${prof.uid}`)}
                              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20 transition-all flex items-center gap-1.5"
                            >
                              <CalendarIcon className="w-3 h-3" />
                              Agendar
                            </button>
                          </div>
                          <StarRating rating={prof.rating || 4.8} count={prof.reviewCount || 124} size={16} />
                        </div>
                        
                        {/* DNA Tags */}
                        <div className="flex flex-wrap gap-2">
                          {prof.estilo && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/10">
                              {prof.estilo}
                            </span>
                          )}
                          {prof.abordagem && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/10">
                              {prof.abordagem}
                            </span>
                          )}
                          {prof.intensidade !== undefined && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded-lg border border-orange-500/10">
                              {prof.intensidade}% Intensidade
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-1">
                          <span className={cn(
                            "flex items-center gap-1.5 font-medium",
                            prof.online ? "text-emerald-400" : "text-slate-500"
                          )}>
                            <Video className="w-4 h-4" /> {prof.online ? "Online agora" : "Offline"}
                          </span>
                          {prof.cidade && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4" /> {prof.cidade}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col justify-between items-end gap-4 sm:border-l border-white/5 sm:pl-5 min-w-[160px]">
                        <div className="text-right">
                          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Sessão</span>
                          {userProfile?.isComunidade && prof.descontoComunidade ? (
                            <div className="flex flex-col items-end">
                              <span className="text-slate-500 line-through text-xs">R$ {prof.preco || "120"}</span>
                              <div className="flex items-center gap-1 text-emerald-400">
                                <Tag className="w-3 h-3" />
                                <span className="font-bold text-2xl">R$ {((prof.preco || 120) * (1 - prof.descontoComunidade / 100)).toFixed(0)}</span>
                              </div>
                              <span className="text-[8px] text-emerald-500 font-bold uppercase tracking-tighter">Desconto Comunidade</span>
                            </div>
                          ) : prof.desconto ? (
                            <div className="flex flex-col items-end">
                              <span className="text-slate-500 line-through text-xs">R$ {prof.preco || "120"}</span>
                              <div className="flex items-center gap-1 text-emerald-400">
                                <Tag className="w-3 h-3" />
                                <span className="font-bold text-2xl">R$ {((prof.preco || 120) * (1 - prof.desconto / 100)).toFixed(0)}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-100 font-bold text-2xl">R$ {prof.preco || "120"}</span>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                          <button 
                            onClick={() => navigate(`/agendamento/${prof.uid}`)}
                            className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                          >
                            <MessageCircle className="w-4 h-4 fill-slate-950" />
                            Conectar via Chat
                          </button>
                          <button 
                            onClick={() => navigate(`/terapeuta-perfil/${prof.uid}`)}
                            className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-white/5 flex items-center justify-center gap-2"
                          >
                            <User className="w-4 h-4" />
                            Ver Perfil Completo
                          </button>
                        </div>
                      </div>
                    </motion.div>
                    
                    <AnimatePresence>
                      {expandedAvailability === prof.uid && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mb-4"
                        >
                          <div className="p-4 bg-slate-900/50 border-x border-b border-white/5 rounded-b-2xl -mt-4 pt-8">
                            <CalendarAvailability 
                              therapist={prof} 
                              onSelect={(date, time) => navigate(`/agendamento/${prof.uid}?date=${date.toISOString()}&time=${time}`)}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                )) : (
                  <div className="text-center py-12 text-slate-400 bg-slate-900/50 rounded-3xl border border-white/5">
                    <p className="text-lg font-medium mb-2">Nenhum profissional encontrado</p>
                    <p className="text-sm">Tente buscar por outro sentimento ou especialidade.</p>
                    <button 
                      onClick={() => setBusca("")}
                      className="mt-4 text-emerald-400 font-bold hover:underline"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="map-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <TherapistMap therapists={profissionaisFiltrados} />
              
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-emerald-400">Sua localização atual</p>
                  <p className="text-xs text-slate-400">São Paulo, SP - Próximo à Av. Paulista</p>
                </div>
                <button className="text-xs font-bold text-emerald-400 hover:underline">Alterar</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}