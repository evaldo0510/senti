import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Plus, Trash2, Clock, DollarSign, BookOpen, Award, Sparkles } from 'lucide-react';
import { UserProfile, Availability } from '../types';
import { updateUserProfile, auth } from '../services/authService';
import { cn } from '../lib/utils';
import { generateTherapistBio } from '../services/geminiService';

interface TerapeutaSettingsProps {
  profile: UserProfile;
  onUpdate: (updatedProfile: UserProfile) => void;
}

export const TerapeutaSettings: React.FC<TerapeutaSettingsProps> = ({ profile, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    nome: profile.nome || '',
    biografia: profile.biografia || '',
    preco: profile.preco || 0,
    especialidades: profile.especialidades || [],
    disponibilidade: profile.disponibilidade || [],
    fotoUrl: profile.fotoUrl || '',
    estilo: profile.estilo || 'acolhedor',
    abordagem: profile.abordagem || ''
  });

  const [newSpecialty, setNewSpecialty] = useState('');
  const [generatingBio, setGeneratingBio] = useState(false);

  const handleGenerateBio = async () => {
    if (!formData.especialidades || formData.especialidades.length === 0) {
      setError("Adicione pelo menos uma especialidade para gerar a biografia.");
      return;
    }

    setGeneratingBio(true);
    try {
      const bio = await generateTherapistBio(
        formData.especialidades,
        formData.estilo,
        formData.abordagem
      );
      if (bio) {
        setFormData({ ...formData, biografia: bio });
      }
    } catch (err) {
      console.error("Erro ao gerar biografia:", err);
      setError("Erro ao gerar sugestão de biografia.");
    } finally {
      setGeneratingBio(false);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setError(null);

    // Validation for price
    if (formData.preco === undefined || formData.preco <= 0) {
      setError("O preço por sessão deve ser um número positivo.");
      return;
    }

    const finalData = {
      ...formData,
      fotoUrl: formData.fotoUrl?.trim() || `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.currentUser.uid}`
    };

    setLoading(true);
    try {
      await updateUserProfile(auth.currentUser.uid, finalData);
      onUpdate({ ...profile, ...finalData });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      setError("Erro ao salvar as alterações. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.especialidades?.includes(newSpecialty.trim())) {
      setFormData({
        ...formData,
        especialidades: [...(formData.especialidades || []), newSpecialty.trim()]
      });
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (index: number) => {
    const updated = [...(formData.especialidades || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, especialidades: updated });
  };

  const updateAvailability = (day: string, slots: string[]) => {
    const current = [...(formData.disponibilidade || [])];
    const index = current.findIndex(a => a.day === day);
    if (index >= 0) {
      current[index] = { day, slots };
    } else {
      current.push({ day, slots });
    }
    setFormData({ ...formData, disponibilidade: current });
  };

  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const commonSlots = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-indigo">Configurações</p>
          <h2 className="text-4xl font-serif font-bold text-brand-text">Perfil Profissional</h2>
          <p className="text-brand-text/40 text-sm">Gerencie suas informações, especialidades e horários de atendimento.</p>
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-brand-red text-xs font-bold mt-2"
            >
              {error}
            </motion.p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className={cn(
            "flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-bold transition-all shadow-xl",
            success 
              ? "bg-brand-green text-white shadow-brand-green/20" 
              : "bg-brand-indigo text-white hover:scale-[1.02] active:scale-[0.98] shadow-brand-indigo/20"
          )}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : success ? (
            <><Save size={20} /> Salvo com Sucesso!</>
          ) : (
            <><Save size={20} /> Salvar Alterações</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Informações Básicas */}
        <div className="glass-card p-10 space-y-8 border-brand-text/5 rounded-[2.5rem]">
          <div className="flex items-center gap-4 border-b border-brand-text/5 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-indigo/10 text-brand-indigo flex items-center justify-center">
              <BookOpen size={24} />
            </div>
            <h3 className="text-xl font-serif font-bold text-brand-text">Dados Profissionais</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold text-brand-text/40 uppercase tracking-widest ml-1">Biografia Profissional</label>
                <button
                  onClick={handleGenerateBio}
                  disabled={generatingBio}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-brand-indigo hover:text-brand-indigo/80 transition-colors disabled:opacity-50"
                >
                  {generatingBio ? (
                    <div className="w-3 h-3 border border-brand-indigo/30 border-t-brand-indigo rounded-full animate-spin" />
                  ) : (
                    <Sparkles size={12} />
                  )}
                  Sugerir com IARA
                </button>
              </div>
              <textarea
                value={formData.biografia}
                onChange={(e) => setFormData({ ...formData, biografia: e.target.value })}
                className="w-full bg-brand-bg/50 border border-brand-text/5 rounded-2xl p-5 text-brand-text focus:border-brand-indigo/30 outline-none transition-all min-h-[160px] font-medium placeholder:text-brand-text/20 resize-none"
                placeholder="Conte um pouco sobre sua experiência e abordagem terapêutica..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-brand-text/40 uppercase tracking-widest ml-1">Estilo de Atendimento</label>
                <select
                  value={formData.estilo}
                  onChange={(e) => setFormData({ ...formData, estilo: e.target.value as any })}
                  className="w-full bg-brand-bg/50 border border-brand-text/5 rounded-2xl py-4 px-5 text-brand-text focus:border-brand-indigo/30 outline-none transition-all font-bold appearance-none"
                >
                  <option value="acolhedor">Acolhedor</option>
                  <option value="provocador">Provocador</option>
                  <option value="analitico">Analítico</option>
                  <option value="pratico">Prático</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-brand-text/40 uppercase tracking-widest ml-1">Abordagem Terapêutica</label>
                <input
                  type="text"
                  value={formData.abordagem}
                  onChange={(e) => setFormData({ ...formData, abordagem: e.target.value })}
                  className="w-full bg-brand-bg/50 border border-brand-text/5 rounded-2xl py-4 px-5 text-brand-text focus:border-brand-indigo/30 outline-none transition-all font-medium placeholder:text-brand-text/20"
                  placeholder="Ex: TCC, Psicanálise, Gestalt..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-brand-text/40 uppercase tracking-widest ml-1">Preço por Sessão (R$)</label>
                <div className="relative group">
                  <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-text/20 group-focus-within:text-brand-indigo transition-colors" size={18} />
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) => setFormData({ ...formData, preco: Number(e.target.value) })}
                    className={cn(
                      "w-full bg-brand-bg/50 border rounded-2xl py-4 pl-12 pr-5 text-brand-text focus:border-brand-indigo/30 outline-none transition-all font-bold",
                      formData.preco !== undefined && formData.preco <= 0 ? "border-brand-red/50" : "border-brand-text/5"
                    )}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-brand-text/40 uppercase tracking-widest ml-1">URL da Foto de Perfil</label>
                <input
                  type="text"
                  value={formData.fotoUrl}
                  onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })}
                  className="w-full bg-brand-bg/50 border border-brand-text/5 rounded-2xl py-4 px-5 text-brand-text focus:border-brand-indigo/30 outline-none transition-all font-medium placeholder:text-brand-text/20"
                  placeholder="https://exemplo.com/foto.jpg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Especialidades */}
        <div className="glass-card p-10 space-y-8 border-brand-text/5 rounded-[2.5rem]">
          <div className="flex items-center gap-4 border-b border-brand-text/5 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center">
              <Award size={24} />
            </div>
            <h3 className="text-xl font-serif font-bold text-brand-text">Especialidades</h3>
          </div>

          <div className="space-y-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                className="flex-1 bg-brand-bg/50 border border-brand-text/5 rounded-2xl py-4 px-5 text-brand-text focus:border-brand-indigo/30 outline-none transition-all font-medium placeholder:text-brand-text/20"
                placeholder="Ex: Ansiedade, TCC, Casal..."
              />
              <button
                onClick={addSpecialty}
                className="bg-brand-indigo text-white p-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-indigo/20"
              >
                <Plus size={24} />
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {formData.especialidades?.map((spec, idx) => (
                <motion.span 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  key={idx} 
                  className="flex items-center gap-3 bg-brand-indigo/10 text-brand-indigo px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest border border-brand-indigo/20 group hover:bg-brand-indigo hover:text-white transition-all cursor-default"
                >
                  {spec}
                  <button 
                    onClick={() => removeSpecialty(idx)} 
                    className="text-brand-indigo/40 group-hover:text-white/60 hover:text-white transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.span>
              ))}
              {(!formData.especialidades || formData.especialidades.length === 0) && (
                <div className="w-full py-10 text-center border-2 border-dashed border-brand-text/5 rounded-3xl">
                  <p className="text-sm text-brand-text/30 italic">Nenhuma especialidade adicionada.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Disponibilidade */}
        <div className="glass-card p-10 space-y-8 border-brand-text/5 rounded-[2.5rem] lg:col-span-2">
          <div className="flex items-center gap-4 border-b border-brand-text/5 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-indigo/10 text-brand-indigo flex items-center justify-center">
              <Clock size={24} />
            </div>
            <h3 className="text-xl font-serif font-bold text-brand-text">Agenda e Disponibilidade</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-8">
            {days.map((day) => {
              const dayAvailability = formData.disponibilidade?.find(a => a.day === day);
              const activeSlots = dayAvailability?.slots || [];

              return (
                <div key={day} className="space-y-5">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full", activeSlots.length > 0 ? "bg-brand-green" : "bg-brand-text/10")} />
                    <h4 className="text-[10px] font-bold text-brand-text/40 uppercase tracking-widest">{day}</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {commonSlots.map((slot) => {
                      const isActive = activeSlots.includes(slot);
                      return (
                        <button
                          key={slot}
                          onClick={() => {
                            const newSlots = isActive 
                              ? activeSlots.filter(s => s !== slot)
                              : [...activeSlots, slot].sort();
                            updateAvailability(day, newSlots);
                          }}
                          className={cn(
                            "text-[10px] font-bold px-3 py-2 rounded-xl transition-all border",
                            isActive 
                              ? "bg-brand-green/10 border-brand-green/30 text-brand-green shadow-lg shadow-brand-green/5" 
                              : "bg-brand-bg/50 border-brand-text/5 text-brand-text/30 hover:border-brand-indigo/30 hover:text-brand-indigo"
                          )}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
