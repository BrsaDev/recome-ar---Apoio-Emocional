// Sistema unificado de moderação de termos ofensivos
// Recomeçar - Ambiente Seguro e Protegido

const OFFENSIVE_WORDS = [
  'merda', 'bosta', 'porra', 'caralho', 'puta', 'puto', 'fdp', 'pqp',
  'arrombado', 'arrombada', 'idiota', 'imbecil', 'babaca', 'otario', 'otaria',
  'corno', 'viado', 'baderneiro', 'baderneira', 'safado', 'safada',
  'desgraçado', 'desgraçada', 'maldito', 'maldita', 'vagabundo', 'vagabunda',
  'lixo', 'esgoto', 'retardado', 'retardada', 'abestado', 'abestada',
  'foder', 'fuder', 'foda-se', 'fodase', 'paspalho', 'corna', 'trouxa',
  'filho da puta', 'filho de puta', 'filha da puta', 'filha de puta'
];

// Substrings bem específicas que sempre indicam ofensa sem causar falsos positivos em palavras comuns
const OFFENSIVE_SUBSTRINGS = [
  'desgraca', // pega desgraçado, desgraçada, desgraçados, desgraçadas
  'filhodaputa', 'filhodeputa', 'filhadaputa', 'filhadeputa',
  'arrombado', 'arrombada',
  'baderneir',
  'imbecil',
  'babaca',
  'otario',
  'safad',
  'vagabund',
  'maldit'
];

/**
 * Verifica de forma robusta e preventiva por palavras ou frases ofensivas.
 * Adota normalização Unicode (remoção de acentos) para evitar burlas comuns.
 */
export function hasOffensiveContent(text: string): boolean {
  if (!text) return false;

  // 1. Normalizar o texto: minúsculas, remover acentuação e caracteres especiais
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos como ç -> c, á -> a
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"+\|\[\]]/g, " ") // Remove pontuações de pontuação com espaços
    .replace(/\s+/g, " ") // Comprime espaços duplos
    .trim();

  // 1.1 Texto condensado sem espaços para pegar burlas como "f i l h o d a p u t a" ou junções
  const condensed = normalized.replace(/\s/g, "");

  // 2. Verificar correspondência direta de substrings perigosas especificadas
  for (const sub of OFFENSIVE_SUBSTRINGS) {
    if (condensed.includes(sub) || normalized.includes(sub)) {
      return true;
    }
  }

  // 3. Dividir em palavras individuais para verificar correspondência exata do dicionário expandido
  const words = normalized.split(' ');
  for (const word of words) {
    // Oferecer suporte para plural simples nas palavras do dicionário (ex: idiotas, babacas)
    const singularWord = word.endsWith('s') && word.length > 3 ? word.slice(0, -1) : word;
    
    const isOffensive = OFFENSIVE_WORDS.some(offWord => {
      const offWordNorm = offWord.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return singularWord === offWordNorm || word === offWordNorm;
    });

    if (isOffensive) {
      return true;
    }
  }

  // 4. Verificar também as expressões compostas com/sem espaço
  for (const term of OFFENSIVE_WORDS) {
    if (term.includes(' ')) {
      const termNorm = term.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (normalized.includes(termNorm)) {
        return true;
      }
    }
  }

  return false;
}
