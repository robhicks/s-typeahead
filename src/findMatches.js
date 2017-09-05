/*
 * findMatches
 * term: a string to be matched against
 * items: the list of items to filter by this search term
 * Checks whether each string in a list contains the search term.
 * "Contains" means that the search term must be at the beginning of the string
 * or at the beginning of a word in the string (so after a space)
 */
export default function findMatches(term, items = []) {
  if (term === "") return [];
  return items.sort().filter((item, i) => new RegExp('^' + term, 'i').test(item));
  // return items.sort().map((item, i) => item.match(new RegExp('\\b' + term, 'gi')));
}
