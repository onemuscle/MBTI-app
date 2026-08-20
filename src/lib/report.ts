import { AXIS_SCORES, Relation, RELATIONS, TypeCode, getType } from "@/data/atlas";
import {
  AxisResult,
  buildRecoveryPlaybook,
  computeCompatibility,
  RecoveryPlaybook,
} from "./compatibility";

// ペア完全レポート: 相性エンジン + タイプ図鑑データから
// 長文の読み物レポートをルールベースで生成する。

export interface ReportSection {
  title: string;
  paragraphs?: string[];
  items?: string[];
}

export interface PairReport {
  headline: string;
  total: number;
  axes: AxisResult[];
  sections: ReportSection[];
  playbook: RecoveryPlaybook;
}

// 「時間が経つと来る壁」の軸別テンプレート。{H}=high側, {L}=low側
const WALL_TEXT: Record<string, { wall: string; over: string }> = {
  speed: {
    wall: "最初は新鮮だった会話のテンポの違いが、「返事が遅い」「急かされる」という日常の不満に変わってくる。",
    over: "「即レスが必要な話」と「ゆっくりでいい話」をラベル分けする習慣を作る。急ぎは電話、それ以外は既読スルーOKのルールにすると、お互いの負担が消える。",
  },
  granularity: {
    wall: "{H}の「いつかこうしたい」という夢の話と、{L}の「で、具体的には？」が噛み合わず、会話が減っていく時期が来やすい。",
    over: "夢の話には「実現チェック」を持ち込まない、実務の話には「夢の広げ直し」を持ち込まない。会話の種類を分けるだけで、どちらの話も楽しめるようになる。",
  },
  decision: {
    wall: "大きな決断（仕事、住まい、お金）の場面で、{L}の「合理的に正しい選択」と{H}の「気持ちが納得できる選択」が衝突しやすい。",
    over: "決断は二段階に分ける: まず{L}が選択肢と根拠を整理し、次に{H}が「どれなら心から納得できるか」を選ぶ。役割分担にすると衝突が協力に変わる。",
  },
  planning: {
    wall: "{H}の自由さが{L}には「振り回される」に、{L}の計画性が{H}には「息苦しい」に見え始める時期が来る。慣れた頃の予定変更が一番効く。",
    over: "予定に最初から「自由枠」を作る（例: 旅行は午前だけ計画して午後はノープラン）。{L}は枠で安心でき、{H}は枠内で自由でいられる。",
  },
  expression: {
    wall: "{H}は「気持ちが返ってこない」と不安になり、{L}は「感情の確認が多くて疲れる」と感じる、静かなすれ違いが蓄積しやすい。",
    over: "頻度の期待値を合わせる: 毎日の細かい共有ではなく、週に一度しっかり話す時間を決める。{L}は準備ができて話しやすく、{H}は確実に受け取れる安心がある。",
  },
  repair: {
    wall: "喧嘩のたびに「追いかける側」と「離れる側」の構図が固定化し、喧嘩の内容よりこの構図自体が問題になっていく。",
    over: "平時に仲直りのルールを決めておく（例:「一旦休憩」と言ったら翌日必ず話す）。ルールがあれば、離れることが拒絶ではなく手順になる。",
  },
};

