import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Check, ExternalLink } from 'lucide-react';

export interface NewsCardProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  date?: string;
  url?: string;
  loading?: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  title,
  description,
  imageUrl,
  date,
  url,
  loading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
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
      whileHover={{ y: -12, scale: 1.03 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        opacity: { duration: 0.4 }
      }}
      className="glass-card group overflow-hidden rounded-2xl flex flex-col h-full transition-all hover:shadow-2xl hover:shadow-brand-green/20 border border-white/10 relative"
    >
      {/* Share Button */}
      {url && (
        <button 
          onClick={handleShare}
          className="absolute top-4 right-4 z-20 p-2 bg-white/20 backdrop-blur-md rounded-full text-brand-text hover:bg-brand-green hover:text-white transition-all duration-300 shadow-lg"
          title="Compartilhar"
        >
          {copied ? <Check size={16} /> : <Share2 size={16} />}
        </button>
      )}

      {imageUrl && (
        <div className="w-full h-48 overflow-hidden relative bg-brand-text/5">
          {!imageLoaded && (
            <div className="absolute inset-0 animate-shimmer" />
          )}
          <img 
            src={imageUrl} 
            alt={title} 
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      <div className={`p-6 flex-1 flex flex-col ${!imageUrl ? 'justify-center min-h-[250px]' : ''}`}>
        {date && (
          <span className={`font-bold uppercase tracking-widest text-brand-green mb-3 block ${!imageUrl ? 'text-sm' : 'text-[10px]'}`}>
            {date}
          </span>
        )}
        
        {title && (
          <h3 className={`font-bold text-brand-text mb-4 leading-tight group-hover:text-brand-green transition-colors duration-300 ${!imageUrl ? 'text-2xl' : 'text-lg line-clamp-2'}`}>
            {title}
          </h3>
        )}

        <div className="relative flex-1 flex flex-col">
          {description && (
            <p className={`text-brand-text/70 transition-all duration-300 ${!imageUrl ? 'text-base' : 'text-sm'} ${isExpanded ? '' : 'line-clamp-3'}`}>
              {description}
            </p>
          )}

          {isTruncated && (
            <div className="mt-4 flex items-center gap-4">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
              >
                {isExpanded ? 'Ver menos' : 'Leia mais'}
              </button>
              
              {url && !isExpanded && (
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] text-brand-text/40 hover:text-brand-green flex items-center gap-1 transition-colors"
                >
                  <ExternalLink size={10} /> Notícia completa
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
