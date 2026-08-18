"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Relation, RELATIONS, TypeCode, TYPE_CODES, getType } from "@/data/atlas";
import { buildSceneGuide, SCENES, SceneSlug } from "@/lib/scenes";
import { translateMessage } from "@/lib/translator";
import { getPeople, Person, saveInsight } from "@/lib/storage";
import TypeSelect from "@/components/TypeSelect";
import Disclaimer from "@/components/Disclaimer";

function isTypeCode(v: string | null | undefined): v is TypeCode {
  return !!v && (TYPE_CODES as readonly string[]).includes(v.toUpperCase());
}

function PersonPicker({
  people,
  target,
  onPick,
}: {
  people: Person[];
  target: string;
  onPick: (code: string, relation?: Relation) => void;
}) {
  if (people.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {people.map((p) => (
        <button
          key={p.id}
          onClick={() => onPick(p.type_code, p.relation)}
          className={`chip border ${
            target === p.type_code
              ? "border-teal bg-teal/10 text-teal"
              : "border-ink/15 bg-white text-ink/70"
          }`}
        >
          {p.nickname}
          <span className="font-display tracking-wide text-xs">{p.type_code}</span>
        </button>
      ))}
    </div>
  );
}

function ConsultInner() {
  const params = useSearchParams();
  const [mode, setMode] = useState<"translate" | "scene">("translate");
  const [target, setTarget] = useState("");
  const [relation, setRelation] = useState<Relation>("friend");
  const [text, setText] = useState("");
  const [scene, setScene] = useState<SceneSlug>("apologize");
  const [people, setPeople] = useState<Person[]>([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setPeople(getPeople());
    const s = params.get("scene");
    if (s && SCENES.some((x) => x.slug === s)) {
      setScene(s as SceneSlug);
      setMode("scene");
    }
    const b = params.get("b");
    if (isTypeCode(b)) setTarget(b.toUpperCase());
  }, [params]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2000);
  };

  const suggestions = useMemo(() => {
    if (!isTypeCode(target) || !text.trim()) return [];
    return translateMessage(text, target as TypeCode, relation);
  }, [text, target, relation]);

  const guide = useMemo(() => {
    if (!isTypeCode(target)) return null;
    return buildSceneGuide(scene, target as TypeCode);
  }, [scene, target]);

  const targetType = isTypeCode(target) ? getType(target) : undefined;
  const sceneDef = SCENES.find((s) => s.slug === scene)!;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-ink">相談</h1>
        <p className="mt-1 text-sm text-ink/60">
          伝えたいことを、相手のタイプに届きやすい形に組み立てます。
        </p>
      </div>

      {/* モード切り替え */}
      <div role="tablist" aria-label="相談メニュー" className="flex rounded-full bg-white p-1 shadow-card">
        <button
          role="tab"
          aria-selected={mode === "translate"}
          onClick={() => setMode("translate")}
          className={`flex-1 rounded-full py-2.5 text-sm font-bold transition-colors ${
            mode === "translate" ? "bg-teal text-white" : "text-ink/60"
          }`}
        >
          ✍️ 会話の翻訳機
        </button>
        <button
          role="tab"
          aria-selected={mode === "scene"}
          onClick={() => setMode("scene")}
          className={`flex-1 rounded-full py-2.5 text-sm font-bold transition-colors ${
            mode === "scene" ? "bg-teal text-white" : "text-ink/60"
          }`}
        >
          🃏 シーン別カード
        </button>
      </div>

      {/* 相手の選択（共通） */}
      <div className="card space-y-3 p-5">
        <PersonPicker
          people={people}
          target={target}
          onPick={(code, rel) => {
            setTarget(code);
            if (rel) setRelation(rel);
          }}
        />
        <div className="flex gap-3">
          <TypeSelect id="consult-target" label="相手のタイプ" value={target} onChange={setTarget} />
          <div className="flex-1">
            <label htmlFor="consult-rel" className="mb-1 block text-xs font-bold text-ink/60">
              関係
            </label>
            <select
              id="consult-rel"
              value={relation}
              onChange={(e) => setRelation(e.target.value as Relation)}
              className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
            >
              {(Object.keys(RELATIONS) as Relation[]).map((r) => (
                <option key={r} value={r}>
                  {RELATIONS[r].label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {mode === "translate" && (
        <>
          <div className="card space-y-3 p-5">
            <label htmlFor="msg" className="block text-xs font-bold text-ink/60">
              伝えたいこと（そのままの言葉でOK）
            </label>
            <textarea
              id="msg"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="例：早く資料出してほしい／今週末どこか行きたい／もう少し連絡がほしい"
              rows={3}
              maxLength={200}
              className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
            {!targetType && (
              <p className="text-xs text-ink/50">↑ 相手のタイプを選ぶと、3通りの言い方に組み立てます。</p>
            )}
          </div>

          {suggestions.length > 0 && targetType && (
            <div className="space-y-3">
              {suggestions.map((s, i) => (
                <section key={s.label} className="card p-5">
                  <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-ink">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal text-xs text-white">
                      {i + 1}
                    </span>
                    {s.label}
                  </h2>
                  <p className="rounded-lg bg-mist p-3 text-sm leading-relaxed text-ink">
                    {s.example}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-ink/60">
                    <span className="font-bold text-gold">なぜ届きやすい？ </span>
                    {s.why}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(s.example);
                          showToast("コピーしました");
                        } catch {
                          showToast("コピーできませんでした");
                        }
                      }}
                      className="rounded-full border border-teal px-3 py-1.5 text-xs font-bold text-teal"
                    >
                      コピー
                    </button>
                    <button
                      onClick={() => {
                        saveInsight(`${s.label}: ${s.example}`, `翻訳機 → ${target}`);
                        showToast("保存しました");
                      }}
                      className="rounded-full border border-ink/15 px-3 py-1.5 text-xs text-ink/60"
                    >
                      保存
                    </button>
                  </div>
                </section>
              ))}
              <p className="text-xs text-ink/50">
                ◯◯の部分は自分の状況に置き換えてください。文例は出発点です。
              </p>
            </div>
          )}
        </>
      )}

      {mode === "scene" && (
        <>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {SCENES.map((s) => (
              <button
                key={s.slug}
                onClick={() => setScene(s.slug)}
                className={`chip shrink-0 border ${
                  scene === s.slug
                    ? "border-teal bg-teal/10 font-bold text-teal"
                    : "border-ink/15 bg-white text-ink/70"
                }`}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>

          {!targetType && (
            <div className="card p-8 text-center text-sm text-ink/50">
              相手のタイプを選ぶと、「{sceneDef.label}」のコツが表示されます。
            </div>
          )}

          {guide && targetType && (
            <>
              <section className="card p-5">
                <h2 className="mb-3 text-sm font-bold text-ink">
                  {sceneDef.icon} {targetType.role}（{target}）に{sceneDef.label}ときの組み立て
                </h2>
                <ol className="space-y-3">
                  {guide.steps.map((st, i) => (
                    <li key={st.title} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-ink">{st.title}</div>
                        <p className="mt-0.5 text-xs leading-relaxed text-ink/60">{st.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="card p-5">
                <h2 className="mb-2 text-sm font-bold text-ink">そのまま使える例文</h2>
                <ul className="space-y-2">
                  {guide.examples.map((ex) => (
                    <li key={ex} className="flex items-start justify-between gap-2 rounded-lg bg-mist p-3">
                      <span className="text-sm leading-relaxed text-ink">{ex}</span>
                      <button
                        onClick={() => {
                          saveInsight(ex, `${sceneDef.label} → ${target}`);
                          showToast("保存しました");
                        }}
                        className="shrink-0 rounded-full border border-ink/15 px-2 py-0.5 text-[11px] text-ink/60"
                      >
                        保存
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="card p-5">
                <h2 className="mb-2 text-sm font-bold text-coral">これは避けたい</h2>
                <ul className="space-y-2 text-sm leading-relaxed text-ink/80">
                  {guide.ng.map((n) => (
                    <li key={n} className="flex gap-2">
                      <span aria-hidden className="shrink-0 text-coral">✕</span>
                      {n}
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </>
      )}

      <Disclaimer />

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

export default function ConsultPage() {
  return (
    <Suspense>
      <ConsultInner />
    </Suspense>
  );
}
