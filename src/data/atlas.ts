import typesJson from "./types.json";

export type GroupKey = "concept" | "heart" | "craft" | "action";

export interface TypeProfile {
  type_code: string;
  role: string;
  group: GroupKey;
  props: string;
  impression: string;
  one_liner: string;
  core_motivation: string;
  thinking_pattern: string;
  strengths: string[];
  blind_spots: string[];
  communication_do: string[];
  communication_dont: string[];
  stress_signals: string[];
  recovery_tips: string[];
  work_profile: string;
  friend_profile: string;
  love_profile: string;
  growth_exercises: string[];
}

export const TYPE_CODES = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
] as const;

export type TypeCode = (typeof TYPE_CODES)[number];

export const TYPES = typesJson as Record<string, TypeProfile>;

export function getType(code: string): TypeProfile | undefined {
  return TYPES[code.toUpperCase()];
}

export const GROUPS: Record<
  GroupKey,
  { label: string; color: string; description: string }
> = {
  concept: {
    label: "Concept",
    color: "#5F7ADB",
    description: "分析・抽象寄り",
  },
  heart: { label: "Heart", color: "#E67E6B", description: "共感・価値寄り" },
  craft: { label: "Craft", color: "#52A98F", description: "実務・ケア寄り" },
  action: { label: "Action", color: "#D4A547", description: "行動・現場寄り" },
};

export function groupColor(code: string): string {
  const t = getType(code);
  return t ? GROUPS[t.group].color : "#5F7ADB";
}

// 6つの評価軸（設計書5章）。各タイプの傾向を 0-100 で表す。
// low / high はそれぞれ 0 側・100 側の意味。
export const AXES = [
  {
    key: "speed",
    label: "コミュニケーション速度",
    short: "テンポ",
    low: "考えてから話す",
    high: "話しながら考える",
  },
  {
    key: "granularity",
    label: "情報の粒度",
    short: "粒度",
    low: "具体・事実",
    high: "抽象・可能性",
  },
  {
    key: "decision",
    label: "意思決定",
    short: "決め方",
    low: "論理・基準",
    high: "価値・関係",
  },
  {
    key: "planning",
    label: "計画スタイル",
    short: "計画",
    low: "確定・締切",
    high: "柔軟・探索",
  },
  {
    key: "expression",
    label: "感情表現",
    short: "感情",
    low: "内で処理する",
    high: "外に出す",
  },
  {
    key: "repair",
    label: "衝突修復",
    short: "修復",
    low: "時間を置いて整理",
    high: "すぐ対話で確認",
  },
] as const;

export type AxisKey = (typeof AXES)[number]["key"];

export const AXIS_SCORES: Record<TypeCode, Record<AxisKey, number>> = {
  INTJ: { speed: 30, granularity: 78, decision: 15, planning: 20, expression: 20, repair: 25 },
  INTP: { speed: 35, granularity: 85, decision: 18, planning: 75, expression: 25, repair: 30 },
  ENTJ: { speed: 80, granularity: 65, decision: 10, planning: 15, expression: 65, repair: 55 },
  ENTP: { speed: 85, granularity: 88, decision: 25, planning: 80, expression: 75, repair: 65 },
  INFJ: { speed: 30, granularity: 75, decision: 70, planning: 30, expression: 35, repair: 45 },
  INFP: { speed: 32, granularity: 80, decision: 85, planning: 70, expression: 40, repair: 40 },
  ENFJ: { speed: 75, granularity: 70, decision: 80, planning: 25, expression: 80, repair: 80 },
  ENFP: { speed: 85, granularity: 85, decision: 78, planning: 80, expression: 85, repair: 75 },
  ISTJ: { speed: 25, granularity: 15, decision: 25, planning: 15, expression: 20, repair: 20 },
  ISFJ: { speed: 28, granularity: 20, decision: 70, planning: 25, expression: 30, repair: 45 },
  ESTJ: { speed: 78, granularity: 20, decision: 15, planning: 10, expression: 60, repair: 50 },
  ESFJ: { speed: 75, granularity: 25, decision: 78, planning: 20, expression: 78, repair: 80 },
  ISTP: { speed: 35, granularity: 25, decision: 20, planning: 78, expression: 18, repair: 22 },
  ISFP: { speed: 30, granularity: 30, decision: 80, planning: 75, expression: 35, repair: 38 },
  ESTP: { speed: 88, granularity: 22, decision: 25, planning: 85, expression: 70, repair: 60 },
  ESFP: { speed: 85, granularity: 28, decision: 75, planning: 80, expression: 85, repair: 78 },
};

export type Relation = "work" | "friend" | "love";

export const RELATIONS: Record<Relation, { label: string; icon: string }> = {
  work: { label: "仕事", icon: "💼" },
  friend: { label: "友達", icon: "🎈" },
  love: { label: "恋愛", icon: "💛" },
};

// 関係別ウェイト（設計書5章）
export const RELATION_WEIGHTS: Record<Relation, Record<AxisKey, number>> = {
  work: { speed: 20, granularity: 20, decision: 20, planning: 20, expression: 5, repair: 15 },
  friend: { speed: 15, granularity: 10, decision: 15, planning: 15, expression: 20, repair: 25 },
  love: { speed: 15, granularity: 10, decision: 20, planning: 15, expression: 20, repair: 20 },
};
