import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Search, MapPin, Star, Video, MessageCircle, User, List, Map as MapIcon, Zap, Calendar as CalendarIcon, ChevronDown, ChevronUp } from "lucide-react";
import { userService } from "../services/userService";
import { UserProfile } from "../types";
import { cn } from "../lib/utils";
import Especialidades from "../components/Especialidades";
import CalendarAvailability from "../components/CalendarAvailability";
import StarRating from "../components/StarRating";

export default function Profissionais() {
  const navigate = useNavigate();
  const location = useLocation();
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
              <ArrowLeft className="w-5 h-5" />
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
              <List className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setView("map")}
              className={cn(
                "p-2 rounded-lg transition-all",
                view === "map" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <MapIcon className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text"
                placeholder="Como você está se sentindo hoje?"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div className="relative sm:w-1/3">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
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
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
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
                            <p className="text-emerald-400/80 text-sm font-medium">{prof.especialidades?.join(", ") || "Psicólogo"}</p>
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
                          <span className="text-slate-100 font-bold text-2xl">R$ {prof.preco || "150"}</span>
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                          <button 
                            onClick={() => navigate(`/agendamento/${prof.uid}`)}
                            className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                          >
                            <Zap className="w-4 h-4 fill-slate-950" />
                            Conectar
                          </button>
                          <button 
                            onClick={() => navigate(`/terapeuta-perfil/${prof.uid}`)}
                            className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-white/5 flex items-center justify-center gap-2"
                          >
                            Ver Perfil
                          </button>
                          <button 
                            onClick={() => falarWhatsApp(prof.nome || "Terapeuta")}
                            className="w-full px-4 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 rounded-xl text-xs font-bold transition-all border border-emerald-500/20 flex items-center justify-center gap-2"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Falar Direto
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
              <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 aspect-square sm:aspect-video relative overflow-hidden">
                {/* Simulated Map Background */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute inset-0" style={{ 
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                  }} />
                  <svg className="w-full h-full text-emerald-500/20" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0,50 Q25,25 50,50 T100,50" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <path d="M0,30 Q25,55 50,30 T100,30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <path d="M30,0 Q55,25 30,50 T30,100" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <path d="M70,0 Q45,25 70,50 T70,100" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </svg>
                </div>

                {/* Map Markers */}
                {profissionaisFiltrados.map((prof, idx) => {
                  // Random-ish positions for simulation if lat/lng not perfect
                  const top = prof.latitude ? `${((prof.latitude + 23.6) * 1000) % 80 + 10}%` : `${(idx * 25 + 20) % 80}%`;
                  const left = prof.longitude ? `${((prof.longitude + 46.7) * 1000) % 80 + 10}%` : `${(idx * 35 + 15) % 80}%`;
                  
                  return (
                    <motion.div
                      key={prof.uid}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      style={{ top, left }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                      onClick={() => navigate(`/terapeuta-perfil/${prof.uid}`)}
                    >
                      <div className="relative">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl border-2 p-0.5 transition-all group-hover:scale-110 shadow-xl",
                          prof.online ? "border-emerald-500 bg-emerald-500/20" : "border-slate-600 bg-slate-800"
                        )}>
                          <img 
                            src={prof.fotoUrl || `https://picsum.photos/seed/${prof.uid}/100/100`} 
                            alt={prof.nome}
                            className="w-full h-full rounded-xl object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        {prof.online && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
                        )}
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                          <div className="bg-slate-800 border border-white/10 rounded-xl p-2 shadow-2xl whitespace-nowrap">
                            <p className="text-xs font-bold text-white">{prof.nome}</p>
                            <p className="text-[10px] text-emerald-400 font-medium">{prof.especialidades?.[0]}</p>
                          </div>
                          <div className="w-2 h-2 bg-slate-800 border-r border-b border-white/10 rotate-45 mx-auto -mt-1" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Map Controls */}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <button 
                    onClick={() => {
                      const firstOnline = profissionaisFiltrados.find(p => p.online);
                      if (firstOnline) {
                        navigate(`/agendamento/${firstOnline.uid}?instant=true`);
                      } else {
                        alert("Nenhum terapeuta online no momento. Tente novamente em instantes.");
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/30 rounded-2xl p-4 shadow-2xl transition-all group active:scale-95"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">SENTI Go</p>
                        <p className="text-sm font-bold text-white">Conectar Agora</p>
                      </div>
                    </div>
                  </button>
                  
                  <div className="flex flex-col gap-2">
                    <button className="w-10 h-10 bg-slate-800/90 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-slate-700 transition-colors">
                      +
                    </button>
                    <button className="w-10 h-10 bg-slate-800/90 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-slate-700 transition-colors">
                      -
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4">
                <MapPin className="w-6 h-6 text-emerald-400" />
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