-- Futeiros: contas, perfis, conquistas e Desafio do dia na nuvem (D112 e D114).
--
-- Regras desta migração:
-- 1. Toda tabela tem RLS. O jogador só lê as próprias linhas; o catálogo de
--    conquistas é público.
-- 2. Estatística nenhuma muda por UPDATE vindo do navegador. A única coluna que
--    o jogador pode escrever é `profiles.username` (privilégio por coluna:
--    qualquer outro campo enviado, como `role` ou `gols`, é recusado pelo banco).
--    Números só mudam pelas funções `registrar_*`, que conferem tudo no servidor.
-- 3. Funções internas ficam no esquema `privado`, fora da API.
-- 4. O ranking devolve só posição, @username e pontos: nada de id, e-mail ou sessão.

create schema if not exists privado;
revoke all on schema privado from public;
grant usage on schema privado to postgres;

-- ------------------------------------------------------------------ catálogo

create table public.conquistas (
  id text primary key check (id ~ '^[A-Za-z0-9:._-]{2,64}$'),
  jogo text not null check (jogo in ('craque', 'tecnico')),
  grupo text not null check (char_length(grupo) between 2 and 24),
  raridade text not null check (raridade in ('common', 'rare', 'epic', 'legendary')),
  secreta boolean not null default false,
  alvo integer check (alvo is null or alvo > 0),
  nome jsonb not null check (jsonb_typeof(nome) = 'object'),
  descricao jsonb not null check (jsonb_typeof(descricao) = 'object'),
  ordem integer not null default 0,
  -- Conquista que saiu do jogo continua no catálogo (os troféus de quem ganhou ficam).
  ativa boolean not null default true
);

comment on table public.conquistas is
  'Catálogo das conquistas do Craque e do Técnico, gerado do pacote @craque/content (pnpm supabase:catalogo). Os textos do jogo continuam vindo do pacote.';

-- ------------------------------------------------------------------- perfis

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  -- Sem o @: só minúsculas, números e sublinhado, de 3 a 20.
  username text unique check (username ~ '^[a-z0-9_]{3,20}$'),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  -- Craque: somas das carreiras terminadas (clube e seleção, como o resumo, D97).
  carreiras integer not null default 0 check (carreiras >= 0),
  temporadas integer not null default 0 check (temporadas >= 0),
  partidas integer not null default 0 check (partidas >= 0),
  gols integer not null default 0 check (gols >= 0),
  assistencias integer not null default 0 check (assistencias >= 0),
  jogos_sem_sofrer integer not null default 0 check (jogos_sem_sofrer >= 0),
  titulos integer not null default 0 check (titulos >= 0),
  premios integer not null default 0 check (premios >= 0),
  bolas_de_ouro integer not null default 0 check (bolas_de_ouro >= 0),
  melhor_ovr smallint not null default 0 check (melhor_ovr between 0 and 99),
  -- Desafio do dia: só as tentativas ranqueadas (GDD 27.7).
  desafios integer not null default 0 check (desafios >= 0),
  melhor_desafio smallint not null default 0 check (melhor_desafio between 0 and 1000),
  -- Técnico.
  carreiras_tecnico integer not null default 0 check (carreiras_tecnico >= 0),
  temporadas_tecnico integer not null default 0 check (temporadas_tecnico >= 0),
  titulos_tecnico integer not null default 0 check (titulos_tecnico >= 0),
  -- A melhor contagem de cada conquista de contagem ("12/20"), para a barra de progresso.
  progresso jsonb not null default '{}'::jsonb check (jsonb_typeof(progresso) = 'object')
);

comment on table public.profiles is
  'Um perfil por conta. O jogador lê o próprio e só pode mudar o username; os números mudam pelas funções registrar_*.';

-- ---------------------------------------------------------- troféus do jogador

create table public.user_trophies (
  id_user uuid not null references public.profiles (id) on delete cascade,
  id_trophy text not null references public.conquistas (id) on update cascade,
  -- Em quantas carreiras diferentes a conquista caiu (a importação do aparelho conta uma).
  quantidade integer not null default 1 check (quantidade between 1 and 100000),
  data_desbloqueio timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  primary key (id_user, id_trophy)
);

