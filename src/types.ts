export type AppState = 'lobby' | 'matchmaking' | 'game' | 'results';

export interface GameResults {
  placed: number;
  kills: number;
  survivedTime: number; // in seconds
  xpEarned: number;
}
