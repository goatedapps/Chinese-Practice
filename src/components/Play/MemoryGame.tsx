import { useEffect, useRef, useState } from "react";
import type { GameProps } from "./types";
import { Sound } from "../../lib/sound";

const SYMBOLS = ["🍎", "🍌", "🍇", "🍓", "🍉", "🍒"];
const MISMATCH_PAUSE_MS = 800;
const MATCH_PAUSE_MS = 500;

interface MemoryCard {
  id: number;
  symbol: string;
  matched: boolean;
}

function buildShuffledDeck(): MemoryCard[] {
  const symbols = [...SYMBOLS, ...SYMBOLS];
  for (let i = symbols.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [symbols[i], symbols[j]] = [symbols[j], symbols[i]];
  }
  return symbols.map((symbol, id) => ({ id, symbol, matched: false }));
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// 🃏 Memory Cards' minigame: config.pairCount (6) pairs, 12 cards total, laid
// face-down in a grid. Flip two at a time -- a match stays face-up
// permanently, a mismatch flips back after a short pause. There's no "fail"
// state (every deck is eventually solved), so completion always earns the
// flat reward; a live timer (started on mount) decides the bonus via
// config.bonusTimeSeconds -- finishing before that earns it, same "flat +
// bonus" shape as the round-based games even though the underlying metric
// (elapsed time, not a hit count) is different.
export function MemoryGame({ item, config, onComplete, onExit }: GameProps) {
  const pairCount = config.pairCount!;
  const bonusTimeSeconds = config.bonusTimeSeconds!;

  const [cards, setCards] = useState<MemoryCard[]>(buildShuffledDeck);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  const startRef = useRef(performance.now());
  const lockedRef = useRef(false);
  const doneRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => setElapsedMs(performance.now() - startRef.current), 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (matchedPairs < pairCount || doneRef.current) return;
    doneRef.current = true;
    const finalMs = performance.now() - startRef.current;
    const perfect = finalMs / 1000 <= bonusTimeSeconds;
    onComplete({ perfect, scoreLabel: formatTime(finalMs) });
  }, [matchedPairs, pairCount, bonusTimeSeconds, onComplete]);

  function handleCardTap(card: MemoryCard) {
    if (lockedRef.current || card.matched || flippedIds.includes(card.id) || flippedIds.length >= 2) return;

    const nextFlipped = [...flippedIds, card.id];
    setFlippedIds(nextFlipped);
    if (nextFlipped.length < 2) return;

    lockedRef.current = true;
    const [firstId, secondId] = nextFlipped;
    const first = cards.find((c) => c.id === firstId)!;
    const second = cards.find((c) => c.id === secondId)!;

    if (first.symbol === second.symbol) {
      Sound.ding();
      setTimeout(() => {
        setCards((prev) => prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, matched: true } : c)));
        setFlippedIds([]);
        lockedRef.current = false;
        setMatchedPairs((prev) => prev + 1);
      }, MATCH_PAUSE_MS);
    } else {
      Sound.miss();
      setTimeout(() => {
        setFlippedIds([]);
        lockedRef.current = false;
      }, MISMATCH_PAUSE_MS);
    }
  }

  return (
    <div className="screen play-screen memory-game">
      <button className="back-btn" onClick={onExit}>
        ← 返回 Back
      </button>
      <h1>{item.label}</h1>
      <p className="picker-hint">
        <span className="en">Flip two cards at a time to find every matching pair.</span>
      </p>
      <div className="memory-timer">{`⏱ ${formatTime(elapsedMs)}`}</div>
      <div className="memory-grid">
        {cards.map((card) => {
          const faceUp = card.matched || flippedIds.includes(card.id);
          return (
            <button
              key={card.id}
              className={`memory-card${faceUp ? " memory-card-flipped" : ""}${card.matched ? " memory-card-matched" : ""}`}
              disabled={faceUp || flippedIds.length >= 2}
              onClick={() => handleCardTap(card)}
              aria-label={faceUp ? card.symbol : "翻牌 Flip card"}
            >
              <span className="memory-card-face memory-card-front">🍃</span>
              <span className="memory-card-face memory-card-back">{card.symbol}</span>
            </button>
          );
        })}
      </div>
      <div className="play-round-hits">{`✓ 已配对 Matched: ${matchedPairs} / ${pairCount}`}</div>
    </div>
  );
}
