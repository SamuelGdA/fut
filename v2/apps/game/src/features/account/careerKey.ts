/**
 * A chave de uma carreira na nuvem (D112): um hash do jogo, do motor e do
 * setup (semente, identidade, desafio). É a mesma do começo ao fim da
 * carreira, então as conquistas do meio e o envio do fim caem na mesma linha
 * do banco, e reenviar nunca soma duas vezes.
 */
export function careerKey(game: "craque" | "tecnico", engine: string, setup: unknown): string {
  const source = JSON.stringify([game, engine, setup]);
  // cyrb53, o mesmo hash curto do Hall (features/hall/model.ts).
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let index = 0; index < source.length; index += 1) {
    const code = source.charCodeAt(index);
    h1 = Math.imul(h1 ^ code, 2654435761);
    h2 = Math.imul(h2 ^ code, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36).padStart(6, "0");
}
