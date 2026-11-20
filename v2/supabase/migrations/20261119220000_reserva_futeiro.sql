-- D120: o jogo passa a se chamar Futeiro. O @ "futeiro" fica reservado, como
-- "futeiros", para ninguém se passar pelo jogo no ranking.
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
    ]);
$$;
