import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { as, createUser, failure, freshDatabase } from "./banco";

/**
 * As migrações do Supabase (D112 e D114) num Postgres de verdade: RLS,
 * privilégio por coluna contra mass assignment, limites anti-trapaça,
 * idempotência dos envios, ranking enxuto e exclusão da conta.
 */

let db: PGlite;

const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

const career = (extra: Record<string, unknown> = {}) => ({
  temporadas: 18,
  partidas: 610,
  gols: 280,
  assistencias: 120,
  jogos_sem_sofrer: 0,
  titulos: 14,
  premios: 9,
  bolas_de_ouro: 2,
  melhor_ovr: 91,
  conquistas: ["firstCareer", "firstTitle"],
  ...extra,
});

const registerCareer = (key: string, data: Record<string, unknown>, game = "craque") =>
  db.query<{ resultado: { nova: boolean; ranqueada: boolean } }>("select public.registrar_carreira($1, $2, $3::jsonb) as resultado", [game, key, JSON.stringify(data)]);

const profileOf = async (user: string) =>
  (await db.query<Record<string, unknown>>("select * from public.profiles where id = $1", [user])).rows[0]!;

beforeAll(async () => {
  db = await freshDatabase();
});

describe("perfil criado com a conta", () => {
  it("guarda o @ pedido no cadastro quando é válido e livre", async () => {
    const user = await createUser(db, { username: "  Rocha_10 " });
    expect((await profileOf(user)).username).toBe("rocha_10");
  });

  it("deixa o @ vazio (vira o passo de escolha) quando já existe, é reservado ou inválido", async () => {
    for (const username of ["rocha_10", "admin", "a", "com espaço"]) {
      const user = await createUser(db, { username });
      expect((await profileOf(user)).username).toBeNull();
    }
    const google = await createUser(db, { full_name: "Fulano", avatar_url: "https://exemplo.com/a.png" });
    expect((await profileOf(google)).username).toBeNull();
  });
});

describe("RLS e privilégios", () => {
  it("cada um lê só o próprio perfil; visitante não lê perfil nenhum", async () => {
    const a = await createUser(db, { username: "jogador_a" });
    const b = await createUser(db, { username: "jogador_b" });
    const seen = await as(db, a, () => db.query<{ username: string }>("select username from public.profiles"));
    expect(seen.rows.map((row) => row.username)).toEqual(["jogador_a"]);
    expect(await as(db, null, () => failure(db.query("select * from public.profiles")))).toContain("permission denied");
    expect((await as(db, b, () => db.query("select * from public.profiles where id = $1", [a]))).rows).toHaveLength(0);
  });

  it("o catálogo é público e não aceita escrita da API", async () => {
    const rows = await as(db, null, () => db.query<{ total: number }>("select count(*)::int as total from public.conquistas"));
    expect(rows.rows[0]!.total).toBeGreaterThan(150);
    const user = await createUser(db);
    expect(await as(db, user, () => failure(db.query("insert into public.conquistas (id, jogo, grupo, raridade, nome, descricao) values ('x:y', 'craque', 'curious', 'common', '{}', '{}')")))).toContain("permission denied");
    expect(await as(db, user, () => failure(db.query("update public.conquistas set raridade = 'legendary'")))).toContain("permission denied");
  });

  it("o jogador muda o próprio @ e mais nada (mass assignment recusado pelo banco)", async () => {
    const user = await createUser(db);
    await as(db, user, () => db.query("update public.profiles set username = 'Craque_Novo' where id = $1", [user]));
    expect((await profileOf(user)).username).toBe("craque_novo");
    for (const statement of [
      "update public.profiles set gols = 9999 where id = $1",
      "update public.profiles set username = 'outro', melhor_ovr = 99 where id = $1",
      "update public.profiles set progresso = '{\"tenCareers\":10}' where id = $1",
      "update public.profiles set id = gen_random_uuid() where id = $1",
    ]) {
      expect(await as(db, user, () => failure(db.query(statement, [user])))).toContain("permission denied");
    }
    expect(await as(db, user, () => failure(db.query("update public.profiles set role = 'admin' where id = $1", [user])))).toMatch(/role|permission/);
    expect((await profileOf(user)).gols).toBe(0);
  });

  it("recusa @ reservado, inválido, repetido ou vazio, e não alcança o perfil de outro", async () => {
    const user = await createUser(db);
    const other = await createUser(db, { username: "ja_existe" });
    await as(db, user, () => db.query("update public.profiles set username = 'meu_nome' where id = $1", [user]));
    expect(await as(db, user, () => failure(db.query("update public.profiles set username = 'suporte' where id = $1", [user])))).toContain("username_invalido");
    expect(await as(db, user, () => failure(db.query("update public.profiles set username = 'ab' where id = $1", [user])))).toMatch(/check|username/);
    expect(await as(db, user, () => failure(db.query("update public.profiles set username = 'ja_existe' where id = $1", [user])))).toMatch(/duplicate|unique/);
    expect(await as(db, user, () => failure(db.query("update public.profiles set username = null where id = $1", [user])))).toContain("username_obrigatorio");
    const touched = await as(db, user, () => db.query("update public.profiles set username = 'roubado' where id = $1", [other]));
    expect(touched.affectedRows ?? 0).toBe(0);
    expect((await profileOf(other)).username).toBe("ja_existe");
  });

  it("troféus e carreiras só se leem, nunca se escrevem pela API", async () => {
    const user = await createUser(db);
    for (const statement of [
      "insert into public.user_trophies (id_user, id_trophy) values ($1, 'firstCareer')",
      "insert into public.carreiras (id_user, jogo, chave) values ($1, 'craque', 'abcdef12')",
    ]) {
      expect(await as(db, user, () => failure(db.query(statement, [user])))).toContain("permission denied");
    }
    expect(await as(db, user, () => failure(db.query("delete from public.user_trophies where id_user = $1", [user])))).toContain("permission denied");
  });

  it("as funções internas ficam fora do alcance da API", async () => {
    const user = await createUser(db);
    expect(await as(db, user, () => failure(db.query("select privado.garantir_perfil($1)", [user])))).toContain("permission denied");
    expect(await as(db, user, () => failure(db.query("select privado.username_valido('abc')")))).toContain("permission denied");
  });

  it("visitante só consulta o @ livre e o ranking", async () => {
    expect((await as(db, null, () => db.query<{ livre: boolean }>("select public.username_disponivel('jogador_a') as livre"))).rows[0]!.livre).toBe(false);
    expect((await as(db, null, () => db.query<{ livre: boolean }>("select public.username_disponivel('NOVO_NOME') as livre"))).rows[0]!.livre).toBe(true);
    expect((await as(db, null, () => db.query<{ livre: boolean }>("select public.username_disponivel('admin') as livre"))).rows[0]!.livre).toBe(false);
    for (const call of ["select public.registrar_conquistas('craque', 'abcdef12', array['firstCareer'])", "select public.registrar_carreira('craque', 'abcdef12', '{}')", "select public.importar_conquistas(array['firstCareer'])", "select public.excluir_conta()"]) {
      expect(await as(db, null, () => failure(db.query(call)))).toContain("permission denied");
    }
  });
});

