import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вики — Кошачий остров",
  description: "Правила игры, механики, описание зданий и управления.",
};

export default function WikiPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🐱 Кошачий остров — вики</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">🎯 Цель игры</h2>
        <p className="text-slate-300 leading-relaxed">
          Накормить всех котиков. Строй пирсы, лови рыбу, прокладывай тропинки
          к кухне — и следи, чтобы каждые 10 тиков на кухне хватало рыбы для всех.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">🏗️ Здания</h2>
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🎣</span>
              <span className="font-bold">Пирс</span>
              <span className="text-xs text-yellow-300 bg-slate-700 px-2 py-0.5 rounded-full">🐱2</span>
            </div>
            <p className="text-slate-400 text-sm">Ставится только на <strong>воду с рыбой</strong>. Стоит 2 котиков. Производит 🐟 каждый тик.</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🛤️</span>
              <span className="font-bold">Тропинка</span>
            </div>
            <p className="text-slate-400 text-sm">Перемещает ресурсы в направлении стрелки. Можно повернуть двойным кликом или клавишей <kbd className="bg-slate-700 px-1 rounded text-xs">R</kbd>.</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-yellow-600/30">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🍲</span>
              <span className="font-bold">Кухня</span>
              <span className="text-xs text-red-400 bg-slate-700 px-2 py-0.5 rounded-full">появляется сама</span>
            </div>
            <p className="text-slate-400 text-sm">
              Уже стоит на карте. Убрать нельзя. Рыба должна дойти до кухни по тропинкам.
              <br />
              Каждые 10 тиков кухня кормит всех котиков. Если рыбы не хватит — <strong className="text-red-400">Game Over</strong>.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">🐱 Котики</h2>
        <p className="text-slate-300 leading-relaxed mb-2">
          Вначале у вас 4 котика. Каждый пирс забирает 2 котиков в работники — они ловят рыбу.
        </p>
        <p className="text-slate-300 leading-relaxed">
          Все котики (и работники, и свободные) едят на кухне раз в 10 тиков.
          Если еды нет — котики голодают, игра заканчивается.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">🎮 Управление</h2>
        <ul className="space-y-2 text-slate-300">
          <li>🖱️ <strong>Клик</strong> по пустой клетке — поставить выбранное здание</li>
          <li>🖱️ <strong>ПКМ</strong> — удалить здание (котики возвращаются)</li>
          <li>🖱️ <strong>Двойной клик</strong> — повернуть здание</li>
          <li><kbd className="bg-slate-700 px-1 rounded">R</kbd> — повернуть здание под курсором</li>
          <li><kbd className="bg-slate-700 px-1 rounded">Пробел</kbd> — пауза</li>
          <li><kbd className="bg-slate-700 px-1 rounded">1</kbd> — пирс, <kbd className="bg-slate-700 px-1 rounded">2</kbd> — тропинка</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">🏝️ Клетки</h2>
        <ul className="space-y-2 text-slate-300">
          <li>🌿 <strong>Лужок</strong> — можно строить всё, кроме пирса</li>
          <li>🌊 <strong>Вода (рыба)</strong> — только для пирса</li>
          <li>💧 <strong>Вода</strong> — декоративная, строить нельзя</li>
          <li>🪨 <strong>Скала</strong> — преграда, строить нельзя</li>
        </ul>
      </section>
    </main>
  );
}