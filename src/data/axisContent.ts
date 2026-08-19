import { TypeCode } from "./atlas";

export interface AxisSide {
  code: "E" | "I" | "S" | "N" | "F" | "T" | "J" | "P";
  label: string;
  color: string;
  sampleType: TypeCode;
  lines: string[];
}

export interface AxisTopic {
  number: number;
  emoji: string;
  title: string;
  a: AxisSide;
  b: AxisSide;
}

// 4つの軸を、日常の「あるある」シーンで紹介する（設計書のタイプ不明モードの導入にも使える）
export const AXIS_TOPICS: AxisTopic[] = [
  {
    number: 1,
    emoji: "🏖️",
    title: "休日の過ごし方",
    a: {
      code: "E",
      label: "外向型",
      color: "#D4A547",
      sampleType: "ESFP",
      lines: [
        "予定が真っ白な休日ほど、なんだか誰かを誘いたくなる。",
        "「今日ヒマな人いない？」が自然と口をつく。",
        "人と話した分だけ、元気が満ちていく感覚がある。",
      ],
    },
    b: {
      code: "I",
      label: "内向型",
      color: "#5F7ADB",
      sampleType: "INFJ",
      lines: [
        "予定が真っ白な休日ほど、実はうれしい。",
        "「誰にも会わなくていい」と分かった瞬間から、もう幸せ。",
        "一人の時間で、静かにエネルギーを満たしていくタイプ。",
      ],
    },
  },
  {
    number: 2,
    emoji: "🛍️",
    title: "買い物のときの判断",
    a: {
      code: "S",
      label: "感覚型",
      color: "#52A98F",
      sampleType: "ISTJ",
      lines: [
        "「これ、本当に使うかな？」とまず現実的に考える。",
        "サイズ・値段・耐久性まで、つい確認してしまう。",
        "実際に手に取って確かめてから決めたい派。",
      ],
    },
    b: {
      code: "N",
      label: "直観型",
      color: "#E67E6B",
      sampleType: "INFP",
      lines: [
        "「これを持ってる自分、なんかいいかも」と可能性に惹かれる。",
        "使い道より、心が動く直感の方を優先しがち。",
        "新しい発想やイメージが、最後の決め手になりやすい。",
      ],
    },
  },
  {
    number: 3,
    emoji: "💬",
    title: "誰かの相談に乗るとき",
    a: {
      code: "F",
      label: "感情型",
      color: "#E67E6B",
      sampleType: "ESFJ",
      lines: [
        "「それはつらかったね」と、まず気持ちに寄り添う。",
        "話を聞きながら、相手以上に感情が動くことも。",
        "解決より先に、味方でいることを大事にしたい。",
      ],
    },
    b: {
      code: "T",
      label: "思考型",
      color: "#5F7ADB",
      sampleType: "INTJ",
      lines: [
        "「原因は何だろう」と、自然に整理が始まる。",
        "気づけば「こうすれば解決できそう」を考えている。",
        "感情より先に、状況をクリアにすることを優先しがち。",
      ],
    },
  },
  {
    number: 4,
    emoji: "✈️",
    title: "旅行の計画",
    a: {
      code: "J",
      label: "計画型",
      color: "#5F7ADB",
      sampleType: "ESTJ",
      lines: [
        "行き先も時間も、事前にしっかり決めておきたい。",
        "「次、14時の電車ね」の一言に、なぜか安心する。",
        "予定が固まるほど、旅を楽しめるタイプ。",
      ],
    },
    b: {
      code: "P",
      label: "知覚型",
      color: "#52A98F",
      sampleType: "ISFP",
      lines: [
        "「着いてから決めよう〜！」が合言葉。",
        "気になる場所を見つけたら、その場で予定変更もOK。",
        "決めすぎない余白こそ、旅の醍醐味だと思っている。",
      ],
    },
  },
];