describe("registrar_conquistas", () => {
  it("conta cada conquista uma vez por carreira e soma entre carreiras", async () => {
    const user = await createUser(db);
    const call = (key: string, ids: string[]) =>
      as(db, user, () => db.query<{ novas: number }>("select public.registrar_conquistas('craque', $1, $2) as novas", [key, ids]));
    expect((await call("carreira1", ["firstTitle", "firstCap"])).rows[0]!.novas).toBe(2);
    expect((await call("carreira1", ["firstTitle", "firstCap"])).rows[0]!.novas).toBe(0);
    expect((await call("carreira2", ["firstTitle"])).rows[0]!.novas).toBe(1);
    // Id inventado e conquista do outro jogo são ignorados, sem derrubar o envio.
    expect((await call("carreira3", ["inventada", "tecnico:firstSeason", "firstTitle"])).rows[0]!.novas).toBe(1);
    const trophies = await as(db, user, () => db.query<{ id_trophy: string; quantidade: number }>("select id_trophy, quantidade from public.user_trophies order by id_trophy"));
    expect(trophies.rows).toEqual([{ id_trophy: "firstCap", quantidade: 1 }, { id_trophy: "firstTitle", quantidade: 3 }]);
  });

  it("recusa jogo e chave fora do formato", async () => {
    const user = await createUser(db);
    expect(await as(db, user, () => failure(db.query("select public.registrar_conquistas('outro', 'abcdef12', array['firstCareer'])")))).toContain("jogo_invalido");
    expect(await as(db, user, () => failure(db.query("select public.registrar_conquistas('craque', 'CHAVE COM ESPAÇO', array['firstCareer'])")))).toContain("chave_invalida");
  });
});

