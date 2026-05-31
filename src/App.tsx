/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AppState, GameResults } from './types';
import Lobby from './components/Lobby';
import Matchmaking from './components/Matchmaking';
import GameScreen3D from './components/GameScreen3D';
import ResultsScreen from './components/ResultsScreen';

export default function App() {
  const [appState, setAppState] = useState<AppState>('lobby');
  const [results, setResults] = useState<GameResults | null>(null);

  const startMatchmaking = () => setAppState('matchmaking');
  const cancelMatchmaking = () => setAppState('lobby');
  
  const handleMatchFound = () => {
    setAppState('game');
  };

  const handleGameOver = (placed: number, kills: number, survivedTime: number) => {
    setResults({
      placed,
      kills,
      survivedTime,
      xpEarned: Math.floor(survivedTime * 2 + kills * 50 + (placed === 1 ? 500 : 0))
    });
    setAppState('results');
  };

  const returnToLobby = () => {
    setAppState('lobby');
    setResults(null);
  };

  return (
    <div className="w-full h-full min-h-screen bg-black">
      {appState === 'lobby' && <Lobby onPlay={startMatchmaking} />}
      {appState === 'matchmaking' && <Matchmaking onMatchFound={handleMatchFound} onCancel={cancelMatchmaking} />}
      {appState === 'game' && <GameScreen3D onBack={returnToLobby} onGameOver={handleGameOver} />}
      {appState === 'results' && results && <ResultsScreen results={results} onReturnLobby={returnToLobby} />}
    </div>
  );
}
