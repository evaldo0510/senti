import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Check, ExternalLink, UserPlus, Copy, Image as ImageIcon } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface NewsCardProps {
  id: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  image?: string; // Alias for imageUrl
  date?: string;
  url?: string;
  loading?: boolean;
  therapistName?: string;
  therapistId?: string;
  isOnline?: boolean;
  onConnect?: (therapistId: string) => void;
  onViewProfile?: (therapistId: string) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  id,
  title,
  description,
  imageUrl,
  image,
  date,
  url,
  loading = false,
  therapistName,
  therapistId,
  isOnline,
  onConnect,
  onViewProfile,
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  const finalImageUrl = imageUrl || image;

  const handleConnect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (therapistId) {
      if (onConnect) {
        onConnect(therapistId);
      } else {
        navigate(`/agendamento/${therapistId}`);
      }
    }
  };

  const handleViewProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (therapistId) {
      if (onViewProfile) {
        onViewProfile(therapistId);
      } else {
        navigate(`/terapeuta-perfil/${therapistId}`);
      }
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!url) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Notícia',
          text: description || '',
          url: url,
        });
      } catch (err) {
        // Se o usuário cancelar ou houver erro, não fazemos nada ou tentamos copiar
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    if (url) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    copyToClipboard();
  };

  let formattedDate = date;
  if (date) {
    const parsedDate = new Date(date);
    if (isValid(parsedDate)) {
      formattedDate = format(parsedDate, "EEE, dd MMM", { locale: ptBR });
      formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    }
  }

  if (loading) {
    return (
      <div className="glass-card overflow-hidden rounded-2xl flex flex-col h-full">
        {/* Shimmer Image */}
        <div className="w-full h-48 animate-shimmer"></div>
        
        <div className="p-5 space-y-4 flex-1 flex flex-col">
          {/* Shimmer Date */}
          <div className="h-3 w-24 animate-shimmer rounded-full"></div>
          
          {/* Shimmer Title */}
          <div className="space-y-2">
            <div className="h-5 w-full animate-shimmer rounded-full"></div>
            <div className="h-5 w-4/5 animate-shimmer rounded-full"></div>
          </div>
          
          {/* Shimmer Description */}
          <div className="space-y-2 mt-auto pt-4">
            <div className="h-3 w-full animate-shimmer rounded-full"></div>
            <div className="h-3 w-full animate-shimmer rounded-full"></div>
            <div className="h-3 w-2/3 animate-shimmer rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  const isTruncated = description && description.length > 120;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        opacity: { duration: 0.3 }
      }}
      className="glass-card group overflow-hidden rounded-2xl flex flex-col h-full transition-shadow duration-300 hover:shadow-xl hover:shadow-emerald-500/10 border border-white/10 relative"
    >
      {/* Action Buttons */}
      {url && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button 
            onClick={handleCopy}
            className={`p-2 backdrop-blur-md rounded-full transition-all duration-300 shadow-lg flex items-center justify-center ${
              copied 
                ? 'bg-emerald-500 text-white scale-110' 
                : 'bg-white/20 text-brand-text hover:bg-emerald-500 hover:text-white'
            }`}
            title="Copiar Link"
          >
            {copied ? <Check size={16} className="animate-in zoom-in duration-300" /> : <Copy size={16} />}
          </button>
          <button 
            onClick={handleShare}
            className="p-2 backdrop-blur-md rounded-full transition-all duration-300 shadow-lg flex items-center justify-center bg-white/20 text-brand-text hover:bg-emerald-500 hover:text-white"
            title="Compartilhar"
          >
            <Share2 size={16} />
          </button>
        </div>
      )}

      {finalImageUrl && (
        <div className="w-full h-48 overflow-hidden relative bg-slate-200 dark:bg-slate-800">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center animate-pulse">
              <ImageIcon className="w-10 h-10 text-slate-400 dark:text-slate-600" />
            </div>
          )}
          <img 
            src={finalImageUrl} 
            alt={title} 
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      <div className={`p-6 flex-1 flex flex-col ${!finalImageUrl ? 'justify-center min-h-[250px]' : ''}`}>
        {formattedDate && (
          <span className={`font-bold uppercase tracking-widest text-emerald-500 mb-3 block ${!finalImageUrl ? 'text-sm' : 'text-[10px]'}`}>
            {formattedDate}
          </span>
        )}
        
        {title && (
          <h3 className={`font-bold text-brand-text mb-4 leading-tight group-hover:text-emerald-400 transition-colors duration-300 ${!finalImageUrl ? 'text-2xl' : 'text-lg line-clamp-2'}`}>
            {title}
          </h3>
        )}

        {/* Therapist Info */}
        {therapistName && (
          <div className="flex flex-col gap-3 mb-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                  {therapistName[0]}
                </div>
                {isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  {therapistName}
                  {isOnline && <span className="text-[9px] text-emerald-500 uppercase tracking-tighter">Online</span>}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Especialista SENTI</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleViewProfile}
                className="flex-1 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-bold transition-all border border-slate-200 dark:border-white/5"
              >
                Ver Perfil
              </button>
              <button 
                onClick={handleConnect}
                className="flex-[2] py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 group/btn"
              >
                <UserPlus size={12} className="group-hover/btn:scale-110 transition-transform" />
                Conectar
              </button>
            </div>
          </div>
        )}

        <div className="relative flex-1 flex flex-col">
          {description && (
            <p className={`text-brand-text/70 transition-all duration-300 ${!finalImageUrl ? 'text-base' : 'text-sm'} ${isExpanded ? '' : 'line-clamp-3'}`}>
              {description}
            </p>
          )}

          {isTruncated && (
            <div className="mt-4 flex items-center gap-4">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1"
              >
                {isExpanded ? 'Ver menos' : 'Leia mais'}
              </button>
              
              {url && !isExpanded && (
                <div className="relative group/tooltip">
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] text-brand-text/40 hover:text-emerald-500 flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink size={10} /> Notícia completa
                  </a>
                  <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-slate-900 text-white text-[8px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-white/10 shadow-xl">
                    {url}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
