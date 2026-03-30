import React from "react";
import { cn } from "../lib/utils";

const especialidades = [
  "Ansiedade",
  "Depressão",
  "Estresse",
  "Relacionamento",
  "Autoestima",
  "Trauma",
  "TCC",
  "Psicanálise",
  "Infantil",
  "Casal"
];

interface EspecialidadesProps {
  selecionada: string;
  onSelecionar: (especialidade: string) => void;
}

export default function Especialidades({ selecionada, onSelecionar }: EspecialidadesProps) {
  return (
    <div className="flex overflow-x-auto gap-3 py-2 no-scrollbar">
      <button
        onClick={() => onSelecionar("")}
        className={cn(
          "px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border",
          selecionada === "" 
            ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/20" 
            : "bg-slate-900 border-white/5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
        )}
      >
        Todos
      </button>
      {especialidades.map((e, idx) => {
        const colors = [
          "hover:border-emerald-500/50 hover:text-emerald-400",
          "hover:border-blue-500/50 hover:text-blue-400",
          "hover:border-purple-500/50 hover:text-purple-400",
          "hover:border-rose-500/50 hover:text-rose-400",
          "hover:border-amber-500/50 hover:text-amber-400",
        ];
        const colorClass = colors[idx % colors.length];
        
        return (
          <button
            key={e}
            onClick={() => onSelecionar(e)}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border",
              selecionada === e 
                ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/20" 
                : cn("bg-slate-900 border-white/5 text-slate-400 bg-white dark:bg-slate-900", colorClass)
            )}
          >
            {e}
          </button>
        );
      })}
    </div>
  );
}
