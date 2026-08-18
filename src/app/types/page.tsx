import { GROUPS, TYPE_CODES, TYPES, GroupKey } from "@/data/atlas";
import TypeCard from "@/components/TypeCard";
import CollectionProgress from "@/components/CollectionProgress";

export const metadata = { title: "16タイプ図鑑 | Type Atlas" };

const GROUP_ORDER: GroupKey[] = ["concept", "heart", "craft", "action"];

export default function TypesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">16タイプ図鑑</h1>
        <p className="mt-1 text-sm text-ink/60">
          気になるタイプを選ぶと、特徴・会話のコツ・ストレスサインまで見られます。
        </p>
      </div>
      <CollectionProgress />
      {GROUP_ORDER.map((g) => {
        const group = GROUPS[g];
        const codes = TYPE_CODES.filter((c) => TYPES[c].group === g);
        return (
          <section key={g} aria-labelledby={`group-${g}`}>
            <h2
              id={`group-${g}`}
              className="mb-3 flex items-center gap-2 text-sm font-bold"
              style={{ color: group.color }}
            >
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: group.color }}
              />
              {group.label}
              <span className="font-normal text-ink/50">{group.description}</span>
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {codes.map((code) => (
                <TypeCard key={code} code={code} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
