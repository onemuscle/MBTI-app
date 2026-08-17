"use client";

import { TYPE_CODES, TYPES } from "@/data/atlas";

export default function TypeSelect({
  id,
  label,
  value,
  onChange,
  allowEmpty = true,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  allowEmpty?: boolean;
}) {
  return (
    <div className="flex-1">
      <label htmlFor={id} className="mb-1 block text-xs font-bold text-ink/60">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
      >
        {allowEmpty && <option value="">選択してください</option>}
        {TYPE_CODES.map((code) => (
          <option key={code} value={code}>
            {code} {TYPES[code].role}
          </option>
        ))}
      </select>
    </div>
  );
}
