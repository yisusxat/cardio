import { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { useUIStore } from '../../stores/ui.store';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName: string;
  onSubmitted: () => void;
}

export default function ReviewModal({ isOpen, onClose, doctorName, onSubmitted }: ReviewModalProps) {
  const toast = useUIStore();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      toast.success('¡Muchas gracias por tu reseña! Ha sido enviada correctamente.');
      onSubmitted();
      onClose();
    }, 600);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Calificar consulta con Dr(a). ${doctorName}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-xs text-neutral-400">
          Tu opinión nos ayuda a mantener los más altos estándares de calidad en atención cardiológica.
        </p>

        {/* Stars */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-neutral-50 p-4 border border-neutral-100">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
            Valoración General
          </span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-neutral-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="mt-2 text-xs font-bold text-neutral-700">
            {rating === 5 ? '¡Excelente atención!' : rating === 4 ? 'Muy Buena' : rating === 3 ? 'Aceptable' : 'Regular'}
          </span>
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-neutral-700">
            <MessageSquare className="h-3.5 w-3.5 text-neutral-400" /> Tu comentario u observación:
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe tu experiencia con el médico..."
            className="input-field resize-none text-xs"
            required
          />
        </div>

        <div className="mt-2 flex justify-end gap-2 border-t border-neutral-100 pt-3">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Enviar Reseña
          </Button>
        </div>
      </form>
    </Modal>
  );
}
