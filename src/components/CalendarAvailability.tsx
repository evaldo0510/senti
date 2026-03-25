import React, { useState } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  isBefore, 
  startOfToday,
  getDay
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "../lib/utils";
import { UserProfile } from "../types";

interface CalendarAvailabilityProps {
  therapist: UserProfile;
  onSelect: (date: Date, time: string) => void;
  selectedDate?: Date;
  selectedTime?: string;
}

const dayMap: { [key: string]: number } = {
  'domingo': 0,
  'segunda': 1,
  'terça': 2,
  'quarta': 3,
  'quinta': 4,
  'sexta': 5,
  'sábado': 6,
  'segunda-feira': 1,
  'terça-feira': 2,
  'quarta-feira': 3,
  'quinta-feira': 4,
  'sexta-feira': 5,
  'sábado-feira': 6
};

export default function CalendarAvailability({ therapist, onSelect, selectedDate, selectedTime }: CalendarAvailabilityProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeDate, setActiveDate] = useState(selectedDate || startOfToday());

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-lg font-bold text-slate-200 capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        const isPast = isBefore(cloneDay, startOfToday());
        const isSelected = isSameDay(cloneDay, activeDate);
        const isCurrentMonth = isSameMonth(cloneDay, monthStart);
        
        // Check if therapist has availability on this day of week
        const dayOfWeek = getDay(cloneDay);
        const hasAvailability = therapist.disponibilidade?.some(d => dayMap[d.day.toLowerCase()] === dayOfWeek);

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "relative h-12 flex items-center justify-center cursor-pointer transition-all rounded-xl m-0.5",
              !isCurrentMonth ? "text-slate-700 pointer-events-none" : "",
              isPast ? "text-slate-800 pointer-events-none" : "text-slate-300",
              isSelected ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20" : "hover:bg-slate-800",
              hasAvailability && !isPast && isCurrentMonth && !isSelected ? "border border-emerald-500/20" : ""
            )}
            onClick={() => !isPast && setActiveDate(cloneDay)}
          >
            <span className="text-sm font-medium">{formattedDate}</span>
            {hasAvailability && !isPast && isCurrentMonth && !isSelected && (
              <div className="absolute bottom-1.5 w-1 h-1 bg-emerald-500 rounded-full" />
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="mb-6">{rows}</div>;
  };

  const renderSlots = () => {
    const dayOfWeek = getDay(activeDate);
    const availability = therapist.disponibilidade?.find(d => dayMap[d.day.toLowerCase()] === dayOfWeek);
    const slots = availability?.slots || [];

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <Clock className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Horários para {format(activeDate, "dd 'de' MMMM", { locale: ptBR })}</span>
        </div>
        
        {slots.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot, i) => (
              <button
                key={i}
                onClick={() => onSelect(activeDate, slot)}
                className={cn(
                  "py-2.5 rounded-xl text-xs font-bold transition-all border",
                  selectedTime === slot && isSameDay(activeDate, selectedDate || new Date(0))
                    ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/20"
                    : "bg-slate-900 border-white/5 text-slate-300 hover:bg-slate-800"
                )}
              >
                {slot}
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 text-center">
            <p className="text-xs text-slate-500">Nenhum horário disponível para este dia.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-900/30 border border-white/5 rounded-[2rem] p-6">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      {renderSlots()}
    </div>
  );
}
