import Link from "next/link";
import { notFound } from "next/navigation";
import { getType, GROUPS, TYPE_CODES } from "@/data/atlas";
import CharacterAvatar from "@/components/CharacterAvatar";
import Disclaimer from "@/components/Disclaimer";
import RecentTracker from "@/components/RecentTracker";

export function generateStaticParams() {
  return TYPE_CODES.map((code) => ({ code }));
}

export function generateMetadata({ params }: { params: { code: string } }) {
  const t = getType(params.code);
  return {
    title: t ? `${t.type_code} ${t.role} | Type Atlas` : "Type Atlas",
    description: t?.one_liner,
  };
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5">
      <h2 className="mb-3 text-sm font-bold tracking-wide text-teal">{title}</h2>
      {children}
    </section>
  );
}

function List({ items, marker = "・" }: { items: string[]; marker?: string }) {
  return (
    <ul className="space-y-2 text-sm leading-relaxed text-ink/80">
      {items.map((s) => (
        <li key={s} className="flex gap-2">
          <span aria-hidden className="shrink-0 text-teal">
            {marker}
          </span>
          {s}
        </li>
      ))}
    </ul>
  );
}

export default function TypeDetailPage({
  params,
}: {
  params: { code: string };
}) {
  const t = getType(params.code);
  if (!t) notFound();
  const group = GROUPS[t.group];

  return (
    <div className="space-y-4">
      <RecentTracker code={t.type_code} />

      {/* ヘッダー */}
      <div className="card flex items-center gap-4 p-5">
        <CharacterAvatar code={t.type_code} size={110} />
        <div>
          <div
            className="font-display tracking-wide text-sm font-bold tracking-widest"
            style={{ color: group.color }}
          >
            {t.type_code}
          </div>
          <h1 className="text-2xl font-bold text-ink">{t.role}</h1>
          <p className="mt-1 text-sm leading-relaxed text-ink/70">{t.one_liner}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/compatibility?b=${t.type_code}`}
          className="flex flex-1 items-center justify-center whitespace-nowrap rounded-full bg-teal px-4 py-3 text-sm font-bold text-white"
        >
          相性を見る
        </Link>
        <Link
          href={`/people?add=${t.type_code}`}
          className="flex flex-1 items-center justify-center whitespace-nowrap rounded-full border border-teal px-4 py-3 text-sm font-bold text-teal"
        >
          人物に登録する
        </Link>
      </div>

      <Section title="頭の中 — 情報の集め方と決め方">
        <p className="text-sm leading-relaxed text-ink/80">{t.thinking_pattern}</p>
        <p className="mt-2 text-sm leading-relaxed text-ink/80">
          <span className="font-bold text-ink">大切にしやすいこと：</span>
          {t.core_motivation}
        </p>
      </Section>

      <Section title="得意 — 自然に出る強み">
        <List items={t.strengths} />
      </Section>

      <Section title="盲点 — やりすぎると困る傾向">
        <List items={t.blind_spots} marker="△" />
      </Section>

      <Section title="会話 — 刺さる伝え方">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-teal/5 p-3">
            <h3 className="mb-2 text-xs font-bold text-teal">DO おすすめ</h3>
            <List items={t.communication_do} marker="◯" />
          </div>
          <div className="rounded-lg bg-coral/5 p-3">
            <h3 className="mb-2 text-xs font-bold text-coral">DON&apos;T 避けたい</h3>
            <List items={t.communication_dont} marker="✕" />
          </div>
        </div>
      </Section>

      <Section title="ストレス — 余裕がない時のサインと対応">
        <h3 className="mb-2 text-xs font-bold text-coral">出やすいサイン</h3>
        <List items={t.stress_signals} marker="！" />
        <h3 className="mb-2 mt-4 text-xs font-bold text-teal">回復を助ける接し方</h3>
        <List items={t.recovery_tips} marker="◯" />
      </Section>

      <Section title="仕事 — 上司・部下・同僚として">
        <p className="text-sm leading-relaxed text-ink/80">{t.work_profile}</p>
      </Section>

      <Section title="友達 — 距離感と付き合い方">
        <p className="text-sm leading-relaxed text-ink/80">{t.friend_profile}</p>
      </Section>

      <Section title="恋愛 — 安心を感じること">
        <p className="text-sm leading-relaxed text-ink/80">{t.love_profile}</p>
      </Section>

      <Section title="成長 — 小さな練習">
        <List items={t.growth_exercises} marker="→" />
      </Section>

      <Disclaimer />
    </div>
  );
}
