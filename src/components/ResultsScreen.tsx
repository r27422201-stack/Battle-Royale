import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Clock, Star, ArrowRight } from 'lucide-react';
import { GameResults } from '../types';

interface ResultsScreenProps {
  results: GameResults;
  onReturnLobby: () => void;
}

export default function ResultsScreen({ results, onReturnLobby }: ResultsScreenProps) {
  const isWinner = results.placed === 1;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background FX */}
      <div className={`absolute inset-0 opacity-20 ${isWinner ? 'bg-amber-600' : 'bg-red-900'} blur-3xl rounded-full scale-150`}></div>
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="relative z-10 flex flex-col items-center text-center p-12 max-w-2xl bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-3xl shadow-2xl"
      >
        <h1 className={`text-6xl md:text-8xl font-black italic tracking-tighter mb-4 ${isWinner ? 'text-amber-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.6)]' : 'text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.6)]'}`}>
          {isWinner ? 'BOOYAH!' : 'ELIMINATED'}
        </h1>
        
        <h2 className="text-2xl font-bold text-zinc-300 mb-12 tracking-widest uppercase">
          Match Results
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
          <StatBox icon={<Trophy className="text-amber-400" />} label="Rank" value={`#${results.placed}`} delay={0.2} />
          <StatBox icon={<Crosshair className="text-red-400" />} label="Kills" value={results.kills} delay={0.4} />
          <StatBox icon={<Clock className="text-blue-400" />} label="Survived" value={`${Math.floor(results.survivedTime / 60)}m ${results.survivedTime % 60}s`} delay={0.6} />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex items-center gap-4 bg-zinc-950/50 px-6 py-4 rounded-xl border border-zinc-800 mb-12 w-full justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-amber-500" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-zinc-400">XP Earned</div>
              <div className="text-2xl font-black text-white">+{results.xpEarned} XP</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-500 mb-1 font-mono">Next Level</div>
            <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 w-[70%]" />
            </div>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          onClick={onReturnLobby}
          className="group relative flex items-center justify-center gap-3 w-full bg-white text-black font-black text-xl py-5 rounded-xl hover:bg-zinc-200 transition-colors uppercase tracking-widest"
        >
          Return to Lobby
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </motion.div>
    </div>
  );
}

function StatBox({ icon, label, value, delay }: { icon: React.ReactNode, label: string, value: string | number, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center gap-2"
    >
      <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center shadow-lg mb-2">
        {icon}
      </div>
      <div className="text-sm font-bold text-zinc-500 tracking-wider uppercase">{label}</div>
      <div className="text-3xl font-black text-white">{value}</div>
    </motion.div>
  );
}

function Crosshair({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/>
    </svg>
  );
}
