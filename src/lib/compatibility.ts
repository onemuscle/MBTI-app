import {
  AXES,
  AXIS_SCORES,
  AxisKey,
  Relation,
  RELATION_WEIGHTS,
  TypeCode,
  getType,
} from "@/data/atlas";

// 一致が良い軸と、違いが補完になりうる軸を分ける（設計書5章）
const COMPLEMENT_AXES: AxisKey[] = ["granularity", "decision"];

export interface AxisResult {
  key: AxisKey;
  label: string;
  short: string;
  a: number;
  b: number;
  diff: number;
  score: number; // 0-100 この軸での噛み合いやすさ
  kind: "aligned" | "complement" | "friction" | "neutral";
  weight: number;
}

export interface Tip {
  text: string;
}

export interface CompatibilityOutput {
  relation: Relation;
  total: number; // 補助表示用
  headline: string; // 20文字前後の結論
  axes: AxisResult[];
  strengths: string[]; // うまくいく場面
  frictions: string[]; // ズレやすい場面
  tipsAtoB: string[]; // あなた → 相手
  tipsBtoA: string[]; // 相手 → あなた（受け取り方の違い）
  recovery: string[]; // 揉めた時のリカバリー
}

type Side = "low" | "high";

function sideOf(v: number): Side {
  return v >= 50 ? "high" : "low";
}

// ---- 文章テンプレート（ルールベース。断定を避けた言い回しにする） ----

const ALIGNED_TEXT: Record<AxisKey, { low: string; high: string; mid: string }> = {
  speed: {
    low: "二人とも考えてから話すタイプ。沈黙を気まずさではなく、考える時間としてお互い尊重しやすい。",
    high: "二人とも話しながら考えるタイプ。テンポの良いやり取りで、思いつきから話を広げやすい。",
    mid: "会話のテンポ感が近く、返事の速さで不安になりにくい組み合わせ。",
  },
  granularity: {
    low: "二人とも具体的な事実ベースで話すので、認識合わせがスムーズになりやすい。",
    high: "二人とも可能性やアイデアの話が好きで、抽象的な話題でも通じ合いやすい。",
    mid: "話の粒度が近く、「話が噛み合わない」感覚が起きにくい。",
  },
  decision: {
    low: "二人とも論理と基準で決めるので、感情論に頼らず建設的に議論しやすい。",
    high: "二人とも気持ちや関係性を大切に決めるので、お互いの配慮に気づき合いやすい。",
    mid: "物事の決め方の感覚が近く、判断の理由をお互い理解しやすい。",
  },
  planning: {
    low: "二人とも計画と締切を大切にするので、予定のすれ違いが起きにくい。",
    high: "二人とも柔軟に動きたいタイプ。急な変更もお互い様として受け止めやすい。",
    mid: "予定の立て方の感覚が近く、段取りでの摩擦が少なめ。",
  },
  expression: {
    low: "二人とも感情を内で整理するタイプ。感情をぶつけ合う喧嘩にはなりにくい。",
    high: "二人とも感情を素直に出すタイプ。気持ちが見えるので誤解が長引きにくい。",
    mid: "感情の出し方の温度感が近く、重すぎず軽すぎない距離を保ちやすい。",
  },
  repair: {
    low: "揉めた時は二人とも一度時間を置くタイプ。冷却期間をお互い責めずに取れる。",
    high: "揉めた時は二人ともすぐ話したいタイプ。その日のうちに仲直りしやすい。",
    mid: "仲直りのペースが近く、修復のタイミングでのすれ違いが少なめ。",
  },
};

// 補完軸：違いが役割分担になる場合の文章。{H}=high側, {L}=low側
const COMPLEMENT_TEXT: Record<AxisKey, string> = {
  speed:
    "{H}が会話の口火を切って場を動かし、{L}が考えを整理して深める。テンポの違いを役割にできると強い。",
  granularity:
    "{H}が新しい可能性やアイデアを持ち込み、{L}が現実の段取りや安定を作る。視野の違いが補完関係になりやすい。",
  decision:
    "{H}が人の気持ちや納得感を拾い、{L}が基準と論理で判断を支える。両輪になれると決定の質が上がりやすい。",
  planning:
    "{H}が変化への柔軟さを、{L}が確実な進行を担う。役割を認め合えると幅広い状況に強いペアになる。",
  expression:
    "{H}が気持ちを言葉にして場をほぐし、{L}が落ち着きを保つ。感情の温度差をバランスとして使いやすい。",
  repair:
    "{H}が対話のきっかけを作り、{L}が整理された論点を持ち寄る。役割が噛み合うと修復が早い。",
};

