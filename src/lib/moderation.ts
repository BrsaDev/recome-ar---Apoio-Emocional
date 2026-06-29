// Sistema unificado de moderação de termos ofensivos e detecção de crise
// FAPEM - Ambiente Seguro e Protegido

const OFFENSIVE_WORDS = [
  'merda', 'bosta', 'porra', 'caralho', 'puta', 'puto', 'fdp', 'pqp',
  'arrombado', 'arrombada', 'idiota', 'imbecil', 'babaca', 'otario', 'otaria',
  'corno', 'viado', 'baderneiro', 'baderneira', 'safado', 'safada',
  'desgraçado', 'desgraçada', 'maldito', 'maldita', 'vagabundo', 'vagabunda',
  'lixo', 'esgoto', 'retardado', 'retardada', 'abestado', 'abestada',
  'foder', 'fuder', 'foda-se', 'fodase', 'paspalho', 'corna', 'trouxa',
  'filho da puta', 'filho de puta', 'filha da puta', 'filha de puta'
];

const OFFENSIVE_SUBSTRINGS = [
  'desgraca', 'filhodaputa', 'filhodeputa', 'filhadaputa', 'filhadeputa',
  'arrombado', 'arrombada', 'baderneir', 'imbecil', 'babaca', 'otario', 'safad',
  'vagabund', 'maldit'
];

// Termos relacionados a crise, autoagressão ou suicídio
const CRISIS_TERMS = [
  'suicidio', 'suicidar', 'quero morrer', 'me matar', 'me ferir',
  'autoagressao', 'tirar minha vida', 'dar um fim', 'nao aguento mais',
  'acabar com tudo', 'planejando morte', 'vontade de morrer', 'cortar pulso',
  'pular de ponte', ' overdose ', 'me enforcar'
];

export type ModerationStatus = 'safe' | 'offensive' | 'crisis';

/**
 * Analisa o conteúdo e retorna o status de moderação.
 */
export function analyzeContent(text: string): ModerationStatus {
  if (!text) return 'safe';

  // 1. Normalizar o texto
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"+\|\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const condensed = normalized.replace(/\s/g, "");

  // 2. Verificar CRISE primeiro (Prioridade Máxima)
  for (const term of CRISIS_TERMS) {
    const termNorm = term.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalized.includes(termNorm) || condensed.includes(termNorm.replace(/\s/g, ""))) {
      return 'crisis';
    }
  }

  // 3. Verificar OFENSIVO (Substrings)
  for (const sub of OFFENSIVE_SUBSTRINGS) {
    if (condensed.includes(sub) || normalized.includes(sub)) {
      return 'offensive';
    }
  }

  // 4. Verificar OFENSIVO (Palavras exatas)
  const words = normalized.split(' ');
  for (const word of words) {
    const singularWord = word.endsWith('s') && word.length > 3 ? word.slice(0, -1) : word;

    const isOffensive = OFFENSIVE_WORDS.some(offWord => {
      const offWordNorm = offWord.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return singularWord === offWordNorm || word === offWordNorm;
    });

    if (isOffensive) return 'offensive';
  }

  // 5. Verificar expressões compostas de OFENSIVO
  for (const term of OFFENSIVE_WORDS) {
    if (term.includes(' ')) {
      const termNorm = term.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (normalized.includes(termNorm)) {
        return 'offensive';
      }
    }
  }

  return 'safe';
}

/**
 * Helper para compatibilidade mantendo a assinatura antiga se necessário
 */
export function hasOffensiveContent(text: string): boolean {
  const result = analyzeContent(text);
  return result === 'offensive' || result === 'crisis';
}