describe("registrar_carreira", () => {
  it("soma ao perfil uma vez só, mesmo enviada de novo", async () => {
    const user = await createUser(db);
    const first = await as(db, user, () => registerCareer("carreiraok1", career()));
    expect(first.rows[0]!.resultado).toEqual({ nova: true, ranqueada: false });
    const again = await as(db, user, () => registerCareer("carreiraok1", career()));
    expect(again.rows[0]!.resultado.nova).toBe(false);
    await as(db, user, () => registerCareer("carreiraok2", career({ gols: 20, melhor_ovr: 80, conquistas: ["firstCareer"] })));
    const profile = await profileOf(user);
    expect(profile).toMatchObject({ carreiras: 2, temporadas: 36, gols: 300, partidas: 1220, titulos: 28, bolas_de_ouro: 4, melhor_ovr: 91 });
    const trophies = await as(db, user, () => db.query<{ id_trophy: string; quantidade: number }>("select id_trophy, quantidade from public.user_trophies order by id_trophy"));
    expect(trophies.rows).toEqual([{ id_trophy: "firstCareer", quantidade: 2 }, { id_trophy: "firstTitle", quantidade: 1 }]);
  });

  it("recusa números impossíveis, negativos, quebrados ou de tipo errado", async () => {
    const user = await createUser(db);
    const cases: [Record<string, unknown>, string][] = [
      [career({ temporadas: 1, partidas: 50, gols: 9999 }), "valor_fora_do_limite: gols"],
      [career({ gols: -3 }), "valor_fora_do_limite: gols"],
      [career({ gols: 10.5 }), "valor_fora_do_limite: gols"],
      [career({ gols: "30" }), "campo_invalido: gols"],
      [career({ melhor_ovr: 120 }), "valor_fora_do_limite: melhor_ovr"],
      [career({ temporadas: 3, partidas: 150, gols: 60, assistencias: 20, titulos: 3, premios: 2, bolas_de_ouro: 4 }), "valor_fora_do_limite: bolas_de_ouro"],
      [career({ temporadas: 99 }), "valor_fora_do_limite: temporadas"],
      [career({ partidas: 0 }), "valor_fora_do_limite: partidas"],
      [{ ...career(), partidas: undefined }, "campo_invalido: partidas"],
    ];
    for (const [data, message] of cases) {
      expect(await as(db, user, () => failure(registerCareer("ruim0001", data)))).toContain(message);
    }
    expect((await profileOf(user)).carreiras).toBe(0);
  });

  it("recusa campo que não está na lista (role, id, quantidade...)", async () => {
    const user = await createUser(db);
    for (const field of ["role", "id", "quantidade", "carreiras", "username"]) {
      expect(await as(db, user, () => failure(registerCareer("extra0001", career({ [field]: "admin" }))))).toContain(`campo_nao_permitido: ${field}`);
    }
    expect(await as(db, user, () => failure(registerCareer("extra0002", career({ desafio: { dia: today(), pontos: 500, ranqueada: true } }))))).toContain("desafio_invalido");
  });

  it("o servidor decide a ranqueada do dia e guarda só a melhor nota ranqueada", async () => {
    const user = await createUser(db, { username: "desafiante" });
    const first = await as(db, user, () => registerCareer("desafio01", career({ desafio: { dia: today(), pontos: 640 } })));
    expect(first.rows[0]!.resultado).toEqual({ nova: true, ranqueada: true });
    const second = await as(db, user, () => registerCareer("desafio02", career({ desafio: { dia: today(), pontos: 990 } })));
    expect(second.rows[0]!.resultado).toEqual({ nova: true, ranqueada: false });
    const yesterday = await as(db, user, () => registerCareer("desafio03", career({ desafio: { dia: daysAgo(1), pontos: 700 } })));
    expect(yesterday.rows[0]!.resultado.ranqueada).toBe(true);
    expect(await as(db, user, () => failure(registerCareer("desafio04", career({ desafio: { dia: daysAgo(3), pontos: 700 } }))))).toContain("desafio_fora_do_dia");
    expect(await as(db, user, () => failure(registerCareer("desafio05", career({ desafio: { dia: today(), pontos: 1001 } }))))).toContain("valor_fora_do_limite: pontos");
    expect(await profileOf(user)).toMatchObject({ desafios: 2, melhor_desafio: 700 });
  });

  it("guarda a melhor contagem de cada conquista de contagem, nunca acima do alvo", async () => {
    const user = await createUser(db);
    await as(db, user, () => registerCareer("progresso1", career({ progresso: { twentyTitles: 12, hundredCaps: 40, inventada: 5 } })));
    await as(db, user, () => registerCareer("progresso2", career({ progresso: { twentyTitles: 8, hundredCaps: 250 } })));
    expect((await profileOf(user)).progresso).toEqual({ twentyTitles: 12, hundredCaps: 100 });
    expect(await as(db, user, () => failure(registerCareer("progresso3", career({ progresso: { twentyTitles: -1 } }))))).toContain("progresso_invalido");
  });

  it("o Técnico soma nos próprios campos e não aceita os do Craque", async () => {
    const user = await createUser(db);
    await as(db, user, () => registerCareer("tecnico01", { temporadas: 12, titulos: 7, conquistas: ["tecnico:firstSeason", "tecnico:firstTitle"] }, "tecnico"));
    expect(await profileOf(user)).toMatchObject({ carreiras_tecnico: 1, temporadas_tecnico: 12, titulos_tecnico: 7, carreiras: 0 });
    expect(await as(db, user, () => failure(registerCareer("tecnico02", { temporadas: 3, titulos: 1, gols: 2 }, "tecnico")))).toContain("campo_nao_permitido: gols");
  });

  it("limita o ritmo de carreiras novas por conta", async () => {
    const user = await createUser(db);
    for (let index = 0; index < 20; index += 1) {
      await as(db, user, () => db.query("select public.registrar_conquistas('craque', $1, array['firstCareer'])", [`ritmo${String(index).padStart(4, "0")}`]));
    }
    expect(await as(db, user, () => failure(registerCareer("ritmo9999", career())))).toContain("limite_de_envios");
    // A carreira que já existe continua podendo terminar.
    const done = await as(db, user, () => registerCareer("ritmo0000", career()));
    expect(done.rows[0]!.resultado.nova).toBe(true);
  });
});

