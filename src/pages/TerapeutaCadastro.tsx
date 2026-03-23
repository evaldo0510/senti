import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, User, Stethoscope, FileText, MapPin, DollarSign } from "lucide-react";

export default function TerapeutaCadastro() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [descricao, setDescricao] = useState("");
  const [cidade, setCidade] = useState("");
  const [preco, setPreco] = useState("");

  const salvar = () => {
    if (!nome || !especialidade) return;

    const lista = JSON.parse(localStorage.getItem("terapeutas_cadastrados") || "[]");

    const novoTerapeuta = {
      id: Date.now(),
      nome,
      especialidade,
      descricao,
      cidade,
      preco,
      rating: 5.0,
      reviews: 0,
      online: true,
      presencial: cidade.length > 0,
      imagem: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nome}`
    };

    lista.push(novoTerapeuta);
    localStorage.setItem("terapeutas_cadastrados", JSON.stringify(lista));

    navigate("/profissionais");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-slate-900 border border-white/10 p-8 rounded-3xl space-y-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full"></div>
        
        <header className="flex items-center gap-4 relative z-10">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-medium text-slate-200">Criar Perfil</h2>
            <p className="text-sm text-slate-400">Junte-se à rede de terapeutas</p>
          </div>
        </header>

        <div className="space-y-4 relative z-10">
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Stethoscope className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                value={especialidade}
                onChange={(e) => setEspecialidade(e.target.value)}
                placeholder="Especialidade (ex: Ansiedade, TCC)"
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 pt-3 pointer-events-none">
                <FileText className="h-5 w-5 text-slate-500" />
              </div>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Breve descrição sobre seu atendimento"
                rows={3}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Cidade/UF"
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                placeholder="Preço (ex: R$ 150)"
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={salvar}
          disabled={!nome || !especialidade}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-medium transition-colors relative z-10"
        >
          Salvar Perfil
        </button>
      </motion.div>
    </div>
  );
}
