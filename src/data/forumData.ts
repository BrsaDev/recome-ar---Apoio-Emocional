import { ForumTopic } from '../types';

export const INITIAL_FORUM_TOPICS: ForumTopic[] = [
  {
    id: '1',
    title: 'Como lidar com crises de ansiedade repentinas?',
    category: 'Ansiedade',
    authorName: 'Ana Clara',
    authorAvatarId: 'f1', // Programadora/Feminino
    lastUpdate: Date.now() - 1000 * 60 * 30,
    repliesCount: 2,
    viewsCount: 156,
    posts: [
      {
        id: 'p1_1',
        authorName: 'Ana Clara',
        authorAvatarId: 'f1',
        content: 'Ontem tive uma crise no meio do mercado e fiquei muito assustada. Alguém tem dicas de como se acalmar nessas horas? O que vocês fazem quando sentem que vão perder o controle?',
        timestamp: Date.now() - 1000 * 60 * 60,
        likes: 5,
        reactions: { like: 2, support: 3 }
      },
      {
        id: 'p1_2',
        authorName: 'Dr. Ricardo',
        authorAvatarId: 'm5', // Executivo / Médico
        content: 'Olá Ana! Sinto muito que tenha passado por isso. Uma técnica excelente é o **5-4-3-2-1**: identifique 5 coisas que vê, 4 que pode tocar, 3 que ouve, 2 que sente o cheiro e 1 que pode sentir o gosto. Isso ajuda o cérebro a voltar para o presente.',
        timestamp: Date.now() - 1000 * 60 * 30,
        likes: 12,
        reactions: { like: 7, heart: 4, smile: 1 }
      },
      {
        id: 'p1_3',
        authorName: 'Maria Helena',
        authorAvatarId: 'f6', // Cuidadora
        content: 'Pra mim o que ajuda muito é levar sempre uma garrafinha de água gelada. O choque térmico me ajuda a "acordar" da crise.',
        timestamp: Date.now() - 1000 * 60 * 10,
        likes: 3,
        reactions: { like: 2, support: 1 }
      }
    ]
  },
  {
    id: '2',
    title: 'Dicas de livros que ajudam no autoconhecimento',
    category: 'Recomeço',
    authorName: 'Pedro Silva',
    authorAvatarId: 'm2', // Barbudo
    lastUpdate: Date.now() - 1000 * 60 * 60 * 2,
    repliesCount: 2,
    viewsCount: 89,
    posts: [
      {
        id: 'p2_1',
        authorName: 'Pedro Silva',
        authorAvatarId: 'm2',
        content: 'Estou querendo ler algo que me ajude a passar por esse momento de recomeço e mudança na minha vida. Quais livros foram um divisor de águas para vocês?',
        timestamp: Date.now() - 1000 * 60 * 60 * 4,
        likes: 8
      },
      {
        id: 'p2_2',
        authorName: 'Gabriel Costa',
        authorAvatarId: 'm3', // Astronauta
        content: 'Recomendo muito *"Em Busca de Sentido"* do Viktor Frankl, ajuda demais a encontrar propósito em tempos de sofrimento e transição.',
        timestamp: Date.now() - 1000 * 60 * 60 * 3,
        likes: 6
      },
      {
        id: 'p2_3',
        authorName: 'Estilosa',
        authorAvatarId: 'f5', // Estilosa
        content: 'Para mim, *"Mulheres que Correm com os Lobos"* foi incrível. Tem muitos ensinamentos sobre nossa verdadeira essência.',
        timestamp: Date.now() - 1000 * 60 * 60 * 2,
        likes: 4
      }
    ]
  },
  {
    id: '3',
    title: 'Me sinto muito sozinho no final de semana, o que fazer?',
    category: 'Solidão',
    authorName: 'Mariana Santos',
    authorAvatarId: 'f5', // Estilosa
    lastUpdate: Date.now() - 1000 * 60 * 60 * 5,
    repliesCount: 2,
    viewsCount: 312,
    posts: [
      {
        id: 'p3_1',
        authorName: 'Mariana Santos',
        authorAvatarId: 'f5',
        content: 'Durante a semana o trabalho me mantém ocupada, mas nos sábados e domingos o silêncio e o vazio batem forte. Como vocês lidam com a solidão nos dias de descanso?',
        timestamp: Date.now() - 1000 * 60 * 60 * 10,
        likes: 15
      },
      {
        id: 'p3_2',
        authorName: 'Lucas Oliveira',
        authorAvatarId: 'm1', // Programador
        content: 'Eu comecei a me forçar a sair para caminhar em parques e praças, mesmo sozinho. Ver pessoas e sentir a luz do sol ajuda muito a diminuir o peso.',
        timestamp: Date.now() - 1000 * 60 * 60 * 8,
        likes: 9
      },
      {
        id: 'p3_3',
        authorName: 'Coala',
        authorAvatarId: 'n3', // Coala
        content: 'Fazer trabalho voluntário me ajudou de forma absurda! O sentimento de ser útil e conversar com outras pessoas renova as energias.',
        timestamp: Date.now() - 1000 * 60 * 60 * 6,
        likes: 11
      }
    ]
  },
  {
    id: '4',
    title: 'Exercícios de respiração que realmente funcionam',
    category: 'Ansiedade',
    authorName: 'Carlos Lima',
    authorAvatarId: 'm4', // Artista
    lastUpdate: Date.now() - 1000 * 60 * 60 * 24,
    repliesCount: 1,
    viewsCount: 45,
    posts: [
      {
        id: 'p4_1',
        authorName: 'Carlos Lima',
        authorAvatarId: 'm4',
        content: 'Sempre ouço falar em "respirar fundo", mas às vezes sinto que fico mais hiperventilado do que calmo. Qual técnica específica vocês usam que realmente traz alívio rápido?',
        timestamp: Date.now() - 1000 * 60 * 60 * 30,
        likes: 4
      },
      {
        id: 'p4_2',
        authorName: 'Programadora',
        authorAvatarId: 'f1', // Programadora
        content: 'A técnica da **respiração quadrada (4-4-4-4)**: expire todo o ar, inspire por 4s, segure por 4s, expire por 4s, mantenha sem ar por 4s. Repita 4 vezes. É pura fisiologia!',
        timestamp: Date.now() - 1000 * 60 * 60 * 28,
        likes: 7
      }
    ]
  }
];
