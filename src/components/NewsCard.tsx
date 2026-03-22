import React from 'react';
import { motion } from 'framer-motion';

export interface NewsCardProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  date?: string;
  loading?: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  title,
  description,
  imageUrl,
  date,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="glass-card overflow-hidden rounded-2xl flex flex-col h-full animate-pulse">
        {/* Skeleton Image */}
        <div className="w-full h-48 bg-brand-slate/50"></div>
        
        <div className="p-5 space-y-4 flex-1 flex flex-col">
          {/* Skeleton Date */}
          <div className="h-3 w-24 bg-brand-slate/50 rounded-full"></div>
          
          {/* Skeleton Title */}
          <div className="space-y-2">
            <div className="h-5 w-full bg-brand-slate/50 rounded-full"></div>
            <div className="h-5 w-4/5 bg-brand-slate/50 rounded-full"></div>
          </div>
          
          {/* Skeleton Description */}
          <div className="space-y-2 mt-auto pt-4">
            <div className="h-3 w-full bg-brand-slate/50 rounded-full"></div>
            <div className="h-3 w-full bg-brand-slate/50 rounded-full"></div>
            <div className="h-3 w-2/3 bg-brand-slate/50 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="glass-card overflow-hidden rounded-2xl flex flex-col h-full transition-all hover:shadow-2xl hover:shadow-brand-green/10 border border-white/5"
    >
      {imageUrl && (
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col">
        {date && (
          <span className="text-xs font-bold uppercase tracking-widest text-brand-green mb-2 block">
            {date}
          </span>
        )}
        {title && (
          <h3 className="text-lg font-bold text-brand-text mb-2 line-clamp-2">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-brand-text/70 line-clamp-3 mt-auto">
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
};
