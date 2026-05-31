import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, PerspectiveCamera, Box, Sphere, Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { Users, Crosshair, Clock, ShieldAlert, ChevronUp, ChevronsDown, Activity, Map as MapIcon } from 'lucide-react';

const MAP_SIZE = 100;

// Third Person Camera Controller
function CameraController({ targetPosition }: { targetPosition: THREE.Vector3 }) {
  useFrame(({ camera }) => {
    // Basic follow camera: behind and above
    const idealOffset = new THREE.Vector3(0, 15, 20);
    idealOffset.add(targetPosition);
    camera.position.lerp(idealOffset, 0.1);
    camera.lookAt(targetPosition.x, targetPosition.y + 2, targetPosition.z);
  });
  return null;
}

// 3D Player Character
function Player({ onGameOver }: { onGameOver: (placed: number, kills: number, survivedTime: number) => void }) {
  const { selectedCharacter, joystickMove, joystickAim, setHud, actionStates } = useGameStore();
  const playerRef = useRef<THREE.Group>(null);
  
  // Physics states
  const position = new THREE.Vector3(0, 1, 0);
  const velocity = new THREE.Vector3(0, 0, 0);
  
  // Handle abilities
  const [abilityActive, setAbilityActive] = useState(false);
  const [health, setHealth] = useState(100);
  const startTime = useRef(Date.now());
  
  useEffect(() => {
    if (actionStates.ability) {
       setAbilityActive(true);
       if (selectedCharacter.id === 'alok') setHealth(h => Math.min(100, h + 20));
       setTimeout(() => setAbilityActive(false), 3000);
    }
  }, [actionStates.ability, selectedCharacter]);

  // Handle shooting
  const [bullets, setBullets] = useState<{id:number, p: THREE.Vector3, d: THREE.Vector3}[]>([]);
  let bulletId = 0;

  useFrame((state, delta) => {
    if (!playerRef.current) return;
    
    // Simulate game over time
    if (health <= 0) {
       onGameOver(Math.floor(Math.random() * 50) + 2, 2, Math.floor((Date.now() - startTime.current) / 1000));
    } else {
       if (Math.random() < 0.01 && !abilityActive) {
          setHealth(h => h - 5);
       }
    }

    useGameStore.getState().setHud({ hp: health });

    // Movement
    if (joystickMove.x !== 0 || joystickMove.y !== 0) {
      const speed = (abilityActive && selectedCharacter.id === 'alok') ? 22 : 15;
      velocity.set(joystickMove.x * speed, 0, joystickMove.y * speed);
    } else {
      velocity.lerp(new THREE.Vector3(0,0,0), 0.2); // friction
    }
    
    position.addScaledVector(velocity, delta);
    
    // Bound to map
    position.x = Math.max(-MAP_SIZE/2, Math.min(MAP_SIZE/2, position.x));
    position.z = Math.max(-MAP_SIZE/2, Math.min(MAP_SIZE/2, position.z));
    
    playerRef.current.position.copy(position);
    
    // Aim / Rotation
    if (joystickAim.active && (joystickAim.x !== 0 || joystickAim.y !== 0)) {
       const aimAngle = Math.atan2(joystickAim.x, joystickAim.y);
       playerRef.current.rotation.y = aimAngle;
    } else if (velocity.lengthSq() > 0.1) {
       const moveAngle = Math.atan2(velocity.x, velocity.z);
       playerRef.current.rotation.y = THREE.MathUtils.lerp(playerRef.current.rotation.y, moveAngle, 0.1);
    }
  });

  return (
    <>
      <group ref={playerRef}>
        {/* Character Body */}
        <Cylinder args={[0.5, 0.5, 2, 16]} castShadow receiveShadow>
          <meshStandardMaterial color={selectedCharacter.color} />
        </Cylinder>
        {/* Head */}
        <Sphere args={[0.4]} position={[0, 1.4, 0]} castShadow>
          <meshStandardMaterial color="#fcd34d" />
        </Sphere>
        {/* Gun / Indicator */}
        <Box args={[0.2, 0.2, 1.2]} position={[0.4, 0.2, 0.6]} castShadow>
          <meshStandardMaterial color="#333" />
        </Box>
        
        {/* Ability visual effects */}
        {abilityActive && selectedCharacter.id === 'alok' && (
           <mesh position={[0, -0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.1, 4, 32]} />
              <meshBasicMaterial color="#22c55e" transparent opacity={0.5} side={THREE.DoubleSide} />
           </mesh>
        )}
        {abilityActive && selectedCharacter.id === 'chrono' && (
           <mesh>
              <sphereGeometry args={[3, 32, 32]} />
              <meshStandardMaterial color="#8b5cf6" transparent opacity={0.3} />
           </mesh>
        )}
      </group>
      <CameraController targetPosition={position} />
    </>
  );
}

