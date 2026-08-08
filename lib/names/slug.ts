// Adresy jmen a kategorií.
//
// Slug musí být stabilní: jakmile jednou vyjde ven, nesmí se měnit, jinak
// přijdeme o odkazy. Proto ho počítáme z jediného pravidla a datový
// validátor hlídá, aby nedošlo ke kolizi.

/** „Eliška" → „eliska". Diakritiku shazujeme, zbytek přepisujeme na pomlčky. */
export function slugJmena(jmeno: string): string {
  return jmeno
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Hledaný tvar pro vyhledávání: bez diakritiky, malá písmena.
 * Díky tomu najde „eliska" i „Eliška".
 */
export function bezDiakritiky(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}
