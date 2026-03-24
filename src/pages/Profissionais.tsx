import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Search, MapPin, Star, Video, MessageCircle, User, List, Map as MapIcon, Zap } from "lucide-react";
import { userService } from "../services/userService";
import { UserProfile } from "../types";
import { cn } from "../lib/utils";
import Especialidades from "../components/Especialidades";

export default function Profissionais() {
  const navigate = useNavigate();
  const location = useLocation();
  const [busca, setBusca] = useState("");
  const [view, setView] = useState<"list" | "map">("list");
  const [ordenacao, setOrdenacao] = useState<"recomendado" | "preco_menor" | "preco_maior" | "avaliacao">("recomendado");
  const [listaProfissionais, setListaProfissionais] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

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

  const profissionaisFiltrados = listaProfissionais.filter(prof => {
    const nomeMatch = prof.nome?.toLowerCase().includes(busca.toLowerCase());
    const especialidadeMatch = prof.especialidades?.some(e => e.toLowerCase().includes(busca.toLowerCase()));
    const cidadeMatch = prof.cidade?.toLowerCase().includes(busca.toLowerCase());
    return nomeMatch || especialidadeMatch || cidadeMatch;
  });

  const profissionaisOrdenados = [...profissionaisFiltrados].sort((a, b) => {
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
              <h1 className="text-2xl font-medium text-slate-200">Encontrar Profissional</h1>
              <p className="text-sm text-slate-400">Psicólogos e clínicas parceiras</p>
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

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text"
            placeholder="Buscar por nome, especialidade ou cidade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
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
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="space-y-2 flex-1 w-full">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Como você está se sentindo?</p>
                  <Especialidades selecionada={busca} onSelecionar={setBusca} />
                </div>
                <div className="space-y-2 w-full sm:w-auto">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Ordenar por</p>
                  <select 
                    value={ordenacao}
                    onChange={(e) => setOrdenacao(e.target.value as any)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
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
                  <motion.div 
                    key={prof.uid}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 hover:border-emerald-500/30 transition-all group"
                  >
                    <div className="relative">
                      <img 
                        src={prof.fotoUrl || `https://picsum.photos/seed/${prof.uid}/200/200`} 
                        alt={prof.nome} 
                        className="w-20 h-20 rounded-xl object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className={cn(
                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900",
                        prof.online ? "bg-emerald-500" : "bg-slate-600"
                      )} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-slate-200 group-hover:text-emerald-400 transition-colors">{prof.nome}</h3>
                          <p className="text-emerald-400/80 text-sm font-medium">{prof.especialidades?.join(", ") || "Psicólogo"}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1.5 bg-slate-800/50 px-2 py-1 rounded-lg">
                            {renderEstrelas(prof.rating)}
                            <span className="text-xs font-bold text-slate-300 ml-1">{prof.rating?.toFixed(1) || "5.0"}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                        <span className={cn(
                          "flex items-center gap-1.5 font-medium",
                          prof.online ? "text-emerald-400" : "text-slate-500"
                        )}>
                          <Video className="w-3.5 h-3.5" /> {prof.online ? "Online agora" : "Offline"}
                        </span>
                        {prof.cidade && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" /> {prof.cidade}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-between items-end gap-3 sm:border-l border-white/5 sm:pl-4 min-w-[140px]">
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Sessão</span>
                        <span className="text-slate-200 font-bold text-lg">R$ {prof.preco || "150"}</span>
                      </div>
                      <div className="flex flex-col gap-2 w-full">
                        <button 
                          onClick={() => navigate(`/terapeuta-perfil/${prof.uid}`)}
                          className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                        >
                          <User className="w-4 h-4" />
                          Ver Perfil
                        </button>
                        <button 
                          onClick={() => navigate(`/agendamento/${prof.uid}`)}
                          className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-bold transition-all border border-white/5"
                        >
                          Agendar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-12 text-slate-400">
                    Nenhum profissional encontrado para "{busca}".
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