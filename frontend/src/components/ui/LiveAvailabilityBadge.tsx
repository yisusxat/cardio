import { Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LiveAvailabilityBadge() {
  return (
    <Link to="/doctors">
      <div
        className="group inline-flex items-center gap-2.5 rounded-full border border-white/20 px-3.5 py-1.5 backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-white/10 cursor-pointer"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      >
        <div className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </div>
        <span className="text-xs font-semibold text-white/90 group-hover:text-white transition-colors">
          Doctores con agenda disponible hoy
        </span>
        <Activity className="h-3.5 w-3.5 text-primary-400" />
      </div>
    </Link>
  );
}
