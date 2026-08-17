"use client";

import { useEffect, useState } from "react";
import { getType } from "@/data/atlas";
import {
  deleteAllData,
  deleteInsight,
  exportAllData,
  getInsights,
  getSelfType,
  SavedInsight,
  setSelfType,
} from "@/lib/storage";
import TypeSelect from "@/components/TypeSelect";

export default function MyPage() {
  const [self, setSelf] = useState<string>("");
  const [insights, setInsights] = useState<SavedInsight[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSelf(getSelfType() ?? "");
    setInsights(getInsights());
    setLoaded(true);
  }, []);

  const exportData = () => {
    const blob = new Blob([exportAllData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "type-atlas-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const wipe = () => {
    if (
      !window.confirm(
        "保存されたすべてのデータ（自分のタイプ・人物・保存したコツ）を削除しますか？この操作は取り消せません。"
      )
    )
      return;
    deleteAllData();
    setSelf("");
    setInsights([]);
  };

  if (!loaded) return null;
  const selfType = self ? getType(self) : undefined;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-ink">マイページ</h1>

      <section className="card space-y-2 p-5">
        <h2 className="text-sm font-bold text-ink">自分のタイプ</h2>
        <TypeSelect
          id="my-self"
          label={selfType ? `現在: ${selfType.type_code} ${selfType.role}` : "未設定"}
          value={self}
          onChange={(v) => {
            setSelf(v);
            setSelfType(v || null);
          }}
        />
      </section>

      <section className="card p-5">
        <h2 className="mb-3 text-sm font-bold text-ink">
          保存したコツ（{insights.length}件）
        </h2>
        {insights.length === 0 ? (
          <p className="text-sm text-ink/50">
            相性結果の「保存」ボタンから、効きそうな接し方をストックできます。
          </p>
        ) : (
          <ul className="space-y-2">
            {insights.map((i) => (
              <li
                key={i.id}
                className="flex items-start justify-between gap-2 rounded-r-lg border-l-4 border-l-gold bg-gold/5 p-3"
              >
                <div>
                  <p className="text-sm leading-relaxed text-ink/85">{i.text}</p>
                  <p className="mt-1 text-[11px] text-ink/50">{i.context}</p>
                </div>
                <button
                  onClick={() => {
                    deleteInsight(i.id);
                    setInsights(getInsights());
                  }}
                  className="shrink-0 rounded-full border border-ink/15 px-2 py-0.5 text-[11px] text-ink/50"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="text-sm font-bold text-ink">データとプライバシー</h2>
        <p className="text-xs leading-relaxed text-ink/60">
          Type Atlas のデータ（自分のタイプ・人物・メモ・保存したコツ）は、
          すべてこの端末のブラウザ内にのみ保存されます。サーバーには送信されません。
          人物メモは非公開で、共有リンクにもニックネームやメモは含まれません。
        </p>
        <div className="flex gap-2">
          <button
            onClick={exportData}
            className="flex-1 rounded-full border border-teal px-4 py-2.5 text-sm font-bold text-teal"
          >
            データをエクスポート
          </button>
          <button
            onClick={wipe}
            className="flex-1 rounded-full border border-coral px-4 py-2.5 text-sm font-bold text-coral"
          >
            すべて削除
          </button>
        </div>
      </section>

      <section className="card p-5 text-xs leading-relaxed text-ink/60">
        <h2 className="mb-2 text-sm font-bold text-ink">このアプリについて</h2>
        <p>
          Type Atlas は16タイプをもとにした自己理解と対話の補助ツールです。
          科学的診断・能力評価ではなく、内容は傾向・状況依存の仮説として提示しています。
          タイプによる差別的な決めつけ（採用・評価・恋愛適性の断定など）への利用は想定していません。
        </p>
      </section>
    </div>
  );
}
