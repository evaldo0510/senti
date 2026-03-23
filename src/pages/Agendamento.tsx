import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Calendar, Clock, CheckCircle, Loader2 } from "lucide-react";
import { userService } from "../services/userService";
import { UserProfile } from "../types";
import { auth } from "../services/firebase";

export default function Agendamento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [horario, setHorario] = useState("");
  const [confirmado, setConfirmado] = useState(false);
  const [profissional, setProfissional] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (id) {
      userService.getUser(id).then(p => {
        setProfissional(p);
        setLoading(false);
      });
    }
  }, [id]);

  const horariosDisponiveis = [
    "10:00",
    "11:00",
    "14:00",
    "16:00",
  ];

  const handleConfirmar = async () => {
    if (!profissional || !horario || !auth.currentUser) return;

    setBooking(true);
    try {
      const patientProfile = await userService.getUser(auth.currentUser.uid);
      if (!patientProfile) throw new Error("Perfil do paciente não encontrado");

      const date = new Date();
      const [hours, minutes] = horario.split(':');
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      await userService.createAppointment({
        patientId: auth.currentUser.uid,
        patientNome: patientProfile.nome,
        therapistId: profissional.uid,
        therapistNome: profissional.nome,
        date: date.toISOString(),
        status: 'pending',
        type: 'video',
        price: profissional.preco || 0
      });
      setConfirmado(true);
    } catch (error) {
      console.error("Erro ao agendar:", error);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!profissional) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 text-center">
        <h2 className="text-2xl font-medium text-slate-200">Terapeuta não encontrado</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-emerald-400">Voltar</button>
      </div>
    );
  }

  if (confirmado) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 text-center"
      >
        <div className="max-w-md w-full space-y-8 bg-slate-900 border border-white/5 p-8 rounded-3xl">
          <div className="w-20 h-20 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-medium text-slate-200">Sessão Confirmada!</h2>
            <p className="text-slate-400">Seu agendamento foi realizado com sucesso.</p>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-6 space-y-4 text-left border border-white/5">
            <div className="flex items-center gap-4">
              <img src={profissional.fotoUrl || `https://picsum.photos/seed/${profissional.uid}/200`} alt={profissional.nome} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-medium text-slate-200">{profissional.nome}</p>
                <p className="text-sm text-slate-400">{profissional.especialidades?.join(', ')}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center gap-3 text-slate-300">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span>Hoje às {horario}</span>
            </div>
          </div>

          <button 
            onClick={() => navigate("/dashboard")}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
          >
            Ir para o Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-slate-950 text-slate-100 p-6"
    >
      <div className="max-w-md mx-auto space-y-8">
        <header className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-medium text-slate-200">Agendar Sessão</h1>
        </header>

        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 flex items-center gap-4">
          <img src={profissional.fotoUrl || `https://picsum.photos/seed/${profissional.uid}/200`} alt={profissional.nome} className="w-16 h-16 rounded-xl object-cover" />
          <div>
            <h3 className="font-medium text-slate-200">{profissional.nome}</h3>
            <p className="text-sm text-slate-400">R$ {profissional.preco}/sessão</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-200 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Horários Disponíveis Hoje
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {horariosDisponiveis.map((h, i) => (
              <button
                key={i}
                onClick={() => setHorario(h)}
                className={`py-4 rounded-xl font-medium transition-all border ${
                  horario === h 
                    ? "bg-emerald-600 border-emerald-500 text-white" 
                    : "bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {horario && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-8"
          >
            <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-2xl p-6 mb-6">
              <p className="text-sm text-emerald-400 mb-1">Resumo do Agendamento</p>
              <p className="text-lg font-medium text-emerald-100">Hoje às {horario}</p>
            </div>

            <button
              onClick={handleConfirmar}
              disabled={booking}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {booking && <Loader2 className="w-5 h-5 animate-spin" />}
              Confirmar e Pagar (R$ {profissional.preco})
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
