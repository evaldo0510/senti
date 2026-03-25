import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X } from 'lucide-react';
import { userService } from '../services/userService';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  therapistId: string;
  therapistName: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  therapistId,
  therapistName,
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await userService.submitReview(appointmentId, therapistId, rating, comment);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setRating(0);
        setComment('');
      }, 2000);
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10"
          >
            <div className="p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 fill-current" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Obrigado!</h3>
                  <p className="text-slate-500 dark:text-slate-400">Sua avaliação ajuda a melhorar nossa comunidade.</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Como foi a sessão?</h3>
                    <p className="text-slate-500 dark:text-slate-400">Avalie seu atendimento com {therapistName}</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star
                            className={`w-10 h-10 ${
                              star <= (hoverRating || rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300 dark:text-slate-700'
                            } transition-colors`}
                          />
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Comentário (opcional)
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Conte-nos como foi sua experiência..."
                        className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-32"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={rating === 0 || isSubmitting}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/20 disabled:shadow-none"
                    >
                      {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
