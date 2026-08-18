import { AXIS_SCORES, Relation, TypeCode, getType } from "@/data/atlas";

// 会話の翻訳機（設計書4章・13章）。
// LLMではなく、相手タイプの軸傾向に基づくルールベースの言い換え提案。
// 「相手の心を読む」のではなく、届きやすい構造の候補を3案提示する。

export interface Suggestion {
  label: string;
  example: string;
  why: string;
}

function trimEnd(text: string): string {
  return text.trim().replace(/[。．\s]+$/, "");
}

export function translateMessage(
  rawText: string,
  targetCode: TypeCode,
  relation: Relation
): Suggestion[] {
  const t = getType(targetCode);
  const ax = AXIS_SCORES[targetCode];
  if (!t || !ax) return [];
  const core = trimEnd(rawText);
  if (!core) return [];

  const role = t.role;
  const feeling = ax.decision >= 50;
  const thinksFirst = ax.speed < 50;
  const planner = ax.planning < 50;
  const relWord = { work: "仕事", friend: "友達", love: "恋愛" }[relation];

  const suggestions: Suggestion[] = [];

  // 案1: 決め方（論理/気持ち）に合わせる
  if (feeling) {
    suggestions.push({
      label: "気持ちを先に添える",
      example: `いつもありがとう。${core}。あなたの状況も聞きたいから、無理そうなら教えてね。`,
      why: `${role}（${targetCode}）は内容の正しさより先に「関係への配慮があるか」を感じ取りやすいタイプ。最初のひと言の温度で、その後の受け取り方が変わります。`,
    });
  } else {
    suggestions.push({
      label: "結論と理由をセットに",
      example: `結論から言うと、${core}。理由は◯◯だから。どう思う？`,
      why: `${role}（${targetCode}）は結論が先にあり、根拠が通っている話を信頼しやすいタイプ。前置きや感情の説明が長いと本題が届く前に集中が切れます。`,
    });
  }

  // 案2: テンポ（即レス/熟考）に合わせる
  if (thinksFirst) {
    suggestions.push({
      label: "考える時間を渡す",
      example: `${core}。すぐじゃなくて大丈夫だから、考えておいてもらえる？◯日ごろにまた聞くね。`,
      why: `${role}は考えてから話すタイプ。その場の即答を求めないだけで、返ってくる答えの質と本音度が大きく上がります。文字で先に送っておくのも有効です。`,
    });
  } else {
    suggestions.push({
      label: "短く直接、テンポよく",
      example: `${core}！ちょっと話せる？直接話した方が早いと思って。`,
      why: `${role}は話しながら考えるタイプ。長文を送るより、短く投げて会話の中で決める方が、お互いのストレスが少なく話が進みます。`,
    });
  }

  // 案3: 計画スタイル（確定/柔軟）に合わせる
  if (planner) {
    suggestions.push({
      label: "期限と確定情報を添える",
      example: `${core}。時期は◯日までを考えてる。難しければ代わりの案も用意してあるから言ってね。`,
      why: `${role}は見通しが立つほど安心して動けるタイプ。特に${relWord}の場面では、日付・範囲・代替案がある依頼や提案は「ちゃんとしている」と信頼されます。`,
    });
  } else {
    suggestions.push({
      label: "選択肢と余白を残す",
      example: `${core}。AとBどっちでもいけるから、気が向く方でどう？途中で変えてもOK。`,
      why: `${role}は選択肢と柔軟性があるほど前向きになるタイプ。細部まで確定させた一本道の提案は、内容が良くても窮屈に感じられることがあります。`,
    });
  }

  return suggestions;
}
