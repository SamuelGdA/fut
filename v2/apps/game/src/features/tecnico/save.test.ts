import { beforeEach, describe, expect, it } from "vitest";
import { COACH_VERSION, coachCommand, createCoachCareer, type CoachCommand } from "@craque/engine/coach";
import { FREE_PLAYERS, SQUAD_PLAYERS } from "@craque/world/squads";
import { safeStorage } from "../../services/storage";
import { clearCoachSave, COACH_BACKUP_PREFIX, COACH_SAVE_KEY, preserveCoachSave, readCoachSave, writeCoachSave } from "./save";
const world={players:SQUAD_PLAYERS,free:FREE_PLAYERS};
const setup={seed:"save-coach",startYear:2026,mode:"slow" as const,identity:{name:"Teste",nationality:"BRA" as const}};
beforeEach(clearCoachSave);
describe("retomada do Técnico (D61)",()=>{
 it("uma versão antiga mantém uma cópia antes de substituir o diário (D71)",()=>{
  const old={version:"1.7.0",setup,commands:[{type:"advance"} as CoachCommand],avatar:null,club:"criciuma",year:2030};
  safeStorage.removeItem(COACH_BACKUP_PREFIX+old.version);
  safeStorage.setItem(COACH_SAVE_KEY,JSON.stringify(old));
  preserveCoachSave(readCoachSave()!);
  preserveCoachSave({...old,year:2026,commands:[]});
  expect(JSON.parse(safeStorage.getItem(COACH_BACKUP_PREFIX+old.version)!)).toEqual(old);
  expect(readCoachSave()).toEqual(old);
 });
 it("o diário refaz a mesma escalação e a seleção ainda aberta",()=>{
  let career=createCoachCareer(setup,world);
  const commands: CoachCommand[]=[{type:"acceptOffer",offer:career.offers[0]!.id},{type:"setTactics",formation:"3-4-3",philosophy:"possession"},{type:"openAction",kind:"youth"}];
  for(const command of commands){const result=coachCommand(career,command);expect(result.error).toBeNull();career=result.career;}
  writeCoachSave(career,null,commands);
  const saved=readCoachSave()!;expect(saved.version).toBe(COACH_VERSION);
  let replayed=createCoachCareer(saved.setup,world);
  for(const command of saved.commands){const result=coachCommand(replayed,command);expect(result.error).toBeNull();replayed=result.career;}
  expect(JSON.stringify(replayed)).toBe(JSON.stringify(career));
  expect(safeStorage.getItem(COACH_SAVE_KEY)).not.toContain('"players"');
  expect(safeStorage.getItem(COACH_SAVE_KEY)).not.toContain('"fixtures"');
 });
 it("encerrar remove o registro anterior",()=>{
  const career=createCoachCareer(setup,world);writeCoachSave(career,null,[]);expect(readCoachSave()).not.toBeNull();
  writeCoachSave({...career,phase:"ended"},null,[]);expect(readCoachSave()).toBeNull();
 });
 it("JSON e formatos inválidos são descartados sem quebrar a abertura",()=>{
  for(const raw of ["{quebrado",'{}','{"version":"1","setup":{},"commands":"bad"}']) {safeStorage.setItem(COACH_SAVE_KEY,raw);expect(readCoachSave()).toBeNull();expect(safeStorage.getItem(COACH_SAVE_KEY)).toBeNull();}
 });
});