comment on table public.user_trophies is
  'As conquistas de cada jogador: a primeira vez (data_desbloqueio) e em quantas carreiras caiu (quantidade).';

-- -------------------------------------------------------------- carreiras

-- O registro de cada carreira enviada: torna o envio idempotente (a mesma
-- carreira nunca conta duas vezes), guarda o Desafio para o ranking e limita
-- o ritmo de envios.
create table public.carreiras (
  id bigint generated always as identity primary key,
  id_user uuid not null references public.profiles (id) on delete cascade,
  jogo text not null check (jogo in ('craque', 'tecnico')),
  -- Hash do motor e do setup da carreira, calculado no jogo.
  chave text not null check (chave ~ '^[a-z0-9]{6,32}$'),
  criada_em timestamptz not null default now(),
  terminada_em timestamptz,
  conquistas text[] not null default '{}',
  dados jsonb,
  desafio_dia date,
  desafio_pontos smallint check (desafio_pontos between 0 and 1000),
  desafio_ranqueada boolean not null default false,
  unique (id_user, jogo, chave)
);

-- Uma ranqueada por jogador e por dia (a primeira terminada, decidida aqui no servidor).
create unique index carreiras_uma_ranqueada_por_dia on public.carreiras (id_user, desafio_dia) where desafio_ranqueada;
create index carreiras_ranking_do_dia on public.carreiras (desafio_dia, desafio_pontos desc) where desafio_ranqueada;
create index carreiras_recentes on public.carreiras (id_user, criada_em desc);

-- -------------------------------------------------------------------- RLS

alter table public.conquistas enable row level security;
alter table public.profiles enable row level security;
alter table public.user_trophies enable row level security;
alter table public.carreiras enable row level security;

create policy "catalogo: leitura publica" on public.conquistas
  for select to anon, authenticated using (true);

create policy "perfil: ler o proprio" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

create policy "perfil: editar o proprio" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "trofeus: ler os proprios" on public.user_trophies
  for select to authenticated using ((select auth.uid()) = id_user);

create policy "carreiras: ler as proprias" on public.carreiras
  for select to authenticated using ((select auth.uid()) = id_user);

-- Privilégios explícitos, nos dois sentidos: nada de INSERT/DELETE vindo da API,
-- e UPDATE só na coluna username (contra mass assignment).
revoke all on public.conquistas, public.profiles, public.user_trophies, public.carreiras from public, anon, authenticated;
grant select on public.conquistas to anon, authenticated;
grant select on public.profiles, public.user_trophies, public.carreiras to authenticated;
grant update (username) on public.profiles to authenticated;

-- -------------------------------------------------------------- username