// 摩擦：ズレやすい場面。{H}=high側, {L}=low側
const FRICTION_TEXT: Record<AxisKey, string> = {
  speed:
    "返事や決断のスピード感。{H}にはテンポよく話したい場面が、{L}には考える時間を奪われる場面になりやすい。",
  granularity:
    "{H}のアイデア段階の話を、{L}が「実行する話」と受け取ると認識差が生まれやすい。話の抽象度が合わずに「結局何の話？」となることも。",
  decision:
    "{H}は気持ちや関係への配慮を、{L}は筋の通った理由を重視しやすい。「正しさ」と「思いやり」が対立して見える場面に注意。",
  planning:
    "予定変更の頻度。{H}には自然な柔軟性でも、{L}には準備を崩される負担になりやすい。",
  expression:
    "{H}は気持ちを出して確かめたいのに、{L}は内で処理したい。反応の薄さが「無関心」に、感情表現が「重い」に見えやすい。",
  repair:
    "揉めた後の距離感。{H}はすぐ話して解消したいが、{L}は時間を置いて整理したい。追いかけるほど遠ざかる構図になりやすい。",
};

// 伝え方のコツ：自分のsideから相手のsideへ。
const TIP_HIGH_TO_LOW: Record<AxisKey, string> = {
  speed:
    "即答を求めず「明日までに考えておいて」と時間を渡す。沈黙は拒絶ではなく思考中のサイン。",
  granularity:
    "「考えてるだけの話」か「決めたい話」かを最初に言い分ける。実行の話は具体的な段取りとセットで。",
  decision:
    "気持ちだけでなく「なぜそうしたいか」の理由も一言添えると、真剣さが伝わりやすい。",
  planning:
    "予定変更は気づいた時点で早めに。理由と代替案をセットで伝えると負担が減る。",
  expression:
    "感情をぶつける前に一呼吸。「聞いてほしいだけ」と先に言うと、相手も受け止めやすい。",
  repair:
    "すぐ解決を迫らず「落ち着いたら話そう。待ってるね」と伝えて、相手のペースを尊重する。",
};

const TIP_LOW_TO_HIGH: Record<AxisKey, string> = {
  speed:
    "結論が出ていなくても「考え中」と途中経過を一言返す。無反応の時間が相手には一番不安。",
  granularity:
    "アイデア話を否定から入らず「面白いね。実行するなら条件は？」と夢の話と実行の話を分けて受ける。",
  decision:
    "正しさを伝える前に、相手の気持ちを一言受け止める。「そう感じたんだね、でこう考えると…」の順番。",
  planning:
    "柔軟な余白を最初から予定に入れておく。全部を確定させようとすると相手は窮屈になりやすい。",
  expression:
    "一人で整理する時間を取るときは「嫌になったわけじゃない」と一言添える。気持ちの確認も時々言葉で。",
  repair:
    "時間を置きたいときは「明日話そう」と期限を示す。無言の保留は相手には不安が募りやすい。",
};

// リカバリー手順（repair軸・decision軸の組み合わせから生成）
function buildRecovery(a: number, b: number, decA: number, decB: number): string[] {
  const out: string[] = [];
  const aSide = sideOf(a);
  const bSide = sideOf(b);
  if (aSide === "high" && bSide === "high") {
    out.push("二人ともすぐ話したいタイプ。感情が熱いうちは事実と気持ちを分けて、短く区切って話す。");
  } else if (aSide === "low" && bSide === "low") {
    out.push("二人とも時間を置きたいタイプ。冷却期間はOK。ただし「いつ話すか」だけ先に決めて、自然消滅を防ぐ。");
  } else {
    const wantTalk = aSide === "high" ? "あなた" : "相手";
    const wantTime = aSide === "high" ? "相手" : "あなた";
    out.push(
      `${wantTalk}はすぐ話したく、${wantTime}は時間を置きたくなりやすい。「今夜は置いて、明日話す」のように時間を区切るのが折衷案。`
    );
  }
  const decMixed = Math.abs(decA - decB) >= 40;
  if (decMixed) {
    out.push("片方は事実の整理、片方は気持ちの確認を求めやすい。順番は「まず気持ちに共感 → 次に事実の整理」が安全。");
  } else if (sideOf(decA) === "high") {
    out.push("お互い気持ちを大切にするタイプ。「どっちが悪いか」より「どうすれば安心か」を話すと早い。");
  } else {
    out.push("お互い論理で整理するタイプ。事実を並べるのは得意でも、最後に「嫌な思いをさせたね」の一言を忘れずに。");
  }
  out.push("仲直りの締めに、次から使う合図（例：「一旦休憩」の一言）を1つ決めておくと再発時に軽く済む。");
  return out;
}

