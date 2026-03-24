import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Send } from 'lucide-react';

export function FeedbackModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setRating(0);
        setComment('');
        onClose();
      }, 2000);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-white/10 relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-6 h-6" />
          </button>
          
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-8 h-8 fill-current" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Obrigado pelo feedback!</h3>
              <p className="text-slate-500 dark:text-slate-400">Sua opinião nos ajuda a melhorar a SENTI todos os dias.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Como está sendo sua experiência?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Avalie o aplicativo e deixe sua sugestão.</p>
              </div>

              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-2 transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-700'}`}
                  >
                    <Star className={`w-8 h-8 ${rating >= star ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Conte-nos o que você achou ou o que podemos melhorar..."
                className="w-full h-32 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />

              <button
                type="submit"
                disabled={rating === 0}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Enviar Feedback
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
