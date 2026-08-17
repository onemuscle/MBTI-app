import Link from "next/link";
import { getType, GROUPS } from "@/data/atlas";
import CharacterAvatar from "./CharacterAvatar";

export default function TypeCard({ code }: { code: string }) {
  const t = getType(code);
  if (!t) return null;
  const color = GROUPS[t.group].color;
  return (
    <Link
      href={`/types/${t.type_code}`}
      className="card flex flex-col items-center gap-2 p-4 transition-transform hover:-translate-y-0.5"
    >
      <CharacterAvatar code={t.type_code} size={88} />
      <div className="text-center">
        <div className="font-display tracking-wide text-sm font-bold tracking-widest" style={{ color }}>
          {t.type_code}
        </div>
        <div className="text-base font-bold text-ink">{t.role}</div>
        <p className="mt-1 text-xs leading-relaxed text-ink/60">{t.impression}</p>
      </div>
    </Link>
  );
}
