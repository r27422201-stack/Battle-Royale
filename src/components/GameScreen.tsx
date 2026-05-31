import { useEffect, useRef, useState } from 'react';
import { Users, Crosshair, Clock, ShieldAlert, ChevronUp, ChevronsDown, Briefcase, PlusSquare, Map as MapIcon, Zap, Activity } from 'lucide-react';
import { GameEngine } from '../lib/GameEngine';

interface GameScreenProps {
  onGameOver: (placed: number, kills: number, survivedTime: number) => void;
}

export default function GameScreen({ onGameOver }: GameScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // HUD State synced from Engine
  const [hp, setHp] = useState(100);
  const [alive, setAlive] = useState(50);
  const [kills, setKills] = useState(0);
  const [zoneMsg, setZoneMsg] = useState('');

  useEffect(() => {
    if (!canvasRef.current) return;

    let lastZoneRad = 3000;

    const engine = new GameEngine(
      canvasRef.current,
      (newHp, newAlive, zoneRad, newKills, timeAlive) => {
        setHp(Math.max(0, newHp));
        setAlive(newAlive);
        setKills(newKills);
        // Extremely simple zone shrinking alert logic
        if (Math.abs(lastZoneRad - zoneRad) > 500) {
           setZoneMsg("SAFE ZONE IS SHRINKING!");
           setTimeout(() => setZoneMsg(""), 3000);
           lastZoneRad = zoneRad;
        }
      },
      (placed, kills, survivedTime) => {
        onGameOver(placed, kills, survivedTime);
      }
    );

    engine.start();

    return () => {
      engine.stop();
    };
  }, [onGameOver]);

  const getHpColor = () => {
    if (hp > 60) return 'bg-emerald-500';
    if (hp > 25) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden font-sans select-none" style={{ touchAction: 'none' }}>
      <canvas 
        ref={canvasRef} 
        className="block cursor-crosshair touch-none outline-none w-full h-full"
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* --- MOBILE HUD OVERLAYS (MATCHING SCREENSHOT STYLE) --- */}
      
      {/* Top Left: Logo / Info */}
      <div className="absolute top-4 left-4 pointer-events-none flex items-center z-10 opacity-80 md:opacity-100">
        <div className="text-xl md:text-2xl font-black italic tracking-tighter text-black drop-shadow-[1px_1px_0_white,-1px_-1px_0_white,1px_-1px_0_white,-1px_1px_0_white]">
          FREE FIRE
        </div>
        <div className="ml-1 px-1 bg-[#1ebbb4] text-black font-black text-[10px] skew-x-[-15deg] uppercase">
          MAX
        </div>
      </div>

      {/* Top Right: Minimap & Stats */}
      <div className="absolute top-4 right-4 flex gap-2 pointer-events-none z-10 items-start opacity-70 hover:opacity-100 transition-opacity">
         <div className="w-24 h-24 md:w-32 md:h-32 bg-black/40 border-2 border-white/20 rounded-lg overflow-hidden flex items-center justify-center relative backdrop-blur-sm">
            <MapIcon className="w-10 h-10 text-white/30" />
            <div className="absolute top-1/2 left-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-yellow-400 transform -translate-x-1/2 -translate-y-1/2 rotate-45 drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]"></div>
         </div>
         <div className="flex flex-col gap-1">
           <div className="bg-black/50 backdrop-blur w-24 px-2 py-1 flex items-center justify-between border border-white/10 rounded-sm">
              <Users className="w-3 h-3 text-white/70" />
              <span className="text-xs text-white font-mono font-bold">{alive}</span>
           </div>
           <div className="bg-black/50 backdrop-blur w-24 px-2 py-1 flex items-center justify-between border border-white/10 rounded-sm">
              <Crosshair className="w-3 h-3 text-white/70" />
              <span className="text-xs text-red-400 font-mono font-bold">{kills}</span>
           </div>
         </div>
      </div>

      {/* Global Alerts */}
      {zoneMsg && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-red-600/90 text-white px-8 py-2 md:py-3 rounded-full text-sm md:text-lg font-black italic tracking-widest animate-pulse flex items-center gap-3 shadow-[0_0_20px_rgba(220,38,38,0.8)] border border-red-400 z-20">
          <ShieldAlert className="w-5 h-5 md:w-6 md:h-6" /> {zoneMsg}
        </div>
      )}

      {/* Bottom Center: Health Bar (Accurate to Free Fire) */}
      <div className="absolute bottom-[20%] md:bottom-28 left-1/2 transform -translate-x-1/2 flex items-center gap-2 pointer-events-none w-64 md:w-80 z-20">
         <div className="text-white font-black text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,1)] tracking-widest italic leading-none mt-1">HP</div>
         <div className="w-full flex flex-col items-center">
             <div className="text-white text-[10px] font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,1)] mb-0.5">{Math.ceil(hp)}/100</div>
             <div className="w-full h-3 md:h-4 bg-zinc-900/80 border border-white/30 rounded-full overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                <div 
                  className="h-full bg-[#ccff00] transition-all duration-200" 
                  style={{ width: `${Math.max(0, (hp / 100) * 100)}%` }}
                ></div>
             </div>
         </div>
      </div>

      {/* Overlay Promotional Banner (New Character: RAY) from Image */}
      <div className="absolute bottom-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-r from-blue-900/90 via-blue-800/60 to-transparent pointer-events-none z-10 flex flex-col justify-end pb-3 px-4 md:px-8 border-t border-blue-400/30 overflow-hidden">
          {/* Decorative aura overlay */}
          <div className="absolute bottom-0 right-0 w-64 md:w-96 h-64 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1ebbb4]/30 to-transparent opacity-80 blur-2xl pointer-events-none mix-blend-screen"></div>
          
          <h1 className="text-[28px] md:text-5xl font-sans font-black flex items-center gap-2 drop-shadow-md tracking-tight w-full leading-none z-10">
              <span className="text-blue-100 uppercase opacity-90 drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]">NEW CHARACTER:</span> 
              <span className="text-blue-300 drop-shadow-[0_0_15px_rgba(147,197,253,0.8)]">RAY</span>
          </h1>
          <div className="bg-white/20 backdrop-blur w-fit px-3 py-1 mt-1 rounded-sm text-[8px] md:text-[10px] font-bold text-white tracking-widest uppercase border border-white/10 z-10 shadow-sm drop-shadow-sm">
              MARKS TARGETS AND DOWNS THEM WITH EASE
          </div>
      </div>

      {/* Bottom Right: Action Cluster (Visually matches screenshot) */}
      <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 pointer-events-none z-20">
         <div className="relative w-48 h-48 md:w-64 md:h-64 opacity-80 hover:opacity-100 transition-opacity">
             {/* Character Skill Button (Glowing Yellow) */}
             <div className="absolute top-4 left-2 md:top-8 md:left-4 w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-[#ccff00] bg-black/40 flex items-center justify-center shadow-[0_0_20px_rgba(204,255,0,0.6)] backdrop-blur text-[#ccff00] transition-transform">
                 <Activity className="w-6 h-6 md:w-8 md:h-8 drop-shadow-[0_0_5px_rgba(204,255,0,1)]" />
                 <div className="absolute inset-[2px] rounded-full border border-[#ccff00]/60 animate-pulse"></div>
             </div>
             
             {/* Primary Fire Button */}
             <div className="absolute bottom-0 right-0 w-16 h-16 md:w-24 md:h-24 rounded-full border border-white/40 bg-white/20 flex items-center justify-center backdrop-blur text-white/80 shadow-lg">
                 <Crosshair className="w-8 h-8 md:w-10 md:h-10 opacity-70" />
             </div>

             {/* Jump button */}
             <div className="absolute bottom-20 right-2 w-10 h-10 md:w-14 md:h-14 rounded-full border border-white/30 bg-white/10 flex items-center justify-center backdrop-blur text-white/80 shadow-md">
                 <ChevronUp className="w-5 h-5 md:w-6 md:h-6 opacity-70" />
             </div>

             {/* Crouch button */}
             <div className="absolute bottom-2 right-20 w-10 h-10 md:w-14 md:h-14 rounded-full border border-white/30 bg-white/10 flex items-center justify-center backdrop-blur text-white/80 shadow-md">
                 <ChevronsDown className="w-5 h-5 md:w-6 md:h-6 opacity-70" />
             </div>
         </div>
      </div>

    </div>
  );
}
