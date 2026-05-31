import { motion } from 'motion/react';
import { Crosshair, ShieldCheck, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MatchmakingProps {
  onMatchFound: () => void;
  onCancel: () => void;
}

export default function Matchmaking({ onMatchFound, onCancel }: MatchmakingProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    
    // Simulate matchmaking time (between 3 to 6 seconds)
    const matchTimer = setTimeout(() => {
      onMatchFound();
    }, 3000 + Math.random() * 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(matchTimer);
    };
  }, [onMatchFound]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 blur-sm"></div>
      
      {/* Central Radar Animation */}
      <div className="relative flex items-center justify-center mb-12">
        <motion.div
          animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          className="absolute w-32 h-32 rounded-full border-2 border-primary/50"
        />
        <motion.div
          animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }}
          className="absolute w-32 h-32 rounded-full border-2 border-primary/50"
        />
        <div className="w-32 h-32 rounded-full bg-primary/20 border-2 border-primary shadow-[0_0_50px_rgba(255,85,0,0.4)] flex items-center justify-center backdrop-blur-sm z-10">
          <Crosshair className="w-12 h-12 text-primary" />
        </div>
      </div>

      <motion.h2 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-black mb-2 text-white"
      >
        MATCHMAKING
      </motion.h2>
      
      <p className="text-zinc-400 font-mono mb-8 text-lg">
        EST. TIME: 0:05 | ELAPSED: 0:0{elapsed}
      </p>

      {/* Fake Anti-Cheat visual element to fulfill prompt request */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-mono text-zinc-500 mb-12"
      >
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        Vanguard Anti-Cheat Secured Environment
      </motion.div>

      <button
        onClick={onCancel}
        className="px-8 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded text-sm font-bold uppercase tracking-wider transition-colors"
      >
        Cancel Matchmaking
      </button>

      {/* Player Count simulator */}
      <div className="absolute bottom-10 left-10 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-zinc-500 text-sm font-mono">
          <Zap className="w-4 h-4" /> Global servers optimized for low-end devices
        </div>
        <div className="flex items-center gap-2 text-zinc-500 text-sm font-mono">
          <Crosshair className="w-4 h-4" /> Cross-platform play enabled
        </div>
      </div>
    </div>
  );
}