function headline(axes: AxisResult[], total: number): string {
  const frictions = axes.filter((x) => x.kind === "friction");
  const complements = axes.filter((x) => x.kind === "complement");
  const aligned = axes.filter((x) => x.kind === "aligned");
  const topFriction = frictions.sort((x, y) => y.diff * y.weight - x.diff * x.weight)[0];

  const frictionWord: Record<AxisKey, string> = {
    speed: "テンポは違う",
    granularity: "見ている世界は違う",
    decision: "決め方は違う",
    planning: "計画の流儀は違う",
    expression: "感情の出し方は違う",
    repair: "仲直りの型は違う",
  };

  if (!topFriction && aligned.length >= 4) {
    return "感覚が近く、自然体でいられる組み合わせ。";
  }
  if (topFriction && complements.length >= 1) {
    return `${frictionWord[topFriction.key]}。でも役割分担で強くなれるペア。`;
  }
  if (topFriction && aligned.length >= 2) {
    return `${frictionWord[topFriction.key]}。土台の感覚は近い二人。`;
  }
  if (topFriction) {
    return `${frictionWord[topFriction.key]}。違いを知れば楽になる組み合わせ。`;
  }
  return total >= 70
    ? "噛み合いやすく、安定して付き合える組み合わせ。"
    : "似た所と違う所が半々。知って付き合うと楽な二人。";
}

// 距離感別アドバイス（設計書4章: 温度感スライダー）
export type Distance = "first" | "close" | "tense";

export function distanceTips(
  distance: Distance,
  axes: AxisResult[],
  bLabel: string
): string[] {
  const tips: string[] = [];
  const big = axes
    .filter((x) => x.diff >= 40)
    .sort((x, y) => y.diff * y.weight - x.diff * x.weight);
  const top = big[0];

  if (distance === "first") {
    tips.push(
      `まだお互いのパターンが読めない時期。${bLabel}の反応を「性格」と決めつけず、2〜3回は様子を見る余裕を持つとうまくいきやすい。`
    );
    if (top?.key === "speed")
      tips.push("返信や反応の速さの差は、初対面期は特に誤解されやすいポイント。「遅い＝脈なし/やる気なし」と早合点しないこと。");
    else if (top?.key === "planning")
      tips.push("最初のうちは約束の変更を最小限に。信頼貯金ができる前のドタキャンは、後々まで印象に残ります。");
    else if (top?.key === "expression")
      tips.push("感情表現の量の差は初期ほど大きく見えます。リアクションが薄くても興味がないとは限りません。");
    else if (top)
      tips.push(`一番差が大きいのは「${top.label}」。最初の数回はここでの違和感を「相性が悪い」と結論づけないのがコツ。`);
    tips.push("小さな約束（時間を守る・言ったことをやる）を一つずつ果たすのが、どのタイプ相手でも最強の初期戦略。");
  } else if (distance === "close") {
    tips.push(
      "仲良くなった今こそ「慣れによる雑さ」に注意。関係の摩擦の多くは、遠慮がなくなった時期に始まります。"
    );
    if (top?.key === "planning")
      tips.push(`親しくなると予定変更やドタキャンが増えがち。${bLabel}にとってそれは「軽く扱われている」サインに見えることがあります。`);
    else if (top?.key === "repair")
      tips.push("仲が良いほど衝突後の「いつもの仲直りパターン」が固定化します。うまくいっていないなら、今のうちに仲直りの型を話し合っておくと強い。");
    else if (top?.key === "expression")
      tips.push(`「言わなくても分かるだろう」が増える時期。${bLabel}との感情表現の差は、言葉にする習慣で埋め続けるのが安全です。`);
    else if (top)
      tips.push(`「${top.label}」の違いは慣れても消えません。相手が合わせてくれている部分に、時々気づいて感謝を言葉にすると長続きします。`);
    tips.push("関係メモに「この人に効いた接し方」を貯めておくと、マンネリや惰性を防げます。");
  } else {
    tips.push(
      "緊張状態のときは、正しさの主張より「安全な空気」の回復が最優先。どちらが正しいかの決着は後回しでいい。"
    );
    if (top?.key === "repair")
      tips.push("修復ペースの違いが今一番効いています。「話したい側」は待つ勇気を、「置きたい側」は期限を伝える誠実さを。");
    else
      tips.push(`今は「${top ? top.label : "違い"}」の差がいつもより大きく見える状態。相手の行動を最悪の意図で解釈しないよう意識的にブレーキを。`);
    tips.push("連絡は短く、事務的になりすぎず。「関係を切りたいわけではない」が伝わる一言（絵文字一つでも）が緊張を下げます。");
  }
  return tips.slice(0, 4);
}

