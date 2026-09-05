import type { FloatMsg } from '@/features/game-session';

/** widgets/float-messages: всплывающие «Комбо!» поверх поля */
export function FloatMessages({ msgs }: { msgs: FloatMsg[] }) {
  return (
    <div className="float-msgs">
      {msgs.map((m) => (
        <div key={m.id} className="float-msg">
          {m.text}
        </div>
      ))}
    </div>
  );
}
