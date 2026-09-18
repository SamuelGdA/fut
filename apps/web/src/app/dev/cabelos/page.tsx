"use client";

/**
 * Dev-only contact sheet for the hair set.
 *
 * Every style against three skin tones and three hair colours, at the two sizes
 * the game actually draws an avatar: the large creator preview and the small
 * one inside a card. A shape that reads at 160px can turn to mush at 40, and a
 * dark style on a dark skin tone can lose its silhouette entirely.
 */

import { useEffect } from "react";
import { Avatar } from "@/components/Avatar";
import { DEFAULT_AVATAR, HAIR_COLORS, HAIR_STYLES, SKIN_TONES } from "@/lib/avatar/config";

const SKINS = [1, 4, 7];
const COLOURS = [0, 3, 6];

function useSnapshot() {
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Section 2 is the skin-tone x hair-colour grid: 8 styles per colour,
      // three colours per skin tone. Rows 0 and 2 of the first tone give the
      // darkest and the lightest hair.
      const rows = Array.from(document.querySelectorAll("main section"))[2];
      if (!rows) return;
      const svgs = Array.from(rows.querySelectorAll("svg"));
      const dark = svgs.filter((_, i) => i % 3 === 0).slice(0, 8);
      const light = svgs.filter((_, i) => i % 3 === 2).slice(0, 8);
      const picked = [...dark, ...light];
      const cell = 300;
      const canvas = document.createElement("canvas");
      canvas.width = cell * 8;
      canvas.height = cell * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#131c2b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < picked.length; i++) {
        const clone = picked[i].cloneNode(true) as SVGElement;
        clone.setAttribute("width", String(cell));
        clone.setAttribute("height", String(cell));
        clone.removeAttribute("class");
        const markup = new XMLSerializer().serializeToString(clone);
        const img = new Image();
        await new Promise((r) => {
          img.onload = r;
          img.onerror = r;
          img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
        });
        ctx.drawImage(img, (i % 8) * cell, Math.floor(i / 8) * cell, cell, cell);
      }
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r));
      if (blob) await fetch("/dev/snap?name=cabelos", { method: "POST", body: blob });
    }, 800);
    return () => clearTimeout(timer);
  }, []);
}

export default function HairSheet() {
  useSnapshot();
  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <h1 className="font-display text-2xl font-black">Cabelos</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        {HAIR_STYLES.length} estilos. Cada um em três tons de pele e três cores de cabelo, no
        tamanho grande do criador e no tamanho pequeno da carta.
      </p>

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-2">
          tamanho do criador
        </h2>
        <div className="flex flex-wrap gap-4">
          {HAIR_STYLES.map((hair) => (
            <div key={hair} className="flex w-[132px] flex-col items-center gap-1">
              <Avatar
                config={{ ...DEFAULT_AVATAR, hair, skin: SKINS[1], hairColor: COLOURS[0] }}
                className="h-32 w-32 rounded-xl bg-surface-2"
                showBackground={false}
              />
              <span className="font-mono text-[10px] text-muted-2">{hair}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-2">
          tamanho da carta
        </h2>
        <div className="flex flex-wrap gap-3">
          {HAIR_STYLES.map((hair) => (
            <Avatar
              key={hair}
              config={{ ...DEFAULT_AVATAR, hair, skin: SKINS[1], hairColor: COLOURS[0] }}
              className="h-12 w-12 rounded-md bg-surface-2"
              showBackground={false}
            />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-2">
          todos os tons de pele × cores de cabelo
        </h2>
        {SKINS.map((skin) => (
          <div key={skin} className="mb-3 flex flex-wrap items-center gap-2">
            <span className="w-16 shrink-0 font-mono text-[10px] text-muted-2">
              pele {skin} · {SKIN_TONES[skin]}
            </span>
            {HAIR_STYLES.map((hair) =>
              COLOURS.map((hairColor) => (
                <Avatar
                  key={`${hair}-${hairColor}`}
                  config={{ ...DEFAULT_AVATAR, hair, skin, hairColor }}
                  className="h-11 w-11 rounded bg-surface-2"
                  showBackground={false}
                />
              )),
            )}
          </div>
        ))}
        <p className="mt-2 font-mono text-[10px] text-muted-2">
          cores: {COLOURS.map((c) => HAIR_COLORS[c]).join(" · ")}
        </p>
      </section>
    </main>
  );
}