// 衝突リカバリー手順書（時系列の詳細版）
export interface RecoveryPlaybook {
  phases: { title: string; items: string[] }[];
}

export function buildRecoveryPlaybook(
  aCode: TypeCode,
  bCode: TypeCode,
  bLabel: string
): RecoveryPlaybook {
  const a = AXIS_SCORES[aCode];
  const b = AXIS_SCORES[bCode];
  const aTalk = a.repair >= 50;
  const bTalk = b.repair >= 50;
  const bFeeling = b.decision >= 50;
  const bType = getType(bCode);

  const immediately: string[] = [];
  const sameDay: string[] = [];
  const nextDays: string[] = [];
  const after: string[] = [];

  // 直後（〜30分）
  immediately.push("まず深呼吸。感情のピークは長くても20〜30分。ここで送るメッセージが一番危険。");
  if (aTalk && !bTalk) {
    immediately.push(`あなたはすぐ話して解消したいタイプですが、${bLabel}は一度整理したいタイプ。今追いかけるほど遠ざかります。「落ち着いたら話そう。待ってる」だけ伝えて手を止める。`);
  } else if (!aTalk && bTalk) {
    immediately.push(`${bLabel}はすぐ話したいタイプ。無言で離れると不安が増幅します。「今は頭を冷やしたい。明日必ず話す」と期限付きで伝えてから離れる。`);
  } else if (aTalk && bTalk) {
    immediately.push("二人ともすぐ話したいタイプ。ただし熱いまま話すと論点がずれます。「5分だけ休憩してから話そう」と一呼吸挟むのが有効。");
  } else {
    immediately.push("二人とも時間を置きたいタイプ。無理に話さなくてOK。ただし「いつ話すか」だけは決めてから離れること（自然消滅が最大のリスク）。");
  }

  // 当日中
  sameDay.push(
    bFeeling
      ? `${bLabel}に短く一言だけ送る:「言い過ぎた（言い方が悪かった）。あなたとの関係は大事に思ってる」。内容の決着はまだつけない。`
      : `${bLabel}に短く一言だけ送る:「さっきは整理できてなかった。改めて話したい」。感情的な長文より、事実ベースの短文が届きます。`
  );
  sameDay.push("自分側の整理: 「何に怒った/傷ついたのか」を一つに絞る。論点が3つ以上ある喧嘩は解決しません。");

  // 数日以内（話し合い）
  nextDays.push(
    bFeeling
      ? "話し合いの順番: ①相手の気持ちを最後まで聞く → ②自分の気持ちを「私は〜と感じた」で伝える → ③事実の整理は最後。順番を逆にすると再燃します。"
      : "話し合いの順番: ①事実のすり合わせ（何が起きたか）→ ②お互いの意図の確認 → ③今後のルール決め。気持ちの話は責める形にしないこと。"
  );
  nextDays.push("「どっちが悪かったか」ではなく「次に同じ状況が来たらどうするか」を一つ決めて終える。");
  if (bType) {
    nextDays.push(`${bLabel}（${bType.role}）への効き方: ${bType.recovery_tips[0]}`);
  }

  // 仲直り後
  after.push("仲直り後24時間は蒸し返さない。追加の言い分を思い出しても、次の機会に回す。");
  after.push("次回のための合図を一つ決める: 「一旦休憩」と言ったらどちらも一度引く、など。型があると喧嘩は軽くなります。");

  return {
    phases: [
      { title: "直後（〜30分）", items: immediately },
      { title: "当日中", items: sameDay },
      { title: "数日以内の話し合い", items: nextDays },
      { title: "仲直りの後", items: after },
    ],
  };
}

