import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Search, MapPin, Star, Video, MessageCircle, User, List, Map as MapIcon, Zap, Calendar as CalendarIcon, ChevronDown, ChevronUp, Tag, Sparkles, Filter, Check, RefreshCw } from "lucide-react";
import { userService } from "../services/userService";
import { UserProfile } from "../types";
import { cn } from "../lib/utils";
import { useAuth } from "../components/AuthProvider";
import Especialidades from "../components/Especialidades";
import CalendarAvailability from "../components/CalendarAvailability";
import StarRating from "../components/StarRating";
import TherapistMap from "../components/TherapistMap";
import { recommendationService, RecommendedTherapist } from "../services/recommendationService";

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

  // Advanced Filters
  const [modalidadeFiltro, setModalidadeFiltro] = useState<"todos" | "online" | "presencial">("todos");
  const [precoMaxFiltro, setPrecoMaxFiltro] = useState<number>(300);
  const [abordagemFiltro, setAbordagemFiltro] = useState<string>("todos");
  const [publicoFiltro, setPublicoFiltro] = useState<string>("todos");
  const [showFiltrosAvancados, setShowFiltrosAvancados] = useState(false);

  // SentiCore Intelligent Recommendation
  const [recommendationMode, setRecommendationMode] = useState(false);
  const [recSintoma, setRecSintoma] = useState("");
  const [recModalidade, setRecModalidade] = useState<"online" | "presencial" | "hibrido">("online");
  const [recPreco, setRecPreco] = useState<number>(200);
  const [recAbordagem, setRecAbordagem] = useState<string>("todos");
  const [recCity, setRecCity] = useState("");
  const [recommendedResults, setRecommendedResults] = useState<RecommendedTherapist[]>([]);
  const [isRecommending, setIsRecommending] = useState(false);

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

  // Handle running the SentiCore matching algorithm
  const handleRunSentiCore = async () => {
    setIsRecommending(true);
    try {
      // Small simulated delay for cognitive match effect
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const results = await recommendationService.generateRecommendations({
        userId: userProfile?.uid || "guest",
        sintomaOuObjetivo: recSintoma || busca || "Geral",
        modalidadeDesejada: recModalidade,
        cidade: recModalidade === "presencial" ? recCity || cidadeFiltro : undefined,
        precoMaximo: recPreco,
        abordagemPreferida: recAbordagem !== "todos" ? recAbordagem : undefined
      });

      setRecommendedResults(results);
      
      // Save recommendation log to firestore
      if (userProfile?.uid && results.length > 0) {
        await recommendationService.logRecommendationSession(
          userProfile.uid,
          {
            sintomaOuObjetivo: recSintoma,
            modalidadeDesejada: recModalidade,
            precoMaximo: recPreco,
            abordagemPreferida: recAbordagem !== "todos" ? recAbordagem : undefined
          },
          results.map(r => r.therapist.uid!)
        );
      }
    } catch (e) {
      console.error("Erro na recomendação SentiCore:", e);
    } finally {
      setIsRecommending(false);
    }
  };

  const cidadesDisponiveis = Array.from(new Set(listaProfissionais.map(p => p.cidade).filter(Boolean))) as string[];

  const profissionaisFiltrados = listaProfissionais.filter(prof => {
    const nomeMatch = prof.nome?.toLowerCase().includes(busca.toLowerCase());
    const especialidadeMatch = prof.especialidades?.some(e => e.toLowerCase().includes(busca.toLowerCase()));
    const buscaCidadeMatch = prof.cidade?.toLowerCase().includes(busca.toLowerCase());
    const estiloMatch = prof.estilo?.toLowerCase().includes(busca.toLowerCase());
    const abordagemMatch = prof.abordagem?.toLowerCase().includes(busca.toLowerCase());
    
    const matchesBusca = !busca || nomeMatch || especialidadeMatch || buscaCidadeMatch || estiloMatch || abordagemMatch;
    const matchesCidade = !cidadeFiltro || prof.cidade === cidadeFiltro;
    
    // Modality match
    const matchesModalidade = modalidadeFiltro === "todos" || 
      (modalidadeFiltro === "online" && prof.online) ||
      (modalidadeFiltro === "presencial" && !prof.online);

    // Price match
    const matchesPreco = !prof.preco || prof.preco <= precoMaxFiltro;

    // Approach match
    const matchesAbordagem = abordagemFiltro === "todos" || 
      (prof.abordagem && prof.abordagem.toLowerCase() === abordagemFiltro.toLowerCase());

    // Public served match (fallback mock match or actual field if present)
    const matchesPublico = publicoFiltro === "todos" || 
      !prof.publicoAtendido || 
      prof.publicoAtendido.toLowerCase() === publicoFiltro.toLowerCase();

    const isApproved = !prof.validationStatus || prof.validationStatus === 'approved' || prof.validationStatus === 'active';

    return matchesBusca && matchesCidade && matchesModalidade && matchesPreco && matchesAbordagem && matchesPublico && isApproved;
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

        {/* SentiCore Cognitive Referral Banner / Toggle */}
        <div className="bg-gradient-to-r from-emerald-950/30 to-slate-900 border border-emerald-500/10 p-5 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
          <div className="space-y-1 text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-emerald-400" /> SentiCore Recommendation Engine
            </div>
            <h3 className="text-base font-black text-slate-100">Precisa de indicação personalizada?</h3>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              Deixe nossa inteligência analisar suas preferências, orçamento e queixas para recomendar os melhores matches da Rede SentiPae.
            </p>
          </div>
          <button
            onClick={() => {
              setRecommendationMode(!recommendationMode);
              setRecommendedResults([]);
            }}
            className={cn(
              "px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2",
              recommendationMode 
                ? "bg-slate-800 border border-white/10 text-slate-200" 
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/20"
            )}
          >
            {recommendationMode ? "Voltar para Busca Geral" : "Ativar Motor IARA"}
          </button>
        </div>

        {/* SentiCore Matching Wizard Form */}
        {recommendationMode ? (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-emerald-500/10 p-6 rounded-[2rem] space-y-5"
          >
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-200">Preencha suas preferências de cuidado</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Qual o seu foco ou sintoma principal?</label>
                <input
                  type="text"
                  placeholder="Ex: ansiedade, burnout, luto, depressão"
                  value={recSintoma}
                  onChange={(e) => setRecSintoma(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-xs text-slate-250 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Valor Máximo por Sessão</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="80"
                    max="350"
                    step="10"
                    value={recPreco}
                    onChange={(e) => setRecPreco(parseInt(e.target.value))}
                    className="flex-1 accent-emerald-500 bg-slate-950 rounded-lg appearance-none h-2 cursor-pointer"
                  />
                  <span className="text-xs font-black text-emerald-400 min-w-[70px] text-right">R$ {recPreco}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Modalidade de Atendimento</label>
                <select
                  value={recModalidade}
                  onChange={(e) => setRecModalidade(e.target.value as any)}
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="online">Online (Qualquer lugar)</option>
                  <option value="presencial">Presencial (Sua cidade)</option>
                  <option value="hibrido">Híbrido (Ambos)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Abordagem de preferência</label>
                <select
                  value={recAbordagem}
                  onChange={(e) => setRecAbordagem(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="todos">Qualquer abordagem (Recomendado)</option>
                  <option value="TCC">TCC (Terapia Cognitivo-Comportamental)</option>
                  <option value="Psicanalise">Psicanálise</option>
                  <option value="Humanista">Humanista</option>
                </select>
              </div>
            </div>

            {recModalidade === "presencial" && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-1 text-left"
              >
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Em qual cidade você reside?</label>
                <input
                  type="text"
                  placeholder="Ex: São Paulo"
                  value={recCity}
                  onChange={(e) => setRecCity(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-xs text-slate-250 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </motion.div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleRunSentiCore}
                disabled={isRecommending || !recSintoma}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-900/10"
              >
                {isRecommending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Processando Algoritmo...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Gerar Matches de Especialistas
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          /* Standard Search and Filtering with Advanced Collapsible Panel */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Buscar especialistas, abordagens ou sintomas..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full bg-slate-900 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowFiltrosAvancados(!showFiltrosAvancados)}
                  className={cn(
                    "p-3.5 rounded-2xl border transition-all flex items-center justify-center cursor-pointer",
                    showFiltrosAvancados 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                      : "bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200"
                  )}
                  title="Filtros Avançados"
                >
                  <Filter className="w-4 h-4" />
                </button>

                <div className="relative w-44">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <select
                    value={cidadeFiltro}
                    onChange={(e) => setCidadeFiltro(e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 rounded-2xl py-3.5 pl-10 pr-8 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 appearance-none cursor-pointer"
                  >
                    <option value="">Cidades</option>
                    {cidadesDisponiveis.map(cidade => (
                      <option key={cidade} value={cidade}>{cidade}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Collapsible Advanced Filter Panel */}
            <AnimatePresence>
              {showFiltrosAvancados && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-slate-900/50 border border-white/5 p-5 rounded-3xl overflow-hidden text-left"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {/* Modality Filter */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Atendimento</label>
                      <div className="flex rounded-xl bg-slate-950 p-1 border border-white/5">
                        {(["todos", "online", "presencial"] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setModalidadeFiltro(mode)}
                            className={cn(
                              "flex-1 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-colors",
                              modalidadeFiltro === mode ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
                            )}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Max Price Filter */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Valor Máximo por Sessão</label>
                      <div className="flex items-center gap-3 bg-slate-950 rounded-xl px-3 py-1.5 border border-white/5">
                        <input
                          type="range"
                          min="80"
                          max="350"
                          step="10"
                          value={precoMaxFiltro}
                          onChange={(e) => setPrecoMaxFiltro(parseInt(e.target.value))}
                          className="flex-1 accent-emerald-500"
                        />
                        <span className="text-[10px] font-black text-emerald-400 w-12 text-right">R$ {precoMaxFiltro}</span>
                      </div>
                    </div>

                    {/* Approach Filter */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Abordagem Clínica</label>
                      <select
                        value={abordagemFiltro}
                        onChange={(e) => setAbordagemFiltro(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-[10px] text-slate-300 focus:outline-none"
                      >
                        <option value="todos">Todas</option>
                        <option value="TCC">TCC</option>
                        <option value="Psicanalise">Psicanálise</option>
                        <option value="Humanista">Humanista</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 text-left">Filtro Rápido por Demanda</p>
              <Especialidades selecionada={busca} onSelecionar={setBusca} />
            </div>
          </div>
        )}

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
                ) : recommendationMode && recommendedResults.length > 0 ? (
                  recommendedResults.map(rec => {
                    const prof = rec.therapist;
                    return (
                      <React.Fragment key={prof.uid}>
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-slate-900 border border-emerald-500/10 rounded-3xl p-6 flex flex-col sm:flex-row gap-6 hover:border-emerald-500/20 transition-all group relative overflow-hidden shadow-xl shadow-black/20 text-left"
                        >
                          {/* SentiCore score badge */}
                          <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-600 to-emerald-500 text-slate-950 text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider shadow-md flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> {rec.score}% Match SentiCore
                          </div>

                          <div className="relative shrink-0">
                            <img 
                              src={prof.fotoUrl || `https://picsum.photos/seed/${prof.uid}/200/200`} 
                              alt={prof.nome} 
                              className="w-28 h-28 rounded-2xl object-cover border-2 border-slate-800 shadow-inner"
                              referrerPolicy="no-referrer"
                            />
                            {prof.online && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-900 animate-pulse shadow-lg" />
                            )}
                          </div>

                          <div className="flex-1 space-y-4">
                            <div className="space-y-1">
                              <h3 className="text-xl font-black text-slate-100 group-hover:text-emerald-400 transition-colors tracking-tight">{prof.nome}</h3>
                              <p className="text-emerald-400/90 text-sm font-bold uppercase tracking-widest text-[10px]">{prof.especialidades?.join(" • ") || "Psicólogo"}</p>
                            </div>
                            
                            {/* DNA Tags */}
                            <div className="flex flex-wrap gap-2">
                              {prof.abordagem && (
                                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/10">
                                  {prof.abordagem}
                                </span>
                              )}
                              {prof.estilo && (
                                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/10">
                                  Estilo: {prof.estilo}
                                </span>
                              )}
                            </div>

                            {/* Match Reasons */}
                            <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-1.5">
                              <span className="text-[9px] uppercase tracking-widest font-black text-emerald-400 block">Métricas de Recomendação:</span>
                              {rec.matchReasons.map((reason, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-300">
                                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span>{reason}</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-5 text-[11px] text-slate-400 font-medium pt-1">
                              <span className="flex items-center gap-2">
                                <Video className="w-4 h-4" /> {prof.online ? "Online agora" : "Offline"}
                              </span>
                              {prof.cidade && (
                                <span className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" /> {prof.cidade}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col justify-between items-end gap-5 sm:border-l border-white/5 sm:pl-6 min-w-[180px]">
                            <div className="text-right space-y-1">
                              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black block">Sessão Individual</span>
                              <span className="text-slate-100 font-black text-3xl tracking-tighter">R$ {prof.preco || "120"}</span>
                            </div>
                            <div className="flex flex-col gap-2.5 w-full">
                              <button 
                                onClick={() => navigate(`/agendamento/${prof.uid}`)}
                                className="w-full px-4 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-2xl font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                              >
                                <MessageCircle className="w-4 h-4 fill-slate-950" />
                                Agendar Sessão
                              </button>
                              <button 
                                onClick={() => navigate(`/terapeuta-perfil/${prof.uid}`)}
                                className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-[11px] font-black transition-all border border-white/5 flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95 cursor-pointer"
                              >
                                <User className="w-4 h-4" />
                                Perfil Completo
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      </React.Fragment>
                    );
                  })
                ) : recommendationMode ? (
                  <div className="text-center py-16 text-slate-400 bg-slate-900/30 rounded-3xl border border-white/5 max-w-lg mx-auto">
                    <Sparkles className="w-10 h-10 text-emerald-400 mx-auto mb-4 animate-bounce" />
                    <h3 className="text-base font-black text-slate-200">Aguardando dados...</h3>
                    <p className="text-xs text-slate-500 mt-1">Preencha sua demanda acima e clique em **Gerar Matches de Especialistas**.</p>
                  </div>
                ) : profissionaisOrdenados.length > 0 ? profissionaisOrdenados.map(prof => (
                  <React.Fragment key={prof.uid}>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row gap-6 hover:border-emerald-500/30 transition-all group relative overflow-hidden shadow-xl shadow-black/20"
                    >
                      {/* Match Inteligente Badge */}
                      {busca && prof.especialidades?.some(e => e.toLowerCase() === busca.toLowerCase()) && (
                        <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-tighter shadow-lg">
                          Match Inteligente
                        </div>
                      )}

                      <div className="relative shrink-0">
                        <img 
                          src={prof.fotoUrl || `https://picsum.photos/seed/${prof.uid}/200/200`} 
                          alt={prof.nome} 
                          className="w-28 h-28 rounded-2xl object-cover border-2 border-slate-800 shadow-inner"
                          referrerPolicy="no-referrer"
                        />
                        {prof.online && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-900 animate-pulse shadow-lg shadow-emerald-500/20" />
                        )}
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-100 group-hover:text-emerald-400 transition-colors tracking-tight">{prof.nome}</h3>
                            <p className="text-emerald-400/90 text-sm font-bold uppercase tracking-widest text-[10px]">{prof.especialidades?.join(" • ") || "Psicólogo"}</p>
                          </div>
                          <div className="bg-slate-800/50 px-3 py-1.5 rounded-xl border border-white/5">
                            <StarRating rating={prof.rating || 4.8} count={prof.reviewCount || 124} size={14} />
                          </div>
                        </div>
                        
                        {/* DNA Tags */}
                        <div className="flex flex-wrap gap-2">
                          {prof.estilo && (
                            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/10">
                              {prof.estilo}
                            </span>
                          )}
                          {prof.abordagem && (
                            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/10">
                              {prof.abordagem}
                            </span>
                          )}
                          {prof.intensidade !== undefined && (
                            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-orange-500/10 text-orange-400 rounded-lg border border-orange-500/10">
                              {prof.intensidade}% Intensidade
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-5 text-[11px] text-slate-400 font-medium pt-1">
                          <span className={cn(
                            "flex items-center gap-2",
                            prof.online ? "text-emerald-400" : "text-slate-500"
                          )}>
                            <Video className="w-4 h-4" /> {prof.online ? "Online agora" : "Offline"}
                          </span>
                          {prof.cidade && (
                            <span className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" /> {prof.cidade}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col justify-between items-end gap-5 sm:border-l border-white/5 sm:pl-6 min-w-[180px]">
                        <div className="text-right space-y-1">
                          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black block">Sessão Individual</span>
                          {userProfile?.isComunidade && prof.descontoComunidade ? (
                            <div className="flex flex-col items-end">
                              <span className="text-slate-500 line-through text-xs font-bold">R$ {prof.preco || "120"}</span>
                              <div className="flex items-center gap-1.5 text-emerald-400">
                                <Tag className="w-4 h-4" />
                                <span className="font-black text-3xl tracking-tighter">R$ {((prof.preco || 120) * (1 - prof.descontoComunidade / 100)).toFixed(0)}</span>
                              </div>
                              <span className="text-[9px] text-emerald-500 font-black uppercase tracking-tighter bg-emerald-500/10 px-2 py-0.5 rounded-md mt-1">Desconto Comunidade</span>
                            </div>
                          ) : prof.desconto ? (
                            <div className="flex flex-col items-end">
                              <span className="text-slate-500 line-through text-xs font-bold">R$ {prof.preco || "120"}</span>
                              <div className="flex items-center gap-1.5 text-emerald-400">
                                <Tag className="w-4 h-4" />
                                <span className="font-black text-3xl tracking-tighter">R$ {((prof.preco || 120) * (1 - prof.desconto / 100)).toFixed(0)}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-100 font-black text-3xl tracking-tighter">R$ {prof.preco || "120"}</span>
                          )}
                        </div>
                        <div className="flex flex-col gap-2.5 w-full">
                          <button 
                            onClick={() => navigate(`/agendamento/${prof.uid}`)}
                            className="w-full px-4 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-2xl font-black text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95"
                          >
                            <MessageCircle className="w-4 h-4 fill-slate-950" />
                            Conectar Agora
                          </button>
                          <button 
                            onClick={() => navigate(`/terapeuta-perfil/${prof.uid}`)}
                            className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-[11px] font-black transition-all border border-white/5 flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95"
                          >
                            <User className="w-4 h-4" />
                            Perfil Completo
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