create or replace function privado.username_valido(nome text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select nome is not null
    and nome ~ '^[a-z0-9_]{3,20}$'
    and nome <> all (array[
      'admin', 'administrador', 'adm', 'suporte', 'support', 'ajuda', 'help', 'futeiros', 'craque', 'tecnico',
      'moderador', 'moderator', 'mod', 'root', 'sistema', 'system', 'oficial', 'official', 'staff', 'equipe',
      'supabase', 'null', 'undefined', 'anonimo', 'anonymous', 'visitante', 'guest', 'perfil', 'login', 'conta'
    ]);
$$;

-- Perfil criado junto com a conta. Nunca falha: um username pedido no cadastro
-- por e-mail que já exista (ou seja inválido) fica vazio e vira o passo de
-- escolha do @ no primeiro acesso.
create or replace function privado.criar_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  desejado text := lower(btrim(coalesce(new.raw_user_meta_data ->> 'username', '')));
begin
  if privado.username_valido(desejado) then
    begin
      insert into public.profiles (id, username) values (new.id, desejado);
      return new;
    exception when unique_violation then
      null;
    end;
  end if;
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function privado.criar_perfil();

-- Antes de qualquer mudança no perfil: o username sempre minúsculo, nunca
-- reservado, e não volta a ficar vazio depois de escolhido.
create or replace function privado.antes_de_atualizar_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.username is distinct from old.username then
    if new.username is null then
      raise exception 'username_obrigatorio' using errcode = '23514';
    end if;
    new.username := lower(btrim(new.username));
    if not privado.username_valido(new.username) then
      raise exception 'username_invalido' using errcode = '23514';
    end if;
  end if;
  new.atualizado_em := now();
  return new;
end;
$$;

create trigger antes_de_atualizar_perfil
  before update on public.profiles
  for each row execute function privado.antes_de_atualizar_perfil();

-- ------------------------------------------------------------- utilitários

-- Garante o perfil (contas criadas antes desta migração não passaram pelo gatilho).
create or replace function privado.garantir_perfil(p_user uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.profiles (id) values (p_user) on conflict (id) do nothing;
$$;

-- No máximo 20 carreiras novas a cada 10 minutos por conta: bem acima de quem
-- joga, bem abaixo de um script.
create or replace function privado.limitar_envios(p_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.carreiras where id_user = p_user and criada_em > now() - interval '10 minutes') >= 20 then
    raise exception 'limite_de_envios' using errcode = 'P0001', hint = 'Espere alguns minutos e tente de novo.';
  end if;
end;
$$;

-- Um inteiro do pacote, dentro dos limites; qualquer outra coisa recusa o envio inteiro.
create or replace function privado.inteiro(p_dados jsonb, p_campo text, p_minimo integer, p_maximo integer)
returns integer
language plpgsql
immutable
set search_path = ''
as $$
declare
  valor jsonb := p_dados -> p_campo;
  numero numeric;
begin
  if valor is null or jsonb_typeof(valor) <> 'number' then
    raise exception 'campo_invalido: %', p_campo using errcode = '22023';
  end if;
  numero := valor::numeric;
  if numero <> trunc(numero) or numero < p_minimo or numero > p_maximo then
    raise exception 'valor_fora_do_limite: %', p_campo using errcode = '22023';
  end if;
  return numero::integer;
end;
$$;

revoke all on all functions in schema privado from public, anon, authenticated;

-- ------------------------------------------------------------- funções da API

-- O @ está livre? Serve ao cadastro e à escolha do @ (o ranking já mostra os nomes).
create or replace function public.username_disponivel(nome text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select privado.username_valido(lower(btrim(nome)))
    and not exists (select 1 from public.profiles where username = lower(btrim(nome)));
$$;

-- Conquistas que caíram numa carreira (no meio dela ou no fim). Cada conquista
-- conta uma vez por carreira; a primeira cria o troféu, as outras somam à
-- quantidade. Id fora do catálogo ativo daquele jogo é ignorado (um catálogo
-- atrasado nunca derruba o envio). Devolve quantas contaram agora.
create or replace function public.registrar_conquistas(p_jogo text, p_chave text, p_ids text[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_carreira public.carreiras%rowtype;
  v_novas text[];
begin
  if v_user is null then
    raise exception 'sem_sessao' using errcode = '42501';
  end if;
  if p_jogo is null or p_jogo not in ('craque', 'tecnico') then
    raise exception 'jogo_invalido' using errcode = '22023';
  end if;
  if p_chave is null or p_chave !~ '^[a-z0-9]{6,32}$' then
    raise exception 'chave_invalida' using errcode = '22023';
  end if;
  if p_ids is null or cardinality(p_ids) = 0 then
    return 0;
  end if;
  if cardinality(p_ids) > 250 then
    raise exception 'conquistas_demais' using errcode = '22023';
  end if;
  perform privado.garantir_perfil(v_user);
  if not exists (select 1 from public.carreiras where id_user = v_user and jogo = p_jogo and chave = p_chave) then
    perform privado.limitar_envios(v_user);
    insert into public.carreiras (id_user, jogo, chave) values (v_user, p_jogo, p_chave)
      on conflict (id_user, jogo, chave) do nothing;
  end if;
  select * into v_carreira from public.carreiras
    where id_user = v_user and jogo = p_jogo and chave = p_chave
    for update;

  select coalesce(array_agg(distinct c.id), '{}') into v_novas
    from unnest(p_ids) as pedido(id)
    join public.conquistas c on c.id = pedido.id and c.ativa and c.jogo = p_jogo
    where not (c.id = any (v_carreira.conquistas));
  if cardinality(v_novas) = 0 then
    return 0;
  end if;

  update public.carreiras set conquistas = conquistas || v_novas where id = v_carreira.id;
  insert into public.user_trophies as t (id_user, id_trophy)
    select v_user, novo from unnest(v_novas) as novo
    on conflict (id_user, id_trophy) do update set quantidade = t.quantidade + 1, atualizado_em = now();
  return cardinality(v_novas);
end;
$$;

-- O fim de uma carreira: confere cada número contra limites por temporada,
-- soma ao perfil uma vez só (a chave torna o envio idempotente), decide no
-- servidor se a tentativa do Desafio é a ranqueada do dia e registra as
-- conquistas. Campo fora da lista recusa o envio inteiro.
create or replace function public.registrar_carreira(p_jogo text, p_chave text, p_dados jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_permitidos text[];
  v_extra text;
  v_carreira public.carreiras%rowtype;
  v_temporadas integer;
  v_base integer;
  v_partidas integer := 0;
  v_gols integer := 0;
  v_assistencias integer := 0;
  v_sem_sofrer integer := 0;
  v_titulos integer := 0;
  v_premios integer := 0;
  v_bolas integer := 0;
  v_ovr integer := 0;
  v_dia date;
  v_pontos integer;
  v_ranqueada boolean := false;
  v_hoje date := (now() at time zone 'utc')::date;
  v_ids text[] := '{}';
  v_progresso jsonb := '{}'::jsonb;
  v_chave_progresso text;
  v_valor_progresso jsonb;
  v_alvo integer;
begin
  if v_user is null then
    raise exception 'sem_sessao' using errcode = '42501';
  end if;
  if p_jogo is null or p_jogo not in ('craque', 'tecnico') then
    raise exception 'jogo_invalido' using errcode = '22023';
  end if;
  if p_chave is null or p_chave !~ '^[a-z0-9]{6,32}$' then
    raise exception 'chave_invalida' using errcode = '22023';
  end if;
  if p_dados is null or jsonb_typeof(p_dados) <> 'object' then
    raise exception 'dados_invalidos' using errcode = '22023';
  end if;

  v_permitidos := case p_jogo
    when 'craque' then array['temporadas', 'partidas', 'gols', 'assistencias', 'jogos_sem_sofrer', 'titulos', 'premios', 'bolas_de_ouro', 'melhor_ovr', 'conquistas', 'progresso', 'desafio']
    else array['temporadas', 'titulos', 'conquistas']
  end;
  select k into v_extra from jsonb_object_keys(p_dados) as k where k <> all (v_permitidos) limit 1;
  if v_extra is not null then
    raise exception 'campo_nao_permitido: %', v_extra using errcode = '22023';
  end if;

  -- Limites por temporada: folgados para qualquer carreira de verdade, impossíveis para números inventados.
  v_temporadas := privado.inteiro(p_dados, 'temporadas', 0, case p_jogo when 'craque' then 40 else 60 end);
  v_base := greatest(v_temporadas, 1);
  v_titulos := privado.inteiro(p_dados, 'titulos', 0, 15 * v_base);
  if p_jogo = 'craque' then
    v_partidas := privado.inteiro(p_dados, 'partidas', 0, 100 * v_base);
    v_gols := privado.inteiro(p_dados, 'gols', 0, 120 * v_base);
    v_assistencias := privado.inteiro(p_dados, 'assistencias', 0, 80 * v_base);
    v_sem_sofrer := privado.inteiro(p_dados, 'jogos_sem_sofrer', 0, 100 * v_base);
    v_premios := privado.inteiro(p_dados, 'premios', 0, 20 * v_base);
    v_bolas := privado.inteiro(p_dados, 'bolas_de_ouro', 0, v_temporadas);
    v_ovr := privado.inteiro(p_dados, 'melhor_ovr', 0, 99);
    if v_gols + v_assistencias > 0 and v_partidas = 0 then
      raise exception 'valor_fora_do_limite: partidas' using errcode = '22023';
    end if;

    if p_dados ? 'desafio' then
      if jsonb_typeof(p_dados -> 'desafio') <> 'object'
        or exists (select 1 from jsonb_object_keys(p_dados -> 'desafio') as k where k not in ('dia', 'pontos'))
        or jsonb_typeof(p_dados -> 'desafio' -> 'dia') <> 'string'
        or (p_dados -> 'desafio' ->> 'dia') !~ '^\d{4}-\d{2}-\d{2}$' then
        raise exception 'desafio_invalido' using errcode = '22023';
      end if;
      v_dia := (p_dados -> 'desafio' ->> 'dia')::date;
      -- O desafio de hoje ou o de ontem (uma carreira pode atravessar a meia-noite UTC).
      if v_dia < v_hoje - 1 or v_dia > v_hoje then
        raise exception 'desafio_fora_do_dia' using errcode = '22023';
      end if;
      v_pontos := privado.inteiro(p_dados -> 'desafio', 'pontos', 0, 1000);
    end if;

    if p_dados ? 'progresso' then
      if jsonb_typeof(p_dados -> 'progresso') <> 'object' then
        raise exception 'progresso_invalido' using errcode = '22023';
      end if;
      if (select count(*) from jsonb_object_keys(p_dados -> 'progresso')) > 250 then
        raise exception 'progresso_invalido' using errcode = '22023';
      end if;
      for v_chave_progresso, v_valor_progresso in select * from jsonb_each(p_dados -> 'progresso') loop
        if jsonb_typeof(v_valor_progresso) <> 'number' or v_valor_progresso::numeric < 0
          or v_valor_progresso::numeric <> trunc(v_valor_progresso::numeric) then
          raise exception 'progresso_invalido: %', v_chave_progresso using errcode = '22023';
        end if;
        -- Só conquistas de contagem do catálogo; o valor nunca passa do alvo.
        v_alvo := null;
        select alvo into v_alvo from public.conquistas where id = v_chave_progresso and jogo = 'craque' and ativa and alvo is not null;
        if v_alvo is not null then
          v_progresso := v_progresso || jsonb_build_object(v_chave_progresso, least(v_valor_progresso::numeric, v_alvo)::integer);
        end if;
      end loop;
    end if;
  end if;

  if p_dados ? 'conquistas' then
    if jsonb_typeof(p_dados -> 'conquistas') <> 'array'
      or jsonb_array_length(p_dados -> 'conquistas') > 250
      or exists (select 1 from jsonb_array_elements(p_dados -> 'conquistas') as e where jsonb_typeof(e) <> 'string') then
      raise exception 'conquistas_invalidas' using errcode = '22023';
    end if;
    select coalesce(array_agg(value), '{}') into v_ids from jsonb_array_elements_text(p_dados -> 'conquistas');
  end if;

  perform privado.garantir_perfil(v_user);
  if not exists (select 1 from public.carreiras where id_user = v_user and jogo = p_jogo and chave = p_chave) then
    perform privado.limitar_envios(v_user);
    insert into public.carreiras (id_user, jogo, chave) values (v_user, p_jogo, p_chave)
      on conflict (id_user, jogo, chave) do nothing;
  end if;
  select * into v_carreira from public.carreiras
    where id_user = v_user and jogo = p_jogo and chave = p_chave
    for update;

  -- Enviada de novo (sem internet na primeira tentativa, recarregar o resumo): não soma outra vez.
  if v_carreira.terminada_em is not null then
    return jsonb_build_object('nova', false, 'ranqueada', v_carreira.desafio_ranqueada);
  end if;

  if v_dia is not null then
    v_ranqueada := not exists (
      select 1 from public.carreiras where id_user = v_user and desafio_dia = v_dia and desafio_ranqueada
    );
  end if;

  update public.carreiras set
    terminada_em = now(),
    dados = p_dados - 'conquistas' - 'progresso',
    desafio_dia = v_dia,
    desafio_pontos = v_pontos,
    desafio_ranqueada = v_ranqueada
  where id = v_carreira.id;

  if p_jogo = 'craque' then
    update public.profiles set
      carreiras = carreiras + 1,
      temporadas = temporadas + v_temporadas,
      partidas = partidas + v_partidas,
      gols = gols + v_gols,
      assistencias = assistencias + v_assistencias,
      jogos_sem_sofrer = jogos_sem_sofrer + v_sem_sofrer,
      titulos = titulos + v_titulos,
      premios = premios + v_premios,
      bolas_de_ouro = bolas_de_ouro + v_bolas,
      melhor_ovr = greatest(melhor_ovr, v_ovr),
      desafios = desafios + case when v_ranqueada then 1 else 0 end,
      melhor_desafio = greatest(melhor_desafio, case when v_ranqueada then v_pontos else 0 end),
      progresso = progresso || coalesce((
        select jsonb_object_agg(novo.key, greatest(coalesce((progresso ->> novo.key)::integer, 0), novo.value::integer))
        from jsonb_each_text(v_progresso) as novo
      ), '{}'::jsonb)
    where id = v_user;
  else
    update public.profiles set
      carreiras_tecnico = carreiras_tecnico + 1,
      temporadas_tecnico = temporadas_tecnico + v_temporadas,
      titulos_tecnico = titulos_tecnico + v_titulos
    where id = v_user;
  end if;

  perform public.registrar_conquistas(p_jogo, p_chave, v_ids);
  return jsonb_build_object('nova', true, 'ranqueada', v_ranqueada);
end;
$$;

-- As conquistas que o aparelho guardou antes do login (jogando como
-- visitante) entram na conta uma vez: quem já tem o troféu não ganha outra
-- unidade por isso. Devolve quantas entraram.
create or replace function public.importar_conquistas(p_ids text[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_total integer;
begin
  if v_user is null then
    raise exception 'sem_sessao' using errcode = '42501';
  end if;
  if p_ids is null or cardinality(p_ids) = 0 then
    return 0;
  end if;
  if cardinality(p_ids) > 400 then
    raise exception 'conquistas_demais' using errcode = '22023';
  end if;
  perform privado.garantir_perfil(v_user);
  insert into public.user_trophies (id_user, id_trophy)
    select distinct v_user, c.id
    from unnest(p_ids) as pedido(id)
    join public.conquistas c on c.id = pedido.id and c.ativa
    on conflict (id_user, id_trophy) do nothing;
  get diagnostics v_total = row_count;
  return v_total;
end;
$$;

-- O ranking do Desafio de um dia: as ranqueadas, da maior pontuação para a
-- menor (empate: quem terminou antes). Só posição, @username, pontos, o total
-- de participantes e se a linha é de quem pergunta; a linha de quem pergunta
-- vem mesmo fora do topo.
create or replace function public.ranking_desafio(p_dia date, p_limite integer default 20)
returns table (posicao bigint, username text, pontos smallint, total bigint, voce boolean)
language sql
stable
security definer
set search_path = ''
as $$
  with ordem as (
    select
      c.id_user,
      p.username,
      c.desafio_pontos as pontos,
      row_number() over (order by c.desafio_pontos desc, c.terminada_em asc, c.id asc) as posicao,
      count(*) over () as total
    from public.carreiras c
    join public.profiles p on p.id = c.id_user
    where c.desafio_ranqueada and c.desafio_dia = p_dia and p.username is not null
  )
  select posicao, username, pontos, total, id_user = (select auth.uid())
  from ordem
  where posicao <= least(greatest(coalesce(p_limite, 20), 1), 100) or id_user = (select auth.uid())
  order by posicao;
$$;

-- Apagar a conta (LGPD): a conta, o perfil, os troféus e as carreiras somem juntos.
create or replace function public.excluir_conta()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'sem_sessao' using errcode = '42501';
  end if;
  delete from auth.users where id = v_user;
end;
$$;

revoke all on function
  public.username_disponivel(text),
  public.registrar_conquistas(text, text, text[]),
  public.registrar_carreira(text, text, jsonb),
  public.importar_conquistas(text[]),
  public.ranking_desafio(date, integer),
  public.excluir_conta()
from public, anon, authenticated;

grant execute on function public.username_disponivel(text) to anon, authenticated;
grant execute on function public.ranking_desafio(date, integer) to anon, authenticated;
grant execute on function
  public.registrar_conquistas(text, text, text[]),
  public.registrar_carreira(text, text, jsonb),
  public.importar_conquistas(text[]),
  public.excluir_conta()
to authenticated;
