"use client";

import { Relation } from "@/data/atlas";

// ローカル保存（設計書11章のUser/Person/SavedInsightに相当）。
// バックエンド未接続のMVPでは localStorage に非公開で保存する。

export interface Person {
  id: string;
  nickname: string;
  type_code: string;
  relation: Relation;
  distance_level: "first" | "close" | "tense"; // 初対面 / 仲良し / 緊張状態
  note: string;
  created_at: string;
}

export interface SavedInsight {
  id: string;
  text: string;
  context: string; // 例: "ENFP × ISTJ / 恋愛"
  created_at: string;
}

const KEYS = {
  selfType: "typeatlas.selfType",
  people: "typeatlas.people",
  insights: "typeatlas.insights",
  recentTypes: "typeatlas.recentTypes",
  viewedTypes: "typeatlas.viewedTypes",
  viewedPairs: "typeatlas.viewedPairs",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getSelfType(): string | null {
  return read<string | null>(KEYS.selfType, null);
}

export function setSelfType(code: string | null) {
  if (code) write(KEYS.selfType, code);
  else window.localStorage.removeItem(KEYS.selfType);
}

export function getPeople(): Person[] {
  return read<Person[]>(KEYS.people, []);
}

export function savePerson(p: Omit<Person, "id" | "created_at"> & { id?: string }): Person {
  const people = getPeople();
  if (p.id) {
    const idx = people.findIndex((x) => x.id === p.id);
    if (idx >= 0) {
      const updated = { ...people[idx], ...p } as Person;
      people[idx] = updated;
      write(KEYS.people, people);
      return updated;
    }
  }
  const created: Person = {
    ...p,
    id: `p_${Math.random().toString(36).slice(2, 10)}`,
    created_at: new Date().toISOString(),
  };
  people.unshift(created);
  write(KEYS.people, people);
  return created;
}

export function deletePerson(id: string) {
  write(
    KEYS.people,
    getPeople().filter((x) => x.id !== id)
  );
}

export function getInsights(): SavedInsight[] {
  return read<SavedInsight[]>(KEYS.insights, []);
}

export function saveInsight(text: string, context: string): SavedInsight {
  const list = getInsights();
  const created: SavedInsight = {
    id: `i_${Math.random().toString(36).slice(2, 10)}`,
    text,
    context,
    created_at: new Date().toISOString(),
  };
  list.unshift(created);
  write(KEYS.insights, list);
  return created;
}

export function deleteInsight(id: string) {
  write(
    KEYS.insights,
    getInsights().filter((x) => x.id !== id)
  );
}

export function getRecentTypes(): string[] {
  return read<string[]>(KEYS.recentTypes, []);
}

export function pushRecentType(code: string) {
  const list = getRecentTypes().filter((c) => c !== code);
  list.unshift(code);
  write(KEYS.recentTypes, list.slice(0, 8));
}

// ---- 図鑑コンプリート（閲覧記録） ----

export function getViewedTypes(): string[] {
  return read<string[]>(KEYS.viewedTypes, []);
}

export function markTypeViewed(code: string) {
  const list = getViewedTypes();
  if (!list.includes(code)) {
    list.push(code);
    write(KEYS.viewedTypes, list);
  }
}

export function getViewedPairs(): string[] {
  return read<string[]>(KEYS.viewedPairs, []);
}

export function markPairViewed(a: string, b: string, relation: string) {
  const key = [`${[a, b].sort().join("x")}`, relation].join(":");
  const list = getViewedPairs();
  if (!list.includes(key)) {
    list.push(key);
    write(KEYS.viewedPairs, list);
  }
}

export interface CollectionTitle {
  name: string;
  condition: string;
  earned: boolean;
}

export function getCollectionTitles(): CollectionTitle[] {
  const types = getViewedTypes().length;
  const pairs = getViewedPairs().length;
  const people = getPeople().length;
  return [
    { name: "はじめの一歩", condition: "タイプを1つ見る", earned: types >= 1 },
    { name: "タイプの観察者", condition: "タイプを8つ見る", earned: types >= 8 },
    { name: "図鑑コンプリート", condition: "16タイプすべてを見る", earned: types >= 16 },
    { name: "関係の読み手", condition: "相性を5通り見る", earned: pairs >= 5 },
    { name: "相性の編集者", condition: "相性を20通り見る", earned: pairs >= 20 },
    { name: "人物図鑑の主", condition: "人物を3人登録する", earned: people >= 3 },
  ];
}

export function exportAllData(): string {
  return JSON.stringify(
    {
      exported_at: new Date().toISOString(),
      self_type: getSelfType(),
      people: getPeople(),
      insights: getInsights(),
    },
    null,
    2
  );
}

export function deleteAllData() {
  Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
}
