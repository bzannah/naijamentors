import Image from "next/image";
import { cn, initials } from "@/lib/cn";

type Props = {
  src?: string;
  name: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  shape?: "arch" | "arch-sm" | "circle" | "rounded" | "none";
  zoom?: boolean;
};

const SHAPES = {
  arch: "arch",
  "arch-sm": "arch-sm",
  circle: "rounded-full",
  rounded: "rounded-[22px]",
  none: "",
};

/** A mentor photo framed in Village's signature arch. Falls back to an Adire-patterned monogram. */
export function Portrait({ src, name, className, sizes = "400px", priority, shape = "arch", zoom }: Props) {
  return (
    <div
      className={cn(
        !className?.includes("absolute") && "relative",
        "isolate overflow-hidden bg-paper-3",
        SHAPES[shape],
        zoom && "img-zoom",
        className,
      )}
    >
      {src ? (
        <Image src={src} alt={`Portrait of ${name}`} fill sizes={sizes} preload={priority} loading={priority ? "eager" : undefined} className="object-cover" />
      ) : (
        <Monogram name={name} />
      )}
    </div>
  );
}

function Monogram({ name }: { name: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-forest text-gold-2 [container-type:inline-size]">
      <svg className="absolute inset-0 h-full w-full opacity-20" aria-hidden>
        <defs>
          <pattern id="mono-adire" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="14" cy="14" r="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="14" cy="14" r="2" fill="currentColor" />
            <circle cx="0" cy="0" r="1.4" fill="currentColor" />
            <circle cx="28" cy="28" r="1.4" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mono-adire)" />
      </svg>
      <span className="font-display relative text-[clamp(1.25rem,30cqw,4rem)] italic">{initials(name)}</span>
    </div>
  );
}

export function Avatar({ src, name, size = 40, className }: { src?: string; name: string; size?: number; className?: string }) {
  return (
    <div
      className={cn("relative shrink-0 overflow-hidden rounded-full bg-paper-3 ring-1 ring-black/5", className)}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image src={src} alt="" fill sizes={`${size * 2}px`} className="object-cover" />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-clay-soft to-gold-soft font-semibold text-clay"
          style={{ fontSize: size * 0.36 }}
        >
          {initials(name)}
        </div>
      )}
    </div>
  );
}
