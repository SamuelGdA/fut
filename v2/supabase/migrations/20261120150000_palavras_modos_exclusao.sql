-- D124, D126 e D127 (20/11/2026).
--
-- D126: palavras bloqueadas no @. A lista e as regras são as mesmas de
-- apps/game/src/features/account/blockedWords.ts (um teste confere): o @ é lido
-- com os números como letras (o 1 como i e como l), sem os números, com as
-- letras repetidas juntas, inteiro e em pedaços entre `_`. As "partes" barram
-- em qualquer lugar; as "palavras", o pedaço inteiro ou, com cinco letras ou
-- mais, o começo dele. Os @ que já existem ficam como estão.
create or replace function privado.username_ofensivo(nome text)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  partes constant text[] := array[
      'caralh', 'buceta', 'boceta', 'xoxota', 'xereca', 'siririca', 'punheta', 'piroca', 'porra', 'foder', 'fodase', 'fodido',
      'fudido', 'arrombad', 'cuzao', 'cuzinho', 'viadinho', 'viadao', 'vagabunda', 'merda', 'bosta', 'cacete', 'puteiro', 'putaria',
      'prostitut', 'estupr', 'pedofil', 'retardad', 'mongoloid', 'sapatao', 'traveco', 'boquete', 'chupapica', 'filhodaputa', 'filhadaputa', 'corninho',
      'chingad', 'chingar', 'chingon', 'joder', 'jodido', 'mierda', 'culero', 'culiao', 'culiado', 'maricon', 'gilipolla', 'malparid',
      'hijueputa', 'hijodeputa', 'mamahuevo', 'huevon', 'pelotud', 'pajero', 'panocha', 'pendej', 'cabron', 'putita', 'zorra', 'violador',
      'fuck', 'shit', 'bitch', 'cunt', 'asshole', 'bastard', 'whore', 'pussy', 'cocksuck', 'motherf', 'nigg', 'fagg',
      'faggot', 'retard', 'hitler', 'porn', 'wank', 'twat', 'dildo', 'blowjob', 'handjob', 'jerkoff', 'bollock', 'pedophil',
      'molest', 'putain', 'salope', 'connard', 'encule', 'niquetamere', 'vaffancul', 'fancul', 'minchia', 'puttana', 'stronz', 'scheiss',
      'fotze', 'wichser', 'arschloch', 'ficken'
    ];
  palavras constant text[] := array[
      'puta', 'putas', 'puto', 'putos', 'putinha', 'putao', 'cu', 'cus', 'pau', 'paus', 'rola', 'rolas',
      'viado', 'viada', 'vadia', 'vadias', 'bicha', 'corno', 'fdp', 'vsf', 'pqp', 'tnc', 'vtnc', 'krl',
      'crl', 'prr', 'verga', 'polla', 'marica', 'pinche', 'hdp', 'ctm', 'ptm', 'culo', 'fag', 'fags',
      'dick', 'dicks', 'cock', 'cocks', 'cum', 'tits', 'titties', 'boobs', 'anal', 'slut', 'sluts', 'slutty',
      'nazi', 'nazis', 'rape', 'penis', 'kkk', 'hoe', 'hoes', 'jizz', 'pute', 'nique', 'niquer', 'cazzo',
      'hure'
    ];
  base text := lower(coalesce(nome, ''));
  pedaco text;
  forma text;
  item text;
  leituras text[] := '{}';
begin
  foreach pedaco in array array_append(string_to_array(base, '_'), replace(base, '_', '')) loop
    continue when pedaco = '';
    leituras := leituras || array[
      translate(pedaco, '0123456789', 'oizeasgtbg'),
      translate(pedaco, '0123456789', 'olzeasgtbg'),
      regexp_replace(pedaco, '[0-9]', '', 'g')
    ];
  end loop;
  foreach forma in array leituras loop
    leituras := leituras || regexp_replace(forma, '(.)\1+', '\1', 'g');
  end loop;
  foreach forma in array leituras loop
    continue when forma = '';
    foreach item in array partes loop
      if position(item in forma) > 0 then
        return true;
      end if;
    end loop;
    foreach item in array palavras loop
      if forma = item or (length(item) >= 5 and left(forma, length(item)) = item) then
        return true;
      end if;
    end loop;
  end loop;
  return false;
end;
$$;

create or replace function privado.username_valido(nome text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select nome is not null
    and nome ~ '^[a-z0-9_]{3,20}$'
    and nome <> all (array[
      'admin', 'administrador', 'adm', 'suporte', 'support', 'ajuda', 'help', 'futeiros', 'futeiro', 'craque', 'tecnico',
      'moderador', 'moderator', 'mod', 'root', 'sistema', 'system', 'oficial', 'official', 'staff', 'equipe',
      'supabase', 'null', 'undefined', 'anonimo', 'anonymous', 'visitante', 'guest', 'perfil', 'login', 'conta'
    ])
    and not privado.username_ofensivo(nome);
$$;

-- D124: o Técnico está bloqueado no site ("Em breve"). O navegador nem tem as
-- telas dele, e o banco também recusa: carreira do Técnico não entra, e
-- conquista do Técnico é ignorada (registrar e importar contam só as que
-- entraram). Liberar o modo é apagar a linha numa migração nova.
create table privado.modos_bloqueados (
  jogo text primary key check (jogo in ('craque', 'tecnico'))
);

insert into privado.modos_bloqueados (jogo) values ('tecnico');

revoke all on table privado.modos_bloqueados from public;

create or replace function privado.recusar_carreira_bloqueada()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from privado.modos_bloqueados where jogo = new.jogo) then
    raise exception 'modo_bloqueado' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger carreiras_modo_bloqueado
  before insert on public.carreiras
  for each row execute function privado.recusar_carreira_bloqueada();

create or replace function privado.ignorar_trofeu_bloqueado()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.conquistas c
    join privado.modos_bloqueados m on m.jogo = c.jogo
    where c.id = new.id_trophy
  ) then
    return null;
  end if;
  return new;
end;
$$;

create trigger user_trophies_modo_bloqueado
  before insert or update on public.user_trophies
  for each row execute function privado.ignorar_trofeu_bloqueado();

-- D127: apagar a conta exige abrir o link mandado por e-mail. O jogo pede um
-- link de acesso para o e-mail da conta; quem o abre volta com uma sessão
-- nova, e o `amr` do token registra a entrada por e-mail. Só uma entrada por
-- e-mail dos últimos 15 minutos apaga a conta: uma sessão aberta esquecida
-- num aparelho não basta.
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
  if not exists (
    select 1
    from jsonb_array_elements(coalesce(auth.jwt() -> 'amr', '[]'::jsonb)) as metodo
    where metodo ->> 'method' in ('otp', 'magiclink')
      and (metodo ->> 'timestamp') ~ '^[0-9]+$'
      and (metodo ->> 'timestamp')::bigint >= extract(epoch from now())::bigint - 900
  ) then
    raise exception 'confirmar_por_email' using errcode = '42501';
  end if;
  delete from auth.users where id = v_user;
end;
$$;

revoke all on function public.excluir_conta() from public, anon, authenticated;
grant execute on function public.excluir_conta() to authenticated;
