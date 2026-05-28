export interface Avatar {
  id: string;
  emoji: string;
  name: string;
  category: 'male' | 'female' | 'nature';
}

export const AVATARS: Avatar[] = [
  // Masculinos
  { id: 'm1', emoji: '🧑‍💻', name: 'Programador', category: 'male' },
  { id: 'm2', emoji: '🧔', name: 'Barbudo', category: 'male' },
  { id: 'm3', emoji: '🧑‍🚀', name: 'Astronauta', category: 'male' },
  { id: 'm4', emoji: '👨‍🎨', name: 'Artista', category: 'male' },
  { id: 'm5', emoji: '🧑‍💼', name: 'Executivo', category: 'male' },
  { id: 'm6', emoji: '👱‍♂️', name: 'Estiloso', category: 'male' },
  { id: 'm7', emoji: '🧑‍🌾', name: 'Cultivador', category: 'male' },
  { id: 'm8', emoji: '🧑‍🎤', name: 'Cantor', category: 'male' },

  // Femininos
  { id: 'f1', emoji: '👩‍💻', name: 'Programadora', category: 'female' },
  { id: 'f2', emoji: '👩‍🎨', name: 'Artista', category: 'female' },
  { id: 'f3', emoji: '👩‍🚀', name: 'Astronauta', category: 'female' },
  { id: 'f4', emoji: '👩‍💼', name: 'Executiva', category: 'female' },
  { id: 'f5', emoji: '👱‍♀️', name: 'Estilosa', category: 'female' },
  { id: 'f6', emoji: '👩‍⚕️', name: 'Cuidadora', category: 'female' },
  { id: 'f7', emoji: '👩‍🌾', name: 'Cultivadora', category: 'female' },
  { id: 'f8', emoji: '👩‍🎤', name: 'Cantora', category: 'female' },

  // Natureza / Neutros
  { id: 'n1', emoji: '🦊', name: 'Raposa', category: 'nature' },
  { id: 'n2', emoji: '🐼', name: 'Panda', category: 'nature' },
  { id: 'n3', emoji: '🐨', name: 'Coala', category: 'nature' },
  { id: 'n4', emoji: '🦁', name: 'Leão', category: 'nature' },
  { id: 'n5', emoji: '🦋', name: 'Borboleta', category: 'nature' },
  { id: 'n6', emoji: '🦉', name: 'Coruja', category: 'nature' },
  { id: 'n7', emoji: '🐢', name: 'Tartaruga', category: 'nature' },
  { id: 'n8', emoji: '☀️', name: 'Sol', category: 'nature' },
];

export const getAvatarByEmoji = (emoji: string): Avatar | undefined => {
  return AVATARS.find(a => a.emoji === emoji);
};

export const getAvatarById = (id: string): Avatar | undefined => {
  return AVATARS.find(a => a.id === id);
};
