import Link from "next/link";
import { AXIS_TOPICS } from "@/data/axisContent";
import AxisCard from "@/components/AxisCard";
import Disclaimer from "@/components/Disclaimer";

export const metadata = {
  title: "4つの軸をゆるく知る | Type Atlas",
  description:
    "E/I・S/N・F/T・J/P。16タイプのもとになる4つの軸を、日常の「あるある」シーンで紹介します。",
};

export default function AxesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-ink">4つの軸をゆるく知る</h1>
        <p className="mt-1 text-sm leading-relaxed text-ink/60">
          16タイプは、この4つの軸の組み合わせでできています。
          「自分はどっちに近いかな？」くらいの気軽さで見てみてください。
        </p>
      </div>

      {AXIS_TOPICS.map((topic) => (
        <AxisCard key={topic.number} topic={topic} />
      ))}

      <div className="card p-5 text-center">
        <p className="text-sm leading-relaxed text-ink/70">
          4つの軸のどちらが多いかで、あなたの16タイプが決まります。
          <br />
          もう少し詳しく知りたくなったら、図鑑で1つずつのぞいてみてください。
        </p>
        <Link
          href="/types"
          className="mt-3 inline-block rounded-full bg-teal px-6 py-3 text-sm font-bold text-white"
        >
          16タイプ図鑑を見る
        </Link>
      </div>

      <Disclaimer />
    </div>
  );
}