export function buildPairReport(
  aCode: TypeCode,
  bCode: TypeCode,
  relation: Relation
): PairReport | null {
  const aType = getType(aCode);
  const bType = getType(bCode);
  if (!aType || !bType) return null;

  const result = computeCompatibility(aCode, bCode, relation, {
    a: `${aCode}側`,
    b: `${bCode}側`,
  });
  const relLabel = RELATIONS[relation].label;
  const bAx = AXIS_SCORES[bCode];
  const sections: ReportSection[] = [];

  // 1. 二人の構図
  sections.push({
    title: "この二人の基本構図",
    paragraphs: [
      `${aCode}（${aType.role}）は「${aType.one_liner}」、${bCode}（${bType.role}）は「${bType.one_liner}」。`,
      `${relLabel}の関係で見たとき、この組み合わせの結論は「${result.headline}」。6つの軸のうち、近いのは${result.axes.filter((x) => x.kind === "aligned").length}軸、違いが大きいのは${result.axes.filter((x) => x.kind === "friction" || (x.kind === "complement" && x.diff >= 50)).length}軸。似た者同士でも正反対でもなく、この凸凹の組み合わせ自体がこのペアの個性になる。`,
    ],
  });

  // 2. うまくいく理由
  sections.push({
    title: "この二人がうまくいく理由",
    items: result.strengths,
  });

  // 3. 最初に来る小さなズレ
  sections.push({
    title: "最初に来る小さなズレ",
    items: result.frictions,
  });

  // 4. しばらくして来る壁
  const topWalls = result.axes
    .filter((x) => x.diff >= 40)
    .sort((x, y) => y.diff * y.weight - x.diff * x.weight)
    .slice(0, 2);
  if (topWalls.length > 0) {
    const wallParas: string[] = [];
    for (const w of topWalls) {
      const tpl = WALL_TEXT[w.key];
      const highLabel = w.a >= w.b ? `${aCode}側` : `${bCode}側`;
      const lowLabel = w.a >= w.b ? `${bCode}側` : `${aCode}側`;
      wallParas.push(
        `【${w.label}の壁】` +
          tpl.wall.replaceAll("{H}", highLabel).replaceAll("{L}", lowLabel) +
          " → 乗り越え方: " +
          tpl.over.replaceAll("{H}", highLabel).replaceAll("{L}", lowLabel)
      );
    }
    sections.push({
      title: "しばらくして来る壁と、乗り越え方",
      paragraphs: [
        "関係の初期は「新鮮な違い」だったものが、日常になると「積み重なる負担」に変わる。これはどのペアにも起きる自然な変化で、来ることを知っていれば軽く越えられる。",
        ...wallParas,
      ],
    });
  }

  // 5. 相手が言葉にしにくい本音
  const honne: string[] = [];
  honne.push(`【苦手なこと】${bType.communication_dont[0]}／${bType.communication_dont[1]}`);
  honne.push(`【余裕がないときのサイン】${bType.stress_signals[0]}`);
  for (const tip of bType.recovery_tips.slice(0, 2)) {
    honne.push(`【してもらえると嬉しいこと】${tip}`);
  }
  const loveOrWork =
    relation === "work"
      ? bType.work_profile
      : relation === "love"
        ? bType.love_profile
        : bType.friend_profile;
  sections.push({
    title: `${bCode}（${bType.role}）が言葉にしにくい本音`,
    paragraphs: [
      `${relLabel}の関係での${bType.role}はこんな傾向がある: ${loveOrWork}`,
      "その上で、本人からはなかなか言い出せないことが多いのは——",
    ],
    items: honne,
  });

  // 6. 二人の相性の伸ばし方
  const growItems: string[] = [];
  for (const tip of result.tipsAtoB.slice(0, 2)) {
    growItems.push(`${aCode}側から: ${tip}`);
  }
  for (const tip of result.tipsBtoA.slice(0, 2)) {
    growItems.push(`${bCode}側から: ${tip}`);
  }
  growItems.push(
    `二人で: ${
      bAx.planning < 50
        ? "月に一度、次の月の予定と「変えてもいい枠」を一緒に決める時間を作る。"
        : "月に一度、予定を決めない日を一緒に過ごし、その場の流れに任せてみる。"
    }`
  );
  sections.push({
    title: "この相性の伸ばし方",
    paragraphs: [
      "相性は固定値ではなく、お互いの歩み寄りが一つ増えるごとに実際に良くなっていく。効果が大きい順に——",
    ],
    items: growItems,
  });

  return {
    headline: result.headline,
    total: result.total,
    axes: result.axes,
    sections,
    playbook: buildRecoveryPlaybook(aCode, bCode, `${bCode}側`),
  };
}
