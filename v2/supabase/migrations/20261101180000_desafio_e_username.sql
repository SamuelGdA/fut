-- Futeiros (D118): o Desafio do dia no perfil (nota de hoje, sequência atual e
-- maior sequência) e a troca do @ limitada a uma vez a cada 30 dias.

alter table public.profiles add column if not exists username_alterado_em timestamptz;

-- A primeira escolha do @ (vazio para preenchido) é livre; trocar um @ que já
-- existe só depois de 30 dias da última troca. A data só muda por aqui: o
-- jogador escreve apenas a coluna username (privilégio por coluna, D114).
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
    if old.username is not null then
      if old.username_alterado_em is not null and old.username_alterado_em > now() - interval '30 days' then
        raise exception 'username_recente' using errcode = 'P0001',
          hint = to_char(old.username_alterado_em + interval '30 days', 'YYYY-MM-DD');
      end if;
      new.username_alterado_em := now();
    end if;
  end if;
  new.atualizado_em := now();
  return new;
end;
$$;

revoke all on function privado.antes_de_atualizar_perfil() from public, anon, authenticated;

-- O Desafio do dia de quem pergunta: a nota ranqueada de hoje (0 sem
-- tentativa), a sequência de dias seguidos com ranqueada que chega até hoje
-- ou ontem (UTC) e a maior sequência de todas.
create or replace function public.meu_desafio()
returns table (hoje smallint, sequencia_atual integer, maior_sequencia integer)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_hoje date := (now() at time zone 'utc')::date;
begin
  if v_user is null then
    raise exception 'sem_sessao' using errcode = '42501';
  end if;
  return query
  with dias as (
    select distinct desafio_dia as dia
    from public.carreiras
    where id_user = v_user and desafio_ranqueada and desafio_dia is not null
  ),
  grupos as (
    select dia, dia - (row_number() over (order by dia))::integer as grupo from dias
  ),
  sequencias as (
    select count(*)::integer as tamanho, max(dia) as fim from grupos group by grupo
  )
  select
    coalesce((select c.desafio_pontos from public.carreiras c
      where c.id_user = v_user and c.desafio_ranqueada and c.desafio_dia = v_hoje limit 1), 0::smallint),
    coalesce((select s.tamanho from sequencias s where s.fim >= v_hoje - 1 order by s.fim desc limit 1), 0),
    coalesce((select max(s.tamanho) from sequencias s), 0);
end;
$$;

revoke all on function public.meu_desafio() from public, anon, authenticated;
grant execute on function public.meu_desafio() to authenticated;
