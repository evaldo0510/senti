import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { Send, ArrowLeft, Video, Phone, MoreVertical, FileText } from "lucide-react";
import { chatService } from "../services/chatService";
import { auth } from "../services/firebase";
import { userService } from "../services/userService";
import { Appointment } from "../types";

export default function Atendimento() {
  const navigate = useNavigate();
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [mensagem, setMensagem] = useState("");
  const [chat, setChat] = useState<any[]>([]);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!appointmentId) return;

    // Fetch appointment details
    const fetchAppointment = async () => {
      try {
        const app = await userService.getAppointment(appointmentId);
        if (app) {
          setAppointment(app);
        }
      } catch (error) {
        console.error("Error fetching appointment:", error);
      }
    };
    fetchAppointment();

    // Listen for messages
    const unsubscribe = chatService.listenMessagesByAppointment(appointmentId, (messages) => {
      setChat(messages);
    });

    return () => unsubscribe();
  }, [appointmentId]);

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const enviar = async () => {
    if (!mensagem.trim() || !appointmentId || !auth.currentUser) return;
    
    try {
      await chatService.sendMessage(appointmentId, auth.currentUser.uid, mensagem);
      setMensagem("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
      <header className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-400 font-medium border border-emerald-500/20">
              {appointment?.patientNome?.[0] || "P"}
            </div>
            <div>
              <h2 className="text-lg font-medium text-slate-200">{appointment?.patientNome || "Paciente"}</h2>
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Em atendimento
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300">
            <Phone className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate(`/registro/${appointmentId}`)}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900/30 hover:bg-emerald-800/50 text-emerald-300 rounded-full text-sm font-medium transition-colors border border-emerald-500/20 ml-2"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Prontuário</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {chat.length === 0 && (
          <div className="text-center text-slate-500 py-10 italic">
            Nenhuma mensagem ainda. Inicie a conversa.
          </div>
        )}
        
        {chat.map((m, i) => (
          <motion.div 
            key={m.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.senderId === auth.currentUser?.uid ? "justify-end" : "justify-start"}`}
          >
            <div 
              className={`max-w-[80%] p-4 rounded-2xl ${
                m.senderId === auth.currentUser?.uid 
                  ? "bg-emerald-600 text-white rounded-tr-sm" 
                  : "bg-slate-800 text-slate-200 rounded-tl-sm border border-white/5"
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
              <p className="text-[10px] opacity-50 mt-1 text-right">
                {m.timestamp?.toDate ? m.timestamp.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ""}
              </p>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-900/80 backdrop-blur-md border-t border-white/10">
        <div className="max-w-4xl mx-auto relative flex items-end gap-2">
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            className="w-full bg-slate-800/50 border border-white/10 rounded-2xl py-3 px-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none min-h-[52px] max-h-32"
            rows={1}
          />
          <button 
            onClick={enviar}
            disabled={!mensagem.trim()}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl transition-colors flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
