import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { User, Briefcase, DollarSign, ArrowRight, Activity, ArrowLeft, Instagram, Globe, Video } from "lucide-react";
import { userService } from "../services/userService";
import { auth } from "../services/firebase";

export default function TerapeutaSetup() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [preco, setPreco] = useState("120");
  const [desconto, setDesconto] = useState("0");
  const [descontoComunidade, setDescontoComunidade] = useState("0");
  const [intensidade, setIntensidade] = useState<number>(50);
  const [estilo, setEstilo] = useState<'acolhedor' | 'provocador' | 'analitico' | 'pratico'>("acolhedor");
  const [abordagem, setAbordagem] = useState<string>("TCC");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        const profile = await userService.getUser(auth.currentUser.uid);
        if (profile) {
          setNome(profile.nome || "");
          setEspecialidade(profile.especialidades?.[0] || "");
          setPreco(profile.preco?.toString() || "120");
          setDesconto(profile.desconto?.toString() || "0");
          setDescontoComunidade(profile.descontoComunidade?.toString() || "0");
          setIntensidade(profile.intensidade || 50);
          setEstilo((profile.estilo as any) || "acolhedor");
          setAbordagem(profile.abordagem || "TCC");
          setInstagram(profile.instagram || "");
          setWebsite(profile.website || "");
          setVideoUrl(profile.videoUrl || "");
        }
      }
    };
    fetchProfile();
  }, []);

  const validar = () => {
    const newErrors: Record<string, string> = {};
    
    if (!nome.trim()) {
      newErrors.nome = "O nome é obrigatório";
    }
    
    if (!especialidade.trim()) {
      newErrors.especialidade = "A especialidade é obrigatória";
    }
    
    const precoNum = parseFloat(preco);
    if (!preco || isNaN(precoNum)) {
      newErrors.preco = "O preço é obrigatório e deve ser um número";
    } else if (precoNum <= 0) {
      newErrors.preco = "O preço deve ser um valor positivo";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const salvar = async () => {
    if (!auth.currentUser) return;
    if (!validar()) return;
    
    setIsLoading(true);
    try {
      await userService.updateProfile(auth.currentUser.uid, {
        nome,
        especialidades: [especialidade],
        preco: parseFloat(preco) || 120,
        desconto: parseFloat(desconto) || 0,
        descontoComunidade: parseFloat(descontoComunidade) || 0,
        intensidade,
        estilo,
        abordagem,
        instagram,
        website,
        videoUrl,
        tipo: 'terapeuta',
        online: true
      });
      
      localStorage.setItem("tipo", "terapeuta");
      navigate("/terapeuta");
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-slate-900 border border-white/10 p-8 rounded-3xl space-y-8 my-10"
      >
        <div className="text-center space-y-2 relative">
          <button 
            onClick={() => navigate(-1)}
            className="absolute left-0 top-0 p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400"
            title="Voltar"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-light text-slate-200">Configurar Perfil Profissional</h2>
          <p className="text-slate-400">Defina seu DNA terapêutico para um match perfeito.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-widest">Dados Básicos</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Nome Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value);
                    if (errors.nome) setErrors(prev => ({ ...prev, nome: "" }));
                  }}
                  placeholder="Dr. João Silva"
                  className={`w-full bg-slate-950 border ${errors.nome ? 'border-red-500' : 'border-white/10'} rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                />
              </div>
              {errors.nome && <p className="text-xs text-red-500 ml-1">{errors.nome}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Especialidade Principal</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={especialidade}
                  onChange={(e) => {
                    setEspecialidade(e.target.value);
                    if (errors.especialidade) setErrors(prev => ({ ...prev, especialidade: "" }));
                  }}
                  placeholder="Psicólogo Clínico, TCC..."
                  className={`w-full bg-slate-950 border ${errors.especialidade ? 'border-red-500' : 'border-white/10'} rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                />
              </div>
              {errors.especialidade && <p className="text-xs text-red-500 ml-1">{errors.especialidade}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Valor da Sessão (R$)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="number"
                  value={preco}
                  onChange={(e) => {
                    setPreco(e.target.value);
                    if (errors.preco) setErrors(prev => ({ ...prev, preco: "" }));
                  }}
                  placeholder="150"
                  className={`w-full bg-slate-950 border ${errors.preco ? 'border-red-500' : 'border-white/10'} rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                />
              </div>
              {errors.preco && <p className="text-xs text-red-500 ml-1">{errors.preco}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Desconto Especial (%)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <ArrowRight className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="number"
                  value={desconto}
                  onChange={(e) => setDesconto(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Desconto Comunidade/Centro (%)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <ArrowRight className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="number"
                  value={descontoComunidade}
                  onChange={(e) => setDescontoComunidade(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-widest">DNA Terapêutico</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Intensidade do Atendimento ({intensidade}%)</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={intensidade}
                onChange={(e) => setIntensidade(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold">
                <span>Passivo/Escuta</span>
                <span>Ativo/Diretivo</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Estilo Predominante</label>
              <select 
                value={estilo}
                onChange={(e) => setEstilo(e.target.value as any)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="acolhedor">Acolhedor / Empático</option>
                <option value="provocador">Provocador / Desafiador</option>
                <option value="analitico">Analítico / Técnico</option>
                <option value="pratico">Prático / Focado em Solução</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Abordagem Principal</label>
              <select 
                value={abordagem}
                onChange={(e) => setAbordagem(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="TCC">TCC (Cognitivo-Comportamental)</option>
                <option value="Psicanalise">Psicanálise</option>
                <option value="Humanista">Humanista / Fenomenologia</option>
                <option value="Sistemica">Sistêmica / Familiar</option>
                <option value="Gestalt">Gestalt-terapia</option>
                <option value="Outra">Outra</option>
              </select>
            </div>

            <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-widest pt-4">Redes e Contato</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Instagram (@usuario)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Instagram className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@seuperfil"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Site Profissional</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://seusite.com"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Vídeo de Apresentação (YouTube/Vimeo)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Video className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button 
            onClick={salvar}
            disabled={isLoading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            {isLoading ? "Salvando..." : "Finalizar Configuração"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
