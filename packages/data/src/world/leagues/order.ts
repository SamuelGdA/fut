/**
 * The historical order of the league list, preserved exactly.
 *
 * This looks like an arbitrary list and is load-bearing. The lookup index is
 * built by walking the leagues in order, and the flat team list inherits that
 * insertion order; the transfer market then buckets that list by reputation
 * and picks from it. Reordering the leagues therefore reorders the offer pool
 * and silently changes which clubs come calling in every career ever played.
 *
 * Splitting the single leagues file into one per country would have done
 * exactly that, because the original file interleaves countries: Germany
 * appears at positions 2 and 5, England at 6 and 12, Argentina at 9 and 31.
 * So the split keeps the data readable and this keeps the behaviour.
 *
 * `integrity.test.ts` asserts this list and the league files are in exact
 * correspondence, so a league added to one and forgotten in the other fails
 * the build rather than quietly moving to the end.
 */
export const LEAGUE_ORDER: readonly string[] = [
  "liga-mx",
  "2-bundesliga",
  "brasileirao",
  "brasileirao-serie-b",
  "bundesliga",
  "championship",
  "laliga",
  "laliga-2",
  "liga-profesional",
  "ligue-1",
  "ligue-2",
  "premier-league",
  "serie-a",
  "serie-b",
  "copa-de-primera",
  "division-intermedia",
  "liga-bolivia",
  "copa-simon-bolivar",
  "liga-de-primera",
  "primera-b",
  "liga-dimayor",
  "torneo-dimayor",
  "liga-futve",
  "liga-futve-2",
  "liga-uruguaya",
  "segunda-division-uruguaya",
  "liga1",
  "liga2",
  "ligapro-serie-a",
  "ligapro-serie-b",
  "primera-nacional",
  "usa-mls",
];
