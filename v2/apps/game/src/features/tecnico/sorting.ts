import { positionRank, type PlayerRow } from "./view";
export type SortKey = "chance" | "position" | "ovr" | "name" | "age" | "value";
export interface PlayerSort { key: SortKey; descending: boolean }
export const DEFAULT_SORT: PlayerSort = { key: "ovr", descending: true };
export function comparePlayers(a: PlayerRow, b: PlayerRow, sort: PlayerSort): number {
  const difference = sort.key === "chance" ? 0 : sort.key === "name" ? a.name.localeCompare(b.name)
    : sort.key === "position" ? positionRank(a.position)-positionRank(b.position) : a[sort.key]-b[sort.key];
  return (sort.descending ? -difference : difference) || b.ovr-a.ovr || a.name.localeCompare(b.name);
}
