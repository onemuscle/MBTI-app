"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getType, Relation, RELATIONS } from "@/data/atlas";
import {
  deletePerson,
  getPeople,
  Person,
  savePerson,
} from "@/lib/storage";
import CharacterAvatar from "@/components/CharacterAvatar";
import TypeSelect from "@/components/TypeSelect";

const DISTANCES: Record<Person["distance_level"], string> = {
  first: "初対面・浅め",
  close: "仲良し",
  tense: "いま緊張状態",
};

const EMPTY_FORM = {
  id: undefined as string | undefined,
  nickname: "",
  type_code: "",
  relation: "friend" as Relation,
  distance_level: "first" as Person["distance_level"],
  note: "",
};

function PeopleInner() {
  const params = useSearchParams();
  const [people, setPeople] = useState<Person[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setPeople(getPeople());
    const add = params.get("add");
    if (add) {
      setForm((f) => ({ ...f, type_code: add.toUpperCase() }));
      setShowForm(true);
    }
  }, [params]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nickname.trim() || !form.type_code) return;
    savePerson({ ...form, nickname: form.nickname.trim() });
    setPeople(getPeople());
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const edit = (p: Person) => {
    setForm({
      id: p.id,
      nickname: p.nickname,
      type_code: p.type_code,
      relation: p.relation,
      distance_level: p.distance_level,
      note: p.note,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = (p: Person) => {
    if (!window.confirm(`「${p.nickname}」を削除しますか？この操作は取り消せません。`)) return;
    deletePerson(p.id);
    setPeople(getPeople());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">人物図鑑</h1>
          <p className="mt-1 text-sm text-ink/60">
            気になる人を保存して、いつでも相性と接し方を見返せます。
          </p>
        </div>
        <button
          onClick={() => {
            setForm(EMPTY_FORM);
            setShowForm((v) => !v);
          }}
          className="shrink-0 rounded-full bg-teal px-4 py-2 text-sm font-bold text-white"
        >
          {showForm ? "閉じる" : "＋ 追加"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card space-y-3 p-5">
          <h2 className="text-sm font-bold text-ink">
            {form.id ? "人物を編集" : "人物を追加"}
          </h2>
          <div>
            <label htmlFor="nickname" className="mb-1 block text-xs font-bold text-ink/60">
              ニックネーム（本名でなくてOK）
            </label>
            <input
              id="nickname"
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              placeholder="例：課長、Aさん、たろう"
              maxLength={20}
              required
              className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
          </div>
          <TypeSelect
            id="person-type"
            label="タイプ"
            value={form.type_code}
            onChange={(v) => setForm({ ...form, type_code: v })}
          />
          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="relation" className="mb-1 block text-xs font-bold text-ink/60">
                関係
              </label>
              <select
                id="relation"
                value={form.relation}
                onChange={(e) => setForm({ ...form, relation: e.target.value as Relation })}
                className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
              >
                {(Object.keys(RELATIONS) as Relation[]).map((r) => (
                  <option key={r} value={r}>
                    {RELATIONS[r].label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="distance" className="mb-1 block text-xs font-bold text-ink/60">
                いまの距離感
              </label>
              <select
                id="distance"
                value={form.distance_level}
                onChange={(e) =>
                  setForm({
                    ...form,
                    distance_level: e.target.value as Person["distance_level"],
                  })
                }
                className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
              >
                {(Object.keys(DISTANCES) as Person["distance_level"][]).map((d) => (
                  <option key={d} value={d}>
                    {DISTANCES[d]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="note" className="mb-1 block text-xs font-bold text-ink/60">
              関係メモ（この人に効いた接し方など・非公開）
            </label>
            <textarea
              id="note"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="例：結論から話すと機嫌が良い。金曜は疲れてるので相談NG。"
              rows={3}
              className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
          </div>
          <button
            type="submit"
            disabled={!form.nickname.trim() || !form.type_code}
            className="w-full rounded-full bg-teal px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            保存する
          </button>
          <p className="text-xs text-ink/50">
            人物データはこの端末にのみ保存され、共有時にもニックネームは含まれません。
          </p>
        </form>
      )}

      {people.length === 0 && !showForm && (
        <div className="card p-8 text-center text-sm text-ink/50">
          まだ人物が登録されていません。
          <br />
          「＋ 追加」から気になる人を保存してみましょう。
        </div>
      )}

      <ul className="space-y-3">
        {people.map((p) => {
          const t = getType(p.type_code);
          return (
            <li key={p.id} className="card flex items-center gap-3 p-4">
              <CharacterAvatar code={p.type_code} size={64} showBadge={false} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-ink">{p.nickname}</span>
                  <span className="font-mono text-xs font-bold text-teal">
                    {p.type_code}
                  </span>
                  <span className="chip bg-mist text-xs text-ink/60">
                    {RELATIONS[p.relation].label}・{DISTANCES[p.distance_level]}
                  </span>
                </div>
                {t && <div className="text-xs text-ink/50">{t.role}</div>}
                {p.note && (
                  <p className="mt-1 truncate text-xs text-ink/60">📝 {p.note}</p>
                )}
              </div>
              <div className="flex shrink-0 flex-col gap-1.5">
                <Link
                  href={`/compatibility?person=${p.id}`}
                  className="rounded-full bg-teal px-3 py-1.5 text-center text-xs font-bold text-white"
                >
                  相性
                </Link>
                <button
                  onClick={() => edit(p)}
                  className="rounded-full border border-ink/15 px-3 py-1.5 text-xs text-ink/60"
                >
                  編集
                </button>
                <button
                  onClick={() => remove(p)}
                  className="rounded-full border border-coral/40 px-3 py-1.5 text-xs text-coral"
                >
                  削除
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function PeoplePage() {
  return (
    <Suspense>
      <PeopleInner />
    </Suspense>
  );
}
