/** Dígitos de sete segmentos construídos com pontos, sem fonte ou imagem externa. */
const DIGITS = ["abcdef", "bc", "abged", "abgcd", "fgbc", "afgcd", "afgecd", "abc", "abcdefg", "abfgcd"];
const SEGMENTS: Record<string, readonly [number, number, number, number]> = { a: [10, 5, 26, 5], b: [31, 10, 31, 26], c: [31, 36, 31, 52], d: [10, 57, 26, 57], e: [5, 36, 5, 52], f: [5, 10, 5, 26], g: [10, 31, 26, 31] };
function Digit({ value, x }: { value: string; x: number }) {
  const lit = DIGITS[Number(value)] ?? "";
  return <g transform={`translate(${x} 0)`}>{Object.entries(SEGMENTS).flatMap(([name, [x1, y1, x2, y2]]) => Array.from({ length: 5 }, (_, dot) => <circle key={`${name}-${dot}`} cx={x1 + (x2 - x1) * dot / 4} cy={y1 + (y2 - y1) * dot / 4} r="1.75" data-lit={lit.includes(name) || undefined} />))}</g>;
}
export function LedScore({ score, previous }: { score: readonly [number, number]; previous?: readonly [number, number] }) {
  const left = String(score[0]); const right = String(score[1]);
  const split = left.length * 42 + 10;
  const width = split + right.length * 42 + 8;
  const changed = previous && previous.some((value, index) => value !== score[index]);
  const draw = (values: readonly [number, number], old = false) => {
    const numbers = values.map(String);
    return <g className={changed ? old ? "led-digits-old" : "led-digits-new" : undefined} key={old ? "previous" : changed ? `${left}:${right}` : "current"}>{numbers.map((number, side) => <g key={side} className="led-team-digits" data-changed={changed && previous[side] !== score[side] || undefined}>{[...number].map((digit, index) => <Digit key={index} value={digit} x={side === 0 ? index * 42 : split + 5 + index * 42} />)}</g>)}</g>;
  };
  return <span className="led-score" role="img" aria-label={`${left} : ${right}`}><svg viewBox={`0 0 ${width} 64`} aria-hidden="true">{changed ? draw(previous, true) : null}{draw(score)}<g className="led-colon"><circle cx={split - 5} cy="24" r="2" data-lit /><circle cx={split - 5} cy="40" r="2" data-lit /></g></svg><span className="sr-only">{left} : {right}</span></span>;
}
