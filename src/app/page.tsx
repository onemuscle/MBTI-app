"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getType, RELATIONS } from "@/data/atlas";
import {
  getPeople,
  getRecentTypes,
  getSelfType,
  Person,
  setSelfType,
} from "@/lib/storage";
import CharacterAvatar from "@/components/CharacterAvatar";
import TypeSelect from "@/components/TypeSelect";

// 今日の1ヒント：自分のタイプの成長アクションを日替わりで出す
function dailyHint(code: string): string {
  const t = getType(code);
  if (!t) return "";
  const pool = [...t.growth_exercises, ...t.communication_do];
  const day = Math.floor(Date.now() / 86400000);
  return pool[day % pool.length];
}

export default function HomePage() {
  const [self, setSelf] = useState<string | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSelf(getSelfType());
    setPeople(getPeople());
    setRecent(getRecentTypes());
    setLoaded(true);
  }, []);

  const selfType = self ? getType(self) : undefined;

  if (!loaded) return null;

  return (
    <div className="space-y-6">
      {/* Hero */}
      {selfType ? (
        <section className="card flex items-center gap-4 p-5">
          <CharacterAvatar code={selfType.type_code} size={104} />
          <div className="min-w-0">
            <p className="text-xs text-ink/50">あなたは</p>
            <h1 className="text-xl font-bold text-ink">
              <span className="font-display tracking-wide text-teal">{selfType.type_code}</span>{" "}
              / {selfType.role}
            </h1>
            <p className="mt-1.5 rounded-lg bg-gold/10 px-3 py-2 text-xs leading-relaxed text-ink/80">
              <span className="font-bold text-gold">今日の1ヒント：</span>
              {dailyHint(selfType.type_code)}
            </p>
            <div className="mt-2 flex gap-3 text-xs">
              <Link href={`/types/${selfType.type_code}`} className="font-bold text-teal underline">
                自分の図鑑を見る
              </Link>
              <button
                onClick={() => {
                  setSelfType(null);
                  setSelf(null);
                }}
                className="text-ink/50 underline"
              >
                タイプを変更
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="card p-5">
          <h1 className="text-xl font-bold text-ink">
            <span className="font-display uppercase tracking-[0.12em]">
              TYPE <span className="text-teal">ATLAS</span>
            </span>{" "}
            へようこそ
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-ink/70">
            16タイプの性格図鑑と、仕事・友達・恋愛の関係別相性ナビ。
            まずはあなたのタイプを選んでください（あとで変更できます）。
          </p>
          <div className="mt-3">
            <TypeSelect
              id="home-self"
              label="あなたのタイプ"
              value=""
              onChange={(v) => {
                if (v) {
                  setSelfType(v);
                  setSelf(v);
                }
              }}
            />
            <p className="mt-2 text-xs text-ink/50">
              タイプが分からない場合は{" "}
              <Link href="/types" className="font-bold text-teal underline">
                図鑑を見ながら
              </Link>{" "}
              近いものを選んでみてください。
            </p>
          </div>
        </section>
      )}

      {/* クイック相性 */}
      {selfType && people.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-bold text-ink">クイック相性</h2>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
            {people.map((p) => (
              <Link
                key={p.id}
                href={`/compatibility?person=${p.id}`}
                className="card flex w-32 shrink-0 flex-col items-center gap-1 p-3"
              >
                <CharacterAvatar code={p.type_code} size={64} showBadge={false} />
                <span className="max-w-full truncate text-sm font-bold text-ink">
                  {p.nickname}
                </span>
                <span className="font-display tracking-wide text-xs text-teal">{p.type_code}</span>
                <span className="chip bg-mist text-[11px] text-ink/60">
                  {RELATIONS[p.relation].label}
                </span>
              </Link>
            ))}
            <Link
              href="/people"
              className="card flex w-32 shrink-0 flex-col items-center justify-center gap-2 border-2 border-dashed border-ink/15 bg-transparent p-3 text-ink/50 shadow-none"
            >
              <span className="text-2xl">＋</span>
              <span className="text-xs font-bold">人物を追加</span>
            </Link>
          </div>
        </section>
      )}

      {/* 主要導線 */}
      <section className="grid grid-cols-2 gap-3">
        <Link href="/compatibility" className="card p-4">
          <div className="text-2xl">🔗</div>
          <div className="mt-1 font-bold text-ink">相性を見る</div>
          <p className="mt-0.5 text-xs text-ink/60">
            仕事・友達・恋愛の3つの関係別に解説
          </p>
        </Link>
        <Link href="/people" className="card p-4">
          <div className="text-2xl">👥</div>
          <div className="mt-1 font-bold text-ink">人物を登録</div>
          <p className="mt-0.5 text-xs text-ink/60">
            気になる人を保存して接し方をストック
          </p>
        </Link>
        <Link href="/types" className="card p-4">
          <div className="text-2xl">📖</div>
          <div className="mt-1 font-bold text-ink">16タイプ図鑑</div>
          <p className="mt-0.5 text-xs text-ink/60">
            特徴・会話のコツ・ストレスサイン
          </p>
        </Link>
        <Link href="/my" className="card p-4">
          <div className="text-2xl">⭐</div>
          <div className="mt-1 font-bold text-ink">保存したコツ</div>
          <p className="mt-0.5 text-xs text-ink/60">
            保存した接し方をいつでも見返せる
          </p>
        </Link>
      </section>

      {/* 最近見たタイプ */}
      {recent.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-bold text-ink">最近見たタイプ</h2>
          <div className="flex flex-wrap gap-2">
            {recent.map((code) => {
              const t = getType(code);
              if (!t) return null;
              return (
                <Link
                  key={code}
                  href={`/types/${code}`}
                  className="chip border border-ink/10 bg-white font-medium text-ink/80"
                >
                  <span className="font-display tracking-wide text-xs font-bold text-teal">{code}</span>
                  {t.role}
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
