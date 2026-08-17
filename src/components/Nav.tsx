"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "ホーム", icon: "🏠" },
  { href: "/types", label: "図鑑", icon: "📖" },
  { href: "/compatibility", label: "相性", icon: "🔗" },
  { href: "/people", label: "人物", icon: "👥" },
  { href: "/my", label: "マイページ", icon: "⚙️" },
];

export default function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* デスクトップ: 上部バー */}
      <header className="fixed inset-x-0 top-0 z-40 hidden border-b border-ink/10 bg-white/90 backdrop-blur md:block">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold tracking-wide text-ink">
            TYPE <span className="text-teal">ATLAS</span>
          </Link>
          <nav className="flex gap-1">
            {TABS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive(t.href)
                    ? "bg-teal text-white"
                    : "text-ink/70 hover:bg-mist"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {/* モバイル: 下部タブ */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-3xl justify-around">
          {TABS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 text-[11px] ${
                isActive(t.href) ? "font-bold text-teal" : "text-ink/60"
              }`}
            >
              <span aria-hidden className="text-lg leading-none">
                {t.icon}
              </span>
              {t.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
