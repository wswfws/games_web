import { useEffect, useState } from 'react';
import './styles/index.css';

type CardId = number;
type CardState = 'hidden' | 'flipped' | 'matched';

interface Card {
  id: CardId;
  emoji: string;
  state: CardState;
}

const EMOJIS = ['🐱', '🐶', '🦊', '🐼', '🐸', '🐙', '🦄', '🐝'];

function shuffledDeck(): Card[] {
  const pairs = [...EMOJIS, ...EMOJIS];
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs.map((emoji, id) => ({ id, emoji, state: 'hidden' as const }));
}

export default function App() {
  const [cards, setCards] = useState<Card[]>(shuffledDeck);
  const [flipped, setFlipped] = useState<CardId[]>([]);
  const [moves, setMoves] = useState(0);

  const matchedCount = cards.filter((c) => c.state === 'matched').length;
  const won = matchedCount === cards.length;

  useEffect(() => {
    if (flipped.length < 2) return;
    const [a, b] = flipped;
    const cardA = cards[a];
    const cardB = cards[b];
    const timeout = setTimeout(() => {
      if (cardA.emoji === cardB.emoji) {
        setCards((prev) =>
          prev.map((c) => (c.id === a || c.id === b ? { ...c, state: 'matched' } : c)),
        );
      } else {
        setCards((prev) =>
          prev.map((c) => (c.id === a || c.id === b ? { ...c, state: 'hidden' } : c)),
        );
      }
      setFlipped([]);
    }, 550);
    return () => clearTimeout(timeout);
  }, [flipped, cards]);

  function onCardClick(id: CardId) {
    if (flipped.length >= 2) return;
    const card = cards[id];
    if (card.state !== 'hidden') return;
    if (flipped.includes(id)) return;

    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, state: 'flipped' } : c)));
    setFlipped((prev) => [...prev, id]);

    if (flipped.length === 1) {
      setMoves((m) => m + 1);
    }
  }

  function restart() {
    setCards(shuffledDeck());
    setFlipped([]);
    setMoves(0);
  }

  return (
    <div className="mem">
      <header className="mem-header">
        <h1>Найди пары</h1>
        <span className="mem-moves">Ходы: {moves}</span>
      </header>

      <div className="mem-status">
        {won ? `Готово! Подобрано пар: ${matchedCount / 2} за ${moves} ходов` : 'Открывай карточки и собирай пары'}
      </div>

      <div className="mem-grid">
        {cards.map((card) => (
          <button
            key={card.id}
            className={`mem-card ${card.state === 'matched' ? 'mem-card--matched' : ''} ${
              card.state === 'flipped' ? 'mem-card--flipped' : ''
            }`}
            onClick={() => onCardClick(card.id)}
            disabled={card.state !== 'hidden'}
          >
            <span className="mem-card-inner">
              <span className="mem-card-front">?</span>
              <span className="mem-card-back">{card.emoji}</span>
            </span>
          </button>
        ))}
      </div>

      <button className="mem-restart" onClick={restart}>
        {won ? 'Сыграть ещё' : 'Перемешать'}
      </button>
    </div>
  );
}