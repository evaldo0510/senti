import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';
import { UserProfile, Availability } from '../types';
import { userService } from '../services/userService';
import { auth } from '../services/authService';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface BookingModalProps {
  therapist: UserProfile;
  patientProfile: UserProfile | null;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ therapist, patientProfile, onClose }) => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
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
      
      await userService.createAppointment({
        patientId: auth.currentUser.uid,
        patientNome: patientProfile.nome,
        therapistId: therapist.uid,
        therapistNome: therapist.nome,
        date: date.toISOString().split('T')[0],
        slot: selectedSlot,
        status: 'pending'
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-brand-slate w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-serif font-bold text-brand-text">Agendar com {therapist.nome}</h3>
          <button onClick={onClose} className="text-brand-text/40 hover:text-brand-text transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!success ? (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-brand-text/60 text-sm font-medium">
                  <CalendarIcon size={18} />
                  <span>Selecione o dia:</span>
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
                        "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border",
                        selectedDay === a.day 
                          ? "bg-brand-green border-brand-green text-brand-dark" 
                          : "bg-white/5 border-transparent text-brand-text/60 hover:border-white/10"
                      )}
                    >
                      {a.day}
                    </button>
                  ))}
                  {availability.length === 0 && (
                    <p className="text-sm text-brand-text/40 italic">O terapeuta ainda não definiu horários.</p>
                  )}
                </div>
              </div>

              {selectedDay && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 text-brand-text/60 text-sm font-medium">
                    <Clock size={18} />
                    <span>Selecione o horário:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availability.find(a => a.day === selectedDay)?.slots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                          selectedSlot === slot 
                            ? "bg-brand-indigo border-brand-indigo text-white" 
                            : "bg-white/5 border-transparent text-brand-text/60 hover:border-white/10"
                        )}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleBook}
                disabled={!selectedSlot || loading}
                className="w-full bg-brand-green text-brand-dark font-bold py-4 rounded-2xl shadow-lg shadow-brand-green/20 disabled:opacity-50 disabled:grayscale transition-all"
              >
                {loading ? "Agendando..." : "Confirmar Agendamento"}
              </button>
            </>
          ) : (
            <div className="py-8 text-center space-y-4 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-brand-green/20 text-brand-green rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-serif font-bold text-brand-text">Agendado!</h4>
                <p className="text-brand-text/60 text-sm">Seu pedido de agendamento foi enviado. Aguarde a confirmação do terapeuta.</p>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-brand-slate border border-white/10 text-brand-text font-bold py-4 rounded-2xl hover:bg-white/5 transition-all"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