// Enemies (Dummy targets)
function Enemies() {
  return (
    <>
      {[[-10, -10], [15, 5], [5, 20], [-20, 15]].map((pos, i) => (
        <group position={[pos[0], 1, pos[1]]} key={i}>
          <Cylinder args={[0.5, 0.5, 2, 16]} castShadow>
            <meshStandardMaterial color="#ef4444" />
          </Cylinder>
          <Text position={[0, 2, 0]} fontSize={0.5} color="white">Enemy {i+1}</Text>
        </group>
      ))}
    </>
  );
}

// Map Environment
function Environment() {
  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[MAP_SIZE, MAP_SIZE]} />
        <meshStandardMaterial color="#3f6212" />
      </mesh>
      
      {/* Trees */}
      {[[-10, -5], [15, -12], [20, 18], [-15, 20], [0, 25], [10, 10], [-20, -20], [-25, 5], [5, -30]].map((pos, i) => (
         <group position={[pos[0], 0, pos[1]]} key={`tree-${i}`}>
           <Cylinder args={[0.3, 0.5, 3, 8]} position={[0, 1.5, 0]} castShadow receiveShadow>
             <meshStandardMaterial color="#78350f" />
           </Cylinder>
           <Cylinder args={[0, 3, 4, 8]} position={[0, 4, 0]} castShadow receiveShadow>
             <meshStandardMaterial color="#166534" />
           </Cylinder>
           <Cylinder args={[0, 2.5, 3, 8]} position={[0, 5.5, 0]} castShadow receiveShadow>
             <meshStandardMaterial color="#15803d" />
           </Cylinder>
         </group>
      ))}

      {/* Buildings / Boxes */}
      {[[-5, -5], [-20, 8]].map((pos, i) => (
         <Box args={[6, 4, 6]} position={[pos[0], 2, pos[1]]} key={`box-${i}`} castShadow receiveShadow>
           <meshStandardMaterial color="#b45309" />
         </Box>
      ))}
    </group>
  );
}


