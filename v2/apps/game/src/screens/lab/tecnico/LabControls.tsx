import { CLUBS, type CountryCode, getCountry, PLAYABLE_COUNTRIES } from "@craque/world";
import type { ReactNode } from "react";
import { useTecnicoT } from "../../../i18n/tecnico/useTecnicoT";

/** Controles pequenos do laboratório do Técnico: seletor de clube e de país, tabela simples. */

export function ClubSelect({ value, onChange, label }: { value: string; onChange(club: string): void; label: string }) {
  const { locale } = useTecnicoT();
  return (
    <label className="tec-select flex flex-col gap-1">
      <span className="eyebrow">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {PLAYABLE_COUNTRIES.map((country) => (
          <optgroup key={country} label={getCountry(country)?.names[locale] ?? country}>
            {CLUBS.filter((club) => club.country === country)
              .sort((a, b) => a.division - b.division || a.name.localeCompare(b.name))
              .map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name} ({club.division}ª)
                </option>
              ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

export function CountrySelect({ value, onChange, label, only }: { value: CountryCode; onChange(country: CountryCode): void; label: string; only?: readonly CountryCode[] }) {
  const { locale } = useTecnicoT();
  const list = only ?? PLAYABLE_COUNTRIES;
  return (
    <label className="tec-select flex flex-col gap-1">
      <span className="eyebrow">{label}</span>
      <select
        value={value}
        onChange={(event) => {
          const next = list.find((country) => country === event.target.value);
          if (next) onChange(next);
        }}
      >
        {list.map((country) => (
          <option key={country} value={country}>
            {getCountry(country)?.names[locale] ?? country}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Tabela do laboratório: cabeçalho e linhas já prontos. */
export function LabTable({ head, rows, className }: { head: readonly ReactNode[]; rows: readonly (readonly ReactNode[])[]; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={`tec-table ${className ?? ""}`}>
        <thead>
          <tr>
            {head.map((cell, index) => (
              <th key={index} scope="col" className={index === 0 ? "text-left" : undefined}>
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, column) => (
                <td key={column} className={column === 0 ? "text-left" : "numeric"}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
