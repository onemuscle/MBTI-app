import Link from "next/link";
import { AxisTopic } from "@/data/axisContent";
import CharacterAvatar from "./CharacterAvatar";

function Side({ side }: { side: AxisTopic["a"] }) {
  return (
    <div
      className="flex flex-1 flex-col items-center rounded-2xl border-2 p-3 text-center"
      style={{ borderColor: side.color, backgroundColor: `${side.color}0d` }}
    >
      <span
        className="font-display rounded-full px-4 py-1 text-sm font-bold tracking-wide text-white"
        style={{ backgroundColor: side.color }}
      >
        {side.code}（{side.label}）
      </span>
      <Link href={`/types/${side.sampleType}`} className="mt-3">
        <CharacterAvatar code={side.sampleType} size={72} showBadge={false} />
      </Link>
      <ul className="mt-2 space-y-1.5 text-left">
        {side.lines.map((l) => (
          <li key={l} className="text-xs leading-relaxed text-ink/80">
            {l}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AxisCard({ topic }: { topic: AxisTopic }) {
  return (
    <section className="card overflow-hidden p-5">
      <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-sm text-white">
          {topic.number}
        </span>
        {topic.emoji} {topic.title}
      </h2>
      <p className="mb-3 mt-1 text-xs font-bold text-ink/50">
        {topic.a.code}：{topic.a.label} <span className="mx-1">vs</span>{" "}
        {topic.b.code}：{topic.b.label}
      </p>
      <div className="flex gap-3">
        <Side side={topic.a} />
        <Side side={topic.b} />
      </div>
    </section>
  );
}