// Mobile Touch Controls HUD
function MobileControlsHUD() {
  const { selectedCharacter, setJoysticks, setAction } = useGameStore();
  const leftJoyRef = useRef<HTMLDivElement>(null);
  const rightJoyRef = useRef<HTMLDivElement>(null);
  
  // Simple JoyStick handler logic
  const handleJoy = (evt: React.TouchEvent | React.MouseEvent, type: 'move'|'aim', active: boolean) => {
     if (!active) {
        if (type === 'move') setJoysticks({ x: 0, y: 0 }, useGameStore.getState().joystickAim);
        else setJoysticks(useGameStore.getState().joystickMove, { x: 0, y: 0, active: false });
        return;
     }

     const el = type === 'move' ? leftJoyRef.current : rightJoyRef.current;
     if (!el) return;
     const rect = el.getBoundingClientRect();
     
     // get pt natively from touch or mouse
     let clientX = 0, clientY = 0;
     if ('touches' in evt && evt.touches.length > 0) {
        clientX = evt.touches[0].clientX;
        clientY = evt.touches[0].clientY;
     } else if ('clientX' in evt) {
        clientX = evt.clientX;
        clientY = evt.clientY;
     }

     const centerX = rect.left + rect.width / 2;
     const centerY = rect.top + rect.height / 2;
     let dx = clientX - centerX;
     let dy = clientY - centerY;
     const dist = Math.hypot(dx, dy);
     const maxR = rect.width / 2;
     
     if (dist > maxR) {
        dx = (dx / dist) * maxR;
        dy = (dy / dist) * maxR;
     }
     
     const normX = dx / maxR;
     const normY = dy / maxR; // Notice in 3D: Z is mapped to Y
     
     if (type === 'move') setJoysticks({ x: normX, y: normY }, useGameStore.getState().joystickAim);
     else setJoysticks(useGameStore.getState().joystickMove, { x: normX, y: normY, active: true });
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 font-sans select-none" style={{ touchAction: 'none' }}>
        
        {/* Top HUD */}
        <div className="absolute top-4 left-4 flex items-center opacity-80 md:opacity-100">
           <div className="text-xl md:text-2xl font-black italic tracking-tighter text-white drop-shadow-[2px_2px_0_black]">
               ALPHA 3D
           </div>
        </div>

        {/* Health */}
        <div className="absolute bottom-[20%] left-1/2 transform -translate-x-1/2 flex items-center gap-2 w-64 z-20">
           <div className="text-white font-black text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,1)] tracking-widest italic leading-none mt-1">HP</div>
           <div className="w-full h-4 bg-zinc-900 border border-white/30 rounded-full overflow-hidden">
               <div className="h-full bg-[#ccff00] w-full"></div>
           </div>
        </div>

        {/* Ability Name Banner */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur px-4 py-1 rounded-sm text-[10px] text-white tracking-widest uppercase border border-white/10 z-10 shadow-sm text-center">
            {selectedCharacter.abilityName} <br/> <span style={{color: selectedCharacter.color}}>{selectedCharacter.abilityDesc}</span>
        </div>

        {/* Left Joystick - Movement */}
        <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full border-2 border-white/20 bg-white/5 pointer-events-auto flex items-center justify-center touch-none"
             ref={leftJoyRef}
             onTouchStart={(e) => handleJoy(e, 'move', true)}
             onTouchMove={(e) => handleJoy(e, 'move', true)}
             onTouchEnd={(e) => handleJoy(e, 'move', false)}
             onMouseDown={(e) => handleJoy(e, 'move', true)}
             onMouseMove={(e) =>  { if (e.buttons > 0) handleJoy(e, 'move', true); }}
             onMouseUp={(e) => handleJoy(e, 'move', false)}
             onMouseLeave={(e) => handleJoy(e, 'move', false)}>
            <div className="w-12 h-12 rounded-full bg-white/40 shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
        </div>

        {/* Right Joystick - Aim / Shoot */}
        <div className="absolute bottom-10 right-32 w-32 h-32 rounded-full border-2 border-red-500/30 bg-red-500/10 pointer-events-auto flex items-center justify-center touch-none"
             ref={rightJoyRef}
             onTouchStart={(e) => { handleJoy(e, 'aim', true); setAction('shoot', true); }}
             onTouchMove={(e) => handleJoy(e, 'aim', true)}
             onTouchEnd={(e) => { handleJoy(e, 'aim', false); setAction('shoot', false); }}
             onMouseDown={(e) => { handleJoy(e, 'aim', true); setAction('shoot', true); }}
             onMouseMove={(e) =>  { if (e.buttons > 0) handleJoy(e, 'aim', true); }}
             onMouseUp={(e) => { handleJoy(e, 'aim', false); setAction('shoot', false); }}
             onMouseLeave={(e) => { handleJoy(e, 'aim', false); setAction('shoot', false); }}>
            <Crosshair className="w-10 h-10 text-red-500/80" />
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-20 right-8 flex flex-col gap-4 pointer-events-auto">
            {/* Ability Button */}
            <button 
              className="w-16 h-16 rounded-full border-2 bg-black/40 flex items-center justify-center shadow-lg backdrop-blur hover:scale-110 active:scale-95 transition-all outline-none"
              style={{ borderColor: selectedCharacter.color, boxShadow: `0 0 20px ${selectedCharacter.color}80` }}
              onTouchStart={() => setAction('ability', true)}
              onTouchEnd={() => setAction('ability', false)}
              onMouseDown={() => setAction('ability', true)}
              onMouseUp={() => setAction('ability', false)}>
                <Activity className="w-8 h-8" style={{ color: selectedCharacter.color }} />
            </button>
            <div className="flex gap-2">
               <button className="w-12 h-12 bg-white/10 border border-white/20 rounded-full flex items-center justify-center backdrop-blur hover:bg-white/20">
                   <ChevronUp className="w-6 h-6 text-white" />
               </button>
            </div>
        </div>

    </div>
  );
}

interface Props {
  onBack: () => void;
  onGameOver: (placed: number, kills: number, survivedTime: number) => void;
}

// ----------------------------------------------------
// Main Component
// ----------------------------------------------------
export default function GameScreen3D({ onBack, onGameOver }: Props) {
  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden font-sans select-none" style={{ touchAction: 'none' }}>
       {/* React Three Fiber Canvas */}
       <Canvas shadows camera={{ position: [0, 20, 20], fov: 60 }} className="w-full h-full touch-none outline-none">
          <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
          <ambientLight intensity={0.5} />
          <directionalLight castShadow position={[20, 30, 10]} intensity={1.5} shadow-mapSize={[1024, 1024]}>
            <orthographicCamera attach="shadow-camera" args={[-50, 50, 50, -50]} />
          </directionalLight>
          
          <Player onGameOver={onGameOver} />
          <Enemies />
          <Environment />
       </Canvas>

       <MobileControlsHUD />
       
       {/* Debug Back button */}
       <button onClick={onBack} className="absolute top-2 right-2 z-50 bg-white/10 backdrop-blur px-3 py-1 text-xs text-white rounded">End Game</button>
    </div>
  );
}
