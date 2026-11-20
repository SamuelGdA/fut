import type { Widen } from "../types";

/**
 * Dicionário das telas de conta (login, @, perfil) e das páginas legais
 * (Termos e Privacidade), em português, a fonte (D112 e D113). Fica fora do
 * dicionário principal: só essas telas o carregam. Mesmas regras editoriais
 * (GDD 35): nenhum travessão, frase curta, sem juridiquês.
 */
export const contaPt = {
  login: {
    eyebrow: "Sua conta no Futeiro",
    title: "Entre em campo",
    lead: "Guarde suas conquistas, entre no ranking mundial do Desafio do dia e leve seus números para qualquer aparelho.",
    perks: {
      trophies: "Troféus com a quantidade de cada um",
      ranking: "Seu @ no ranking do Desafio",
      stats: "Gols, títulos e Bolas de Ouro somados",
    },
    google: "Continuar com Google",
    or: "ou com e-mail",
    tabs: { signIn: "Entrar", signUp: "Criar conta" },
    email: "E-mail",
    password: "Senha",
    passwordNew: "Senha nova",
    passwordHint: "Pelo menos 8 caracteres, com letras e números.",
    showPassword: "Mostrar senha",
    hidePassword: "Esconder senha",
    username: "Seu @",
    usernameHint: "De 3 a 20 caracteres: letras minúsculas, números e _.",
    submitSignIn: "Entrar",
    submitSignUp: "Criar conta",
    forgot: "Esqueci a senha",
    guest: "Jogar como visitante",
    agree: "Ao continuar, você concorda com os {terms} e com a {privacy}.",
    sameAccount: "Mesmo e-mail no Google e na senha? É a mesma conta: entre pelo caminho que preferir.",
    checking: "Abrindo sua conta",
    confirm: {
      eyebrow: "Quase lá",
      title: "Confira seu e-mail",
      body: "Se {email} ainda não tem conta, o link de confirmação chega em instantes. Abra o link e depois entre por aqui.",
      spam: "Não chegou? Veja a caixa de spam ou peça de novo.",
      resend: "Reenviar e-mail",
      resent: "Pedido enviado. Confira a caixa de entrada.",
      back: "Voltar para entrar",
    },
    reset: {
      title: "Recuperar a senha",
      lead: "Diga o e-mail da conta e mandamos um link para criar uma senha nova.",
      submit: "Enviar link",
      sent: "Se existir conta com esse e-mail, o link chega em instantes.",
      back: "Voltar para entrar",
    },
    recovery: {
      eyebrow: "Recuperação",
      title: "Crie a senha nova",
      lead: "Ela vale a partir de agora em todos os aparelhos.",
      submit: "Salvar senha",
      done: "Senha nova salva.",
    },
    onboarding: {
      eyebrow: "Último passo",
      title: "Escolha seu @",
      lead: "É o seu nome no ranking do Desafio e no perfil. Dá para trocar depois.",
      submit: "Começar a jogar",
      checking: "Conferindo",
      free: "@{name} está livre",
      taken: "@{name} já tem dono",
      signOut: "Entrar com outra conta",
    },
    notices: {
      confirmedElsewhere: "E-mail confirmado. Entre com seu e-mail e senha para continuar.",
      linkExpired: "Esse link venceu ou já foi usado. Peça outro por aqui.",
      oauthError: "O Google não completou o login. Tente de novo.",
      signedOut: "Você saiu da conta.",
      deleted: "Conta apagada.",
      imported: "Conquistas deste aparelho entraram na sua conta.",
    },
    errors: {
      invalid: "E-mail ou senha não conferem.",
      unconfirmed: "Confirme o e-mail antes de entrar. O link está na sua caixa de entrada.",
      weakPassword: "A senha precisa de pelo menos 8 caracteres, com letras e números.",
      samePassword: "A senha nova precisa ser diferente da atual.",
      rateLimit: "Muitas tentativas seguidas. Espere um minuto e tente de novo.",
      disabled: "Esse jeito de entrar está desligado no momento.",
      exists: "Esse e-mail já tem conta. Entre com a senha ou com o Google.",
      network: "Sem conexão com o servidor. Confira a internet e tente de novo.",
      unknown: "Algo deu errado do nosso lado. Tente de novo em instantes.",
      email: "Escreva um e-mail válido.",
      username: "Use de 3 a 20 caracteres: letras minúsculas, números e _.",
      reserved: "Esse @ é reservado. Escolha outro.",
      taken: "Esse @ já tem dono. Escolha outro.",
      recent: "Você trocou o @ há menos de 30 dias. A próxima troca fica liberada em {date}.",
    },
    off: {
      title: "Contas desligadas",
      body: "Esta versão do jogo roda sem servidor de contas: tudo fica neste aparelho.",
    },
  },

  profile: {
    eyebrow: "Perfil",
    memberSince: "No Futeiro desde {date}",
    providers: { google: "Google", email: "e-mail e senha" },
    loading: "Abrindo o perfil",
    loadError: "Não deu para carregar o perfil agora.",
    retry: "Tentar de novo",
    sections: { craque: "Craque", challenge: "Desafio do dia", tecnico: "Técnico" },
    stats: {
      careers: "Carreiras",
      seasons: "Temporadas",
      games: "Jogos",
      goals: "Gols",
      assists: "Assistências",
      cleanSheets: "Sem sofrer gol",
      titles: "Títulos",
      awards: "Prêmios",
      ballons: "Bolas de Ouro",
      peak: "Melhor OVR",
      challenges: "Ranqueadas",
      bestChallenge: "Melhor nota",
      today: "Nota de hoje",
      streakNow: "Sequência atual",
      streakBest: "Maior sequência",
      coachCareers: "Carreiras",
      coachSeasons: "Temporadas",
      coachTitles: "Títulos",
    },
    showcase: "Vitrine",
    showcaseCount: "{count} de {total} conquistas",
    showcaseEmpty: "Os troféus aparecem aqui assim que caírem numa carreira.",
    allAchievements: "Ver todas as conquistas",
    play: "Jogar agora",
    account: "Conta",
    editUsername: "Trocar o @",
    usernameNext: "Próxima troca do @ em {date}.",
    save: "Salvar",
    cancel: "Cancelar",
    saved: "@ trocado.",
    signOut: "Sair da conta",
    delete: "Apagar a conta",
    deleteTitle: "Apagar a conta?",
    deleteBody: "Somem do servidor o seu @, os números, os troféus e as carreiras enviadas. Não dá para desfazer. O que está só neste aparelho continua aqui.",
    deleteConfirm: "Apagar para sempre",
    deleteKeep: "Manter a conta",
    deleteError: "Não deu para apagar agora. Confira a internet e tente de novo.",
    privacyLink: "Como cuidamos dos seus dados",
  },

  legalPage: {
    updated: "Atualizado em {date}",
    back: "Voltar",
    contents: "Nesta página",
    contact: "Fale com a gente: {email}",
    contactMissing: "Para pedidos sobre os seus dados, use o botão Apagar a conta no perfil ou o canal de contato informado no site.",
    otherDoc: "Leia também: {name}",
  },

  terms: {
    eyebrow: "Futeiro",
    title: "Termos de Serviço",
    lead: "As regras para usar o Futeiro, em linguagem direta. Usar o jogo é aceitar estes termos.",
    sections: {
      what: {
        title: "O que é o Futeiro",
        body: "O Futeiro é um jogo de futebol gratuito, jogado no navegador, com dois modos: Craque (carreira de jogador) e Técnico (carreira de treinador). É um projeto independente, sem fins comerciais diretos. Os anúncios, quando houver, só ajudam a pagar o servidor.",
      },
      brands: {
        title: "Nomes, escudos e marcas",
        body: "Todos os nomes, escudos e marcas de clubes presentes neste simulador são de propriedade de seus respectivos titulares e utilizados unicamente para fins de identificação, imersão e realismo. Este projeto é independente e não possui caráter comercial, vínculo, patrocínio ou endosso oficial por parte das entidades esportivas retratadas.\n\nSe você representa uma dessas entidades e quer que algo seja retirado, fale com a gente pelo contato abaixo e atendemos o pedido.",
      },
      account: {
        title: "Sua conta",
        body: "A conta é opcional: dá para jogar tudo como visitante. Com conta, você escolhe um @ que aparece no ranking do Desafio do dia. Não use @ ofensivo, que imite outra pessoa ou que tenha dados pessoais; um @ assim pode ser trocado ou a conta pode ser suspensa.\n\nVocê cuida da sua senha. Uma conta por pessoa.",
      },
      fair: {
        title: "Jogo limpo",
        body: "É proibido mexer nos envios para o servidor, inventar resultados, automatizar partidas ou tentar entrar na conta de outra pessoa. O servidor confere cada número e recusa o que é impossível. Resultados de trapaça podem ser apagados do ranking, e a conta pode ser suspensa.",
      },
      ads: {
        title: "Anúncios e medição",
        body: "O site pode mostrar anúncios do Google AdSense e medir o uso com o Google Analytics, sempre conforme a sua escolha no aviso de cookies. Os detalhes estão na Política de Privacidade.",
      },
      availability: {
        title: "Sem garantia de funcionamento",
        body: "O jogo é oferecido do jeito que está. Pode sair do ar, mudar regras, equilibrar números ou apagar o ranking de um dia com problema. Faremos o possível para avisar mudanças grandes, mas não há garantia de disponibilidade nem de que conquistas antigas continuem iguais.",
      },
      end: {
        title: "Saída",
        body: "Você pode apagar a conta quando quiser, pelo perfil. Podemos encerrar contas que descumpram estes termos.",
      },
      changes: {
        title: "Mudanças nestes termos",
        body: "Quando estes termos mudarem, a data no topo muda junto. Continuar jogando depois disso é aceitar a versão nova.",
      },
    },
  },

  privacy: {
    eyebrow: "Futeiro",
    title: "Política de Privacidade",
    lead: "O mínimo de dados, só para o jogo funcionar, explicado sem juridiquês. Vale a LGPD (Lei 13.709/2018) e, para quem joga da Europa, o GDPR.",
    sections: {
      summary: {
        title: "Em uma frase",
        body: "Sem conta, nada seu sai deste aparelho, a não ser o que você permitir no aviso de cookies. Com conta, guardamos seu e-mail, seu @ e os números do jogo. Não vendemos dados.",
      },
      collected: {
        title: "O que guardamos",
        body: "Conta: e-mail, @, data de criação e o jeito de entrar (Google ou senha). A senha é guardada cifrada pelo Supabase; nunca a vemos.\n\nJogo: totais das carreiras (jogos, gols, assistências, títulos, prêmios, melhor OVR), as conquistas com a quantidade de cada uma, a nota do Desafio do dia e um código de cada carreira enviada, para ela não contar duas vezes.\n\nCom o Google: nome e foto que o Google envia ficam só no registro do login; o jogo não os mostra nem os usa.",
      },
      notCollected: {
        title: "O que não guardamos",
        body: "Nome real, telefone, endereço, documentos, localização, contatos ou dados de pagamento. O sobrenome e a aparência do seu jogador ficam só no aparelho.",
      },
      why: {
        title: "Para que usamos",
        body: "Para manter sua conta, mostrar seu perfil e seus troféus, montar o ranking do Desafio (só com @ e nota) e impedir trapaça. O e-mail serve para entrar, confirmar a conta e recuperar a senha. Não mandamos propaganda por e-mail.",
      },
      device: {
        title: "O que fica no seu aparelho",
        body: "O jogo usa o armazenamento do navegador (localStorage e IndexedDB) para preferências, rascunho do jogador, conquistas do aparelho, a sessão da conta e a sua escolha sobre cookies. Isso é essencial para o jogo funcionar e não exige consentimento.",
      },
      analytics: {
        title: "Google Analytics",
        body: "Só com a sua permissão (Aceitar todos), o Google Analytics mede como o jogo é usado: telas abertas, tempo de uso, tipo de aparelho e país aproximado. Ele grava cookies próprios (como _ga) e os dados vão para o Google. Não mandamos e-mail, @ nem o seu identificador da conta para o Analytics. Com Somente essenciais, ele nem é carregado.",
      },
      ads: {
        title: "Google AdSense",
        body: "Só com a sua permissão (Aceitar todos), o site mostra anúncios do Google AdSense. O Google e parceiros podem usar cookies para escolher anúncios pelo que você visitou neste e em outros sites (anúncios personalizados). Você controla isso também em adssettings.google.com. Com Somente essenciais, nenhum anúncio é carregado.",
      },
      partners: {
        title: "Quem processa os dados",
        body: "Supabase: banco de dados e login (os servidores podem ficar fora do Brasil). Google: login com Google, Analytics e AdSense. A tela de entrar carrega o botão de login do Google, que pode mostrar a conta Google do seu navegador; nada é enviado ao Futeiro até você escolher uma. Analytics e AdSense só quando você permite. A hospedagem do site recebe o registro técnico de acesso (endereço IP, data e página), como qualquer site.",
      },
      rights: {
        title: "Seus direitos",
        body: "Você pode ver seus dados no perfil, trocar o @ e apagar a conta a qualquer momento, pelo botão Apagar a conta. Apagar remove do servidor o e-mail, o @, os números, os troféus e as carreiras enviadas, na hora. Para outros pedidos (cópia dos dados, correção, dúvidas), use o contato abaixo.",
      },
      cookies: {
        title: "Mudar a escolha de cookies",
        body: "Abra os Ajustes (a engrenagem no topo) e toque em Preferências de cookies. A escolha nova vale na hora.",
      },
      kids: {
        title: "Crianças",
        body: "O jogo pode ser jogado por qualquer idade como visitante. Para criar conta, quem tem menos de 13 anos precisa da autorização de um responsável.",
      },
      retention: {
        title: "Por quanto tempo",
        body: "Enquanto a conta existir. Apagou, saiu. Registros técnicos da hospedagem e do Supabase seguem os prazos deles, normalmente de poucos dias.",
      },
    },
  },
} as const;

export type ContaMessages = Widen<typeof contaPt>;
