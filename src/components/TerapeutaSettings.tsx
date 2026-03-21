import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Clock, DollarSign, BookOpen, Award } from 'lucide-react';
import { UserProfile, Availability } from '../types';
import { updateUserProfile, auth } from '../services/authService';
import { cn } from '../lib/utils';

interface TerapeutaSettingsProps {
  profile: UserProfile;
  onUpdate: (updatedProfile: UserProfile) => void;
}

export const TerapeutaSettings: React.FC<TerapeutaSettingsProps> = ({ profile, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    nome: profile.nome || '',
    biografia: profile.biografia || '',
    preco: profile.preco || 0,
    especialidades: profile.especialidades || [],
    disponibilidade: profile.disponibilidade || [],
    fotoUrl: profile.fotoUrl || ''
  });

  const [newSpecialty, setNewSpecialty] = useState('');

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await updateUserProfile(auth.currentUser.uid, formData);
      onUpdate({ ...profile, ...formData });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brand-text">Configurações do Perfil</h2>
        <button
          onClick={handleSave}
          disabled={loading}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
            success ? "bg-brand-green text-brand-dark" : "bg-brand-indigo text-white hover:scale-[1.02]"
          )}
        >
          {loading ? "Salvando..." : success ? "Salvo!" : <><Save size={20} /> Salvar Alterações</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Informações Básicas */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <BookOpen className="text-brand-indigo" size={20} />
            <h3 className="font-bold text-brand-text">Informações Profissionais</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-text/40 uppercase tracking-widest mb-2">Biografia</label>
              <textarea
                value={formData.biografia}
                onChange={(e) => setFormData({ ...formData, biografia: e.target.value })}
                className="w-full bg-brand-dark/50 border border-white/10 rounded-xl p-4 text-brand-text focus:border-brand-indigo outline-none transition-all min-h-[120px]"
                placeholder="Conte um pouco sobre sua experiência e abordagem..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-text/40 uppercase tracking-widest mb-2">Preço por Sessão (R$)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text/40" size={16} />
                  <input
                    type="number"
                    value={formData.preco}
                    onChange={(e) => setFormData({ ...formData, preco: Number(e.target.value) })}
                    className="w-full bg-brand-dark/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-brand-text focus:border-brand-indigo outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-text/40 uppercase tracking-widest mb-2">URL da Foto</label>
                <input
                  type="text"
                  value={formData.fotoUrl}
                  onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })}
                  className="w-full bg-brand-dark/50 border border-white/10 rounded-xl py-3 px-4 text-brand-text focus:border-brand-indigo outline-none transition-all"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Especialidades */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Award className="text-brand-green" size={20} />
            <h3 className="font-bold text-brand-text">Especialidades</h3>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                className="flex-1 bg-brand-dark/50 border border-white/10 rounded-xl py-3 px-4 text-brand-text focus:border-brand-indigo outline-none transition-all"
                placeholder="Ex: Ansiedade, TCC, Casal..."
              />
              <button
                onClick={addSpecialty}
                className="bg-brand-green/20 text-brand-green p-3 rounded-xl hover:bg-brand-green/30 transition-all"
              >
                <Plus size={24} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.especialidades?.map((spec, idx) => (
                <span key={idx} className="flex items-center gap-2 bg-brand-indigo/20 text-brand-indigo px-3 py-1.5 rounded-full text-sm font-medium">
                  {spec}
                  <button onClick={() => removeSpecialty(idx)} className="hover:text-brand-red">
                    <Trash2 size={14} />
                  </button>
                </span>
              ))}
              {(!formData.especialidades || formData.especialidades.length === 0) && (
                <p className="text-sm text-brand-text/40 italic">Nenhuma especialidade adicionada.</p>
              )}
            </div>
          </div>
        </div>

        {/* Disponibilidade */}
        <div className="glass-card p-6 space-y-6 lg:col-span-2">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Clock className="text-brand-indigo" size={20} />
            <h3 className="font-bold text-brand-text">Agenda e Disponibilidade</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {days.map((day) => {
              const dayAvailability = formData.disponibilidade?.find(a => a.day === day);
              const activeSlots = dayAvailability?.slots || [];

              return (
                <div key={day} className="space-y-3">
                  <h4 className="text-sm font-bold text-brand-text/60">{day}</h4>
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
                            "text-[10px] font-bold px-2 py-1 rounded-lg transition-all border",
                            isActive 
                              ? "bg-brand-green/20 border-brand-green text-brand-green" 
                              : "bg-white/5 border-transparent text-brand-text/40 hover:border-white/20"
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
