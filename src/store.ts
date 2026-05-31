import { create } from 'zustand';

export interface Character {
  id: string;
  name: string;
  abilityName: string;
  abilityDesc: string;
  color: string;
}

export const CHARACTERS: Character[] = [
  { id: 'ray', name: 'RAY', abilityName: 'Target Mark', abilityDesc: 'Marks and damages enemies through walls', color: '#1ebbb4' },
  { id: 'alok', name: 'ALOK', abilityName: 'Drop the Beat', abilityDesc: 'Creates a healing and speed aura', color: '#22c55e' },
  { id: 'chrono', name: 'CHRONO', abilityName: 'Time Field', abilityDesc: 'Creates a dome that blocks incoming damage', color: '#8b5cf6' }
];

interface GameStore {
  selectedCharacter: Character;
  setSelectedCharacter: (c: Character) => void;
  // Game HUD State
  hp: number;
  maxHp: number;
  alive: number;
  kills: number;
  zoneRadius: number;
  abilityCooldown: number;
  setHud: (data: Partial<GameStore>) => void;
  joystickMove: { x: number, y: number };
  joystickAim: { x: number, y: number, active: boolean };
  setJoysticks: (move: {x:number, y:number}, aim: {x:number, y:number, active: boolean}) => void;
  actionStates: { jump: boolean, crouch: boolean, ability: boolean, shoot: boolean };
  setAction: (action: keyof GameStore['actionStates'], val: boolean) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  selectedCharacter: CHARACTERS[0],
  setSelectedCharacter: (c) => set({ selectedCharacter: c }),
  hp: 100,
  maxHp: 100,
  alive: 50,
  kills: 0,
  zoneRadius: 3000,
  abilityCooldown: 0,
  setHud: (data) => set(data),
  joystickMove: { x: 0, y: 0 },
  joystickAim: { x: 0, y: 0, active: false },
  setJoysticks: (move, aim) => set({ joystickMove: move, joystickAim: aim }),
  actionStates: { jump: false, crouch: false, ability: false, shoot: false },
  setAction: (action, val) => set((state) => ({ actionStates: { ...state.actionStates, [action]: val } }))
}));
