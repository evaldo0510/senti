import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';
import { UserProfile, Availability } from '../types';
import { userService } from '../services/userService';
import { auth } from '../services/authService';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface BookingModalProps {
  therapist: UserProfile;
  patientProfile: UserProfile | null;
  onClose: () => void;
  initialDay?: string;
  initialSlot?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({ therapist, patientProfile, onClose, initialDay, initialSlot }) => {
  const [selectedDay, setSelectedDay] = useState<string | null>(initialDay || null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(initialSlot || null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBook = async () => {
    if (!auth.currentUser || !selectedDay || !selectedSlot || !patientProfile) return;
    
    setLoading(true);
    try {
      // Find the next date for the selected day
      const daysMap: { [key: string]: number } = {
        'Segunda': 1, 'Terça': 2, 'Quarta': 3, 'Quinta': 4, 'Sexta': 5, 'Sábado': 6, 'Domingo': 0
      };
      
      const targetDay = daysMap[selectedDay];
      const date = new Date();
      while (date.getDay() !== targetDay) {
        date.setDate(date.getDate() + 1);
      }
      
      const [hours, minutes] = selectedSlot.split(':');
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      await userService.createAppointment({
        patientId: auth.currentUser.uid,
        patientNome: patientProfile.nome,
        therapistId: therapist.uid,
        therapistNome: therapist.nome,
        date: date.toISOString(),
        status: 'pending',
        type: 'video',
        price: therapist.preco || 0
      });
      
      setSuccess(true);
    } catch (error) {
      console.error("Erro ao agendar:", error);
    } finally {
      setLoading(false);
    }
  };

  const availability = therapist.disponibilidade || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md rounded-[3rem] overflow-hidden border-brand-text/5"
      >
        <div className="p-8 border-b border-brand-text/5 flex items-center justify-between bg-brand-slate/30">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-indigo">Agendamento</p>
            <h3 className="text-2xl font-serif font-bold text-brand-text">Sessão com {therapist.nome}</h3>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center text-brand-text/40 hover:text-brand-text hover:bg-brand-slate transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {!success ? (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-brand-text/40 text-[10px] font-bold uppercase tracking-widest">
                  <CalendarIcon size={14} className="text-brand-indigo" />
                  <span>Selecione o dia</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availability.map((a) => (
                    <button
                      key={a.day}
                      onClick={() => {
                        setSelectedDay(a.day);
                        setSelectedSlot(null);
                      }}
                      className={cn(
                        "px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                        selectedDay === a.day 
                          ? "bg-brand-indigo border-brand-indigo text-white shadow-lg shadow-brand-indigo/20" 
                          : "bg-brand-bg/50 border-brand-text/5 text-brand-text/40 hover:border-brand-indigo/30 hover:text-brand-indigo"
                      )}
                    >
                      {a.day}
                    </button>
                  ))}
                  {availability.length === 0 && (
                    <div className="w-full py-6 text-center border-2 border-dashed border-brand-text/5 rounded-2xl">
                      <p className="text-sm text-brand-text/30 italic">Nenhum horário disponível no momento.</p>
                    </div>
                  )}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {selectedDay && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="flex items-center gap-3 text-brand-text/40 text-[10px] font-bold uppercase tracking-widest">
                      <Clock size={14} className="text-brand-indigo" />
                      <span>Selecione o horário</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availability.find(a => a.day === selectedDay)?.slots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={cn(
                            "px-5 py-2.5 rounded-2xl text-[10px] font-bold transition-all border",
                            selectedSlot === slot 
                              ? "bg-brand-green border-brand-green text-white shadow-lg shadow-brand-green/20" 
                              : "bg-brand-bg/50 border-brand-text/5 text-brand-text/40 hover:border-brand-green/30 hover:text-brand-green"
                          )}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-4">
                <button
                  onClick={handleBook}
                  disabled={!selectedSlot || loading}
                  className="w-full bg-brand-dark text-white font-bold py-5 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-3 border border-white/5"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Confirmar Agendamento"
                  )}
                </button>
                <p className="text-center text-[10px] text-brand-text/30 font-bold uppercase tracking-widest mt-4">
                  Pagamento via PIX ou Cartão após confirmação
                </p>
              </div>
            </>
          ) : (
            <div className="py-10 text-center space-y-6 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-brand-green/10 text-brand-green rounded-3xl flex items-center justify-center mx-auto border border-brand-green/20 shadow-inner">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-2">
                <h4 className="text-3xl font-serif font-bold text-brand-text">Solicitação Enviada!</h4>
                <p className="text-brand-text/40 text-sm max-w-[240px] mx-auto">
                  O terapeuta receberá sua solicitação e confirmará em breve. Fique atento às suas notificações.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-brand-indigo text-white font-bold py-5 rounded-2xl shadow-lg shadow-brand-indigo/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Entendido
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
