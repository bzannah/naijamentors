import { useId } from "react";
import { cn } from "@/lib/cn";

/** Adire-inspired tie-dye circles, drawn in currentColor. */
export function AdirePattern({ className, size = 44 }: { className?: string; size?: number }) {
  const id = useId();
  return (
    <svg className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} aria-hidden>
      <defs>
        <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
          <circle cx={size / 2} cy={size / 2} r={size * 0.27} fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx={size / 2} cy={size / 2} r={size * 0.15} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
          <circle cx={size / 2} cy={size / 2} r={size * 0.045} fill="currentColor" />
          <circle cx="0" cy="0" r={size * 0.035} fill="currentColor" />
          <circle cx={size} cy="0" r={size * 0.035} fill="currentColor" />
          <circle cx="0" cy={size} r={size * 0.035} fill="currentColor" />
          <circle cx={size} cy={size} r={size * 0.035} fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Adire "eleko" style lines — a softer, linear pattern for dark sections. */
export function AdireLines({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} aria-hidden>
      <defs>
        <pattern id={id} width="64" height="64" patternUnits="userSpaceOnUse">
          <path d="M0 32h64M32 0v64" stroke="currentColor" strokeWidth="0.6" />
          <path d="M8 8l16 16M40 40l16 16M56 8L40 24M24 40L8 56" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
          <circle cx="32" cy="32" r="5" fill="none" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="32" cy="32" r="1.6" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/*
  The village line: the logo's line, continued. Each figure is a stem with a head; the line climbs each
  person and reaches down to the next, so a mentor and a young person become a whole village.
  Shorter figures are the young people, with gold heads, exactly as in the mark.
*/
const VILLAGE = [1, 0.64, 0.86, 0.52, 0.95, 0.7, 0.58, 0.9, 0.66, 1, 0.55, 0.82, 0.93, 0.6, 0.76];

type Pt = [number, number];

/** A polyline with circular fillets of radius r at every interior corner. */
function filletPath(pts: Pt[], r: number) {
  const f = (n: number) => Math.round(n * 100) / 100;
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [p0, p1, p2] = [pts[i - 1], pts[i], pts[i + 1]];
    const v1 = [p0[0] - p1[0], p0[1] - p1[1]];
    const v2 = [p2[0] - p1[0], p2[1] - p1[1]];
    const l1 = Math.hypot(v1[0], v1[1]);
    const l2 = Math.hypot(v2[0], v2[1]);
    const u1 = [v1[0] / l1, v1[1] / l1];
    const u2 = [v2[0] / l2, v2[1] / l2];
    const t = r / Math.tan(Math.acos(Math.max(-1, Math.min(1, u1[0] * u2[0] + u1[1] * u2[1]))) / 2);
    const sweep = u1[0] * u2[1] - u1[1] * u2[0] > 0 ? 0 : 1;
    d += ` L${f(p1[0] + u1[0] * t)} ${f(p1[1] + u1[1] * t)} A${r} ${r} 0 0 ${sweep} ${f(p1[0] + u2[0] * t)} ${f(p1[1] + u2[1] * t)}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L${f(last[0])} ${f(last[1])}`;
}

function villageGeometry(count: number, offset: number) {
  const step = 46;
  const unit = 52;
  const sw = 7;
  const top = 20; // room for the tallest head
  const base = top + unit;
  const people = Array.from({ length: count }, (_, i) => {
    const h = VILLAGE[(i + offset) % VILLAGE.length];
    const young = h < 0.72;
    const r = sw * (young ? 0.62 : 0.72);
    const x = sw + 4 + i * step;
    const y = base - h * unit;
    return { x, y, young, head: { cx: x, cy: y - sw / 2 - sw * (young ? 0.5 : 0.57) - r, r } };
  });
  const pts: Pt[] = [[people[0].x, base]];
  people.forEach((p, i) => {
    pts.push([p.x, p.y]);
    if (i < people.length - 1) pts.push([people[i + 1].x, base]);
  });
  return { d: filletPath(pts, sw * 0.46), people, sw, width: people[count - 1].x + sw + 4, height: base + sw / 2 + 2 };
}

export function VillageLine({
  className,
  count = 40,
  offset = 0,
  height = 56,
  accent = "var(--color-gold)",
}: {
  className?: string;
  count?: number;
  offset?: number;
  height?: number;
  accent?: string;
}) {
  const g = villageGeometry(count, offset);
  return (
    <div aria-hidden className={cn("flex justify-center overflow-hidden", className)}>
      <svg
        viewBox={`0 0 ${g.width} ${g.height}`}
        className="village-line shrink-0"
        style={{ height, width: (g.width / g.height) * height }}
      >
        <path d={g.d} pathLength={1} fill="none" stroke="currentColor" strokeWidth={g.sw} strokeLinecap="round" strokeLinejoin="round" />
        {g.people.map((p, i) => (
          <circle
            key={i}
            {...p.head}
            fill={p.young ? accent : "currentColor"}
            style={{ "--d": `${300 + i * 45}ms` } as React.CSSProperties}
          />
        ))}
      </svg>
    </div>
  );
}

/** Thin woven aso-oke strip. */
export function AsoOke({ className }: { className?: string }) {
  return <div aria-hidden className={cn("aso-oke h-1.5 w-full", className)} />;
}

/** Concentric sun rings — a quiet focal ornament behind portraits. */
export function SunRings({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={cn("pointer-events-none", className)} aria-hidden>
      {[190, 160, 130, 100].map((r, i) => (
        <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="currentColor" strokeWidth={i === 0 ? 1 : 0.8} strokeDasharray={i % 2 ? "2 6" : undefined} />
      ))}
      {Array.from({ length: 48 }).map((_, i) => {
        const a = (i / 48) * Math.PI * 2;
        const cx = Math.round((200 + Math.cos(a) * 175) * 100) / 100;
        const cy = Math.round((200 + Math.sin(a) * 175) * 100) / 100;
        return <circle key={i} cx={cx} cy={cy} r="1.6" fill="currentColor" />;
      })}
    </svg>
  );
}
