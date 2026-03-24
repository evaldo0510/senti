import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { User, Briefcase, DollarSign, ArrowRight, Activity } from "lucide-react";
import { userService } from "../services/userService";
import { auth } from "../services/firebase";

export default function TerapeutaSetup() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [preco, setPreco] = useState("");
  const [desconto, setDesconto] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        const profile = await userService.getUser(auth.currentUser.uid);
        if (profile) {
          setNome(profile.nome || "");
          setEspecialidade(profile.especialidades?.[0] || "");
          setPreco(profile.preco?.toString() || "");
          setDesconto(profile.desconto?.toString() || "0");
        }
      }
    };
    fetchProfile();
  }, []);

  const salvar = async () => {
    if (!nome || !especialidade || !auth.currentUser) return;
    
    setIsLoading(true);
    try {
      await userService.updateProfile(auth.currentUser.uid, {
        nome,
        especialidades: [especialidade],
        preco: parseFloat(preco) || 0,
        desconto: parseFloat(desconto) || 0,
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
        className="max-w-md w-full bg-slate-900 border border-white/10 p-8 rounded-3xl space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-light text-slate-200">Configurar Perfil</h2>
          <p className="text-slate-400">Complete seus dados para começar a atender.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Nome Completo</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Dr. João Silva"
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Especialidade</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Briefcase className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                value={especialidade}
                onChange={(e) => setEspecialidade(e.target.value)}
                placeholder="Psicólogo Clínico, TCC..."
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Valor que deseja receber (R$)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="number"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                placeholder="150"
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
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
            <p className="text-[10px] text-slate-500 ml-1">
              * O desconto será aplicado sobre o seu valor e beneficiará o cliente final. Uma taxa de 10% da plataforma será aplicada sobre o valor final.
            </p>
          </div>
        </div>

        <button 
          onClick={salvar}
          disabled={!nome || !especialidade || isLoading}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? "Salvando..." : "Salvar e Continuar"}
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}
