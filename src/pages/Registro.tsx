import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Save, FileText, Clock, AlertCircle } from "lucide-react";
import { userService } from "../services/userService";
import { Appointment, UserProfile } from "../types";

export default function Registro() {
  const navigate = useNavigate();
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId");
  
  const [nota, setNota] = useState("");
  const [risco, setRisco] = useState<Appointment['riskLevel']>("baixo");
  const [isSaved, setIsSaved] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patient, setPatient] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (appointmentId && appointmentId !== 'new') {
        const app = await userService.getAppointment(appointmentId);
        if (app) {
          setAppointment(app);
          setNota(app.notes || "");
          setRisco(app.riskLevel || "baixo");
        }
      } else if (patientId) {
        const p = await userService.getUser(patientId);
        if (p) {
          setPatient(p);
        }
      }
    };
    fetchData();
  }, [appointmentId, patientId]);

  const salvar = async () => {
    if (!nota.trim()) return;
    
    setIsLoading(true);
    try {
      if (appointmentId && appointmentId !== 'new') {
        await userService.updateAppointmentNotes(appointmentId, nota, risco);
      } else if (patientId && patient) {
        await userService.createManualEvolution(patientId, patient.nome || "Paciente", nota, risco);
      }
      
      setIsSaved(true);
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (error) {
      console.error("Error saving record:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-light text-slate-200">Registro Clínico</h1>
            <p className="text-slate-400 text-sm">Paciente: {appointment?.patientNome || patient?.nome || "Carregando..."}</p>
          </div>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-6"
        >
          <div className="flex flex-wrap gap-4 items-center justify-between border-b border-white/5 pb-6">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-5 h-5" />
              <span>Data: {appointment?.date ? new Date(appointment.date).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">Nível de Risco:</span>
              <select 
                value={risco}
                onChange={(e) => setRisco(e.target.value as Appointment['riskLevel'])}
                className="bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="baixo">Baixo</option>
                <option value="moderado">Moderado</option>
                <option value="alto">Alto</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-slate-300 font-medium">
              <FileText className="w-5 h-5 text-emerald-500" />
              Evolução da Sessão
            </label>
            <textarea
              rows={8}
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Descreva os pontos principais da sessão, intervenções realizadas e plano para as próximas sessões..."
              className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
            />
          </div>

          <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-200/80">
              Lembre-se: Este registro é confidencial e protegido por criptografia ponta-a-ponta, acessível apenas por você.
            </p>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              onClick={salvar}
              disabled={!nota.trim() || isSaved || isLoading}
              className={`w-full sm:w-auto px-6 py-4 sm:py-3 rounded-2xl sm:rounded-xl font-bold sm:font-medium transition-colors flex items-center justify-center gap-2 min-h-[56px] sm:min-h-[44px] ${
                isSaved 
                  ? "bg-emerald-500 text-white" 
                  : "bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white shadow-lg shadow-emerald-900/20"
              }`}
            >
              {isSaved ? (
                <>Salvo com sucesso!</>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isLoading ? "Salvando..." : "Salvar Prontuário"}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