describe("ranking_desafio", () => {
  it("devolve só posição, @, pontos, total e a marca de quem pergunta", async () => {
    const day = today();
    const players: [string, number][] = [["ana_10", 810], ["beto_7", 920], ["caio_9", 640]];
    const ids: string[] = [];
    for (const [username, points] of players) {
      const user = await createUser(db, { username });
      ids.push(user);
      await as(db, user, () => registerCareer(`rank${username.replace("_", "")}`, career({ desafio: { dia: day, pontos: points } })));
    }
    const ranking = await as(db, ids[2]!, () => db.query<Record<string, unknown>>("select * from public.ranking_desafio($1::date, 2)", [day]));
    expect(Object.keys(ranking.rows[0]!).sort()).toEqual(["pontos", "posicao", "total", "username", "voce"]);
    const mine = ranking.rows.filter((row) => ["ana_10", "beto_7", "caio_9"].includes(row["username"] as string));
    expect(mine.map((row) => row["username"])).toEqual(expect.arrayContaining(["beto_7", "caio_9"]));
    expect(ranking.rows.find((row) => row["username"] === "caio_9")).toMatchObject({ voce: true });
    expect(ranking.rows.find((row) => row["username"] === "beto_7")).toMatchObject({ voce: false });
    const visitor = await as(db, null, () => db.query<Record<string, unknown>>("select * from public.ranking_desafio($1::date, 50)", [day]));
    expect(visitor.rows.every((row) => row["voce"] === false || row["voce"] === null)).toBe(true);
    expect(JSON.stringify(visitor.rows)).not.toMatch(/@exemplo\.com|[0-9a-f]{8}-[0-9a-f]{4}-/);
  });
});

describe("importar_conquistas e excluir_conta", () => {
  it("as conquistas do aparelho entram uma vez, sem somar a quem já tem", async () => {
    const user = await createUser(db);
    await as(db, user, () => db.query("select public.registrar_conquistas('craque', 'import001', array['firstTitle'])"));
    const imported = await as(db, user, () => db.query<{ total: number }>("select public.importar_conquistas(array['firstTitle', 'firstCap', 'inventada', 'tecnico:firstSeason']) as total"));
    expect(imported.rows[0]!.total).toBe(2);
    await as(db, user, () => db.query("select public.importar_conquistas(array['firstCap'])"));
    const trophies = await as(db, user, () => db.query<{ id_trophy: string; quantidade: number }>("select id_trophy, quantidade from public.user_trophies order by id_trophy"));
    expect(trophies.rows).toEqual([{ id_trophy: "firstCap", quantidade: 1 }, { id_trophy: "firstTitle", quantidade: 1 }, { id_trophy: "tecnico:firstSeason", quantidade: 1 }]);
  });

  it("excluir a conta apaga perfil, troféus e carreiras", async () => {
    const user = await createUser(db, { username: "vai_sair" });
    await as(db, user, () => registerCareer("saida0001", career()));
    await as(db, user, () => db.query("select public.excluir_conta()"));
    for (const table of ["auth.users", "public.profiles"]) {
      expect((await db.query(`select 1 from ${table} where id = $1`, [user])).rows).toHaveLength(0);
    }
    expect((await db.query("select 1 from public.user_trophies where id_user = $1", [user])).rows).toHaveLength(0);
    expect((await db.query("select 1 from public.carreiras where id_user = $1", [user])).rows).toHaveLength(0);
  });
});
