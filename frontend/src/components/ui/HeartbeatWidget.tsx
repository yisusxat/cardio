import { useEffect, useState } from 'react';

const HEALTH_QUOTES = [
  { text: 'Tu corazón late 100,000 veces al día.', sub: 'Merece la mejor atención.' },
  { text: 'Prevenir es el mayor acto de amor.', sub: 'Cuida tu salud hoy.' },
  { text: 'Cada latido importa.', sub: 'Estamos aquí para protegerlos.' },
  { text: 'La salud es el verdadero lujo.', sub: 'Inviértela con los mejores.' },
];

export default function HeartbeatWidget() {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const [beat, setBeat] = useState(false);

  // Cycle quotes every 4 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setQuoteIdx((i) => (i + 1) % HEALTH_QUOTES.length);
        setFade(true);
      }, 400);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  // Trigger beat every ~850ms (70 bpm)
  useEffect(() => {
    const id = setInterval(() => {
      setBeat(true);
      setTimeout(() => setBeat(false), 200);
    }, 850);
    return () => clearInterval(id);
  }, []);

  const q = HEALTH_QUOTES[quoteIdx];

  return (
    <div
      className="relative w-full max-w-xs rounded-3xl border border-white/10 p-6 text-white"
      style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 32px 64px -16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      {/* Top row: BPM badge + label */}
      <div className="mb-5 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-white/40">
          Monitor Cardíaco
        </span>
        <div className="flex items-center gap-1.5 rounded-full bg-primary-500/20 border border-primary-500/30 px-3 py-1">
          <span
            className="h-1.5 w-1.5 rounded-full bg-primary-400 transition-all duration-100"
            style={{ opacity: beat ? 1 : 0.4, transform: beat ? 'scale(1.5)' : 'scale(1)' }}
          />
          <span className="text-xs font-bold text-primary-300">72 BPM</span>
        </div>
      </div>

      {/* Animated heart */}
      <div className="flex justify-center mb-4">
        <div className="relative flex items-center justify-center">
          {/* Pulse rings */}
          <div
            className="absolute rounded-full border border-primary-500/20"
            style={{
              width: beat ? '90px' : '70px',
              height: beat ? '90px' : '70px',
              transition: 'all 0.15s ease-out',
            }}
          />
          <div
            className="absolute rounded-full border border-primary-500/10"
            style={{
              width: beat ? '110px' : '80px',
              height: beat ? '110px' : '80px',
              transition: 'all 0.2s ease-out',
            }}
          />

          {/* Heart SVG */}
          <svg
            viewBox="0 0 100 90"
            style={{
              width: '52px',
              height: '52px',
              transform: beat ? 'scale(1.18)' : 'scale(1)',
              transition: 'transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)',
              filter: beat
                ? 'drop-shadow(0 0 16px rgba(225,29,72,0.8))'
                : 'drop-shadow(0 0 6px rgba(225,29,72,0.4))',
            }}
          >
            <defs>
              <linearGradient id="heartGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#be123c" />
              </linearGradient>
            </defs>
            <path
              d="M50 85 C50 85 5 55 5 28 C5 13 18 3 32 8 C40 11 46 17 50 22 C54 17 60 11 68 8 C82 3 95 13 95 28 C95 55 50 85 50 85Z"
              fill="url(#heartGrad)"
            />
          </svg>
        </div>
      </div>

      {/* ECG Line */}
      <div className="mb-5 overflow-hidden rounded-xl bg-black/30 px-3 py-2">
        <svg
          viewBox="0 0 280 44"
          className="w-full"
          style={{ height: '36px' }}
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[11, 22, 33].map((y) => (
            <line key={y} x1="0" y1={y} x2="280" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          ))}
          {[56, 112, 168, 224].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="44" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          ))}

          {/* ECG path — repeated pattern */}
          <path
            d="M-280,22 L-262,22 L-258,18 L-254,22 L-246,22 L-244,22 L-241,4 L-238,40 L-235,22 L-228,22 L-222,16 L-218,22 L-196,22
               M0,22 L18,22 L22,18 L26,22 L34,22 L36,22 L39,4 L42,40 L45,22 L52,22 L58,16 L62,22 L84,22
               M140,22 L158,22 L162,18 L166,22 L174,22 L176,22 L179,4 L182,40 L185,22 L192,22 L198,16 L202,22 L224,22
               M280,22 L298,22"
            stroke="#f43f5e"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              animation: 'ecgScroll 2.4s linear infinite',
            }}
          />

          {/* Glow duplicate */}
          <path
            d="M-280,22 L-262,22 L-258,18 L-254,22 L-246,22 L-244,22 L-241,4 L-238,40 L-235,22 L-228,22 L-222,16 L-218,22 L-196,22
               M0,22 L18,22 L22,18 L26,22 L34,22 L36,22 L39,4 L42,40 L45,22 L52,22 L58,16 L62,22 L84,22
               M140,22 L158,22 L162,18 L166,22 L174,22 L176,22 L179,4 L182,40 L185,22 L192,22 L198,16 L202,22 L224,22
               M280,22 L298,22"
            stroke="#f43f5e"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            opacity="0.15"
            style={{
              animation: 'ecgScroll 2.4s linear infinite',
            }}
          />
        </svg>
      </div>

      {/* Rotating quote */}
      <div
        style={{
          opacity: fade ? 1 : 0,
          transform: fade ? 'translateY(0)' : 'translateY(4px)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
        }}
      >
        <p className="text-sm font-semibold text-white leading-snug">{q.text}</p>
        <p className="mt-0.5 text-xs text-white/40">{q.sub}</p>
      </div>

      {/* Bottom dots indicator */}
      <div className="mt-4 flex items-center gap-1.5">
        {HEALTH_QUOTES.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === quoteIdx ? '16px' : '5px',
              height: '5px',
              background: i === quoteIdx ? '#f43f5e' : 'rgba(255,255,255,0.2)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
