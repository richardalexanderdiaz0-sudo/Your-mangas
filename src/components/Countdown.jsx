import { formatDistanceToNow, isFuture } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Countdown({ scheduledAt }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const date = new Date(scheduledAt);
      if (isFuture(date)) {
        setTimeLeft(formatDistanceToNow(date, { locale: es }));
      } else {
        setTimeLeft('¡Ya disponible!');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Actualiza cada minuto
    return () => clearInterval(interval);
  }, [scheduledAt]);

  return (
    <div className="flex items-center text-xs font-semibold text-pink-600 bg-pink-100 px-2 py-1 rounded-full w-fit mt-1">
      <Clock className="w-3 h-3 mr-1" />
      {timeLeft}
    </div>
  );
}
