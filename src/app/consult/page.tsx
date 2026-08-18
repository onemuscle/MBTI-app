"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TypeCode, TYPE_CODES, getType } from "@/data/atlas";
import { buildSceneGuide, SCENES, SceneSlug } from "@/lib/scenes";
import { getPeople, Person, saveInsight } from "@/lib/storage";
import TypeSelect from "@/components/TypeSelect";
import Disclaimer from "@/components/Disclaimer";

function isTypeCode(v: string | null | undefined): v is TypeCode {
  return !!v && (TYPE_CODES as readonly string[]).includes(v.toUpperCase());
}

function ConsultInner() {
  const params = useSearchParams();
  const [target, setTarget] = useState("");
  const [scene, setScene] = useState<SceneSlug>("apologize");
  const [people, setPeople] = useState<Person[]>([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setPeople(getPeople());
    const s = params.get("scene");
    if (s && SCENES.some((x) => x.slug === s)) {
      setScene(s as SceneSlug);
    }
    const b = params.get("b");
    if (isTypeCode(b)) setTarget(b.toUpperCase());
  }, [params]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2000);
  };

  const guide = useMemo(() => {
    if (!isTypeCode(target)) return null;
    return buildSceneGuide(scene, target as TypeCode);
  }, [scene, target]);

  const targetType = isTypeCode(target) ? getType(target) : undefined;
  const sceneDef = SCENES.find((s) => s.slug === scene)!;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-ink">相談 — シーン別カード</h1>
        <p className="mt-1 text-sm text-ink/60">
          シーンと相手を選ぶと、その人に届きやすい伝え方を組み立てます。
        </p>
      </div>

      {/* 相手の選択 */}
      <div className="card space-y-3 p-5">
        {people.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {people.map((p) => (
              <button
                key={p.id}
                onClick={() => setTarget(p.type_code)}
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
        )}
        <TypeSelect id="consult-target" label="相手のタイプ" value={target} onChange={setTarget} />
      </div>

      {/* シーン選択 */}
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
          {guide.typeHint && (
            <section className="card border-2 border-gold/40 p-5">
              <h2 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-gold">
                💡 {targetType.role}（{target}）へのワンポイント
              </h2>
              <p className="text-sm leading-relaxed text-ink/85">{guide.typeHint}</p>
            </section>
          )}
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
