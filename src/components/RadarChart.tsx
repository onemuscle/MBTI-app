import { AXES } from "@/data/atlas";
import { AxisResult } from "@/lib/compatibility";

// 6軸の相性プロファイル（設計書3章・7.3章）
// 各軸の「噛み合いやすさスコア」を1つのポリゴンで示す
export default function RadarChart({
  axes,
  size = 280,
}: {
  axes: AxisResult[];
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 44;
  const n = axes.length;

  const point = (i: number, value: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const rr = (r * value) / 100;
    return [cx + rr * Math.cos(angle), cy + rr * Math.sin(angle)];
  };

  const polygon = (value: (a: AxisResult, i: number) => number) =>
    axes
      .map((a, i) => point(i, value(a, i)).map((v) => v.toFixed(1)).join(","))
      .join(" ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto w-full max-w-[320px]"
      role="img"
      aria-label={`6軸の相性プロファイル: ${axes
        .map((a) => `${a.label}${a.score}点`)
        .join("、")}`}
    >
      {[25, 50, 75, 100].map((lv) => (
        <polygon
          key={lv}
          points={polygon(() => lv)}
          fill="none"
          stroke="#152238"
          strokeOpacity={lv === 100 ? 0.25 : 0.1}
          strokeWidth="1"
        />
      ))}
      {axes.map((a, i) => {
        const [x, y] = point(i, 100);
        return (
          <line
            key={a.key}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#152238"
            strokeOpacity="0.1"
          />
        );
      })}
      <polygon
        points={polygon((a) => a.score)}
        fill="#2E6F6A"
        fillOpacity="0.25"
        stroke="#2E6F6A"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {axes.map((a, i) => {
        const [x, y] = point(i, a.score);
        return <circle key={a.key} cx={x} cy={y} r="3.5" fill="#2E6F6A" />;
      })}
      {axes.map((a, i) => {
        const [x, y] = point(i, 128);
        const axisDef = AXES.find((d) => d.key === a.key);
        return (
          <text
            key={a.key}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-ink"
            fontSize="11"
            fontWeight="600"
          >
            {axisDef?.short ?? a.label}
            <tspan x={x} dy="12" fontSize="10" fontWeight="400" opacity="0.6">
              {a.score}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}
