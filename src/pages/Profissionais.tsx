import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Search, MapPin, Star, Video, MessageCircle, User } from "lucide-react";
import { userService } from "../services/userService";
import { UserProfile } from "../types";
import { cn } from "../lib/utils";
import Especialidades from "../components/Especialidades";

export default function Profissionais() {
  const navigate = useNavigate();
  const location = useLocation();
  const [busca, setBusca] = useState("");
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
    // Prioridade: online
    if (a.online && !b.online) return -1;
    if (!a.online && b.online) return 1;

    // Depois avaliação
    return (b.rating || 0) - (a.rating || 0);
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-950 text-slate-100 p-6"
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-medium text-slate-200">Encontrar Profissional</h1>
            <p className="text-sm text-slate-400">Psicólogos e clínicas parceiras</p>
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

        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Como você está se sentindo?</p>
          <Especialidades selecionada={busca} onSelecionar={setBusca} />
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
                  <button 
                    onClick={() => falarWhatsApp(prof.nome)}
                    className="w-full px-4 py-2 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-xl text-xs font-bold transition-all border border-white/5 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
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
      </div>
    </motion.div>
  );
}