"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Relation, RELATIONS, TypeCode, TYPE_CODES, getType } from "@/data/atlas";
import { buildPairReport } from "@/lib/report";
import { saveInsight } from "@/lib/storage";
import CharacterAvatar from "@/components/CharacterAvatar";
import RadarChart from "@/components/RadarChart";
import Disclaimer from "@/components/Disclaimer";

function isTypeCode(v: string | null): v is TypeCode {
  return !!v && (TYPE_CODES as readonly string[]).includes(v.toUpperCase());
}

function ReportInner() {
  const params = useSearchParams();
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState("");

  const a = params.get("a")?.toUpperCase() ?? "";
  const b = params.get("b")?.toUpperCase() ?? "";
  const relParam = params.get("rel");
  const relation: Relation =
    relParam === "work" || relParam === "friend" || relParam === "love"
      ? relParam
      : "love";

  useEffect(() => setReady(true), []);

  const report = useMemo(() => {
    if (!isTypeCode(a) || !isTypeCode(b)) return null;
    return buildPairReport(a as TypeCode, b as TypeCode, relation);
  }, [a, b, relation]);

  if (!ready) return null;

  if (!report || !isTypeCode(a) || !isTypeCode(b)) {
    return (
      <div className="card p-8 text-center text-sm text-ink/50">
        レポートを表示するには、相性ページから「完全レポートを見る」を押してください。
        <div className="mt-3">
          <Link href="/compatibility" className="font-bold text-teal underline">
            相性ページへ →
          </Link>
        </div>
      </div>
    );
  }

  const aType = getType(a)!;
  const bType = getType(b)!;

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2000);
  };

  return (
    <article className="space-y-4">
      {/* 表紙 */}
      <header className="card p-6 text-center">
        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-gold">
          Pair Report
        </p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <div className="flex flex-col items-center">
            <CharacterAvatar code={a} size={80} showBadge={false} />
            <span className="mt-1 font-display text-sm font-bold tracking-wide text-ink">{a}</span>
            <span className="text-[11px] text-ink/50">{aType.role}</span>
          </div>
          <span className="px-2 text-2xl text-ink/30">×</span>
          <div className="flex flex-col items-center">
            <CharacterAvatar code={b} size={80} showBadge={false} />
            <span className="mt-1 font-display text-sm font-bold tracking-wide text-ink">{b}</span>
            <span className="text-[11px] text-ink/50">{bType.role}</span>
          </div>
        </div>
        <h1 className="mt-3 text-lg font-bold leading-relaxed text-ink">
          {RELATIONS[relation].icon} {RELATIONS[relation].label}の完全レポート
        </h1>
        <p className="mt-1 text-sm font-bold text-teal">「{report.headline}」</p>
      </header>

      {/* 6軸 */}
      <section className="card p-5">
        <h2 className="mb-2 text-sm font-bold text-ink">6軸プロファイル</h2>
        <RadarChart axes={report.axes} />
      </section>

      {/* 本文セクション */}
      {report.sections.map((sec) => (
        <section key={sec.title} className="card p-5">
          <h2 className="mb-3 border-l-4 border-gold pl-3 text-base font-bold text-ink">
            {sec.title}
          </h2>
          {sec.paragraphs?.map((p) => (
            <p key={p} className="mb-2 text-sm leading-relaxed text-ink/80">
              {p}
            </p>
          ))}
          {sec.items && (
            <ul className="mt-1 space-y-2">
              {sec.items.map((it) => (
                <li
                  key={it}
                  className="flex items-start justify-between gap-2 rounded-r-lg border-l-4 border-l-teal bg-teal/5 p-3 text-sm leading-relaxed text-ink/85"
                >
                  <span>{it}</span>
                  <button
                    onClick={() => {
                      saveInsight(it, `レポート ${a}×${b} / ${RELATIONS[relation].label}`);
                      showToast("保存しました");
                    }}
                    className="shrink-0 rounded-full border border-ink/15 px-2 py-0.5 text-[11px] text-ink/60"
                  >
                    保存
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      {/* 衝突リカバリー手順書 */}
      <section className="card p-5">
        <h2 className="mb-1 border-l-4 border-coral pl-3 text-base font-bold text-ink">
          喧嘩したときの手順書
        </h2>
        <p className="mb-3 text-xs text-ink/50">
          時系列で「今なにをするか」だけ分かるように作ってあります。揉めたときに開いてください。
        </p>
        <div className="space-y-4">
          {report.playbook.phases.map((ph) => (
            <div key={ph.title}>
              <h3 className="mb-1.5 text-sm font-bold text-coral">{ph.title}</h3>
              <ul className="space-y-1.5">
                {ph.items.map((it) => (
                  <li key={it} className="flex gap-2 text-sm leading-relaxed text-ink/80">
                    <span aria-hidden className="shrink-0 text-coral">・</span>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href={`/compatibility?a=${a}&b=${b}&rel=${relation}`}
          className="flex flex-1 items-center justify-center rounded-full border border-teal px-4 py-3 text-sm font-bold text-teal"
        >
          相性サマリーに戻る
        </Link>
        <Link
          href={`/consult?b=${b}`}
          className="flex flex-1 items-center justify-center rounded-full bg-teal px-4 py-3 text-sm font-bold text-white"
        >
          この人への伝え方を相談する
        </Link>
      </div>

      <Disclaimer />

      {toast && (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-xs text-white shadow-lg md:bottom-8"
        >
          {toast}
        </div>
      )}
    </article>
  );
}

export default function ReportPage() {
  return (
    <Suspense>
      <ReportInner />
    </Suspense>
  );
}