export function computeCompatibility(
  aCode: TypeCode,
  bCode: TypeCode,
  relation: Relation,
  labels?: { a?: string; b?: string }
): CompatibilityOutput {
  const aScores = AXIS_SCORES[aCode];
  const bScores = AXIS_SCORES[bCode];
  const weights = RELATION_WEIGHTS[relation];
  const aLabel = labels?.a ?? "あなた";
  const bLabel = labels?.b ?? "相手";

  const axes: AxisResult[] = AXES.map((axis) => {
    const a = aScores[axis.key];
    const b = bScores[axis.key];
    const diff = Math.abs(a - b);
    const isComplement = COMPLEMENT_AXES.includes(axis.key);
    const score = Math.max(0, Math.round(100 - diff * (isComplement ? 0.45 : 1)));
    let kind: AxisResult["kind"] = "neutral";
    if (diff < 25) kind = "aligned";
    else if (isComplement && diff >= 40) kind = "complement";
    else if (diff >= 40) kind = "friction";
    return {
      key: axis.key,
      label: axis.label,
      short: axis.short,
      a,
      b,
      diff,
      score,
      kind,
      weight: weights[axis.key],
    };
  });

  const total = Math.round(
    axes.reduce((sum, x) => sum + x.score * x.weight, 0) /
      axes.reduce((sum, x) => sum + x.weight, 0)
  );

  const fill = (template: string, axis: AxisResult) => {
    const highLabel = axis.a >= axis.b ? aLabel : bLabel;
    const lowLabel = axis.a >= axis.b ? bLabel : aLabel;
    return template.replaceAll("{H}", highLabel).replaceAll("{L}", lowLabel);
  };

  // うまくいく場面：一致している軸 + 補完になっている軸から、重み順に3つ
  const strengthCandidates = [
    ...axes
      .filter((x) => x.kind === "aligned")
      .map((x) => {
        const mid = (x.a + x.b) / 2;
        const variant = mid >= 60 ? "high" : mid < 40 ? "low" : "mid";
        return { text: ALIGNED_TEXT[x.key][variant], sort: x.weight * (100 - x.diff) };
      }),
    ...axes
      .filter((x) => x.kind === "complement")
      .map((x) => ({ text: fill(COMPLEMENT_TEXT[x.key], x), sort: x.weight * x.diff })),
  ];
  const strengths = strengthCandidates
    .sort((x, y) => y.sort - x.sort)
    .slice(0, 3)
    .map((x) => x.text);

  // ズレやすい場面：差が大きい軸から重み×差の順に3つ（補完軸も、差が大きければ注意点として出す）
  const frictionCandidates = axes
    .filter((x) => x.kind === "friction" || (x.kind === "complement" && x.diff >= 50))
    .map((x) => ({ text: fill(FRICTION_TEXT[x.key], x), sort: x.weight * x.diff }));
  const frictions = frictionCandidates
    .sort((x, y) => y.sort - x.sort)
    .slice(0, 3)
    .map((x) => x.text);

  // 伝え方：差が大きい軸ベスト3について、自分の立ち位置に応じたコツ
  const tipAxes = axes
    .filter((x) => x.diff >= 35)
    .sort((x, y) => y.diff * y.weight - x.diff * x.weight)
    .slice(0, 3);
  const tipsAtoB = tipAxes.map((x) =>
    x.a >= x.b ? TIP_HIGH_TO_LOW[x.key] : TIP_LOW_TO_HIGH[x.key]
  );
  const tipsBtoA = tipAxes.map((x) =>
    x.b >= x.a ? TIP_HIGH_TO_LOW[x.key] : TIP_LOW_TO_HIGH[x.key]
  );
  // 差が小さい組み合わせでは、タイプ図鑑のDO/DON'Tから補完する
  if (tipsAtoB.length < 3) {
    const bType = getType(bCode);
    for (const d of bType?.communication_do ?? []) {
      if (tipsAtoB.length >= 3) break;
      if (!tipsAtoB.includes(d)) tipsAtoB.push(d);
    }
  }
  if (tipsBtoA.length < 3) {
    const aType = getType(aCode);
    for (const d of aType?.communication_do ?? []) {
      if (tipsBtoA.length >= 3) break;
      if (!tipsBtoA.includes(d)) tipsBtoA.push(d);
    }
  }

  const recovery = buildRecovery(
    aScores.repair,
    bScores.repair,
    aScores.decision,
    bScores.decision
  );

  if (strengths.length === 0) {
    strengths.push(
      "大きく重なる部分は少ない分、相手は自分にない視点を持つ相棒になりうる。違いを情報として面白がれると強い。"
    );
  }
  if (frictions.length === 0) {
    frictions.push(
      "目立った地雷は少なめ。ただし似ているからこそ、同じ弱点（例：どちらも我慢する等）が重なる場面には注意。"
    );
  }

  return {
    relation,
    total,
    headline: headline(axes, total),
    axes,
    strengths,
    frictions,
    tipsAtoB,
    tipsBtoA,
    recovery,
  };
}
