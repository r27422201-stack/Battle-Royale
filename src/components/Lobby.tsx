import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Crosshair, Map, ShoppingCart, Settings, Users, Star, Gift, Crown, Info, ChevronRight, ChevronLeft } from 'lucide-react';
import { useGameStore, CHARACTERS } from '../store';

interface LobbyProps {
  onPlay: () => void;
}

export default function Lobby({ onPlay }: LobbyProps) {
  const { selectedCharacter, setSelectedCharacter } = useGameStore();
  const [charIdx, setCharIdx] = useState(CHARACTERS.findIndex(c => c.id === selectedCharacter.id));

  const nextChar = () => {
    const nextIdx = (charIdx + 1) % CHARACTERS.length;
    setCharIdx(nextIdx);
    setSelectedCharacter(CHARACTERS[nextIdx]);
  };

  const prevChar = () => {
    const prevIdx = (charIdx - 1 + CHARACTERS.length) % CHARACTERS.length;
    setCharIdx(prevIdx);
    setSelectedCharacter(CHARACTERS[prevIdx]);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col relative overflow-hidden font-sans select-none">
      {/* Background Graphic */}
      <div className="absolute inset-0 bg-blue-900/20">
        {/* Soft 3D lighting effect background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/30 via-black to-black opacity-80 pointer-events-none"></div>
      </div>
      
      {/* Top Navigation / Header */}
      <header className="relative z-10 flex justify-between items-center p-4 md:p-6 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer">
            <div className="w-14 h-14 bg-zinc-800 rounded-full border-2 border-[#1ebbb4] flex items-center justify-center overflow-hidden">
              <img src={'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=3f3f46'} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#1ebbb4] text-black text-[10px] font-black px-2 py-0.5 rounded-sm border border-black">
              LV.42
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none">AGENT_X</h1>
            <div className="flex items-center gap-3 text-xs font-bold mt-1 text-zinc-400">
              <span className="flex items-center gap-1 text-gold"><Star className="w-3 h-3 fill-gold" /> 2,450 DP</span>
              <span className="flex items-center gap-1 text-blue-400"><Crown className="w-3 h-3 fill-blue-400" /> Diamond II</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <IconButton icon={<Gift />} label="Events" badge="3" />
          <IconButton icon={<Users />} label="Friends" badge="1" />
          <IconButton icon={<Settings />} label="Settings" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-between p-4 md:p-8">
        
        {/* Middle Area: Character Showcase & Abilities */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCharacter.id}
              initial={{ opacity: 0, scale: 0.8, x: 100 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -100 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="flex flex-col items-center"
            >
              {/* Pseudo 3D Character Avatar */}
              <div 
                className="w-48 h-64 md:w-64 md:h-80 bg-zinc-900 border-2 rounded-2xl relative shadow-2xl flex flex-col items-center justify-end overflow-hidden pointer-events-auto"
                style={{ borderColor: selectedCharacter.color }}
              >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-30" style={{ backgroundColor: selectedCharacter.color }}>
                     <Users className="w-32 h-32 text-white" />
                  </div>
                  
                  <div className="relative z-20 text-center pb-4 px-4 w-full">
                     <h2 className="text-3xl font-black italic tracking-tighter drop-shadow-md" style={{ color: selectedCharacter.color }}>
                       {selectedCharacter.name}
                     </h2>
                     <div className="bg-black/50 backdrop-blur border border-white/20 p-2 mt-2 rounded">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{selectedCharacter.abilityName}</div>
                        <div className="text-xs text-white mt-1 leading-tight">{selectedCharacter.abilityDesc}</div>
                     </div>
                  </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Character selection arrows */}
          <div className="absolute left-[5%] md:left-[20%] pointer-events-auto cursor-pointer p-4 bg-black/40 hover:bg-black/60 rounded-full border border-white/10" onClick={prevChar}>
             <ChevronLeft className="w-8 h-8 text-white" />
          </div>
          <div className="absolute right-[5%] md:right-[20%] pointer-events-auto cursor-pointer p-4 bg-black/40 hover:bg-black/60 rounded-full border border-white/10" onClick={nextChar}>
             <ChevronRight className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Center / Bottom: Play Button */}
        <div className="flex-1 flex items-end justify-center lg:justify-end mb-8 relative z-20">
          <div className="flex w-full md:w-auto items-end justify-center md:justify-between md:gap-12">
             
            {/* Mode Selector */}
            <div className="bg-black/80 backdrop-blur-md border border-zinc-700/50 rounded-2xl p-2 w-48 hidden md:block">
              <div className="relative h-24 rounded-xl overflow-hidden mb-2 group cursor-pointer border border-zinc-800 hover:border-primary transition-colors">
                 <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                 <div className="absolute bottom-2 left-2 right-2">
                    <div className="text-xs font-bold text-[#1ebbb4] flex items-center gap-1 mb-0.5"><Map className="w-3 h-3" /> ALPHA (3D)</div>
                    <div className="text-sm font-black italic">BATTLE ROYALE</div>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold text-zinc-400">
                 <div className="bg-zinc-900 py-1.5 rounded cursor-pointer hover:text-white hover:bg-zinc-800">SQUAD</div>
                 <div className="bg-[#ccff00] text-black py-1.5 rounded cursor-pointer">SOLO</div>
              </div>
            </div>

            {/* Huge Play Button */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPlay}
              className="relative group self-center md:self-end touch-manipulation"
            >
              <div className="absolute -inset-2 bg-[#ccff00] blur-xl opacity-30 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative bg-gold hover:bg-[#ffb000] text-black pt-4 pb-4 px-16 md:px-20 rounded-xl font-black text-3xl md:text-4xl italic tracking-tighter border-b-4 border-[#b37c00] flex items-center gap-3 shadow-2xl">
                <Crosshair className="w-8 h-8 md:w-8 md:h-8" />
                START
              </div>
            </motion.button>
          </div>
        </div>
        
        {/* Bottom Nav */}
        <div className="flex justify-center md:gap-4 gap-2 w-full max-w-2xl mx-auto backdrop-blur-xl bg-black/40 border border-zinc-800/50 p-2 rounded-2xl relative z-20">
          <BottomNavItem icon={<ShoppingCart />} label="STORE" />
          <BottomNavItem icon={<Shield />} label="LOADOUT" />
          <BottomNavItem icon={<Users />} label="CHARACTER" active />
          <BottomNavItem icon={<Star />} label="ROYALE" />
        </div>

      </main>
    </div>
  );
}

function IconButton({ icon, label, badge }: { icon: React.ReactNode, label: string, badge?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 group cursor-pointer relative">
      <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-zinc-800 transition-colors">
        {icon}
      </div>
      {badge && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </div>
  );
}

function BottomNavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl cursor-pointer transition-colors ${active ? 'bg-zinc-800 text-primary' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'}`}>
      {icon}
      <span className="text-[10px] font-bold tracking-widest uppercase">{label}</span>
    </div>
  );
}

function MissionItem({ title, progress, completed }: { title: string, progress: string, completed: boolean }) {
  return (
    <li className="flex items-center justify-between group">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-6 rounded-full ${completed ? 'bg-primary' : 'bg-zinc-700'}`}></div>
        <span className={`text-xs font-medium ${completed ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>{title}</span>
      </div>
      <span className={`text-[10px] font-mono font-bold ${completed ? 'text-primary' : 'text-zinc-500'}`}>{progress}</span>
    </li>
  );
}

function TargetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
  );
}
