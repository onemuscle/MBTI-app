import { getType, GROUPS } from "@/data/atlas";

// 独自デザインの幾何学フラットキャラクター（設計書9章）。
// 既存サービスのキャラクターを参照せず、丸みのある図形 + タイプ別の小物で構成する。

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp(((n >> 16) & 255) + amount);
  const g = clamp(((n >> 8) & 255) + amount);
  const b = clamp((n & 255) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// タイプ別の小物（すべて単純図形の独自描画）
function Prop({ code, color }: { code: string; color: string }) {
  const dark = shade(color, -60);
  switch (code) {
    case "INTJ": // コンパス
      return (
        <g>
          <circle cx="0" cy="0" r="9" fill="#fff" stroke={dark} strokeWidth="2" />
          <path d="M0,-5 L3,3 L0,1 L-3,3 Z" fill={dark} />
        </g>
      );
    case "INTP": // ノート
      return (
        <g>
          <rect x="-8" y="-9" width="16" height="18" rx="2" fill="#fff" stroke={dark} strokeWidth="2" />
          <line x1="-4" y1="-4" x2="4" y2="-4" stroke={dark} strokeWidth="1.6" />
          <line x1="-4" y1="0" x2="4" y2="0" stroke={dark} strokeWidth="1.6" />
          <line x1="-4" y1="4" x2="1" y2="4" stroke={dark} strokeWidth="1.6" />
        </g>
      );
    case "ENTJ": // 行程ボード
      return (
        <g>
          <rect x="-9" y="-8" width="18" height="16" rx="2" fill="#fff" stroke={dark} strokeWidth="2" />
          <path d="M-5,4 L-1,-2 L3,1 L6,-5" fill="none" stroke={dark} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case "ENTP": // カード
      return (
        <g>
          <rect x="-9" y="-7" width="12" height="15" rx="2" fill="#fff" stroke={dark} strokeWidth="2" transform="rotate(-10)" />
          <rect x="-2" y="-7" width="12" height="15" rx="2" fill="#fff" stroke={dark} strokeWidth="2" transform="rotate(8)" />
        </g>
      );
    case "INFJ": // ランタン
      return (
        <g>
          <rect x="-6" y="-8" width="12" height="14" rx="3" fill="#fff" stroke={dark} strokeWidth="2" />
          <circle cx="0" cy="-1" r="3" fill={color} />
          <line x1="-4" y1="-8" x2="4" y2="-8" stroke={dark} strokeWidth="2" />
        </g>
      );
    case "INFP": // 小瓶
      return (
        <g>
          <path d="M-4,-8 L4,-8 L4,-5 L6,0 L6,7 A2,2 0 0 1 4,9 L-4,9 A2,2 0 0 1 -6,7 L-6,0 L-4,-5 Z" fill="#fff" stroke={dark} strokeWidth="2" />
          <rect x="-6" y="2" width="12" height="7" rx="2" fill={color} opacity="0.6" />
        </g>
      );
    case "ENFJ": // 旗
      return (
        <g>
          <line x1="-6" y1="-10" x2="-6" y2="10" stroke={dark} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M-4,-9 L9,-6 L-4,-2 Z" fill={color} stroke={dark} strokeWidth="1.6" strokeLinejoin="round" />
        </g>
      );
    case "ENFP": // 付箋
      return (
        <g>
          <rect x="-9" y="-8" width="10" height="10" rx="1.5" fill={color} opacity="0.85" transform="rotate(-8)" />
          <rect x="-1" y="-3" width="10" height="10" rx="1.5" fill="#fff" stroke={dark} strokeWidth="1.8" transform="rotate(6)" />
        </g>
      );
    case "ISTJ": // 時計
      return (
        <g>
          <circle cx="0" cy="0" r="9" fill="#fff" stroke={dark} strokeWidth="2" />
          <line x1="0" y1="0" x2="0" y2="-5.5" stroke={dark} strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="0" x2="4" y2="2" stroke={dark} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case "ISFJ": // 鍵
      return (
        <g>
          <circle cx="0" cy="-4" r="5" fill="#fff" stroke={dark} strokeWidth="2" />
          <line x1="0" y1="1" x2="0" y2="9" stroke={dark} strokeWidth="2.4" strokeLinecap="round" />
          <line x1="0" y1="6" x2="4" y2="6" stroke={dark} strokeWidth="2.4" strokeLinecap="round" />
        </g>
      );
    case "ESTJ": // チェックリスト
      return (
        <g>
          <rect x="-8" y="-9" width="16" height="18" rx="2" fill="#fff" stroke={dark} strokeWidth="2" />
          <path d="M-5,-4 L-3,-2 L0,-6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="2" y1="-4" x2="5" y2="-4" stroke={dark} strokeWidth="1.6" />
          <path d="M-5,3 L-3,5 L0,1" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="2" y1="3" x2="5" y2="3" stroke={dark} strokeWidth="1.6" />
        </g>
      );
    case "ESFJ": // ティーカップ
      return (
        <g>
          <path d="M-7,-3 L7,-3 L6,5 A3,3 0 0 1 3,7 L-3,7 A3,3 0 0 1 -6,5 Z" fill="#fff" stroke={dark} strokeWidth="2" />
          <path d="M7,-1 A3.5,3.5 0 0 1 7,5" fill="none" stroke={dark} strokeWidth="2" />
          <path d="M-2,-6 Q0,-8 -1,-10" fill="none" stroke={dark} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      );
    case "ISTP": // マルチツール（レンチ）
      return (
        <g transform="rotate(-40)">
          <path d="M-2,-9 A4.5,4.5 0 1 0 2,-9 L2,-3 L-2,-3 Z" fill="#fff" stroke={dark} strokeWidth="2" />
          <rect x="-2" y="-3" width="4" height="12" rx="1.5" fill="#fff" stroke={dark} strokeWidth="2" />
        </g>
      );
    case "ISFP": // 絵筆
      return (
        <g transform="rotate(35)">
          <rect x="-1.6" y="-10" width="3.2" height="12" rx="1.5" fill="#fff" stroke={dark} strokeWidth="1.8" />
          <path d="M-2,2 L2,2 L1.5,8 Q0,10 -1.5,8 Z" fill={color} stroke={dark} strokeWidth="1.4" />
        </g>
      );
    case "ESTP": // 双眼鏡
      return (
        <g>
          <circle cx="-4.5" cy="1" r="5" fill="#fff" stroke={dark} strokeWidth="2" />
          <circle cx="4.5" cy="1" r="5" fill="#fff" stroke={dark} strokeWidth="2" />
          <rect x="-3" y="-7" width="6" height="4" rx="1.5" fill="#fff" stroke={dark} strokeWidth="1.8" />
        </g>
      );
    case "ESFP": // スピーカー
      return (
        <g>
          <rect x="-8" y="-9" width="12" height="18" rx="2.5" fill="#fff" stroke={dark} strokeWidth="2" />
          <circle cx="-2" cy="2" r="4" fill={color} opacity="0.8" />
          <circle cx="-2" cy="-5" r="2" fill={dark} />
          <path d="M6,-4 A6,6 0 0 1 6,4" fill="none" stroke={dark} strokeWidth="1.8" strokeLinecap="round" />
        </g>
      );
    default:
      return null;
  }
}

export default function CharacterAvatar({
  code,
  size = 96,
  showBadge = true,
}: {
  code: string;
  size?: number;
  showBadge?: boolean;
}) {
  const t = getType(code);
  if (!t) return null;
  const color = GROUPS[t.group].color;
  const dark = shade(color, -60);
  const light = shade(color, 70);
  const skin = "#F6E3D0";
  const isExtrovert = code.startsWith("E");
  const intuitive = code[1] === "N";

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className="shrink-0"
      role="img"
      aria-label={`${t.role}（${code}）のキャラクター`}
    >
      {/* 背景 */}
      <rect x="4" y="4" width="112" height="112" rx="28" fill={light} opacity="0.45" />
      {intuitive ? (
        <>
          <circle cx="24" cy="26" r="4" fill={color} opacity="0.35" />
          <circle cx="98" cy="40" r="3" fill={color} opacity="0.35" />
          <circle cx="90" cy="20" r="2.5" fill={color} opacity="0.3" />
        </>
      ) : (
        <>
          <rect x="18" y="20" width="8" height="8" rx="2" fill={color} opacity="0.3" />
          <rect x="94" y="32" width="7" height="7" rx="2" fill={color} opacity="0.3" />
        </>
      )}
      {/* 体（丸みのある台形風） */}
      <path
        d="M32,116 L32,92 Q32,72 60,72 Q88,72 88,92 L88,116 Z"
        fill={color}
      />
      {/* 襟元 */}
      <path d="M50,74 Q60,82 70,74 L70,80 Q60,88 50,80 Z" fill={shade(color, -25)} />
      {/* 頭 */}
      <circle cx="60" cy="46" r="24" fill={skin} />
      {/* 髪（外向は明るく開いた形、内向は落ち着いた深めの形） */}
      {isExtrovert ? (
        <path
          d="M36,44 Q36,20 60,20 Q84,20 84,44 Q84,34 74,32 Q64,30 58,26 Q52,34 42,36 Q37,38 36,44 Z"
          fill={dark}
        />
      ) : (
        <path
          d="M36,46 Q34,20 60,20 Q86,20 84,46 Q82,32 72,30 Q60,28 50,31 Q39,34 38,48 Q37,48 36,46 Z"
          fill={dark}
        />
      )}
      {/* 表情（穏やか） */}
      <circle cx="51" cy="47" r="2.6" fill="#152238" />
      <circle cx="69" cy="47" r="2.6" fill="#152238" />
      <path d="M54,56 Q60,61 66,56" fill="none" stroke="#152238" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="45" cy="53" r="3.5" fill={color} opacity="0.3" />
      <circle cx="75" cy="53" r="3.5" fill={color} opacity="0.3" />
      {/* 小物バッジ */}
      {showBadge && (
        <g>
          <circle cx="90" cy="92" r="16" fill="#fff" stroke={color} strokeWidth="2.5" />
          <g transform="translate(90,92) scale(0.95)">
            <Prop code={code.toUpperCase()} color={color} />
          </g>
        </g>
      )}
    </svg>
  );
}
