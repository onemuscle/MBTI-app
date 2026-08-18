"use client";

import { useEffect, useState } from "react";
import { TYPE_CODES } from "@/data/atlas";
import { getViewedPairs, getViewedTypes } from "@/lib/storage";

// 図鑑コンプリートの進捗表示
export default function CollectionProgress() {
  const [types, setTypes] = useState<string[]>([]);
  const [pairs, setPairs] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTypes(getViewedTypes());
    setPairs(getViewedPairs().length);
    setLoaded(true);
  }, []);

  if (!loaded) return null;
  const pct = Math.round((types.length / 16) * 100);

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink">
          📖 図鑑コンプリート{" "}
          <span className="font-display tracking-wide text-teal">
            {types.length}/16
          </span>
        </h2>
        <span className="text-xs text-ink/50">相性 {pairs}通り探索済み</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={types.length}
        aria-valuemin={0}
        aria-valuemax={16}
        aria-label="図鑑の閲覧進捗"
        className="mt-2 h-2 overflow-hidden rounded-full bg-mist"
      >
        <div
          className="h-full rounded-full bg-teal transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {TYPE_CODES.map((c) => (
          <span
            key={c}
            className={`rounded px-1.5 py-0.5 font-display text-[10px] font-bold tracking-wide ${
              types.includes(c) ? "bg-teal/15 text-teal" : "bg-mist text-ink/30"
            }`}
          >
            {c}
          </span>
        ))}
      </div>
      {types.length === 16 ? (
        <p className="mt-2 text-xs font-bold text-gold">
          🏆 全タイプ制覇！あなたはもう立派なタイプ観察者です。
        </p>
      ) : (
        <p className="mt-2 text-xs text-ink/50">
          まだ見ていないタイプを開くとゲージが進みます。
        </p>
      )}
    </section>
  );
}
