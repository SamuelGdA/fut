import type { ReactNode } from "react";
import type { BroadcastEmblem as Emblem } from "../../features/career/broadcastPackages";

/** Estrela de cinco pontas centrada em (cx, cy). */
function star(cx: number, cy: number, radius: number, inner = 0.45): string {
  const points = Array.from({ length: 10 }, (_, index) => {
    const angle = ((-90 + index * 36) * Math.PI) / 180;
    const r = index % 2 ? radius * inner : radius;
    return `${(cx + r * Math.cos(angle)).toFixed(2)} ${(cy + r * Math.sin(angle)).toFixed(2)}`;
  });
  return `M${points.join("L")}Z`;
}

/** Raios de um sol: compridos nos eixos e nas diagonais, curtos entre eles. */
function rays(): string {
  return Array.from({ length: 16 }, (_, index) => {
    const angle = (index * 22.5 * Math.PI) / 180;
    const end = index % 2 ? 7.9 : 10;
    const at = (r: number) => `${(12 + r * Math.cos(angle)).toFixed(2)} ${(12 + r * Math.sin(angle)).toFixed(2)}`;
    return `M${at(5.4)}L${at(end)}`;
  }).join("");
}

const RING = Array.from({ length: 8 }, (_, index) => {
  const angle = ((index * 45 - 90) * Math.PI) / 180;
  return star(12 + 7.4 * Math.cos(angle), 12 + 7.4 * Math.sin(angle), 2.4);
}).join("");

const SHIELD = "M12 3 19.5 5.7v5.8c0 4.7-3.1 7.9-7.5 9.5-4.4-1.6-7.5-4.8-7.5-9.5V5.7Z";

/**
 * Os selos são formas genéricas que lembram cada competição (o anel de
 * estrelas, o louro da glória, o escudo do campeão), nunca uma marca.
 */
const SHAPES: Readonly<Record<Emblem, ReactNode>> = {
  starball: <path d={RING} fill="currentColor" stroke="none" />,
  arcs: <><circle cx="12" cy="12" r="8.4" strokeWidth="3" strokeDasharray="5.4 3.4" /><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" /></>,
  diamond: <><path d="M12 2.5 21.5 12 12 21.5 2.5 12Z" /><path d="M12 7.6 16.4 12 12 16.4 7.6 12Z" fill="currentColor" stroke="none" /></>,
  laurel: <><path d="M10.8 20.6C6.4 19 3.9 14.8 4.7 8.6M13.2 20.6c4.4-1.6 6.9-5.8 6.1-12M4.6 11 2.5 10M5.4 14.3 3.3 14M7.2 17.2 5.4 17.8M19.4 11l2.1-1M18.6 14.3l2.1-.3M16.8 17.2l1.8.6" /><path d={star(12, 8.6, 3.4)} fill="currentColor" stroke="none" /></>,
  compass: <><path d="M12 2 13.8 10.2 22 12 13.8 13.8 12 22 10.2 13.8 2 12 10.2 10.2Z" fill="currentColor" stroke="none" /><path d="M16.6 7.4 13.2 12 16.6 16.6 12 13.2 7.4 16.6 10.8 12 7.4 7.4 12 10.8Z" fill="currentColor" stroke="none" opacity=".55" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18M4.6 7.5h14.8M4.6 16.5h14.8" /></>,
  cup: <path d="M7.5 4h9v4.5a4.5 4.5 0 0 1-9 0ZM7.5 6H4.8a2.6 2.6 0 0 0 3 3.4M16.5 6h2.7a2.6 2.6 0 0 1-3 3.4M12 13v3.6M9.8 16.6h4.4l.6 3.6H9.2Z" />,
  crown: <><path d="M4 18h16M4.6 18 3.5 8l4.8 4 3.7-6 3.7 6 4.8-4-1.1 10" /><path d="M4 21h16" strokeWidth="1.2" /></>,
  plate: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="6.2" strokeDasharray="1 1.7" /><circle cx="12" cy="12" r="2.6" /></>,
  scudetto: <><path d={SHIELD} /><rect x="7.9" y="7.6" width="2.4" height="8.6" rx=".6" style={{ fill: "var(--bc-rule-1, currentColor)" }} stroke="none" /><rect x="10.8" y="7.6" width="2.4" height="9.6" rx=".6" style={{ fill: "var(--bc-rule-2, currentColor)" }} stroke="none" /><rect x="13.7" y="7.6" width="2.4" height="8.6" rx=".6" style={{ fill: "var(--bc-rule-3, currentColor)" }} stroke="none" /></>,
  sunstripes: <><circle cx="12" cy="12" r="9" /><path d="M3.9 8h16.2M3 12h18M3.9 16h16.2" strokeWidth="2" /></>,
  hexagon: <><path d="M12 2.8 20 7.4v9.2L12 21.2 4 16.6V7.4Z" /><path d="M12 7.4 16 9.7v4.6l-4 2.3-4-2.3V9.7Z" fill="currentColor" stroke="none" opacity=".45" /></>,
  starsphere: <><circle cx="12" cy="12" r="8.6" /><path d="M3.8 10.6c5-2.2 11.4-2 16.6.9" /><path d={`${star(9.2, 14.6, 1.5)}${star(13.4, 16.4, 1.3)}${star(15.8, 13.4, 1.1)}${star(11.2, 18.4, 1)}`} fill="currentColor" stroke="none" /></>,
  sun: <><circle cx="12" cy="12" r="3.6" fill="currentColor" stroke="none" /><path d={rays()} /></>,
  star: <path d={star(12, 12.8, 9.6)} />,
  pennant: <path d="M2.5 5.5c6 2.2 13 2.2 19 0M4.6 6.5l2 7 2-6.2M10 7.6l2 7.2 2-7.2M15.4 7.3l2 6.2 2-7" />,
  starshield: <><path d={SHIELD} /><path d={star(12, 11.6, 3.8)} fill="currentColor" stroke="none" /></>,
  shield: <><path d={SHIELD} /><path d="M4.6 10.6h14.8" /></>,
  mosaic: <><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 1 9 9h-9ZM12 21a9 9 0 0 1-9-9h9Z" fill="currentColor" stroke="none" /></>,
};

export function BroadcastEmblem({ emblem }: { emblem: Emblem }) {
  return (
    <svg className="bc-emblem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" data-emblem={emblem}>
      {SHAPES[emblem]}
    </svg>
  );
}
