import { expect,it } from "vitest";
import { totalStats } from "./statistics";
it("totais somam competições sem perder minutos e calculam nota ponderada por jogos",()=>{
  const result=totalStats([{apps:20,starts:18,minutes:1600,goals:10,assists:4,ratingSum:140,cleanSheets:8,goalsConceded:12},{apps:2,goals:1,assists:0,ratingSum:12}]);
  expect(result).toEqual({apps:22,starts:18,minutes:1600,goals:11,assists:4,ratingSum:152,cleanSheets:8,goalsConceded:12});
  expect(result.ratingSum/result.apps).toBeCloseTo(6.909,3);
});
