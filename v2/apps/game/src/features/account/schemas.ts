import { z } from "zod";

/**
 * Tudo que entra e sai da nuvem passa por aqui (D114). Na ida, o Zod corta o
 * envio errado antes da rede: objeto estrito (campo a mais é recusado, contra
 * mass assignment) e os mesmos limites por temporada do banco. A palavra final
 * é sempre do banco (`supabase/migrations`), que repete cada regra: o
 * navegador pode ser adulterado, o servidor não. Na volta, o Zod lê só os
 * campos que a tela usa.
 */

// ----------------------------------------------------------------- username

/** Os @ que ninguém pode usar. A mesma lista está em `privado.username_valido` (um teste confere). */
export const RESERVED_USERNAMES: readonly string[] = [
  "admin", "administrador", "adm", "suporte", "support", "ajuda", "help", "futeiros", "craque", "tecnico",
  "moderador", "moderator", "mod", "root", "sistema", "system", "oficial", "official", "staff", "equipe",
  "supabase", "null", "undefined", "anonimo", "anonymous", "visitante", "guest", "perfil", "login", "conta",
];

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;

/** O @ como o jogador digita: com ou sem @, maiúsculas viram minúsculas. */
export const usernameSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/^@/, "").toLowerCase())
  .pipe(
    z
      .string()
      .min(USERNAME_MIN, "short")
      .max(USERNAME_MAX, "long")
      .regex(/^[a-z0-9_]+$/, "chars")
      .refine((value) => !RESERVED_USERNAMES.includes(value), "reserved"),
  );

/** O único campo do perfil que o navegador escreve. */
export const profileUpdateSchema = z.strictObject({ username: usernameSchema });

// ------------------------------------------------------------ e-mail e senha

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email("email").max(254, "email"));

export const PASSWORD_MIN = 8;

/** Igual ao `password_requirements = "letters_digits"` do Supabase: letras e números, 8 ou mais. */
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, "short")
  .max(72, "long")
  .regex(/[A-Za-z]/, "letters")
  .regex(/\d/, "digits");

// --------------------------------------------------------------- respostas

export const profileSchema = z.object({
  username: z.string().nullable(),
  criado_em: z.string(),
  carreiras: z.number().int().nonnegative(),
  temporadas: z.number().int().nonnegative(),
  partidas: z.number().int().nonnegative(),
  gols: z.number().int().nonnegative(),
  assistencias: z.number().int().nonnegative(),
  jogos_sem_sofrer: z.number().int().nonnegative(),
  titulos: z.number().int().nonnegative(),
  premios: z.number().int().nonnegative(),
  bolas_de_ouro: z.number().int().nonnegative(),
  melhor_ovr: z.number().int().min(0).max(99),
  desafios: z.number().int().nonnegative(),
  melhor_desafio: z.number().int().min(0).max(1000),
  carreiras_tecnico: z.number().int().nonnegative(),
  temporadas_tecnico: z.number().int().nonnegative(),
  titulos_tecnico: z.number().int().nonnegative(),
  progresso: z.record(z.string(), z.number().int().nonnegative()).catch({}),
});

export type Profile = z.infer<typeof profileSchema>;

/** As colunas pedidas ao banco: nunca `*` (só o que a tela mostra). */
export const PROFILE_COLUMNS = Object.keys(profileSchema.shape).join(",");

export const trophySchema = z.object({
  id_trophy: z.string(),
  quantidade: z.number().int().min(1),
  data_desbloqueio: z.string(),
});

export type Trophy = z.infer<typeof trophySchema>;

export const TROPHY_COLUMNS = "id_trophy,quantidade,data_desbloqueio";

export const rankingRowSchema = z.object({
  posicao: z.coerce.number().int().positive(),
  username: z.string(),
  pontos: z.number().int().min(0).max(1000),
  total: z.coerce.number().int().nonnegative(),
  voce: z.boolean().nullable().transform((value) => value === true),
});

export type RankingRow = z.infer<typeof rankingRowSchema>;

export const careerResultSchema = z.object({ nova: z.boolean(), ranqueada: z.boolean() });

// ------------------------------------------------------------------ envios

/**
 * Limites por temporada de uma carreira enviada: folgados para qualquer
 * carreira de verdade, impossíveis para números inventados. Os mesmos de
 * `public.registrar_carreira` (um teste confere o SQL).
 */
export const CAREER_LIMITS = {
  seasonsCraque: 40,
  seasonsTecnico: 60,
  gamesPerSeason: 100,
  goalsPerSeason: 120,
  assistsPerSeason: 80,
  cleanSheetsPerSeason: 100,
  titlesPerSeason: 15,
  awardsPerSeason: 20,
} as const;

const count = z.number().int().nonnegative();
const achievementId = z.string().regex(/^[A-Za-z0-9:._-]{2,64}$/);
const DAY = /^\d{4}-\d{2}-\d{2}$/;

export const craqueCareerSchema = z
  .strictObject({
    temporadas: count.max(CAREER_LIMITS.seasonsCraque),
    partidas: count,
    gols: count,
    assistencias: count,
    jogos_sem_sofrer: count,
    titulos: count,
    premios: count,
    bolas_de_ouro: count,
    melhor_ovr: count.max(99),
    conquistas: z.array(achievementId).max(250),
    progresso: z.record(achievementId, count).optional(),
    desafio: z.strictObject({ dia: z.string().regex(DAY), pontos: count.max(1000) }).optional(),
  })
  .superRefine((career, context) => {
    const seasons = Math.max(career.temporadas, 1);
    const check = (field: keyof typeof career, max: number) => {
      if ((career[field] as number) > max) context.addIssue({ code: "custom", path: [field], message: "limit" });
    };
    check("partidas", CAREER_LIMITS.gamesPerSeason * seasons);
    check("gols", CAREER_LIMITS.goalsPerSeason * seasons);
    check("assistencias", CAREER_LIMITS.assistsPerSeason * seasons);
    check("jogos_sem_sofrer", CAREER_LIMITS.cleanSheetsPerSeason * seasons);
    check("titulos", CAREER_LIMITS.titlesPerSeason * seasons);
    check("premios", CAREER_LIMITS.awardsPerSeason * seasons);
    check("bolas_de_ouro", career.temporadas);
    if (career.gols + career.assistencias > 0 && career.partidas === 0) context.addIssue({ code: "custom", path: ["partidas"], message: "limit" });
  });

export type CraqueCareerPayload = z.infer<typeof craqueCareerSchema>;

export const tecnicoCareerSchema = z
  .strictObject({
    temporadas: count.max(CAREER_LIMITS.seasonsTecnico),
    titulos: count,
    conquistas: z.array(achievementId).max(250),
  })
  .superRefine((career, context) => {
    if (career.titulos > CAREER_LIMITS.titlesPerSeason * Math.max(career.temporadas, 1)) {
      context.addIssue({ code: "custom", path: ["titulos"], message: "limit" });
    }
  });

export type TecnicoCareerPayload = z.infer<typeof tecnicoCareerSchema>;

export const unlockPayloadSchema = z.strictObject({
  jogo: z.enum(["craque", "tecnico"]),
  chave: z.string().regex(/^[a-z0-9]{6,32}$/),
  ids: z.array(achievementId).min(1).max(250),
});
