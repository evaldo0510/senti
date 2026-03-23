import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Search, MapPin, Star, Video } from "lucide-react";

export const profissionais = [
  {
    id: 1,
    nome: "Dra. Ana Silva",
    especialidade: "Psicóloga Clínica (TCC)",
    rating: 4.9,
    reviews: 128,
    online: true,
    presencial: false,
    cidade: "São Paulo, SP",
    preco: "R$ 150/sessão",
    imagem: "https://picsum.photos/seed/ana/200/200"
  },
  {
    id: 2,
    nome: "Dr. Carlos Mendes",
    especialidade: "Psicanalista",
    rating: 4.8,
    reviews: 95,
    online: true,
    presencial: true,
    cidade: "Rio de Janeiro, RJ",
    preco: "R$ 180/sessão",
    imagem: "https://picsum.photos/seed/carlos/200/200"
  },
  {
    id: 3,
    nome: "Clínica Acolher",
    especialidade: "Atendimento Multidisciplinar",
    rating: 4.7,
    reviews: 210,
    online: false,
    presencial: true,
    cidade: "Belo Horizonte, MG",
    preco: "A partir de R$ 100",
    imagem: "https://picsum.photos/seed/clinica/200/200"
  },
  {
    id: 4,
    nome: "Dr. Roberto Almeida",
    especialidade: "Psiquiatra",
    rating: 4.9,
    reviews: 310,
    online: true,
    presencial: true,
    cidade: "Curitiba, PR",
    preco: "R$ 350/consulta",
    imagem: "https://picsum.photos/seed/roberto/200/200"
  }
];

export default function Profissionais() {
  const navigate = useNavigate();
  const location = useLocation();
  const [busca, setBusca] = useState("");
  const [listaProfissionais, setListaProfissionais] = useState(profissionais);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tipo = params.get("tipo");
    if (tipo) {
      setBusca(tipo);
    }

    const terapeutasCadastrados = JSON.parse(localStorage.getItem("terapeutas_cadastrados") || "[]");
    if (terapeutasCadastrados.length > 0) {
      setListaProfissionais([...terapeutasCadastrados, ...profissionais]);
    }
  }, [location]);

  const profissionaisFiltrados = listaProfissionais.filter(prof => 
    prof.nome.toLowerCase().includes(busca.toLowerCase()) ||
    prof.especialidade.toLowerCase().includes(busca.toLowerCase()) ||
    prof.cidade.toLowerCase().includes(busca.toLowerCase())
  );

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

        <div className="space-y-4">
          {profissionaisFiltrados.length > 0 ? profissionaisFiltrados.map(prof => (
            <motion.div 
              key={prof.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row gap-4"
            >
              <img 
                src={prof.imagem} 
                alt={prof.nome} 
                className="w-20 h-20 rounded-xl object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-slate-200">{prof.nome}</h3>
                    <p className="text-emerald-400 text-sm">{prof.especialidade}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{prof.rating}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                  {prof.online && (
                    <span className="flex items-center gap-1">
                      <Video className="w-4 h-4" /> Online
                    </span>
                  )}
                  {prof.presencial && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {prof.cidade}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col justify-between items-end gap-4 sm:border-l border-white/5 sm:pl-4">
                <span className="text-slate-300 font-medium">{prof.preco}</span>
                <button 
                  onClick={() => navigate(`/agendamento/${prof.id}`)}
                  className="w-full sm:w-auto px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors"
                >
                  Agendar
                </button>
              </div>
            </motion.div>
          )) : (
            <div className="text-center py-12 text-slate-400">
              Nenhum profissional encontrado para "{busca}".
            </div>
          )}
        </div>

        <div className="pt-8 text-center border-t border-white/10">
          <p className="text-slate-400 mb-4">É profissional de saúde mental?</p>
          <button 
            onClick={() => navigate("/cadastro-terapeuta")}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors border border-white/5"
          >
            Cadastrar meu perfil
          </button>
        </div>
      </div>
    </motion.div>
  );
}