"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getType,
  Relation,
  RELATIONS,
  TypeCode,
  TYPE_CODES,
} from "@/data/atlas";
import { computeCompatibility, Distance, distanceTips } from "@/lib/compatibility";
import {
  getPeople,
  getSelfType,
  markPairViewed,
  Person,
  saveInsight,
  setSelfType,
} from "@/lib/storage";
import CharacterAvatar from "@/components/CharacterAvatar";
import RadarChart from "@/components/RadarChart";
import TypeSelect from "@/components/TypeSelect";
import Disclaimer from "@/components/Disclaimer";

function isTypeCode(v: string | null): v is TypeCode {
  return !!v && (TYPE_CODES as readonly string[]).includes(v.toUpperCase());
}

function InsightList({
  title,
  color,
  items,
  onSave,
}: {
  title: string;
  color: "teal" | "coral" | "gold";
  items: string[];
  onSave?: (text: string) => void;
}) {
  const colorClass = {
    teal: "border-l-teal bg-teal/5",
    coral: "border-l-coral bg-coral/5",
    gold: "border-l-gold bg-gold/5",
  }[color];
  return (
    <section className="card p-5">
      <h2 className="mb-3 text-sm font-bold tracking-wide text-ink">{title}</h2>
      <ul className="space-y-2">
        {items.map((s) => (
          <li
            key={s}
            className={`flex items-start justify-between gap-2 rounded-r-lg border-l-4 p-3 text-sm leading-relaxed text-ink/85 ${colorClass}`}
          >
            <span>{s}</span>
            {onSave && (
              <button
                onClick={() => onSave(s)}
                className="shrink-0 rounded-full border border-ink/15 px-2 py-0.5 text-[11px] text-ink/60 hover:border-teal hover:text-teal"
                title="このコツを保存"
              >
                保存
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function CompatibilityInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [self, setSelf] = useState("");
  const [other, setOther] = useState("");
  const [relation, setRelation] = useState<Relation>("work");
  const [personId, setPersonId] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [toast, setToast] = useState("");
  const [distance, setDistance] = useState<Distance>("close");

  // URLパラメータ / 保存済み自分タイプから初期化
  useEffect(() => {
    const a = params.get("a");
    const b = params.get("b");
    const rel = params.get("rel");
    const pid = params.get("person");
    setPeople(getPeople());
    if (isTypeCode(a)) setSelf(a.toUpperCase());
    else {
      const saved = getSelfType();
      if (saved) setSelf(saved);
    }
    if (pid) {
      const p = getPeople().find((x) => x.id === pid);
      if (p) {
        setPersonId(p.id);
        setOther(p.type_code);
        setRelation(p.relation);
        setDistance(p.distance_level);
        return;
      }
    }
    if (isTypeCode(b)) setOther(b.toUpperCase());
    if (rel === "work" || rel === "friend" || rel === "love") setRelation(rel);
  }, [params]);

  const person = people.find((p) => p.id === personId);

  // 図鑑コンプリート: 見た相性の組み合わせを記録
  useEffect(() => {
    if (isTypeCode(self) && isTypeCode(other)) {
      markPairViewed(self, other, relation);
    }
  }, [self, other, relation]);

  const result = useMemo(() => {
    if (!isTypeCode(self) || !isTypeCode(other)) return null;
    return computeCompatibility(self as TypeCode, other as TypeCode, relation, {
      a: "あなた",
      b: person ? `${person.nickname}さん` : "相手",
    });
  }, [self, other, relation, person]);

  const selfType = isTypeCode(self) ? getType(self) : undefined;
  const otherType = isTypeCode(other) ? getType(other) : undefined;
  const contextLabel = `${self} × ${other} / ${RELATIONS[relation].label}`;

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2000);
  };

  const share = async () => {
    // ニックネームは含めず、タイプと関係だけの共有URLを発行する（設計書17章）
    const url = `${window.location.origin}/compatibility?a=${self}&b=${other}&rel=${relation}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Type Atlas | ${contextLabel}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      showToast("共有リンクをコピーしました（ニックネームは含まれません）");
    } catch {
      showToast("共有をキャンセルしました");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-ink">相性ナビ</h1>
        <p className="mt-1 text-sm text-ink/60">
          2人のタイプを選ぶと、仕事・友達・恋愛の3つの関係別に相性を解説します。
        </p>
      </div>

      {/* 入力 */}
      <div className="card space-y-3 p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <TypeSelect
            id="self-type"
            label="あなたのタイプ"
            value={self}
            onChange={(v) => {
              setSelf(v);
              if (v) setSelfType(v);
            }}
          />
          <TypeSelect
            id="other-type"
            label="相手のタイプ"
            value={other}
            onChange={(v) => {
              setOther(v);
              setPersonId("");
            }}
          />
        </div>
        {people.length > 0 && (
          <div>
            <span className="mb-1 block text-xs font-bold text-ink/60">
              保存した人物から選ぶ
            </span>
            <div className="flex flex-wrap gap-2">
              {people.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setPersonId(p.id);
                    setOther(p.type_code);
                    setRelation(p.relation);
                  }}
                  className={`chip border ${
                    personId === p.id
                      ? "border-teal bg-teal/10 text-teal"
                      : "border-ink/15 bg-white text-ink/70"
                  }`}
                >
                  {p.nickname}
                  <span className="font-display tracking-wide text-xs">{p.type_code}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {!result && (
        <div className="card p-8 text-center text-sm text-ink/50">
          あなたと相手のタイプを選ぶと、ここに相性が表示されます。
          <div className="mt-3">
            <Link href="/types" className="font-bold text-teal underline">
              タイプが分からない場合は図鑑を見る →
            </Link>
          </div>
        </div>
      )}

      {result && selfType && otherType && (
        <>
          {/* 1. 関係タブ */}
          <div
            role="tablist"
            aria-label="関係の種類"
            className="flex rounded-full bg-white p-1 shadow-card"
          >
            {(Object.keys(RELATIONS) as Relation[]).map((rel) => (
              <button
                key={rel}
                role="tab"
                aria-selected={relation === rel}
                onClick={() => setRelation(rel)}
                className={`flex-1 rounded-full py-2.5 text-sm font-bold transition-colors ${
                  relation === rel ? "bg-teal text-white" : "text-ink/60"
                }`}
              >
                {RELATIONS[rel].icon} {RELATIONS[rel].label}
              </button>
            ))}
          </div>

          {/* 2. 結論 */}
          <div className="card p-5 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="flex flex-col items-center">
                <CharacterAvatar code={self} size={72} showBadge={false} />
                <span className="font-display tracking-wide text-xs font-bold text-ink/70">{self}</span>
                <span className="text-[11px] text-ink/50">あなた</span>
              </div>
              <span className="px-2 text-2xl text-ink/30">×</span>
              <div className="flex flex-col items-center">
                <CharacterAvatar code={other} size={72} showBadge={false} />
                <span className="font-display tracking-wide text-xs font-bold text-ink/70">{other}</span>
                <span className="text-[11px] text-ink/50">
                  {person ? person.nickname : otherType.role}
                </span>
              </div>
            </div>
            <p className="mt-3 text-lg font-bold leading-relaxed text-ink">
              「{result.headline}」
            </p>
            <p className="mt-1 text-xs text-ink/50">
              噛み合いやすさの目安 {result.total} / 100（点数は補助。下の場面とコツが本体です）
            </p>
          </div>

          {/* 3. 6軸プロファイル */}
          <section className="card p-5">
            <h2 className="mb-1 text-sm font-bold tracking-wide text-ink">
              6軸プロファイル
            </h2>
            <p className="mb-2 text-xs text-ink/50">
              {RELATIONS[relation].label}の関係で重要な軸ほど重みを付けて評価しています。
            </p>
            <RadarChart axes={result.axes} />
            <ul className="mt-2 grid gap-1.5 text-xs text-ink/70 sm:grid-cols-2">
              {result.axes.map((a) => (
                <li key={a.key} className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                      a.kind === "friction"
                        ? "bg-coral"
                        : a.kind === "complement"
                          ? "bg-gold"
                          : "bg-teal"
                    }`}
                  />
                  <span className="font-bold">{a.label}</span>
                  <span>
                    {a.kind === "aligned" && "近い"}
                    {a.kind === "complement" && "違いが補完に"}
                    {a.kind === "friction" && "差が大きい"}
                    {a.kind === "neutral" && "やや違う"}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* 4. うまくいく場面 */}
          <InsightList
            title={`うまくいきやすいところ（${RELATIONS[relation].label}）`}
            color="teal"
            items={result.strengths}
          />

          {/* 5. ズレやすい場面 */}
          <InsightList
            title="ズレやすいところ"
            color="coral"
            items={result.frictions}
          />

          {/* 6. あなた → 相手 */}
          <InsightList
            title={`あなた → ${person ? `${person.nickname}さん` : otherType.role}：伝え方のコツ`}
            color="teal"
            items={result.tipsAtoB}
            onSave={(text) => {
              saveInsight(text, contextLabel);
              showToast("コツを保存しました");
            }}
          />

          {/* 7. 相手 → あなた */}
          <InsightList
            title={`${person ? `${person.nickname}さん` : otherType.role} → あなた：受け取り方の違い`}
            color="gold"
            items={result.tipsBtoA}
            onSave={(text) => {
              saveInsight(text, contextLabel);
              showToast("コツを保存しました");
            }}
          />

          {/* 8. リカバリー */}
          <InsightList
            title="揉めた時のリカバリー"
            color="coral"
            items={result.recovery}
            onSave={(text) => {
              saveInsight(text, contextLabel);
              showToast("コツを保存しました");
            }}
          />

          {/* 8.5 距離感別アドバイス */}
          <section className="card p-5">
            <h2 className="mb-1 text-sm font-bold tracking-wide text-ink">
              いまの距離感に合わせる
            </h2>
            <p className="mb-3 text-xs text-ink/50">
              同じ2人でも、関係の温度で効くアドバイスは変わります。
            </p>
            <div className="mb-3 flex rounded-full bg-mist p-1">
              {(
                [
                  ["first", "初対面・浅め"],
                  ["close", "仲良し"],
                  ["tense", "いま緊張状態"],
                ] as [Distance, string][]
              ).map(([d, label]) => (
                <button
                  key={d}
                  onClick={() => setDistance(d)}
                  className={`flex-1 rounded-full py-2 text-xs font-bold transition-colors ${
                    distance === d ? "bg-white text-teal shadow-card" : "text-ink/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <ul className="space-y-2">
              {distanceTips(
                distance,
                result.axes,
                person ? `${person.nickname}さん` : otherType.role
              ).map((tip) => (
                <li
                  key={tip}
                  className="flex items-start justify-between gap-2 rounded-r-lg border-l-4 border-l-gold bg-gold/5 p-3 text-sm leading-relaxed text-ink/85"
                >
                  <span>{tip}</span>
                  <button
                    onClick={() => {
                      saveInsight(tip, contextLabel);
                      showToast("コツを保存しました");
                    }}
                    className="shrink-0 rounded-full border border-ink/15 px-2 py-0.5 text-[11px] text-ink/60"
                  >
                    保存
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* 8.7 完全レポートへ */}
          <Link
            href={`/report?a=${self}&b=${other}&rel=${relation}`}
            className="card block border-2 border-gold/40 p-5 text-center"
          >
            <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-gold">
              Pair Report
            </span>
            <p className="mt-1 font-bold text-ink">この2人の完全レポートを読む</p>
            <p className="mt-0.5 text-xs text-ink/60">
              時間が経つと来る壁・言葉にしにくい本音・喧嘩の手順書まで
            </p>
          </Link>

          {/* 9. 保存 / 共有 / 次の導線 */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={share}
              className="flex-1 rounded-full bg-teal px-4 py-3 text-sm font-bold text-white"
            >
              この結果を共有する
            </button>
            {!person && (
              <button
                onClick={() => router.push(`/people?add=${other}`)}
                className="flex-1 rounded-full border border-teal px-4 py-3 text-sm font-bold text-teal"
              >
                この相手を人物に登録する
              </button>
            )}
            <Link
              href={`/types/${other}`}
              className="flex-1 rounded-full border border-ink/15 px-4 py-3 text-center text-sm font-bold text-ink/70"
            >
              相手のタイプを深く知る
            </Link>
          </div>

          <Disclaimer />
        </>
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-xs text-white shadow-lg md:bottom-8"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

export default function CompatibilityPage() {
  return (
    <Suspense>
      <CompatibilityInner />
    </Suspense>
  );
}
